import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { colors } from '../theme';

export function Bell() {
  const router = useRouter();
  const { unreadCount } = useApp();
  return (
    <Pressable onPress={() => router.push('/notifications')} hitSlop={10} style={styles.btn}>
      <Ionicons name="notifications-outline" size={20} color="#fff" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: colors.primary },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
