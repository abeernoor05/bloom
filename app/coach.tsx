import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Card, Label, Spinner, TextArea, TextField, Typography } from 'heroui-native';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import { BotanicalAccent } from '@/components/bloom/BotanicalAccent';
import { CoachExchangeCard } from '@/components/bloom/CoachExchangeCard';
import { HabitScreenHeader } from '@/components/bloom/HabitScreenHeader';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { requestCoach } from '@/lib/bloom/aiCoach';
import { useBloomStore } from '@/lib/bloom/store';
import { goBackOrReplace } from '@/lib/navigation';

function closeCoach() {
  goBackOrReplace('/');
}

export default function CoachScreen() {
  const coachExchanges = useBloomStore((state) => state.coachExchanges);
  const recordCoachExchange = useBloomStore((state) => state.recordCoachExchange);
  const acceptRecommendation = useBloomStore((state) => state.acceptCoachRecommendation);
  const rejectRecommendation = useBloomStore((state) => state.rejectCoachRecommendation);
  const [question, setQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string>();

  const submitQuestion = async () => {
    const trimmed = question.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    setFeedback(undefined);
    try {
      const result = await requestCoach(trimmed, useBloomStore.getState());
      recordCoachExchange(trimmed, result);
      setQuestion('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView className="bg-background flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="mx-auto w-full max-w-2xl flex-grow px-5 pb-12 pt-4"
        >
          <HabitScreenHeader title="Coach" onBack={closeCoach} />

          <View className="mb-7 items-center px-5 text-center">
            <View className="bg-background-tertiary mb-4 size-16 items-center justify-center rounded-full">
              <Typography type="h3" className="text-accent">
                B
              </Typography>
            </View>
            <BloomHeading level="hero" className="text-center">
              Your Bloom coach
            </BloomHeading>
            <BotanicalAccent size="sm" className="mt-1" />
            <Typography type="body-sm" className="text-muted mt-2 text-center">
              Ask for a small, realistic next step.
            </Typography>
          </View>

          <Card className="border-border bg-surface mb-5 rounded-[24px] border p-5">
            <BloomHeading level="section">Ask about your habits</BloomHeading>
            <TextField className="mt-5" isDisabled={isSending}>
              <Label>What would you like help with?</Label>
              <TextArea
                value={question}
                onChangeText={setQuestion}
                placeholder="How can I make my routine easier to keep?"
                maxLength={500}
                className="min-h-28"
              />
            </TextField>
            <Typography type="body-xs" className="text-muted mt-3">
              Bloom sends your question and a short habit summary for this reply. Reflection notes
              stay on this device.
            </Typography>
            <Button
              className="mt-5"
              size="lg"
              isDisabled={isSending || question.trim().length === 0}
              onPress={() => void submitQuestion()}
              accessibilityLabel={isSending ? 'Getting coaching response' : 'Ask your coach'}
            >
              {isSending ? <Spinner size="sm" color="currentColor" /> : null}
              <Button.Label>{isSending ? 'Thinking…' : 'Ask coach'}</Button.Label>
            </Button>
          </Card>

          {feedback ? (
            <Card
              className="border-accent/25 mb-5 rounded-2xl border px-4 py-3"
              accessibilityLiveRegion="polite"
            >
              <Typography type="body-sm" className="text-foreground font-medium">
                {feedback}
              </Typography>
            </Card>
          ) : null}

          <BloomHeading level="section" className="mb-4">
            Recent conversations
          </BloomHeading>
          {coachExchanges.length === 0 ? (
            <Card className="border-border bg-surface rounded-[22px] border p-5">
              <Typography type="body-sm" className="text-muted">
                Your coaching replies will appear here.
              </Typography>
            </Card>
          ) : (
            <View className="gap-4">
              {coachExchanges.slice(0, 10).map((exchange) => (
                <CoachExchangeCard
                  key={exchange.id}
                  exchange={exchange}
                  onAccept={(exchangeId) => {
                    const message = acceptRecommendation(exchangeId);
                    if (message) setFeedback(message);
                  }}
                  onReject={(exchangeId) => {
                    rejectRecommendation(exchangeId);
                    setFeedback('Suggestion declined. Your habit was not changed.');
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
