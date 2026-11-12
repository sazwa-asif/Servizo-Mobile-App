
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Booking, BookingStatus, Role, User } from './data';
import { loadSession, saveSession } from './lib/secureSession';
import { supabase } from './lib/supabase';

// Generate unique IDs for users and bookings.
const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// Define success and error response formats.
type Result = { ok: true } | { ok: false; error: string };

const NO_CONNECTION: Result = { ok: false, error: 'Could not connect to the database.' };

// Define the data and functions shared across the application.
interface AppContextValue {
  ready: boolean;
  user: User | null;
  bookings: Booking[];

  login: (email: string, password: string, role: Role) => Promise<Result>;
  register: (input: Omit<User, 'id'>) => Promise<Result>;
  logout: () => void;

  getUserName: (id: string) => string;
  createBooking: (input: Pick<Booking, 'category' | 'description' | 'price' | 'date' | 'address'>) => Promise<void>;
  cancelBooking: (id: string) => void;
  acceptOffer: (id: string) => void;
  setStatus: (id: string, to: BookingStatus) => void;
}

// Create a shared Context for application data.
const Ctx = createContext<AppContextValue | null>(null);

// Manage shared application state and database operations.
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<{ users: User[]; bookings: Booking[] }>({ users: [], bookings: [] });
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // Fetch the latest users and bookings from Supabase.
  const refresh = useCallback(async () => {
    const [u, b] = await Promise.all([supabase.from('users').select('*'), supabase.from('bookings').select('*')]);
    if (u.data && b.data) setDb({ users: u.data as User[], bookings: b.data as Booking[] });
  }, []);

  // Load initial data, restore the session and refresh every 5 seconds.
  useEffect(() => {
    (async () => {
      await refresh().catch(() => {});
      setSessionUserId(await loadSession());
      loaded.current = true;
      setReady(true);
    })();
    const timer = setInterval(() => refresh().catch(() => {}), 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  // Save the session whenever the logged-in user changes.
  useEffect(() => {
    if (!loaded.current) return;
    saveSession(sessionUserId);
  }, [sessionUserId]);

  // Find the currently logged-in user.
  const user = db.users.find((u) => u.id === sessionUserId) ?? null;

  const value = useMemo<AppContextValue>(() => {
    // Filter bookings according to the user's role and sort newest first.
    const bookings = !user
      ? []
      : db.bookings
          .filter((b) => {
            if (user.role === 'customer') return b.customerId === user.id;
            if (b.providerId) return b.providerId === user.id;
            return b.status === 'Requested' && b.category === user.category;
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // Update a booking in Supabase and refresh local data.
    const updateBooking = async (id: string, changes: Partial<Booking>) => {
      await supabase.from('bookings').update(changes).eq('id', id);
      await refresh();
    };

    return {
      ready,
      user,
      bookings,

      // Verify credentials and log in the user.
      login: async (email, password, role) => {
        const { data, error } = await supabase.from('users').select('*').eq('email', email.trim().toLowerCase()).maybeSingle();
        if (error) return NO_CONNECTION;
        if (!data || data.password !== password) return { ok: false, error: 'Incorrect email or password.' };
        if (data.role !== role) return { ok: false, error: `This is a ${data.role} account. Switch to ${data.role} to log in.` };
        await refresh();
        setSessionUserId(data.id);
        return { ok: true };
      },

      // Check email, create a new account and log in automatically.
      register: async (input) => {
        const email = input.email.trim().toLowerCase();
        const { data: existing, error } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
        if (error) return NO_CONNECTION;
        if (existing) return { ok: false, error: 'An account with this email already exists.' };
        const id = uid('u');
        const { error: insertError } = await supabase.from('users').insert({ ...input, id, name: input.name.trim(), email });
        if (insertError) return NO_CONNECTION;
        await refresh();
        setSessionUserId(id);
        return { ok: true };
      },

      // Log out the current user.
      logout: () => setSessionUserId(null),

      // Find a user's name using their ID.
      getUserName: (id) => db.users.find((u) => u.id === id)?.name ?? 'Customer',

      // Create a new booking with the customer ID and initial status.
      createBooking: async (input) => {
        if (!user) return;
        await supabase.from('bookings').insert({
          id: uid('b'),
          customerId: user.id,
          ...input,
          status: 'Requested',
          createdAt: new Date().toISOString(),
        });
        await refresh();
      },

      // Cancel a booking.
      cancelBooking: (id) => updateBooking(id, { status: 'Cancelled' }),

      // Assign the booking to the provider and accept the offer.
      acceptOffer: (id) => updateBooking(id, { providerId: user?.id, status: 'Accepted' }),

      // Change a booking's status.
      setStatus: (id, to) => updateBooking(id, { status: to }),
    };
  }, [db, ready, user, refresh]);

  // Make shared data and functions available to child components.
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Custom hook to access the application Context in any child component.
export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
