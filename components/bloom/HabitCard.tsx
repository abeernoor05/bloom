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
import { Check, ChevronRight, Clock3, Flame } from 'lucide-react-native';
import { Card, Typography, useThemeColor } from 'heroui-native';

import { HabitIcon } from '@/components/bloom/habitVisuals';
import type { Habit } from '@/lib/bloom/types';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  isComplete: boolean;
  onToggle: () => void;
  onPress?: () => void;
}

export function HabitCard({ habit, isComplete, onToggle, onPress }: HabitCardProps) {
  const scale = useSharedValue(1);
  const [accent, muted] = useThemeColor(['accent', 'muted']);

  useEffect(() => {
    if (isComplete) scale.set(withSequence(withSpring(1.018), withSpring(1)));
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
          'rounded-[22px] border p-0',
          isComplete ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
        )}
      >
        <View className="min-h-24 flex-row items-center px-4 py-4">
          <Pressable
            onPress={onPress}
            disabled={!onPress}
            accessibilityRole={onPress ? 'button' : undefined}
            accessibilityLabel={onPress ? `View ${habit.name}` : undefined}
            className="min-w-0 flex-1 flex-row items-center"
          >
            <View className="bg-background-secondary mr-4 size-11 items-center justify-center rounded-full">
              <HabitIcon icon={habit.icon} color={accent} size={20} strokeWidth={1.8} />
            </View>

            <View className="min-w-0 flex-1 gap-1.5">
              <Typography
                type="body-sm"
                className="text-foreground font-medium"
                numberOfLines={1}
                style={{ fontSize: 13, lineHeight: 18 }}
              >
                {habit.name}
              </Typography>
              <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
                <View className="flex-row items-center gap-1">
                  <Clock3 color={muted} size={13} strokeWidth={1.8} />
                  <Typography type="body-xs" className="text-muted">
                    {habit.reminder.enabled ? habit.reminder.time : 'No reminder'}
                  </Typography>
                </View>
                <View className="flex-row items-center gap-1">
                  <Flame color={muted} size={13} strokeWidth={1.8} />
                  <Typography type="body-xs" className="text-muted">
                    {habit.streak.current} streak
                  </Typography>
                </View>
              </View>
            </View>
            {onPress ? <ChevronRight color={muted} size={17} strokeWidth={1.8} /> : null}
          </Pressable>

          <Pressable
            onPress={handleToggle}
            accessibilityRole="checkbox"
            accessibilityLabel={`${isComplete ? 'Mark incomplete' : 'Complete'} ${habit.name}`}
            accessibilityState={{ checked: isComplete }}
            hitSlop={10}
            className={cn(
              'ml-3 size-12 items-center justify-center rounded-full border active:opacity-75',
              isComplete ? 'border-accent bg-accent' : 'border-sage bg-background-secondary',
            )}
          >
            {isComplete ? (
              <Animated.View entering={FadeIn.duration(180)}>
                <Check color="#FFF9EE" size={21} strokeWidth={2.4} />
              </Animated.View>
            ) : null}
          </Pressable>
        </View>
      </Card>
    </Animated.View>
  );
}
