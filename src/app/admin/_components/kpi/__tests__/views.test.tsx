import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { KPI_VIEWS, isVisible, parseView, type KpiView } from '../viewModel';
import { KpiSection, KpiViewProvider, useKpiView } from '../views';
import { SectionSwitcher } from '../SectionSwitcher';

// jsdom has no canvas; the starfield just skips drawing.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => null) as unknown as HTMLCanvasElement['getContext'];
});
beforeEach(() => window.history.replaceState(null, '', '/admin/kpis?range=24h'));

function Page({ initial = 'all' }: { initial?: KpiView }) {
  return (
    <KpiViewProvider initial={initial}>
      <SectionSwitcher counts={{ overview: 12, messages: 3 }} />
      <KpiSection id="traffic">
        <KpiSection id="overview">
          <p>overview body</p>
        </KpiSection>
        <KpiSection id="flow" className="grid">
          <p>flow body</p>
        </KpiSection>
      </KpiSection>
      <KpiSection id="messages">
        <p>messages body</p>
      </KpiSection>
    </KpiViewProvider>
  );
}

const shown = (text: string) => !screen.getByText(text).closest('[hidden]');

describe('view model', () => {
  it('parses views and falls back to all', () => {
    expect(parseView('flow')).toBe('flow');
    expect(parseView('nope')).toBe('all');
    expect(parseView(null)).toBe('all');
    expect(KPI_VIEWS[0].id).toBe('all');
  });

  it('shows traffic chrome for traffic views only', () => {
    expect(isVisible('all', 'messages')).toBe(true);
    expect(isVisible('flow', 'traffic')).toBe(true);
    expect(isVisible('messages', 'traffic')).toBe(false);
    expect(isVisible('flow', 'overview')).toBe(false);
  });
});

describe('SectionSwitcher', () => {
  it('is a radio group with counts, everything shown by default', () => {
    render(<Page />);
    expect(screen.getByRole('radiogroup', { name: 'KPI section' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /All/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /Overview/ })).toHaveTextContent('12');
    expect(screen.getByRole('radio', { name: /Messages/ })).toHaveTextContent('3');
    expect(['overview body', 'flow body', 'messages body'].every(shown)).toBe(true);
  });

  it('shows one section when chosen and writes ?view= without dropping other params', () => {
    render(<Page />);
    fireEvent.click(screen.getByRole('radio', { name: /Flow/ }));
    expect(screen.getByRole('radio', { name: /Flow/ })).toHaveAttribute('aria-checked', 'true');
    expect(shown('flow body')).toBe(true);
    expect(shown('overview body')).toBe(false);
    expect(shown('messages body')).toBe(false);
    // The hidden attribute alone would lose against a display utility.
    expect(screen.getByText('overview body').closest('[data-kpi-section]')).toHaveClass('!hidden');
    expect(window.location.search).toBe('?range=24h&view=flow');

    fireEvent.click(screen.getByRole('radio', { name: /All/ }));
    expect(window.location.search).toBe('?range=24h');
  });

  it('moves the selection with the arrow keys, Home and End, with focus', () => {
    render(<Page initial="overview" />);
    const overview = screen.getByRole('radio', { name: /Overview/ });
    expect(overview).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(overview, { key: 'ArrowRight' });
    const when = screen.getByRole('radio', { name: /When/ });
    expect(when).toHaveAttribute('aria-checked', 'true');
    expect(when).toHaveFocus();
    fireEvent.keyDown(when, { key: 'End' });
    expect(screen.getByRole('radio', { name: /Messages/ })).toHaveAttribute('aria-checked', 'true');
    expect(shown('messages body')).toBe(true);
    expect(shown('overview body')).toBe(false);
    fireEvent.keyDown(screen.getByRole('radio', { name: /Messages/ }), { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: /All/ })).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(screen.getByRole('radio', { name: /All/ }), { key: 'ArrowLeft' });
    expect(screen.getByRole('radio', { name: /Messages/ })).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(screen.getByRole('radio', { name: /Messages/ }), { key: 'Home' });
    expect(screen.getByRole('radio', { name: /All/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps hidden sections mounted so their state survives', () => {
    function Counter() {
      const [n, setN] = React.useState(0);
      return <button onClick={() => setN(n + 1)}>count {n}</button>;
    }
    render(
      <KpiViewProvider initial="all">
        <SectionSwitcher />
        <KpiSection id="flow">
          <Counter />
        </KpiSection>
      </KpiViewProvider>
    );
    fireEvent.click(screen.getByText('count 0'));
    fireEvent.click(screen.getByRole('radio', { name: /Messages/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Flow/ }));
    expect(screen.getByText('count 1')).toBeInTheDocument();
  });

  it('follows back/forward', () => {
    function Probe() {
      return <span data-testid="view">{useKpiView().view}</span>;
    }
    render(
      <KpiViewProvider initial="all">
        <Probe />
      </KpiViewProvider>
    );
    act(() => {
      window.history.replaceState(null, '', '/admin/kpis?view=clicks');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByTestId('view')).toHaveTextContent('clicks');
  });
});
