import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { CATEGORIES, CategoryId, Role } from '../src/data';
import { useApp } from '../src/store';
import { colors } from '../src/theme';
import { Button, Card, Chip, Field, Header, Segmented } from '../src/ui';

export default function Register() {
  const { register } = useApp();
  const router = useRouter();
  const [role, setRole] = useState<Role>('customer');
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', address: '' });
  const [category, setCategory] = useState<CategoryId>('plumbing');
  const [error, setError] = useState('');
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.name.trim() || !f.email.trim() || !f.phone.trim() || !f.password) return setError('Please fill in all required fields.');
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Enter a valid email address.');
    const res = register({
      role,
      name: f.name,
      email: f.email,
      phone: f.phone.trim(),
      password: f.password,
      address: role === 'customer' ? f.address.trim() : undefined,
      category: role === 'provider' ? category : undefined,
    });
    if (!res.ok) setError(res.error);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Create account" back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Segmented options={['customer', 'provider']} value={role} onChange={(v) => setRole(v as Role)} />

          <Card style={{ padding: 18, marginTop: 16 }}>
            <Field label="Full name *" icon="person-outline" value={f.name} onChangeText={set('name')} placeholder="Your name" />
            <Field label="Email *" icon="mail-outline" value={f.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
            <Field label="Phone *" icon="call-outline" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="03XX XXXXXXX" />
            <Field label="Password *" icon="lock-closed-outline" value={f.password} onChangeText={set('password')} secureTextEntry placeholder="Password" />

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
