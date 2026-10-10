import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Field, Header, Segmented } from '../../src/components/ui';
import { CATEGORIES } from '../../src/data/seed';
import { CategoryId, Role } from '../../src/data/types';
import { useApp } from '../../src/store/AppContext';
import { colors } from '../../src/theme';

export default function Register() {
  const { register } = useApp();
  const router = useRouter();
  const [role, setRole] = useState<Role>('customer');
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', address: '', area: '', experience: '', bio: '' });
  const [category, setCategory] = useState<CategoryId>('plumbing');
  const [error, setError] = useState('');
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.name.trim() || !f.email.trim() || !f.phone.trim() || !f.password) return setError('Please fill in all required fields.');
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Enter a valid email address.');
    if (f.password.length < 6) return setError('Password must be at least 6 characters.');
    if (role === 'provider' && !f.area.trim()) return setError('Enter the area you serve.');
    const res = register({
      role,
      name: f.name,
      email: f.email,
      phone: f.phone,
      password: f.password,
      address: f.address,
      category,
      area: f.area,
      experienceYears: parseInt(f.experience, 10) || 0,
      bio: f.bio,
    });
    if (!res.ok) setError(res.error);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Create account" subtitle="Join Servizo in a minute" back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Segmented options={['customer', 'provider']} value={role} onChange={(v) => setRole(v as Role)} />
          <Text style={{ color: colors.muted, marginVertical: 10, textAlign: 'center' }}>
            {role === 'customer' ? 'I want to hire a service provider' : 'I offer services to customers'}
          </Text>

          <Card style={{ padding: 18 }}>
            <Field label="Full name *" icon="person-outline" value={f.name} onChangeText={set('name')} placeholder="Your name" />
            <Field label="Email *" icon="mail-outline" value={f.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
            <Field label="Phone *" icon="call-outline" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="03XX XXXXXXX" />
            <Field label="Password *" icon="lock-closed-outline" value={f.password} onChangeText={set('password')} secureTextEntry placeholder="At least 6 characters" />

            {role === 'customer' ? (
              <Field label="Address" icon="home-outline" value={f.address} onChangeText={set('address')} placeholder="Where do you live?" />
            ) : (
              <>
                <Text style={{ color: colors.primary, fontWeight: '600', marginBottom: 8 }}>Service category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {CATEGORIES.map((c) => (
                    <Chip key={c.id} label={c.name} active={category === c.id} onPress={() => setCategory(c.id)} />
                  ))}
                </ScrollView>
                <Field label="Service area *" icon="location-outline" value={f.area} onChangeText={set('area')} placeholder="e.g. Gulshan, Karachi" />
                <Field label="Years of experience" icon="ribbon-outline" value={f.experience} onChangeText={set('experience')} keyboardType="number-pad" placeholder="e.g. 5" />
                <Field label="About you" value={f.bio} onChangeText={set('bio')} multiline placeholder="Tell customers about your work" />
              </>
            )}

            {error ? <Text style={{ color: colors.danger, marginBottom: 12, textAlign: 'center' }}>{error}</Text> : null}
            <Button title="Create account" variant="accent" onPress={submit} />
          </Card>

          <Pressable onPress={() => router.replace('/login')} style={{ marginTop: 22, alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>
              Already registered? <Text style={{ color: colors.accent, fontWeight: '700' }}>Login</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
