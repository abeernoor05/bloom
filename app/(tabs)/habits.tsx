import { router } from 'expo-router';
import { Check, ChevronRight, Flame, Sprout } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { Card, Typography, useThemeColor } from 'heroui-native';

import { AddHabitSheet } from '@/components/bloom/AddHabitSheet';
import { HABIT_ICONS } from '@/components/bloom/habitVisuals';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import {
  calculateHabitMetrics,
  formatFrequency,
  isHabitCompleteOnDate,
  toLocalDateKey,
} from '@/lib/bloom/habitMetrics';
import { useBloomStore } from '@/lib/bloom/store';

export default function HabitsScreen() {
  const habits = useBloomStore((state) => state.habits);
  const [accent, muted] = useThemeColor(['accent', 'muted']);
  const today = toLocalDateKey();
  const activeHabits = habits.filter((habit) => !habit.archivedAt);
  const archivedHabits = habits.filter((habit) => habit.archivedAt);

  const habitRow = (habit: (typeof habits)[number]) => {
    const Icon = HABIT_ICONS[habit.icon];
    const metrics = calculateHabitMetrics(habit);
    const complete = isHabitCompleteOnDate(habit, today);
    return (
      <Pressable
        key={habit.id}
        onPress={() => router.push({ pathname: '/habits/[id]', params: { id: habit.id } })}
        accessibilityRole="button"
        accessibilityLabel={`View ${habit.name}`}
      >
        <Card className="border-border rounded-3xl border p-5">
          <View className="flex-row items-center">
            <View className="bg-accent-soft mr-4 size-12 items-center justify-center rounded-2xl">
              <Icon color={accent} size={21} />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Typography type="body" className="text-foreground font-semibold" numberOfLines={1}>
                {habit.name}
              </Typography>
              <Typography type="body-xs" className="text-muted" numberOfLines={1}>
                {formatFrequency(habit)} ·{' '}
                {habit.reminder.enabled ? habit.reminder.time : 'No reminder'}
              </Typography>
              <View className="mt-1 flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Flame color={muted} size={13} />
                  <Typography type="body-xs" className="text-muted">
                    {metrics.current} streak
                  </Typography>
                </View>
                {complete ? (
                  <View className="flex-row items-center gap-1">
                    <Check color={accent} size={13} />
                    <Typography type="body-xs" className="text-accent font-semibold">
                      Done today
                    </Typography>
                  </View>
                ) : null}
              </View>
            </View>
            <ChevronRight color={muted} size={19} />
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="mx-auto w-full max-w-2xl px-5 pb-28 pt-8"
      >
        <View className="mb-7 flex-row items-center justify-between gap-4">
          <Typography type="h1" className="text-foreground text-3xl font-bold">
            Habits
          </Typography>
          <AddHabitSheet />
        </View>

        {activeHabits.length > 0 ? (
          <View className="gap-3">{activeHabits.map(habitRow)}</View>
        ) : (
          <Card className="border-border items-center rounded-3xl border p-7">
            <View className="bg-accent-soft mb-4 size-14 items-center justify-center rounded-3xl">
              <Sprout color={accent} size={25} />
            </View>
            <Typography type="h2" className="text-foreground text-center text-xl font-bold">
              Start with one small habit
            </Typography>
            <View className="mt-5 w-full">
              <AddHabitSheet />
            </View>
          </Card>
        )}

        {archivedHabits.length > 0 ? (
          <View className="mt-9 gap-3">
            <Typography type="h2" className="text-foreground text-lg font-bold">
              Inactive
            </Typography>
            {archivedHabits.map(habitRow)}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
