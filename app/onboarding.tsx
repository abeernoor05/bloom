import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import {
  ArrowLeft,
  Brain,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleDollarSign,
  Dumbbell,
  GraduationCap,
  MoonStar,
  Sparkles,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Button, Input, Label, TextField, Typography, useThemeColor } from 'heroui-native';

import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { useBloomStore } from '@/lib/bloom/store';
import {
  GOAL_CATEGORIES,
  HABIT_FREQUENCIES,
  type GoalCategory,
  type HabitFrequencyId,
} from '@/lib/bloom/types';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = {
  'health-fitness': Dumbbell,
  learning: GraduationCap,
  productivity: BriefcaseBusiness,
  'mental-wellbeing': Brain,
  sleep: MoonStar,
  finance: CircleDollarSign,
  other: Sparkles,
} as const;

const STEP_TITLES = [
  'What do you want to improve?',
  'What would success look like?',
  'How often feels realistic?',
  'A gentle plan to begin',
];

export default function OnboardingScreen() {
  const finishOnboarding = useBloomStore((state) => state.finishOnboarding);
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<GoalCategory | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [frequencyId, setFrequencyId] = useState<HabitFrequencyId | null>(null);
  const [accent, muted, foreground] = useThemeColor(['accent', 'muted', 'foreground']);

  const canContinue =
    (step === 0 && category !== null) ||
    (step === 1 && goalTitle.trim().length >= 3) ||
    (step === 2 && frequencyId !== null) ||
    step === 3;

  const next = () => {
    if (!canContinue) return;
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    if (!category || !frequencyId) return;
    finishOnboarding({ category, goalTitle, frequencyId });
    router.replace('/(tabs)');
  };

  const selectedCategory = GOAL_CATEGORIES.find((item) => item.id === category);
  const selectedFrequency = HABIT_FREQUENCIES.find((item) => item.id === frequencyId);

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="mx-auto w-full max-w-xl flex-1 px-6">
          <View className="h-14 flex-row items-center justify-between">
            {step > 0 ? (
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onPress={() => setStep((current) => current - 1)}
                accessibilityLabel="Go back"
              >
                <ArrowLeft color={foreground} size={21} />
              </Button>
            ) : (
              <View className="size-10" />
            )}
            <Typography type="body-xs" className="text-muted font-semibold">
              {step + 1} of 4
            </Typography>
          </View>

          <View className="bg-default h-1.5 overflow-hidden rounded-full">
            <View
              className="bg-accent h-full rounded-full"
              style={{ width: `${((step + 1) / 4) * 100}%` }}
            />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow py-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              key={step}
              entering={FadeInRight.duration(260)}
              exiting={FadeOutLeft.duration(180)}
              className="flex-1"
            >
              <View className="mb-8 gap-3">
                <View className="bg-accent-soft size-11 items-center justify-center rounded-2xl">
                  <Sparkles color={accent} size={22} />
                </View>
                <Typography type="h1" className="text-foreground text-3xl leading-10 font-bold">
                  {STEP_TITLES[step]}
                </Typography>
                <Typography type="body" className="text-muted max-w-md text-base leading-6">
                  {step === 0 && 'Choose the area where a small, steady change would matter most.'}
                  {step === 1 && 'Keep it personal and specific. You can shape the habits later.'}
                  {step === 2 && 'Consistency grows when your plan leaves room for real life.'}
                  {step === 3 && 'Small enough to begin, meaningful enough to keep going.'}
                </Typography>
              </View>

              {step === 0 && (
                <View className="gap-3">
                  {GOAL_CATEGORIES.map((item) => {
                    const Icon = CATEGORY_ICONS[item.id];
                    const isSelected = category === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setCategory(item.id)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        className={cn(
                          'min-h-16 flex-row items-center rounded-2xl border px-4 active:opacity-80',
                          isSelected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
                        )}
                      >
                        <View className="bg-background-secondary mr-3 size-10 items-center justify-center rounded-xl">
                          <Icon color={isSelected ? accent : muted} size={20} />
                        </View>
                        <Typography type="body" className="text-foreground flex-1 font-semibold">
                          {item.label}
                        </Typography>
                        {isSelected ? (
                          <View className="bg-accent size-6 items-center justify-center rounded-full">
                            <Check color="#FFFFFF" size={15} strokeWidth={3} />
                          </View>
                        ) : (
                          <ChevronRight color={muted} size={18} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {step === 1 && (
                <View className="gap-5">
                  <TextField isRequired>
                    <Label>Your goal</Label>
                    <Input
                      value={goalTitle}
                      onChangeText={setGoalTitle}
                      placeholder="e.g. Feel stronger and more energized"
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={next}
                    />
                  </TextField>
                  <View className="bg-accent-soft rounded-2xl p-5">
                    <Typography type="body" className="text-accent-soft-foreground font-semibold">
                      Start with the life you have now
                    </Typography>
                    <Typography
                      type="body-xs"
                      className="text-accent-soft-foreground mt-2 text-sm leading-5"
                    >
                      A goal becomes sustainable when the first step feels almost too easy.
                    </Typography>
                  </View>
                </View>
              )}

              {step === 2 && (
                <View className="gap-3">
                  {HABIT_FREQUENCIES.map((item) => {
                    const isSelected = frequencyId === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setFrequencyId(item.id)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        className={cn(
                          'min-h-20 flex-row items-center rounded-2xl border px-5 active:opacity-80',
                          isSelected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
                        )}
                      >
                        <View className="flex-1 gap-1">
                          <Typography type="body" className="text-foreground font-semibold">
                            {item.label}
                          </Typography>
                          <Typography type="body-xs" className="text-muted">
                            {item.id === 'daily' && 'Best for tiny habits with a natural daily cue'}
                            {item.id === 'most-days' && 'A steady rhythm with breathing room'}
                            {item.id === 'few-days' && 'A gentle start for busy weeks'}
                          </Typography>
                        </View>
                        <View
                          className={cn(
                            'size-6 items-center justify-center rounded-full border-2',
                            isSelected ? 'border-accent bg-accent' : 'border-border',
                          )}
                        >
                          {isSelected && <Check color="#FFFFFF" size={14} strokeWidth={3} />}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {step === 3 && (
                <View className="border-border bg-surface gap-4 rounded-3xl border p-6">
                  <View className="border-border gap-2 border-b pb-5">
                    <Typography type="body-xs" className="text-muted font-medium">
                      YOUR FOCUS
                    </Typography>
                    <Typography type="h2" className="text-foreground text-2xl font-bold">
                      {goalTitle.trim()}
                    </Typography>
                  </View>
                  <View className="gap-1 py-1">
                    <Typography type="body-xs" className="text-muted font-medium">
                      AREA
                    </Typography>
                    <Typography type="body" className="text-foreground font-semibold">
                      {selectedCategory?.label}
                    </Typography>
                  </View>
                  <View className="gap-1 pt-1">
                    <Typography type="body-xs" className="text-muted font-medium">
                      REALISTIC RHYTHM
                    </Typography>
                    <Typography type="body" className="text-foreground font-semibold">
                      {selectedFrequency?.label}
                    </Typography>
                  </View>
                </View>
              )}
            </Animated.View>
          </ScrollView>

          <View className="pt-4 pb-2">
            <Button size="lg" onPress={next} isDisabled={!canContinue}>
              <Button.Label>{step === 3 ? 'Begin gently' : 'Continue'}</Button.Label>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
