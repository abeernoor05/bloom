import { View } from 'react-native';

import { Path, Svg } from '@/components/ui/primitives/Svg';
import { cn } from '@/lib/utils';

interface BotanicalAccentProps {
  className?: string;
  onDark?: boolean;
  size?: 'sm' | 'md';
}

const PALETTE = {
  cream: '#FFF9EE',
  forest: '#254D3C',
  sage: '#A9B69A',
  terracotta: '#C96E4B',
} as const;

export function BotanicalAccent({ className, onDark = false, size = 'md' }: BotanicalAccentProps) {
  const width = size === 'sm' ? 48 : 64;
  const height = size === 'sm' ? 24 : 32;
  const stem = onDark ? PALETTE.cream : PALETTE.forest;
  const firstLeaf = onDark ? PALETTE.cream : PALETTE.sage;
  const secondLeaf = onDark ? PALETTE.sage : PALETTE.terracotta;

  return (
    <View
      className={cn('opacity-75', className)}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={width} height={height} viewBox="0 0 64 32" fill="none">
        <Path d="M4 27C18 25 27 18 36 8" stroke={stem} strokeWidth={1.6} strokeLinecap="round" />
        <Path d="M20 21C12 20 9 15 10 10C17 10 22 14 20 21Z" fill={firstLeaf} />
        <Path d="M31 13C30 6 35 2 41 3C42 9 38 14 31 13Z" fill={secondLeaf} />
        <Path d="M13 24C8 24 5 21 5 17C10 17 14 20 13 24Z" fill={secondLeaf} />
      </Svg>
    </View>
  );
}
