import { render, screen } from '@testing-library/react';
import { ArtBackdrop } from '../ArtBackdrop';

describe('ArtBackdrop', () => {
  it('is decorative: hidden from assistive tech and never catches pointer events', () => {
    render(<ArtBackdrop className="bg-cover" />);
    const art = screen.getByTestId('art-backdrop');
    expect(art).toHaveAttribute('aria-hidden', 'true');
    expect(art).toHaveClass('pointer-events-none');
  });

  it('keeps the classes of the caller next to the light and dark blend classes', () => {
    render(<ArtBackdrop className="bg-cover bg-center" />);
    const art = screen.getByTestId('art-backdrop');
    expect(art).toHaveClass('bg-cover', 'bg-center', 'mix-blend-multiply', 'dark:mix-blend-screen');
  });
});
