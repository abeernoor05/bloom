import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { parseReminderTime } from './reminderTime';
import type { Habit, NotificationPreference } from './types';

const REGISTRY_KEY = '@bloom/notification-ids/v1';
const CHANNEL_ID = 'habit-reminders';

export type NotificationAvailability = 'granted' | 'denied' | 'undetermined' | 'unavailable';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function permissionStatus(
  status: Notifications.NotificationPermissionsStatus,
): NotificationAvailability {
  if (status.granted || status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return 'granted';
  }
  return status.canAskAgain ? 'undetermined' : 'denied';
}

export async function getNotificationAvailability(): Promise<NotificationAvailability> {
  try {
    return permissionStatus(await Notifications.getPermissionsAsync());
  } catch {
    return 'unavailable';
  }
}

export async function requestNotificationPermission(): Promise<NotificationAvailability> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Habit reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (permissionStatus(current) === 'granted') return 'granted';
    if (!current.canAskAgain) return 'denied';
    return permissionStatus(await Notifications.requestPermissionsAsync());
  } catch {
    return 'unavailable';
  }
}

async function readRegistry(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(REGISTRY_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

async function clearBloomNotifications(): Promise<boolean> {
  const identifiers = await readRegistry();
  const failedIdentifiers: string[] = [];
  await Promise.all(
    identifiers.map(async (identifier) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      } catch {
        failedIdentifiers.push(identifier);
      }
    }),
  );

  if (failedIdentifiers.length > 0) {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const activeIdentifiers = new Set(scheduled.map((request) => request.identifier));
      const unresolvedIdentifiers = failedIdentifiers.filter((identifier) =>
        activeIdentifiers.has(identifier),
      );
      if (unresolvedIdentifiers.length > 0) {
        await AsyncStorage.setItem(REGISTRY_KEY, JSON.stringify(unresolvedIdentifiers));
        return false;
      }
    } catch {
      await AsyncStorage.setItem(REGISTRY_KEY, JSON.stringify(failedIdentifiers));
      return false;
    }
  }

  await AsyncStorage.removeItem(REGISTRY_KEY);
  return true;
}

function reminderWeekdays(habit: Habit): number[] | undefined {
  if (habit.frequency.scheduleType === 'daily') return undefined;
  if (habit.frequency.scheduleType === 'specific-days') {
    return habit.frequency.scheduledWeekdays?.map((day) => day + 1);
  }
  // Flexible weekly habits can happen on any day, so their reminder remains daily.
  return undefined;
}

let reconciliation = Promise.resolve();

export function reconcileHabitNotifications(
  habits: Habit[],
  preference: NotificationPreference,
): Promise<void> {
  reconciliation = reconciliation
    .catch(() => undefined)
    .then(async () => {
      const cleared = await clearBloomNotifications();
      if (!cleared) return;
      if (!preference.enabled || (await getNotificationAvailability()) !== 'granted') return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: 'Habit reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const identifiers: string[] = [];
      for (const habit of habits) {
        if (habit.archivedAt || !habit.reminder.enabled) continue;
        const time = parseReminderTime(habit.reminder.time);
        if (!time) continue;
        const weekdays = reminderWeekdays(habit);
        const triggers = weekdays?.length ? weekdays : [undefined];

        for (const weekday of triggers) {
          const identifier = await Notifications.scheduleNotificationAsync({
            content: {
              title: habit.name,
              body: 'A small step is enough for today.',
              data: { bloomHabitId: habit.id },
            },
            trigger:
              weekday === undefined
                ? {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: time.hour,
                    minute: time.minute,
                    channelId: CHANNEL_ID,
                  }
                : {
                    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                    weekday,
                    hour: time.hour,
                    minute: time.minute,
                    channelId: CHANNEL_ID,
                  },
          });
          identifiers.push(identifier);
          await AsyncStorage.setItem(REGISTRY_KEY, JSON.stringify(identifiers));
        }
      }
    });
  return reconciliation;
}
