import { fireEvent, render, screen } from '@testing-library/react';
import { Panel } from '../Panel';

// jsdom has no PointerEvent, so fireEvent would drop clientX/clientY.
// A MouseEvent subclass carries the coordinates like a real pointer event.
beforeAll(() => {
  if (!('PointerEvent' in window)) {
    Object.defineProperty(window, 'PointerEvent', { configurable: true, value: class extends MouseEvent {} });
  }
});

describe('Panel', () => {
  it('is a section named by its title, with optional kicker and actions', () => {
    render(
      <Panel id="flows" kicker="Paths" title="Top flows" actions={<button type="button">Export</button>}>
        body
      </Panel>
    );
    const region = screen.getByRole('region', { name: 'Top flows' });
    expect(region).toHaveAttribute('id', 'flows');
    expect(region).toHaveTextContent('Paths');
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it('leaves out the kicker and actions when not given', () => {
    render(<Panel id="p" title="Plain">body</Panel>);
    expect(screen.getByRole('region', { name: 'Plain' }).querySelector('p')).toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('moves the spotlight to the pointer, relative to the panel', () => {
    render(<Panel id="p" title="Spot">body</Panel>);
    const region = screen.getByRole('region', { name: 'Spot' });
    region.getBoundingClientRect = () => ({ left: 100, top: 50 }) as DOMRect;
    fireEvent.pointerMove(region, { clientX: 130, clientY: 70 });
    expect(region.style.getPropertyValue('--mx')).toBe('30px');
    expect(region.style.getPropertyValue('--my')).toBe('20px');
  });
});
