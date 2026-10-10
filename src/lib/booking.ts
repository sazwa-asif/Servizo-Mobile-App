import { Booking, BookingStatus } from '../data/types';
import { colors } from '../theme';

export const STATUS_FLOW: BookingStatus[] = ['Requested', 'Accepted', 'Scheduled', 'In Progress', 'Completed'];

export const STATUS_COLOR: Record<BookingStatus, string> = {
  Requested: colors.warning,
  Accepted: colors.info,
  Scheduled: colors.primaryLight,
  'In Progress': colors.accent,
  Completed: colors.success,
  Rejected: colors.danger,
  Cancelled: colors.muted,
};

export const isClosed = (s: BookingStatus) => s === 'Completed' || s === 'Rejected' || s === 'Cancelled';

export const customerCanChange = (b: Booking) =>
  b.status === 'Requested' || b.status === 'Accepted' || b.status === 'Scheduled';

export const providerNextStep: Partial<Record<BookingStatus, { to: BookingStatus; label: string }>> = {
  Accepted: { to: 'Scheduled', label: 'Confirm schedule' },
  Scheduled: { to: 'In Progress', label: 'Start job' },
  'In Progress': { to: 'Completed', label: 'Mark completed' },
};

export const bookingDateTime = (b: Pick<Booking, 'date' | 'time'>) => new Date(`${b.date}T${b.time}:00`);

export const formatDate = (date: string) => {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

export const formatStamp = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const toHM = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export const mapsUrl = (b: Pick<Booking, 'address' | 'latitude' | 'longitude'>) =>
  b.latitude != null && b.longitude != null
    ? `https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`;
