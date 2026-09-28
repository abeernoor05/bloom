import { toLocalDateKey } from './habitMetrics';
import type { BloomData, Habit } from './types';

export { toLocalDateKey } from './habitMetrics';

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
      habitId: id,
      date: dateKeyDaysAgo(index + 1),
      status: 'completed' as const,
      completedAt: new Date(Date.now() - (index + 1) * 86_400_000).toISOString(),
    }),
  );

  if (completedToday) {
    completions.unshift({
      habitId: id,
      date: toLocalDateKey(),
      status: 'completed',
      completedAt: now,
    });
  }

  return {
    id,
    name,
    icon,
    frequency: { id: 'daily', scheduleType: 'daily', daysPerWeek: 7 },
    reminder: { enabled: true, time: reminderTime },
    completions,
    streak: {
      current: currentStreak,
      best: currentStreak,
      lastCompletedDate: completions[0]?.date,
    },
    createdAt: new Date(Date.now() - Math.max(currentStreak, 7) * 86_400_000).toISOString(),
  };
}

export function createInitialBloomData(): BloomData {
  return {
    schemaVersion: 3,
    onboardingCompleted: false,
    goal: null,
    habits: [
      sampleHabit('habit-read', 'Read 10 pages', 'book', '7:30 PM', 4, true),
      sampleHabit('habit-walk', 'Walk for 10 minutes', 'walk', '12:30 PM', 2),
      sampleHabit('habit-water', 'Drink 2L of water', 'water', 'Throughout the day', 6),
    ],
    reflections: [],
    adjustments: [],
    coachingDecisions: [],
    notificationPreference: { enabled: true, defaultReminderTime: '8:00 AM' },
  };
}
