import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BOOKINGS, PROVIDERS, REVIEWS, SEED_COMPLETED_JOBS, USERS } from '../data/seed';
import {
  AppNotification,
  Booking,
  BookingStatus,
  CategoryId,
  Provider,
  Review,
  Role,
  User,
} from '../data/types';


const STORAGE_KEY = 'servizo.mobile.v1';

interface DB {
  users: User[];
  providers: Provider[];
  bookings: Booking[];
  reviews: Review[];
  notifications: AppNotification[];
  sessionUserId: string | null;
}

const seedDB = (): DB => ({
  users: USERS,
  providers: PROVIDERS,
  bookings: BOOKINGS,
  reviews: REVIEWS,
  notifications: [],
  sessionUserId: null,
});

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export interface NewBookingInput {
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
}

export interface RegisterInput {
  role: Role;
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  category?: CategoryId;
  area?: string;
  experienceYears?: number;
  bio?: string;
}

type Result = { ok: true } | { ok: false; error: string };

interface AppContextValue {
  ready: boolean;
  user: User | null;
  provider: Provider | null;
  providers: Provider[];
  bookings: Booking[];
  notifications: AppNotification[];
  unreadCount: number;

  login: (email: string, password: string) => Result;
  register: (input: RegisterInput) => Result;
  logout: () => void;

  getProvider: (id: string) => Provider | undefined;
  getBooking: (id: string) => Booking | undefined;
  getUserName: (id: string) => string;
  providerRating: (providerId: string) => { avg: number | null; count: number };
  providerCompletedJobs: (providerId: string) => number;
  providerReviews: (providerId: string) => Review[];
  reviewForBooking: (bookingId: string) => Review | undefined;

