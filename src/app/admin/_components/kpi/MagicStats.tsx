import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { AdminDashboardStats } from '../../_lib/dashboardStats';
import { formatBerlinTime } from '../../_lib/format';
import { Card } from '../ui';
import { KpiCard } from './KpiCard';
import { StatsNotice } from './StatsNotice';

/**
 * The "Magic" KPI tab: pool, wishlist and deck numbers as cards, plus the
 * scanner test data group. Timestamps render relative, in Berlin time — or
 * "never" when nothing was recorded yet.
 */
export function MagicStats({ stats, error = false }: { stats: AdminDashboardStats | null; error?: boolean }) {
  if (error || !stats?.magic) return <StatsNotice />;
  const m = stats.magic;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white">Magic</h2>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
          Collection, wishlist &amp; scanner test data
        </p>
      </div>

      <section aria-labelledby="magic-pool-title" className="space-y-4">
        <h3 id="magic-pool-title" className="text-sm font-bold text-white">
          Pool
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Unique cards" value={m.pool_unique} icon="layers" color="indigo" index={0} />
          <KpiCard label="Copies" value={m.pool_copies} icon="copy" color="blue" index={1} />
          <KpiCard label="German copies" value={m.pool_copies_de} icon="languages" color="purple" index={2} />
          <KpiCard label="Added · last 7 days" value={m.pool_added_7d} icon="calendar" color="green" index={3} />
        </div>
      </section>

      <section aria-labelledby="magic-wishlist-title" className="space-y-4">
        <h3 id="magic-wishlist-title" className="text-sm font-bold text-white">
          Wishlist &amp; decks
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Wishlist cards" value={m.wishlist_cards} icon="star" color="indigo" index={0} />
          <KpiCard label="Wishlist copies" value={m.wishlist_copies} icon="listPlus" color="blue" index={1} />
          <KpiCard label="Decks" value={m.decks} icon="library" color="purple" index={2} />
        </div>
      </section>

      <section aria-labelledby="magic-scanner-title" className="space-y-4">
        <h3 id="magic-scanner-title" className="text-sm font-bold text-white">
          Scanner test data
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Test cases" value={m.test_cases} icon="flask" color="indigo" index={0} />
          <KpiCard label="Unsent cases" value={m.test_cases_unsent} icon="send" color="red" index={1} />
          <KpiCard label="Batches" value={m.test_batches} icon="boxes" color="blue" index={2} />
        </div>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">Last batch</dt>
                <dd className="font-mono text-sm text-white">{formatBerlinTime(m.last_batch_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Last dispatch</dt>
                <dd className="font-mono text-sm text-white">{formatBerlinTime(m.last_dispatch_at)}</dd>
              </div>
            </dl>
            <Link
              href="/admin/magic"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              Open Magic admin <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
