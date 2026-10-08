import { render, screen } from '@testing-library/react';
import { catalogCard, poolCard } from '@/app/admin/_lib/magic/testFixtures';

jest.mock('next/navigation', () => ({ usePathname: () => '/admin/magic', redirect: jest.fn() }));
jest.mock('../actions', () => ({ addToPool: jest.fn(), changeQty: jest.fn() }));

type Result = { data?: unknown; error?: unknown; count?: number | null };
let results: Record<string, Result> = {};
const ilikes: string[] = [];
function builder(table: string) {
  const q: Record<string, unknown> = {
    select: () => q,
    order: () => q,
    limit: () => q,
    in: () => q,
    ilike: (_c: string, p: string) => (ilikes.push(p), q),
    then: (res: (v: unknown) => unknown) => res({ data: [], error: null, count: null, ...results[table] }),
  };
  return q;
}
jest.mock('@/app/admin/_lib/auth', () => ({
  requireAdmin: async () => ({ supabase: { from: (t: string) => builder(t) }, user: { id: 'admin' } }),
}));

import PoolPage from '../page';
import DeckPage from '../deck/page';
import AddPage from '../add/page';

beforeEach(() => {
  results = {};
  ilikes.length = 0;
});

describe('magic pages', () => {
  it('pool page lists the pool', async () => {
    results = { mtg_collection: { data: [poolCard({ name: 'Countersculpt', owned_qty: 4 })] } };
    render(await PoolPage());
    expect(screen.getByRole('heading', { name: 'Countersculpt' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Add card/ })).toHaveAttribute('href', '/admin/magic/add');
  });

  it('pool page reports a load error', async () => {
    results = { mtg_collection: { error: { message: 'boom' } } };
    render(await PoolPage());
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load the pool.');
  });

  it('deck page shows ownership from the pool', async () => {
    results = {
      mtg_collection: { data: [poolCard({ name: 'Countersculpt', owned_qty: 4 }), poolCard({ name: 'Island', owned_qty: 11 })] },
      mtg_catalog: { data: [catalogCard({ name: 'Opt', mana_cost: '{U}' })] },
    };
    render(await DeckPage());
    expect(screen.getByRole('heading', { name: 'Stapelbruch' })).toBeInTheDocument();
    expect(screen.getAllByText('owned 4/4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('11/24 · buy 13').length).toBeGreaterThan(0);
    expect(screen.getByText('Main deck has 61 cards, the plan says 60.')).toBeInTheDocument();
  });

  it('deck page reports a failed catalog query instead of missing data', async () => {
    results = { mtg_catalog: { error: { message: 'boom' } } };
    render(await DeckPage());
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load the card catalog.');
  });

  it('add page searches by prefix and substring, best match first', async () => {
    results = {
      mtg_catalog: { data: [catalogCard({ oracle_id: '1', name: 'Adopt' }), catalogCard({ oracle_id: '2', name: 'Opt' })], count: 32823 },
    };
    render(await AddPage({ searchParams: { q: ' opt ' } }));
    expect(ilikes).toEqual(['opt%', '%opt%']);
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Opt', 'Adopt']);
    expect(screen.getByText('2 matches for “opt”')).toBeInTheDocument();
  });

  it('add page says when it shows only the first matches', async () => {
    const many = Array.from({ length: 30 }, (_, i) => catalogCard({ oracle_id: String(i), name: `Rift ${i}` }));
    results = { mtg_catalog: { data: many, count: 30 } };
    render(await AddPage({ searchParams: { q: 'rift' } }));
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(24);
    expect(screen.getByText(/First 24 matches for “rift”/)).toBeInTheDocument();
  });

  it('add page does not search for one letter', async () => {
    render(await AddPage({ searchParams: { q: 'o' } }));
    expect(ilikes).toEqual([]);
  });
});
