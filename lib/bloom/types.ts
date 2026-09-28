export const GOAL_CATEGORIES = [
  { id: 'health-fitness', label: 'Health & Fitness' },
  { id: 'learning', label: 'Learning' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'mental-wellbeing', label: 'Mental Wellbeing' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'finance', label: 'Finance' },
  { id: 'other', label: 'Something else' },
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number]['id'];

export const HABIT_FREQUENCIES = [
  { id: 'daily', label: 'Every day', daysPerWeek: 7 },
  { id: 'most-days', label: '3–4 days/week', daysPerWeek: 4 },
  { id: 'few-days', label: '1–2 days/week', daysPerWeek: 2 },
] as const;

export type HabitFrequencyId = (typeof HABIT_FREQUENCIES)[number]['id'];
export type HabitScheduleType = 'daily' | 'specific-days' | 'weekly-target';
export type HabitIcon = 'book' | 'walk' | 'water' | 'sparkles';
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Goal {
  id: string;
  category: GoalCategory;
  title: string;
  createdAt: string;
  status: 'active' | 'paused' | 'completed';
}

export interface HabitFrequency {
  id: HabitFrequencyId;
  scheduleType: HabitScheduleType;
  daysPerWeek: number;
  scheduledWeekdays?: Weekday[];
}

export interface HabitReminder {
  enabled: boolean;
  time: string;
  timezone?: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  status: 'completed' | 'skipped';
  completedAt?: string;
  note?: string;
}

export interface HabitStreak {
  current: number;
  best: number;
  lastCompletedDate?: string;
}

export interface HabitTarget {
  value: number;
  unit: string;
}

export interface Habit {
  id: string;
  goalId?: string;
  name: string;
  icon: HabitIcon;
  description?: string;
  target?: HabitTarget;
  frequency: HabitFrequency;
  reminder: HabitReminder;
  completions: HabitCompletion[];
  streak: HabitStreak;
  createdAt: string;
  updatedAt?: string;
  archivedAt?: string;
}

export const REFLECTION_REASONS = [
  { id: 'forgot', label: 'I forgot' },
  { id: 'not-enough-time', label: "I didn't have enough time" },
  { id: 'too-difficult', label: 'The habit felt too difficult' },
  { id: 'schedule-changed', label: 'My schedule changed' },
  { id: 'not-motivated', label: "I wasn't motivated" },
  { id: 'something-else', label: 'Something else' },
] as const;

export type ReflectionReason = (typeof REFLECTION_REASONS)[number]['id'];

export interface HabitReflection {
  id: string;
  habitId: string;
  date: string;
  reason: ReflectionReason;
  note?: string;
  createdAt: string;
}

export type CoachingAdjustment =
  | { kind: 'target'; target: HabitTarget }
  | { kind: 'reminder'; reminder: HabitReminder }
  | { kind: 'frequency'; frequency: HabitFrequency };

export interface HabitAdjustmentRecord {
  id: string;
  habitId: string;
  suggestionId: string;
  date: string;
  adjustment: CoachingAdjustment;
  previousValue: string;
  createdAt: string;
}

export interface CoachingDecision {
  suggestionId: string;
  status: 'accepted' | 'rejected';
  resolvedAt: string;
}

export interface NotificationPreference {
  enabled: boolean;
  defaultReminderTime: string;
}

export interface BloomData {
  schemaVersion: 3;
  onboardingCompleted: boolean;
  goal: Goal | null;
  habits: Habit[];
  reflections: HabitReflection[];
  adjustments: HabitAdjustmentRecord[];
  coachingDecisions: CoachingDecision[];
  notificationPreference: NotificationPreference;
}

export interface ReflectionInput {
  habitId: string;
  date: string;
  reason: ReflectionReason;
  note?: string;
}

export interface OnboardingResult {
  category: GoalCategory;
  goalTitle: string;
  frequencyId: HabitFrequencyId;
}

export interface HabitInput {
  name: string;
  icon: HabitIcon;
  description?: string;
  reminderEnabled: boolean;
  reminderTime: string;
  frequencyId: HabitFrequencyId;
  scheduleType: HabitScheduleType;
  daysPerWeek: number;
  scheduledWeekdays?: Weekday[];
  target?: HabitTarget;
}

export type NewHabitInput = HabitInput;
