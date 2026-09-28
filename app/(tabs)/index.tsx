import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Card, Typography, useThemeColor } from 'heroui-native';
import { MessageCircle, Plus } from 'lucide-react-native';
import { RefreshControl, ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import { BotanicalAccent } from '@/components/bloom/BotanicalAccent';
import {
  CoachingCard,
  CoachingConfirmation,
  ReflectionPromptCard,
} from '@/components/bloom/CoachingCard';
import { HabitCard } from '@/components/bloom/HabitCard';
import { getActiveCoachingSuggestion, getReflectionCandidate } from '@/lib/bloom/coaching';
import { isHabitCompleteOnDate, isHabitScheduledOnDate } from '@/lib/bloom/habitMetrics';
import { toLocalDateKey } from '@/lib/bloom/sampleData';
import { useBloomStore } from '@/lib/bloom/store';
import { cn } from '@/lib/utils';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getWeekDays = (currentDate: Date) => {
  const start = new Date(currentDate);
  const dayOffset = (currentDate.getDay() + 6) % 7;
  start.setDate(currentDate.getDate() - dayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

export default function TodayScreen() {
  const habitsData = useBloomStore((state) => state.habits);
  const reflections = useBloomStore((state) => state.reflections);
  const coachingDecisions = useBloomStore((state) => state.coachingDecisions);
  const toggleHabitForToday = useBloomStore((state) => state.toggleHabitForToday);
  const acceptCoachingSuggestion = useBloomStore((state) => state.acceptCoachingSuggestion);
  const rejectCoachingSuggestion = useBloomStore((state) => state.rejectCoachingSuggestion);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const muted = useThemeColor('muted');
  const currentDate = new Date();
  const today = toLocalDateKey(currentDate);
  const weekDays = getWeekDays(currentDate);
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(currentDate);

  const activeHabits = habitsData.filter((habit) => !habit.archivedAt);
  const habits = activeHabits.filter((habit) => isHabitScheduledOnDate(habit, today));
  const completeCount = habits.filter((habit) => isHabitCompleteOnDate(habit, today)).length;
  const progress = habits.length === 0 ? 0 : completeCount / habits.length;
  const reflectionHabit = getReflectionCandidate(activeHabits, reflections, today);
  const coachingSuggestion = getActiveCoachingSuggestion(
    activeHabits,
    reflections,
    coachingDecisions,
  );

  const refresh = () => {
    setIsRefreshing(true);
    requestAnimationFrame(() => setIsRefreshing(false));
  };
  const handleAcceptSuggestion = () => {
    if (!coachingSuggestion) return;
    setConfirmation(
      acceptCoachingSuggestion(coachingSuggestion) ?? 'Your plan has been gently adjusted.',
    );
  };
  const handleDismissSuggestion = () => {
    if (!coachingSuggestion) return;
    rejectCoachingSuggestion(coachingSuggestion.id);
    setConfirmation('No changes made.');
  };

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ScrollView
        contentContainerClassName="px-5 pb-32 pt-7"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#254D3C" />
        }
      >
        <View className="mb-6 flex-row items-start justify-between gap-4">
          <View className="min-w-0 flex-1">
            <Typography
              type="body-xs"
              className="text-accent mb-1 font-medium"
              style={{ textTransform: 'uppercase' }}
            >
              {dateLabel}
            </Typography>
            <BloomHeading level="hero">{getGreeting()}.</BloomHeading>
            <BotanicalAccent size="sm" className="mt-1" />
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push('/coach')}
              accessibilityRole="button"
              accessibilityLabel="Ask your coach"
              className="border-sage bg-background-tertiary size-11 items-center justify-center rounded-full border"
            >
              <MessageCircle color={muted} size={20} />
            </Pressable>
            <View className="bg-terracotta size-12 items-center justify-center rounded-full">
              <Typography type="h4" className="text-accent-foreground">
                {completeCount}
              </Typography>
            </View>
          </View>
        </View>

        <View className="bg-background-secondary mb-6 flex-row justify-between rounded-[22px] px-3 py-4">
          {weekDays.map((date) => {
            const dateKey = toLocalDateKey(date);
            const isToday = dateKey === today;
            const hasCompletion = activeHabits.some((habit) =>
              isHabitCompleteOnDate(habit, dateKey),
            );

            return (
              <View key={dateKey} className="items-center gap-2">
                <Typography type="body-xs" className={isToday ? 'text-accent' : 'text-muted'}>
                  {new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(date)}
                </Typography>
                <View
                  className={cn(
                    'size-9 items-center justify-center rounded-full',
                    isToday ? 'bg-accent' : 'bg-background',
                  )}
                >
                  <Typography
                    type="body-sm"
                    className={isToday ? 'text-accent-foreground' : 'text-foreground'}
                  >
                    {date.getDate()}
                  </Typography>
                </View>
                <View
                  className={cn(
                    'size-1.5 rounded-full',
                    hasCompletion ? 'bg-terracotta' : 'bg-transparent',
                  )}
                />
              </View>
            );
          })}
        </View>

        <Card className="bg-accent relative mb-7 overflow-hidden rounded-[26px] rounded-tr-[54px] border-0 p-5">
          <BotanicalAccent onDark className="absolute -top-1 -right-1 opacity-20" />
          <View className="flex-row items-end justify-between gap-4">
            <View className="min-w-0 flex-1">
              <View className="bg-background-tertiary mb-3 self-start rounded-full px-3 py-1.5">
                <Typography type="body-xs" className="text-accent font-medium">
                  Today&apos;s rhythm
                </Typography>
              </View>
              <Typography type="h3" className="text-accent-foreground">
                {completeCount} of {habits.length} complete
              </Typography>
              <Typography type="body-sm" className="text-accent-foreground/75 mt-2">
                Small steps are still movement.
              </Typography>
            </View>
            <Typography type="h2" className="text-accent-foreground">
              {Math.round(progress * 100)}%
            </Typography>
          </View>
          <View className="bg-accent-foreground/20 mt-5 h-2 overflow-hidden rounded-full">
            <View
              className="bg-terracotta h-full rounded-full"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </View>
        </Card>

        {confirmation ? <CoachingConfirmation message={confirmation} /> : null}
        {coachingSuggestion ? (
          <CoachingCard
            suggestion={coachingSuggestion}
            onAccept={handleAcceptSuggestion}
            onReject={handleDismissSuggestion}
          />
        ) : null}
        {!coachingSuggestion && reflectionHabit ? (
          <ReflectionPromptCard habit={reflectionHabit} />
        ) : null}

        <View className="mb-4 flex-row items-center justify-between">
          <BloomHeading level="section">Today</BloomHeading>
          <Button size="sm" variant="ghost" onPress={() => router.push('/habits/new')}>
            <Plus size={16} />
            <Button.Label>Add habit</Button.Label>
          </Button>
        </View>

        {habits.length === 0 ? (
          <Card className="border-border bg-surface rounded-[22px] border p-6">
            <BloomHeading level="section">A clear day</BloomHeading>
            <Typography type="body-sm" className="text-muted mt-2 leading-5">
              Nothing is scheduled. Add a habit when you are ready.
            </Typography>
            <Button className="mt-5" onPress={() => router.push('/habits/new')}>
              <Button.Label>Create a habit</Button.Label>
            </Button>
          </Card>
        ) : (
          <View className="gap-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isComplete={isHabitCompleteOnDate(habit, today)}
                onToggle={() => toggleHabitForToday(habit.id)}
                onPress={() => router.push({ pathname: '/habits/[id]', params: { id: habit.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
