import {
  addDaysToKey,
  isHabitCompleteOnDate,
  isHabitScheduledOnDate,
  recentDateKeys,
  toLocalDateKey,
} from './habitMetrics';
import { REFLECTION_REASONS } from './types';
import type {
  CoachingAdjustment,
  CoachingDecision,
  Habit,
  HabitAdjustmentRecord,
  HabitFrequency,
  HabitReflection,
  ReflectionReason,
} from './types';

export interface CoachingSuggestion {
  id: string;
  habitId: string;
  reflectionId: string;
  title: string;
  message: string;
  actionLabel: string;
  confirmation: string;
  adjustment: CoachingAdjustment;
}

export interface HabitInsight {
  id: string;
  text: string;
}

const REASON_LABELS = new Map<ReflectionReason, string>(
  REFLECTION_REASONS.map((reason) => [reason.id, reason.label]),
);

function reflectionIsRecent(reflection: HabitReflection, today: string, days: number): boolean {
  return reflection.date >= addDaysToKey(today, -days);
}

export function getReflectionCandidate(
  habits: Habit[],
  reflections: HabitReflection[],
  today = toLocalDateKey(),
): Habit | undefined {
  return habits
    .filter((habit) => !habit.archivedAt)
    .map((habit) => {
      const recentScheduledDates = recentDateKeys(8, today)
        .slice(0, -1)
        .filter((date) => isHabitScheduledOnDate(habit, date));
      const completed = recentScheduledDates.filter((date) =>
        isHabitCompleteOnDate(habit, date),
      ).length;
      const missed = recentScheduledDates.length - completed;
      const recentlyReflected = reflections.some(
        (reflection) => reflection.habitId === habit.id && reflectionIsRecent(reflection, today, 7),
      );
      return {
        habit,
        eligible:
          recentScheduledDates.length >= 4 &&
          missed >= 3 &&
          completed / recentScheduledDates.length <= 0.5 &&
          !recentlyReflected,
        missed,
      };
    })
    .filter((candidate) => candidate.eligible)
    .sort((left, right) => right.missed - left.missed)[0]?.habit;
}

function simplerFrequency(habit: Habit): HabitFrequency | undefined {
  const frequency = habit.frequency;
  if (frequency.scheduleType === 'daily') {
    return { id: 'most-days', scheduleType: 'weekly-target', daysPerWeek: 4 };
  }
  if (frequency.scheduleType === 'weekly-target' && frequency.daysPerWeek > 1) {
    const daysPerWeek = frequency.daysPerWeek - 1;
    return {
      id: daysPerWeek <= 2 ? 'few-days' : 'most-days',
      scheduleType: 'weekly-target',
      daysPerWeek,
    };
  }
  const weekdays = frequency.scheduledWeekdays ?? [];
  if (frequency.scheduleType === 'specific-days' && weekdays.length > 1) {
    const scheduledWeekdays = weekdays.slice(0, -1);
    return {
      id: scheduledWeekdays.length <= 2 ? 'few-days' : 'most-days',
      scheduleType: 'specific-days',
      daysPerWeek: scheduledWeekdays.length,
      scheduledWeekdays,
    };
  }
  return undefined;
}

function reducedTarget(habit: Habit): Extract<CoachingAdjustment, { kind: 'target' }> | undefined {
  if (!habit.target || habit.target.value <= 1) return undefined;
  const target = {
    ...habit.target,
    value: Math.max(1, Math.round(habit.target.value / 3)),
  };
  return { kind: 'target', target };
}

function normalizeTime(time: string): { hour: number; minute: number } | undefined {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return undefined;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return { hour, minute: Number(match[2]) };
}

function earlierReminder(habit: Habit): Extract<CoachingAdjustment, { kind: 'reminder' }> {
  const parsed = normalizeTime(habit.reminder.time);
  if (!parsed) {
    return { kind: 'reminder', reminder: { ...habit.reminder, enabled: true, time: '8:00 AM' } };
  }
  const minutes = (parsed.hour * 60 + parsed.minute - 30 + 1440) % 1440;
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return {
    kind: 'reminder',
    reminder: {
      ...habit.reminder,
      enabled: true,
      time: `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`,
    },
  };
}

function frequencySuggestion(
  habit: Habit,
  reflection: HabitReflection,
  repeatCount: number,
): CoachingSuggestion | undefined {
  const frequency = simplerFrequency(habit);
  if (!frequency) return undefined;
  return {
    id: `${reflection.id}:frequency`,
    habitId: habit.id,
    reflectionId: reflection.id,
    title: 'Make the rhythm lighter',
    message: `${habit.name} has felt hard to fit in${repeatCount > 1 ? ' more than once' : ''}. Try ${frequency.daysPerWeek} days each week for now?`,
    actionLabel: `Try ${frequency.daysPerWeek} days`,
    confirmation: `Updated. ${habit.name} is now set for ${frequency.daysPerWeek} days each week.`,
    adjustment: { kind: 'frequency', frequency },
  };
}

