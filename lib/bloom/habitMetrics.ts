import type { Habit, HabitCompletion, HabitStreak } from './types';

const DAY_MS = 86_400_000;

export interface HabitMetrics extends HabitStreak {
  completionRate: number;
  completedCount: number;
  scheduledCount: number;
}

export function toLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function addDaysToKey(dateKey: string, days: number): string {
  const date = dateFromKey(dateKey);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

export function getWeekStartKey(dateKey: string): string {
  const date = dateFromKey(dateKey);
  const offset = (date.getDay() + 6) % 7;
  return addDaysToKey(dateKey, -offset);
}

export function isHabitCompleteOnDate(habit: Habit, dateKey: string): boolean {
  return habit.completions.some(
    (completion) => completion.date === dateKey && completion.status === 'completed',
  );
}

export function isHabitWithinLifetime(habit: Habit, dateKey: string): boolean {
  const createdDate = toLocalDateKey(new Date(habit.createdAt));
  const archivedDate = habit.archivedAt ? toLocalDateKey(new Date(habit.archivedAt)) : undefined;
  return dateKey >= createdDate && (!archivedDate || dateKey < archivedDate);
}

function completionsInWeek(habit: Habit, weekStart: string, throughDate?: string): number {
  const weekEnd = addDaysToKey(weekStart, 6);
  return new Set(
    habit.completions
      .filter(
        (completion) =>
          completion.status === 'completed' &&
          completion.date >= weekStart &&
          completion.date <= weekEnd &&
          (!throughDate || completion.date <= throughDate),
      )
      .map((completion) => completion.date),
  ).size;
}

export function isHabitScheduledOnDate(habit: Habit, dateKey: string): boolean {
  if (!isHabitWithinLifetime(habit, dateKey)) return false;
  if (habit.frequency.scheduleType === 'daily') return true;
  if (habit.frequency.scheduleType === 'specific-days') {
    return (habit.frequency.scheduledWeekdays ?? []).some(
      (weekday) => weekday === dateFromKey(dateKey).getDay(),
    );
  }

  if (isHabitCompleteOnDate(habit, dateKey)) return true;
  const weekStart = getWeekStartKey(dateKey);
  return completionsInWeek(habit, weekStart, dateKey) < habit.frequency.daysPerWeek;
}

function fixedScheduleDates(habit: Habit, endDate: string): string[] {
  const startDate = toLocalDateKey(new Date(habit.createdAt));
  const dates: string[] = [];
  for (let date = startDate; date <= endDate; date = addDaysToKey(date, 1)) {
    if (isHabitWithinLifetime(habit, date)) {
      const isScheduled =
        habit.frequency.scheduleType === 'daily' ||
        (habit.frequency.scheduledWeekdays ?? []).some(
          (weekday) => weekday === dateFromKey(date).getDay(),
        );
      if (isScheduled) dates.push(date);
    }
  }
  return dates;
}

function calculateFixedMetrics(habit: Habit, today: string): HabitMetrics {
  const scheduledDates = fixedScheduleDates(habit, today);
  const completed = new Set(
    habit.completions
      .filter((completion) => completion.status === 'completed')
      .map((completion) => completion.date),
  );

  let running = 0;
  let longest = 0;
  for (const date of scheduledDates) {
    if (completed.has(date)) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  const datesForCurrent =
    scheduledDates.at(-1) === today && !completed.has(today)
      ? scheduledDates.slice(0, -1)
      : scheduledDates;
  let current = 0;
  for (let index = datesForCurrent.length - 1; index >= 0; index -= 1) {
    if (!completed.has(datesForCurrent[index])) break;
    current += 1;
  }

  const completedCount = scheduledDates.filter((date) => completed.has(date)).length;
  return {
    current,
    best: longest,
    lastCompletedDate: habit.completions
      .filter((completion) => completion.status === 'completed')
      .map((completion) => completion.date)
      .sort()
      .at(-1),
    completionRate: scheduledDates.length === 0 ? 0 : completedCount / scheduledDates.length,
    completedCount,
    scheduledCount: scheduledDates.length,
  };
}

function calculateWeeklyMetrics(habit: Habit, today: string): HabitMetrics {
  const target = Math.max(1, habit.frequency.daysPerWeek);
  const firstWeek = getWeekStartKey(toLocalDateKey(new Date(habit.createdAt)));
  const currentWeek = getWeekStartKey(today);
  const weeks: string[] = [];
  for (let week = firstWeek; week <= currentWeek; week = addDaysToKey(week, 7)) weeks.push(week);

  const success = weeks.map((week) => completionsInWeek(habit, week) >= target);
  let longest = 0;
  let running = 0;
  success.forEach((met) => {
    running = met ? running + 1 : 0;
    longest = Math.max(longest, running);
  });

  let current = 0;
  for (let index = weeks.length - 1; index >= 0; index -= 1) {
    if (weeks[index] === currentWeek && !success[index]) continue;
    if (!success[index]) break;
    current += 1;
  }

  const completedCount = weeks.reduce(
    (total, week) => total + Math.min(target, completionsInWeek(habit, week)),
    0,
  );
  const scheduledCount = weeks.length * target;
  return {
    current,
    best: longest,
    lastCompletedDate: habit.completions
      .filter((completion) => completion.status === 'completed')
      .map((completion) => completion.date)
      .sort()
      .at(-1),
    completionRate: scheduledCount === 0 ? 0 : completedCount / scheduledCount,
    completedCount,
    scheduledCount,
  };
}

export function calculateHabitMetrics(habit: Habit, today = toLocalDateKey()): HabitMetrics {
  return habit.frequency.scheduleType === 'weekly-target'
    ? calculateWeeklyMetrics(habit, today)
    : calculateFixedMetrics(habit, today);
}

export function upsertCompletion(
  completions: HabitCompletion[],
  habitId: string,
  date: string,
  completed: boolean,
): HabitCompletion[] {
  const withoutDate = completions.filter((completion) => completion.date !== date);
  if (!completed) return withoutDate;
  return [
    { habitId, date, status: 'completed', completedAt: new Date().toISOString() },
    ...withoutDate,
  ];
}

export function formatFrequency(habit: Habit): string {
  if (habit.frequency.scheduleType === 'daily') return 'Every day';
  if (habit.frequency.scheduleType === 'weekly-target') {
    return `${habit.frequency.daysPerWeek}× each week`;
  }
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (habit.frequency.scheduledWeekdays ?? []).map((day) => labels[day]).join(', ');
}

export function recentDateKeys(days: number, endDate = toLocalDateKey()): string[] {
  return Array.from({ length: days }, (_, index) => addDaysToKey(endDate, index - days + 1));
}

export const millisecondsPerDay = DAY_MS;
