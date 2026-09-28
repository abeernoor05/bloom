import { router, Stack } from 'expo-router';
import { Button, Typography } from 'heroui-native';

import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <SafeAreaView className="bg-background flex-1 items-center justify-center px-6">
        <Typography type="h1" className="text-foreground text-center text-xl font-bold">
          Page not found
        </Typography>
        <Typography type="body" className="text-muted mt-2 mb-6 text-center">
          This page is no longer available.
        </Typography>
        <Button onPress={() => router.replace('/')}>
          <Button.Label>Back to Today</Button.Label>
        </Button>
      </SafeAreaView>
    </>
  );
}
