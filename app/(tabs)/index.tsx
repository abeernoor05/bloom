import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Leaf } from 'lucide-react-native';
import { Typography, useThemeColor } from 'heroui-native';

import { AddHabitSheet } from '@/components/bloom/AddHabitSheet';
import { HabitCard } from '@/components/bloom/HabitCard';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import {
  isHabitCompleteOnDate,
  isHabitScheduledOnDate,
  toLocalDateKey,
} from '@/lib/bloom/habitMetrics';
import { useBloomStore } from '@/lib/bloom/store';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const habits = useBloomStore((state) => state.habits);
  const goal = useBloomStore((state) => state.goal);
  const toggleHabit = useBloomStore((state) => state.toggleHabitForToday);
  const [accent] = useThemeColor(['accent']);
  const today = toLocalDateKey();
  const todaysHabits = habits.filter(
    (habit) => !habit.archivedAt && isHabitScheduledOnDate(habit, today),
  );
  const completedCount = todaysHabits.filter((habit) => isHabitCompleteOnDate(habit, today)).length;
  const progress = todaysHabits.length === 0 ? 0 : completedCount / todaysHabits.length;

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-2xl px-5 pb-32 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-start justify-between">
          <View className="min-w-0 flex-1 pr-4">
            <Typography type="body-xs" className="text-accent mb-2 font-semibold">
              TODAY
            </Typography>
            <Typography type="h1" className="text-foreground text-3xl font-bold">
              {greeting()}
            </Typography>
            {goal?.title ? (
              <Typography type="body" className="text-muted mt-2" numberOfLines={2}>
                One small step toward {goal.title.toLowerCase()}.
              </Typography>
            ) : null}
          </View>
          <View className="bg-accent-soft size-12 items-center justify-center rounded-2xl">
            <Leaf color={accent} size={23} />
          </View>
        </View>

        <View className="bg-foreground mb-8 rounded-3xl p-6">
          <View className="mb-5 flex-row items-end justify-between">
            <View className="gap-1">
              <Typography type="body-xs" className="text-background/70 font-medium">
                TODAY&apos;S PROGRESS
              </Typography>
              <Typography type="h2" className="text-background text-2xl font-bold">
                {completedCount} of {todaysHabits.length} completed
              </Typography>
            </View>
            <Typography type="body" className="text-background font-bold">
              {Math.round(progress * 100)}%
            </Typography>
          </View>
          <View className="bg-background/20 h-2 overflow-hidden rounded-full">
            <Animated.View
              className="bg-accent h-full rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <Typography type="body-xs" className="text-background/70 mt-4">
            {completedCount === todaysHabits.length && todaysHabits.length > 0
              ? 'You showed up for yourself today.'
              : todaysHabits.length === 0
                ? 'A lighter day can be part of a steady rhythm.'
                : 'Steady beats perfect. Keep going at your pace.'}
          </Typography>
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <Typography type="h2" className="text-foreground text-xl font-bold">
            Your habits
          </Typography>
          <Typography type="body-xs" className="text-muted">
            {todaysHabits.length} today
          </Typography>
        </View>

        <View className="gap-3">
          {todaysHabits.map((habit, index) => (
            <Animated.View key={habit.id} entering={FadeInDown.delay(index * 60).duration(280)}>
              <HabitCard
                habit={habit}
                isComplete={isHabitCompleteOnDate(habit, today)}
                onToggle={() => toggleHabit(habit.id)}
                onPress={() => router.push({ pathname: '/habits/[id]', params: { id: habit.id } })}
              />
            </Animated.View>
          ))}
        </View>

        <View className="mt-5">
          <AddHabitSheet />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
