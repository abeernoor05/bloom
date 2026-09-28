import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { createInitialBloomData, toLocalDateKey } from './sampleData';
import { HABIT_FREQUENCIES } from './types';
import type { BloomData, Habit, NewHabitInput, OnboardingResult } from './types';

const STORAGE_KEY = '@bloom/data/v1';

type HydrationStatus = 'idle' | 'loading' | 'ready';

interface BloomStore extends BloomData {
  hydrationStatus: HydrationStatus;
  hydrate: () => Promise<void>;
  finishOnboarding: (result: OnboardingResult) => void;
  toggleHabitForToday: (habitId: string) => void;
  addHabit: (input: NewHabitInput) => void;
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
  };
}

function isBloomData(value: unknown): value is BloomData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'schemaVersion' in value &&
    value.schemaVersion === 1 &&
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
        if (isBloomData(data)) {
          set({ ...data, hydrationStatus: 'ready' });
          return;
        }
      }
    } catch (error) {
      console.error('Could not load Bloom data', error);
    }

    set({ hydrationStatus: 'ready' });
  },

  finishOnboarding: (result) => {
    const frequency = HABIT_FREQUENCIES.find((item) => item.id === result.frequencyId);
    const goalId = nextId('goal');
    const habits = get().habits.map((habit) => ({
      ...habit,
      goalId,
      frequency: {
        id: result.frequencyId,
        daysPerWeek: frequency?.daysPerWeek ?? 7,
      },
    }));

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

  toggleHabitForToday: (habitId) => {
    const today = toLocalDateKey();
    const now = new Date().toISOString();

    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id !== habitId) return habit;
        const isComplete = habit.completions.some(
          (completion) => completion.date === today && completion.status === 'completed',
        );
        const completions = isComplete
          ? habit.completions.filter((completion) => completion.date !== today)
          : [
              { date: today, status: 'completed' as const, completedAt: now },
              ...habit.completions.filter((completion) => completion.date !== today),
            ];
        const current = Math.max(0, habit.streak.current + (isComplete ? -1 : 1));

        return {
          ...habit,
          completions,
          streak: {
            current,
            best: Math.max(habit.streak.best, current),
            lastCompletedDate: completions.find((completion) => completion.status === 'completed')
              ?.date,
          },
        };
      }),
    }));
    persist(selectData(get()));
  },

  addHabit: (input) => {
    const frequency = HABIT_FREQUENCIES.find((item) => item.id === input.frequencyId);
    const habit: Habit = {
      id: nextId('habit'),
      goalId: get().goal?.id,
      name: input.name.trim(),
      icon: input.icon,
      frequency: {
        id: input.frequencyId,
        daysPerWeek: frequency?.daysPerWeek ?? 7,
      },
      reminder: { enabled: true, time: input.reminderTime.trim() },
      completions: [],
      streak: { current: 0, best: 0 },
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ habits: [...state.habits, habit] }));
    persist(selectData(get()));
  },
}));
