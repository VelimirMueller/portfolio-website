import { render, screen, within } from '@testing-library/react';
import type { ContactMessage } from '@/app/admin/_lib/messages';

const redirect = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});
const push = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: (url: string) => redirect(url),
  useRouter: () => ({ push, replace: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/admin/kpis',
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock('@/app/admin/actions', () => ({ updateStatuses: jest.fn(), deleteMessages: jest.fn() }));

let rows: ContactMessage[] = [];
let listError: unknown = null;
const update = jest.fn(() => ({ eq: async () => ({ error: null }) }));
const query = {
  select: () => query,
  order: async () => ({ data: rows, error: listError }),
  then: (resolve: (v: unknown) => void) => resolve({ data: rows, error: listError }),
  update,
};
let events: unknown[] = [];
let eventsError: unknown = null;
const eventsQuery = {
  select: () => eventsQuery,
  gte: () => eventsQuery,
  order: () => eventsQuery,
  range: async () => ({ data: events, error: eventsError }),
};
jest.mock('@/app/admin/_lib/auth', () => ({
  requireAdmin: async () => ({
    supabase: { from: (table: string) => (table === 'analytics_events' ? eventsQuery : query) },
    user: { id: 'x', email: 'me@example.com' },
  }),
}));

import AdminInboxPage from '../page';
import LegacyMessagePage from '../[id]/page';
import AdminKpisPage from '../kpis/page';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const row = (over: Partial<ContactMessage>): ContactMessage => ({
  id: A,
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
  events = [];
  eventsError = null;
  update.mockClear();
});

describe('inbox page', () => {
  it('lists unread messages by default with counts per tab', async () => {
    rows = [row({}), row({ id: B, name: 'Read Person', status: 'read' })];
    render(await AdminInboxPage({ searchParams: {} }));
    const list = screen.getByRole('region', { name: 'Messages' });
    expect(within(list).getByText('Jane Doe')).toBeInTheDocument();
    expect(within(list).queryByText('Read Person')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Unread\s*1/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Select a message')).toBeInTheDocument();
  });

  it('marks an opened new message read and keeps it visible in the unread tab', async () => {
    rows = [row({})];
    render(await AdminInboxPage({ searchParams: { id: A } }));
    expect(update).toHaveBeenCalledWith({ status: 'read' });
    expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Messages' })).getByText('Jane Doe')).toBeInTheDocument();
  });

  it('ignores an id that is not a UUID', async () => {
    rows = [row({})];
    render(await AdminInboxPage({ searchParams: { id: 'nope' } }));
    expect(update).not.toHaveBeenCalled();
    expect(screen.getByText('Select a message')).toBeInTheDocument();
  });

  it('does not touch an archived message when opening it', async () => {
    rows = [row({ status: 'archived' })];
    render(await AdminInboxPage({ searchParams: { status: 'archived', id: A } }));
    expect(update).not.toHaveBeenCalled();
  });

  it('reports a failed load', async () => {
    listError = { message: 'boom' };
    render(await AdminInboxPage({ searchParams: {} }));
    expect(screen.getByText('Could not load messages.')).toBeInTheDocument();
  });
});

describe('legacy message URL', () => {
  it('forwards to the workspace with the message open', () => {
    expect(() => LegacyMessagePage({ params: { id: A } })).toThrow(`NEXT_REDIRECT /admin?status=all&id=${A}`);
  });
});

describe('KPI page', () => {
  it('starts with Traffic, followed by Messages', async () => {
    rows = [row({}), row({ id: B, status: 'spam' })];
    render(await AdminKpisPage({}));
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings.indexOf('Traffic')).toBeLessThan(headings.indexOf('Messages'));
    const messages = screen.getByRole('region', { name: 'Messages' });
    expect(within(messages).getByRole('heading', { name: 'Messages' })).toBeInTheDocument();
    expect(screen.getByText('Busiest weekdays')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open inbox' })).toHaveAttribute('href', '/admin');
  });

  it('reports a failed load', async () => {
    listError = { message: 'boom' };
    render(await AdminKpisPage({}));
    expect(screen.getByText('Could not load messages.')).toBeInTheDocument();
  });

  it('shows the setup steps before the first event', async () => {
    render(await AdminKpisPage({}));
    expect(screen.getByRole('heading', { name: 'No events collected yet' })).toBeInTheDocument();
  });

  it('renders traffic from the analytics events and reads the range from the URL', async () => {
    const at = new Date(Date.now() - 60_000).toISOString();
    events = [
      { created_at: at, type: 'pageview', visitor: 'a'.repeat(64), path: '/de', prev_path: null, referrer: 'google.com', target: null, country: 'DE', device: 'desktop', browser: 'Chrome' },
    ];
    render(await AdminKpisPage({ searchParams: { range: '24h' } }));
    expect(screen.getByRole('radio', { name: '24h' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('heading', { name: 'Flow explorer' })).toBeInTheDocument();
    expect(screen.getAllByText('google.com').length).toBeGreaterThan(0);
  });

  it('reports a failed analytics load', async () => {
    eventsError = { message: 'relation does not exist' };
    render(await AdminKpisPage({}));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load analytics events');
  });
});
