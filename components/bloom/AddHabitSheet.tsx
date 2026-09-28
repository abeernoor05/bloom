import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Button, useThemeColor } from 'heroui-native';

export function AddHabitSheet() {
  const [accent] = useThemeColor(['accent']);
  return (
    <Button
      size="lg"
      variant="secondary"
      className="rounded-2xl"
      onPress={() => router.push('/habits/new')}
    >
      <Plus color={accent} size={20} />
      <Button.Label>Create habit</Button.Label>
    </Button>
  );
}
