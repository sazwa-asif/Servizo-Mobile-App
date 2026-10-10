import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell } from '../../src/components/Bell';
import { Button, Card, Header, InfoRow } from '../../src/components/ui';
import { useApp } from '../../src/store/AppContext';
import { colors } from '../../src/theme';

export default function Account() {
  const router = useRouter();
  const { user, bookings, logout } = useApp();
  if (!user) return null;
  const done = bookings.filter((b) => b.status === 'Completed').length;

  const confirmLogout = () => Alert.alert('Log out', 'Do you want to log out of Servizo?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: logout },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Account" right={<Bell />} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View style={styles.avatar}>
            <Text style={{ color: '#fff', fontSize: 30, fontWeight: '700' }}>
              {user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={{ color: colors.muted }}>Customer</Text>
          <View style={styles.statRow}>
            <Stat value={bookings.length} label="Bookings" />
            <Stat value={done} label="Completed" />
          </View>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <InfoRow icon="mail-outline">{user.email}</InfoRow>
          <InfoRow icon="call-outline">{user.phone}</InfoRow>
          {user.address ? <InfoRow icon="home-outline">{user.address}</InfoRow> : null}
        </Card>

        <Card style={{ marginTop: 14 }} onPress={() => router.push('/notifications')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <Text style={{ flex: 1, marginLeft: 12, fontWeight: '600', color: colors.text }}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        </Card>

        <Button title="Log out" variant="danger" icon="log-out-outline" onPress={confirmLogout} style={{ marginTop: 24 }} />
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.accent }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primaryLight, borderWidth: 3, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700', color: colors.primary },
  statRow: { flexDirection: 'row', width: '100%', marginTop: 18 },
});
