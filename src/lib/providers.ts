import { Provider } from '../data/types';

export type Sort = 'rating' | 'jobs' | 'experience';

export interface ProviderFilter {
  query: string;
  category: string;
  area: string;
  minRating: number;
  sort: Sort;
}

export interface ProviderRow {
  p: Provider;
  rating: number | null;
  jobs: number;
}

export const areaName = (p: Provider) => p.area.split(',')[0].trim();

export function filterProviders(rows: ProviderRow[], f: ProviderFilter): ProviderRow[] {
  const q = f.query.trim().toLowerCase();
  return rows
    .filter(({ p }) => f.category === 'all' || p.category === f.category)
    .filter(({ p }) => f.area === 'all' || areaName(p) === f.area)
    .filter(({ rating }) => f.minRating === 0 || (rating ?? 0) >= f.minRating)
    .filter(
      ({ p }) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.services.some((s) => s.toLowerCase().includes(q)),
    )
    .sort((a, b) =>
      f.sort === 'rating'
        ? (b.rating ?? 0) - (a.rating ?? 0)
        : f.sort === 'jobs'
          ? b.jobs - a.jobs
          : b.p.experienceYears - a.p.experienceYears,
    );
}
