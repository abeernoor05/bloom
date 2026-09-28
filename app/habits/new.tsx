import { router } from 'expo-router';
import { View } from 'react-native';
import { Typography } from 'heroui-native';

import { HabitForm } from '@/components/bloom/HabitForm';
import { HabitScreenHeader } from '@/components/bloom/HabitScreenHeader';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { useBloomStore } from '@/lib/bloom/store';
import { goBackOrReplace } from '@/lib/navigation';

function backToHabits() {
  goBackOrReplace('/habits');
}

export default function NewHabitScreen() {
  const addHabit = useBloomStore((state) => state.addHabit);

  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="mx-auto w-full max-w-2xl flex-1 px-5 pt-4">
        <HabitScreenHeader title="Create habit" onBack={backToHabits} />
        <Typography type="body" className="text-muted mb-6">
          Make it small enough to fit into real life.
        </Typography>
        <HabitForm
          submitLabel="Create habit"
          onCancel={backToHabits}
          onSubmit={(input) => {
            const id = addHabit(input);
            router.replace({ pathname: '/habits/[id]', params: { id } });
          }}
        />
      </View>
    </SafeAreaView>
  );
}
