# SEO Overhaul + i18n Routing + hCaptcha — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add URL-based i18n routing (`/de/...`, `/en/...`), full SEO metadata, sitemap, robots.txt, JSON-LD structured data, and hCaptcha on the contact form.

**Architecture:** Replace client-side `LanguageProvider` with `next-intl` for server-rendered i18n via `[locale]` dynamic route segment. Each page gets `generateMetadata` for locale-specific SEO. Contact form submits through an API route with server-side hCaptcha verification.

**Tech Stack:** next-intl, @hcaptcha/react-hcaptcha, Next.js App Router metadata API

---

## Task 1: Install Dependencies and Configure next-intl

**Files:**
- Modify: `package.json`
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `src/middleware.ts`
- Modify: `next.config.mjs`

**Step 1: Install packages**

Run:
```bash
npm install next-intl @hcaptcha/react-hcaptcha
```

**Step 2: Create routing config**

Create `src/i18n/routing.ts`:
```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
});
```

**Step 3: Create request config**

Create `src/i18n/request.ts`:
```ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'de' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/locales/${locale}.json`)).default,
  };
});
```

**Step 4: Create middleware**

Create `src/middleware.ts`:
```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except API routes, _next, static files, and demo project pages
    '/((?!api|_next|.*\\..*|projects/dashboard-demo|projects/project-planner|projects/supabase-admin).*)',
  ],
};
```

**Step 5: Update next.config.mjs**

Replace contents with:
```js
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
};

export default withNextIntl(nextConfig);
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: install next-intl and hcaptcha, configure i18n routing and middleware"
```

---

## Task 2: Create [locale] Layout and Update Root Layout

**Files:**
- Create: `src/app/[locale]/layout.tsx`
- Modify: `src/app/layout.tsx`
- Move: `src/app/(main)/` -> `src/app/[locale]/(main)/`

**Step 1: Move the (main) route group under [locale]**

```bash
mkdir -p src/app/\[locale\]
mv src/app/\(main\) src/app/\[locale\]/\(main\)
```

**Step 2: Create the [locale] layout**

Create `src/app/[locale]/layout.tsx`:
```tsx
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'de' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`@/locales/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

**Step 3: Update root layout**

Modify `src/app/layout.tsx`:
- Remove `LanguageProvider` import and wrapper
- Remove `lang="de"` from `<html>` (next-intl handles this)
- Remove the language flash-prevention inline script
- Keep only the theme flash-prevention script
- Remove the old static `metadata` export (per-page metadata replaces it)
- Add `metadataBase`

Updated root layout:
```tsx
import type { Metadata, Viewport } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
  preload: false,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://velimir-mueller.vercel.app'
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`dark ${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-light-bg dark:bg-dark-bg`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add [locale] layout, move pages under locale segment, update root layout"
```

---

## Task 3: Create Locale-Aware Navigation Utilities

**Files:**
- Create: `src/i18n/navigation.ts`

**Step 1: Create navigation helpers**

Create `src/i18n/navigation.ts`:
```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

This provides locale-aware versions of `Link`, `usePathname`, `useRouter`, and `redirect`. The `Link` component auto-prefixes the current locale to href values.

**Step 2: Commit**

```bash
git add src/i18n/navigation.ts
git commit -m "feat: add locale-aware navigation utilities from next-intl"
```

---

## Task 4: Update Shared Components

**Files:**
- Modify: `src/components/atoms/LanguageToggle.tsx`
- Modify: `src/components/atoms/Button.tsx`
- Modify: `src/components/organisms/Navigation.tsx`
- Modify: `src/components/organisms/Footer.tsx`

**Step 1: Update LanguageToggle**

Replace the localStorage toggle with locale-switching navigation:

```tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export const LanguageToggle = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === 'de' ? 'en' : 'de';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={switchLocale}
      className="w-9 h-9 flex items-center justify-center rounded-full text-light-sub dark:text-dark-sub hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-mono text-xs font-bold tracking-tight"
      aria-label={locale === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
    >
      {locale === 'de' ? 'EN' : 'DE'}
    </button>
  );
};
```

**Step 2: Update Button component**

In `src/components/atoms/Button.tsx`, change:
```ts
import Link from 'next/link';
```
to:
```ts
import { Link } from '@/i18n/navigation';
```

Everything else stays the same — the locale-aware `Link` has the same API.

**Step 3: Update Navigation**

