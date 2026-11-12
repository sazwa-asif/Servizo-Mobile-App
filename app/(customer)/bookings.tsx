import React from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { Booking, categoryOf, customerCanCancel, formatDate } from '../../src/data';
import { useApp } from '../../src/store';
import { colors } from '../../src/theme';
import { Button, Card, CategoryAvatar, EmptyState, Header, StatusBadge } from '../../src/ui';

export default function CustomerBookings() {
  const { bookings, getUserName, cancelBooking } = useApp();

  const confirmCancel = (id: string) => {
    if (Platform.OS === 'web') return cancelBooking(id);
    Alert.alert('Cancel booking?', 'Are you sure you want to cancel this booking?', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: () => cancelBooking(id) },
    ]);
  };

  const renderItem = ({ item: b }: { item: Booking }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CategoryAvatar category={b.category} size={46} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>{categoryOf(b.category).name}</Text>
          <Text style={styles.muted} numberOfLines={1}>
            {b.providerId ? `Provider: ${getUserName(b.providerId)}` : 'Waiting for a provider'}
          </Text>
        </View>
        <StatusBadge status={b.status} />
      </View>

      <Text style={styles.desc}>{b.description}</Text>

      <View style={styles.meta}>
        <Text style={styles.metaText}>📅 {formatDate(b.date)}</Text>
        <Text style={styles.metaText}>📍 {b.address}</Text>
        <Text style={styles.price}>Rs {b.price.toLocaleString()}</Text>
      </View>

      {customerCanCancel(b) && (
        <Button title="Cancel booking" variant="outline" small onPress={() => confirmCancel(b.id)} style={{ alignSelf: 'flex-start', marginTop: 14 }} />
      )}
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="My Bookings" subtitle={`${bookings.length} total`} />
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        ListEmptyComponent={<EmptyState icon="calendar-outline" title="No bookings yet" text="Book a service and it will show up here." />}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  desc: { color: colors.text, lineHeight: 20, marginTop: 12 },
  meta: { marginTop: 10, gap: 4 },
  metaText: { color: colors.text, fontSize: 13 },
  price: { fontSize: 16, fontWeight: '800', color: colors.accent, marginTop: 4 },
});
