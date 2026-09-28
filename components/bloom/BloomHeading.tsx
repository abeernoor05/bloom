import type { ReactNode } from 'react';
import { Typography } from 'heroui-native';

import { cn } from '@/lib/utils';

interface BloomHeadingProps {
  children: ReactNode;
  className?: string;
  level?: 'hero' | 'title' | 'section';
  numberOfLines?: number;
}

const LEVEL_STYLES = {
  hero: { fontSize: 20, lineHeight: 25 },
  title: { fontSize: 18, lineHeight: 23 },
  section: { fontSize: 15, lineHeight: 20 },
} as const;

export function BloomHeading({
  children,
  className,
  level = 'title',
  numberOfLines,
}: BloomHeadingProps) {
  return (
    <Typography
      type="h1"
      className={cn('text-foreground font-normal', className)}
      numberOfLines={numberOfLines}
      style={{ fontFamily: 'Lora_400Regular', ...LEVEL_STYLES[level] }}
    >
      {children}
    </Typography>
  );
}
