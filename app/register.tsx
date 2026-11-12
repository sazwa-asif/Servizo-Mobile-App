import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { CATEGORIES, CategoryId, Role } from '../src/data';
import { useApp } from '../src/store';
import { colors } from '../src/theme';
import { Button, Card, Chip, Field, Header, Segmented } from '../src/ui';

// Handle user registration and display the registration form
export default function Register() {
  const { register } = useApp();
  const router = useRouter();

  // Store the selected role and registration form values
  const [role, setRole] = useState<Role>('customer');
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', address: '' });
  const [category, setCategory] = useState<CategoryId>('plumbing');
  const [error, setError] = useState('');

  // Update a specific field in the registration form
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  // Validate the form and register the user
  const submit = async () => {
    if (!f.name.trim() || !f.email.trim() || !f.phone.trim() || !f.password) return setError('Please fill in all required fields.');

    // Check whether the email follows a valid format
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Enter a valid email address.');

    // Send the registration details to the shared app context
    const res = await register({
      role,
      name: f.name,
      email: f.email,
      phone: f.phone.trim(),
      password: f.password,
      address: role === 'customer' ? f.address.trim() : undefined,
      category: role === 'provider' ? category : undefined,
    });

    // Display an error if registration fails
    if (!res.ok) setError(res.error);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Create account" back />

      {/* Adjust the screen when the keyboard appears */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

          {/* Let the user choose whether to register as a customer or provider */}
          <Segmented options={['customer', 'provider']} value={role} onChange={(v) => setRole(v as Role)} />

          {/* Display the registration form inside a card */}
          <Card style={{ padding: 18, marginTop: 16 }}>
            <Field label="Full name *" icon="person-outline" value={f.name} onChangeText={set('name')} placeholder="Your name" />
            <Field label="Email *" icon="mail-outline" value={f.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
            <Field label="Phone *" icon="call-outline" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="03XX XXXXXXX" />
            <Field label="Password *" icon="lock-closed-outline" value={f.password} onChangeText={set('password')} secureTextEntry placeholder="Password" />

            {/* Show an address field for customers */}
            {role === 'customer' ? (
              <Field label="Address" icon="home-outline" value={f.address} onChangeText={set('address')} placeholder="Where do you live?" />
            ) : (
              <>
                {/* Show service categories for providers to select from */}
                <Text style={{ color: colors.primary, fontWeight: '600', marginBottom: 8 }}>Service category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {CATEGORIES.map((c) => (
                    <Chip key={c.id} label={c.name} active={category === c.id} onPress={() => setCategory(c.id)} />
                  ))}
                </ScrollView>
              </>
            )}

            {/* Display validation or registration errors */}
            {error ? <Text style={{ color: colors.danger, marginBottom: 12, textAlign: 'center' }}>{error}</Text> : null}

            {/* Submit the registration form */}
            <Button title="Create account" variant="accent" onPress={submit} />
          </Card>

          {/* Navigate to the login screen for existing users */}
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