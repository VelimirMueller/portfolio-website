import { computeMessageKpis } from '../kpis';
import type { ContactMessage } from '../messages';

const NOW = new Date('2026-10-01T12:00:00Z'); // a Thursday
const m = (created_at: string | null, status: ContactMessage['status'] = 'new'): ContactMessage => ({
  id: Math.random().toString(),
  name: 'x',
  email: 'x@example.com',
  message: 'x',
  status,
  created_at,
});

describe('computeMessageKpis', () => {
  it('compares the last 30 days with the 30 before', () => {
    const k = computeMessageKpis(
      [
        m('2026-10-01T08:00:00Z'),
        m('2026-09-02T08:00:00Z'), // first day of the current window
        m('2026-09-01T08:00:00Z', 'read'), // last day of the previous window
        m('2026-07-01T08:00:00Z', 'spam'), // older than both windows
      ],
      NOW
    );
    expect(k.current).toBe(2);
    expect(k.previous).toBe(1);
    expect(k.trend).toBe(100);
    expect(k.daily).toHaveLength(30);
    expect(k.daily[0]).toEqual({ date: '2026-09-02', count: 1 });
    expect(k.daily[29]).toEqual({ date: '2026-10-01', count: 1 });
  });

  it('has no trend without a previous window', () => {
    expect(computeMessageKpis([m('2026-10-01T08:00:00Z')], NOW).trend).toBeNull();
  });

  it('reports totals, unread, spam rate and status shares', () => {
    const k = computeMessageKpis([m(null), m(null, 'spam'), m(null, 'read')], NOW);
    expect(k.total).toBe(3);
    expect(k.unread).toBe(1);
    expect(k.spamRate).toBe(33.3);
    expect(k.byStatus.find((s) => s.status === 'archived')).toEqual({ status: 'archived', count: 0, pct: 0 });
  });

  it('counts weekdays Monday first', () => {
    const k = computeMessageKpis([m('2026-09-28T10:00:00Z'), m('2026-10-04T10:00:00Z')], NOW); // Mon, Sun
    expect(k.byWeekday[0]).toBe(1);
    expect(k.byWeekday[6]).toBe(1);
  });

  it('handles an empty inbox', () => {
    const k = computeMessageKpis([], NOW);
    expect(k.total).toBe(0);
    expect(k.spamRate).toBe(0);
    expect(k.daily.every((d) => d.count === 0)).toBe(true);
  });
});
