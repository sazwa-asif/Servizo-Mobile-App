import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, CategoryAvatar, Card, EmptyState, Header, InfoRow, SectionTitle, Stars } from '../../src/components/ui';
import { CATEGORIES } from '../../src/data/seed';
import { formatStamp } from '../../src/lib/booking';
import { useApp } from '../../src/store/AppContext';
import { colors } from '../../src/theme';

export default function ProviderProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, getProvider, providerRating, providerCompletedJobs, providerReviews } = useApp();
  const p = getProvider(id);

  if (!p) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Provider" back />
        <EmptyState icon="alert-circle-outline" title="Provider not found" />
      </View>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === p.category)!;
  const { avg, count } = providerRating(p.id);
  const reviews = providerReviews(p.id);
  const jobs = providerCompletedJobs(p.id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Provider profile" back />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Card style={styles.profileCard}>
          <CategoryAvatar category={p.category} size={84} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Text style={styles.name}>{p.name}</Text>
            {p.verified && <Ionicons name="checkmark-circle" size={20} color={colors.info} style={{ marginLeft: 6 }} />}
          </View>
          <Text style={{ color: colors.muted }}>{cat.name} specialist</Text>

          <View style={styles.stats}>
            <Stat value={avg != null ? avg.toFixed(1) : '—'} label={`Rating (${count})`} />
            <View style={styles.sep} />
            <Stat value={String(jobs)} label="Jobs done" />
            <View style={styles.sep} />
            <Stat value={`${p.experienceYears}y`} label="Experience" />
          </View>
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card>
          <Text style={{ color: colors.text, lineHeight: 21, marginBottom: 12 }}>{p.bio}</Text>
          <InfoRow icon="location-outline">Service area: {p.area}</InfoRow>
          <InfoRow icon="call-outline">{p.phone}</InfoRow>
        </Card>

        <SectionTitle>Services offered</SectionTitle>
        <Card>
          {p.services.length ? (
            p.services.map((s) => (
              <View key={s} style={styles.serviceRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={{ marginLeft: 10, color: colors.text, fontSize: 15 }}>{s}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.muted }}>General {cat.name.toLowerCase()} services.</Text>
          )}
        </Card>

        <SectionTitle>Customer reviews</SectionTitle>
        {reviews.length ? (
          reviews.map((r) => (
            <Card key={r.id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', color: colors.primary }}>{r.customerName}</Text>
                <Stars value={r.rating} />
              </View>
              {r.text ? <Text style={{ color: colors.text, marginTop: 6 }}>{r.text}</Text> : null}
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>{formatStamp(r.createdAt)}</Text>
            </Card>
          ))
        ) : (
          <Card><Text style={{ color: colors.muted, textAlign: 'center' }}>No reviews yet.</Text></Card>
        )}
      </ScrollView>

      {user?.role === 'customer' && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Button title="Call" variant="outline" icon="call" onPress={() => Linking.openURL(`tel:${p.phone}`)} style={{ flex: 1, marginRight: 10 }} />
          <Button
            title="Request service"
            variant="accent"
            icon="calendar"
            onPress={() => router.push({ pathname: '/request/new', params: { providerId: p.id } })}
            style={{ flex: 2 }}
          />
        </View>
      )}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.accent }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', paddingVertical: 22, borderTopWidth: 4, borderTopColor: colors.accent },
  name: { fontSize: 22, fontWeight: '800', color: colors.primary },
  stats: { flexDirection: 'row', marginTop: 20, width: '100%' },
  sep: { width: 1, backgroundColor: colors.border },
  serviceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
});