In `src/components/organisms/Navigation.tsx`:

1. Replace imports:
   - `import Link from 'next/link'` -> `import { Link, usePathname } from '@/i18n/navigation'`
   - Remove `import { usePathname } from 'next/navigation'`
   - `import { useLanguage } from '@/components/language/LanguageProvider'` -> `import { useTranslations } from 'next-intl'`

2. Replace translation usage:
   - `const { t } = useLanguage()` -> `const t = useTranslations('nav')`
   - All `t('nav.xxx')` calls become `t('xxx')` (namespace is scoped)

3. `usePathname()` from `@/i18n/navigation` already strips the locale prefix, so `isActive(path)` comparisons work unchanged.

**Step 4: Update Footer**

In `src/components/organisms/Footer.tsx`:

1. Replace imports:
   - `import Link from 'next/link'` -> `import { Link } from '@/i18n/navigation'`
   - `import { useLanguage } from '@/components/language/LanguageProvider'` -> `import { useTranslations } from 'next-intl'`

2. Replace translation usage:
   - `const { t } = useLanguage()` -> `const t = useTranslations('footer')`
   - All `t('footer.xxx')` calls become `t('xxx')`

**Step 5: Commit**

```bash
git add src/components/atoms/LanguageToggle.tsx src/components/atoms/Button.tsx src/components/organisms/Navigation.tsx src/components/organisms/Footer.tsx
git commit -m "feat: update shared components to use next-intl and locale-aware navigation"
```

---

## Task 5: Update All Pages to Use next-intl

**Files:**
- Modify: all `page.tsx` files under `src/app/[locale]/(main)/`

**Translation migration pattern for every page:**

1. `import { useLanguage } from '@/components/language/LanguageProvider'` -> `import { useTranslations } from 'next-intl'`
2. `const { t } = useLanguage()` -> `const t = useTranslations('namespace')`
3. `t('namespace.key')` -> `t('key')` (namespace scoped by `useTranslations`)
4. `import Link from 'next/link'` -> `import { Link } from '@/i18n/navigation'`

**For array translations** (services, projects, privacy):

Replace `useTranslationArray(key)` / `useTranslationObjectArray(key)` with `t.raw()`:
```tsx
const t = useTranslations('services');
const valueItems = t.raw('valueItems') as string[];
```

For object arrays:
```tsx
const t = useTranslations('serviceDetail');
const process = t.raw(`${serviceId}.process`) as { title: string; desc: string }[];
```

**Step 1: Update home page** (`src/app/[locale]/(main)/page.tsx`)
- `const t = useTranslations('home')`
- `import { Link } from '@/i18n/navigation'`

**Step 2: Update about page** (`src/app/[locale]/(main)/about/page.tsx`)
- `const t = useTranslations('about')`
- Experience entries: `t.raw('exp1') as { title: string; tag: string; ... }`

**Step 3: Update services page** (`src/app/[locale]/(main)/services/page.tsx`)
- `const t = useTranslations('services')`
- `const valueItems = t.raw('valueItems') as string[]`
- `import { Link } from '@/i18n/navigation'`

**Step 4: Update service detail**

For `src/app/[locale]/(main)/services/[serviceId]/page.tsx`:
- Update `generateStaticParams` to include locales:
```tsx
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    validServiceIds.map((serviceId) => ({ locale, serviceId }))
  );
}
```

For `ServiceDetailContent.tsx`:
- `const t = useTranslations('serviceDetail')`
- Use `t.raw(serviceId)` for nested service data

**Step 5: Update projects page** (`src/app/[locale]/(main)/projects/page.tsx`)
- `const t = useTranslations('projects')`
- Links to demo pages (`/projects/dashboard-demo` etc.) use regular `next/link` since those are outside `[locale]`

**Step 6: Update contact page** (`src/app/[locale]/(main)/contact/page.tsx`)
- `const t = useTranslations('contact')`
- Keep Supabase submission for now (hCaptcha added in Task 9)

**Step 7: Update imprint page** (`src/app/[locale]/(main)/imprint/page.tsx`)
- `const t = useTranslations('imprint')`

**Step 8: Update privacy page** (`src/app/[locale]/(main)/privacy/page.tsx`)
- `const t = useTranslations('privacy')`
- `t.raw('s3Data') as string[]` for array sections

**Step 9: Verify build**

```bash
npm run build
```

