'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { trackingAllowed } from './Analytics';
import { OPT_OUT_EVENT } from '@/utils/analytics/optOut';

export const SPEED_INSIGHTS_SRC = '/_vercel/speed-insights/script.js';

type SpeedInsightsWindow = Window & { si?: (...params: unknown[]) => void; siq?: unknown[][] };

/**
 * Registers a beforeSend hook with the Speed Insights script (the documented
 * `window.si` queue, as @vercel/speed-insights does). Called before the
 * script tag renders; the script reads the queue when it loads, so the hook
 * is in place before the first metric.
 * It drops every metric once the visitor objects at runtime — a loaded
 * script cannot be unloaded, but it then sends nothing.
 */
let beforeSendRegistered = false;

function registerBeforeSend() {
  if (beforeSendRegistered) return;
  beforeSendRegistered = true;
  const w = window as SpeedInsightsWindow;
  if (!w.si) {
    w.si = (...params: unknown[]) => {
      (w.siq = w.siq || []).push(params);
    };
  }
  w.si('beforeSend', (event: unknown) => (trackingAllowed() ? event : null));
}

/**
 * Vercel Speed Insights, loaded only when the visitor allows statistics:
 * the privacy switch (section 8), Do Not Track and Global Privacy Control
 * all stop it, the same gate as the first-party beacon (trackingAllowed).
 *
 * Nothing renders on the server: the opt-out lives in localStorage. The
 * switch fires OPT_OUT_EVENT (and `storage` in other tabs), so allowing
 * statistics again loads the script without a reload.
 */
export function SpeedInsights() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const check = () => {
      if (!trackingAllowed()) return;
      registerBeforeSend();
      setLoad(true);
    };
    check();
    window.addEventListener(OPT_OUT_EVENT, check);
    window.addEventListener('storage', check);
    return () => {
      window.removeEventListener(OPT_OUT_EVENT, check);
      window.removeEventListener('storage', check);
    };
  }, []);

  if (!load) return null;
  return <Script src={SPEED_INSIGHTS_SRC} strategy="afterInteractive" />;
}
