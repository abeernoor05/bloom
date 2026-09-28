import { useMemo } from 'react';
import { router } from 'expo-router';
import { Card, Typography, useThemeColor } from 'heroui-native';
import { ChevronRight, Feather, Sunrise } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import { calculateHabitMetrics, dateFromKey } from '@/lib/bloom/habitMetrics';
import { calculateOverallProgress, type ProgressDay } from '@/lib/bloom/progressMetrics';
import { useBloomStore } from '@/lib/bloom/store';

const percent = (value: number | undefined) => Math.round((value ?? 0) * 100);

interface WeekSummary {
  completed: number;
  label: string;
  rate: number | undefined;
  scheduled: number;
}

function summarizeWeeks(days: ProgressDay[]): WeekSummary[] {
  return Array.from({ length: 4 }, (_, index) => {
    const week = days.slice(index * 7, index * 7 + 7);
    const completed = week.reduce((total, day) => total + day.completed, 0);
    const scheduled = week.reduce((total, day) => total + day.scheduled, 0);
    const firstDate = week[0]?.date;

    return {
      completed,
      scheduled,
      rate: scheduled > 0 ? completed / scheduled : undefined,
      label: firstDate
        ? new Intl.DateTimeFormat('en', {
            day: 'numeric',
            ...(index === 0 ? { month: 'short' as const } : {}),
          }).format(dateFromKey(firstDate))
        : '—',
    };
  });
}

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
  const weeks = useMemo(() => summarizeWeeks(progress.recentDays), [progress.recentDays]);
  const fourWeekCompleted = weeks.reduce((total, week) => total + week.completed, 0);
  const fourWeekScheduled = weeks.reduce((total, week) => total + week.scheduled, 0);
  const fourWeekRate = fourWeekScheduled > 0 ? fourWeekCompleted / fourWeekScheduled : undefined;
  const firstWeekRate = weeks[0]?.rate;
  const lastWeekRate = weeks.at(-1)?.rate;
  const comparison =
    firstWeekRate !== undefined && lastWeekRate !== undefined && lastWeekRate > firstWeekRate
      ? `up from ${percent(firstWeekRate)}%`
      : `${fourWeekCompleted} of ${fourWeekScheduled} completed`;

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ScrollView contentContainerClassName="px-6 pb-28 pt-4" showsVerticalScrollIndicator={false}>
        <Typography type="body-xs" className="text-accent-soft-foreground font-semibold">
          YOUR LAST 4 WEEKS
        </Typography>
        <BloomHeading level="hero" className="mt-1">
          Consistency has a shape.
        </BloomHeading>

        {activeHabits.length === 0 ? (
          <Card className="border-border bg-surface mt-6 rounded-[24px] border p-6">
            <BloomHeading level="section">Your story starts here</BloomHeading>
            <Typography type="body-sm" className="text-muted mt-2">
              Add a habit to begin seeing gentle patterns.
            </Typography>
          </Card>
        ) : (
          <>
            <Card
              className="bg-accent mt-5 rounded-[24px] border-0 px-5 py-5"
              style={{ backgroundColor: accent, borderTopRightRadius: 68 }}
            >
              <View className="bg-default mb-4 self-start rounded-full px-3 py-1.5">
                <Typography type="body-xs" className="text-foreground">
                  Showing up
                </Typography>
              </View>

              <View className="flex-row items-end justify-between gap-5">
                <Typography
                  className="text-accent-foreground"
                  style={{ fontFamily: 'Lora_400Regular', fontSize: 38, lineHeight: 46 }}
                >
                  {percent(fourWeekRate)}%
                </Typography>
                <Typography
                  type="body-xs"
                  className="text-accent-foreground mb-1 max-w-[152px] flex-1 text-right leading-4"
                >
                  of planned moments, {comparison}
                </Typography>
              </View>

              <View className="mt-4 h-[120px] flex-row items-end justify-between">
                {weeks.map((week, index) => {
                  const fillHeight = week.rate === undefined ? 6 : Math.max(10, percent(week.rate));
                  return (
                    <View
                      key={week.label}
                      className="h-full w-[52px] items-center justify-end"
                      accessible
                      accessibilityLabel={`${week.label}: ${percent(week.rate)}% complete`}
                    >
                      <View className="bg-accent-foreground/20 h-24 w-[18px] justify-end overflow-hidden rounded-full">
                        <View
                          className={
                            index === weeks.length - 1
                              ? 'bg-accent-foreground w-full rounded-full'
                              : 'bg-accent-foreground/70 w-full rounded-full'
                          }
                          style={{ height: Math.round((fillHeight / 100) * 96) }}
                        />
                      </View>
                      <Typography type="body-xs" className="text-accent-foreground mt-2">
                        {week.label}
                      </Typography>
                    </View>
                  );
                })}
              </View>
            </Card>

            <View className="mt-5">
              <Typography type="body-sm" className="text-foreground font-semibold">
                What your practice is teaching us
              </Typography>
              <View className="bg-border mt-2 h-px" />
            </View>

            <View>
              {habitMetrics.map(({ habit, metrics }, index) => {
                const InsightIcon = index % 2 === 0 ? Sunrise : Feather;
                return (
                  <Pressable
                    key={habit.id}
                    onPress={() =>
                      router.push({ pathname: '/habits/[id]', params: { id: habit.id } })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`View insights for ${habit.name}`}
                  >
                    <View className="border-border flex-row items-start gap-3 border-b py-3">
                      <View
                        className={
                          index % 2 === 0
                            ? 'bg-background-tertiary size-10 items-center justify-center rounded-full'
                            : 'bg-default size-10 items-center justify-center rounded-full'
                        }
                      >
                        <InsightIcon color={accent} size={18} strokeWidth={1.6} />
                      </View>
                      <View className="flex-1">
                        <Typography type="body-sm" className="text-foreground font-medium">
                          {habit.name}
                        </Typography>
                        <Typography type="body-xs" className="text-muted mt-0.5 leading-4">
                          {metrics.completedCount} of {metrics.scheduledCount} scheduled moments
                          completed · {percent(metrics.completionRate)}% overall
                        </Typography>
                      </View>
                      <ChevronRight color={muted} size={17} />
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-5 flex-row items-center gap-3">
              <View className="bg-terracotta size-2.5 rotate-45" />
              <Typography
                className="text-muted flex-1"
                style={{ fontFamily: 'Lora_400Regular', fontSize: 14, lineHeight: 20 }}
              >
                {progress.insight ??
                  (strongest
                    ? `${strongest.habit.name} is taking root. Keep the conditions that made it feel possible.`
                    : 'Each check-in helps your rhythm become clearer.')}
              </Typography>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
