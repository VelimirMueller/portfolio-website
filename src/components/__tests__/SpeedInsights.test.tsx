import React from 'react';
import { act, render } from '@testing-library/react';

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ src }: { src: string }) => <span data-testid="speed-insights" data-src={src} />,
}));

import { SpeedInsights, SPEED_INSIGHTS_SRC } from '../SpeedInsights';
import { OPT_OUT_KEY, setOptedOut } from '@/utils/analytics/optOut';

type SiWindow = Window & { si?: unknown; siq?: [string, (event: unknown) => unknown][] };

const setNavigatorSignal = (key: 'doNotTrack' | 'globalPrivacyControl', value: unknown) =>
  Object.defineProperty(navigator, key, { value, configurable: true });

describe('SpeedInsights', () => {
  beforeEach(() => {
    window.localStorage.removeItem(OPT_OUT_KEY);
    setNavigatorSignal('doNotTrack', null);
    setNavigatorSignal('globalPrivacyControl', undefined);
  });

  it('loads the script when statistics are allowed', () => {
    const { queryByTestId } = render(<SpeedInsights />);
    expect(queryByTestId('speed-insights')).toHaveAttribute('data-src', SPEED_INSIGHTS_SRC);
  });

  it('loads nothing when the visitor opted out', () => {
    window.localStorage.setItem(OPT_OUT_KEY, '1');
    const { queryByTestId } = render(<SpeedInsights />);
    expect(queryByTestId('speed-insights')).toBeNull();
  });

  it('loads nothing with Do Not Track or Global Privacy Control', () => {
    setNavigatorSignal('doNotTrack', '1');
    expect(render(<SpeedInsights />).queryByTestId('speed-insights')).toBeNull();
    setNavigatorSignal('doNotTrack', null);
    setNavigatorSignal('globalPrivacyControl', true);
    expect(render(<SpeedInsights />).queryByTestId('speed-insights')).toBeNull();
  });

  it('loads the script when the visitor allows statistics again', () => {
    window.localStorage.setItem(OPT_OUT_KEY, '1');
    const { queryByTestId } = render(<SpeedInsights />);
    expect(queryByTestId('speed-insights')).toBeNull();
    act(() => {
      setOptedOut(false);
    });
    expect(queryByTestId('speed-insights')).not.toBeNull();
  });

  it('drops metrics through beforeSend once the visitor objects at runtime', () => {
    render(<SpeedInsights />);
    const queued = (window as SiWindow).siq ?? [];
    const beforeSend = queued.find(([name]) => name === 'beforeSend')?.[1];
    expect(beforeSend).toBeDefined();
    const metric = { type: 'vital', name: 'LCP' };
    expect(beforeSend!(metric)).toBe(metric);
    act(() => {
      setOptedOut(true);
    });
    expect(beforeSend!(metric)).toBeNull();
  });
});
