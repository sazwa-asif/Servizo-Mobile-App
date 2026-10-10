import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Bell } from '../../src/components/Bell';
import { Button, CategoryAvatar, Card, Chip, Field, Header, SectionTitle, Stars } from '../../src/components/ui';
import { CATEGORIES, SERVICES_BY_CATEGORY } from '../../src/data/seed';
import { useApp } from '../../src/store/AppContext';
import { colors } from '../../src/theme';

export default function ProviderMyProfile() {
  const router = useRouter();
  const { user, provider, updateProviderProfile, providerRating, logout } = useApp();
  const [area, setArea] = useState(provider?.area ?? '');
  const [years, setYears] = useState(String(provider?.experienceYears ?? 0));
  const [bio, setBio] = useState(provider?.bio ?? '');
  const [phone, setPhone] = useState(provider?.phone ?? '');
  const [services, setServices] = useState<string[]>(provider?.services ?? []);
  const [saved, setSaved] = useState(false);

  if (!provider || !user) return null;
  const cat = CATEGORIES.find((c) => c.id === provider.category)!;
  const { avg, count } = providerRating(provider.id);

  const toggle = (s: string) => {
    setSaved(false);
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  };

  const save = () => {
    updateProviderProfile({ area: area.trim(), experienceYears: parseInt(years, 10) || 0, bio: bio.trim(), phone: phone.trim(), services });
    setSaved(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="My profile" subtitle="This is what customers see" right={<Bell />} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
            <CategoryAvatar category={provider.category} size={76} />
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.primary, marginTop: 10 }}>{provider.name}</Text>
            <Text style={{ color: colors.muted, marginBottom: 6 }}>{cat.name} · {user.email}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Stars value={avg ?? 0} size={16} />
              <Text style={{ color: colors.muted }}>{avg != null ? `${avg.toFixed(1)} (${count})` : 'No ratings yet'}</Text>
            </View>
          </Card>

          <SectionTitle>Services offered</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {SERVICES_BY_CATEGORY[provider.category].map((s) => (
              <Chip key={s} label={s} active={services.includes(s)} onPress={() => toggle(s)} />
            ))}
          </View>

          <SectionTitle>Details</SectionTitle>
          <Card>
            <Field label="Service area" icon="location-outline" value={area} onChangeText={(t) => { setArea(t); setSaved(false); }} />
            <Field label="Years of experience" icon="ribbon-outline" value={years} onChangeText={(t) => { setYears(t); setSaved(false); }} keyboardType="number-pad" />
            <Field label="Phone" icon="call-outline" value={phone} onChangeText={(t) => { setPhone(t); setSaved(false); }} keyboardType="phone-pad" />
            <Field label="About" value={bio} onChangeText={(t) => { setBio(t); setSaved(false); }} multiline />
            <Button title={saved ? 'Saved ✓' : 'Save changes'} variant="accent" onPress={save} />
          </Card>

          <Card style={{ marginTop: 14 }} onPress={() => router.push('/notifications')}>
            <Text style={{ fontWeight: '600', color: colors.text }}>🔔  Notifications</Text>
          </Card>

          <Button
            title="Log out"
            variant="danger"
            icon="log-out-outline"
            onPress={() =>
              Alert.alert('Log out', 'Do you want to log out of Servizo?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log out', style: 'destructive', onPress: logout },
              ])
            }
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