  createBooking: (input: NewBookingInput) => string;
  setStatus: (bookingId: string, to: BookingStatus) => void;
  scheduleBooking: (bookingId: string, date: string, time: string) => void;
  cancelBooking: (bookingId: string) => void;
  rescheduleBooking: (bookingId: string, date: string, time: string) => void;
  addReview: (bookingId: string, rating: number, text: string) => void;
  updateProviderProfile: (patch: Partial<Pick<Provider, 'area' | 'experienceYears' | 'bio' | 'services' | 'phone'>>) => void;
  markNotificationsRead: () => void;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(seedDB);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setDb({ ...seedDB(), ...JSON.parse(raw) });
      } catch {
      }
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db)).catch(() => {});
  }, [db]);

  const dbRef = useRef(db);
  dbRef.current = db;

  const user = db.users.find((u) => u.id === db.sessionUserId) ?? null;
  const provider = user?.providerId ? db.providers.find((p) => p.id === user.providerId) ?? null : null;

  const notify = (list: AppNotification[], userId: string, title: string, body: string, bookingId?: string) => [
    { id: uid('n'), userId, title, body, bookingId, read: false, createdAt: new Date().toISOString() },
    ...list,
  ];

  const providerUserId = (d: DB, providerId: string) => d.users.find((u) => u.providerId === providerId)?.id;

  const value = useMemo<AppContextValue>(() => {
    const bookings = !user
      ? []
      : db.bookings
          .filter((b) => (user.role === 'customer' ? b.customerId === user.id : b.providerId === user.providerId))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const notifications = user ? db.notifications.filter((n) => n.userId === user.id) : [];

    const ratingOf = (providerId: string) => {
      const rs = db.reviews.filter((r) => r.providerId === providerId);
      if (!rs.length) return { avg: null, count: 0 };
      return { avg: rs.reduce((s, r) => s + r.rating, 0) / rs.length, count: rs.length };
    };

    const setStatusInternal = (
      d: DB,
      bookingId: string,
      to: BookingStatus,
      actorRole: Role,
      extra?: Partial<Booking>,
      customerNote?: { title: string; body: string },
    ): DB => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b) return d;
      const now = new Date().toISOString();
      const updated: Booking = { ...b, ...extra, status: to, history: [...b.history, { status: to, at: now }] };
      const prov = d.providers.find((p) => p.id === b.providerId);
      let notifs = d.notifications;
      if (actorRole === 'provider') {
        const msg: Partial<Record<BookingStatus, string>> = {
          Accepted: `${prov?.name} accepted your ${b.service} request.`,
          Rejected: `${prov?.name} could not take your ${b.service} request.`,
          Scheduled: `${b.service} is scheduled for ${updated.date} at ${updated.time}.`,
          'In Progress': `${prov?.name} has started your ${b.service} job.`,
          Completed: `Your ${b.service} job is complete. Tell us how it went!`,
        };
        notifs = notify(notifs, b.customerId, `Booking ${to}`, msg[to] ?? `Status changed to ${to}.`, b.id);
      } else {
        const customer = d.users.find((u) => u.id === b.customerId);
        const target = providerUserId(d, b.providerId);
        if (target) {
          notifs = notify(
            notifs,
            target,
            customerNote?.title ?? `Booking ${to}`,
            customerNote?.body ?? `${customer?.name ?? 'The customer'} cancelled the ${b.service} request.`,
            b.id,
          );
        }
      }
      return { ...d, bookings: d.bookings.map((x) => (x.id === bookingId ? updated : x)), notifications: notifs };
    };

    return {
      ready,
      user,
      provider,
      providers: db.providers,
      bookings,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,

      login: (email, password) => {
        const u = dbRef.current.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
        if (!u || u.password !== password) return { ok: false, error: 'Incorrect email or password.' };
        setDb((d) => ({ ...d, sessionUserId: u.id }));
        return { ok: true };
      },

      register: (input) => {
        const d = dbRef.current;
        if (d.users.some((x) => x.email.toLowerCase() === input.email.trim().toLowerCase())) {
          return { ok: false, error: 'An account with this email already exists.' };
        }
        const id = uid('u');
        const newUser: User = {
          id,
          role: input.role,
          name: input.name.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          password: input.password,
          address: input.address?.trim(),
        };
        let providers = d.providers;
        if (input.role === 'provider' && input.category) {
          const pid = uid('p');
          newUser.providerId = pid;
          providers = [
            ...providers,
            {
              id: pid,
              name: newUser.name,
              category: input.category,
              phone: newUser.phone,
              area: input.area?.trim() || 'Karachi',
              experienceYears: input.experienceYears ?? 0,
              bio: input.bio?.trim() || 'Servizo service provider.',
              services: [],
              verified: true,
            },
          ];
        }
        setDb({ ...d, users: [...d.users, newUser], providers, sessionUserId: id });
        return { ok: true };
      },

      logout: () => setDb((d) => ({ ...d, sessionUserId: null })),

      getProvider: (id) => db.providers.find((p) => p.id === id),
      getBooking: (id) => db.bookings.find((b) => b.id === id),
      getUserName: (id) => db.users.find((u) => u.id === id)?.name ?? 'Customer',
      providerRating: ratingOf,
      providerCompletedJobs: (providerId) =>
        (SEED_COMPLETED_JOBS[providerId] ?? 0) +
        db.bookings.filter((b) => b.providerId === providerId && b.status === 'Completed').length,
      providerReviews: (providerId) =>
        db.reviews.filter((r) => r.providerId === providerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      reviewForBooking: (bookingId) => db.reviews.find((r) => r.bookingId === bookingId),

      createBooking: (input) => {
        const id = uid('b');
        setDb((d) => {
          if (!d.sessionUserId) return d;
          const now = new Date().toISOString();
          const b: Booking = {
            id,
            customerId: d.sessionUserId,
            ...input,
            status: 'Requested',
            history: [{ status: 'Requested', at: now }],
            createdAt: now,
          };
          const customer = d.users.find((u) => u.id === d.sessionUserId);
          const target = providerUserId(d, input.providerId);
          return {
            ...d,
            bookings: [b, ...d.bookings],
            notifications: target
              ? notify(d.notifications, target, 'New service request', `${customer?.name} requested ${input.service} on ${input.date} at ${input.time}.`, id)
              : d.notifications,
          };
        });
        return id;
      },

      setStatus: (bookingId, to) => setDb((d) => setStatusInternal(d, bookingId, to, 'provider')),

      scheduleBooking: (bookingId, date, time) =>
        setDb((d) => setStatusInternal(d, bookingId, 'Scheduled', 'provider', { date, time })),

      cancelBooking: (bookingId) => setDb((d) => setStatusInternal(d, bookingId, 'Cancelled', 'customer')),

      rescheduleBooking: (bookingId, date, time) =>
        setDb((d) => {
          const b = d.bookings.find((x) => x.id === bookingId);
          const customer = d.users.find((u) => u.id === b?.customerId);
          return setStatusInternal(d, bookingId, 'Requested', 'customer', { date, time }, {
            title: 'Booking rescheduled',
            body: `${customer?.name} moved ${b?.service} to ${date} at ${time}. Please re-confirm.`,
          });
        }),

      addReview: (bookingId, rating, text) =>
        setDb((d) => {
          const b = d.bookings.find((x) => x.id === bookingId);
          if (!b || d.reviews.some((r) => r.bookingId === bookingId)) return d;
          const customer = d.users.find((u) => u.id === b.customerId);
          const review: Review = {
            id: uid('r'),
            bookingId,
            providerId: b.providerId,
            customerId: b.customerId,
            customerName: customer?.name ?? 'Customer',
            rating,
            text: text.trim(),
            createdAt: new Date().toISOString(),
          };
          const target = providerUserId(d, b.providerId);
          return {
            ...d,
            reviews: [review, ...d.reviews],
            notifications: target
              ? notify(d.notifications, target, 'New review', `${customer?.name} rated you ${rating}/5 for ${b.service}.`, bookingId)
              : d.notifications,
          };
        }),

      updateProviderProfile: (patch) =>
        setDb((d) => {
          const me = d.users.find((u) => u.id === d.sessionUserId);
          if (!me?.providerId) return d;
          return { ...d, providers: d.providers.map((p) => (p.id === me.providerId ? { ...p, ...patch } : p)) };
        }),

      markNotificationsRead: () =>
        setDb((d) => ({
          ...d,
          notifications: d.notifications.map((n) => (n.userId === d.sessionUserId ? { ...n, read: true } : n)),
        })),
    };
  }, [db, ready, user, provider]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
