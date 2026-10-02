'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Dashboard state lives in the URL (?range=7d&source=google.com&focus=/de),
 * so every view is shareable, survives reloads and works with back/forward.
 * Updates run in a transition: the current render stays on screen (dimmed)
 * until the server sends the new numbers — no skeleton, no layout jump.
 */
export function useTrafficNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const set = useCallback(
    (patch: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(searchParams?.toString() ?? '');
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === '') next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [router, pathname, searchParams]
  );

  const refresh = useCallback(() => startTransition(() => router.refresh()), [router]);

  return { set, refresh, pending };
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

/** easeOutCubic count-up from the previous value to `end`; jumps straight there with reduced motion. */
export function useCountUp(end: number, duration = 900): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(end);
  const from = useRef(0);
  useEffect(() => {
    if (reduced) {
      setValue(end);
      from.current = end;
      return;
    }
    const start = from.current;
    let raf = 0;
    let t0: number | null = null;
    const step = (t: number) => {
      if (t0 === null) t0 = t;
      const p = Math.min((t - t0) / duration, 1);
      const v = start + (end - start) * (1 - Math.pow(1 - p, 3));
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = end;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, reduced]);
  return value;
}

/** Element width, tracked with a ResizeObserver (charts draw in real pixels). */
export function useElementWidth<T extends HTMLElement>(fallback = 640) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/** Re-renders every `ms` so relative times ("5m ago") stay true. */
export function useNow(ms = 15_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/** True when a keyboard shortcut should be ignored because the user is typing. */
export function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
