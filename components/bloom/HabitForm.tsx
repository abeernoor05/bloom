import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Bell, CalendarDays, Check, Leaf, Target } from 'lucide-react-native';
import { Button, Input, Label, Switch, Typography, useThemeColor } from 'heroui-native';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import { HabitIcon } from '@/components/bloom/habitVisuals';
import {
  getNotificationAvailability,
  requestNotificationPermission,
} from '@/lib/bloom/notifications';
import { normalizeReminderTime } from '@/lib/bloom/reminderTime';
import {
  HABIT_FREQUENCIES,
  type Habit,
  type HabitFrequencyId,
  type HabitIcon as HabitIconName,
  type HabitInput,
  type HabitScheduleType,
  type Weekday,
} from '@/lib/bloom/types';
import { cn } from '@/lib/utils';

interface HabitFormProps {
  habit?: Habit;
  submitLabel: string;
  onSubmit: (input: HabitInput) => void;
  onCancel?: () => void;
}

const ICONS: HabitIconName[] = ['book', 'walk', 'water', 'sparkles'];
const WEEKDAYS: { value: Weekday; label: string; name: string }[] = [
  { value: 1, label: 'M', name: 'Monday' },
  { value: 2, label: 'T', name: 'Tuesday' },
  { value: 3, label: 'W', name: 'Wednesday' },
  { value: 4, label: 'T', name: 'Thursday' },
  { value: 5, label: 'F', name: 'Friday' },
  { value: 6, label: 'S', name: 'Saturday' },
  { value: 0, label: 'S', name: 'Sunday' },
];

