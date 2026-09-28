import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Button, Input, Label, TextField, Typography, useThemeColor } from 'heroui-native';

import { HABIT_ICON_OPTIONS } from '@/components/bloom/habitVisuals';
import type {
  Habit,
  HabitFrequencyId,
  HabitInput,
  HabitScheduleType,
  Weekday,
} from '@/lib/bloom/types';
import { cn } from '@/lib/utils';

const SCHEDULE_OPTIONS: { id: HabitScheduleType; label: string }[] = [
  { id: 'daily', label: 'Every day' },
  { id: 'specific-days', label: 'Specific days' },
  { id: 'weekly-target', label: 'Times per week' },
];

const WEEKDAYS: { id: Weekday; label: string }[] = [
  { id: 1, label: 'M' },
  { id: 2, label: 'T' },
  { id: 3, label: 'W' },
  { id: 4, label: 'T' },
  { id: 5, label: 'F' },
  { id: 6, label: 'S' },
  { id: 0, label: 'S' },
];

function inputFromHabit(habit?: Habit): HabitInput {
  return {
    name: habit?.name ?? '',
    icon: habit?.icon ?? 'sparkles',
    description: habit?.description ?? '',
    reminderEnabled: habit?.reminder.enabled ?? true,
    reminderTime: habit?.reminder.time ?? '8:00 AM',
    frequencyId: habit?.frequency.id ?? 'daily',
    scheduleType: habit?.frequency.scheduleType ?? 'daily',
    daysPerWeek: habit?.frequency.daysPerWeek ?? 3,
    scheduledWeekdays: habit?.frequency.scheduledWeekdays ?? [1, 3, 5],
    target: habit?.target,
  };
}

interface HabitFormProps {
  habit?: Habit;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (input: HabitInput) => void;
}

