import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui';
import { logo } from '../../src/lib/images';
import { colors } from '../../src/theme';

const STEPS = [
  { icon: 'search', text: 'Find a service' },
  { icon: 'person', text: 'Pick a provider' },
  { icon: 'calendar', text: 'Schedule it' },
  { icon: 'checkmark-done', text: 'Track to completion' },
] as const;

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={[colors.primary, colors.primaryLight, colors.primary]} style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.logoCard}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.title}>Skilled Hands,{'\n'}Smart Service</Text>
      <Text style={styles.sub}>
        Book verified electricians, plumbers, cleaners and more — and follow your request from first tap to finished job.
      </Text>

      <View style={styles.steps}>
        {STEPS.map((s) => (
          <View key={s.text} style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name={s.icon} size={18} color="#fff" />
            </View>
            <Text style={styles.stepText}>{s.text}</Text>
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />
      <Button title="Login" variant="accent" onPress={() => router.push('/login')} />
      <Button
        title="Create an account"
        variant="light"
        onPress={() => router.push('/register')}
        style={{ marginTop: 12 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  logoCard: { alignSelf: 'center', backgroundColor: '#fff', borderRadius: 28, paddingHorizontal: 6, paddingVertical: 0, marginBottom: 24 },
  logo: { width: 300, height: 150 },
  title: { color: '#fff', fontSize: 34, fontWeight: '800', lineHeight: 42, textAlign: 'center' },
  sub: { color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 14 },
  steps: { marginTop: 28, gap: 12 },
  step: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  stepIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
