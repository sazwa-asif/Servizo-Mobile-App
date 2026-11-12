import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { colors } from '../../src/theme';

export default function CustomerTabs() {
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
      <Tabs.Screen
        name="book"
        options={{
          title: 'Book a Service',
          tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'My Bookings',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}
