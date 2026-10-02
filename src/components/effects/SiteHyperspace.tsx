'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Starfield, type StarfieldHandle } from './Starfield';

/** Where an internal navigation was triggered, for the jump origin. */
export function internalLinkOrigin(event: MouseEvent): { x: number; y: number } | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.('a');
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return null;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return null;
  // Keyboard activation reports (0, 0): use the link's centre instead.
  if (event.detail === 0 || (event.clientX === 0 && event.clientY === 0)) {
    const r = anchor.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: event.clientX, y: event.clientY };
}

/**
 * The public site's hyperspace layer: a very faint starfield fixed behind
 * every page, and a short light-speed jump from wherever an internal link is
 * clicked. Sits below the hero's colour blobs (-z-20), so it only shows in
 * the gaps between cards and text.
 */
export function SiteHyperspace() {
  const field = useRef<StarfieldHandle>(null);
  // Decided once on the client; the count only feeds the canvas, never markup.
  const [stars] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 40 : 90));

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const origin = internalLinkOrigin(e);
      if (origin) field.current?.jump(origin.x, origin.y);
    };
    // Capture phase: next/link calls preventDefault() for client-side navigation,
    // so a bubbling listener would see every internal click as "prevented".
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return (
    <Starfield
      ref={field}
      stars={stars}
      aspect={1}
      intensity={0.85}
      burst={0.6}
      idleSpeed={0.0008}
      tone="auto"
      className="fixed inset-0 -z-20 h-full w-full"
    />
  );
}

/**
 * Wraps the page content and drops each newly navigated page in with the
 * warp-in animation (not on the first load — the page's own AnimateIn
 * handles that). Restarts the CSS animation without remounting the page.
 */
export function PageWarp({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;
    el.classList.remove('motion-safe:animate-warp-in');
    void el.offsetWidth;
    el.classList.add('motion-safe:animate-warp-in');
  }, [pathname]);

  // Drop the class when done, so no transform/filter stays on the page's ancestor
  // (either would make it the containing block for position: fixed children).
  const onAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('motion-safe:animate-warp-in');
  };

  return (
    <div ref={ref} data-page-warp="" onAnimationEnd={onAnimationEnd}>
      {children}
    </div>
  );
}
