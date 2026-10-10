import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell } from '../../src/components/Bell';
import { BookingCard, Card, EmptyState, Header, ProviderCard, SectionTitle } from '../../src/components/ui';
import { CATEGORIES } from '../../src/data/seed';
import { bookingDateTime, isClosed } from '../../src/lib/booking';
import { categoryImage } from '../../src/lib/images';
import { useApp } from '../../src/store/AppContext';
import { colors, radius, shadow } from '../../src/theme';

export default function CustomerHome() {
  const router = useRouter();
  const { user, providers, bookings, providerRating, providerCompletedJobs, getProvider } = useApp();

  const upcoming = bookings
    .filter((b) => !isClosed(b.status))
    .sort((a, b) => bookingDateTime(a).getTime() - bookingDateTime(b).getTime())[0];

  const top = [...providers]
    .map((p) => ({ p, r: providerRating(p.id).avg ?? 0 }))
    .sort((a, b) => b.r - a.r)
    .slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={`Hello, ${user?.name.split(' ')[0]} 👋`} subtitle="What do you need help with today?" right={<Bell />}>
        <Pressable style={styles.search} onPress={() => router.push('/providers')}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <Text style={{ color: colors.muted, marginLeft: 10 }}>Search services or providers</Text>
        </Pressable>
      </Header>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <SectionTitle>Service categories</SectionTitle>
        <View style={styles.grid}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.id}
              style={({ pressed }) => [styles.cat, pressed && { opacity: 0.85 }]}
              onPress={() => router.push({ pathname: '/providers', params: { category: c.id } })}
            >
              <Image source={categoryImage[c.id]} style={styles.catImg} />
              <Text style={styles.catName}>{c.name}</Text>
              <Text style={styles.catPrice}>from Rs {c.startingPrice}</Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle action={bookings.length ? 'See all' : undefined} onAction={() => router.push('/bookings')}>
          Next booking
        </SectionTitle>
        {upcoming ? (
          <BookingCard
            booking={upcoming}
            title={getProvider(upcoming.providerId)?.name ?? 'Provider'}
            subtitle={`📍 ${upcoming.address}`}
            onPress={() => router.push(`/booking/${upcoming.id}`)}
          />
        ) : (
          <Card>
            <EmptyState icon="calendar-outline" title="No upcoming bookings" text="Pick a category above to request your first service." />
          </Card>
        )}

        <SectionTitle action="View all" onAction={() => router.push('/providers')}>Top rated providers</SectionTitle>
        {top.map(({ p, r }) => (
          <ProviderCard
            key={p.id}
            provider={p}
            rating={r || null}
            jobs={providerCompletedJobs(p.id)}
            onPress={() => router.push(`/provider/${p.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, paddingHorizontal: 14, height: 46, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cat: { width: '31.5%', backgroundColor: '#fff', borderRadius: radius.lg, alignItems: 'center', paddingVertical: 14, marginBottom: 12, ...shadow },
  catImg: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: colors.accent },
  catName: { marginTop: 8, fontWeight: '700', color: colors.primary, fontSize: 13 },
  catPrice: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
