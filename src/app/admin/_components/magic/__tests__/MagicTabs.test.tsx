import { render, screen } from '@testing-library/react';

let pathname = '/admin/magic';
jest.mock('next/navigation', () => ({ usePathname: () => pathname }));

import { MagicTabs } from '../MagicTabs';

const current = () =>
  screen
    .getAllByRole('link')
    .filter((l) => l.getAttribute('aria-current') === 'page')
    .map((l) => l.textContent);

describe('MagicTabs', () => {
  it('links every section', () => {
    render(<MagicTabs />);
    expect(screen.getByRole('navigation', { name: 'Magic sections' })).toBeInTheDocument();
    expect(screen.getAllByRole('link').map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['Pool', '/admin/magic'],
      ['Decks', '/admin/magic/decks'],
      ['Wishlist', '/admin/magic/wishlist'],
      ['Add card', '/admin/magic/add'],
    ]);
  });

  it.each([
    ['/admin/magic', ['Pool']],
    ['/admin/magic/wishlist', ['Wishlist']],
    ['/admin/magic/add', ['Add card']],
    ['/admin/magic/decks', ['Decks']],
    // A deck page and the import page stay under "Decks".
    ['/admin/magic/decks/krenko-mob-boss', ['Decks']],
    ['/admin/magic/decks/new', ['Decks']],
  ])('marks only the matching tab as current on %s', (path, expected) => {
    pathname = path;
    render(<MagicTabs />);
    expect(current()).toEqual(expected);
  });

  it('does not treat a lookalike path as the decks section', () => {
    pathname = '/admin/magic/decksx';
    render(<MagicTabs />);
    expect(current()).toEqual([]);
  });
});
