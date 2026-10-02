import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { AnalyticsToggle } from '../AnalyticsToggle';
import { OPT_OUT_KEY, setOptedOut } from '@/utils/analytics/optOut';

const labels = { title: 'Anonymous statistics', on: 'On', off: 'Off', browser: 'Browser says no', blocked: 'Blocked' };

describe('AnalyticsToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true });
  });

  it('switches statistics off and on again in one click each', () => {
    render(<AnalyticsToggle labels={labels} />);
    const sw = screen.getByRole('switch', { name: 'Anonymous statistics' });
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('On')).toBeInTheDocument();

    fireEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(window.localStorage.getItem(OPT_OUT_KEY)).toBe('1');
    expect(screen.getByText('Off')).toBeInTheDocument();

    fireEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(window.localStorage.getItem(OPT_OUT_KEY)).toBeNull();
  });

  it('starts off when the visitor objected earlier and follows changes made elsewhere', () => {
    window.localStorage.setItem(OPT_OUT_KEY, '1');
    render(<AnalyticsToggle labels={labels} />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    act(() => {
      setOptedOut(false);
    });
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('is disabled and explains why when the browser sends Do Not Track', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    render(<AnalyticsToggle labels={labels} />);
    expect(screen.getByRole('switch')).toBeDisabled();
    expect(screen.getByText('Browser says no')).toBeInTheDocument();
  });

  it('warns when the choice cannot be saved', () => {
    const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    render(<AnalyticsToggle labels={labels} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    set.mockRestore();
  });
});
