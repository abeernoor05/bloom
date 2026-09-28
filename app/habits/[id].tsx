import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Archive,
  Bell,
  CalendarDays,
  Lightbulb,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { Button, Card, Dialog, Typography, useThemeColor } from 'heroui-native';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import { HabitScreenHeader } from '@/components/bloom/HabitScreenHeader';
import { HabitIcon } from '@/components/bloom/habitVisuals';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { buildHabitInsights } from '@/lib/bloom/coaching';
import {
  calculateHabitMetrics,
  formatFrequency,
  isHabitCompleteOnDate,
  isHabitScheduledOnDate,
  recentDateKeys,
} from '@/lib/bloom/habitMetrics';
import { useBloomStore } from '@/lib/bloom/store';
import { goBackOrReplace } from '@/lib/navigation';
import { cn } from '@/lib/utils';

function shortDate(dateKey: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(`${dateKey}T12:00:00`),
  );
}

function backToHabits() {
  goBackOrReplace('/habits');
}

export default function HabitDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useBloomStore((state) => state.habits.find((candidate) => candidate.id === id));
  const setHabitArchived = useBloomStore((state) => state.setHabitArchived);
  const deleteHabit = useBloomStore((state) => state.deleteHabit);
  const reflections = useBloomStore((state) => state.reflections);
  const adjustments = useBloomStore((state) => state.adjustments);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [accent, muted, foreground] = useThemeColor(['accent', 'muted', 'foreground']);

  if (!habit) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center px-6">
        <Typography type="h2" className="text-foreground mb-3 text-center font-bold">
          This habit is no longer here
        </Typography>
        <Button onPress={backToHabits}>
          <Button.Label>Back to habits</Button.Label>
        </Button>
      </SafeAreaView>
    );
  }

  const metrics = calculateHabitMetrics(habit);
  const recentDates = recentDateKeys(21);
  const insights = buildHabitInsights(habit, reflections, adjustments);

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="mx-auto w-full max-w-2xl px-5 pb-12 pt-4"
      >
        <HabitScreenHeader
          title="Habit details"
          onBack={backToHabits}
          action={
            <Pressable
              onPress={() =>
                router.push({ pathname: '/habits/[id]/edit', params: { id: habit.id } })
              }
              accessibilityRole="button"
              accessibilityLabel={`Edit ${habit.name}`}
              className="border-border bg-surface size-11 items-center justify-center rounded-full border"
            >
              <Pencil color={foreground} size={19} />
            </Pressable>
          }
        />

        <View className="mb-7 items-center">
          <View className="bg-background-tertiary mb-4 size-20 items-center justify-center rounded-full">
            <HabitIcon icon={habit.icon} color={accent} size={31} />
          </View>
          <BloomHeading level="hero" className="text-center">
            {habit.name}
          </BloomHeading>
          {habit.description ? (
            <Typography type="body" className="text-muted mt-2 text-center">
              {habit.description}
            </Typography>
          ) : null}
          {habit.archivedAt ? (
            <View className="bg-background-secondary mt-3 rounded-full px-3 py-1.5">
              <Typography type="body-xs" className="text-muted font-semibold">
                Inactive
              </Typography>
            </View>
          ) : null}
        </View>

        <View className="mb-4 flex-row gap-3">
          <Card className="border-border flex-1 rounded-[22px] border p-4">
            <Typography type="h2" className="text-foreground text-xl font-bold">
              {metrics.current}
            </Typography>
            <Typography type="body-xs" className="text-muted mt-1">
              Current streak
            </Typography>
          </Card>
          <Card className="border-border flex-1 rounded-[22px] border p-4">
            <Typography type="h2" className="text-foreground text-xl font-bold">
              {metrics.best}
            </Typography>
            <Typography type="body-xs" className="text-muted mt-1">
              Longest streak
            </Typography>
          </Card>
          <Card className="border-border flex-1 rounded-[22px] border p-4">
            <Typography type="h2" className="text-foreground text-xl font-bold">
              {metrics.scheduledCount > 0 ? `${Math.round(metrics.completionRate * 100)}%` : '—'}
            </Typography>
            <Typography type="body-xs" className="text-muted mt-1">
              Completion
            </Typography>
          </Card>
        </View>

        <View className="mb-4 flex-row gap-3">
          <Card className="border-border flex-1 rounded-[22px] border p-4">
            <Typography type="h2" className="text-foreground text-xl font-bold">
              {metrics.completedCount}
            </Typography>
            <Typography type="body-xs" className="text-muted mt-1">
              Completed occurrences
            </Typography>
          </Card>
          <Card className="border-border flex-1 rounded-[22px] border p-4">
            <Typography type="h2" className="text-foreground text-xl font-bold">
              {adjustments.filter((adjustment) => adjustment.habitId === habit.id).length}
            </Typography>
            <Typography type="body-xs" className="text-muted mt-1">
              Helpful adjustments
            </Typography>
          </Card>
        </View>

        <Card className="border-border mb-4 rounded-[22px] border p-5">
          <Typography type="h2" className="text-foreground mb-4 text-lg font-bold">
            Recent rhythm
          </Typography>
          <View className="flex-row flex-wrap gap-x-3 gap-y-4">
            {recentDates.map((date) => {
              const complete = isHabitCompleteOnDate(habit, date);
              const scheduled = isHabitScheduledOnDate(habit, date);
              return (
                <View key={date} className="w-9 items-center gap-1.5">
                  <View
                    accessibilityLabel={`${shortDate(date)}: ${complete ? 'completed' : scheduled ? 'scheduled' : 'not scheduled'}`}
                    className={cn(
                      'size-8 items-center justify-center rounded-full border',
                      complete
                        ? 'border-accent bg-accent'
                        : scheduled
                          ? 'border-accent/40 bg-accent-soft'
                          : 'border-border bg-background-secondary',
                    )}
                  >
                    <Typography
                      type="body-xs"
                      className={cn(
                        'font-semibold',
                        complete
                          ? 'text-accent-foreground'
                          : scheduled
                            ? 'text-accent'
                            : 'text-muted',
                      )}
                    >
                      {new Date(`${date}T12:00:00`).getDate()}
                    </Typography>
                  </View>
                  <Typography type="body-xs" className="text-muted text-[10px]">
                    {new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(
                      new Date(`${date}T12:00:00`),
                    )}
                  </Typography>
                </View>
              );
            })}
          </View>
        </Card>

        {insights.length > 0 ? (
          <Card className="border-border mb-4 rounded-[22px] border p-5">
            <View className="mb-4 flex-row items-center gap-3">
              <View className="bg-accent-soft size-9 items-center justify-center rounded-2xl">
                <Lightbulb color={accent} size={18} />
              </View>
              <Typography type="h2" className="text-foreground text-lg font-bold">
                Insights
              </Typography>
            </View>
            <View className="gap-3">
              {insights.map((insight) => (
                <View key={insight.id} className="flex-row items-start gap-3">
                  <View className="bg-accent mt-2 size-1.5 rounded-full" />
                  <Typography type="body-sm" className="text-muted flex-1">
                    {insight.text}
                  </Typography>
                </View>
              ))}
            </View>
          </Card>
        ) : (
          <Card className="border-border mb-4 rounded-[22px] border p-5">
            <View className="mb-3 flex-row items-center gap-3">
              <View className="bg-accent-soft size-9 items-center justify-center rounded-2xl">
                <Lightbulb color={accent} size={18} />
              </View>
              <Typography type="h2" className="text-foreground text-lg font-bold">
                Insights
              </Typography>
            </View>
            <Typography type="body-sm" className="text-muted">
              Keep checking in. A useful pattern will appear here when there is enough history.
            </Typography>
          </Card>
        )}

        <Card className="border-border mb-7 rounded-[22px] border p-5">
          <View className="mb-4 flex-row items-center gap-3">
            <CalendarDays color={muted} size={19} />
            <View className="flex-1">
              <Typography type="body-xs" className="text-muted">
                Schedule
              </Typography>
              <Typography type="body" className="text-foreground font-semibold">
                {formatFrequency(habit)}
              </Typography>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <Bell color={muted} size={19} />
            <View className="flex-1">
              <Typography type="body-xs" className="text-muted">
                Reminder
              </Typography>
              <Typography type="body" className="text-foreground font-semibold">
                {habit.reminder.enabled ? habit.reminder.time : 'Off'}
              </Typography>
            </View>
          </View>
          {habit.target ? (
            <Typography type="body-xs" className="text-muted mt-4">
              Target: {habit.target.value} {habit.target.unit}
            </Typography>
          ) : null}
        </Card>

        <View className="gap-3">
          <Button
            size="lg"
            variant="secondary"
            onPress={() => {
              setHabitArchived(habit.id, !habit.archivedAt);
              backToHabits();
            }}
          >
            {habit.archivedAt ? (
              <RotateCcw color={accent} size={19} />
            ) : (
              <Archive color={accent} size={19} />
            )}
            <Button.Label>{habit.archivedAt ? 'Make active' : 'Archive habit'}</Button.Label>
          </Button>

          <Dialog isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
            <Dialog.Trigger asChild>
              <Button size="lg" variant="ghost">
                <Trash2 color={muted} size={19} />
                <Button.Label>Delete permanently</Button.Label>
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay />
              <Dialog.Content>
                <Dialog.Close />
                <View className="mb-6 gap-2 pr-8">
                  <Dialog.Title>Delete this habit?</Dialog.Title>
                  <Dialog.Description>
                    Its completion history will also be removed. Archiving is the gentler option if
                    you may want it later.
                  </Dialog.Description>
                </View>
                <View className="gap-3">
                  <Button
                    onPress={() => {
                      deleteHabit(habit.id);
                      setDeleteOpen(false);
                      router.replace('/habits');
                    }}
                  >
                    <Button.Label>Delete permanently</Button.Label>
                  </Button>
                  <Button variant="ghost" onPress={() => setDeleteOpen(false)}>
                    <Button.Label>Keep habit</Button.Label>
                  </Button>
                </View>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
