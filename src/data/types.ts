export type Role = 'customer' | 'provider';

export type CategoryId =
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'cleaner'
  | 'gardener'
  | 'painter';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  startingPrice: number;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  providerId?: string;
}

export interface Provider {
  id: string;
  name: string;
  category: CategoryId;
  phone: string;
  area: string;
  experienceYears: number;
  bio: string;
  services: string[];
  verified: boolean;
}

export type BookingStatus =
  | 'Requested'
  | 'Accepted'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface StatusEvent {
  status: BookingStatus;
  at: string;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  category: CategoryId;
  service: string;
  description: string;
  photos: string[];
  date: string;
  time: string;
  address: string;
  latitude?: number;
  longitude?: number;
  status: BookingStatus;
  history: StatusEvent[];
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  bookingId?: string;
  read: boolean;
  createdAt: string;
}
