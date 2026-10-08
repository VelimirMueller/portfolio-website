import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Allowances map 1:1 to what the app uses: hCaptcha (contact form),
// Supabase (contact API), Vercel insights (analytics/vitals),
// wasm-unsafe-eval (the cyberpunk wasm demos). Images are same-origin only
// (the avatar is self-hosted in public/ so no third party sees visitor IPs).
// 'unsafe-inline' in script-src is a Next 14 constraint (inline runtime +
// theme bootstrap script, no nonce support without dynamic rendering).
// Framing is same-origin only: /projects/mcp-demo embeds the standalone
// /demos/mcp-demo.html in an iframe, so the parent needs 'self' in frame-src
// and the demo document needs 'self' in frame-ancestors. Cross-origin framing
// stays blocked, which is what actually prevents clickjacking.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://js.hcaptcha.com https://*.hcaptcha.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://*.hcaptcha.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.hcaptcha.com https://vitals.vercel-insights.com",
  "frame-src 'self' https://*.hcaptcha.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

// The admin Magic section shows card images from Scryfall's CDN. Only that
// subtree allows it, so public pages stay same-origin for images. Next applies
// the later of two matching headers with the same key.
const magicContentSecurityPolicy = contentSecurityPolicy.replace(
  "img-src 'self' data: blob:",
  "img-src 'self' data: blob: https://cards.scryfall.io"
);
if (!magicContentSecurityPolicy.includes('cards.scryfall.io')) {
  throw new Error('next.config: img-src changed; update the Magic CSP override');
}

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
      {
        source: '/admin/magic/:path*',
        headers: [{ key: 'Content-Security-Policy', value: magicContentSecurityPolicy }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