Fix any type errors or missing translations.

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: migrate all pages to next-intl translations and locale-aware routing"
```

---

## Task 6: Add Per-Page SEO Metadata

**Files:**
- Modify: `src/locales/en.json` and `src/locales/de.json` — add `metaTitle`/`metaDesc` keys
- Modify: each page.tsx — split into server wrapper + client content, add `generateMetadata`

**Step 1: Add meta keys to locale files**

EN (`src/locales/en.json`) — add to each namespace:
```json
"home": { "metaTitle": "Velimir Muller | Senior Product Engineer", "metaDesc": "Senior Product Engineer shipping end-to-end — from Figma to AWS. React, TypeScript, Laravel, Supabase, Terraform." },
"about": { "metaTitle": "About — Velimir Muller", "metaDesc": "9+ years from frontend specialist to full-stack product engineer. React, Vue, TypeScript, Laravel, AWS, Azure." },
"services": { "metaTitle": "Services — Velimir Muller", "metaDesc": "Requirements engineering, UX/UI design, frontend development, project delivery, and modern stack consulting." },
"projects": { "metaTitle": "Projects — Velimir Muller", "metaDesc": "Selected projects: interactive dashboards, project planners, and admin tools built with React, Next.js, and Supabase." },
"contact": { "metaTitle": "Contact — Velimir Muller", "metaDesc": "Get in touch for collaboration, consulting, or project inquiries." },
"imprint": { "metaTitle": "Imprint — Velimir Muller", "metaDesc": "Legal notice and imprint information." },
"privacy": { "metaTitle": "Privacy Policy — Velimir Muller", "metaDesc": "Privacy policy and data protection information." }
```

DE (`src/locales/de.json`) — same structure, German text:
```json
"home": { "metaTitle": "Velimir Müller | Senior Product Engineer", "metaDesc": "Senior Product Engineer — von Figma bis AWS. React, TypeScript, Laravel, Supabase, Terraform." },
"about": { "metaTitle": "Über mich — Velimir Müller", "metaDesc": "9+ Jahre vom Frontend-Spezialisten zum Full-Stack Product Engineer. React, Vue, TypeScript, Laravel, AWS, Azure." },
"services": { "metaTitle": "Leistungen — Velimir Müller", "metaDesc": "Requirements Engineering, UX/UI-Design, Frontend-Entwicklung, Projektlieferung und Modern-Stack-Beratung." },
"projects": { "metaTitle": "Projekte — Velimir Müller", "metaDesc": "Ausgewählte Projekte: interaktive Dashboards, Projektplaner und Admin-Tools mit React, Next.js und Supabase." },
"contact": { "metaTitle": "Kontakt — Velimir Müller", "metaDesc": "Kontaktieren Sie mich für Zusammenarbeit, Beratung oder Projektanfragen." },
"imprint": { "metaTitle": "Impressum — Velimir Müller", "metaDesc": "Impressum und rechtliche Informationen." },
"privacy": { "metaTitle": "Datenschutz — Velimir Müller", "metaDesc": "Datenschutzerklärung und Informationen zum Datenschutz." }
```

**Step 2: Split pages into server wrapper + client content**

All pages are currently `'use client'`. Since `generateMetadata` must be exported from a server component, split each page:

```
page.tsx         -> Server component: exports generateMetadata, renders <XxxContent />
XxxContent.tsx   -> Client component: 'use client', all UI and hooks (renamed from page.tsx)
```

**Server wrapper pattern** (example for home page):

`src/app/[locale]/(main)/page.tsx`:
```tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import HomeContent from './HomeContent';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    alternates: {
      canonical: `/${locale}`,
      languages: { de: '/de', en: '/en' },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDesc'),
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      type: 'website',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: t('metaTitle'),
      description: t('metaDesc'),
      images: ['/og-image.png'],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}
```

Apply this pattern to all 7 main pages (home, about, services, projects, contact, imprint, privacy).

For service detail, the server/client split already exists — just add `generateMetadata`:
```tsx
export async function generateMetadata({ params }: Props) {
  const { locale, serviceId } = await params;
  const t = await getTranslations({ locale, namespace: 'serviceDetail' });
  const service = t.raw(serviceId) as { title: string; subtitle: string };
  return {
    title: `${service.title} — Velimir Muller`,
    description: service.subtitle,
    alternates: {
      canonical: `/${locale}/services/${serviceId}`,
      languages: { de: `/de/services/${serviceId}`, en: `/en/services/${serviceId}` },
    },
    openGraph: {
      title: service.title,
      description: service.subtitle,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      type: 'website',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: service.title,
      description: service.subtitle,
      images: ['/og-image.png'],
    },
  };
}
```

**Step 3: Create placeholder OG image**

Note: User should provide a designed `public/og-image.png` (1200x630). For now, leave a TODO or use a simple placeholder.

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add per-page SEO metadata with generateMetadata and server/client page split"
```

