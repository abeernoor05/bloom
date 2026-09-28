import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { describePreviousValue, type CoachingSuggestion } from './coaching';
import { calculateHabitMetrics, toLocalDateKey, upsertCompletion } from './habitMetrics';
import { createInitialBloomData } from './sampleData';
import { HABIT_FREQUENCIES } from './types';
import type {
  BloomData,
  CoachingAdjustment,
  Habit,
  HabitFrequency,
  HabitInput,
  HabitScheduleType,
  OnboardingResult,
  ReflectionInput,
  Weekday,
} from './types';

const STORAGE_KEY = '@bloom/data/v1';

type HydrationStatus = 'idle' | 'loading' | 'ready';

interface BloomStore extends BloomData {
  hydrationStatus: HydrationStatus;
  hydrate: () => Promise<void>;
  finishOnboarding: (result: OnboardingResult) => void;
  setHabitCompletion: (habitId: string, date: string, completed: boolean) => void;
  toggleHabitForToday: (habitId: string) => void;
  addHabit: (input: HabitInput) => string;
  updateHabit: (habitId: string, input: HabitInput) => void;
  setHabitArchived: (habitId: string, archived: boolean) => void;
  deleteHabit: (habitId: string) => void;
  addReflection: (input: ReflectionInput) => string;
  acceptCoachingSuggestion: (suggestion: CoachingSuggestion) => string | undefined;
  rejectCoachingSuggestion: (suggestionId: string) => void;
}

function persist(data: BloomData) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function selectData(state: BloomStore): BloomData {
  return {
    schemaVersion: state.schemaVersion,
    onboardingCompleted: state.onboardingCompleted,
    goal: state.goal,
    habits: state.habits,
    reflections: state.reflections,
    adjustments: state.adjustments,
    coachingDecisions: state.coachingDecisions,
  };
}

interface StoredBloomData {
  schemaVersion: number;
  onboardingCompleted: boolean;
  goal: BloomData['goal'];
  habits: Habit[];
  reflections?: BloomData['reflections'];
  adjustments?: BloomData['adjustments'];
  coachingDecisions?: BloomData['coachingDecisions'];
}

function isStoredBloomData(value: unknown): value is StoredBloomData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'schemaVersion' in value &&
    (value.schemaVersion === 1 || value.schemaVersion === 2) &&
    'onboardingCompleted' in value &&
    typeof value.onboardingCompleted === 'boolean' &&
    'goal' in value &&
    'habits' in value &&
    Array.isArray(value.habits)
  );
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizedFrequency(frequency: Partial<HabitFrequency> | undefined): HabitFrequency {
  const id = frequency?.id ?? 'daily';
  const daysPerWeek = Math.max(
    1,
    Math.min(
      7,
      frequency?.daysPerWeek ??
        HABIT_FREQUENCIES.find((candidate) => candidate.id === id)?.daysPerWeek ??
        7,
    ),
  );
  const weekdays = Array.isArray(frequency?.scheduledWeekdays)
    ? [...new Set(frequency.scheduledWeekdays)].filter(
        (day): day is Weekday => Number.isInteger(day) && day >= 0 && day <= 6,
      )
    : undefined;
  const scheduleType: HabitScheduleType =
    frequency?.scheduleType ??
    (id === 'daily' ? 'daily' : weekdays?.length ? 'specific-days' : 'weekly-target');

  return {
    id,
    scheduleType,
    daysPerWeek: scheduleType === 'daily' ? 7 : daysPerWeek,
    scheduledWeekdays: scheduleType === 'specific-days' ? weekdays : undefined,
  };
}

function withCalculatedStreak(habit: Habit): Habit {
  const metrics = calculateHabitMetrics(habit);
  return {
    ...habit,
    streak: {
      current: metrics.current,
      best: metrics.best,
      lastCompletedDate: metrics.lastCompletedDate,
    },
  };
}

function normalizeHabit(habit: Habit): Habit {
  const normalized: Habit = {
    ...habit,
    frequency: normalizedFrequency(habit.frequency),
    reminder: {
      enabled: habit.reminder?.enabled ?? true,
      time: habit.reminder?.time || '8:00 AM',
      timezone: habit.reminder?.timezone,
    },
    completions: (habit.completions ?? []).map((completion) => ({
      ...completion,
      habitId: completion.habitId ?? habit.id,
    })),
    streak: habit.streak ?? { current: 0, best: 0 },
  };
  return withCalculatedStreak(normalized);
}

function applyCoachingAdjustment(habit: Habit, adjustment: CoachingAdjustment): Habit {
  const updatedAt = new Date().toISOString();
  if (adjustment.kind === 'target') {
    return withCalculatedStreak({ ...habit, target: adjustment.target, updatedAt });
  }
  if (adjustment.kind === 'reminder') {
    return withCalculatedStreak({ ...habit, reminder: adjustment.reminder, updatedAt });
  }
  return withCalculatedStreak({ ...habit, frequency: adjustment.frequency, updatedAt });
}

function frequencyFromInput(input: HabitInput): HabitFrequency {
  return normalizedFrequency({
    id: input.frequencyId,
    scheduleType: input.scheduleType,
    daysPerWeek: input.daysPerWeek,
    scheduledWeekdays: input.scheduledWeekdays,
  });
}

