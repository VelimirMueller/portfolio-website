import Script from 'next/script';
import { Analytics } from './Analytics';

/**
 * Everything the site measures, in one place so the privacy policy (section 8)
 * has one component to match:
 * - Analytics: first-party, cookieless page views, navigation and clicks
 *   (replaces Vercel Web Analytics since v2.1.0).
 * - Vercel Speed Insights: loading-time metrics only, via the documented
 *   script tag (same-origin /_vercel/* endpoint). The npm package is avoided
 *   because its optional svelte/vite peer range conflicts with Storybook 8.
 *
 * Production only: dev and test builds send nothing.
 */
export function SiteAnalytics() {
  if (process.env.NODE_ENV !== 'production') return null;
  return (
    <>
      <Analytics />
      <Script src="/_vercel/speed-insights/script.js" strategy="afterInteractive" />
    </>
  );
}
