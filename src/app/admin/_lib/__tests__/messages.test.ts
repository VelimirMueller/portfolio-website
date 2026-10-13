import { messageIdSchema, parseStatusFilter, statusAfterOpening, statusSchema, toContactMessages } from '../messages';

describe('parseStatusFilter', () => {
  it('defaults to new', () => {
    expect(parseStatusFilter(undefined)).toBe('new');
  });

  it('accepts every known status and all', () => {
    for (const s of ['new', 'read', 'archived', 'spam', 'all']) {
      expect(parseStatusFilter(s)).toBe(s);
    }
  });

  it('falls back to new for unknown values', () => {
    expect(parseStatusFilter('deleted')).toBe('new');
    expect(parseStatusFilter(['read'])).toBe('new');
  });
});

describe('schemas', () => {
  it('rejects a status outside the database check constraint', () => {
    expect(statusSchema.safeParse('deleted').success).toBe(false);
  });

  it('rejects ids that are not UUIDs', () => {
    expect(messageIdSchema.safeParse('1 or 1=1').success).toBe(false);
    expect(messageIdSchema.safeParse('bf3817e9-307a-490e-a3d4-5e63ed65da4a').success).toBe(true);
  });
});

describe('statusAfterOpening', () => {
  it('marks a new message as read', () => {
    expect(statusAfterOpening('new')).toBe('read');
  });

  it.each(['read', 'archived', 'spam'] as const)('leaves %s unchanged', (status) => {
    expect(statusAfterOpening(status)).toBeNull();
  });
});

describe('toContactMessages', () => {
  const row = { id: '1', name: 'Jane', email: 'jane@example.com', message: 'Hello there', created_at: null };

  it('keeps rows with a known status and leaves out the rest', () => {
    const rows = [{ ...row, status: 'new' }, { ...row, id: '2', status: 'deleted' }, { ...row, id: '3', status: 'spam' }];
    expect(toContactMessages(rows).map((m) => [m.id, m.status])).toEqual([['1', 'new'], ['3', 'spam']]);
  });
});
