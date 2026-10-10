import { Booking, Category, Provider, Review, User } from './types';

export const CATEGORIES: Category[] = [
  { id: 'plumbing', name: 'Plumbing', description: 'Quick and clean plumbing repairs and installations.', startingPrice: 500 },
  { id: 'electrical', name: 'Electrical', description: 'Safe and reliable electrical fixes and installations.', startingPrice: 700 },
  { id: 'carpentry', name: 'Carpentry', description: 'Custom woodwork and repairs made to fit perfectly.', startingPrice: 1500 },
  { id: 'cleaner', name: 'Cleaner', description: 'Spotless, efficient cleaning tailored to your space.', startingPrice: 500 },
  { id: 'gardener', name: 'Gardener', description: 'Healthy, vibrant gardens nurtured with expert care.', startingPrice: 800 },
  { id: 'painter', name: 'Painter', description: 'Quality paintwork that brings color and life to your home.', startingPrice: 3000 },
];

export const SERVICES_BY_CATEGORY: Record<string, string[]> = {
  plumbing: ['Leak repair', 'Tap & mixer fitting', 'Drain unblocking', 'Water tank cleaning', 'Geyser installation'],
  electrical: ['Wiring & rewiring', 'Fan & light fitting', 'Switchboard repair', 'UPS / inverter setup', 'Appliance fault check'],
  carpentry: ['Furniture repair', 'Door & window fitting', 'Custom wardrobes', 'Kitchen cabinets', 'Polishing'],
  cleaner: ['Deep home cleaning', 'Sofa & carpet cleaning', 'Kitchen cleaning', 'Bathroom cleaning', 'Post-construction cleanup'],
  gardener: ['Lawn mowing', 'Plant care', 'Garden design', 'Tree trimming', 'Irrigation setup'],
  painter: ['Interior painting', 'Exterior painting', 'Wall polish', 'Waterproof coating', 'Touch-ups'],
};

export const PROVIDERS: Provider[] = [
  { id: 'p1', name: 'Shakeel Ahmed', category: 'plumbing', phone: '+923331947777', area: 'Saddar, Karachi', experienceYears: 9, bio: 'Licensed plumber handling leaks, fittings and full bathroom installs. Always on time, always tidy.', services: SERVICES_BY_CATEGORY.plumbing.slice(0, 4), verified: true },
  { id: 'p2', name: 'Aslam Siddiqui', category: 'electrical', phone: '+923331942333', area: 'Gulshan, Karachi', experienceYears: 12, bio: 'Certified electrician for homes and small offices. Safety-first wiring and quick fault finding.', services: SERVICES_BY_CATEGORY.electrical.slice(0, 4), verified: true },
  { id: 'p3', name: 'Anfal Asif', category: 'electrical', phone: '+923331942111', area: 'FB Area, Karachi', experienceYears: 5, bio: 'Specialises in fan, light and switchboard work with same-day availability.', services: SERVICES_BY_CATEGORY.electrical.slice(1, 4), verified: true },
  { id: 'p4', name: 'Bilal Ahmed', category: 'carpentry', phone: '+923331942444', area: 'Karsaz, Karachi', experienceYears: 14, bio: 'Master carpenter for custom wardrobes, kitchens and furniture restoration.', services: SERVICES_BY_CATEGORY.carpentry.slice(0, 4), verified: true },
  { id: 'p5', name: 'Zainab Fatima', category: 'cleaner', phone: '+923331955555', area: 'Clifton, Karachi', experienceYears: 6, bio: 'Professional deep-cleaning crew leader. Eco-friendly products on request.', services: SERVICES_BY_CATEGORY.cleaner.slice(0, 4), verified: true },
  { id: 'p6', name: 'Imran Qureshi', category: 'gardener', phone: '+923331966666', area: 'DHA, Karachi', experienceYears: 8, bio: 'Lawn care and garden design that keeps your outdoors green all year.', services: SERVICES_BY_CATEGORY.gardener.slice(0, 4), verified: true },
  { id: 'p7', name: 'Danish Raza', category: 'painter', phone: '+923331977777', area: 'Gulistan-e-Jauhar, Karachi', experienceYears: 10, bio: 'Interior and exterior painting with clean edges and zero mess.', services: SERVICES_BY_CATEGORY.painter.slice(0, 4), verified: true },
  { id: 'p8', name: 'Faraz Ahmed', category: 'plumbing', phone: '+923331733333', area: 'North Nazimabad, Karachi', experienceYears: 4, bio: 'Fast response for emergency leaks and blocked drains.', services: SERVICES_BY_CATEGORY.plumbing.slice(0, 3), verified: true },
];

