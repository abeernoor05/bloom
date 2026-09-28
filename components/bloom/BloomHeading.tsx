import type { ReactNode } from 'react';
import { Typography } from 'heroui-native';

import { cn } from '@/lib/utils';

interface BloomHeadingProps {
  children: ReactNode;
  className?: string;
  level?: 'hero' | 'title' | 'section';
  numberOfLines?: number;
}

const LEVEL_CLASSES = {
  hero: 'text-[32px] leading-[38px]',
  title: 'text-[28px] leading-[34px]',
  section: 'text-xl leading-7',
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
      className={cn('text-foreground font-normal', LEVEL_CLASSES[level], className)}
      numberOfLines={numberOfLines}
      style={{ fontFamily: 'Lora_400Regular' }}
    >
      {children}
    </Typography>
  );
}