export function HabitForm({ habit, submitLabel, onSubmit, onCancel }: HabitFormProps) {
  const [accent, muted] = useThemeColor(['accent', 'muted']);
  const [name, setName] = useState(habit?.name ?? '');
  const [icon, setIcon] = useState<HabitIconName>(habit?.icon ?? 'sparkles');
  const [frequencyId, setFrequencyId] = useState<HabitFrequencyId>(habit?.frequency.id ?? 'daily');
  const [scheduleType, setScheduleType] = useState<HabitScheduleType>(
    habit?.frequency.scheduleType ?? 'daily',
  );
  const [scheduledWeekdays, setScheduledWeekdays] = useState<Weekday[]>(
    habit?.frequency.scheduledWeekdays ?? [1, 2, 3, 4, 5],
  );
  const [reminderEnabled, setReminderEnabled] = useState(habit?.reminder.enabled ?? false);
  const [reminderTime, setReminderTime] = useState(habit?.reminder.time ?? '8:00 AM');
  const [targetValue, setTargetValue] = useState(habit?.target ? String(habit.target.value) : '');
  const [targetUnit, setTargetUnit] = useState(habit?.target?.unit ?? 'minutes');
  const [error, setError] = useState<string>();
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  const selectFrequency = (id: HabitFrequencyId) => {
    const frequency = HABIT_FREQUENCIES.find((item) => item.id === id)!;
    setFrequencyId(id);
    setScheduleType(id === 'daily' ? 'daily' : 'weekly-target');
    if (id !== 'daily' && scheduledWeekdays.length > 0) setScheduledWeekdays([]);
    if (frequency.daysPerWeek === 7) setScheduledWeekdays([]);
  };

  const toggleDay = (day: Weekday) => {
    setScheduleType('specific-days');
    setScheduledWeekdays((days) =>
      days.includes(day) ? days.filter((value) => value !== day) : [...days, day],
    );
  };

  const toggleReminder = async (next: boolean) => {
    if (!next) {
      setReminderEnabled(false);
      setError(undefined);
      return;
    }
    setIsCheckingPermission(true);
    try {
      const availability = await getNotificationAvailability();
      const result = availability === 'granted' ? 'granted' : await requestNotificationPermission();
      if (result !== 'granted') {
        setError(
          result === 'unavailable'
            ? 'Reminders are available in the iOS and Android app.'
            : 'Allow notifications in device settings to turn on this reminder.',
        );
        return;
      }
      setReminderEnabled(true);
      setError(undefined);
    } catch {
      setError('Reminder permission could not be checked. Try again.');
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const submit = () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError('Give your habit a short name.');
      return;
    }
    if (scheduleType === 'specific-days' && scheduledWeekdays.length === 0) {
      setError('Choose at least one day.');
      return;
    }
    const normalizedTime = normalizeReminderTime(reminderTime);
    if (reminderEnabled && !normalizedTime) {
      setError('Use a time such as 8:00 AM.');
      return;
    }
    const value = targetValue.trim() ? Number(targetValue) : undefined;
    if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
      setError('Enter a positive target.');
      return;
    }
    const frequency = HABIT_FREQUENCIES.find((item) => item.id === frequencyId)!;
    setError(undefined);
    onSubmit({
      name: trimmedName,
      icon,
      reminderEnabled,
      reminderTime: normalizedTime ?? reminderTime,
      frequencyId,
      scheduleType,
      daysPerWeek:
        scheduleType === 'specific-days' ? scheduledWeekdays.length : frequency.daysPerWeek,
      scheduledWeekdays: scheduleType === 'specific-days' ? scheduledWeekdays : undefined,
      target: value === undefined ? undefined : { value, unit: targetUnit.trim() || 'times' },
    });
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-7 pb-12"
    >
      <View className="items-center gap-3">
        <View className="bg-background-tertiary size-20 items-center justify-center rounded-full">
          <HabitIcon icon={icon} color={accent} size={31} strokeWidth={1.6} />
        </View>
        <BloomHeading level="section">Shape your habit</BloomHeading>
      </View>

      <View className="gap-3">
        <Label>Habit name</Label>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="e.g. Read for 10 minutes"
          autoCapitalize="sentences"
        />
      </View>

      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Leaf color={accent} size={17} />
          <Label>Choose an icon</Label>
        </View>
        <View className="flex-row gap-3">
          {ICONS.map((option) => {
            const selected = icon === option;
            return (
              <Pressable
                key={option}
                onPress={() => setIcon(option)}
                accessibilityRole="radio"
                accessibilityLabel={`${option} icon`}
                accessibilityState={{ selected }}
                className={cn(
                  'size-12 items-center justify-center rounded-full border',
                  selected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
                )}
              >
                <HabitIcon icon={option} color={selected ? accent : muted} size={20} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <CalendarDays color={accent} size={17} />
          <Label>Schedule</Label>
        </View>
        <View className="gap-2" accessibilityRole="radiogroup">
          {HABIT_FREQUENCIES.map((option) => {
            const selected = frequencyId === option.id && scheduleType !== 'specific-days';
            return (
              <Pressable
                key={option.id}
                onPress={() => selectFrequency(option.id)}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: selected }}
                className={cn(
                  'flex-row items-center rounded-2xl border p-4',
                  selected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
                )}
              >
                <View
                  className={cn(
                    'mr-3 size-5 items-center justify-center rounded-full border',
                    selected ? 'border-accent bg-accent' : 'border-muted',
                  )}
                >
                  {selected ? <Check color="#FFF9EE" size={12} strokeWidth={2.5} /> : null}
                </View>
                <Typography type="body-sm" className="text-foreground flex-1 font-medium">
                  {option.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>
        <Typography type="body-xs" className="text-muted">
          Or choose exact days
        </Typography>
        <View className="flex-row justify-between">
          {WEEKDAYS.map((day) => {
            const selected =
              scheduleType === 'specific-days' && scheduledWeekdays.includes(day.value);
            return (
              <Pressable
                key={day.value}
                onPress={() => toggleDay(day.value)}
                accessibilityRole="checkbox"
                accessibilityLabel={day.name}
                accessibilityState={{ checked: selected }}
                className={cn(
                  'size-10 items-center justify-center rounded-full',
                  selected ? 'bg-accent' : 'bg-surface border-border border',
                )}
              >
                <Typography
                  type="body-xs"
                  className={selected ? 'text-accent-foreground font-semibold' : 'text-muted'}
                >
                  {day.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Target color={accent} size={17} />
          <Label>Gentle target</Label>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              value={targetValue}
              onChangeText={setTargetValue}
              keyboardType="decimal-pad"
              placeholder="10"
              accessibilityLabel="Target amount"
            />
          </View>
          <View className="flex-1">
            <Input
              value={targetUnit}
              onChangeText={setTargetUnit}
              placeholder="minutes"
              accessibilityLabel="Target unit"
            />
          </View>
        </View>
      </View>

      <View className="border-border bg-surface rounded-[22px] border p-4">
        <View className="flex-row items-center gap-3">
          <View className="bg-accent-soft size-10 items-center justify-center rounded-full">
            <Bell color={accent} size={18} />
          </View>
          <View className="flex-1">
            <Typography type="body-sm" className="text-foreground font-medium">
              Gentle reminder
            </Typography>
            <Typography type="body-xs" className="text-muted mt-1">
              A quiet nudge at the right time
            </Typography>
          </View>
          <Switch
            isSelected={reminderEnabled}
            isDisabled={isCheckingPermission}
            accessibilityLabel="Enable habit reminder"
            onSelectedChange={(next) => void toggleReminder(next)}
          />
        </View>
        {reminderEnabled ? (
          <View className="mt-4">
            <Input
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="8:00 AM"
              accessibilityLabel="Reminder time"
            />
          </View>
        ) : null}
      </View>

      {error ? (
        <Typography
          type="body-xs"
          className="text-danger"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Typography>
      ) : null}
      <Button size="lg" onPress={submit} className="min-h-14 rounded-full">
        <Button.Label>{submitLabel}</Button.Label>
      </Button>
      {onCancel ? (
        <Button variant="tertiary" onPress={onCancel} className="min-h-12 rounded-full">
          <Button.Label>Cancel</Button.Label>
        </Button>
      ) : null}
    </ScrollView>
  );
}
