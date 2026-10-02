import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { computeTraffic, parseTrafficParams, type TrafficEvent } from '../../../_lib/traffic';

const replace = jest.fn();
const refresh = jest.fn();
let search = '';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh, push: jest.fn() }),
  usePathname: () => '/admin/kpis',
  useSearchParams: () => new URLSearchParams(search),
}));

import { TrafficDashboard } from '../TrafficDashboard';
import { KpiViewProvider } from '../../kpi/views';

const NOW = new Date('2026-10-02T12:30:00Z');
const ev = (at: string, over: Partial<TrafficEvent> = {}): TrafficEvent => ({
  created_at: at,
  type: 'pageview',
  visitor: 'v1',
  path: '/de',
  prev_path: null,
  referrer: null,
  target: null,
  country: 'DE',
  device: 'desktop',
  browser: 'Chrome',
  ...over,
});
const EVENTS = [
  ev('2026-10-02T09:00:00Z', { referrer: 'google.com' }),
  ev('2026-10-02T09:00:30Z', { type: 'click', target: 'hero:contact' }),
  ev('2026-10-02T09:01:00Z', { path: '/de/contact', prev_path: '/de' }),
  ev('2026-10-02T11:00:00Z', { visitor: 'v2', path: '/de/projects', referrer: 'linkedin.com', country: 'US', device: 'mobile' }),
  ev('2026-10-02T11:02:00Z', { visitor: 'v2', path: '/de', prev_path: '/de/projects', country: 'US', device: 'mobile' }),
];

function setup(query: Record<string, string> = {}, events = EVENTS) {
  search = new URLSearchParams(query).toString();
  window.history.replaceState(null, '', `/admin/kpis${search ? `?${search}` : ''}`);
  const params = parseTrafficParams(query);
  const data = computeTraffic(events, params, NOW);
  return render(<TrafficDashboard data={data} params={params} loadError={false} capped={false} generatedAt={NOW.toISOString()} />);
}

/** The URL the dashboard navigated to last, as a URLSearchParams. */
const lastQuery = () => new URLSearchParams(String(replace.mock.calls.at(-1)?.[0]).split('?')[1] ?? '');

beforeEach(() => {
  replace.mockClear();
  refresh.mockClear();
  jest.useFakeTimers({ now: NOW });
});
afterEach(() => jest.useRealTimers());

