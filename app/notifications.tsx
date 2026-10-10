import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, Header } from '../src/components/ui';
import { formatStamp } from '../src/lib/booking';
import { useApp } from '../src/store/AppContext';
import { colors } from '../src/theme';

export default function Notifications() {
  const router = useRouter();
  const { notifications, markNotificationsRead } = useApp();

  useFocusEffect(useCallback(() => () => markNotificationsRead(), [markNotificationsRead]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Notifications" subtitle={`${notifications.filter((n) => !n.read).length} unread`} back />
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="You're all caught up" text="Booking updates will appear here." />}
        renderItem={({ item }) => (
          <Card
            onPress={item.bookingId ? () => router.push(`/booking/${item.bookingId}`) : undefined}
            style={[{ marginBottom: 10, flexDirection: 'row' }, !item.read && styles.unread]}
          >
            <View style={styles.icon}>
              <Ionicons name="notifications" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>{item.title}</Text>
              <Text style={{ color: colors.text, marginTop: 2 }}>{item.body}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>{formatStamp(item.createdAt)}</Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  unread: { borderLeftWidth: 4, borderLeftColor: colors.accent },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
});
