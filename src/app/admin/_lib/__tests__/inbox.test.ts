import { filterMessages, initials, summarize, timeAgo } from '../inbox';
import type { ContactMessage } from '../messages';

const NOW = new Date('2026-10-01T12:00:00Z');
const msg = (over: Partial<ContactMessage>): ContactMessage => ({
  id: Math.random().toString(),
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'Hello there',
  status: 'new',
  created_at: '2026-10-01T09:00:00Z',
  ...over,
});

describe('summarize', () => {
  const messages = [
    msg({ status: 'new' }),
    msg({ status: 'new', created_at: '2026-09-30T23:00:00Z' }),
    msg({ status: 'read', created_at: '2026-09-18T10:00:00Z' }), // first sparkline day
    msg({ status: 'read', created_at: '2026-09-17T10:00:00Z' }), // outside the 14 days
    msg({ status: 'spam', created_at: null }),
  ];
  const byStatus = Object.fromEntries(summarize(messages, NOW).map((s) => [s.status, s]));

  it('counts every status, including empty ones', () => {
    expect(byStatus.new.count).toBe(2);
    expect(byStatus.read.count).toBe(2);
    expect(byStatus.archived.count).toBe(0);
    expect(byStatus.spam.count).toBe(1);
  });

  it('buckets the last 14 days, today last', () => {
    expect(byStatus.new.daily).toHaveLength(14);
    expect(byStatus.new.daily[13]).toBe(1);
    expect(byStatus.new.daily[12]).toBe(1);
    expect(byStatus.read.daily[0]).toBe(1);
    expect(byStatus.read.daily.reduce((a, b) => a + b, 0)).toBe(1);
  });

  it('skips messages without a date in the sparkline', () => {
    expect(byStatus.spam.daily.every((d) => d === 0)).toBe(true);
  });
});

describe('filterMessages', () => {
  const messages = [
    msg({ name: 'Anna Berg', status: 'new' }),
    msg({ name: 'Ben Cole', email: 'ben@ACME.io', status: 'read' }),
    msg({ name: 'Cara Diaz', message: 'Interested in a Workshop', status: 'archived' }),
  ];

  it('filters by status', () => {
    expect(filterMessages(messages, 'read', '').map((m) => m.name)).toEqual(['Ben Cole']);
  });

  it('shows everything for all', () => {
    expect(filterMessages(messages, 'all', '')).toHaveLength(3);
  });

  it('searches name, email and message case-insensitively, across statuses with all', () => {
    expect(filterMessages(messages, 'all', 'acme').map((m) => m.name)).toEqual(['Ben Cole']);
    expect(filterMessages(messages, 'all', '  workshop ').map((m) => m.name)).toEqual(['Cara Diaz']);
  });

  it('combines status and search', () => {
    expect(filterMessages(messages, 'new', 'acme')).toHaveLength(0);
  });
});

describe('initials', () => {
  it.each([
    ['Jane Doe', 'JD'],
    ['jane', 'J'],
    ['Jean Luc de Picard', 'JP'],
    ['   ', '?'],
  ])('%s → %s', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

describe('timeAgo', () => {
  it.each([
    [null, '—'],
    ['2026-10-01T11:59:40Z', 'just now'],
    ['2026-10-01T11:45:00Z', '15m ago'],
    ['2026-10-01T07:00:00Z', '5h ago'],
    ['2026-09-28T12:00:00Z', '3d ago'],
  ])('%s → %s', (iso, expected) => {
    expect(timeAgo(iso, NOW)).toBe(expected);
  });

  it('falls back to a date after a week', () => {
    expect(timeAgo('2026-09-01T12:00:00Z', NOW)).toBe('1.9.2026');
  });
});
