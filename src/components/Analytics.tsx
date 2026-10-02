'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { describeClickTarget } from '@/utils/analytics/describeClickTarget';

const ENDPOINT = '/api/collect';

type Beacon = { t: 'pageview' | 'click'; p: string; v?: string; r?: string; e?: string };

/** Do Not Track / Global Privacy Control: send nothing at all. */
export function trackingAllowed(nav: Navigator = navigator): boolean {
  const n = nav as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack !== '1' && n.globalPrivacyControl !== true;
}

function send(beacon: Beacon) {
  const body = JSON.stringify(beacon);
  // sendBeacon survives page unloads (a click on an outbound link); text/plain
  // keeps it a "simple" request.
  if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return;
  fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {});
}

/** Where the visitor came from: an explicit campaign tag beats the browser referrer. */
function landingReferrer(): string | undefined {
  const campaign = new URLSearchParams(window.location.search).get('utm_source') ?? undefined;
  return campaign || document.referrer || undefined;
}

/**
 * First-party, cookieless analytics: one beacon per page view (with the
 * previous page, for navigation flows) and one per meaningful click.
 * Nothing is stored in the browser — the previous path lives in a ref and is
 * gone on reload. The server hashes visitors per day; see /api/collect.
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
    if (!trackingAllowed()) return;
    const onClick = (event: MouseEvent) => {
      const target = describeClickTarget(event.target);
      if (target) send({ t: 'click', p: window.location.pathname, e: target });
    };
    // Capture phase: counted even when a handler stops propagation.
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