---

## Task 7: Sitemap + Robots

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Step 1: Create sitemap**

Create `src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from 'next';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://velimir-mueller.vercel.app';

const serviceIds = [
  'requirements-engineering',
  'ux-ui-branding',
  'frontend-development',
  'project-delivery',
  'modern-stack',
];

const pages = [
  '',
  '/about',
  '/services',
  '/projects',
  '/contact',
  ...serviceIds.map((id) => `/services/${id}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['de', 'en'];

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
        ),
      },
    }))
  );
}
```

**Step 2: Create robots**

Create `src/app/robots.ts`:
```ts
import type { MetadataRoute } from 'next';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://velimir-mueller.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/projects/dashboard-demo',
        '/projects/project-planner',
        '/projects/supabase-admin',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

**Step 3: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add sitemap.xml and robots.txt generation"
```

---

## Task 8: JSON-LD Structured Data

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/[locale]/(main)/page.tsx`

**Step 1: Add WebSite schema to locale layout**

In `src/app/[locale]/layout.tsx`, add inside the return:

```tsx
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://velimir-mueller.vercel.app';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Velimir Muller',
  url: BASE_URL,
  inLanguage: locale === 'de' ? 'de-DE' : 'en-US',
};

return (
  <NextIntlClientProvider locale={locale} messages={messages}>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    {children}
  </NextIntlClientProvider>
);
```

Note: The JSON-LD content is a static object we construct from trusted data (not user input), so `dangerouslySetInnerHTML` is safe here. This is the standard Next.js pattern for structured data.

**Step 2: Add Person schema to home page**

In `src/app/[locale]/(main)/page.tsx`, add to the server component:

```tsx
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Velimir Muller',
  jobTitle: 'Senior Product Engineer',
  url: BASE_URL,
  sameAs: [
    'https://www.linkedin.com/in/velimir-m%C3%BCller-07b460175',
    'https://github.com/VelimirMueller',
  ],
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <HomeContent />
    </>
  );
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add JSON-LD structured data (WebSite + Person schemas)"
```

---

## Task 9: hCaptcha on Contact Form

**Files:**
- Create: `src/app/api/contact/route.ts`
- Modify: `src/app/[locale]/(main)/contact/ContactContent.tsx`
- Modify: `.env.example`

**Step 1: Add env vars to .env.example**

Add:
```
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET_KEY=
```

**Step 2: Create API route**

Create `src/app/api/contact/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, message, captchaToken } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'All fields are required.' },
      { status: 400 }
    );
  }

  if (!captchaToken) {
    return NextResponse.json(
      { error: 'Captcha verification required.' },
      { status: 400 }
    );
  }

  // Verify hCaptcha token
  const verifyResponse = await fetch('https://api.hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.HCAPTCHA_SECRET_KEY!,
      response: captchaToken,
    }),
  });

  const verifyData = await verifyResponse.json();

  if (!verifyData.success) {
    return NextResponse.json(
      { error: 'Captcha verification failed.' },
      { status: 400 }
    );
  }

  // Write to Supabase
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('contact_messages')
    .insert([{ name, email, message }]);

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json(
      { error: 'Failed to send message.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
```

**Step 3: Update contact form client component**

In `ContactContent.tsx`:

1. Add imports:
```tsx
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRef } from 'react';
```

2. Add captcha state and ref:
```tsx
const [captchaToken, setCaptchaToken] = useState<string | null>(null);
const captchaRef = useRef<HCaptcha>(null);
```

3. Add hCaptcha widget before submit button:
```tsx
<div className="flex justify-center">
  <HCaptcha
    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
    onVerify={(token) => setCaptchaToken(token)}
    onExpire={() => setCaptchaToken(null)}
    ref={captchaRef}
    theme="dark"
  />
</div>
```

