'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { describeClickTarget } from '@/utils/analytics/describeClickTarget';
import { browserSignalsOptOut, isOptedOut } from '@/utils/analytics/optOut';

const ENDPOINT = '/api/collect';

type Beacon = { t: 'pageview' | 'click'; p: string; v?: string; r?: string; e?: string };

/**
 * Send nothing when the browser signals Do Not Track / Global Privacy
 * Control or the visitor switched statistics off on the privacy page.
 * Checked on every beacon, so switching off takes effect immediately.
 */
export function trackingAllowed(nav: Navigator = navigator): boolean {
  return !browserSignalsOptOut(nav) && !isOptedOut();
}

function send(beacon: Beacon) {
  const body = JSON.stringify(beacon);
  // sendBeacon survives page unloads (a click on an outbound link); text/plain
  // keeps it a "simple" request.
  if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return;
  fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {});
}

/**
 * Where the visitor came from: an explicit campaign tag beats the browser
 * referrer. Only the referrer's origin leaves the browser — its path and
 * query are not needed and may be personal.
 */
function landingReferrer(): string | undefined {
  const campaign = new URLSearchParams(window.location.search).get('utm_source');
  if (campaign) return campaign;
  try {
    return document.referrer ? new URL(document.referrer).origin : undefined;
  } catch {
    return undefined;
  }
}

/**
 * First-party, cookieless analytics: one beacon per page view (with the
 * previous page, for navigation flows) and one per meaningful click.
 * Nothing is stored in the browser for tracking — the previous path lives in
 * a ref and is gone on reload; only an opt-out is remembered (see optOut.ts).
 * The server hashes visitors per day; see /api/collect.
 */
export function Analytics() {
  const pathname = usePathname();
  const prevPath = useRef<string | undefined>(undefined);
  const isLanding = useRef(true);

  useEffect(() => {
    if (!pathname || !trackingAllowed()) return;
    send({
      t: 'pageview',
      p: pathname,
      v: prevPath.current,
      r: isLanding.current ? landingReferrer() : undefined,
    });
    prevPath.current = pathname;
    isLanding.current = false;
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!trackingAllowed()) return;
      const target = describeClickTarget(event.target);
      if (target) send({ t: 'click', p: window.location.pathname, e: target });
    };
    // Capture phase: counted even when a handler stops propagation.
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
