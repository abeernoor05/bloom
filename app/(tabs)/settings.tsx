import { View } from 'react-native';
import { Bell, Cloud, UserRound } from 'lucide-react-native';
import { Card, Typography, useThemeColor } from 'heroui-native';

import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';

const ITEMS = [
  { label: 'Profile', detail: 'Stored on this device', Icon: UserRound },
  { label: 'Reminders', detail: 'Coming in a later stage', Icon: Bell },
  { label: 'Cloud sync', detail: 'Not connected', Icon: Cloud },
];

export default function SettingsScreen() {
  const [muted] = useThemeColor(['muted']);
  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <View className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8">
        <Typography type="h1" className="text-foreground mb-7 text-3xl font-bold">
          Settings
        </Typography>
        <Card className="border-border overflow-hidden rounded-3xl border p-0">
          {ITEMS.map(({ label, detail, Icon }, index) => (
            <View
              key={label}
              className={`min-h-20 flex-row items-center px-5 ${index > 0 ? 'border-border border-t' : ''}`}
            >
              <Icon color={muted} size={21} />
              <View className="ml-4 flex-1 gap-1">
                <Typography type="body" className="text-foreground font-semibold">
                  {label}
                </Typography>
                <Typography type="body-xs" className="text-muted">
                  {detail}
                </Typography>
              </View>
            </View>
          ))}
        </Card>
      </View>
    </SafeAreaView>
  );
}