describe('TrafficDashboard', () => {
  it('shows the headline numbers and the live pulse', () => {
    setup();
    expect(screen.getByRole('button', { name: /Visitors/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTitle('Visitors active in the last 5 minutes')).toHaveTextContent('0 live');
    expect(screen.getByRole('heading', { name: 'Flow explorer' })).toBeInTheDocument();
  });

  it('changes the range through the segmented control and the arrow keys', () => {
    setup();
    fireEvent.click(screen.getByRole('radio', { name: '24h' }));
    expect(lastQuery().get('range')).toBe('24h');
    fireEvent.keyDown(screen.getByRole('radio', { name: '7d' }), { key: 'ArrowRight' });
    expect(lastQuery().get('range')).toBe('30d');
  });

  it('charts another metric when a metric tile is pressed', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Page views/ }));
    expect(lastQuery().get('metric')).toBe('pageviews');
  });

  it('filters by clicking a row and removes the filter from its chip', () => {
    setup();
    const sources = screen.getByRole('list', { name: 'Sources' });
    fireEvent.click(within(sources).getByRole('button', { name: /google\.com/ }));
    expect(lastQuery().get('source')).toBe('google.com');

    replace.mockClear();
    setup({ source: 'google.com' });
    fireEvent.click(screen.getByRole('button', { name: 'Remove source filter' }));
    expect(lastQuery().has('source')).toBe(false);
  });

  it('clears all filters with one button and Backspace clears the newest', () => {
    setup({ source: 'google.com', country: 'DE' });
    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(lastQuery().has('country')).toBe(false);
    expect(lastQuery().get('source')).toBe('google.com');
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(lastQuery().toString()).toBe('');
  });

  it('switches the audience tab with the arrow keys', () => {
    setup();
    const tab = screen.getByRole('tab', { name: 'Country' });
    fireEvent.keyDown(tab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Device' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('list', { name: 'Visitors by device' })).toHaveTextContent('mobile');
  });

  it('supports the page-wide keyboard shortcuts', () => {
    setup();
    fireEvent.keyDown(window, { key: '1' });
    expect(lastQuery().get('range')).toBe('24h');
    fireEvent.keyDown(window, { key: 'c' });
    expect(lastQuery().get('metric')).toBe('clicks');
    fireEvent.keyDown(window, { key: 'r' });
    expect(refresh).toHaveBeenCalled();
  });

  it('runs commands from the palette', () => {
    setup();
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    const dialog = screen.getByRole('dialog', { name: 'Command palette' });
    const input = within(dialog).getByRole('combobox');
    fireEvent.change(input, { target: { value: 'source linkedin' } });
    expect(within(dialog).getAllByRole('option')).toHaveLength(1);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(lastQuery().get('source')).toBe('linkedin.com');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the palette with Escape and ignores shortcuts while typing', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Commands/ }));
    const input = within(screen.getByRole('dialog')).getByRole('combobox');
    fireEvent.keyDown(input, { key: '1' });
    expect(replace).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('walks the flow by clicking a page node and comes back with the trail', () => {
    setup();
    const wentTo = screen.getByRole('list', { name: 'Went to' });
    fireEvent.click(within(wentTo).getByRole('button', { name: /\/de\/contact/ }));
    expect(lastQuery().get('focus')).toBe('/de/contact');
    fireEvent.click(within(screen.getByRole('list', { name: 'Came from' })).getByRole('button', { name: /google\.com/ }));
    expect(lastQuery().get('source')).toBe('google.com');
  });

  it('auto-refreshes every 30 s until paused', () => {
    setup();
    act(() => jest.advanceTimersByTime(30_000));
    expect(refresh).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Auto-refresh' }));
    act(() => jest.advanceTimersByTime(60_000));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('shows setup steps before the first event', () => {
    setup({}, []);
    expect(screen.getByRole('heading', { name: 'No events collected yet' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Flow explorer' })).not.toBeInTheDocument();
  });

  it('reads chart values from the keyboard', () => {
    setup();
    const chart = screen.getByRole('group', { name: /Visitors over 7 days/ });
    fireEvent.focus(chart);
    expect(screen.getByRole('status')).toHaveTextContent('02.10.');
    fireEvent.keyDown(chart, { key: 'Home' });
    expect(screen.getByRole('status')).toHaveTextContent('26.09.');
  });

  it('moves through the heatmap with the arrow keys', () => {
    setup();
    const grid = screen.getByRole('grid');
    fireEvent.focus(grid);
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(screen.getByText(/Fri 12:00–13:00: \d visitors/)).toBeInTheDocument();
  });

  it('switches sections from the palette and ignores traffic shortcuts in the Messages view', () => {
    search = '';
    window.history.replaceState(null, '', '/admin/kpis');
    const params = parseTrafficParams({});
    render(
      <KpiViewProvider initial="all">
        <TrafficDashboard data={computeTraffic(EVENTS, params, NOW)} params={params} loadError={false} capped={false} generatedAt={NOW.toISOString()} />
      </KpiViewProvider>
    );
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const input = within(screen.getByRole('dialog')).getByRole('combobox');
    fireEvent.change(input, { target: { value: 'show messages' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(window.location.search).toBe('?view=messages');
    expect(screen.getByRole('heading', { name: 'Traffic', hidden: true }).closest('[hidden]')).not.toBeNull();
    fireEvent.keyDown(window, { key: '1' });
    expect(replace).not.toHaveBeenCalled();
    // ⌘K still works outside the traffic section.
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('narrows the click board as you type', () => {
    setup();
    const board = screen.getByRole('region', { name: 'What people click' });
    fireEvent.change(within(board).getByPlaceholderText('Filter elements…'), { target: { value: 'nothing' } });
    expect(within(board).getByText(/No element matches/)).toBeInTheDocument();
  });
});
