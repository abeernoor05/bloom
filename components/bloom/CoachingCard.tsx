import { router } from 'expo-router';
import { Lightbulb, MessageCircle } from 'lucide-react-native';
import { View } from 'react-native';
import { Button, Card, Typography, useThemeColor } from 'heroui-native';

import type { CoachingSuggestion } from '@/lib/bloom/coaching';
import type { Habit } from '@/lib/bloom/types';

interface ReflectionPromptCardProps {
  habit: Habit;
}

export function ReflectionPromptCard({ habit }: ReflectionPromptCardProps) {
  const [accent] = useThemeColor(['accent']);

  return (
    <Card className="border-border mb-6 rounded-3xl border p-5">
      <View className="mb-4 flex-row items-start gap-3">
        <View className="bg-accent-soft size-10 items-center justify-center rounded-2xl">
          <MessageCircle color={accent} size={19} />
        </View>
        <View className="min-w-0 flex-1">
          <Typography type="h3" className="text-foreground text-lg font-bold">
            A quick check-in
          </Typography>
          <Typography type="body-sm" className="text-muted mt-1">
            {habit.name} has been difficult this week. What got in the way?
          </Typography>
        </View>
      </View>
      <Button
        variant="secondary"
        onPress={() =>
          router.push({ pathname: '/reflection/[habitId]', params: { habitId: habit.id } })
        }
      >
        <Button.Label>Reflect</Button.Label>
      </Button>
    </Card>
  );
}

interface CoachingCardProps {
  suggestion: CoachingSuggestion;
  onAccept: () => void;
  onReject: () => void;
}

export function CoachingCard({ suggestion, onAccept, onReject }: CoachingCardProps) {
  const [accent] = useThemeColor(['accent']);

  return (
    <Card className="border-accent/25 bg-accent-soft mb-6 rounded-3xl border p-5">
      <View className="mb-4 flex-row items-start gap-3">
        <View className="bg-surface size-10 items-center justify-center rounded-2xl">
          <Lightbulb color={accent} size={19} />
        </View>
        <View className="min-w-0 flex-1">
          <Typography type="body-xs" className="text-accent mb-1 font-semibold">
            A SMALL ADJUSTMENT
          </Typography>
          <Typography type="h3" className="text-foreground text-lg font-bold">
            {suggestion.title}
          </Typography>
          <Typography type="body-sm" className="text-muted mt-2">
            {suggestion.message}
          </Typography>
        </View>
      </View>
      <View className="gap-2">
        <Button onPress={onAccept}>
          <Button.Label>{suggestion.actionLabel}</Button.Label>
        </Button>
        <Button variant="ghost" onPress={onReject}>
          <Button.Label>Keep it as is</Button.Label>
        </Button>
      </View>
    </Card>
  );
}

export function CoachingConfirmation({ message }: { message: string }) {
  return (
    <Card className="border-accent/25 mb-6 rounded-2xl border px-4 py-3">
      <Typography type="body-sm" className="text-foreground font-medium">
        {message}
      </Typography>
    </Card>
  );
}
