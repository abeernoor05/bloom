import { ArrowLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Typography, useThemeColor } from 'heroui-native';

interface HabitScreenHeaderProps {
  title: string;
  onBack: () => void;
  action?: React.ReactNode;
}

export function HabitScreenHeader({ title, onBack, action }: HabitScreenHeaderProps) {
  const [accent] = useThemeColor(['accent']);
  return (
    <View className="mb-7 flex-row items-center gap-3">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        className="bg-surface size-11 items-center justify-center rounded-full active:opacity-70"
      >
        <ArrowLeft color={accent} size={20} strokeWidth={1.8} />
      </Pressable>
      <Typography type="body-sm" className="text-muted min-w-0 flex-1 text-center font-medium">
        {title}
      </Typography>
      {action ?? <View className="size-11" />}
    </View>
  );
}
