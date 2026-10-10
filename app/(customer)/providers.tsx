import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip, EmptyState, Header, ProviderCard } from '../../src/components/ui';
import { CATEGORIES } from '../../src/data/seed';
import { areaName, filterProviders, Sort } from '../../src/lib/providers';
import { useApp } from '../../src/store/AppContext';
import { colors, radius } from '../../src/theme';

const RATINGS = [
  { label: 'Any rating', value: 0 },
  { label: '4.0+', value: 4 },
  { label: '4.5+', value: 4.5 },
];

export default function Providers() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { providers, providerRating, providerCompletedJobs } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(params.category ?? 'all');
  const [area, setArea] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<Sort>('rating');

  useEffect(() => {
    setCategory(params.category ?? 'all');
  }, [params.category]);

  const areas = useMemo(() => Array.from(new Set(providers.map(areaName))).sort(), [providers]);

  const data = useMemo(
    () =>
      filterProviders(
        providers.map((p) => ({ p, rating: providerRating(p.id).avg, jobs: providerCompletedJobs(p.id) })),
        { query, category, area, minRating, sort },
      ),
    [providers, query, category, area, minRating, sort, providerRating, providerCompletedJobs],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Find a provider" subtitle={`${data.length} available`}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, service or area"
            placeholderTextColor="#9aa7b5"
            style={{ flex: 1, marginLeft: 10, color: colors.text }}
          />
          {query ? <Ionicons name="close-circle" size={18} color={colors.muted} onPress={() => setQuery('')} /> : null}
        </View>
      </Header>

      <View style={{ paddingTop: 14 }}>
        <Text style={styles.rowLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" active={category === 'all'} onPress={() => setCategory('all')} />
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.name} active={category === c.id} onPress={() => setCategory(c.id)} />
          ))}
        </ScrollView>
        <Text style={styles.rowLabel}>Area</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip icon="location-outline" label="All areas" active={area === 'all'} onPress={() => setArea('all')} />
          {areas.map((a) => (
            <Chip key={a} label={a} active={area === a} onPress={() => setArea(a)} />
          ))}
        </ScrollView>
        <Text style={styles.rowLabel}>Minimum rating</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {RATINGS.map((r) => (
            <Chip key={r.label} icon="star-outline" label={r.label} active={minRating === r.value} onPress={() => setMinRating(r.value)} />
          ))}
        </ScrollView>
        <Text style={styles.rowLabel}>Sort by</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Top rated" active={sort === 'rating'} onPress={() => setSort('rating')} />
          <Chip label="Most jobs" active={sort === 'jobs'} onPress={() => setSort('jobs')} />
          <Chip label="Experience" active={sort === 'experience'} onPress={() => setSort('experience')} />
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.p.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        ListEmptyComponent={<EmptyState icon="search-outline" title="No providers found" text="Try another category, area or rating." />}
        renderItem={({ item }) => (
          <ProviderCard provider={item.p} rating={item.rating} jobs={item.jobs} onPress={() => router.push(`/provider/${item.p.id}`)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, paddingHorizontal: 14, height: 46, marginTop: 16 },
  rowLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginLeft: 16, marginBottom: 4, marginTop: 4 },
  chips: { paddingHorizontal: 16, paddingBottom: 4 },
});
