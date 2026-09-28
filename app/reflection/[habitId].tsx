import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Input, Label, TextField, Typography } from 'heroui-native';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import { HabitScreenHeader } from '@/components/bloom/HabitScreenHeader';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { toLocalDateKey } from '@/lib/bloom/habitMetrics';
import { useBloomStore } from '@/lib/bloom/store';
import { REFLECTION_REASONS, type ReflectionReason } from '@/lib/bloom/types';
import { goBackOrReplace } from '@/lib/navigation';

function closeReflection() {
  goBackOrReplace('/');
}

export default function ReflectionScreen() {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const habit = useBloomStore((state) =>
    state.habits.find((candidate) => candidate.id === habitId),
  );
  const addReflection = useBloomStore((state) => state.addReflection);
  const [reason, setReason] = useState<ReflectionReason>();
  const [note, setNote] = useState('');

  if (!habit) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center px-6">
        <Typography type="h2" className="text-foreground mb-3 text-center font-bold">
          This check-in is no longer available
        </Typography>
        <Button onPress={closeReflection}>
          <Button.Label>Back to Today</Button.Label>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="mx-auto w-full max-w-2xl flex-grow px-5 pb-10 pt-4"
        >
          <HabitScreenHeader title="Quick reflection" onBack={closeReflection} />

          <View className="mb-8 items-center px-4">
            <View className="bg-background-tertiary mb-4 size-16 items-center justify-center rounded-full">
              <Typography type="h3" className="text-accent">
                B
              </Typography>
            </View>
            <BloomHeading level="hero" className="text-center">
              What got in the way?
            </BloomHeading>
            <Typography type="body" className="text-muted mt-2 text-center">
              Choose what best fits {habit.name.toLowerCase()} this time.
            </Typography>
          </View>

          <View className="mb-5 gap-3" accessibilityRole="radiogroup">
            {REFLECTION_REASONS.map((option) => {
              const selected = reason === option.id;
              return (
                <Button
                  key={option.id}
                  variant={selected ? 'primary' : 'secondary'}
                  onPress={() => setReason(option.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  className="min-h-14 justify-start rounded-2xl"
                >
                  <Button.Label>{option.label}</Button.Label>
                </Button>
              );
            })}
          </View>

          {reason === 'something-else' ? (
            <TextField className="mb-6">
              <Label>A short note (optional)</Label>
              <Input
                value={note}
                onChangeText={setNote}
                placeholder="What made it harder?"
                maxLength={120}
                multiline
              />
            </TextField>
          ) : null}

          <View className="mt-auto pt-4">
            <Button
              size="lg"
              isDisabled={!reason}
              onPress={() => {
                if (!reason) return;
                addReflection({
                  habitId: habit.id,
                  date: toLocalDateKey(),
                  reason,
                  note,
                });
                closeReflection();
              }}
            >
              <Button.Label>Save reflection</Button.Label>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
