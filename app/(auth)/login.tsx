import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, Field, Header } from '../../src/components/ui';
import { DEMO_CUSTOMER_EMAIL, DEMO_PASSWORD, DEMO_PROVIDER_EMAIL } from '../../src/data/seed';
import { useApp } from '../../src/store/AppContext';
import { colors } from '../../src/theme';

export default function Login() {
  const { login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!email.trim() || !password) return setError('Enter your email and password.');
    const res = login(email, password);
    if (!res.ok) setError(res.error);
  };

  const fill = (e: string) => {
    setEmail(e);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Welcome back" subtitle="Log in to continue" back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Card style={{ padding: 20, marginTop: 8 }}>
            <View style={styles.iconCircle}>
              <Ionicons name="log-in-outline" size={28} color={colors.primary} />
            </View>
            <Field label="Email" icon="mail-outline" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
            <Field label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Login" onPress={submit} />
          </Card>

          <Text style={styles.demoLabel}>Try a demo account</Text>
          <View style={{ flexDirection: 'row' }}>
            <Chip icon="person-outline" label="Customer" onPress={() => fill(DEMO_CUSTOMER_EMAIL)} />
            <Chip icon="construct-outline" label="Provider" onPress={() => fill(DEMO_PROVIDER_EMAIL)} />
          </View>

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

const styles = StyleSheet.create({
  iconCircle: { alignSelf: 'center', width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  error: { color: colors.danger, marginBottom: 12, textAlign: 'center' },
  demoLabel: { color: colors.muted, marginTop: 22, marginBottom: 10, fontWeight: '600' },
});
