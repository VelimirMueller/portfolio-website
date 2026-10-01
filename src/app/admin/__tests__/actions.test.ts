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

const eq = jest.fn();
const signInWithOtp = jest.fn(async () => ({ error: null }));
let userId: string | null = ADMIN_USER_ID;
jest.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: userId ? { id: userId } : null } }),
      signInWithOtp,
    },
    from: () => ({
      update: () => ({ eq }),
      delete: () => ({ eq }),
    }),
  }),
}));

import { deleteMessage, sendMagicLink, setStatus } from '../actions';

const ID = '11111111-1111-4111-8111-111111111111';
const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
  return fd;
};

beforeEach(() => {
  jest.clearAllMocks();
  userId = ADMIN_USER_ID;
  eq.mockResolvedValue({ error: null, count: 1 });
});

describe('setStatus', () => {
  it('redirects to login when the user is not the admin', async () => {
    userId = 'someone-else';
    await expect(setStatus(form({ id: ID, status: 'read' }))).rejects.toThrow('NEXT_REDIRECT /admin/login');
    expect(eq).not.toHaveBeenCalled();
  });

  it('redirects to login when nobody is signed in', async () => {
    userId = null;
    await expect(setStatus(form({ id: ID, status: 'read' }))).rejects.toThrow('/admin/login');
  });

  it('rejects an unknown status before touching the database', async () => {
    await expect(setStatus(form({ id: ID, status: 'deleted' }))).rejects.toThrow();
    expect(eq).not.toHaveBeenCalled();
  });

  it('updates the message for the admin', async () => {
    await setStatus(form({ id: ID, status: 'archived' }));
    expect(eq).toHaveBeenCalledWith('id', ID);
  });
});

describe('deleteMessage', () => {
  it('fails loudly when RLS deleted nothing', async () => {
    eq.mockResolvedValue({ error: null, count: 0 });
    await expect(deleteMessage(form({ id: ID }))).rejects.toThrow('Could not delete');
  });

  it('returns to the inbox after a delete', async () => {
    await expect(deleteMessage(form({ id: ID }))).rejects.toThrow('NEXT_REDIRECT /admin');
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

  it('shows the same confirmation for an invalid address without calling Supabase', async () => {
    await expect(sendMagicLink(form({ email: 'nope' }))).rejects.toThrow('?sent=1');
    expect(signInWithOtp).not.toHaveBeenCalled();
  });
});
