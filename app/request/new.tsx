import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DateTimeField } from '../../src/components/DateTimeField';
import { Button, CategoryAvatar, Card, Chip, EmptyState, Field, Header } from '../../src/components/ui';
import { CATEGORIES, SERVICES_BY_CATEGORY } from '../../src/data/seed';
import { toHM, toYMD } from '../../src/lib/booking';
import { useApp } from '../../src/store/AppContext';
import { colors, radius } from '../../src/theme';

const MAX_PHOTOS = 4;

const tomorrowAt10 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d;
};

export default function NewRequest() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const router = useRouter();
  const { user, getProvider, createBooking } = useApp();
  const provider = getProvider(providerId);

  const [service, setService] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [when, setWhen] = useState<Date>(tomorrowAt10);
  const [address, setAddress] = useState(user?.address ?? '');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  if (!provider) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Request service" back />
        <EmptyState icon="alert-circle-outline" title="Provider not found" />
      </View>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === provider.category)!;
  const options = provider.services.length ? provider.services : SERVICES_BY_CATEGORY[provider.category];

  const addPhotos = async (fromCamera: boolean) => {
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) return;
    try {
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('Camera permission needed', 'Allow camera access to take a photo.');
        const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
        if (!res.canceled) setPhotos((p) => [...p, res.assets[0].uri]);
      } else {
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: room,
          quality: 0.6,
        });
        if (!res.canceled) setPhotos((p) => [...p, ...res.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
      }
    } catch {
      Alert.alert('Could not open the picker', 'Please try again.');
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Location permission needed', 'Allow location access, or type the address manually.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      setCoords({ latitude, longitude });
      try {
        const [a] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const line = [a?.name, a?.street, a?.district, a?.city].filter(Boolean).join(', ');
        setAddress(line || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      } catch {
        setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch {
      Alert.alert('Could not get your location', 'Please type the address manually.');
    } finally {
      setLocating(false);
    }
  };

  const submit = () => {
    if (!service) return setError('Select the service you need.');
    if (description.trim().length < 10) return setError('Describe the problem in a few words (at least 10 characters).');
    if (when.getTime() < Date.now()) return setError('Choose a date and time in the future.');
    if (!address.trim()) return setError('Provide the service location.');
    setError('');
    const id = createBooking({
      providerId: provider.id,
      category: provider.category,
      service,
      description: description.trim(),
      photos,
      date: toYMD(when),
      time: toHM(when),
      address: address.trim(),
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    });
    router.dismissTo('/bookings');
    router.push(`/booking/${id}`);
  };

  const setDatePart = (d: Date) => {
    const n = new Date(when);
    n.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    setWhen(n);
  };
  const setTimePart = (d: Date) => {
    const n = new Date(when);
    n.setHours(d.getHours(), d.getMinutes(), 0, 0);
    setWhen(n);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Request a service" subtitle={`${cat.name} · ${provider.name}`} back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Card style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <CategoryAvatar category={provider.category} size={46} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: '700', color: colors.text, fontSize: 16 }}>{provider.name}</Text>
              <Text style={{ color: colors.muted }}>{provider.area}</Text>
            </View>
          </Card>

          <Text style={styles.label}>1. What do you need?</Text>
          <View style={styles.wrap}>
            {options.map((s) => (
              <Chip key={s} label={s} active={service === s} onPress={() => setService(s)} />
            ))}
            <Chip label="Other" active={service === 'Other'} onPress={() => setService('Other')} />
          </View>

          <View style={{ height: 14 }} />
          <Field
            label="2. Describe the problem"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="What is wrong? Anything the provider should know before coming?"
          />

          <Text style={styles.label}>3. Photos (optional)</Text>
          <View style={styles.wrap}>
            {photos.map((uri) => (
              <View key={uri} style={styles.photo}>
                <Image source={{ uri }} style={StyleSheet.absoluteFill} />
                <Pressable style={styles.photoX} onPress={() => setPhotos((p) => p.filter((x) => x !== uri))} hitSlop={6}>
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
            {photos.length < MAX_PHOTOS && (
              <>
                <Pressable style={styles.addPhoto} onPress={() => addPhotos(false)}>
                  <Ionicons name="images-outline" size={22} color={colors.primaryLight} />
                  <Text style={styles.addPhotoText}>Gallery</Text>
                </Pressable>
                {Platform.OS !== 'web' && (
                  <Pressable style={styles.addPhoto} onPress={() => addPhotos(true)}>
                    <Ionicons name="camera-outline" size={22} color={colors.primaryLight} />
                    <Text style={styles.addPhotoText}>Camera</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>

          <View style={{ height: 18 }} />
          <Text style={styles.label}>4. Preferred date & time</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            <DateTimeField label="Date" mode="date" value={when} onChange={setDatePart} minimumDate={new Date()} />
            <DateTimeField label="Time" mode="time" value={when} onChange={setTimePart} />
          </View>

          <Text style={styles.label}>5. Service location</Text>
          <Field
            label=""
            icon="location-outline"
            value={address}
            onChangeText={(t) => {
              setAddress(t);
              setCoords(null);
            }}
            placeholder="House no., street, area, city"
            multiline
          />
          <Button
            title={coords ? 'Location pinned ✓  (tap to refresh)' : 'Use my current location'}
            variant="outline"
            small
            icon="navigate"
            loading={locating}
            onPress={useMyLocation}
            style={{ alignSelf: 'flex-start', marginTop: -6, marginBottom: 20 }}
          />

          {error ? <Text style={{ color: colors.danger, textAlign: 'center', marginBottom: 12 }}>{error}</Text> : null}
          <Button title="Send request" variant="accent" icon="paper-plane" onPress={submit} />
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 10, fontSize: 12 }}>
            {provider.name} will be notified and can accept or decline your request.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.primary, fontWeight: '700', marginBottom: 8, fontSize: 15 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  photo: { width: 76, height: 76, borderRadius: radius.md, overflow: 'hidden', backgroundColor: '#ddd' },
  photoX: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  addPhoto: { width: 76, height: 76, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  addPhotoText: { color: colors.primaryLight, fontSize: 11, fontWeight: '600', marginTop: 2 },
});
