import type { Habit } from './types';
import {
  addDaysToKey,
  calculateHabitMetrics,
  dateFromKey,
  isHabitCompleteOnDate,
  isHabitScheduledOnDate,
  isHabitWithinLifetime,
  recentDateKeys,
  toLocalDateKey,
} from './habitMetrics';

export interface PeriodProgress {
  completed: number;
  scheduled: number;
  rate: number | undefined;
}

export interface ProgressDay extends PeriodProgress {
  date: string;
}

export interface OverallProgress {
  activeHabitCount: number;
  completedOccurrences: number;
  overallRate: number | undefined;
  currentStreak: number;
  longestStreak: number;
  week: PeriodProgress;
  month: PeriodProgress;
  recentDays: ProgressDay[];
  insight?: string;
}

function periodProgress(habits: Habit[], dates: string[]): PeriodProgress {
  let completed = 0;
  let scheduled = 0;

  for (const habit of habits) {
    if (habit.frequency.scheduleType !== 'weekly-target') {
      for (const date of dates) {
        if (!isHabitScheduledOnDate(habit, date)) continue;
        scheduled += 1;
        if (isHabitCompleteOnDate(habit, date)) completed += 1;
      }
      continue;
    }

    const eligibleDates = dates.filter((date) => isHabitWithinLifetime(habit, date));
    const datesByWeek = new Map<string, string[]>();
    for (const date of eligibleDates) {
      const weekStart = startOfWeek(date);
      datesByWeek.set(weekStart, [...(datesByWeek.get(weekStart) ?? []), date]);
    }

    for (const weekDates of datesByWeek.values()) {
      const target = Math.min(habit.frequency.daysPerWeek, weekDates.length);
      const completedInPeriod = weekDates.filter((date) =>
        isHabitCompleteOnDate(habit, date),
      ).length;
      scheduled += target;
      completed += Math.min(target, completedInPeriod);
    }
  }

  return {
    completed,
    scheduled,
    rate: scheduled > 0 ? completed / scheduled : undefined,
  };
}

function datesBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  for (let date = start; date <= end; date = addDaysToKey(date, 1)) dates.push(date);
  return dates;
}

function startOfWeek(dateKey: string): string {
  const day = dateFromKey(dateKey).getDay();
  return addDaysToKey(dateKey, -((day + 6) % 7));
}

function startOfMonth(dateKey: string): string {
  const date = dateFromKey(dateKey);
  date.setDate(1);
  return toLocalDateKey(date);
}

function buildProgressInsight(
  habits: Habit[],
  week: PeriodProgress,
  today: string,
): string | undefined {
  if (week.scheduled >= 3 && week.rate !== undefined) {
    const previousWeekEnd = addDaysToKey(startOfWeek(today), -1);
    const previous = periodProgress(habits, recentDateKeys(7, previousWeekEnd));
    if (
      previous.scheduled >= 3 &&
      previous.rate !== undefined &&
      week.rate >= previous.rate + 0.15
    ) {
      return 'Your completion rate improved this week.';
    }
  }

  const recent = periodProgress(habits, recentDateKeys(7, today));
  if (recent.scheduled >= 4) {
    return `You completed ${recent.completed} of your last ${recent.scheduled} scheduled habits.`;
  }

  return undefined;
}

export function calculateOverallProgress(
  habits: Habit[],
  today = toLocalDateKey(),
): OverallProgress {
  const activeHabits = habits.filter((habit) => !habit.archivedAt);
  const metrics = activeHabits.map((habit) => calculateHabitMetrics(habit, today));
  const completedOccurrences = metrics.reduce((total, item) => total + item.completedCount, 0);
  const scheduledOccurrences = metrics.reduce((total, item) => total + item.scheduledCount, 0);
  const week = periodProgress(activeHabits, datesBetween(startOfWeek(today), today));
  const month = periodProgress(activeHabits, datesBetween(startOfMonth(today), today));
  const recentDays = recentDateKeys(28, today).map((date) => ({
    date,
    ...periodProgress(activeHabits, [date]),
  }));

  return {
    activeHabitCount: activeHabits.length,
    completedOccurrences,
    overallRate: scheduledOccurrences > 0 ? completedOccurrences / scheduledOccurrences : undefined,
    currentStreak: metrics.reduce((best, item) => Math.max(best, item.current), 0),
    longestStreak: metrics.reduce((best, item) => Math.max(best, item.best), 0),
    week,
    month,
    recentDays,
    insight: buildProgressInsight(activeHabits, week, today),
  };
}
