import { flagOf, formatAgo, formatCount, formatDuration, countryName, sourceLabel, splitTarget, trendText } from '../format';
import { matchActions } from '../CommandPalette';
import { niceScale, smoothPath } from '../TrafficChart';
import { cellColor } from '../Heatmap';
import { DIRECT } from '../../../_lib/traffic';

describe('format', () => {
  it('formats counts and durations', () => {
    expect(formatCount(1234)).toBe('1,234');
    expect(formatCount(12_345)).toBe('12.3K');
    expect(formatDuration(42)).toBe('42s');
    expect(formatDuration(75)).toBe('1m 15s');
    expect(formatDuration(3700)).toBe('1h 1m');
  });

  it('formats relative times', () => {
    const now = Date.parse('2026-10-02T12:00:00Z');
    expect(formatAgo('2026-10-02T11:59:55Z', now)).toBe('now');
    expect(formatAgo('2026-10-02T11:59:18Z', now)).toBe('42s');
    expect(formatAgo('2026-10-02T11:55:00Z', now)).toBe('5m');
    expect(formatAgo('2026-10-02T09:00:00Z', now)).toBe('3h');
    expect(formatAgo('2026-09-30T12:00:00Z', now)).toBe('2d');
  });

  it('labels countries, sources, targets and trends', () => {
    expect(flagOf('DE')).toBe('🇩🇪');
    expect(flagOf(null)).toBe('');
    expect(countryName('DE')).toBe('Germany');
    expect(sourceLabel(DIRECT)).toBe('Direct / none');
    expect(sourceLabel('google.com')).toBe('google.com');
    expect(splitTarget('hero:contact')).toEqual({ kind: 'hero', name: 'contact' });
    expect(splitTarget('link:/de/about')).toEqual({ kind: 'link', name: '/de/about' });
    expect(splitTarget('plain')).toEqual({ kind: 'element', name: 'plain' });
    expect(trendText(12.5)).toBe('+12.5%');
    expect(trendText(-3)).toBe('-3%');
    expect(trendText(null)).toBe('—');
  });
});

describe('matchActions', () => {
  const actions = [
    { id: 'a', group: 'Range', label: 'Last 24 hours', run: jest.fn() },
    { id: 'b', group: 'Filter by source', label: 'google.com', run: jest.fn() },
  ];
  it('matches every word anywhere in group and label', () => {
    expect(matchActions(actions, '').map((a) => a.id)).toEqual(['a', 'b']);
    expect(matchActions(actions, 'source goo').map((a) => a.id)).toEqual(['b']);
    expect(matchActions(actions, 'range 7')).toEqual([]);
  });
});

describe('chart helpers', () => {
  it('picks readable axis steps', () => {
    expect(niceScale(3)).toEqual({ max: 4, step: 1 });
    expect(niceScale(17)).toEqual({ max: 20, step: 5 });
    expect(niceScale(47)).toEqual({ max: 60, step: 20 });
    expect(niceScale(730)).toEqual({ max: 800, step: 200 });
  });

  it('draws a monotone curve that never leaves the data range', () => {
    const d = smoothPath([[0, 100], [10, 0], [20, 100], [30, 100], [40, 50]]);
    const ys = [...d.matchAll(/-?\d+(?:\.\d+)?,(-?\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(100);
    expect(smoothPath([[0, 1], [5, 2]])).toBe('M0,1 L5,2');
    expect(smoothPath([])).toBe('');
  });

  it('ramps heatmap cells from the empty colour', () => {
    expect(cellColor(0, 10)).toBe('#15151d');
    expect(cellColor(10, 10)).toContain('100%');
    expect(cellColor(5, 10)).toContain('59%');
  });
});
