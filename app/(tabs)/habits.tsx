import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Button, Card, Chip, Typography, useThemeColor } from 'heroui-native';
import { Archive, ChevronRight, Plus, RotateCcw } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import { BotanicalAccent } from '@/components/bloom/BotanicalAccent';
import { HabitIcon } from '@/components/bloom/habitVisuals';
import { formatFrequency } from '@/lib/bloom/habitMetrics';
import { useBloomStore } from '@/lib/bloom/store';

export default function HabitsScreen() {
  const habits = useBloomStore((state) => state.habits);
  const setHabitArchived = useBloomStore((state) => state.setHabitArchived);
  const [showArchived, setShowArchived] = useState(false);
  const [accent, muted, accentForeground] = useThemeColor(['accent', 'muted', 'accent-foreground']);
  const activeHabits = useMemo(() => habits.filter((habit) => !habit.archivedAt), [habits]);
  const archivedHabits = useMemo(
    () => habits.filter((habit) => Boolean(habit.archivedAt)),
    [habits],
  );

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-32 pt-7" showsVerticalScrollIndicator={false}>
        <View className="mb-7 flex-row items-end justify-between gap-4">
          <View>
            <Typography type="body-sm" className="text-muted mb-1">
              Your growing collection
            </Typography>
            <BloomHeading level="hero">My habits</BloomHeading>
            <BotanicalAccent size="sm" className="mt-1" />
          </View>
          <Button
            isIconOnly
            accessibilityLabel="Add habit"
            onPress={() => router.push('/habits/new')}
          >
            <Plus color={accentForeground} size={20} />
          </Button>
        </View>

        <View className="gap-3">
          {activeHabits.map((habit) => (
            <Pressable
              key={habit.id}
              onPress={() => router.push({ pathname: '/habits/[id]', params: { id: habit.id } })}
              accessibilityRole="button"
              accessibilityLabel={`Open ${habit.name}`}
            >
              <Card className="border-border bg-surface min-h-24 flex-row items-center rounded-[22px] border p-4">
                <View className="bg-background-tertiary mr-4 size-12 items-center justify-center rounded-full">
                  <HabitIcon icon={habit.icon} color={accent} size={21} />
                </View>
                <View className="min-w-0 flex-1 gap-2">
                  <Typography type="body" className="text-foreground font-medium">
                    {habit.name}
                  </Typography>
                  <View className="flex-row flex-wrap gap-2">
                    <Chip size="sm" variant="secondary">
                      <Chip.Label>{formatFrequency(habit)}</Chip.Label>
                    </Chip>
                    {habit.reminder.enabled ? (
                      <Chip size="sm" variant="secondary">
                        <Chip.Label>{habit.reminder.time}</Chip.Label>
                      </Chip>
                    ) : null}
                  </View>
                </View>
                <ChevronRight color={muted} size={19} />
              </Card>
            </Pressable>
          ))}
        </View>

        {activeHabits.length === 0 ? (
          <Card className="border-border bg-surface rounded-[22px] border p-6">
            <BloomHeading level="section">Plant your first habit</BloomHeading>
            <Typography type="body-sm" className="text-muted mt-2 leading-5">
              Start with something small enough to feel kind.
            </Typography>
            <Button className="mt-5" onPress={() => router.push('/habits/new')}>
              <Button.Label>Create a habit</Button.Label>
            </Button>
          </Card>
        ) : null}

        {archivedHabits.length > 0 ? (
          <View className="mt-9">
            <Button
              variant="ghost"
              className="self-start"
              onPress={() => setShowArchived((value) => !value)}
            >
              <Archive size={16} />
              <Button.Label>
                {showArchived ? 'Hide archived' : `Archived (${archivedHabits.length})`}
              </Button.Label>
            </Button>
            {showArchived ? (
              <View className="mt-3 gap-3">
                {archivedHabits.map((habit) => (
                  <Card
                    key={habit.id}
                    className="border-border bg-surface rounded-[20px] border p-4"
                  >
                    <View className="flex-row items-center">
                      <View className="flex-1">
                        <Typography type="body-sm" className="text-foreground font-medium">
                          {habit.name}
                        </Typography>
                        <Typography type="body-xs" className="text-muted mt-1">
                          Archived
                        </Typography>
                      </View>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => setHabitArchived(habit.id, false)}
                      >
                        <RotateCcw size={15} />
                        <Button.Label>Restore</Button.Label>
                      </Button>
                    </View>
                  </Card>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
