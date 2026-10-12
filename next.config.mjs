import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Allowances map 1:1 to what the app uses: hCaptcha (contact form),
// Supabase (contact API), wasm-unsafe-eval (the cyberpunk wasm demos).
// Analytics needs no third-party host: page views go to the first-party
// /api/collect, and Vercel Speed Insights loads and reports through the
// same-origin /_vercel/speed-insights/* path (see SiteAnalytics.tsx), so
// 'self' covers both. Images are same-origin only (the avatar is self-hosted
// in public/ so no third party sees visitor IPs).
// 'unsafe-inline' in script-src is a Next.js constraint (inline runtime +
// theme bootstrap script, no nonce support without dynamic rendering).
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://js.hcaptcha.com https://*.hcaptcha.com",
  "style-src 'self' 'unsafe-inline' https://*.hcaptcha.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.hcaptcha.com",
  "frame-src 'self' https://*.hcaptcha.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

// Framing is same-origin only: /projects/mcp-demo embeds the standalone
// /demos/mcp-demo.html in an iframe, so the parent needs 'self' in frame-src
// and the demo document needs 'self' in frame-ancestors. Cross-origin framing
// stays blocked, which is what actually prevents clickjacking.
// One CSP per response: frame-ancestors is appended here, not sent as a
// second header (two CSPs would intersect).
const buildCsp = (frameAncestors) =>
  [...cspDirectives, `frame-ancestors ${frameAncestors}`].join('; ');

const contentSecurityPolicy = buildCsp("'self'");

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
