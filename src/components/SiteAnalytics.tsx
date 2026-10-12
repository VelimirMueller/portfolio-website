import { Analytics } from './Analytics';
import { SpeedInsights } from './SpeedInsights';

/**
 * Everything the site measures, in one place so the privacy policy (section 8)
 * has one component to match:
 * - Analytics: first-party, cookieless page views, navigation and clicks
 *   (replaces Vercel Web Analytics since v2.1.0).
 * - Vercel Speed Insights: loading-time metrics only, via the documented
 *   script tag (same-origin /_vercel/* endpoint). The npm package is avoided
 *   because its optional svelte/vite peer range conflicts with Storybook 8.
 *
 * Both share one gate (trackingAllowed): the privacy switch, Do Not Track and
 * Global Privacy Control stop all of it.
 *
 * Production only: dev and test builds send nothing.
 */
export function SiteAnalytics() {
  if (process.env.NODE_ENV !== 'production') return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
