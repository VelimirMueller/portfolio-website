import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { parseKpiTab } from '@/app/admin/_lib/dashboardStats';
import { dashboardStatsFixture } from '@/app/admin/_lib/dashboardStatsFixtures';
import { KpiDashboard } from '../KpiDashboard';
import { MagicStats } from '../MagicStats';
import { SupabaseStats } from '../SupabaseStats';
import { VercelPanel } from '../VercelPanel';
import type { AdminDashboardStats } from '@/app/admin/_lib/dashboardStats';

const fixture: AdminDashboardStats = dashboardStatsFixture();

function Dashboard({ initialTab = 'website' }: { initialTab?: ReturnType<typeof parseKpiTab> }) {
  return (
    <KpiDashboard
      initialTab={initialTab}
      panels={{
        website: <p>website body</p>,
        supabase: <SupabaseStats stats={fixture} />,
        vercel: <VercelPanel stats={{ status: 'unconfigured' }} />,
        magic: <MagicStats stats={fixture} />,
      }}
    />
  );
}

beforeEach(() => window.history.replaceState(null, '', '/admin/kpis?range=24h'));

describe('parseKpiTab', () => {
  it('accepts the known tabs and falls back to website', () => {
    expect(parseKpiTab('supabase')).toBe('supabase');
    expect(parseKpiTab('vercel')).toBe('vercel');
    expect(parseKpiTab('magic')).toBe('magic');
    expect(parseKpiTab('website')).toBe('website');
    expect(parseKpiTab('nope')).toBe('website');
    expect(parseKpiTab(null)).toBe('website');
  });
});

describe('KpiDashboard tabs', () => {
  it('shows the Website tab by default, others stay mounted but hidden', () => {
    render(<Dashboard />);
    expect(screen.getByRole('tab', { name: 'Website' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('website body')).toBeVisible();
    expect(screen.getByText('VERCEL_API_TOKEN').closest('[role="tabpanel"]')).toHaveAttribute('hidden');
  });

  it('switches tabs on click and keeps ?tab= next to the other params', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('tab', { name: 'Supabase' }));
    expect(screen.getByRole('tab', { name: 'Supabase' })).toHaveAttribute('aria-selected', 'true');
    expect(window.location.search).toBe('?range=24h&tab=supabase');
    fireEvent.click(screen.getByRole('tab', { name: 'Website' }));
    expect(window.location.search).toBe('?range=24h');
  });

  it('follows back/forward', () => {
    render(<Dashboard />);
    window.history.replaceState(null, '', '/admin/kpis?tab=vercel');
    fireEvent(window, new PopStateEvent('popstate'));
    expect(screen.getByRole('tab', { name: 'Vercel' })).toHaveAttribute('aria-selected', 'true');
  });

  it('moves with the keyboard like the tabs pattern requires', () => {
    render(<Dashboard />);
    const website = screen.getByRole('tab', { name: 'Website' });
    website.focus();
    fireEvent.keyDown(website, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Supabase' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Supabase' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Magic' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Magic' }), { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Website' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Supabase tab', () => {
  it('renders the fixture numbers, tables by size and buckets', async () => {
    render(<SupabaseStats stats={fixture} />);
    // Display values are immediate; the count-up cards settle at their value.
    expect(screen.getByText('2.4 GB')).toBeInTheDocument();
    expect(screen.getByText('17.2')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument(), { timeout: 4000 });
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument(), { timeout: 4000 });

    const tables = screen.getByRole('table', { name: 'Public tables, largest first' });
    expect(tables.textContent).toContain('analytics_events');
    expect(tables.textContent).toContain('150,000');
    expect(tables.textContent).toContain('1 GB');
    // Sorted by size, largest first (the fixture lists the small table first).
    expect(tables.textContent?.indexOf('analytics_events')).toBeLessThan(tables.textContent?.indexOf('contact_messages') ?? 0);

    const buckets = screen.getByRole('table', { name: 'Storage buckets' });
    expect(buckets.textContent).toContain('card-images');
    expect(buckets.textContent).toContain('Public');
    expect(buckets.textContent).toContain('Private');
    expect(buckets.textContent).toContain('1,200');
  });

  it('shows the calm migration notice when the RPC failed', () => {
    render(<SupabaseStats stats={null} error />);
    expect(screen.getByText('Stats are not available yet — run migration 20261010060000')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the notice when there is no data either', () => {
    render(<SupabaseStats stats={null} />);
    expect(screen.getByText('Stats are not available yet — run migration 20261010060000')).toBeInTheDocument();
  });
});

describe('Vercel tab', () => {
  it('explains which token it needs, without calling anything', () => {
    render(<VercelPanel stats={{ status: 'unconfigured' }} />);
    expect(screen.getByRole('heading', { name: 'Vercel' })).toBeInTheDocument();
    expect(screen.getByText('VERCEL_API_TOKEN')).toBeInTheDocument();
    expect(screen.getByText(/Production environment/)).toBeInTheDocument();
  });
});

describe('Magic tab', () => {
  it('renders the fixture numbers, timestamps and the admin link', async () => {
    render(<MagicStats stats={fixture} />);
    await waitFor(() => expect(screen.getByText('421')).toBeInTheDocument(), { timeout: 4000 });
    await waitFor(() => expect(screen.getByText('653')).toBeInTheDocument(), { timeout: 4000 });
    expect(screen.getByText('Unique cards')).toBeInTheDocument();
    expect(screen.getByText('German copies')).toBeInTheDocument();
    expect(screen.getByText('Wishlist cards')).toBeInTheDocument();
    expect(screen.getByText('Decks')).toBeInTheDocument();
    expect(screen.getByText('Scanner test data')).toBeInTheDocument();
    expect(screen.getByText(/ago \(14:30 Berlin\)/)).toBeInTheDocument();
    expect(screen.getByText('never')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Magic admin/ })).toHaveAttribute('href', '/admin/magic');
  });

  it('shows the calm migration notice when the RPC failed', () => {
    render(<MagicStats stats={null} error />);
    expect(screen.getByText('Stats are not available yet — run migration 20261010060000')).toBeInTheDocument();
  });
});
