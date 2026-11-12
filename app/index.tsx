import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../src/store';
import { colors } from '../src/theme';
import { Button } from '../src/ui';

export default function Landing() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  if (user) return <Redirect href={user.role === 'provider' ? '/jobs' : '/book'} />;

  return (
    <LinearGradient colors={[colors.primary, colors.primaryLight, colors.primary]} style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.logoCard}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.title}>Skilled Hands,{'\n'}Smart Service</Text>
      <Text style={styles.sub}>
        Book electricians, plumbers, cleaners and more — and follow your request from first tap to finished job.
      </Text>

      <View style={{ flex: 1 }} />
      <Button title="Login" variant="accent" onPress={() => router.push('/login')} />
      <Button title="Create an account" variant="light" onPress={() => router.push('/register')} style={{ marginTop: 12 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  logoCard: { alignSelf: 'center', backgroundColor: '#fff', borderRadius: 28, paddingHorizontal: 6, marginBottom: 24 },
  logo: { width: 300, height: 150 },
  title: { color: '#fff', fontSize: 34, fontWeight: '800', lineHeight: 42, textAlign: 'center' },
  sub: { color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 14 },
});
