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
export type HabitIcon = 'book' | 'walk' | 'water' | 'sparkles';

export interface Goal {
  id: string;
  category: GoalCategory;
  title: string;
  createdAt: string;
  status: 'active' | 'paused' | 'completed';
}

export interface HabitFrequency {
  id: HabitFrequencyId;
  daysPerWeek: number;
  scheduledWeekdays?: number[];
}

export interface HabitReminder {
  enabled: boolean;
  time: string;
  timezone?: string;
}

export interface HabitCompletion {
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

export interface Habit {
  id: string;
  goalId?: string;
  name: string;
  icon: HabitIcon;
  frequency: HabitFrequency;
  reminder: HabitReminder;
  completions: HabitCompletion[];
  streak: HabitStreak;
  createdAt: string;
  archivedAt?: string;
}

export interface BloomData {
  schemaVersion: 1;
  onboardingCompleted: boolean;
  goal: Goal | null;
  habits: Habit[];
}

export interface OnboardingResult {
  category: GoalCategory;
  goalTitle: string;
  frequencyId: HabitFrequencyId;
}

export interface NewHabitInput {
  name: string;
  icon: HabitIcon;
  reminderTime: string;
  frequencyId: HabitFrequencyId;
}
