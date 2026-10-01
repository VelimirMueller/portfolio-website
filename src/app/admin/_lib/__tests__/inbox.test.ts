import { countByStatus, filterMessages, initials, nextAfter, step, timeAgo, visibleMessages } from '../inbox';
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

describe('nextAfter', () => {
  const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  it('takes the next remaining message below', () => {
    expect(nextAfter(list, 'b', ['b'])).toBe('c');
    expect(nextAfter(list, 'b', ['b', 'c'])).toBe('d');
  });
  it('goes up when nothing is left below', () => {
    expect(nextAfter(list, 'd', ['d'])).toBe('c');
  });
  it('returns null when the list is emptied or the message is unknown', () => {
    expect(nextAfter(list, 'a', ['a', 'b', 'c', 'd'])).toBeNull();
    expect(nextAfter(list, 'zz', ['zz'])).toBeNull();
  });
});

describe('step', () => {
  const list = [{ id: 'a' }, { id: 'b' }];
  it('starts at the top or bottom when nothing is open', () => {
    expect(step(list, null, 1)).toBe('a');
    expect(step(list, null, -1)).toBe('b');
  });
  it('clamps at the ends', () => {
    expect(step(list, 'b', 1)).toBe('b');
    expect(step(list, 'a', -1)).toBe('a');
  });
  it('is null for an empty list', () => {
    expect(step([], null, 1)).toBeNull();
  });
});

describe('visibleMessages and countByStatus', () => {
  const all = [msg({ id: 'a', status: 'new' }), msg({ id: 'b', status: 'read' }), msg({ id: 'c', status: 'new' })];
  it('keeps the open message in place after it stops matching', () => {
    expect(visibleMessages(all, 'new', '', 'b').map((m) => m.id)).toEqual(['a', 'b', 'c']);
    expect(visibleMessages(all, 'new', '', null).map((m) => m.id)).toEqual(['a', 'c']);
  });
  it('counts per status plus all', () => {
    expect(countByStatus(all)).toEqual({ new: 2, read: 1, archived: 0, spam: 0, all: 3 });
  });
});
