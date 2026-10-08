const redirect = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});
jest.mock('next/navigation', () => ({ redirect: (url: string) => redirect(url) }));
const revalidatePath = jest.fn();
jest.mock('next/cache', () => ({ revalidatePath: (...a: unknown[]) => revalidatePath(...a) }));

// The writes are SQL functions (atomic, see the migration); the actions only
// validate, call them and react to the result.
let rpcResult: { data: unknown; error: unknown } = { data: null, error: null };
const rpc = jest.fn(async (..._args: unknown[]) => rpcResult);
let addedName: string | null = 'Cyclonic Rift';
const from = jest.fn();
const catalog = {
  select: () => catalog,
  eq: () => catalog,
  single: async () => ({ data: addedName ? { name: addedName } : null, error: null }),
};
jest.mock('@/app/admin/_lib/auth', () => ({
  requireAdmin: async () => ({ supabase: { rpc, from: (t: string) => (from(t), catalog) }, user: { id: 'admin' } }),
}));

import { addToPool, changeQty } from '../actions';

const ID = '33333333-3333-4333-8333-333333333333';
const ORACLE = '20000000-0000-4000-8000-000000000001';
const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
  return fd;
};

beforeEach(() => {
  jest.clearAllMocks();
  rpcResult = { data: null, error: null };
  addedName = 'Cyclonic Rift';
});

describe('addToPool', () => {
  it('adds through mtg_add_to_pool and returns to the search', async () => {
    rpcResult = { data: ID, error: null };
    await expect(
      addToPool(form({ oracle_id: ORACLE, owned_qty: '2', copies_de: '1', note: ' foil ', q: 'rift' }))
    ).rejects.toThrow('NEXT_REDIRECT /admin/magic/add?added=Cyclonic+Rift&q=rift');
    expect(rpc).toHaveBeenCalledWith('mtg_add_to_pool', {
      p_oracle_id: ORACLE,
      p_qty: 2,
      p_copies_de: 1,
      p_name_de: null,
      p_note: 'foil',
    });
    expect(from).toHaveBeenCalledWith('mtg_catalog');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/magic', 'layout');
  });

  it('rejects bad input before calling the database', async () => {
    await expect(addToPool(form({ oracle_id: 'nope', owned_qty: '1' }))).rejects.toThrow('NEXT_REDIRECT /admin/magic/add?error=');
    await expect(addToPool(form({ oracle_id: ORACLE, owned_qty: '0' }))).rejects.toThrow('NEXT_REDIRECT /admin/magic/add?error=');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('fails when nothing was added (unknown card or RLS)', async () => {
    await expect(addToPool(form({ oracle_id: ORACLE, owned_qty: '1' }))).rejects.toThrow('Could not add the card');
    expect(redirect).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('fails on a database error', async () => {
    rpcResult = { data: null, error: { message: 'invalid copies' } };
    await expect(addToPool(form({ oracle_id: ORACLE, owned_qty: '1' }))).rejects.toThrow('Could not add the card');
  });
});

describe('changeQty', () => {
  it('changes the count through mtg_change_qty', async () => {
    rpcResult = { data: 3, error: null };
    await changeQty(ID, 1);
    expect(rpc).toHaveBeenCalledWith('mtg_change_qty', { p_id: ID, p_delta: 1 });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/magic', 'layout');
  });

  it('accepts 0, which means the last copy was removed', async () => {
    rpcResult = { data: 0, error: null };
    await expect(changeQty(ID, -1)).resolves.toBeUndefined();
  });

  it('fails when the row is gone or hidden', async () => {
    await expect(changeQty(ID, 1)).rejects.toThrow('Could not change the count');
  });

  it('rejects other deltas and bad ids', async () => {
    await expect(changeQty(ID, 5 as 1)).rejects.toThrow();
    await expect(changeQty('x', 1)).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe('addToPool form errors', () => {
  it('sends a refused add back to the form with the reason', async () => {
    await expect(addToPool(form({ oracle_id: ORACLE, owned_qty: '1', copies_de: '2', q: 'rift' }))).rejects.toThrow(
      'NEXT_REDIRECT /admin/magic/add?error=More+German+copies+than+copies.&q=rift'
    );
    expect(rpc).not.toHaveBeenCalled();
  });
});
