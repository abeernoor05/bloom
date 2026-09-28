import { Check, Leaf, RotateCcw, X } from 'lucide-react-native';
import { View } from 'react-native';
import { Button, Card, Typography, useThemeColor } from 'heroui-native';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import type { CoachExchange } from '@/lib/bloom/types';

interface CoachExchangeCardProps {
  exchange: CoachExchange;
  habitName?: string;
  onAccept: (exchangeId: string) => void;
  onReject: (exchangeId: string) => void;
}

export function CoachExchangeCard({
  exchange,
  habitName,
  onAccept,
  onReject,
}: CoachExchangeCardProps) {
  const [accent, muted] = useThemeColor(['accent', 'muted']);
  const isResolved =
    exchange.recommendation?.status === 'accepted' ||
    exchange.recommendation?.status === 'rejected';

  return (
    <View className="gap-3">
      <View className="items-end">
        <View className="bg-accent max-w-[88%] rounded-[20px] rounded-br-md px-4 py-3">
          <Typography type="body-sm" className="text-accent-foreground leading-5">
            {exchange.question}
          </Typography>
        </View>
      </View>

      <Card className="border-border bg-surface rounded-[22px] border p-5">
        <View className="mb-4 flex-row items-center gap-2">
          <View className="bg-accent-soft size-8 items-center justify-center rounded-full">
            <Leaf color={accent} size={15} strokeWidth={1.8} />
          </View>
          <Typography type="body-xs" className="text-muted font-medium">
            Bloom coach
          </Typography>
        </View>
        <Typography type="body-sm" className="text-foreground leading-6">
          {exchange.answer}
        </Typography>

        {exchange.recommendation ? (
          <View className="border-sage bg-background-tertiary mt-5 rounded-2xl border p-4">
            <Typography type="body-xs" className="text-terracotta mb-1 font-semibold">
              A GENTLE ADJUSTMENT
            </Typography>
            <BloomHeading level="section">{exchange.recommendation.title}</BloomHeading>
            <Typography type="body-sm" className="text-muted mt-2 leading-5">
              {exchange.recommendation.message}
            </Typography>
            {habitName ? (
              <Typography type="body-xs" className="text-muted mt-3">
                For {habitName}
              </Typography>
            ) : null}
            {!isResolved ? (
              <View className="mt-4 gap-2">
                <Button className="bg-accent" onPress={() => onAccept(exchange.id)}>
                  <Button.Label className="text-accent-foreground">
                    Try this adjustment
                  </Button.Label>
                </Button>
                <Button
                  variant="tertiary"
                  className="border-accent bg-surface border"
                  onPress={() => onReject(exchange.id)}
                >
                  <Button.Label className="text-accent">Not now</Button.Label>
                </Button>
              </View>
            ) : (
              <View className="mt-4 flex-row items-center gap-2">
                {exchange.recommendation.status === 'accepted' ? (
                  <Check color={accent} size={16} />
                ) : (
                  <X color={muted} size={16} />
                )}
                <Typography type="body-xs" className="text-muted">
                  {exchange.recommendation.status === 'accepted'
                    ? 'Adjustment accepted'
                    : 'Kept as is'}
                </Typography>
              </View>
            )}
          </View>
        ) : null}

        {exchange.source === 'local' ? (
          <View className="mt-4 flex-row items-center gap-2">
            <RotateCcw color={muted} size={14} />
            <Typography type="body-xs" className="text-muted flex-1">
              Local guidance shown while the coach was unavailable.
            </Typography>
          </View>
        ) : null}
      </Card>
    </View>
  );
}
