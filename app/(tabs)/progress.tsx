import { useMemo } from 'react';
import { router } from 'expo-router';
import { Card, Chip, Typography, useThemeColor } from 'heroui-native';
import { ChevronRight, Flame, Leaf, Sparkles, Sprout, Target } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import { calculateHabitMetrics } from '@/lib/bloom/habitMetrics';
import { calculateOverallProgress } from '@/lib/bloom/progressMetrics';
import { useBloomStore } from '@/lib/bloom/store';

const percent = (value: number | undefined) => Math.round((value ?? 0) * 100);

export default function ProgressScreen() {
  const habits = useBloomStore((state) => state.habits);
  const [accent, muted] = useThemeColor(['accent', 'muted']);
  const activeHabits = useMemo(() => habits.filter((habit) => !habit.archivedAt), [habits]);
  const progress = useMemo(() => calculateOverallProgress(activeHabits), [activeHabits]);
  const habitMetrics = useMemo(
    () => activeHabits.map((habit) => ({ habit, metrics: calculateHabitMetrics(habit) })),
    [activeHabits],
  );
  const strongest = [...habitMetrics].sort(
    (a, b) => b.metrics.completionRate - a.metrics.completionRate,
  )[0];

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-32 pt-7" showsVerticalScrollIndicator={false}>
        <Typography type="body-sm" className="text-muted mb-1">
          Meaningful, not perfect
        </Typography>
        <BloomHeading level="hero">Your progress</BloomHeading>

        {activeHabits.length === 0 ? (
          <Card className="border-border bg-surface mt-7 rounded-[22px] border p-6">
            <BloomHeading level="section">Your story starts here</BloomHeading>
            <Typography type="body-sm" className="text-muted mt-2">
              Add a habit to begin seeing gentle patterns.
            </Typography>
          </Card>
        ) : (
          <>
            <Card className="bg-accent mt-7 rounded-[26px] border-0 p-6">
              <View className="mb-5 flex-row items-center gap-3">
                <View className="bg-accent-foreground/15 size-10 items-center justify-center rounded-full">
                  <Sprout color="#FFF9EE" size={19} />
                </View>
                <View>
                  <Typography type="body-xs" className="text-accent-foreground/70">
                    THIS WEEK
                  </Typography>
                  <Typography type="h3" className="text-accent-foreground">
                    {percent(progress.week.rate)}% consistency
                  </Typography>
                </View>
              </View>
              <View className="bg-accent-foreground/20 h-2 overflow-hidden rounded-full">
                <View
                  className="bg-accent-foreground h-full rounded-full"
                  style={{ width: `${percent(progress.week.rate)}%` }}
                />
              </View>
              <Typography type="body-sm" className="text-accent-foreground/75 mt-4">
                {progress.week.completed} of {progress.week.scheduled} scheduled moments
              </Typography>
            </Card>

            <View className="mt-4 flex-row gap-3">
              <Card className="border-border bg-surface flex-1 rounded-[22px] border p-4">
                <Flame color={accent} size={20} />
                <Typography type="h3" className="text-foreground mt-3">
                  {progress.longestStreak}
                </Typography>
                <Typography type="body-xs" className="text-muted mt-1">
                  day best rhythm
                </Typography>
              </Card>
              <Card className="border-border bg-surface flex-1 rounded-[22px] border p-4">
                <Target color={accent} size={20} />
                <Typography type="h3" className="text-foreground mt-3">
                  {percent(progress.month.rate)}%
                </Typography>
                <Typography type="body-xs" className="text-muted mt-1">
                  this month
                </Typography>
              </Card>
            </View>

            {strongest ? (
              <Card className="border-sage bg-background-tertiary mt-5 rounded-[22px] border p-5">
                <View className="flex-row items-start gap-3">
                  <Sparkles color={accent} size={19} />
                  <View className="flex-1">
                    <Typography type="body-xs" className="text-terracotta mb-1 font-semibold">
                      A PATTERN TO NOTICE
                    </Typography>
                    <BloomHeading level="section">
                      {strongest.habit.name} is taking root
                    </BloomHeading>
                    <Typography type="body-sm" className="text-muted mt-2 leading-5">
                      You have completed {strongest.metrics.completedCount} scheduled moments. Keep
                      the conditions that made this feel possible.
                    </Typography>
                  </View>
                </View>
              </Card>
            ) : null}

            <View className="mt-8 mb-4">
              <BloomHeading level="section">Habit insights</BloomHeading>
            </View>
            <View className="gap-3">
              {habitMetrics.map(({ habit, metrics }) => (
                <Pressable
                  key={habit.id}
                  onPress={() =>
                    router.push({ pathname: '/habits/[id]', params: { id: habit.id } })
                  }
                  accessibilityRole="button"
                >
                  <Card className="border-border bg-surface flex-row items-center rounded-[20px] border p-4">
                    <View className="bg-accent-soft mr-3 size-10 items-center justify-center rounded-full">
                      <Leaf color={accent} size={17} />
                    </View>
                    <View className="flex-1">
                      <Typography type="body-sm" className="text-foreground font-medium">
                        {habit.name}
                      </Typography>
                      <View className="mt-2 flex-row gap-2">
                        <Chip size="sm" variant="secondary">
                          <Chip.Label>
                            {Math.round(metrics.completionRate * 100)}% overall
                          </Chip.Label>
                        </Chip>
                        <Chip size="sm" variant="secondary">
                          <Chip.Label>{metrics.current} streak</Chip.Label>
                        </Chip>
                      </View>
                    </View>
                    <ChevronRight color={muted} size={18} />
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
