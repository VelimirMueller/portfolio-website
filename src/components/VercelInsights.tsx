import Script from 'next/script';

/**
 * Vercel Web Analytics + Speed Insights via the documented script-tag
 * pattern (same-origin /_vercel/* endpoints, auto route tracking).
 *
 * Deliberately not the npm packages: their optional svelte/vite peer range
 * conflicts with Storybook 8's vite 5/6 pin — script tags carry the same
 * telemetry with zero dependency surface. The endpoints only exist on
 * Vercel deployments; in production builds served elsewhere the scripts
 * 404 harmlessly, and in dev they are skipped entirely.
 */
export function VercelInsights() {
  if (process.env.NODE_ENV !== 'production') return null;
  return (
    <>
      <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      <Script
        src="/_vercel/speed-insights/script.js"
        strategy="afterInteractive"
      />
    </>
  );
}
