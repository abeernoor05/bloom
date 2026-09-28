import { z } from 'zod';

import { bilt } from '@/lib/bilt';

import {
  isHabitCompleteOnDate,
  isHabitScheduledOnDate,
  recentDateKeys,
  toLocalDateKey,
} from './habitMetrics';
import { normalizeReminderTime } from './reminderTime';
import type {
  BloomData,
  CoachExchange,
  CoachRecommendation,
  CoachingAdjustment,
  Habit,
  HabitFrequency,
} from './types';

const coachResponseSchema = z.object({
  answer: z.string().trim().min(1).max(900),
  recommendation: z
    .object({
      kind: z.enum(['target', 'reminder', 'frequency']),
      habitId: z.string().trim().min(1).max(120),
      title: z.string().trim().min(1).max(80),
      message: z.string().trim().min(1).max(320),
      actionLabel: z.string().trim().min(1).max(60),
      targetValue: z.number().positive().optional(),
      targetUnit: z.string().trim().min(1).max(40).optional(),
      reminderTime: z.string().trim().min(1).max(20).optional(),
      daysPerWeek: z.number().int().min(1).max(7).optional(),
    })
    .nullable(),
});

const coachingAdjustmentSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('target'),
    target: z.object({ value: z.number(), unit: z.string() }),
  }),
  z.object({
    kind: z.literal('reminder'),
    reminder: z.object({
      enabled: z.boolean(),
      time: z.string(),
      timezone: z.string().optional(),
    }),
  }),
  z.object({
    kind: z.literal('frequency'),
    frequency: z.object({
      id: z.enum(['daily', 'most-days', 'few-days']),
      scheduleType: z.enum(['daily', 'specific-days', 'weekly-target']),
      daysPerWeek: z.number(),
      scheduledWeekdays: z
        .array(
          z.union([
            z.literal(0),
            z.literal(1),
            z.literal(2),
            z.literal(3),
            z.literal(4),
            z.literal(5),
            z.literal(6),
          ]),
        )
        .optional(),
    }),
  }),
]);

const coachExchangeSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  source: z.enum(['ai', 'local']),
  recommendation: z
    .object({
      id: z.string(),
      habitId: z.string(),
      title: z.string(),
      message: z.string(),
      actionLabel: z.string(),
      adjustment: coachingAdjustmentSchema,
      signature: z.string(),
      status: z.enum(['open', 'accepted', 'rejected']),
      resolvedAt: z.string().optional(),
    })
    .optional(),
  createdAt: z.string(),
});

interface CoachRequestHabit {
  id: string;
  name: string;
  target?: { value: number; unit: string };
  frequency: Habit['frequency'];
  reminder: Habit['reminder'];
  recent: { scheduled: number; completed: number };
  reflectionReasons: string[];
}

export interface CoachResult {
  answer: string;
  source: 'ai' | 'local';
  recommendation?: Omit<CoachRecommendation, 'id' | 'status' | 'resolvedAt'>;
}

function frequencyForDays(daysPerWeek: number): HabitFrequency {
  return {
    id: daysPerWeek <= 2 ? 'few-days' : 'most-days',
    scheduleType: 'weekly-target',
    daysPerWeek,
  };
}

export function adjustmentSignature(habitId: string, adjustment: CoachingAdjustment): string {
  if (adjustment.kind === 'target') {
    return `${habitId}:target:${adjustment.target.value}:${adjustment.target.unit.toLowerCase()}`;
  }
  if (adjustment.kind === 'reminder') {
    return `${habitId}:reminder:${adjustment.reminder.time.toLowerCase()}`;
  }
  return `${habitId}:frequency:${adjustment.frequency.daysPerWeek}`;
}

