import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Booking, BookingStatus, CategoryId, Provider } from '../data/types';
import { formatDate, formatTime, STATUS_COLOR, STATUS_FLOW } from '../lib/booking';
import { categoryImage } from '../lib/images';
import { colors, radius, shadow } from '../theme';
import { CATEGORIES } from '../data/seed';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];


export function Header({
  title,
  subtitle,
  back,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.headerRow}>
        {back && (
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.headerSub} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </LinearGradient>
  );
}

export function Screen({
  children,
  scroll = true,
  style,
  padBottom = 24,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  padBottom?: number;
}) {
  if (!scroll) return <View style={[styles.screen, style]}>{children}</View>;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[{ padding: 16, paddingBottom: padBottom }, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const Comp: any = onPress ? Pressable : View;
  return (
    <Comp onPress={onPress} style={({ pressed }: any) => [styles.card, onPress && pressed && { opacity: 0.85 }, style]}>
      {children}
    </Comp>
  );
}

export function SectionTitle({ children, action, onAction }: { children: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

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


export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  small,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'outline' | 'light' | 'danger' | 'ghost';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = { primary: colors.primary, accent: colors.accent, outline: 'transparent', light: 'transparent', danger: colors.danger, ghost: 'transparent' }[variant];
  const fg = variant === 'outline' ? colors.primary : variant === 'ghost' ? colors.primaryLight : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: bg },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.primary },
        variant === 'light' && { borderWidth: 1.5, borderColor: '#fff' },
        variant === 'accent' && shadow,
        (disabled || loading) && { opacity: 0.55 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={fg} style={{ marginRight: 6 }} /> : null}
          <Text style={[styles.btnText, small && { fontSize: 13 }, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  icon,
  error,
  ...props
}: TextInputProps & { label: string; icon?: IconName; error?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error ? { borderColor: colors.danger } : null, props.multiline && { alignItems: 'flex-start' }]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.muted} style={{ marginRight: 8, marginTop: props.multiline ? 12 : 0 }} /> : null}
        <TextInput
          placeholderTextColor="#9aa7b5"
          {...props}
          style={[styles.input, props.multiline && { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 }]}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      {icon ? <Ionicons name={icon} size={14} color={active ? '#fff' : colors.primary} style={{ marginRight: 5 }} /> : null}
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

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


export function StatusBadge({ status }: { status: BookingStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <View style={[styles.badge, { backgroundColor: c + '22' }]}>
      <View style={[styles.badgeDot, { backgroundColor: c }]} />
      <Text style={[styles.badgeText, { color: c }]}>{status}</Text>
    </View>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name={i <= Math.round(value) ? 'star' : 'star-outline'} size={size} color={colors.accent} />
      ))}
    </View>
  );
}

export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} onPress={() => onChange(i)} hitSlop={6}>
          <Ionicons name={i <= value ? 'star' : 'star-outline'} size={34} color={colors.accent} />
        </Pressable>
      ))}
    </View>
  );
}

export function CategoryAvatar({ category, size = 56 }: { category: CategoryId; size?: number }) {
  return (
    <Image
      source={categoryImage[category]}
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: colors.accent, backgroundColor: '#fff' }}
    />
  );
}

export function InfoRow({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.primaryLight} style={{ marginTop: 2 }} />
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

export function StatusTracker({ booking }: { booking: Booking }) {
  const closed = booking.status === 'Rejected' || booking.status === 'Cancelled';
  const reached = new Set(booking.history.map((h) => h.status));
  const currentIdx = STATUS_FLOW.indexOf(booking.status);
  return (
    <View>
      <View style={styles.trackerRow}>
        {STATUS_FLOW.map((s, i) => {
          const done = reached.has(s) || i < currentIdx;
          const current = s === booking.status;
          const col = closed ? colors.border : done ? colors.success : colors.border;
          return (
            <React.Fragment key={s}>
              {i > 0 && <View style={[styles.trackerLine, { backgroundColor: done && !closed ? colors.success : colors.border }]} />}
              <View style={[styles.trackerDot, { backgroundColor: done && !closed ? col : '#fff', borderColor: current && !closed ? colors.accent : col }]}>
                {done && !closed ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
              </View>
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.trackerLabels}>
        {STATUS_FLOW.map((s) => (
          <Text key={s} style={[styles.trackerLabel, s === booking.status && !closed && { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
            {s}
          </Text>
        ))}
      </View>
      {closed && (
        <View style={[styles.closedBanner, { backgroundColor: STATUS_COLOR[booking.status] + '18' }]}>
          <Ionicons name={booking.status === 'Rejected' ? 'close-circle' : 'ban'} size={16} color={STATUS_COLOR[booking.status]} />
          <Text style={{ color: STATUS_COLOR[booking.status], fontWeight: '600', marginLeft: 6 }}>
            This request was {booking.status.toLowerCase()}
          </Text>
        </View>
      )}
    </View>
  );
}

export function ProviderCard({
  provider,
  rating,
  jobs,
  onPress,
}: {
  provider: Provider;
  rating: number | null;
  jobs: number;
  onPress: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === provider.category)!;
  return (
    <Card onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
      <CategoryAvatar category={provider.category} size={64} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{provider.name}</Text>
          {provider.verified && <Ionicons name="checkmark-circle" size={16} color={colors.info} style={{ marginLeft: 4 }} />}
        </View>
        <Text style={styles.muted}>{cat.name} · {provider.experienceYears} yrs</Text>
        <Text style={styles.muted} numberOfLines={1}>📍 {provider.area}</Text>
        <Text style={{ color: colors.accent, fontWeight: '700', marginTop: 2 }}>
          ⭐ {rating != null ? rating.toFixed(1) : 'New'} <Text style={{ color: colors.muted, fontWeight: '400' }}>({jobs} jobs)</Text>
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Card>
  );
}

export function BookingCard({
  booking,
  title,
  subtitle,
  onPress,
}: {
  booking: Booking;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CategoryAvatar category={booking.category} size={48} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{booking.service}</Text>
          <Text style={styles.muted} numberOfLines={1}>{title}</Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>
      <View style={styles.divider} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.metaText}>📅 {formatDate(booking.date)} · {formatTime(booking.time)}</Text>
      </View>
      <Text style={[styles.metaText, { marginTop: 4 }]} numberOfLines={1}>{subtitle}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingBottom: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, ...shadow },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13, marginTop: 1 },
  metaText: { color: colors.text, fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.primary },
  sectionAction: { color: colors.accent, fontWeight: '600', fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#e3eef5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.primary },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 4 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: radius.pill, paddingHorizontal: 22 },
  btnSmall: { height: 38, paddingHorizontal: 16 },
  btnText: { fontSize: 15, fontWeight: '700' },
  label: { color: colors.primary, fontWeight: '600', marginBottom: 6, fontSize: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
  input: { flex: 1, minHeight: 48, fontSize: 15, color: colors.text },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 36, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  segment: { flexDirection: 'row', backgroundColor: '#dfe8f0', borderRadius: radius.md, padding: 4 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.sm },
  segItemActive: { backgroundColor: '#fff', ...shadow, shadowOpacity: 0.06 },
  segText: { fontWeight: '600', color: colors.muted, fontSize: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoText: { flex: 1, marginLeft: 8, color: colors.text, fontSize: 14, lineHeight: 20 },
  trackerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  trackerLine: { flex: 1, height: 3, borderRadius: 2 },
  trackerDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  trackerLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  trackerLabel: { flex: 1, textAlign: 'center', fontSize: 10, color: colors.muted },
  closedBanner: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: radius.md, marginTop: 12 },
});

export { formatDate, formatTime };
