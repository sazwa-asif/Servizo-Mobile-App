import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, CategoryId, toYMD } from '../../src/data';
import { useApp } from '../../src/store';
import { colors, radius, shadow } from '../../src/theme';
import { Button, DateField, Field, Header } from '../../src/ui';

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
};

export default function BookService() {
  const router = useRouter();
  const { user, createBooking } = useApp();
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(tomorrow);
  const [address, setAddress] = useState(user?.address ?? '');
  const [error, setError] = useState('');

  const pick = (id: CategoryId, startingPrice: number) => {
    setCategory(id);
    if (!price) setPrice(String(startingPrice));
  };

  const submit = () => {
    const amount = parseInt(price, 10);
    if (!category) return setError('Select the service you need.');
    if (description.trim().length < 10) return setError('Describe the problem in a few words (at least 10 characters).');
    if (!amount || amount <= 0) return setError('Enter the price you want to offer.');
    if (toYMD(date) < toYMD(new Date())) return setError('Choose a date that is today or later.');
    if (!address.trim()) return setError('Enter the service address.');
    setError('');
    createBooking({ category, description: description.trim(), price: amount, date: toYMD(date), address: address.trim() });
    setCategory(null);
    setDescription('');
    setPrice('');
    setDate(tomorrow());
    router.navigate('/bookings');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Book a Service" subtitle="Send your request to providers" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>1. Select a service</Text>
          <View style={styles.grid}>
            {CATEGORIES.map((c) => (
              <Pressable key={c.id} onPress={() => pick(c.id, c.startingPrice)} style={[styles.cat, category === c.id && styles.catActive]}>
                <Image source={c.image} style={styles.catImg} />
                <Text style={[styles.catName, category === c.id && { color: colors.accent }]}>{c.name}</Text>
              </Pressable>
            ))}
          </View>

          <Field
            label="2. Describe the problem"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="What is wrong? Anything the provider should know?"
          />
          <Field
            label="3. Your offered price (Rs)"
            icon="cash-outline"
            value={price}
            onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="e.g. 1500"
          />
          <DateField label="4. Preferred date" value={date} onChange={setDate} />
          <Field
            label="5. Service address"
            icon="location-outline"
            value={address}
            onChangeText={setAddress}
            placeholder="House no., street, area, city"
            multiline
          />

          {error ? <Text style={{ color: colors.danger, textAlign: 'center', marginBottom: 12 }}>{error}</Text> : null}
          <Button title="Send request" variant="accent" icon="paper-plane" onPress={submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.primary, fontWeight: '700', marginBottom: 10, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  cat: { width: '31.5%', backgroundColor: '#fff', borderRadius: radius.lg, alignItems: 'center', paddingVertical: 12, marginBottom: 10, borderWidth: 2, borderColor: 'transparent', ...shadow },
  catActive: { borderColor: colors.accent },
  catImg: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: colors.accent },
  catName: { marginTop: 6, fontWeight: '700', color: colors.primary, fontSize: 13 },
});
