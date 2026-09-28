import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Button, Input, Label, TextField, Typography, useThemeColor } from 'heroui-native';

import { HABIT_ICON_OPTIONS } from '@/components/bloom/habitVisuals';
import {
  getNotificationAvailability,
  requestNotificationPermission,
  type NotificationAvailability,
} from '@/lib/bloom/notifications';
import { normalizeReminderTime, parseReminderTime } from '@/lib/bloom/reminderTime';
import { useBloomStore } from '@/lib/bloom/store';
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

function inputFromHabit(habit: Habit | undefined, defaultReminderTime: string): HabitInput {
  return {
    name: habit?.name ?? '',
    icon: habit?.icon ?? 'sparkles',
    description: habit?.description ?? '',
    reminderEnabled: habit?.reminder.enabled ?? true,
    reminderTime: habit?.reminder.time ?? defaultReminderTime,
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
  const defaultReminderTime = useBloomStore(
    (state) => state.notificationPreference.defaultReminderTime,
  );
  const setNotificationsEnabled = useBloomStore((state) => state.setNotificationsEnabled);
  const initial = useMemo(
    () => inputFromHabit(habit, defaultReminderTime),
    [defaultReminderTime, habit],
  );
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [notificationAvailability, setNotificationAvailability] =
    useState<NotificationAvailability>('undetermined');
  const [accent, muted] = useThemeColor(['accent', 'muted']);

  useEffect(() => {
    void getNotificationAvailability().then(setNotificationAvailability);
  }, []);

  const validName = name.trim().length >= 2;
  const validSchedule = scheduleType !== 'specific-days' || scheduledWeekdays.length > 0;
  const validReminder = !reminderEnabled || parseReminderTime(reminderTime) !== null;
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

  const toggleReminder = async () => {
    if (isRequestingPermission) return;
    if (reminderEnabled) {
      setReminderEnabled(false);
      return;
    }

    setIsRequestingPermission(true);
    try {
      const availability = await requestNotificationPermission();
      setNotificationAvailability(availability);
      if (availability === 'granted') {
        setNotificationsEnabled(true);
        setReminderEnabled(true);
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const save = () => {
    if (isSubmitting) return;
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
    setIsSubmitting(true);
    try {
      onSubmit({
        name,
        icon,
        description,
        reminderEnabled,
        reminderTime: normalizeReminderTime(reminderTime) ?? defaultReminderTime,
        frequencyId,
        scheduleType,
        daysPerWeek: count,
        scheduledWeekdays: selectedDays,
        target:
          targetValue.trim() && targetUnit.trim()
            ? { value: Number(targetValue), unit: targetUnit.trim() }
            : undefined,
      });
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
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
                  accessibilityLabel={option.label}
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
              disabled={isRequestingPermission}
              onPress={() => void toggleReminder()}
              accessibilityLabel="Habit reminder"
              accessibilityRole="switch"
              accessibilityState={{ checked: reminderEnabled, disabled: isRequestingPermission }}
              className={cn(
                'min-h-11 justify-center rounded-full border px-4',
                reminderEnabled ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
              )}
            >
              <Typography type="body-xs" className="text-foreground font-semibold">
                {isRequestingPermission ? 'Checking…' : reminderEnabled ? 'On' : 'Off'}
              </Typography>
            </Pressable>
          </View>
          {reminderEnabled ? (
            <TextField isRequired isInvalid={showErrors && !validReminder}>
              <Input
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="e.g. 9:00 PM"
                accessibilityLabel="Reminder time"
              />
              {showErrors && !validReminder ? (
                <Typography type="body-xs" className="text-danger mt-1">
                  Use a time such as 9:00 PM.
                </Typography>
              ) : null}
            </TextField>
          ) : null}
          {!reminderEnabled && notificationAvailability === 'denied' ? (
            <Typography type="body-xs" className="text-muted">
              Notifications are off in your device settings. You can still save this habit.
            </Typography>
          ) : null}
          {!reminderEnabled && notificationAvailability === 'unavailable' ? (
            <Typography type="body-xs" className="text-muted">
              Reminders are unavailable on this device. You can still save this habit.
            </Typography>
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
                accessibilityLabel="Target amount"
              />
            </TextField>
            <TextField className="flex-[2]" isInvalid={showErrors && !validTarget}>
              <Input
                value={targetUnit}
                onChangeText={setTargetUnit}
                placeholder="pages, minutes…"
                accessibilityLabel="Target unit"
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
          <Button size="lg" onPress={save} isDisabled={isSubmitting}>
            <Button.Label>{isSubmitting ? 'Saving…' : submitLabel}</Button.Label>
          </Button>
          <Button size="lg" variant="ghost" onPress={onCancel}>
            <Button.Label>Cancel</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
