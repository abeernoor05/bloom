import { router } from 'expo-router';
import { Leaf, MessageCircle } from 'lucide-react-native';
import { View } from 'react-native';
import { Button, Card, Typography, useThemeColor } from 'heroui-native';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import type { CoachingSuggestion } from '@/lib/bloom/coaching';
import type { Habit } from '@/lib/bloom/types';

interface ReflectionPromptCardProps {
  habit: Habit;
}

export function ReflectionPromptCard({ habit }: ReflectionPromptCardProps) {
  const [accent] = useThemeColor(['accent']);

  return (
    <Card className="border-border bg-surface mb-6 rounded-[22px] border p-5">
      <View className="mb-4 flex-row items-start gap-3">
        <View className="bg-accent-soft size-10 items-center justify-center rounded-full">
          <MessageCircle color={accent} size={18} strokeWidth={1.8} />
        </View>
        <View className="min-w-0 flex-1">
          <Typography type="body-xs" className="text-terracotta mb-1 font-semibold">
            A QUICK REFLECTION
          </Typography>
          <BloomHeading level="section">What got in the way?</BloomHeading>
          <Typography type="body-sm" className="text-muted mt-2 leading-5">
            {habit.name} has felt difficult this week.
          </Typography>
        </View>
      </View>
      <Button
        onPress={() =>
          router.push({ pathname: '/reflection/[habitId]', params: { habitId: habit.id } })
        }
      >
        <Button.Label>Reflect gently</Button.Label>
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
    <Card className="border-border bg-surface mb-6 rounded-[22px] border p-5">
      <View className="mb-5 flex-row items-start gap-3">
        <View className="bg-accent size-10 items-center justify-center rounded-full">
          <Leaf color="#FFF9EE" size={18} strokeWidth={1.8} />
        </View>
        <View className="min-w-0 flex-1">
          <Typography type="body-xs" className="text-muted mb-1 font-medium">
            An adjustment for you
          </Typography>
          <BloomHeading level="section">{suggestion.title}</BloomHeading>
          <Typography type="body-sm" className="text-muted mt-2 leading-5">
            {suggestion.message}
          </Typography>
        </View>
      </View>
      <View className="bg-accent-soft mb-4 flex-row items-start gap-3 rounded-2xl p-4">
        <Leaf color={accent} size={17} strokeWidth={1.8} />
        <Typography type="body-sm" className="text-accent-soft-foreground flex-1 leading-5">
          A smaller version keeps the cue alive while your routine adapts.
        </Typography>
      </View>
      <View className="gap-2">
        <Button className="bg-accent" onPress={onAccept}>
          <Button.Label className="text-accent-foreground">{suggestion.actionLabel}</Button.Label>
        </Button>
        <Button variant="tertiary" className="border-accent bg-surface border" onPress={onReject}>
          <Button.Label className="text-accent">Keep it as is</Button.Label>
        </Button>
      </View>
    </Card>
  );
}

export function CoachingConfirmation({ message }: { message: string }) {
  return (
    <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Card className="border-accent/25 bg-accent-soft mb-6 rounded-2xl border px-4 py-3">
        <Typography type="body-sm" className="text-accent-soft-foreground font-medium">
          {message}
        </Typography>
      </Card>
    </View>
  );
}
