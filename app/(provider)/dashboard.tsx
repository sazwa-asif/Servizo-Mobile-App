import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell } from '../../src/components/Bell';
import { BookingCard, Card, EmptyState, Header, SectionTitle } from '../../src/components/ui';
import { bookingDateTime } from '../../src/lib/booking';
import { useApp } from '../../src/store/AppContext';
import { colors, shadow } from '../../src/theme';

export default function Dashboard() {
  const router = useRouter();
  const { user, provider, bookings, getUserName, providerRating, providerCompletedJobs } = useApp();
  if (!provider) return null;

  const requests = bookings.filter((b) => b.status === 'Requested');
  const active = bookings
    .filter((b) => ['Accepted', 'Scheduled', 'In Progress'].includes(b.status))
    .sort((a, b) => bookingDateTime(a).getTime() - bookingDateTime(b).getTime());
  const { avg, count } = providerRating(provider.id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={`Hello, ${user?.name.split(' ')[0]} 👋`} subtitle={`${provider.category[0].toUpperCase()}${provider.category.slice(1)} · ${provider.area}`} right={<Bell />} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <View style={styles.stats}>
          <Stat icon="📥" value={requests.length} label="New requests" highlight={requests.length > 0} />
          <Stat icon="🛠️" value={active.length} label="Active jobs" />
        </View>
        <View style={styles.stats}>
          <Stat icon="✅" value={providerCompletedJobs(provider.id)} label="Jobs completed" />
          <Stat icon="⭐" value={avg != null ? avg.toFixed(1) : '—'} label={`Rating (${count})`} />
        </View>

        <SectionTitle action={requests.length ? 'See all' : undefined} onAction={() => router.push('/jobs')}>New requests</SectionTitle>
        {requests.length ? (
          requests.slice(0, 3).map((b) => (
            <BookingCard key={b.id} booking={b} title={getUserName(b.customerId)} subtitle={`📍 ${b.address}`} onPress={() => router.push(`/booking/${b.id}`)} />
          ))
        ) : (
          <Card><EmptyState icon="mail-open-outline" title="No new requests" text="New customer requests will show up here." /></Card>
        )}

        <SectionTitle>Upcoming jobs</SectionTitle>
        {active.length ? (
          active.slice(0, 3).map((b) => (
            <BookingCard key={b.id} booking={b} title={getUserName(b.customerId)} subtitle={`📍 ${b.address}`} onPress={() => router.push(`/booking/${b.id}`)} />
          ))
        ) : (
          <Card><EmptyState icon="briefcase-outline" title="No active jobs" text="Accepted requests will move here." /></Card>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({ icon, value, label, highlight }: { icon: string; value: number | string; label: string; highlight?: boolean }) {
  return (
    <View style={[styles.stat, highlight && { borderColor: colors.accent, borderWidth: 1.5 }]}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, ...shadow },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: 4 },
  statLabel: { color: colors.muted, fontSize: 13 },
});
