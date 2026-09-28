import { ArrowLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Typography, useThemeColor } from 'heroui-native';

interface HabitScreenHeaderProps {
  title: string;
  onBack: () => void;
  action?: React.ReactNode;
}

export function HabitScreenHeader({ title, onBack, action }: HabitScreenHeaderProps) {
  const [foreground] = useThemeColor(['foreground']);
  return (
    <View className="mb-7 flex-row items-center gap-3">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        className="border-border bg-surface size-11 items-center justify-center rounded-full border"
      >
        <ArrowLeft color={foreground} size={21} />
      </Pressable>
      <Typography type="h1" className="text-foreground min-w-0 flex-1 text-2xl font-bold">
        {title}
      </Typography>
      {action}
    </View>
  );
}
