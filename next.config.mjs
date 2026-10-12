import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Allowances map 1:1 to what the app uses: hCaptcha (contact form),
// Supabase (contact API), wasm-unsafe-eval (the cyberpunk wasm demos).
// Analytics needs no third-party host: page views go to the first-party
// /api/collect, and Vercel Speed Insights loads and reports through the
// same-origin /_vercel/speed-insights/* path (see SpeedInsights.tsx), so
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

// Framing is denied everywhere except the one page that needs it:
// /projects/mcp-demo embeds the standalone /demos/mcp-demo.html in an iframe,
// so the parent needs 'self' in frame-src and only the demo document gets
// 'self' in frame-ancestors (and X-Frame-Options SAMEORIGIN). Every other
// response sends frame-ancestors 'none' and X-Frame-Options DENY.
// One CSP per response: frame-ancestors is appended here, not sent as a
// second header (two CSPs would intersect).
const buildCsp = (frameAncestors) =>
  [...cspDirectives, `frame-ancestors ${frameAncestors}`].join('; ');

const MCP_DEMO_PATH = '/demos/mcp-demo.html';

const sharedHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
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

const securityHeaders = (frameAncestors, frameOptions) => [
  { key: 'Content-Security-Policy', value: buildCsp(frameAncestors) },
  { key: 'X-Frame-Options', value: frameOptions },
  ...sharedHeaders,
];

// The two sources are disjoint (the first excludes MCP_DEMO_PATH with a
// negative lookahead), so each response matches exactly one rule and carries
// exactly one CSP and one X-Frame-Options header. Next.js would otherwise
// apply every matching rule.
const headerRules = [
  {
    source: '/((?!demos/mcp-demo\\.html$).*)',
    headers: securityHeaders("'none'", 'DENY'),
  },
  {
    source: MCP_DEMO_PATH,
    headers: securityHeaders("'self'", 'SAMEORIGIN'),
  },
];

// Old arcade build URLs. The folder public/games/dist/ was removed (issue #80);
// old external links (posts, CV) go to the canonical arcade page instead of a 404.
// ':path*' also matches the bare folder path.
const ARCADE_PAGE = '/projects/cyberpunk-arcade/index.html';
const redirectRules = [
  { source: '/games/dist/:path*', destination: ARCADE_PAGE, permanent: true },
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
    return headerRules;
  },
  async redirects() {
    return redirectRules;
  },
};

export default withNextIntl(nextConfig);
