import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Allowances map 1:1 to what the app uses: hCaptcha (contact form),
// Supabase (contact API), Vercel insights (analytics/vitals), dicebear
// (demo avatars), wasm-unsafe-eval (the cyberpunk wasm demos).
// 'unsafe-inline' in script-src is a Next 14 constraint (inline runtime +
// theme bootstrap script, no nonce support without dynamic rendering).
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://js.hcaptcha.com https://*.hcaptcha.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://*.hcaptcha.com",
  "img-src 'self' data: blob: https://api.dicebear.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.hcaptcha.com https://vitals.vercel-insights.com",
  "frame-src https://*.hcaptcha.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
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
