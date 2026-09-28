import type { ComponentProps } from 'react';
import { BookOpen, Droplets, Footprints, Sparkles } from 'lucide-react-native';

import type { HabitIcon as HabitIconId } from '@/lib/bloom/types';

type HabitIconProps = ComponentProps<typeof BookOpen> & {
  icon: HabitIconId;
};

export const HABIT_ICON_OPTIONS: {
  id: HabitIconId;
  label: string;
  Icon: typeof BookOpen;
}[] = [
  { id: 'sparkles', label: 'General', Icon: Sparkles },
  { id: 'book', label: 'Learning', Icon: BookOpen },
  { id: 'walk', label: 'Movement', Icon: Footprints },
  { id: 'water', label: 'Water', Icon: Droplets },
];

export function HabitIcon({ icon, ...props }: HabitIconProps) {
  switch (icon) {
    case 'book':
      return <BookOpen {...props} />;
    case 'walk':
      return <Footprints {...props} />;
    case 'water':
      return <Droplets {...props} />;
    case 'sparkles':
    default:
      return <Sparkles {...props} />;
  }
}
