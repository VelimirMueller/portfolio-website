import { render, screen } from '@testing-library/react';
import { Donut } from '../charts';

describe('Donut', () => {
  it('starts each arc where the previous one ends and skips empty segments', () => {
    const { container } = render(
      <Donut
        label="Devices"
        segments={[
          { label: 'Desktop', value: 60, pct: 60, color: '#0ea5c6' },
          { label: 'Tablet', value: 0, pct: 0, color: '#a855f7' },
          { label: 'Mobile', value: 30, pct: 30, color: '#22c55e' },
          { label: 'Other', value: 10, pct: 10, color: '#f59e0b' },
        ]}
      />
    );
    const arcs = Array.from(container.querySelectorAll('svg path')).slice(1);
    expect(arcs.map((p) => [p.getAttribute('stroke'), p.getAttribute('stroke-dasharray'), p.getAttribute('stroke-dashoffset')])).toEqual([
      ['#0ea5c6', '60, 100', '0'],
      ['#22c55e', '30, 100', '-60'],
      ['#f59e0b', '10, 100', '-90'],
    ]);
    // The legend still lists every segment.
    expect(screen.getByText('Tablet')).toBeInTheDocument();
  });
});
