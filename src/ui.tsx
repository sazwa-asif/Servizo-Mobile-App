import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookingStatus, CategoryId, categoryOf, formatDate, STATUS_COLOR, toYMD } from './data';
import { useApp } from './store';
import { colors, radius, shadow } from './theme';

// Get the valid icon names from the Ionicons library
type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Display a reusable header with title, optional subtitle, back button and logout button
export function Header({ title, subtitle, back }: { title: string; subtitle?: string; back?: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useApp();

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 12 }]}
    >
      {/* Display the back button only when required */}
      {back && (
        <Pressable onPress={() => router.back()} hitSlop={10} style={[styles.roundBtn, { marginRight: 10 }]}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
      )}

      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.headerSub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>

      {/* Display the logout button only when a user is logged in */}
      {user && (
        <Pressable onPress={logout} hitSlop={10} style={styles.roundBtn}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
        </Pressable>
      )}
    </LinearGradient>
  );
}

// Create a reusable card container for other components
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// Display a message when there is no data to show
export function EmptyState({ icon, title, text }: { icon: IconName; title: string; text?: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={colors.primaryLight} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
    </View>
  );
}

// Create a reusable button with different styles and optional icon
export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  small,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'outline' | 'light';
  icon?: IconName;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = { primary: colors.primary, accent: colors.accent, outline: 'transparent', light: 'transparent' }[variant];
  const fg = variant === 'outline' ? colors.primary : '#fff';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: bg },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.primary },
        variant === 'light' && { borderWidth: 1.5, borderColor: '#fff' },
        variant === 'accent' && shadow,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 14 : 18} color={fg} style={{ marginRight: 5 }} /> : null}
      <Text style={[styles.btnText, small && { fontSize: 12 }, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

// Create a reusable text input field with an optional label and icon
export function Field({ label, icon, ...props }: TextInputProps & { label: string; icon?: IconName }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, props.multiline && { alignItems: 'flex-start' }]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.muted} style={{ marginRight: 8, marginTop: props.multiline ? 12 : 0 }} /> : null}
        <TextInput
          placeholderTextColor="#9aa7b5"
          {...props}
          style={[styles.input, props.multiline && { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 }]}
        />
      </View>
    </View>
  );
}

// Create a reusable segmented control for switching between options
export function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.segment}>
      {options.map((o) => (
        <Pressable key={o} onPress={() => onChange(o)} style={[styles.segItem, value === o && styles.segItemActive]}>
          <Text style={[styles.segText, value === o && { color: colors.primary }]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Create a selectable chip to represent an option or category
export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

// Display the booking status with a matching color and indicator dot
export function StatusBadge({ status }: { status: BookingStatus }) {
  const c = STATUS_COLOR[status];

  return (
    <View style={[styles.badge, { backgroundColor: c + '22' }]}>
      <View style={[styles.badgeDot, { backgroundColor: c }]} />
      <Text style={[styles.badgeText, { color: c }]}>{status}</Text>
    </View>
  );
}

// Display the image associated with a service category
export function CategoryAvatar({ category, size = 56 }: { category: CategoryId; size?: number }) {
  return (
    <Image
      source={categoryOf(category).image}
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: colors.accent, backgroundColor: '#fff' }}
    />
  );
}

// Display a date input that works differently on web, iOS and Android
export function DateField({ label, value, onChange }: { label: string; value: Date; onChange: (d: Date) => void }) {
  const today = new Date();

  let input: React.ReactNode;

  // Use a text input for entering the date on web
  if (Platform.OS === 'web') {
    input = (
      <>
        <Ionicons name="calendar-outline" size={18} color={colors.muted} />
        <TextInput
          defaultValue={toYMD(value)}
          placeholder="YYYY-MM-DD"
          style={{ flex: 1, marginLeft: 8, color: colors.text }}
          onChangeText={(t) => {
            if (/^\d{4}-\d{2}-\d{2}$/.test(t)) onChange(new Date(`${t}T00:00:00`));
          }}
        />
      </>
    );
  } else if (Platform.OS === 'ios') {
    // Use the compact native date picker on iOS
    input = (
      <DateTimePicker
        value={value}
        mode="date"
        display="compact"
        minimumDate={today}
        onChange={(_, d) => d && onChange(d)}
        accentColor={colors.primary}
      />
    );
  } else {
    // Open the Android date picker when the user presses the date field
    input = (
      <Pressable
        style={styles.dateAndroid}
        onPress={() =>
          DateTimePickerAndroid.open({ value, mode: 'date', minimumDate: today, onChange: (_, d) => d && onChange(d) })
        }
      >
        <Ionicons name="calendar-outline" size={18} color={colors.muted} />
        <Text style={{ marginLeft: 8, color: colors.text }}>{formatDate(toYMD(value))}</Text>
      </Pressable>
    );
  }

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, { minHeight: 48 }]}>{input}</View>
    </View>
  );
}

// Define the common styles used by all reusable UI components
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  roundBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, ...shadow },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#e3eef5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.primary },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 4 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: radius.pill, paddingHorizontal: 22 },
  btnSmall: { height: 32, paddingHorizontal: 12 },
  btnText: { fontSize: 15, fontWeight: '700' },
  label: { color: colors.primary, fontWeight: '600', marginBottom: 6, fontSize: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
  input: { flex: 1, minHeight: 48, fontSize: 15, color: colors.text },
  dateAndroid: { flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  segment: { flexDirection: 'row', backgroundColor: '#dfe8f0', borderRadius: radius.md, padding: 4 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.sm },
  segItemActive: { backgroundColor: '#fff', ...shadow, shadowOpacity: 0.06 },
  segText: { fontWeight: '600', color: colors.muted, fontSize: 14, textTransform: 'capitalize' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 36, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
});