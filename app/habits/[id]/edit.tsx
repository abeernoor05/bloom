import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { HabitForm } from '@/components/bloom/HabitForm';
import { HabitScreenHeader } from '@/components/bloom/HabitScreenHeader';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { useBloomStore } from '@/lib/bloom/store';
import { goBackOrReplace } from '@/lib/navigation';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useBloomStore((state) => state.habits.find((candidate) => candidate.id === id));
  const updateHabit = useBloomStore((state) => state.updateHabit);
  const back = () => goBackOrReplace({ pathname: '/habits/[id]', params: { id } });

  useEffect(() => {
    if (!habit) goBackOrReplace('/habits');
  }, [habit]);

  if (!habit) {
    return null;
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="mx-auto w-full max-w-2xl flex-1 px-5 pt-4">
        <HabitScreenHeader title="Edit habit" onBack={back} />
        <HabitForm
          habit={habit}
          submitLabel="Save changes"
          onCancel={back}
          onSubmit={(input) => {
            updateHabit(habit.id, input);
            back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
