import { View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { Typography, useThemeColor } from 'heroui-native';

import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';

export default function ProgressScreen() {
  const [accent] = useThemeColor(['accent']);
  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <View className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8">
        <Typography type="h1" className="text-foreground text-3xl font-bold">
          Progress
        </Typography>
        <View className="border-border bg-surface mt-8 items-center rounded-3xl border px-7 py-12">
          <View className="bg-accent-soft mb-5 size-14 items-center justify-center rounded-2xl">
            <TrendingUp color={accent} size={25} />
          </View>
          <Typography type="h2" className="text-foreground text-center text-xl font-bold">
            Your progress will grow here
          </Typography>
          <Typography type="body" className="text-muted mt-2 max-w-xs text-center leading-6">
            Keep showing up gently. Reflections and deeper insights will come in a later stage.
          </Typography>
        </View>
      </View>
    </SafeAreaView>
  );
}
