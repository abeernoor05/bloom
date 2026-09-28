import type { BloomData } from './types';

export { toLocalDateKey } from './habitMetrics';

export function createInitialBloomData(): BloomData {
  return {
    schemaVersion: 4,
    onboardingCompleted: false,
    goal: null,
    habits: [],
    reflections: [],
    adjustments: [],
    coachingDecisions: [],
    coachExchanges: [],
    notificationPreference: { enabled: true, defaultReminderTime: '8:00 AM' },
  };
}
