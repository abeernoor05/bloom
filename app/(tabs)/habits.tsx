import { ScrollView, View } from 'react-native';
import { BookOpen, Droplets, Footprints, Sparkles } from 'lucide-react-native';
import { Card, Typography, useThemeColor } from 'heroui-native';

import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { useBloomStore } from '@/lib/bloom/store';

const ICONS = { book: BookOpen, walk: Footprints, water: Droplets, sparkles: Sparkles } as const;

export default function HabitsScreen() {
  const habits = useBloomStore((state) => state.habits);
  const [accent] = useThemeColor(['accent']);

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ScrollView contentContainerClassName="mx-auto w-full max-w-2xl px-5 pb-28 pt-8">
        <Typography type="h1" className="text-foreground mb-7 text-3xl font-bold">
          Habits
        </Typography>
        <View className="gap-3">
          {habits.map((habit) => {
            const Icon = ICONS[habit.icon];
            return (
              <Card key={habit.id} className="border-border rounded-3xl border p-5">
                <View className="flex-row items-center">
                  <View className="bg-accent-soft mr-4 size-11 items-center justify-center rounded-2xl">
                    <Icon color={accent} size={20} />
                  </View>
                  <View className="flex-1 gap-1">
                    <Typography type="body" className="text-foreground font-semibold">
                      {habit.name}
                    </Typography>
                    <Typography type="body-xs" className="text-muted">
                      {habit.reminder.time}
                    </Typography>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
