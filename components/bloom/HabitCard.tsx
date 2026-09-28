import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BookOpen, Check, Droplets, Flame, Footprints, Sparkles } from 'lucide-react-native';
import { Card, Typography, useThemeColor } from 'heroui-native';

import type { Habit } from '@/lib/bloom/types';
import { cn } from '@/lib/utils';

const ICONS = {
  book: BookOpen,
  walk: Footprints,
  water: Droplets,
  sparkles: Sparkles,
} as const;

interface HabitCardProps {
  habit: Habit;
  isComplete: boolean;
  onToggle: () => void;
}

export function HabitCard({ habit, isComplete, onToggle }: HabitCardProps) {
  const scale = useSharedValue(1);
  const [accent, muted] = useThemeColor(['accent', 'muted']);
  const Icon = ICONS[habit.icon];

  useEffect(() => {
    if (isComplete) {
      scale.set(withSequence(withSpring(1.018), withSpring(1)));
    }
  }, [isComplete, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleToggle = () => {
    void Haptics.impactAsync(
      isComplete ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    onToggle();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Card
        className={cn(
          'rounded-3xl border p-0',
          isComplete ? 'border-accent/30 bg-accent-soft' : 'border-border bg-surface',
        )}
      >
        <View className="min-h-24 flex-row items-center px-4 py-4">
          <View
            className={cn(
              'mr-4 size-12 items-center justify-center rounded-2xl',
              isComplete ? 'bg-accent/15' : 'bg-background-secondary',
            )}
          >
            <Icon color={isComplete ? accent : muted} size={22} strokeWidth={2.2} />
          </View>

          <View className="min-w-0 flex-1 gap-1.5">
            <Typography
              type="body"
              className={cn(
                'text-foreground font-semibold',
                isComplete && 'text-accent-soft-foreground',
              )}
            >
              {habit.name}
            </Typography>
            <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
              <Typography type="body-xs" className="text-muted">
                {habit.reminder.time}
              </Typography>
              <View className="flex-row items-center gap-1">
                <Flame color={muted} size={14} />
                <Typography type="body-xs" className="text-muted">
                  {habit.streak.current} day streak
                </Typography>
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleToggle}
            accessibilityRole="checkbox"
            accessibilityLabel={`${isComplete ? 'Mark incomplete' : 'Complete'} ${habit.name}`}
            accessibilityState={{ checked: isComplete }}
            hitSlop={10}
            className={cn(
              'ml-3 size-12 items-center justify-center rounded-full border-2 active:opacity-75',
              isComplete ? 'border-accent bg-accent' : 'border-border bg-background',
            )}
          >
            {isComplete && (
              <Animated.View entering={FadeIn.duration(180)}>
                <Check color="#FFFFFF" size={22} strokeWidth={3} />
              </Animated.View>
            )}
          </Pressable>
        </View>
      </Card>
    </Animated.View>
  );
}
