import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Dialog, Typography } from 'heroui-native';

import type { CoachExchange } from '@/lib/bloom/types';

interface CoachExchangeCardProps {
  exchange: CoachExchange;
  onAccept: (exchangeId: string) => void;
  onReject: (exchangeId: string) => void;
}

export function CoachExchangeCard({ exchange, onAccept, onReject }: CoachExchangeCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const recommendation = exchange.recommendation;

  return (
    <Card className="border-border rounded-3xl border p-5">
      <Typography type="body-xs" className="text-muted mb-2 font-medium">
        You asked
      </Typography>
      <Typography type="body-sm" className="text-foreground font-semibold">
        {exchange.question}
      </Typography>
      <View className="bg-accent-soft mt-4 rounded-2xl p-4" accessibilityLiveRegion="polite">
        <Typography type="body-sm" className="text-foreground leading-6">
          {exchange.answer}
        </Typography>
        {exchange.source === 'local' ? (
          <Typography type="body-xs" className="text-muted mt-3">
            Live coaching wasn&apos;t available, so Bloom used your saved habit patterns.
          </Typography>
        ) : null}
      </View>

      {recommendation ? (
        <View className="border-accent/25 mt-4 rounded-2xl border p-4">
          <Typography type="h3" className="text-foreground text-base font-bold">
            {recommendation.title}
          </Typography>
          <Typography type="body-sm" className="text-muted mt-2">
            {recommendation.message}
          </Typography>

          {recommendation.status === 'open' ? (
            <View className="mt-4 gap-2">
              <Dialog isOpen={confirmOpen} onOpenChange={setConfirmOpen}>
                <Dialog.Trigger asChild>
                  <Button size="sm">
                    <Button.Label>{recommendation.actionLabel}</Button.Label>
                  </Button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay />
                  <Dialog.Content className="mx-auto max-w-sm">
                    <Dialog.Close variant="ghost" />
                    <View className="mb-6 gap-2">
                      <Dialog.Title>Try this adjustment?</Dialog.Title>
                      <Dialog.Description>{recommendation.message}</Dialog.Description>
                    </View>
                    <View className="gap-2">
                      <Button
                        onPress={() => {
                          setConfirmOpen(false);
                          onAccept(exchange.id);
                        }}
                      >
                        <Button.Label>{recommendation.actionLabel}</Button.Label>
                      </Button>
                      <Button variant="ghost" onPress={() => setConfirmOpen(false)}>
                        <Button.Label>Cancel</Button.Label>
                      </Button>
                    </View>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog>
              <Button variant="ghost" size="sm" onPress={() => onReject(exchange.id)}>
                <Button.Label>Not now</Button.Label>
              </Button>
            </View>
          ) : (
            <Typography type="body-xs" className="text-muted mt-3 font-medium">
              {recommendation.status === 'accepted' ? 'Adjustment applied' : 'Suggestion declined'}
            </Typography>
          )}
        </View>
      ) : null}
    </Card>
  );
}