4. Replace Supabase direct insert with API call:
```tsx
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!captchaToken) return;
  setIsSubmitting(true);
  setSubmitStatus(null);

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, captchaToken }),
    });

    if (!res.ok) throw new Error('Failed');

    setSubmitStatus('success');
    setFormData({ name: '', email: '', message: '' });
    setCaptchaToken(null);
    captchaRef.current?.resetCaptcha();
  } catch {
    setSubmitStatus('error');
  } finally {
    setIsSubmitting(false);
  }
};
```

5. Disable submit when no captcha:
```tsx
<Button type="submit" variant="primary" disabled={isSubmitting || !captchaToken}>
```

6. Remove the direct Supabase browser client import from this component.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add hCaptcha verification to contact form via server-side API route"
```

---

## Task 10: Update Experience Entry Titles

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/de.json`

**Step 1: Update exp2 title in both locale files**

In both `en.json` and `de.json`, change `about.exp2.title`:

From: `"Software Engineer - Frontend"`
To: `"Software Engineer - Frontend / Product"`

This creates the career evolution:
- exp2 (DEMOS plan): Software Engineer - Frontend / Product
- exp1 (GALVANY): Senior Software Engineer - Frontend / Product

**Step 2: Commit**

```bash
git add src/locales/en.json src/locales/de.json
git commit -m "content: update DEMOS plan title to show Frontend/Product evolution"
```

---

## Task 11: Cleanup Old LanguageProvider

**Files:**
- Delete: `src/components/language/LanguageProvider.tsx`

**Step 1: Verify no remaining references**

```bash
grep -r "useLanguage\|LanguageProvider\|useTranslationArray\|useTranslationObjectArray" src/ --include="*.tsx" --include="*.ts"
```

Fix any remaining references.

**Step 2: Delete old provider**

```bash
rm src/components/language/LanguageProvider.tsx
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old LanguageProvider, replaced by next-intl"
```

---

## Task 12: Update Tests and VRT Snapshots

**Files:**
- Modify: test files referencing `LanguageProvider` or `useLanguage`
- Modify: `.storybook/preview.ts` — add next-intl decorator
- Modify: `e2e/app.spec.ts` — update URLs with locale prefix
- Regenerate: VRT snapshots

**Step 1: Add next-intl Storybook decorator**

In `.storybook/preview.ts`, add:
```ts
import { NextIntlClientProvider } from 'next-intl';
import messages from '../src/locales/en.json';

const withNextIntl = (Story) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <Story />
  </NextIntlClientProvider>
);

export const decorators = [withNextIntl];
```

**Step 2: Update unit test wrappers**

Replace any `LanguageProvider` mocks with:
```tsx
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/locales/en.json';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);
```

**Step 3: Update E2E test URLs**

In `e2e/app.spec.ts`, prefix routes with locale:
- `page.goto('/')` -> `page.goto('/de')` (middleware redirects, but explicit is safer)

**Step 4: Regenerate VRT snapshots**

```bash
npm run build-storybook
npm run test:visual -- --update-snapshots
```

**Step 5: Run all tests**

```bash
npm test
npm run test:visual
npm run test:e2e
```

**Step 6: Commit**

```bash
git add -A
git commit -m "test: update tests, Storybook, and VRT snapshots for next-intl migration"
```

---

## Task 13: Vercel Environment Variables (Manual)

Add in Vercel dashboard:
- `NEXT_PUBLIC_SITE_URL` — production URL
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` — from hCaptcha dashboard
- `HCAPTCHA_SECRET_KEY` — from hCaptcha dashboard

---

## Summary of Commits

1. `feat: install next-intl and hcaptcha, configure i18n routing and middleware`
2. `feat: add [locale] layout, move pages under locale segment, update root layout`
3. `feat: add locale-aware navigation utilities from next-intl`
4. `feat: update shared components to use next-intl and locale-aware navigation`
5. `feat: migrate all pages to next-intl translations and locale-aware routing`
6. `feat: add per-page SEO metadata with generateMetadata and server/client page split`
7. `feat: add sitemap.xml and robots.txt generation`
8. `feat: add JSON-LD structured data (WebSite + Person schemas)`
9. `feat: add hCaptcha verification to contact form via server-side API route`
10. `content: update DEMOS plan title to show Frontend/Product evolution`
11. `chore: remove old LanguageProvider, replaced by next-intl`
12. `test: update tests, Storybook, and VRT snapshots for next-intl migration`
