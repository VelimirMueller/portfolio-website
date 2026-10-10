import { render, screen, waitFor, within } from '@testing-library/react';
import { summarizeDeployments } from '@/app/admin/_lib/vercelStats';
import { vercelStatsFixture } from '@/app/admin/_lib/vercelStatsFixtures';
import { VercelPanel } from '../VercelPanel';

describe('VercelPanel — unconfigured', () => {
  it('explains where to set the token, without a table', () => {
    render(<VercelPanel stats={{ status: 'unconfigured' }} />);
    expect(screen.getByRole('heading', { name: 'Vercel' })).toBeInTheDocument();
    expect(screen.getByText('VERCEL_API_TOKEN')).toBeInTheDocument();
    expect(screen.getByText(/Production environment/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('VercelPanel — error', () => {
  it('shows a calm status notice with the generic message', () => {
    render(<VercelPanel stats={{ status: 'error', message: 'Vercel stats are unavailable — HTTP 401.' }} />);
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('HTTP 401');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('VercelPanel — ok', () => {
  it('renders the KPI cards and the current production line', async () => {
    render(<VercelPanel stats={vercelStatsFixture()} />);

    expect(screen.getByText(/project portfolio-website/)).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument(); // 2 READY of 3 finished
    expect(screen.getAllByText('1 m 52 s')).toHaveLength(4); // 2 cards + table row + mobile card
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument(), { timeout: 4000 }); // deployments

    const link = screen.getByRole('link', { name: 'portfolio-website-a1b2c3d.vercel.app' });
    expect(link).toHaveAttribute('href', 'https://portfolio-website-a1b2c3d.vercel.app');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getAllByText('main').length).toBeGreaterThan(0); // branch (dl + table rows)
    expect(screen.getAllByText('a1b2c3d').length).toBeGreaterThan(0); // commit sha (dl + table + mobile)
    expect(screen.getAllByText(/\(\d{2}:\d{2} Berlin\)/).length).toBeGreaterThan(0); // relative, Berlin
  });

  it('lists the deployments as a table and as mobile cards', () => {
    render(<VercelPanel stats={vercelStatsFixture()} />);
    const table = screen.getByRole('table', { name: 'Latest deployments, newest first' });

    expect(within(table).getAllByText('READY')).toHaveLength(2);
    expect(within(table).getByText('ERROR')).toBeInTheDocument();
    expect(within(table).getByText('BUILDING')).toBeInTheDocument();
    expect(within(table).getAllByText('Production')).toHaveLength(2);
    expect(within(table).getAllByText('Preview')).toHaveLength(2);
    expect(within(table).getByText('feat/admin-vercel-tab')).toBeInTheDocument();
    expect(within(table).getByText('1 m 35 s')).toBeInTheDocument(); // the 95 s preview build
    expect(within(table).getAllByText('—')).toHaveLength(2); // unknown build times

    // The same rows once more as stacked cards below sm.
    expect(screen.getAllByText('feat: ship the new contact form')).toHaveLength(2);
  });

  it('survives a project without deployments', () => {
    render(<VercelPanel stats={vercelStatsFixture({ deployments: [], summary: summarizeDeployments([]) })} />);
    expect(screen.getByText('No deployments found for this project.')).toBeInTheDocument();
    expect(screen.getByText('No production deployment yet.')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(3); // success rate, avg and last build
  });
});
