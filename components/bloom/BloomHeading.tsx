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
  hero: 'text-[26px] leading-8',
  title: 'text-[23px] leading-[29px]',
  section: 'text-lg leading-6',
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
