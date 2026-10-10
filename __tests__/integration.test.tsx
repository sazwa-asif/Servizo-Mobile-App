import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { DEMO_CUSTOMER_EMAIL, DEMO_PASSWORD, DEMO_PROVIDER_EMAIL } from '../src/data/seed';
import { AppProvider, NewBookingInput, useApp } from '../src/store/AppContext';

const wrapper = ({ children }: { children: React.ReactNode }) => <AppProvider>{children}</AppProvider>;

async function setup() {
  const hook = await renderHook(() => useApp(), { wrapper });
  await act(async () => {});
  return hook;
}

const request: NewBookingInput = {
  providerId: 'p1',
  category: 'plumbing',
  service: 'Leak repair',
  description: 'Pipe under the sink is leaking.',
  photos: ['file:///a.jpg', 'file:///b.jpg'],
  date: '2030-01-10',
  time: '10:00',
  address: 'Gulshan, Karachi',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

async function customerCreates(hook: Awaited<ReturnType<typeof setup>>) {
  await act(async () => { hook.result.current.login(DEMO_CUSTOMER_EMAIL, DEMO_PASSWORD); });
  let id = '';
  await act(async () => { id = hook.result.current.createBooking(request); });
  await act(async () => { hook.result.current.logout(); });
  return id;
}

const as = async (hook: Awaited<ReturnType<typeof setup>>, email: string) =>
  act(async () => { hook.result.current.login(email, DEMO_PASSWORD); });

describe('I1 sign up and log in', () => {
  it('registers a customer, logs in, rejects bad credentials and duplicates', async () => {
    const hook = await setup();
    let res: any;
    await act(async () => {
      res = hook.result.current.register({ role: 'customer', name: 'Test User', email: 'test@x.com', phone: '0300', password: 'secret1' });
    });
    expect(res.ok).toBe(true);
    expect(hook.result.current.user?.name).toBe('Test User');

    await act(async () => { hook.result.current.logout(); });
    expect(hook.result.current.user).toBeNull();

    await act(async () => { res = hook.result.current.login('test@x.com', 'wrong'); });
    expect(res.ok).toBe(false);
    expect(hook.result.current.user).toBeNull();

    await act(async () => { res = hook.result.current.login('TEST@x.com', 'secret1'); });
    expect(res.ok).toBe(true);

    await act(async () => { hook.result.current.logout(); });
    await act(async () => {
      res = hook.result.current.register({ role: 'customer', name: 'Dup', email: 'test@x.com', phone: '1', password: 'secret1' });
    });
    expect(res.ok).toBe(false);
  });

  it('registering a provider creates a public provider profile', async () => {
    const hook = await setup();
    const before = hook.result.current.providers.length;
    await act(async () => {
      hook.result.current.register({ role: 'provider', name: 'New Plumber', email: 'np@x.com', phone: '0301', password: 'secret1', category: 'plumbing', area: 'Korangi, Karachi', experienceYears: 3 });
    });
    expect(hook.result.current.providers.length).toBe(before + 1);
    expect(hook.result.current.provider?.area).toBe('Korangi, Karachi');
  });
});

describe('I2 role-based data access', () => {
  it('customers and providers only see their own bookings', async () => {
    const hook = await setup();
    await as(hook, DEMO_CUSTOMER_EMAIL);
    const customerIds = hook.result.current.bookings.map((b) => b.id);
    expect(customerIds.length).toBeGreaterThan(0);
    expect(hook.result.current.bookings.every((b) => b.customerId === 'u1')).toBe(true);

    await act(async () => { hook.result.current.logout(); });
    await as(hook, DEMO_PROVIDER_EMAIL);
    expect(hook.result.current.bookings.every((b) => b.providerId === 'p1')).toBe(true);

    await act(async () => { hook.result.current.logout(); });
    await act(async () => {
      hook.result.current.register({ role: 'provider', name: 'Other', email: 'o@x.com', phone: '1', password: 'secret1', category: 'painter', area: 'DHA' });
    });
    expect(hook.result.current.bookings).toHaveLength(0);
  });
});

describe('I3 request with photos', () => {
  it('saves the booking with its photos and notifies the provider', async () => {
    const hook = await setup();
    const id = await customerCreates(hook);
    await as(hook, DEMO_PROVIDER_EMAIL);
    const b = hook.result.current.getBooking(id)!;
    expect(b.status).toBe('Requested');
    expect(b.photos).toHaveLength(2);
    expect(hook.result.current.notifications.some((n) => n.bookingId === id && n.title === 'New service request')).toBe(true);
    expect(hook.result.current.unreadCount).toBeGreaterThan(0);
  });
});

describe('I4 full lifecycle', () => {
  it('Requested -> Accepted -> Scheduled -> In Progress -> Completed, in order, with history and notifications', async () => {
    const hook = await setup();
    const id = await customerCreates(hook);
    await as(hook, DEMO_PROVIDER_EMAIL);
    const jobsBefore = hook.result.current.providerCompletedJobs('p1');

    await act(async () => { hook.result.current.setStatus(id, 'Accepted'); });
    await act(async () => { hook.result.current.scheduleBooking(id, '2030-01-11', '14:30'); });
    await act(async () => { hook.result.current.setStatus(id, 'In Progress'); });
    await act(async () => { hook.result.current.setStatus(id, 'Completed'); });

    const b = hook.result.current.getBooking(id)!;
    expect(b.history.map((h) => h.status)).toEqual(['Requested', 'Accepted', 'Scheduled', 'In Progress', 'Completed']);
    expect(b.date).toBe('2030-01-11');
    expect(b.time).toBe('14:30');
    expect(hook.result.current.providerCompletedJobs('p1')).toBe(jobsBefore + 1);

    await act(async () => { hook.result.current.logout(); });
    await as(hook, DEMO_CUSTOMER_EMAIL);
    const titles = hook.result.current.notifications.filter((n) => n.bookingId === id).map((n) => n.title);
    expect(titles).toEqual(expect.arrayContaining(['Booking Accepted', 'Booking Scheduled', 'Booking In Progress', 'Booking Completed']));
  });
});

describe('I5 reject and cancel', () => {
  it('provider rejects one request and customer cancels another', async () => {
    const hook = await setup();
    const a = await customerCreates(hook);
    const b = await customerCreates(hook);

    await as(hook, DEMO_PROVIDER_EMAIL);
    await act(async () => { hook.result.current.setStatus(a, 'Rejected'); });
    expect(hook.result.current.getBooking(a)!.status).toBe('Rejected');

    await act(async () => { hook.result.current.logout(); });
    await as(hook, DEMO_CUSTOMER_EMAIL);
    await act(async () => { hook.result.current.cancelBooking(b); });
    expect(hook.result.current.getBooking(b)!.status).toBe('Cancelled');

    await act(async () => { hook.result.current.logout(); });
    await as(hook, DEMO_PROVIDER_EMAIL);
    expect(hook.result.current.notifications.some((n) => n.bookingId === b && n.title === 'Booking Cancelled')).toBe(true);
  });
});

describe('I6 reschedule', () => {
  it('moves the date and sends an accepted booking back to Requested for re-confirmation', async () => {
    const hook = await setup();
    const id = await customerCreates(hook);
    await as(hook, DEMO_PROVIDER_EMAIL);
    await act(async () => { hook.result.current.setStatus(id, 'Accepted'); });
    await act(async () => { hook.result.current.logout(); });

    await as(hook, DEMO_CUSTOMER_EMAIL);
    await act(async () => { hook.result.current.rescheduleBooking(id, '2030-02-02', '09:00'); });
    const b = hook.result.current.getBooking(id)!;
    expect(b.status).toBe('Requested');
    expect(b.date).toBe('2030-02-02');
    expect(b.time).toBe('09:00');

    await act(async () => { hook.result.current.logout(); });
    await as(hook, DEMO_PROVIDER_EMAIL);
    expect(hook.result.current.notifications.some((n) => n.bookingId === id && n.title === 'Booking rescheduled')).toBe(true);
  });
});

describe('I7 reviews', () => {
  it('a review updates the provider rating and only one review per booking is kept', async () => {
    const hook = await setup();
    const id = await customerCreates(hook);
    await as(hook, DEMO_PROVIDER_EMAIL);
    for (const s of ['Accepted', 'Scheduled', 'In Progress', 'Completed'] as const) {
      await act(async () => { hook.result.current.setStatus(id, s); });
    }
    await act(async () => { hook.result.current.logout(); });
    await as(hook, DEMO_CUSTOMER_EMAIL);

    const before = hook.result.current.providerRating('p1');
    await act(async () => { hook.result.current.addReview(id, 1, 'Late'); });
    await act(async () => { hook.result.current.addReview(id, 5, 'Duplicate'); });
    const after = hook.result.current.providerRating('p1');
    expect(after.count).toBe(before.count + 1);
    expect(after.avg).toBeLessThan(before.avg!);
    expect(hook.result.current.reviewForBooking(id)?.text).toBe('Late');
  });
});

describe('I8 persistence', () => {
  it('restores the session and bookings after the app restarts', async () => {
    const first = await setup();
    const id = await customerCreates(first);
    await as(first, DEMO_CUSTOMER_EMAIL);
    await act(async () => { await first.unmount(); });

    const second = await setup();
    expect(second.result.current.user?.email).toBe(DEMO_CUSTOMER_EMAIL);
    expect(second.result.current.getBooking(id)).toBeTruthy();
  });
});
