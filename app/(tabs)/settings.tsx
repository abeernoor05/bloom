import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import Constants from 'expo-constants';
import { Bell, Clock3, Info, ShieldCheck } from 'lucide-react-native';
import { Button, Card, Input, TextField, Typography, useThemeColor } from 'heroui-native';

import { BloomHeading } from '@/components/bloom/BloomHeading';
import { BotanicalAccent } from '@/components/bloom/BotanicalAccent';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import {
  getNotificationAvailability,
  requestNotificationPermission,
  type NotificationAvailability,
} from '@/lib/bloom/notifications';
import { normalizeReminderTime, parseReminderTime } from '@/lib/bloom/reminderTime';
import { useBloomStore } from '@/lib/bloom/store';
import { cn } from '@/lib/utils';

function availabilityMessage(availability: NotificationAvailability): string | null {
  if (availability === 'denied') {
    return 'Notifications are off in your device settings. Your habits will continue to work without reminders.';
  }
  if (availability === 'unavailable') {
    return 'Local reminders are unavailable on this device. Your habits will continue to work normally.';
  }
  return null;
}

export default function SettingsScreen() {
  const preference = useBloomStore((state) => state.notificationPreference);
  const setNotificationsEnabled = useBloomStore((state) => state.setNotificationsEnabled);
  const setDefaultReminderTime = useBloomStore((state) => state.setDefaultReminderTime);
  const [availability, setAvailability] = useState<NotificationAvailability>('undetermined');
  const [defaultTime, setDefaultTime] = useState(preference.defaultReminderTime);
  const [showTimeError, setShowTimeError] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [muted, accent] = useThemeColor(['muted', 'accent']);
  const unavailableMessage = availabilityMessage(availability);
  const validDefaultTime = Boolean(parseReminderTime(defaultTime));
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    void getNotificationAvailability().then(setAvailability);
  }, []);

  const toggleNotifications = async () => {
    if (isRequestingPermission) return;
    if (preference.enabled) {
      setNotificationsEnabled(false);
      return;
    }

    setIsRequestingPermission(true);
    try {
      const nextAvailability = await requestNotificationPermission();
      setAvailability(nextAvailability);
      if (nextAvailability === 'granted') {
        setNotificationsEnabled(true);
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const saveDefaultTime = () => {
    setShowTimeError(true);
    const normalized = normalizeReminderTime(defaultTime);
    if (!normalized) return;
    setDefaultReminderTime(normalized);
    setDefaultTime(normalized);
    setShowTimeError(false);
  };

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="mx-auto w-full max-w-2xl gap-6 px-5 pb-12 pt-8"
        >
          <Typography type="body-sm" className="text-muted mb-1">
            Make Bloom yours
          </Typography>
          <BloomHeading level="hero">Settings</BloomHeading>
          <BotanicalAccent size="sm" className="mt-1" />

          <View className="gap-3">
            <BloomHeading level="section">Notifications</BloomHeading>
            <Card className="border-border bg-surface gap-5 rounded-[22px] border p-5">
              <View className="flex-row items-center gap-4">
                <View className="bg-accent-soft size-11 items-center justify-center rounded-2xl">
                  <Bell color={accent} size={20} />
                </View>
                <View className="flex-1">
                  <Typography type="body" className="text-foreground font-semibold">
                    Habit reminders
                  </Typography>
                  <Typography type="body-xs" className="text-muted mt-1">
                    {preference.enabled
                      ? 'Enabled for habits with reminders on'
                      : 'Paused for all habits'}
                  </Typography>
                </View>
                <Pressable
                  onPress={() => void toggleNotifications()}
                  disabled={isRequestingPermission}
                  accessibilityRole="switch"
                  accessibilityLabel="Habit reminders"
                  accessibilityState={{
                    checked: preference.enabled,
                    disabled: isRequestingPermission,
                    busy: isRequestingPermission,
                  }}
                  className={cn(
                    'min-h-11 min-w-16 items-center justify-center rounded-full border px-3',
                    preference.enabled
                      ? 'border-accent bg-accent-soft'
                      : 'border-border bg-surface',
                  )}
                >
                  <Typography type="body-xs" className="text-foreground font-semibold">
                    {isRequestingPermission ? 'Checking…' : preference.enabled ? 'On' : 'Off'}
                  </Typography>
                </Pressable>
              </View>

              {unavailableMessage ? (
                <View className="bg-default-100 rounded-2xl p-4">
                  <Typography type="body-xs" className="text-muted leading-5">
                    {unavailableMessage}
                  </Typography>
                  {availability === 'denied' ? (
                    <Button
                      className="mt-3 self-start"
                      size="sm"
                      variant="ghost"
                      onPress={() => void Linking.openSettings()}
                    >
                      <Button.Label>Open device settings</Button.Label>
                    </Button>
                  ) : null}
                </View>
              ) : null}

              <View className="border-border gap-3 border-t pt-5">
                <View className="flex-row items-center gap-3">
                  <Clock3 color={muted} size={18} />
                  <Typography type="body" className="text-foreground font-semibold">
                    Default reminder time
                  </Typography>
                </View>
                <View className="flex-row items-start gap-3">
                  <TextField className="flex-1" isInvalid={showTimeError && !validDefaultTime}>
                    <Input
                      value={defaultTime}
                      onChangeText={setDefaultTime}
                      placeholder="8:00 AM"
                      accessibilityLabel="Default reminder time"
                    />
                  </TextField>
                  <Button variant="secondary" onPress={saveDefaultTime}>
                    <Button.Label>Save</Button.Label>
                  </Button>
                </View>
                {showTimeError && !validDefaultTime ? (
                  <Typography
                    type="body-xs"
                    className="text-danger"
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                  >
                    Use a time such as 8:00 AM.
                  </Typography>
                ) : (
                  <Typography type="body-xs" className="text-muted">
                    Used as the starting time when you create a habit.
                  </Typography>
                )}
              </View>
            </Card>
          </View>

          <View className="gap-3">
            <BloomHeading level="section">About</BloomHeading>
            <Card className="border-border bg-surface overflow-hidden rounded-[22px] border p-0">
              <View className="min-h-20 flex-row items-center px-5">
                <ShieldCheck color={muted} size={21} />
                <View className="ml-4 flex-1 gap-1">
                  <Typography type="body" className="text-foreground font-semibold">
                    Stored on this device
                  </Typography>
                  <Typography type="body-xs" className="text-muted">
                    Habit history stays here. Coach sends a brief summary only when you ask.
                  </Typography>
                </View>
              </View>
              <View className="border-border min-h-20 flex-row items-center border-t px-5">
                <Info color={muted} size={21} />
                <View className="ml-4 flex-1 gap-1">
                  <Typography type="body" className="text-foreground font-semibold">
                    Bloom
                  </Typography>
                  <Typography type="body-xs" className="text-muted">
                    Version {appVersion}
                  </Typography>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