export const useBloomStore = create<BloomStore>((set, get) => ({
  ...createInitialBloomData(),
  hydrationStatus: 'idle',

  hydrate: async () => {
    if (get().hydrationStatus !== 'idle') return;
    set({ hydrationStatus: 'loading' });

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: unknown = JSON.parse(stored);
        if (isStoredBloomData(data)) {
          const normalized: BloomData = {
            schemaVersion: 2,
            onboardingCompleted: data.onboardingCompleted,
            goal: data.goal,
            habits: data.habits.map(normalizeHabit),
            reflections: Array.isArray(data.reflections) ? data.reflections : [],
            adjustments: Array.isArray(data.adjustments) ? data.adjustments : [],
            coachingDecisions: Array.isArray(data.coachingDecisions) ? data.coachingDecisions : [],
          };
          set({ ...normalized, hydrationStatus: 'ready' });
          persist(normalized);
          return;
        }
      }
    } catch (error) {
      console.error('Could not load Bloom data', error);
    }

    set({ habits: get().habits.map(normalizeHabit), hydrationStatus: 'ready' });
  },

  finishOnboarding: (result) => {
    const frequency = HABIT_FREQUENCIES.find((item) => item.id === result.frequencyId);
    const goalId = nextId('goal');
    const habits = get().habits.map((habit) =>
      withCalculatedStreak({
        ...habit,
        goalId,
        frequency: normalizedFrequency({
          id: result.frequencyId,
          scheduleType: result.frequencyId === 'daily' ? 'daily' : 'weekly-target',
          daysPerWeek: frequency?.daysPerWeek ?? 7,
        }),
      }),
    );

    set({
      onboardingCompleted: true,
      goal: {
        id: goalId,
        category: result.category,
        title: result.goalTitle.trim(),
        createdAt: new Date().toISOString(),
        status: 'active',
      },
      habits,
    });
    persist(selectData(get()));
  },

  setHabitCompletion: (habitId, date, completed) => {
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id !== habitId) return habit;
        const updated = {
          ...habit,
          completions: upsertCompletion(habit.completions, habit.id, date, completed),
          updatedAt: new Date().toISOString(),
        };
        return withCalculatedStreak(updated);
      }),
    }));
    persist(selectData(get()));
  },

  toggleHabitForToday: (habitId) => {
    const habit = get().habits.find((candidate) => candidate.id === habitId);
    if (!habit) return;
    const today = toLocalDateKey();
    const completed = habit.completions.some(
      (completion) => completion.date === today && completion.status === 'completed',
    );
    get().setHabitCompletion(habitId, today, !completed);
  },

  addHabit: (input) => {
    const id = nextId('habit');
    const now = new Date().toISOString();
    const habit = withCalculatedStreak({
      id,
      goalId: get().goal?.id,
      name: input.name.trim(),
      icon: input.icon,
      description: input.description?.trim() || undefined,
      target: input.target,
      frequency: frequencyFromInput(input),
      reminder: { enabled: input.reminderEnabled, time: input.reminderTime.trim() },
      completions: [],
      streak: { current: 0, best: 0 },
      createdAt: now,
      updatedAt: now,
    });

    set((state) => ({ habits: [...state.habits, habit] }));
    persist(selectData(get()));
    return id;
  },

  updateHabit: (habitId, input) => {
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id !== habitId) return habit;
        return withCalculatedStreak({
          ...habit,
          name: input.name.trim(),
          icon: input.icon,
          description: input.description?.trim() || undefined,
          target: input.target,
          frequency: frequencyFromInput(input),
          reminder: { enabled: input.reminderEnabled, time: input.reminderTime.trim() },
          updatedAt: new Date().toISOString(),
        });
      }),
    }));
    persist(selectData(get()));
  },

  setHabitArchived: (habitId, archived) => {
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === habitId
          ? withCalculatedStreak({
              ...habit,
              archivedAt: archived ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            })
          : habit,
      ),
    }));
    persist(selectData(get()));
  },

  deleteHabit: (habitId) => {
    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== habitId),
      reflections: state.reflections.filter((reflection) => reflection.habitId !== habitId),
      adjustments: state.adjustments.filter((adjustment) => adjustment.habitId !== habitId),
    }));
    persist(selectData(get()));
  },

  addReflection: (input) => {
    const id = nextId('reflection');
    const reflection = {
      id,
      habitId: input.habitId,
      date: input.date,
      reason: input.reason,
      note: input.note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      reflections: [
        reflection,
        ...state.reflections.filter(
          (candidate) => !(candidate.habitId === input.habitId && candidate.date === input.date),
        ),
      ],
    }));
    persist(selectData(get()));
    return id;
  },

  acceptCoachingSuggestion: (suggestion) => {
    const habit = get().habits.find((candidate) => candidate.id === suggestion.habitId);
    if (!habit) return undefined;
    const now = new Date().toISOString();
    const previousValue = describePreviousValue(habit, suggestion.adjustment);
    set((state) => ({
      habits: state.habits.map((candidate) =>
        candidate.id === habit.id
          ? applyCoachingAdjustment(candidate, suggestion.adjustment)
          : candidate,
      ),
      adjustments: [
        {
          id: nextId('adjustment'),
          habitId: habit.id,
          suggestionId: suggestion.id,
          date: toLocalDateKey(),
          adjustment: suggestion.adjustment,
          previousValue,
          createdAt: now,
        },
        ...state.adjustments,
      ],
      coachingDecisions: [
        { suggestionId: suggestion.id, status: 'accepted', resolvedAt: now },
        ...state.coachingDecisions.filter((decision) => decision.suggestionId !== suggestion.id),
      ],
    }));
    persist(selectData(get()));
    return suggestion.confirmation;
  },

  rejectCoachingSuggestion: (suggestionId) => {
    const now = new Date().toISOString();
    set((state) => ({
      coachingDecisions: [
        { suggestionId, status: 'rejected', resolvedAt: now },
        ...state.coachingDecisions.filter((decision) => decision.suggestionId !== suggestionId),
      ],
    }));
    persist(selectData(get()));
  },
}));
