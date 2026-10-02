import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

let mockPath = '/de';
jest.mock('next/navigation', () => ({ usePathname: () => mockPath }));

import { PageWarp, SiteHyperspace, internalLinkOrigin } from '../SiteHyperspace';

function clickOn(html: string, init: MouseEventInit = {}) {
  document.body.innerHTML = html;
  const el = document.body.querySelector('[data-hit]') ?? document.body.firstElementChild!;
  const ev = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 120, clientY: 40, detail: 1, ...init });
  Object.defineProperty(ev, 'target', { value: el });
  return internalLinkOrigin(ev);
}

describe('internalLinkOrigin', () => {
  beforeEach(() => window.history.replaceState(null, '', '/de'));

  it('fires for an internal link to another page, at the pointer', () => {
    expect(clickOn('<a href="/de/about"><span data-hit>About</span></a>')).toEqual({ x: 120, y: 40 });
  });

  it('uses the link centre for keyboard activation', () => {
    const rect = jest.spyOn(HTMLAnchorElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 20, width: 80, height: 30 } as DOMRect);
    const origin = clickOn('<a data-hit href="/de/about">About</a>', { detail: 0, clientX: 0, clientY: 0 });
    expect(origin).toEqual({ x: 140, y: 35 });
    rect.mockRestore();
  });

  it.each([
    ['same page', '<a data-hit href="/de">Home</a>', {}],
    ['in-page anchor', '<a data-hit href="#top">Top</a>', {}],
    ['external site', '<a data-hit href="https://github.com/x">GH</a>', {}],
    ['new tab', '<a data-hit href="/de/about" target="_blank">About</a>', {}],
    ['mailto', '<a data-hit href="mailto:a@b.c">Mail</a>', {}],
    ['modifier click', '<a data-hit href="/de/about">About</a>', { metaKey: true }],
    ['middle click', '<a data-hit href="/de/about">About</a>', { button: 1 }],
    ['not a link', '<button data-hit>Send</button>', {}],
  ])('ignores %s', (_name, html, init) => {
    expect(clickOn(html, init)).toBeNull();
  });
});

describe('SiteHyperspace / PageWarp', () => {
  it('renders one decorative canvas fixed behind the page', () => {
    const { container } = render(<SiteHyperspace />);
    const canvas = container.querySelector('canvas')!;
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toHaveClass('fixed', '-z-20', 'pointer-events-none');
  });

  it('replays the warp-in on navigation, not on the first load, without remounting', () => {
    function Counter() {
      const [n, setN] = React.useState(0);
      return <button onClick={() => setN(n + 1)}>n{n}</button>;
    }
    const { container, rerender } = render(
      <PageWarp>
        <Counter />
      </PageWarp>
    );
    const wrap = container.querySelector('[data-page-warp]')!;
    expect(wrap).not.toHaveClass('motion-safe:animate-warp-in');
    screen.getByText('n0').click();
    mockPath = '/de/about';
    rerender(
      <PageWarp>
        <Counter />
      </PageWarp>
    );
    expect(wrap).toHaveClass('motion-safe:animate-warp-in');
    expect(screen.getByText('n1')).toBeInTheDocument();
    // Removed when done, so no transform lingers above the page.
    fireEvent.animationEnd(wrap);
    expect(wrap).not.toHaveClass('motion-safe:animate-warp-in');
  });
});
