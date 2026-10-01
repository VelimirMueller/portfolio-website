import { ADMIN_USER_ID } from '@/config/admin';

const redirect = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});
jest.mock('next/navigation', () => ({ redirect: (url: string) => redirect(url) }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({})),
  headers: jest.fn(() => new Map([['host', 'localhost:3000'], ['x-forwarded-proto', 'http']])),
}));

const inFilter = jest.fn();
const signInWithOtp = jest.fn(async () => ({ error: null }));
let userId: string | null = ADMIN_USER_ID;
jest.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: userId ? { id: userId } : null } }),
      signInWithOtp,
    },
    from: () => ({
      update: () => ({ in: inFilter }),
      delete: () => ({ in: inFilter }),
    }),
  }),
}));

import { deleteMessages, sendMagicLink, updateStatuses } from '../actions';

const ID = '11111111-1111-4111-8111-111111111111';
const form = (fields: Record<string, string>): FormData => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
  return fd;
};

beforeEach(() => {
  jest.clearAllMocks();
  userId = ADMIN_USER_ID;
  inFilter.mockResolvedValue({ error: null, count: 1 });
});

const ID2 = '22222222-2222-4222-8222-222222222222';

describe('updateStatuses', () => {
  it('redirects to login when the user is not the admin', async () => {
    userId = 'someone-else';
    await expect(updateStatuses([ID], 'read')).rejects.toThrow('NEXT_REDIRECT /admin/login');
    expect(inFilter).not.toHaveBeenCalled();
  });

  it('redirects to login when nobody is signed in', async () => {
    userId = null;
    await expect(updateStatuses([ID], 'read')).rejects.toThrow('/admin/login');
  });

  it('rejects an unknown status before touching the database', async () => {
    await expect(updateStatuses([ID], 'deleted')).rejects.toThrow();
    expect(inFilter).not.toHaveBeenCalled();
  });

  it('rejects non-UUID ids and empty lists', async () => {
    await expect(updateStatuses(['1 or 1=1'], 'read')).rejects.toThrow();
    await expect(updateStatuses([], 'read')).rejects.toThrow();
    expect(inFilter).not.toHaveBeenCalled();
  });

  it('updates every given message in one call', async () => {
    inFilter.mockResolvedValue({ error: null, count: 2 });
    await updateStatuses([ID, ID2], 'archived');
    expect(inFilter).toHaveBeenCalledWith('id', [ID, ID2]);
  });

  it('fails loudly when RLS skipped some rows', async () => {
    inFilter.mockResolvedValue({ error: null, count: 1 });
    await expect(updateStatuses([ID, ID2], 'read')).rejects.toThrow('Could not update');
  });

  it('surfaces a database error', async () => {
    inFilter.mockResolvedValue({ error: { message: 'x' } });
    await expect(updateStatuses([ID], 'read')).rejects.toThrow('Could not update');
  });
});

describe('deleteMessages', () => {
  it('fails loudly when RLS deleted fewer rows than asked', async () => {
    inFilter.mockResolvedValue({ error: null, count: 1 });
    await expect(deleteMessages([ID, ID2])).rejects.toThrow('Could not delete');
  });

  it('succeeds when every row was deleted', async () => {
    inFilter.mockResolvedValue({ error: null, count: 2 });
    await expect(deleteMessages([ID, ID2])).resolves.toBeUndefined();
    expect(inFilter).toHaveBeenCalledWith('id', [ID, ID2]);
  });

  it('needs the admin', async () => {
    userId = null;
    await expect(deleteMessages([ID])).rejects.toThrow('/admin/login');
  });
});

describe('sendMagicLink', () => {
  it('never creates users and points the link at the callback', async () => {
    await expect(sendMagicLink(form({ email: 'me@example.com' }))).rejects.toThrow('?sent=1');
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'me@example.com',
      options: { shouldCreateUser: false, emailRedirectTo: 'http://localhost:3000/admin/auth/callback' },
    });
  });

  it('uses SITE_URL in production, whatever the Host header says', async () => {
    const env = process.env as Record<string, string | undefined>;
    const before = env.NODE_ENV;
    env.NODE_ENV = 'production';
    try {
      await expect(sendMagicLink(form({ email: 'me@example.com' }))).rejects.toThrow('?sent=1');
    } finally {
      env.NODE_ENV = before;
    }
    expect(signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: 'https://www.velimir-mueller.de/admin/auth/callback',
        }),
      })
    );
  });

  it('shows the same confirmation for an invalid address without calling Supabase', async () => {
    await expect(sendMagicLink(form({ email: 'nope' }))).rejects.toThrow('?sent=1');
    expect(signInWithOtp).not.toHaveBeenCalled();
  });
});
