import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Bell } from '../../src/components/Bell';
import { BookingCard, EmptyState, Header, Segmented } from '../../src/components/ui';
import { bookingDateTime } from '../../src/lib/booking';
import { useApp } from '../../src/store/AppContext';
import { colors } from '../../src/theme';

const TABS = ['Requests', 'Active', 'History'];

export default function Jobs() {
  const router = useRouter();
  const { bookings, getUserName } = useApp();
  const [tab, setTab] = useState('Requests');

  const lists: Record<string, typeof bookings> = {
    Requests: bookings.filter((b) => b.status === 'Requested'),
    Active: bookings
      .filter((b) => ['Accepted', 'Scheduled', 'In Progress'].includes(b.status))
      .sort((a, b) => bookingDateTime(a).getTime() - bookingDateTime(b).getTime()),
    History: bookings
      .filter((b) => ['Completed', 'Rejected', 'Cancelled'].includes(b.status))
      .sort((a, b) => bookingDateTime(b).getTime() - bookingDateTime(a).getTime()),
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="My jobs" subtitle="Requests, active work and history" right={<Bell />} />
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Segmented options={TABS.map((t) => `${t}`)} value={tab} onChange={setTab} />
      </View>
      <FlatList
        data={lists[tab]}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        ListEmptyComponent={
          <EmptyState
            icon={tab === 'Requests' ? 'mail-open-outline' : tab === 'Active' ? 'briefcase-outline' : 'time-outline'}
            title={tab === 'Requests' ? 'No pending requests' : tab === 'Active' ? 'No active jobs' : 'No job history yet'}
            text="Customer bookings appear here as they come in."
          />
        }
        renderItem={({ item }) => (
          <BookingCard booking={item} title={getUserName(item.customerId)} subtitle={`📍 ${item.address}`} onPress={() => router.push(`/booking/${item.id}`)} />
        )}
      />
    </View>
  );
}
