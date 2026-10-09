import { render, screen } from '@testing-library/react';
import { catalogCard, deck, deckCard, poolEntry } from '@/app/admin/_lib/magic/testFixtures';

const notFound = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});
jest.mock('next/navigation', () => ({ usePathname: () => '/admin/magic', notFound: () => notFound() }));
jest.mock('../actions', () => ({ addToPool: jest.fn(), changeQty: jest.fn() }));
jest.mock('@/app/admin/_lib/auth', () => ({ requireAdmin: async () => ({ supabase: {}, user: { id: 'admin' } }) }));

const ok = <T,>(data: T) => ({ data, error: false });
const failed = <T,>(data: T) => ({ data, error: true });
const queries = {
  loadPool: jest.fn(),
  loadOwned: jest.fn(),
  loadDecks: jest.fn(),
  loadDeck: jest.fn(),
  loadDeckOwnership: jest.fn(),
  searchCatalog: jest.fn(),
  catalogSize: jest.fn(),
};
jest.mock('@/app/admin/_lib/magic/queries', () => ({
  loadPool: (...a: unknown[]) => queries.loadPool(...a),
  loadOwned: (...a: unknown[]) => queries.loadOwned(...a),
  loadDecks: (...a: unknown[]) => queries.loadDecks(...a),
  loadDeck: (...a: unknown[]) => queries.loadDeck(...a),
  loadDeckOwnership: (...a: unknown[]) => queries.loadDeckOwnership(...a),
  searchCatalog: (...a: unknown[]) => queries.searchCatalog(...a),
  catalogSize: (...a: unknown[]) => queries.catalogSize(...a),
}));

import PoolPage from '../page';
import DecksPage from '../decks/page';
import DeckPage from '../decks/[slug]/page';
import AddPage from '../add/page';

const opt = catalogCard({ name: 'Opt' });
const stapelbruch = deck([deckCard(opt, { qty: 4 })], { slug: 'stapelbruch', name: 'Stapelbruch' });

beforeEach(() => {
  jest.clearAllMocks();
  queries.loadOwned.mockResolvedValue(ok(new Map([[opt.oracle_id, 1]])));
  queries.loadDeckOwnership.mockResolvedValue(ok(new Map([[stapelbruch.cards[0].id, 1]])));
  queries.searchCatalog.mockResolvedValue(ok({ cards: [], more: false }));
  queries.catalogSize.mockResolvedValue(32823);
});

describe('magic pages', () => {
  it('pool page lists the pool', async () => {
    queries.loadPool.mockResolvedValue(ok([poolEntry({ name: 'Countersculpt' }, { owned_qty: 4 })]));
    render(await PoolPage());
    expect(screen.getByRole('heading', { name: 'Countersculpt' })).toBeInTheDocument();
  });

  it('pool page reports a load error', async () => {
    queries.loadPool.mockResolvedValue(failed([]));
    render(await PoolPage());
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load the pool.');
  });

  it('decks page lists decks with ownership', async () => {
    queries.loadDecks.mockResolvedValue(ok([stapelbruch]));
    render(await DecksPage());
    expect(screen.getByRole('link', { name: /Stapelbruch/ })).toBeInTheDocument();
    expect(screen.getByText('owned 1/4 · buy 3')).toBeInTheDocument();
  });

  it('decks page reports a load error', async () => {
    queries.loadDecks.mockResolvedValue(ok([]));
    queries.loadDeckOwnership.mockResolvedValue(failed(new Map()));
    render(await DecksPage());
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load the decks.');
  });

  it('deck page shows one deck by slug', async () => {
    queries.loadDeck.mockResolvedValue(ok(stapelbruch));
    render(await DeckPage({ params: { slug: 'stapelbruch' } }));
    expect(queries.loadDeck).toHaveBeenCalledWith({}, 'stapelbruch');
    expect(queries.loadDeckOwnership).toHaveBeenCalledWith({}, stapelbruch.id);
    expect(screen.getByRole('heading', { name: 'Stapelbruch' })).toBeInTheDocument();
  });

  it('deck page answers 404 for an unknown slug and an alert for a failed read', async () => {
    queries.loadDeck.mockResolvedValue(ok(null));
    await expect(DeckPage({ params: { slug: 'nope' } })).rejects.toThrow('NEXT_NOT_FOUND');
    queries.loadDeck.mockResolvedValue(failed(null));
    render(await DeckPage({ params: { slug: 'x' } }));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load the deck.');
  });

  it('add page searches and passes results, pool counts and messages on', async () => {
    const rift = catalogCard({ name: 'Cyclonic Rift' });
    queries.searchCatalog.mockResolvedValue(ok({ cards: [rift], more: true }));
    queries.loadOwned.mockResolvedValue(ok(new Map([[rift.oracle_id, 2]])));
    render(await AddPage({ searchParams: { q: ' rift ', added: 'Opt', error: 'Bad input.' } }));
    expect(queries.searchCatalog).toHaveBeenCalledWith({}, 'rift');
    expect(screen.getByText(/First 1 matches for “rift”/)).toBeInTheDocument();
    expect(screen.getByText('in pool ×2')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Opt is in your pool.');
    expect(screen.getByText('Not added: Bad input.')).toBeInTheDocument();
  });

  it('add page reports a failed pool read instead of hiding the pool counts', async () => {
    queries.loadOwned.mockResolvedValue(failed(new Map()));
    render(await AddPage({ searchParams: { q: 'rift' } }));
    expect(screen.getByText(/Could not load the search or your pool counts/)).toBeInTheDocument();
  });
});
