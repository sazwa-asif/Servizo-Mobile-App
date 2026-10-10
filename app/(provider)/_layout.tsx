import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useApp } from '../../src/store/AppContext';
import { colors } from '../../src/theme';

const tab = (name: React.ComponentProps<typeof Ionicons>['name'], focusedName: typeof name) =>
  ({ color, focused, size }: { color: import("react-native").ColorValue; focused: boolean; size: number }) =>
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />;

export default function ProviderTabs() {
  const { user } = useApp();
  if (!user || user.role !== 'provider') return <Redirect href="/" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: tab('grid-outline', 'grid') }} />
      <Tabs.Screen name="jobs" options={{ title: 'My Jobs', tabBarIcon: tab('briefcase-outline', 'briefcase') }} />
      <Tabs.Screen name="my-profile" options={{ title: 'Profile', tabBarIcon: tab('person-circle-outline', 'person-circle') }} />
    </Tabs>
  );
}
