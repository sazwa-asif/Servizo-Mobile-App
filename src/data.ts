import { colors } from './theme';

export type Role = 'customer' | 'provider';

export type CategoryId = 'plumbing' | 'electrical' | 'carpentry' | 'cleaner' | 'gardener' | 'painter';

export type BookingStatus = 'Requested' | 'Accepted' | 'Completed' | 'Cancelled';

export interface Category {
  id: CategoryId;
  name: string;
  startingPrice: number;
  image: number;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  category?: CategoryId;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId?: string;
  category: CategoryId;
  description: string;
  price: number;
  date: string;
  address: string;
  status: BookingStatus;
  createdAt: string;
}

export const CATEGORIES: Category[] = [
  { id: 'plumbing', name: 'Plumbing', startingPrice: 500, image: require('../assets/images/plumbing_logo.jpg') },
  { id: 'electrical', name: 'Electrical', startingPrice: 700, image: require('../assets/images/electrical_logo.jpg') },
  { id: 'carpentry', name: 'Carpentry', startingPrice: 1500, image: require('../assets/images/carpentry_logo.jpg') },
  { id: 'cleaner', name: 'Cleaner', startingPrice: 500, image: require('../assets/images/cleaner_logo.jpg') },
  { id: 'gardener', name: 'Gardener', startingPrice: 800, image: require('../assets/images/gardener_logo.jpg') },
  { id: 'painter', name: 'Painter', startingPrice: 3000, image: require('../assets/images/painter_logo.jpg') },
];

export const categoryOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export const STATUS_COLOR: Record<BookingStatus, string> = {
  Requested: colors.warning,
  Accepted: colors.info,
  Completed: colors.success,
  Cancelled: colors.muted,
};

export const customerCanCancel = (b: Booking) => b.status === 'Requested' || b.status === 'Accepted';

export const providerNextStep: Partial<Record<BookingStatus, { to: BookingStatus; label: string }>> = {
  Accepted: { to: 'Completed', label: 'Complete' },
};

export const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
