import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Bell } from '../../src/components/Bell';
import { BookingCard, EmptyState, Header, Segmented } from '../../src/components/ui';
import { bookingDateTime, isClosed } from '../../src/lib/booking';
import { useApp } from '../../src/store/AppContext';
import { colors } from '../../src/theme';

export default function CustomerBookings() {
  const router = useRouter();
  const { bookings, getProvider } = useApp();
  const [tab, setTab] = useState('Upcoming');

  const upcoming = bookings.filter((b) => !isClosed(b.status)).sort((a, b) => bookingDateTime(a).getTime() - bookingDateTime(b).getTime());
  const past = bookings.filter((b) => isClosed(b.status)).sort((a, b) => bookingDateTime(b).getTime() - bookingDateTime(a).getTime());
  const data = tab === 'Upcoming' ? upcoming : past;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="My bookings" subtitle={`${upcoming.length} active · ${past.length} in history`} right={<Bell />} />
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Segmented options={['Upcoming', 'Past']} value={tab} onChange={setTab} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        ListEmptyComponent={
          tab === 'Upcoming' ? (
            <EmptyState icon="calendar-outline" title="Nothing scheduled" text="Find a provider and request a service to see it here." />
          ) : (
            <EmptyState icon="time-outline" title="No service history yet" text="Completed, cancelled and rejected bookings will appear here." />
          )
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            title={getProvider(item.providerId)?.name ?? 'Provider'}
            subtitle={`📍 ${item.address}`}
            onPress={() => router.push(`/booking/${item.id}`)}
          />
        )}
      />
    </View>
  );
}
