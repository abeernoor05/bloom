import type { Habit, NotificationPreference } from './types';

export type NotificationAvailability = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export async function getNotificationAvailability(): Promise<NotificationAvailability> {
  return 'unavailable';
}

export async function requestNotificationPermission(): Promise<NotificationAvailability> {
  return 'unavailable';
}

export async function reconcileHabitNotifications(
  _habits: Habit[],
  _preference: NotificationPreference,
): Promise<void> {}
