import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { StatusBadge } from '../src/components/ui';
import { CATEGORIES, PROVIDERS, SERVICES_BY_CATEGORY } from '../src/data/seed';
import { BookingStatus } from '../src/data/types';
import {
  customerCanChange,
  isClosed,
  mapsUrl,
  providerNextStep,
  STATUS_COLOR,
  STATUS_FLOW,
  toHM,
  toYMD,
} from '../src/lib/booking';
import { areaName, filterProviders, ProviderFilter, ProviderRow } from '../src/lib/providers';

const ALL: BookingStatus[] = ['Requested', 'Accepted', 'Scheduled', 'In Progress', 'Completed', 'Rejected', 'Cancelled'];

describe('U1 status flow', () => {
  it('has the five stages in order', () => {
    expect(STATUS_FLOW).toEqual(['Requested', 'Accepted', 'Scheduled', 'In Progress', 'Completed']);
  });

  it('only allows the next stage for the provider', () => {
    expect(providerNextStep.Accepted?.to).toBe('Scheduled');
    expect(providerNextStep.Scheduled?.to).toBe('In Progress');
    expect(providerNextStep['In Progress']?.to).toBe('Completed');
  });

  it('offers no provider step from Requested (accept/reject is separate) or from closed states', () => {
    for (const s of ['Requested', 'Completed', 'Rejected', 'Cancelled'] as BookingStatus[]) {
      expect(providerNextStep[s]).toBeUndefined();
    }
  });
});

describe('U2 customer cancel / reschedule rule', () => {
  it.each(['Requested', 'Accepted', 'Scheduled'] as BookingStatus[])('allowed while %s', (status) => {
    expect(customerCanChange({ status } as any)).toBe(true);
  });
  it.each(['In Progress', 'Completed', 'Rejected', 'Cancelled'] as BookingStatus[])('blocked once %s', (status) => {
    expect(customerCanChange({ status } as any)).toBe(false);
  });
});

describe('U3 closed states', () => {
  it('marks only Completed, Rejected and Cancelled as closed', () => {
    expect(ALL.filter(isClosed)).toEqual(['Completed', 'Rejected', 'Cancelled']);
  });
});

describe('U4 date helpers use local time', () => {
  it('keeps the local calendar day late in the evening (no UTC shift)', () => {
    const d = new Date(2026, 9, 3, 23, 30);
    expect(toYMD(d)).toBe('2026-10-03');
    expect(toHM(d)).toBe('23:30');
  });
  it('pads single-digit months, days and hours', () => {
    const d = new Date(2026, 0, 5, 7, 5);
    expect(toYMD(d)).toBe('2026-01-05');
    expect(toHM(d)).toBe('07:05');
  });
});

describe('U5 maps link', () => {
  it('uses coordinates when the location was pinned with GPS', () => {
    expect(mapsUrl({ address: 'x', latitude: 24.86, longitude: 67.01 })).toContain('query=24.86,67.01');
  });
  it('falls back to the encoded address', () => {
    expect(mapsUrl({ address: 'Gulshan, Karachi' })).toContain('query=Gulshan%2C%20Karachi');
  });
});

describe('U6 StatusBadge', () => {
  it.each(ALL)('shows the label for %s and has a colour', async (status) => {
    await render(<StatusBadge status={status} />);
    expect(screen.getByText(status)).toBeTruthy();
    expect(STATUS_COLOR[status]).toMatch(/^#/);
  });
});

describe('U7 provider search and filters', () => {
  const rows: ProviderRow[] = PROVIDERS.map((p, i) => ({ p, rating: [4.5, 5, 4, 5, 4, 4, 5, null][i], jobs: (i + 1) * 5 }));
  const base: ProviderFilter = { query: '', category: 'all', area: 'all', minRating: 0, sort: 'rating' };

  it('returns everyone with no filters', () => {
    expect(filterProviders(rows, base)).toHaveLength(PROVIDERS.length);
  });
  it('filters by category', () => {
    const out = filterProviders(rows, { ...base, category: 'electrical' });
    expect(out.length).toBe(2);
    expect(out.every((r) => r.p.category === 'electrical')).toBe(true);
  });
  it('filters by area', () => {
    const out = filterProviders(rows, { ...base, area: 'Gulshan' });
    expect(out.map((r) => r.p.name)).toEqual(['Aslam Siddiqui']);
  });
  it('filters by minimum rating and drops unrated providers', () => {
    const out = filterProviders(rows, { ...base, minRating: 4.5 });
    expect(out.every((r) => (r.rating ?? 0) >= 4.5)).toBe(true);
    expect(out.find((r) => r.p.id === 'p8')).toBeUndefined();
  });
  it('searches by name, service and area, case-insensitively', () => {
    expect(filterProviders(rows, { ...base, query: 'SHAKEEL' })[0].p.id).toBe('p1');
    expect(filterProviders(rows, { ...base, query: 'wardrobes' })[0].p.id).toBe('p4');
    expect(filterProviders(rows, { ...base, query: 'clifton' })[0].p.id).toBe('p5');
  });
  it('combines filters', () => {
    const out = filterProviders(rows, { ...base, category: 'plumbing', minRating: 4 });
    expect(out.map((r) => r.p.id)).toEqual(['p1']);
  });
  it('sorts by rating, jobs and experience', () => {
    expect(filterProviders(rows, { ...base, sort: 'jobs' })[0].jobs).toBe(40);
    expect(filterProviders(rows, { ...base, sort: 'experience' })[0].p.experienceYears).toBe(14);
    const byRating = filterProviders(rows, base).map((r) => r.rating ?? 0);
    expect(byRating).toEqual([...byRating].sort((a, b) => b - a));
  });
  it('derives the area name from the full service area', () => {
    expect(areaName(PROVIDERS[0])).toBe('Saddar');
  });
});

describe('U8 seed data integrity', () => {
  it('has the six web-app categories', () => {
    expect(CATEGORIES.map((c) => c.name)).toEqual(['Plumbing', 'Electrical', 'Carpentry', 'Cleaner', 'Gardener', 'Painter']);
  });
  it('every provider belongs to a real category and offers only that category\'s services', () => {
    for (const p of PROVIDERS) {
      expect(CATEGORIES.some((c) => c.id === p.category)).toBe(true);
      for (const s of p.services) expect(SERVICES_BY_CATEGORY[p.category]).toContain(s);
    }
  });
});
