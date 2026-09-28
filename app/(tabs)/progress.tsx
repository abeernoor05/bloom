import { router } from 'expo-router';
import { CalendarDays, Check, Leaf, Lightbulb, TrendingUp } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { Button, Card, Typography, useThemeColor } from 'heroui-native';

import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { calculateOverallProgress, type PeriodProgress } from '@/lib/bloom/progressMetrics';
import { useBloomStore } from '@/lib/bloom/store';
import { cn } from '@/lib/utils';

function percent(progress: PeriodProgress): string {
  return progress.rate === undefined ? '—' : `${Math.round(progress.rate * 100)}%`;
}

function PeriodCard({ label, progress }: { label: string; progress: PeriodProgress }) {
  return (
    <Card className="border-border flex-1 rounded-3xl border p-5">
      <Typography type="body-xs" className="text-muted font-semibold">
        {label}
      </Typography>
      <Typography type="h2" className="text-foreground mt-2 text-2xl font-bold">
        {percent(progress)}
      </Typography>
      <Typography type="body-xs" className="text-muted mt-1">
        {progress.scheduled > 0
          ? `${progress.completed} of ${progress.scheduled} completed`
          : 'No scheduled habits'}
      </Typography>
    </Card>
  );
}

export default function ProgressScreen() {
  const habits = useBloomStore((state) => state.habits);
  const hydrationStatus = useBloomStore((state) => state.hydrationStatus);
  const [accent, muted] = useThemeColor(['accent', 'muted']);
  const progress = calculateOverallProgress(habits);

  if (hydrationStatus !== 'ready') {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center" edges={['top']}>
        <Typography type="body" className="text-muted">
          Gathering your progress…
        </Typography>
      </SafeAreaView>
    );
  }

  if (progress.activeHabitCount === 0) {
    return (
      <SafeAreaView className="bg-background flex-1" edges={['top']}>
        <View className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8">
          <Typography type="h1" className="text-foreground text-3xl font-bold">
            Progress
          </Typography>
          <View className="border-border bg-surface mt-8 items-center rounded-3xl border px-7 py-12">
            <View className="bg-accent-soft mb-5 size-14 items-center justify-center rounded-2xl">
              <TrendingUp color={accent} size={25} />
            </View>
            <Typography type="h2" className="text-foreground text-center text-xl font-bold">
              No progress to show yet
            </Typography>
            <Typography type="body" className="text-muted mt-2 max-w-xs text-center leading-6">
              Start with one small habit. Your rhythm will appear here as you track it.
            </Typography>
            <Button className="mt-6" onPress={() => router.push('/habits/new')}>
              <Button.Label>Create habit</Button.Label>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="mx-auto w-full max-w-2xl px-5 pb-32 pt-8"
      >
        <View className="mb-7 flex-row items-center justify-between">
          <View>
            <Typography type="body-xs" className="text-accent mb-2 font-semibold">
              YOUR RHYTHM
            </Typography>
            <Typography type="h1" className="text-foreground text-3xl font-bold">
              Progress
            </Typography>
          </View>
          <View className="bg-accent-soft size-12 items-center justify-center rounded-2xl">
            <TrendingUp color={accent} size={23} />
          </View>
        </View>

        {progress.completedOccurrences === 0 ? (
          <Card className="border-border mb-4 rounded-3xl border p-5">
            <Typography type="h2" className="text-foreground text-lg font-bold">
              Your first check-in is ahead
            </Typography>
            <Typography type="body-sm" className="text-muted mt-2 leading-5">
              Complete a scheduled habit and your progress will begin to take shape.
            </Typography>
          </Card>
        ) : null}

        <Card className="bg-foreground mb-4 rounded-3xl p-6">
          <Typography type="body-xs" className="text-background/70 font-semibold">
            OVERALL COMPLETION
          </Typography>
          <View className="mt-3 flex-row items-end justify-between">
            <Typography type="h1" className="text-background text-4xl font-bold">
              {progress.overallRate === undefined
                ? '—'
                : `${Math.round(progress.overallRate * 100)}%`}
            </Typography>
            <Typography type="body-sm" className="text-background/70 pb-1">
              {progress.activeHabitCount} active habit
              {progress.activeHabitCount === 1 ? '' : 's'}
            </Typography>
          </View>
        </Card>

        <View className="mb-4 flex-row gap-3">
          <PeriodCard label="THIS WEEK" progress={progress.week} />
          <PeriodCard label="THIS MONTH" progress={progress.month} />
        </View>

        <View className="mb-4 flex-row gap-3">
          <Card className="border-border flex-1 rounded-3xl border p-5">
            <Typography type="h2" className="text-foreground text-2xl font-bold">
              {progress.currentStreak}
            </Typography>
            <Typography type="body-xs" className="text-muted mt-1">
              Best active streak
            </Typography>
          </Card>
          <Card className="border-border flex-1 rounded-3xl border p-5">
            <Typography type="h2" className="text-foreground text-2xl font-bold">
              {progress.longestStreak}
            </Typography>
            <Typography type="body-xs" className="text-muted mt-1">
              Longest streak
            </Typography>
          </Card>
        </View>

        <Card className="border-border mb-4 rounded-3xl border p-5">
          <View className="mb-4 flex-row items-center gap-3">
            <CalendarDays color={muted} size={19} />
            <Typography type="h2" className="text-foreground text-lg font-bold">
              Recent history
            </Typography>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {progress.recentDays.map((day) => {
              const complete = day.scheduled > 0 && day.completed === day.scheduled;
              const partial = day.completed > 0 && !complete;
              const date = new Date(`${day.date}T12:00:00`);
              const label = `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${day.scheduled === 0 ? 'nothing scheduled' : `${day.completed} of ${day.scheduled} completed`}`;
              return (
                <View
                  key={day.date}
                  accessibilityLabel={label}
                  className={cn(
                    'size-9 items-center justify-center rounded-xl border',
                    complete
                      ? 'border-accent bg-accent'
                      : partial
                        ? 'border-accent bg-accent-soft'
                        : day.scheduled > 0
                          ? 'border-border bg-background-secondary'
                          : 'bg-background border-transparent',
                  )}
                >
                  {complete ? (
                    <Check color="white" size={15} strokeWidth={3} />
                  ) : (
                    <Typography
                      type="body-xs"
                      className={cn('font-semibold', partial ? 'text-accent' : 'text-muted')}
                    >
                      {date.getDate()}
                    </Typography>
                  )}
                </View>
              );
            })}
          </View>
        </Card>

        {progress.insight ? (
          <Card className="border-border rounded-3xl border p-5">
            <View className="flex-row items-start gap-3">
              <View className="bg-accent-soft size-10 items-center justify-center rounded-2xl">
                <Lightbulb color={accent} size={19} />
              </View>
              <View className="flex-1">
                <Typography type="h2" className="text-foreground text-lg font-bold">
                  A useful pattern
                </Typography>
                <Typography type="body-sm" className="text-muted mt-1 leading-5">
                  {progress.insight}
                </Typography>
              </View>
            </View>
          </Card>
        ) : (
          <Card className="border-border rounded-3xl border p-5">
            <View className="flex-row items-center gap-3">
              <Leaf color={muted} size={19} />
              <Typography type="body-sm" className="text-muted flex-1 leading-5">
                Keep tracking at your pace. A useful pattern will appear when there is enough
                history.
              </Typography>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
