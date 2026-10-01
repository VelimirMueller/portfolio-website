import { render, screen, within } from '@testing-library/react';
import type { ContactMessage } from '@/app/admin/_lib/messages';

const notFound = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});
jest.mock('next/navigation', () => ({
  notFound: () => notFound(),
  redirect: jest.fn(),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock('@/app/admin/actions', () => ({
  setStatus: jest.fn(),
  deleteMessage: jest.fn(),
  signOut: jest.fn(),
}));

let rows: ContactMessage[] = [];
let listError: unknown = null;
const update = jest.fn(() => ({ eq: async () => ({ error: null }) }));
const query = {
  select: () => query,
  order: async () => ({ data: rows, error: listError }),
  eq: () => query,
  maybeSingle: async () => ({ data: rows[0] ?? null }),
  update,
};
jest.mock('@/app/admin/_lib/auth', () => ({
  requireAdmin: async () => ({ supabase: { from: () => query }, user: { id: 'x', email: 'me@example.com' } }),
}));

import AdminInboxPage from '../page';
import AdminMessagePage from '../[id]/page';

const ID = '11111111-1111-4111-8111-111111111111';
const row = (over: Partial<ContactMessage>): ContactMessage => ({
  id: ID,
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'Hello, I would like to work with you.',
  status: 'new',
  created_at: new Date().toISOString(),
  ...over,
});

beforeEach(() => {
  rows = [];
  listError = null;
  update.mockClear();
});

describe('inbox page', () => {
  it('shows unread messages by default with all four status cards', async () => {
    rows = [row({}), row({ id: 'b', name: 'Read Person', status: 'read' })];
    render(await AdminInboxPage({ searchParams: {} }));
    expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument();
    for (const label of ['Unread', 'Read', 'Archived', 'Spam']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    const table = screen.getByRole('table');
    expect(within(table).getByText('Jane Doe')).toBeInTheDocument();
    expect(within(table).queryByText('Read Person')).not.toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('searches across all messages', async () => {
    rows = [row({}), row({ id: 'b', name: 'Ben', email: 'ben@acme.io', status: 'archived' })];
    render(await AdminInboxPage({ searchParams: { status: 'all', q: 'acme' } }));
    expect(screen.getByText('Results for “acme”')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('Ben')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clear search' })).toHaveAttribute('href', '/admin?status=all');
  });

  it('says so when a filter is empty', async () => {
    render(await AdminInboxPage({ searchParams: { status: 'spam' } }));
    expect(screen.getByText('No messages here.')).toBeInTheDocument();
    expect(screen.getByText('Spam messages')).toBeInTheDocument();
  });

  it('reports a failed load instead of an empty inbox', async () => {
    listError = { message: 'boom' };
    render(await AdminInboxPage({ searchParams: {} }));
    expect(screen.getByText('Could not load messages.')).toBeInTheDocument();
  });
});

describe('message page', () => {
  it('rejects an id that is not a UUID', async () => {
    await expect(AdminMessagePage({ params: { id: 'nope' } })).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('404s an unknown message', async () => {
    await expect(AdminMessagePage({ params: { id: ID } })).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('marks a new message read and offers the other actions plus reply', async () => {
    rows = [row({ status: 'new' })];
    render(await AdminMessagePage({ params: { id: ID } }));
    expect(update).toHaveBeenCalledWith({ status: 'read' });
    expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mark read/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Archive/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Reply/ }).getAttribute('href')).toMatch(/^mailto:jane@example\.com\?subject=Re/);
  });

  it('leaves an archived message archived', async () => {
    rows = [row({ status: 'archived', created_at: null })];
    render(await AdminMessagePage({ params: { id: ID } }));
    expect(update).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Mark unread/ })).toBeInTheDocument();
  });
});