function mapRecommendation(
  raw: z.infer<typeof coachResponseSchema>['recommendation'],
  habits: Habit[],
  priorRecommendationKeys: Set<string>,
): CoachResult['recommendation'] {
  if (!raw) return undefined;
  const habit = habits.find((candidate) => candidate.id === raw.habitId && !candidate.archivedAt);
  if (!habit) return undefined;

  let adjustment: CoachingAdjustment | undefined;
  if (
    raw.kind === 'target' &&
    habit.target &&
    raw.targetValue !== undefined &&
    raw.targetValue >= 1 &&
    raw.targetValue < habit.target.value &&
    raw.targetUnit?.toLowerCase() === habit.target.unit.toLowerCase()
  ) {
    adjustment = {
      kind: 'target',
      target: { value: raw.targetValue, unit: habit.target.unit },
    };
  } else if (raw.kind === 'reminder' && raw.reminderTime) {
    const time = normalizeReminderTime(raw.reminderTime);
    if (time) {
      adjustment = {
        kind: 'reminder',
        reminder: { ...habit.reminder, enabled: true, time },
      };
    }
  } else if (
    raw.kind === 'frequency' &&
    raw.daysPerWeek !== undefined &&
    raw.daysPerWeek < habit.frequency.daysPerWeek
  ) {
    adjustment = { kind: 'frequency', frequency: frequencyForDays(raw.daysPerWeek) };
  }

  if (!adjustment) return undefined;
  const signature = adjustmentSignature(habit.id, adjustment);
  if (priorRecommendationKeys.has(signature)) return undefined;

  return {
    habitId: habit.id,
    title: raw.title,
    message: raw.message,
    actionLabel: raw.actionLabel,
    adjustment,
    signature,
  };
}

function buildHabitContext(data: BloomData): CoachRequestHabit[] {
  const dates = recentDateKeys(14, toLocalDateKey());
  return data.habits
    .filter((habit) => !habit.archivedAt)
    .slice(0, 12)
    .map((habit) => {
      const scheduledDates = dates.filter((date) => isHabitScheduledOnDate(habit, date));
      return {
        id: habit.id,
        name: habit.name,
        target: habit.target,
        frequency: habit.frequency,
        reminder: habit.reminder,
        recent: {
          scheduled: scheduledDates.length,
          completed: scheduledDates.filter((date) => isHabitCompleteOnDate(habit, date)).length,
        },
        reflectionReasons: data.reflections
          .filter((reflection) => reflection.habitId === habit.id)
          .slice(0, 6)
          .map((reflection) => reflection.reason),
      };
    });
}

function localCoachAnswer(habits: CoachRequestHabit[]): string {
  if (habits.length === 0) {
    return 'Start with one habit that feels small enough to repeat on a busy day. Once it has a little history, your coaching can become more specific.';
  }

  const withHistory = habits
    .filter((habit) => habit.recent.scheduled > 0)
    .sort(
      (left, right) =>
        left.recent.completed / left.recent.scheduled -
        right.recent.completed / right.recent.scheduled,
    );
  const habit = withHistory[0];
  if (!habit) {
    return 'There is not enough history for a tailored pattern yet. Keep the next step small and check in again after a few scheduled days.';
  }

  if (habit.recent.completed === habit.recent.scheduled) {
    return `${habit.name} has been steady across its recent scheduled days. Protect that rhythm by keeping the next step simple rather than making it harder.`;
  }

  return `${habit.name} was completed on ${habit.recent.completed} of ${habit.recent.scheduled} recent scheduled days. For the next check-in, choose the smallest version that still counts and focus on showing up once.`;
}

export async function requestCoach(question: string, data: BloomData): Promise<CoachResult> {
  const habits = buildHabitContext(data);
  const priorRecommendationKeys = new Set(
    data.coachExchanges.flatMap((exchange) =>
      exchange.recommendation ? [exchange.recommendation.signature] : [],
    ),
  );
  const fallback: CoachResult = { answer: localCoachAnswer(habits), source: 'local' };

  try {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const invocation = bilt.functions.invoke('bloom-coach', {
      body: {
        question: question.trim(),
        goalTitle: data.goal?.title,
        habits,
        priorRecommendationKeys: [...priorRecommendationKeys],
      },
    });
    const result = await Promise.race([
      invocation,
      new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => resolve(null), 12_000);
      }),
    ]);
    if (timeoutId) clearTimeout(timeoutId);
    if (!result) return fallback;
    const { data: response, error } = result;
    if (error) return fallback;

    const parsed = coachResponseSchema.safeParse(response);
    if (!parsed.success) return fallback;
    return {
      answer: parsed.data.answer,
      source: 'ai',
      recommendation: mapRecommendation(
        parsed.data.recommendation,
        data.habits,
        priorRecommendationKeys,
      ),
    };
  } catch {
    return fallback;
  }
}

export function normalizeCoachExchanges(value: unknown): CoachExchange[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): CoachExchange[] => {
    const parsed = coachExchangeSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}
