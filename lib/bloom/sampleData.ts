import type { BloomData, Habit } from './types';

export function toLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateKeyDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toLocalDateKey(date);
}

function sampleHabit(
  id: string,
  name: string,
  icon: Habit['icon'],
  reminderTime: string,
  currentStreak: number,
  completedToday = false,
): Habit {
  const now = new Date().toISOString();
  const completions = Array.from(
    { length: Math.max(0, currentStreak - (completedToday ? 1 : 0)) },
    (_, index) => ({
      date: dateKeyDaysAgo(index + 1),
      status: 'completed' as const,
      completedAt: new Date(Date.now() - (index + 1) * 86_400_000).toISOString(),
    }),
  );

  if (completedToday) {
    completions.unshift({
      date: toLocalDateKey(),
      status: 'completed',
      completedAt: now,
    });
  }

  return {
    id,
    name,
    icon,
    frequency: { id: 'daily', daysPerWeek: 7 },
    reminder: { enabled: true, time: reminderTime },
    completions,
    streak: {
      current: currentStreak,
      best: currentStreak,
      lastCompletedDate: completions[0]?.date,
    },
    createdAt: now,
  };
}

export function createInitialBloomData(): BloomData {
  return {
    schemaVersion: 1,
    onboardingCompleted: false,
    goal: null,
    habits: [
      sampleHabit('habit-read', 'Read 10 pages', 'book', '7:30 PM', 4, true),
      sampleHabit('habit-walk', 'Walk for 10 minutes', 'walk', '12:30 PM', 2),
      sampleHabit('habit-water', 'Drink 2L of water', 'water', 'Throughout the day', 6),
    ],
  };
}