function suggestionForReflection(
  habit: Habit,
  reflection: HabitReflection,
  repeatCount: number,
): CoachingSuggestion | undefined {
  if (reflection.reason === 'forgot') {
    const adjustment = earlierReminder(habit);
    return {
      id: `${reflection.id}:reminder`,
      habitId: habit.id,
      reflectionId: reflection.id,
      title: 'A reminder adjustment',
      message: `You mentioned forgetting ${habit.name}. Would a reminder at ${adjustment.reminder.time} help?`,
      actionLabel: `Move to ${adjustment.reminder.time}`,
      confirmation: `Updated. The reminder for ${habit.name} is now ${adjustment.reminder.time}.`,
      adjustment,
    };
  }

  if (reflection.reason === 'too-difficult' || reflection.reason === 'not-enough-time') {
    const adjustment = reducedTarget(habit);
    if (!adjustment) return frequencySuggestion(habit, reflection, repeatCount);
    const context =
      reflection.reason === 'too-difficult' ? 'felt too difficult' : 'has been hard to fit in';
    return {
      id: `${reflection.id}:target`,
      habitId: habit.id,
      reflectionId: reflection.id,
      title: 'Try a smaller version',
      message: `${habit.name} ${context}${repeatCount > 1 ? ' more than once' : ''}. Try ${adjustment.target.value} ${adjustment.target.unit} for now?`,
      actionLabel: `Try ${adjustment.target.value} ${adjustment.target.unit}`,
      confirmation: `Updated. The goal for ${habit.name} is now ${adjustment.target.value} ${adjustment.target.unit}.`,
      adjustment,
    };
  }

  if (reflection.reason === 'schedule-changed' || reflection.reason === 'not-motivated') {
    return frequencySuggestion(habit, reflection, repeatCount);
  }

  return undefined;
}

export function getActiveCoachingSuggestion(
  habits: Habit[],
  reflections: HabitReflection[],
  decisions: CoachingDecision[],
): CoachingSuggestion | undefined {
  const resolved = new Set(decisions.map((decision) => decision.suggestionId));
  const sortedReflections = [...reflections].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );

  for (const reflection of sortedReflections) {
    const habit = habits.find(
      (candidate) => candidate.id === reflection.habitId && !candidate.archivedAt,
    );
    if (!habit) continue;
    const repeatCount = reflections.filter(
      (candidate) => candidate.habitId === habit.id && candidate.reason === reflection.reason,
    ).length;
    const suggestion = suggestionForReflection(habit, reflection, repeatCount);
    if (suggestion && !resolved.has(suggestion.id)) return suggestion;
  }
  return undefined;
}

export function describePreviousValue(habit: Habit, adjustment: CoachingAdjustment): string {
  if (adjustment.kind === 'target') {
    return habit.target ? `${habit.target.value} ${habit.target.unit}` : 'No target';
  }
  if (adjustment.kind === 'reminder') {
    return habit.reminder.enabled ? habit.reminder.time : 'Off';
  }
  return `${habit.frequency.daysPerWeek} days each week`;
}

export function buildHabitInsights(
  habit: Habit,
  reflections: HabitReflection[],
  adjustments: HabitAdjustmentRecord[],
  today = toLocalDateKey(),
): HabitInsight[] {
  const insights: HabitInsight[] = [];
  const scheduledDates = recentDateKeys(14, today).filter((date) =>
    isHabitScheduledOnDate(habit, date),
  );
  if (scheduledDates.length >= 5) {
    const completed = scheduledDates.filter((date) => isHabitCompleteOnDate(habit, date)).length;
    insights.push({
      id: 'consistency',
      text: `You completed ${completed} of ${scheduledDates.length} recent scheduled check-ins.`,
    });
  }

  const habitReflections = reflections.filter((reflection) => reflection.habitId === habit.id);
  if (habitReflections.length >= 2) {
    const counts = new Map<ReflectionReason, number>();
    habitReflections.forEach((reflection) =>
      counts.set(reflection.reason, (counts.get(reflection.reason) ?? 0) + 1),
    );
    const [reason, count] = [...counts.entries()].sort((left, right) => right[1] - left[1])[0];
    if (count >= 2) {
      insights.push({
        id: 'reflection',
        text: `${REASON_LABELS.get(reason) ?? 'The same obstacle'} has come up most often in reflections.`,
      });
    }
  }

  const adjustmentCount = adjustments.filter(
    (adjustment) => adjustment.habitId === habit.id,
  ).length;
  if (adjustmentCount > 0) {
    insights.push({
      id: 'adjustments',
      text: `${adjustmentCount} ${adjustmentCount === 1 ? 'adjustment has' : 'adjustments have'} been tried while keeping the earlier history intact.`,
    });
  }

  return insights;
}
