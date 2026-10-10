import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatDate, formatTime, toHM, toYMD } from '../lib/booking';
import { colors, radius } from '../theme';

interface Props {
  label: string;
  mode: 'date' | 'time';
  value: Date;
  onChange: (d: Date) => void;
  minimumDate?: Date;
}

export function DateTimeField({ label, mode, value, onChange, minimumDate }: Props) {
  const icon = mode === 'date' ? 'calendar-outline' : 'time-outline';
  const display = mode === 'date' ? formatDate(toYMD(value)) : formatTime(toHM(value));

  if (Platform.OS === 'web') {
    const text = mode === 'date' ? toYMD(value) : toHM(value);
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.box}>
          <Ionicons name={icon} size={18} color={colors.muted} />
          <TextInput
            defaultValue={text}
            placeholder={mode === 'date' ? 'YYYY-MM-DD' : 'HH:mm'}
            style={{ flex: 1, marginLeft: 8, color: colors.text }}
            onChangeText={(t) => {
              const d = new Date(value);
              if (mode === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(t)) {
                const [y, m, day] = t.split('-').map(Number);
                d.setFullYear(y, m - 1, day);
                onChange(d);
              } else if (mode === 'time' && /^\d{1,2}:\d{2}$/.test(t)) {
                const [h, mi] = t.split(':').map(Number);
                d.setHours(h, mi, 0, 0);
                onChange(d);
              }
            }}
          />
        </View>
      </View>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.box, { justifyContent: 'center' }]}>
          <DateTimePicker
            value={value}
            mode={mode}
            display="compact"
            minimumDate={minimumDate}
            onChange={(_, d) => d && onChange(d)}
            accentColor={colors.primary}
          />
        </View>
      </View>
    );
  }

  const open = () =>
    DateTimePickerAndroid.open({
      value,
      mode,
      minimumDate,
      is24Hour: false,
      onChange: (_, d) => d && onChange(d),
    });

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={open} style={styles.box}>
        <Ionicons name={icon} size={18} color={colors.muted} />
        <Text style={{ marginLeft: 8, color: colors.text, flex: 1 }} numberOfLines={1}>{display}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.primary, fontWeight: '600', marginBottom: 6, fontSize: 14 },
  box: { flexDirection: 'row', alignItems: 'center', minHeight: 48, backgroundColor: '#fff', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
});
