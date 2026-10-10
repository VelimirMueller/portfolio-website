// Test data shared by the dashboard-stats tests. Not imported by app code.
import type { AdminDashboardStats } from './dashboardStats';

/** A full admin_dashboard_stats() payload; pass partials to override. */
export const dashboardStatsFixture = (over: Partial<AdminDashboardStats> = {}): AdminDashboardStats => ({
  generated_at: '2026-10-10T06:00:00Z',
  supabase: {
    db_bytes: 2_621_440_000,
    postgres_version: '17.2',
    connections: 7,
    tables: [
      { name: 'contact_messages', rows: 48, bytes: 98_304 },
      { name: 'analytics_events', rows: 150_000, bytes: 1_073_741_824 },
    ],
    buckets: [
      { id: 'card-images', public: true, objects: 1200, bytes: 524_288_000 },
      { id: 'exports', public: false, objects: 3, bytes: 2_048 },
    ],
  },
  magic: {
    pool_unique: 421,
    pool_copies: 653,
    pool_copies_de: 128,
    pool_added_7d: 6,
    wishlist_cards: 57,
    wishlist_copies: 72,
    decks: 4,
    test_cases: 45,
    test_cases_unsent: 9,
    test_batches: 3,
    last_batch_at: '2026-10-09T12:30:00Z',
    last_dispatch_at: null,
  },
  ...over,
});
