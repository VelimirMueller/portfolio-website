import { fireEvent, render, screen, within } from '@testing-library/react';
import DashboardDemoPage from '../../page';

describe('dashboard demo', () => {
  beforeEach(() => {
    // Count-up animations never get a frame here; the tests check static text only.
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
  });
  afterEach(() => jest.restoreAllMocks());

  const nav = () => within(screen.getByRole('complementary', { name: 'Dashboard sidebar navigation' }));

  it('opens on the dashboard view', () => {
    render(<DashboardDemoPage />);
    expect(nav().getByRole('button', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Top Pipeline Deals')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search in Dashboard' })).toBeInTheDocument();
  });

  it.each([
    ['Pipeline', 'Sales Pipeline', 'Sales Pipeline'],
    ['Workflows', 'Workflows', 'Workflows'],
    ['Analytics', 'Analytics', 'Analytics'],
    ['Settings', 'Settings', 'Settings'],
  ])('the %s item shows its view', (label, heading, searchTitle) => {
    render(<DashboardDemoPage />);
    fireEvent.click(nav().getByRole('button', { name: label }));
    expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    expect(nav().getByRole('button', { name: label })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('searchbox', { name: `Search in ${searchTitle}` })).toBeInTheDocument();
    expect(screen.queryByText('Top Pipeline Deals')).not.toBeInTheDocument();
  });

  it('shows the pipeline totals', () => {
    render(<DashboardDemoPage />);
    fireEvent.click(nav().getByRole('button', { name: 'Pipeline' }));
    expect(screen.getByText('8 active deals')).toBeInTheDocument();
    expect(screen.getByText('$850K')).toBeInTheDocument();
  });

  it('opens and closes the notification list', () => {
    const { container } = render(<DashboardDemoPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(screen.getByText('3 new')).toBeInTheDocument();
    fireEvent.click(container.querySelector('.fixed.inset-0.z-40')!);
    expect(screen.queryByText('3 new')).not.toBeInTheDocument();
  });

  it('opens the sidebar on mobile and closes it when a view is chosen', () => {
    render(<DashboardDemoPage />);
    const aside = screen.getByRole('complementary', { name: 'Dashboard sidebar navigation' });
    expect(aside.className).toContain('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Open sidebar menu' }));
    expect(aside.className).toContain('fixed');
    fireEvent.click(nav().getByRole('button', { name: 'Analytics' }));
    expect(aside.className).not.toContain('fixed');
  });

  it('links back to the projects page', () => {
    render(<DashboardDemoPage />);
    expect(screen.getByRole('link', { name: 'Exit Demo' })).toHaveAttribute('href', '/projects');
  });
});