export const DEMO_CUSTOMER_EMAIL = 'customer@servizo.app';
export const DEMO_PROVIDER_EMAIL = 'provider@servizo.app';
export const DEMO_PASSWORD = 'demo1234';

export const USERS: User[] = [
  { id: 'u1', role: 'customer', name: 'Hameed Khan', email: DEMO_CUSTOMER_EMAIL, phone: '03331942111', address: 'Gulshan, Karachi', password: DEMO_PASSWORD },
  { id: 'u2', role: 'provider', name: 'Shakeel Ahmed', email: DEMO_PROVIDER_EMAIL, phone: '+923331947777', password: DEMO_PASSWORD, providerId: 'p1' },
];

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const ymd = (daysFromNow: number) => {
  const d = new Date(Date.now() + daysFromNow * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const BOOKINGS: Booking[] = [
  {
    id: 'b1', customerId: 'u1', providerId: 'p1', category: 'plumbing', service: 'Leak repair',
    description: 'Kitchen sink pipe is leaking underneath the cabinet.', photos: [],
    date: ymd(-12), time: '11:00', address: 'Gulshan, Karachi', status: 'Completed',
    history: [
      { status: 'Requested', at: iso(14) }, { status: 'Accepted', at: iso(14) },
      { status: 'Scheduled', at: iso(13) }, { status: 'In Progress', at: iso(12) }, { status: 'Completed', at: iso(12) },
    ],
    createdAt: iso(14),
  },
  {
    id: 'b2', customerId: 'u1', providerId: 'p1', category: 'plumbing', service: 'Tap & mixer fitting',
    description: 'Need two new mixers fitted in the bathroom.', photos: [],
    date: ymd(2), time: '15:30', address: 'Gulshan, Karachi', status: 'Scheduled',
    history: [{ status: 'Requested', at: iso(1) }, { status: 'Accepted', at: iso(1) }, { status: 'Scheduled', at: iso(0) }],
    createdAt: iso(1),
  },
  {
    id: 'b3', customerId: 'u1', providerId: 'p1', category: 'plumbing', service: 'Drain unblocking',
    description: 'Bathroom floor drain is blocked and water is not draining.', photos: [],
    date: ymd(4), time: '10:00', address: 'Gulshan, Karachi', status: 'Requested',
    history: [{ status: 'Requested', at: iso(0) }],
    createdAt: iso(0),
  },
];

export const REVIEWS: Review[] = [
  { id: 'r1', bookingId: 'b1', providerId: 'p1', customerId: 'u1', customerName: 'Hameed Khan', rating: 5, text: 'Excellent service, fixed the leak quickly.', createdAt: iso(11) },
  { id: 'r2', bookingId: 'x1', providerId: 'p1', customerId: 'ux', customerName: 'Sara Malik', rating: 4, text: 'Good work, arrived a little late though.', createdAt: iso(30) },
  { id: 'r3', bookingId: 'x2', providerId: 'p2', customerId: 'ux', customerName: 'Omar Sheikh', rating: 5, text: 'Very professional and safe wiring job.', createdAt: iso(20) },
  { id: 'r4', bookingId: 'x3', providerId: 'p2', customerId: 'ux', customerName: 'Hina Raza', rating: 5, text: 'Fixed our switchboard the same day.', createdAt: iso(40) },
  { id: 'r5', bookingId: 'x4', providerId: 'p4', customerId: 'ux', customerName: 'Ali Hassan', rating: 5, text: 'Beautiful wardrobe, great finishing.', createdAt: iso(15) },
  { id: 'r6', bookingId: 'x5', providerId: 'p5', customerId: 'ux', customerName: 'Mehwish Khan', rating: 4, text: 'House looked brand new after cleaning.', createdAt: iso(9) },
  { id: 'r7', bookingId: 'x6', providerId: 'p7', customerId: 'ux', customerName: 'Rizwan Ali', rating: 5, text: 'Neat painting and finished on schedule.', createdAt: iso(25) },
  { id: 'r8', bookingId: 'x7', providerId: 'p6', customerId: 'ux', customerName: 'Nadia Iqbal', rating: 4, text: 'Garden looks lovely now.', createdAt: iso(18) },
  { id: 'r9', bookingId: 'x8', providerId: 'p3', customerId: 'ux', customerName: 'Usman Tariq', rating: 4, text: 'Quick and tidy.', createdAt: iso(12) },
];

export const SEED_COMPLETED_JOBS: Record<string, number> = {
  p1: 22, p2: 41, p3: 12, p4: 37, p5: 19, p6: 15, p7: 28, p8: 8,
};
