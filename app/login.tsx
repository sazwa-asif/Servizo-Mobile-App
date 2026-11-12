import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Role } from '../src/data';
import { useApp } from '../src/store';
import { colors } from '../src/theme';
import { Button, Card, Field, Header, Segmented } from '../src/ui';

export default function Login() {
  const { login } = useApp();
  const router = useRouter();
  const [role, setRole] = useState<Role>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!email.trim() || !password) return setError('Enter your email and password.');
    const res = login(email, password, role);
    if (!res.ok) setError(res.error);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Welcome back" subtitle="Log in to continue" back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Segmented options={['customer', 'provider']} value={role} onChange={(v) => { setRole(v as Role); setError(''); }} />
          <Card style={{ padding: 20, marginTop: 16 }}>
            <Field label="Email" icon="mail-outline" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
            <Field label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
            {error ? <Text style={{ color: colors.danger, marginBottom: 12, textAlign: 'center' }}>{error}</Text> : null}
            <Button title={`Login as ${role}`} onPress={submit} />
          </Card>

          <Pressable onPress={() => router.replace('/register')} style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>
              New to Servizo? <Text style={{ color: colors.accent, fontWeight: '700' }}>Create an account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