export function HabitForm({ habit, submitLabel, onCancel, onSubmit }: HabitFormProps) {
  const initial = useMemo(() => inputFromHabit(habit), [habit]);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? '');
  const [icon, setIcon] = useState(initial.icon);
  const [scheduleType, setScheduleType] = useState(initial.scheduleType);
  const [scheduledWeekdays, setScheduledWeekdays] = useState<Weekday[]>(
    initial.scheduledWeekdays ?? [1, 3, 5],
  );
  const [daysPerWeek, setDaysPerWeek] = useState(initial.daysPerWeek);
  const [reminderEnabled, setReminderEnabled] = useState(initial.reminderEnabled);
  const [reminderTime, setReminderTime] = useState(initial.reminderTime);
  const [targetValue, setTargetValue] = useState(initial.target?.value.toString() ?? '');
  const [targetUnit, setTargetUnit] = useState(initial.target?.unit ?? '');
  const [showErrors, setShowErrors] = useState(false);
  const [accent, muted] = useThemeColor(['accent', 'muted']);

  const validName = name.trim().length >= 2;
  const validSchedule = scheduleType !== 'specific-days' || scheduledWeekdays.length > 0;
  const validReminder = !reminderEnabled || reminderTime.trim().length > 0;
  const validTarget =
    targetValue.trim().length === 0 ||
    (Number.isFinite(Number(targetValue)) &&
      Number(targetValue) > 0 &&
      targetUnit.trim().length > 0);
  const isValid = validName && validSchedule && validReminder && validTarget;

  const toggleWeekday = (weekday: Weekday) => {
    setScheduledWeekdays((current) =>
      current.includes(weekday)
        ? current.filter((candidate) => candidate !== weekday)
        : [...current, weekday],
    );
  };

  const save = () => {
    setShowErrors(true);
    if (!isValid) return;
    const selectedDays = scheduleType === 'specific-days' ? scheduledWeekdays : undefined;
    const count =
      scheduleType === 'daily'
        ? 7
        : scheduleType === 'specific-days'
          ? scheduledWeekdays.length
          : daysPerWeek;
    const frequencyId: HabitFrequencyId =
      scheduleType === 'daily' ? 'daily' : count >= 3 ? 'most-days' : 'few-days';
    onSubmit({
      name,
      icon,
      description,
      reminderEnabled,
      reminderTime,
      frequencyId,
      scheduleType,
      daysPerWeek: count,
      scheduledWeekdays: selectedDays,
      target:
        targetValue.trim() && targetUnit.trim()
          ? { value: Number(targetValue), unit: targetUnit.trim() }
          : undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 pb-12"
      >
        <TextField isRequired isInvalid={showErrors && !validName}>
          <Label>Habit name</Label>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="e.g. Read 10 pages"
            autoFocus={!habit}
            returnKeyType="next"
          />
          {showErrors && !validName ? (
            <Typography type="body-xs" className="text-danger mt-1">
              Add a short name for this habit.
            </Typography>
          ) : null}
        </TextField>

        <TextField>
          <Label>Description (optional)</Label>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="A gentle note about this habit"
          />
        </TextField>

        <View className="gap-2">
          <Typography type="body-xs" className="text-foreground font-semibold">
            Icon
          </Typography>
          <View className="flex-row gap-2">
            {HABIT_ICON_OPTIONS.map((option) => {
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

        <View className="gap-3">
          <Typography type="body-xs" className="text-foreground font-semibold">
            Frequency
          </Typography>
          <View className="flex-row flex-wrap gap-2">
            {SCHEDULE_OPTIONS.map((option) => {
              const selected = option.id === scheduleType;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setScheduleType(option.id)}
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
                    {option.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>

          {scheduleType === 'specific-days' ? (
            <View className="mt-1 flex-row justify-between gap-1">
              {WEEKDAYS.map((weekday) => {
                const selected = scheduledWeekdays.includes(weekday.id);
                return (
                  <Pressable
                    key={weekday.id}
                    onPress={() => toggleWeekday(weekday.id)}
                    accessibilityLabel={
                      [
                        'Sunday',
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                      ][weekday.id]
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    className={cn(
                      'size-11 items-center justify-center rounded-full border',
                      selected ? 'border-accent bg-accent' : 'border-border bg-surface',
                    )}
                  >
                    <Typography
                      type="body-xs"
                      className={cn('font-semibold', selected ? 'text-white' : 'text-foreground')}
                    >
                      {weekday.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {scheduleType === 'weekly-target' ? (
            <View className="mt-1 flex-row gap-2">
              {[1, 2, 3, 4, 5, 6].map((count) => {
                const selected = daysPerWeek === count;
                return (
                  <Pressable
                    key={count}
                    onPress={() => setDaysPerWeek(count)}
                    accessibilityLabel={`${count} times per week`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    className={cn(
                      'size-11 items-center justify-center rounded-full border',
                      selected ? 'border-accent bg-accent' : 'border-border bg-surface',
                    )}
                  >
                    <Typography
                      type="body-xs"
                      className={cn('font-semibold', selected ? 'text-white' : 'text-foreground')}
                    >
                      {count}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {showErrors && !validSchedule ? (
            <Typography type="body-xs" className="text-danger">
              Choose at least one day.
            </Typography>
          ) : null}
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Typography type="body-xs" className="text-foreground font-semibold">
              Reminder
            </Typography>
            <Pressable
              onPress={() => setReminderEnabled((current) => !current)}
              accessibilityRole="switch"
              accessibilityState={{ checked: reminderEnabled }}
              className={cn(
                'min-h-11 justify-center rounded-full border px-4',
                reminderEnabled ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
              )}
            >
              <Typography type="body-xs" className="text-foreground font-semibold">
                {reminderEnabled ? 'On' : 'Off'}
              </Typography>
            </Pressable>
          </View>
          {reminderEnabled ? (
            <TextField isRequired isInvalid={showErrors && !validReminder}>
              <Input
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="e.g. 9:00 PM"
              />
            </TextField>
          ) : null}
        </View>

        <View className="gap-3">
          <Typography type="body-xs" className="text-foreground font-semibold">
            Target (optional)
          </Typography>
          <View className="flex-row gap-3">
            <TextField className="flex-1" isInvalid={showErrors && !validTarget}>
              <Input
                value={targetValue}
                onChangeText={setTargetValue}
                placeholder="10"
                keyboardType="decimal-pad"
              />
            </TextField>
            <TextField className="flex-[2]" isInvalid={showErrors && !validTarget}>
              <Input
                value={targetUnit}
                onChangeText={setTargetUnit}
                placeholder="pages, minutes…"
              />
            </TextField>
          </View>
          {showErrors && !validTarget ? (
            <Typography type="body-xs" className="text-danger">
              Add both a positive amount and a unit, or leave both blank.
            </Typography>
          ) : null}
        </View>

        <View className="mt-2 gap-3">
          <Button size="lg" onPress={save}>
            <Button.Label>{submitLabel}</Button.Label>
          </Button>
          <Button size="lg" variant="ghost" onPress={onCancel}>
            <Button.Label>Cancel</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
