import type { SupabaseClient } from '@supabase/supabase-js';
import { MAX_EVENTS, loadLastEventAt, loadTrafficEvents } from '../trafficQuery';

function client(pages: (number | 'error')[]) {
  const calls: [number, number][] = [];
  const gte = jest.fn();
  const query = {
    select: () => query,
    gte: (...args: unknown[]) => (gte(...args), query),
    order: () => query,
    range: async (from: number, to: number) => {
      calls.push([from, to]);
      const page = pages[calls.length - 1] ?? 0;
      if (page === 'error') return { data: null, error: { message: 'boom' } };
      return { data: Array.from({ length: page }, (_, i) => ({ created_at: `${from + i}` })), error: null };
    },
  };
  return { supabase: { from: () => query } as unknown as SupabaseClient, calls, gte };
}

describe('loadTrafficEvents', () => {
  it('pages through the row limit until a short page', async () => {
    const { supabase, calls, gte } = client([1000, 1000, 10]);
    const since = new Date('2026-09-01T00:00:00Z');
    const res = await loadTrafficEvents(supabase, since);
    expect(res).toMatchObject({ capped: false, error: false });
    expect(res.events).toHaveLength(2010);
    expect(calls).toEqual([[0, 999], [1000, 1999], [2000, 2999]]);
    expect(gte).toHaveBeenCalledWith('created_at', since.toISOString());
  });

  it('stops at the cap and says so', async () => {
    const { supabase, calls } = client(Array(60).fill(1000));
    const res = await loadTrafficEvents(supabase, new Date());
    expect(res.capped).toBe(true);
    expect(res.events).toHaveLength(MAX_EVENTS);
    expect(calls).toHaveLength(MAX_EVENTS / 1000);
  });

  it('reports an error and keeps what it has', async () => {
    const { supabase } = client([1000, 'error']);
    const res = await loadTrafficEvents(supabase, new Date());
    expect(res).toMatchObject({ error: true, capped: false });
    expect(res.events).toHaveLength(1000);
  });
});

describe('loadLastEventAt', () => {
  const client = (row: unknown) => {
    const query = { select: () => query, order: () => query, limit: () => query, maybeSingle: async () => ({ data: row, error: null }) };
    return { from: () => query } as unknown as SupabaseClient;
  };

  it('returns the newest event time, or null when nothing was ever stored', async () => {
    await expect(loadLastEventAt(client({ created_at: '2026-10-02T19:37:25Z' }))).resolves.toBe('2026-10-02T19:37:25Z');
    await expect(loadLastEventAt(client(null))).resolves.toBeNull();
  });
});
