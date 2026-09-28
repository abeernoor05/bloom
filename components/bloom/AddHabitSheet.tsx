import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { BookOpen, Droplets, Footprints, Plus, Sparkles } from 'lucide-react-native';
import {
  BottomSheet,
  Button,
  Input,
  Label,
  TextField,
  Typography,
  useThemeColor,
} from 'heroui-native';

import { useBloomStore } from '@/lib/bloom/store';
import { HABIT_FREQUENCIES, type HabitFrequencyId, type HabitIcon } from '@/lib/bloom/types';
import { cn } from '@/lib/utils';

const ICON_OPTIONS: { id: HabitIcon; label: string; Icon: typeof BookOpen }[] = [
  { id: 'sparkles', label: 'General', Icon: Sparkles },
  { id: 'book', label: 'Learning', Icon: BookOpen },
  { id: 'walk', label: 'Movement', Icon: Footprints },
  { id: 'water', label: 'Water', Icon: Droplets },
];

export function AddHabitSheet() {
  const addHabit = useBloomStore((state) => state.addHabit);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [reminderTime, setReminderTime] = useState('8:00 AM');
  const [frequencyId, setFrequencyId] = useState<HabitFrequencyId>('daily');
  const [icon, setIcon] = useState<HabitIcon>('sparkles');
  const [accent, muted] = useThemeColor(['accent', 'muted']);

  const close = () => setIsOpen(false);
  const save = () => {
    if (name.trim().length < 2) return;
    addHabit({ name, reminderTime, frequencyId, icon });
    setName('');
    setReminderTime('8:00 AM');
    setFrequencyId('daily');
    setIcon('sparkles');
    close();
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
      <BottomSheet.Trigger asChild>
        <Button size="lg" variant="secondary" className="rounded-2xl">
          <Plus color={accent} size={20} />
          <Button.Label>Add habit</Button.Label>
        </Button>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content>
          <View className="mb-6 gap-1">
            <BottomSheet.Title>Start with one small step</BottomSheet.Title>
            <BottomSheet.Description>
              Choose something realistic enough to repeat.
            </BottomSheet.Description>
          </View>

          <View className="gap-5">
            <TextField isRequired>
              <Label>Habit</Label>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="e.g. Stretch for 5 minutes"
                autoFocus
              />
            </TextField>

            <TextField>
              <Label>Reminder</Label>
              <Input
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="e.g. 8:00 AM"
              />
            </TextField>

            <View className="gap-2">
              <Typography type="body-xs" className="text-foreground font-semibold">
                Icon
              </Typography>
              <View className="flex-row gap-2">
                {ICON_OPTIONS.map((option) => {
                  const selected = option.id === icon;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setIcon(option.id)}
                      accessibilityLabel={option.label}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className={cn(
                        'size-12 items-center justify-center rounded-2xl border',
                        selected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
                      )}
                    >
                      <option.Icon color={selected ? accent : muted} size={20} />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="gap-2">
              <Typography type="body-xs" className="text-foreground font-semibold">
                Rhythm
              </Typography>
              <View className="flex-row flex-wrap gap-2">
                {HABIT_FREQUENCIES.map((frequency) => {
                  const selected = frequency.id === frequencyId;
                  return (
                    <Pressable
                      key={frequency.id}
                      onPress={() => setFrequencyId(frequency.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className={cn(
                        'min-h-11 justify-center rounded-full border px-4',
                        selected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
                      )}
                    >
                      <Typography
                        type="body-xs"
                        className={cn(
                          'font-semibold',
                          selected ? 'text-accent-soft-foreground' : 'text-foreground',
                        )}
                      >
                        {frequency.label}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="mt-2 gap-3">
              <Button size="lg" onPress={save} isDisabled={name.trim().length < 2}>
                <Button.Label>Add to today</Button.Label>
              </Button>
              <Button size="lg" variant="ghost" onPress={close}>
                <Button.Label>Not now</Button.Label>
              </Button>
            </View>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
