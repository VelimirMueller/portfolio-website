// Plain module (no 'use client'): the server page parses ?tab= and reads the
// RPC here; the client dashboard imports the same tab list and types.

/**
 * The KPI page's top-level tabs, one per data source. "website" is today's
 * KpisView (traffic + messages); the others read admin_dashboard_stats().
 */
export const KPI_TABS = [
  { id: 'website', label: 'Website' },
  { id: 'supabase', label: 'Supabase' },
  { id: 'vercel', label: 'Vercel' },
  { id: 'magic', label: 'Magic' },
] as const;

export type KpiTab = (typeof KPI_TABS)[number]['id'];

export function parseKpiTab(value: string | null | undefined): KpiTab {
  return KPI_TABS.some((t) => t.id === value) ? (value as KpiTab) : 'website';
}

/** What admin_dashboard_stats() returns — see migration 20261010060000. */
export interface AdminDashboardStats {
  generated_at: string;
  supabase: {
    db_bytes: number;
    postgres_version: string;
    connections: number;
    tables: { name: string; rows: number; bytes: number }[];
    buckets: { id: string; public: boolean; objects: number; bytes: number }[];
  };
  magic: {
    pool_unique: number;
    pool_copies: number;
    pool_copies_de: number;
    pool_added_7d: number;
    wishlist_cards: number;
    wishlist_copies: number;
    decks: number;
    test_cases: number;
    test_cases_unsent: number;
    test_batches: number;
    last_batch_at: string | null;
    last_dispatch_at: string | null;
  };
}

/**
 * Reads admin_dashboard_stats(). Never throws: until the migration has run
 * (or on any RPC error) the result is `{ error: true }`, which the tabs show
 * as a calm inline notice instead of crashing the page.
 */
export async function loadDashboardStats(
  rpc: (fn: string) => PromiseLike<{ data: unknown; error: unknown | null }>,
): Promise<{ stats: AdminDashboardStats | null; error: boolean }> {
  try {
    const { data, error } = await rpc('admin_dashboard_stats');
    if (error) return { stats: null, error: true };
    return { stats: (data ?? null) as AdminDashboardStats | null, error: false };
  } catch {
    return { stats: null, error: true };
  }
}
