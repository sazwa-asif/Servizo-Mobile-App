import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Booking, BookingStatus, CategoryId, Role, User } from './data';
import { loadSession, saveSession } from './lib/secureSession';

const STORAGE_KEY = 'servizo.mobile.v3';

interface DB {
  users: User[];
  bookings: Booking[];
}

const emptyDB = (): DB => ({ users: [], bookings: [] });

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

type Result = { ok: true } | { ok: false; error: string };

interface AppContextValue {
  ready: boolean;
  user: User | null;
  bookings: Booking[];

  login: (email: string, password: string, role: Role) => Result;
  register: (input: Omit<User, 'id'>) => Result;
  logout: () => void;

  getUserName: (id: string) => string;
  createBooking: (input: Pick<Booking, 'category' | 'description' | 'price' | 'date' | 'address'>) => void;
  cancelBooking: (id: string) => void;
  acceptOffer: (id: string) => void;
  setStatus: (id: string, to: BookingStatus) => void;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(emptyDB);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setDb({ ...emptyDB(), ...JSON.parse(raw) });
      } catch {}
      setSessionUserId(await loadSession());
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db)).catch(() => {});
  }, [db]);

  useEffect(() => {
    if (!loaded.current) return;
    saveSession(sessionUserId);
  }, [sessionUserId]);

  const dbRef = useRef(db);
  dbRef.current = db;

  const user = db.users.find((u) => u.id === sessionUserId) ?? null;

  const value = useMemo<AppContextValue>(() => {
    // Customers see their own bookings. Providers see their accepted jobs plus
    // open offers for their service category.
    const bookings = !user
      ? []
      : db.bookings
          .filter((b) => {
            if (user.role === 'customer') return b.customerId === user.id;
            if (b.providerId) return b.providerId === user.id;
            return b.status === 'Requested' && b.category === user.category;
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const update = (id: string, fn: (b: Booking) => Booking) =>
      setDb((d) => ({ ...d, bookings: d.bookings.map((b) => (b.id === id ? fn(b) : b)) }));

    return {
      ready,
      user,
      bookings,

      login: (email, password, role) => {
        const u = dbRef.current.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
        if (!u || u.password !== password) return { ok: false, error: 'Incorrect email or password.' };
        if (u.role !== role) return { ok: false, error: `This is a ${u.role} account. Switch to ${u.role} to log in.` };
        setSessionUserId(u.id);
        return { ok: true };
      },

      register: (input) => {
        const d = dbRef.current;
        if (d.users.some((x) => x.email.toLowerCase() === input.email.trim().toLowerCase())) {
          return { ok: false, error: 'An account with this email already exists.' };
        }
        const id = uid('u');
        setDb({ ...d, users: [...d.users, { ...input, id, name: input.name.trim(), email: input.email.trim() }] });
        setSessionUserId(id);
        return { ok: true };
      },

      logout: () => setSessionUserId(null),

      getUserName: (id) => db.users.find((u) => u.id === id)?.name ?? 'Customer',

      createBooking: (input) =>
        setDb((d) => {
          if (!user) return d;
          const b: Booking = {
            id: uid('b'),
            customerId: user.id,
            ...input,
            status: 'Requested',
            createdAt: new Date().toISOString(),
          };
          return { ...d, bookings: [b, ...d.bookings] };
        }),

      cancelBooking: (id) => update(id, (b) => ({ ...b, status: 'Cancelled' })),

      acceptOffer: (id) =>
        update(id, (b) => (user && !b.providerId ? { ...b, providerId: user.id, status: 'Accepted' } : b)),

      setStatus: (id, to) => update(id, (b) => ({ ...b, status: to })),
    };
  }, [db, ready, user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
