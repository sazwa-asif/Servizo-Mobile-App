import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DateTimeField } from '../../src/components/DateTimeField';
import {
  Button,
  Card,
  CategoryAvatar,
  EmptyState,
  Field,
  Header,
  InfoRow,
  SectionTitle,
  StarPicker,
  Stars,
  StatusBadge,
  StatusTracker,
} from '../../src/components/ui';
import {
  bookingDateTime,
  customerCanChange,
  formatDate,
  formatStamp,
  formatTime,
  mapsUrl,
  providerNextStep,
  STATUS_COLOR,
  toHM,
  toYMD,
} from '../../src/lib/booking';
import { useApp } from '../../src/store/AppContext';
import { colors, radius } from '../../src/theme';

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, getBooking, getProvider, getUserName, setStatus, scheduleBooking, cancelBooking, rescheduleBooking, reviewForBooking, addReview } = useApp();
  const booking = getBooking(id);

  const [dateModal, setDateModal] = useState<null | 'reschedule' | 'schedule'>(null);
  const [when, setWhen] = useState(new Date());
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!booking || !user) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Booking" back />
        <EmptyState icon="alert-circle-outline" title="Booking not found" />
      </View>
    );
  }

  const isProvider = user.role === 'provider';
  const provider = getProvider(booking.providerId);
  const customerName = getUserName(booking.customerId);
  const review = reviewForBooking(booking.id);
  const next = providerNextStep[booking.status];

  const openDateModal = (kind: 'reschedule' | 'schedule') => {
    const d = bookingDateTime(booking);
    if (kind === 'reschedule' && d.getTime() < Date.now()) {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      t.setHours(d.getHours(), d.getMinutes(), 0, 0);
      setWhen(t);
    } else {
      setWhen(d);
    }
    setDateModal(kind);
  };

  const confirmDateModal = () => {
    if (when.getTime() < Date.now()) return Alert.alert('Pick a future time', 'The date and time must be in the future.');
    if (dateModal === 'reschedule') rescheduleBooking(booking.id, toYMD(when), toHM(when));
    else scheduleBooking(booking.id, toYMD(when), toHM(when));
    setDateModal(null);
  };

  const confirmCancel = () =>
    Alert.alert('Cancel booking?', 'The provider will be told this request was cancelled.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: () => cancelBooking(booking.id) },
    ]);

  const confirmReject = () =>
    Alert.alert('Reject request?', 'The customer will be notified.', [
      { text: 'Back', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => setStatus(booking.id, 'Rejected') },
    ]);

  const phone = isProvider ? undefined : provider?.phone;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={booking.service} subtitle={isProvider ? `Customer: ${customerName}` : provider?.name} back right={<StatusBadgeOnDark status={booking.status} />} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 + insets.bottom }}>
        <Card>
          <StatusTracker booking={booking} />
        </Card>

        <SectionTitle>Details</SectionTitle>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <CategoryAvatar category={booking.category} size={46} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>{isProvider ? customerName : provider?.name}</Text>
              <Text style={{ color: colors.muted }}>{isProvider ? 'Customer' : `${provider?.area}`}</Text>
            </View>
            {phone ? (
              <Pressable style={styles.roundBtn} onPress={() => Linking.openURL(`tel:${phone}`)}>
                <Ionicons name="call" size={18} color="#fff" />
              </Pressable>
            ) : null}
          </View>
          <InfoRow icon="calendar-outline">{formatDate(booking.date)} at {formatTime(booking.time)}</InfoRow>
          <InfoRow icon="location-outline">{booking.address}</InfoRow>
          <Button
            title="Open in Maps"
            icon="map-outline"
            variant="outline"
            small
            onPress={() => Linking.openURL(mapsUrl(booking))}
            style={{ alignSelf: 'flex-start', marginBottom: 12 }}
          />
          <Text style={styles.sub}>Problem description</Text>
          <Text style={{ color: colors.text, lineHeight: 21 }}>{booking.description}</Text>
        </Card>

        {booking.photos.length > 0 && (
          <>
            <SectionTitle>Photos</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {booking.photos.map((uri) => (
                <Pressable key={uri} onPress={() => setViewPhoto(uri)}>
                  <Image source={{ uri }} style={styles.thumb} />
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {isProvider ? (
          <>
            {booking.status === 'Requested' && (
              <View style={styles.actions}>
                <Button title="Reject" variant="outline" onPress={confirmReject} style={{ flex: 1 }} />
                <Button title="Accept" variant="accent" icon="checkmark" onPress={() => setStatus(booking.id, 'Accepted')} style={{ flex: 1.4 }} />
              </View>
            )}
            {booking.status === 'Accepted' && (
              <Button title="Confirm schedule" variant="accent" icon="calendar" onPress={() => openDateModal('schedule')} style={{ marginTop: 20 }} />
            )}
            {(booking.status === 'Scheduled' || booking.status === 'In Progress') && next && (
              <Button title={next.label} variant="accent" icon={booking.status === 'Scheduled' ? 'play' : 'checkmark-done'} onPress={() => setStatus(booking.id, next.to)} style={{ marginTop: 20 }} />
            )}
          </>
        ) : (
          <>
            {customerCanChange(booking) && (
              <View style={styles.actions}>
                <Button title="Cancel" variant="outline" icon="close" onPress={confirmCancel} style={{ flex: 1 }} />
                <Button title="Reschedule" variant="accent" icon="calendar" onPress={() => openDateModal('reschedule')} style={{ flex: 1.4 }} />
              </View>
            )}
            {booking.status === 'Completed' && (
              <>
                <SectionTitle>Your review</SectionTitle>
                <Card>
                  {review ? (
                    <>
                      <Stars value={review.rating} size={20} />
                      {review.text ? <Text style={{ marginTop: 8, color: colors.text }}>{review.text}</Text> : null}
                    </>
                  ) : (
                    <>
                      <Text style={{ color: colors.muted, marginBottom: 10 }}>How was the service from {provider?.name}?</Text>
                      <StarPicker value={rating} onChange={setRating} />
                      <View style={{ height: 14 }} />
                      <Field label="" value={comment} onChangeText={setComment} multiline placeholder="Share your experience (optional)" />
                      <Button
                        title="Submit review"
                        disabled={rating === 0}
                        onPress={() => {
                          addReview(booking.id, rating, comment);
                        }}
                      />
                    </>
                  )}
                </Card>
              </>
            )}
          </>
        )}

        <SectionTitle>Status history</SectionTitle>
        <Card>
          {[...booking.history].reverse().map((h, i) => (
            <View key={`${h.status}${h.at}`} style={styles.histRow}>
              <View style={[styles.histDot, { backgroundColor: STATUS_COLOR[h.status] }]} />
              <Text style={{ fontWeight: '600', color: colors.text, flex: 1 }}>{h.status}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{formatStamp(h.at)}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      <Modal visible={dateModal !== null} transparent animationType="slide" onRequestClose={() => setDateModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.sheetTitle}>{dateModal === 'reschedule' ? 'Choose a new date & time' : 'Confirm date & time'}</Text>
            <Text style={{ color: colors.muted, marginBottom: 16 }}>
              {dateModal === 'reschedule' ? 'The provider will need to confirm the new time again.' : 'The customer will be notified of the schedule.'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <DateTimeField
                label="Date"
                mode="date"
                value={when}
                minimumDate={new Date()}
                onChange={(d) => {
                  const n = new Date(when);
                  n.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
                  setWhen(n);
                }}
              />
              <DateTimeField
                label="Time"
                mode="time"
                value={when}
                onChange={(d) => {
                  const n = new Date(when);
                  n.setHours(d.getHours(), d.getMinutes(), 0, 0);
                  setWhen(n);
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Close" variant="outline" onPress={() => setDateModal(null)} style={{ flex: 1 }} />
              <Button title="Confirm" variant="accent" onPress={confirmDateModal} style={{ flex: 1.4 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!viewPhoto} transparent animationType="fade" onRequestClose={() => setViewPhoto(null)}>
        <Pressable style={styles.photoBackdrop} onPress={() => setViewPhoto(null)}>
          {viewPhoto ? <Image source={{ uri: viewPhoto }} style={{ width: '100%', height: '80%' }} resizeMode="contain" /> : null}
        </Pressable>
      </Modal>
    </View>
  );
}

function StatusBadgeOnDark({ status }: { status: Parameters<typeof StatusBadge>[0]['status'] }) {
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: radius.pill }}>
      <StatusBadge status={status} />
    </View>
  );
}

const styles = StyleSheet.create({
  roundBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  sub: { color: colors.primary, fontWeight: '700', marginBottom: 4 },
  thumb: { width: 110, height: 110, borderRadius: radius.md, marginRight: 10, backgroundColor: '#ddd' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  histDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  photoBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
});
