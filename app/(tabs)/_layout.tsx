import { ChartNoAxesColumnIncreasing, House, Settings, Sprout } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native';
import { useUniwind } from 'uniwind';

export default function TabLayout() {
  const { theme } = useUniwind();
  const [background, border, accent, muted] = useThemeColor([
    'background',
    'border',
    'accent',
    'muted',
  ]);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: background },
          tabBarStyle: {
            backgroundColor: background,
            borderTopColor: border,
            borderTopWidth: 1,
            height: 72,
            paddingTop: 9,
            paddingBottom: 9,
            shadowColor: 'transparent',
            elevation: 0,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => (
              <House color={color} size={size ?? 22} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: 'Habits',
            tabBarIcon: ({ color, size }) => (
              <Sprout color={color} size={size ?? 22} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, size }) => (
              <ChartNoAxesColumnIncreasing color={color} size={size ?? 22} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Settings color={color} size={size ?? 22} strokeWidth={1.8} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
