import { BookOpen, Droplets, Footprints, Sparkles } from 'lucide-react-native';

import type { HabitIcon } from '@/lib/bloom/types';

export const HABIT_ICON_OPTIONS: {
  id: HabitIcon;
  label: string;
  Icon: typeof BookOpen;
}[] = [
  { id: 'sparkles', label: 'General', Icon: Sparkles },
  { id: 'book', label: 'Learning', Icon: BookOpen },
  { id: 'walk', label: 'Movement', Icon: Footprints },
  { id: 'water', label: 'Water', Icon: Droplets },
];

export const HABIT_ICONS = {
  book: BookOpen,
  walk: Footprints,
  water: Droplets,
  sparkles: Sparkles,
} as const;
