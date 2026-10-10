import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useApp } from '../../src/store/AppContext';
import { colors } from '../../src/theme';

const tab = (name: React.ComponentProps<typeof Ionicons>['name'], focusedName: typeof name) =>
  ({ color, focused, size }: { color: import("react-native").ColorValue; focused: boolean; size: number }) =>
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />;

export default function CustomerTabs() {
  const { user } = useApp();
  if (!user || user.role !== 'customer') return <Redirect href="/" />;
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
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tab('home-outline', 'home') }} />
      <Tabs.Screen name="providers" options={{ title: 'Providers', tabBarIcon: tab('people-outline', 'people') }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: tab('calendar-outline', 'calendar') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: tab('person-circle-outline', 'person-circle') }} />
    </Tabs>
  );
}
