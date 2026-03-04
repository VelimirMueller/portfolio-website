# SEO Overhaul + i18n Routing + hCaptcha — Design

**Date:** 2026-03-04
**Status:** Approved

## Problem

The site has near-zero SEO infrastructure. No sitemap, no robots.txt, no per-page metadata, no Open Graph tags, no structured data. All pages are `'use client'` with client-side-only i18n (localStorage toggle), so search engines see only the German server-rendered default — English content is invisible to crawlers. The contact form writes directly to Supabase from the browser with no spam protection.

## Goals

1. Make both DE and EN content crawlable via URL-based i18n routing
2. Add complete SEO metadata (per-page titles, descriptions, OG, Twitter, JSON-LD)
3. Generate sitemap.xml and robots.txt
4. Protect the contact form with hCaptcha via server-side verification

## Decisions

- **i18n library:** `next-intl` — mature App Router support, handles routing/middleware/metadata
- **Captcha:** hCaptcha (`@hcaptcha/react-hcaptcha`) — user-selected, privacy-focused
- **Approach:** URL-based routing with `[locale]` dynamic segment (`/de/...`, `/en/...`)
- **Default locale:** `de` (matches current server-rendered default)

---

## Section 1: i18n Routing Architecture

### Route Structure

```
src/app/
├── [locale]/
│   ├── layout.tsx              # Sets html lang, provides next-intl
│   ├── (main)/
│   │   ├── layout.tsx          # Navigation + Footer (unchanged)
│   │   ├── page.tsx            # Home
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── services/page.tsx
│   │   ├── services/[serviceId]/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── imprint/page.tsx
│   │   └── privacy/page.tsx
│   └── not-found.tsx
├── projects/                   # Demo pages stay outside [locale]
│   ├── dashboard-demo/
│   ├── project-planner/
│   └── supabase-admin/
├── api/contact/route.ts        # New: server-side form handler
├── sitemap.ts
├── robots.ts
└── layout.tsx                  # Root: fonts, theme only (no lang)
```

### Middleware (`src/middleware.ts`)

- Detects locale from: URL prefix → cookie → `Accept-Language` header → default `de`
- Redirects `/` to `/de` or `/en`
- Validates locale param; redirects unknown locales to default
- Sets a `NEXT_LOCALE` cookie for return visits

### Translation Integration

- Existing `src/locales/en.json` and `de.json` used directly by `next-intl`
- `LanguageProvider` replaced by `next-intl`'s `NextIntlClientProvider`
- `useLanguage()` hook calls replaced with `useTranslations()` from `next-intl`
- `useTranslationArray()` and `useTranslationObjectArray()` replaced with `next-intl` equivalents using `rich()` or raw message access
- `LanguageToggle` navigates to alternate locale URL via `next-intl`'s `useRouter`

### Link Updates

- `next-intl` provides a locale-aware `<Link>` component that auto-prefixes the current locale
- All internal `<Link href="/about">` become `<Link href="/about">` using the next-intl Link (auto-prefixed)
- `<Button to="/contact">` component updated to use the locale-aware Link internally

### What Gets Removed

- `LanguageProvider.tsx` — replaced by next-intl's provider
- Inline flash-prevention script for lang — no longer needed (server-rendered)
- `localStorage` language persistence — replaced by URL + cookie
- `suppressHydrationWarning` on `<html>` — no more server/client lang mismatch

---

## Section 2: Per-Page SEO Metadata

Each page exports `generateMetadata` returning locale-specific values:

```ts
// Example: about/page.tsx
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('metaTitle'),       // New keys added to locale files
    description: t('metaDesc'),
    alternates: {
      canonical: `https://velimir.dev/${locale}/about`,
      languages: { de: '/de/about', en: '/en/about' },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDesc'),
      url: `https://velimir.dev/${locale}/about`,
      siteName: 'Velimir Muller',
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      type: 'website',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaTitle'),
      description: t('metaDesc'),
      images: ['/og-image.png'],
    },
  };
}
```

### New Translation Keys (per page)

Each page namespace gets `metaTitle` and `metaDesc` keys in both locale files.

### OG Image

A single static `public/og-image.png` (1200x630) with name, title, and branding. Shared across all pages.

---

## Section 3: Sitemap + Robots

### `src/app/sitemap.ts`

Generates entries for all pages x both locales:

```ts
const pages = ['', '/about', '/contact', '/services', '/projects', ...serviceIds.map(s => `/services/${s}`)];
// For each page, emit { url: 'https://velimir.dev/de/...', alternates: { languages: { en: ... } } }
```

### `src/app/robots.ts`

```ts
export default function robots() {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: 'https://velimir.dev/sitemap.xml' };
}
```

---

## Section 4: Structured Data (JSON-LD)

### Root Layout — WebSite Schema

```json
{ "@type": "WebSite", "name": "Velimir Muller", "url": "https://velimir.dev" }
```

### Home Page — Person Schema

```json
{ "@type": "Person", "name": "Velimir Muller", "jobTitle": "Senior Product Engineer", "url": "https://velimir.dev" }
```

Injected via `<script type="application/ld+json">` in the respective layouts/pages.

---

## Section 5: hCaptcha on Contact Form

### Flow

1. User fills form, completes hCaptcha challenge
2. Client POSTs to `/api/contact` with form data + hCaptcha token
3. API route verifies token with hCaptcha's `/siteverify` endpoint
4. On success: validates inputs, writes to Supabase `contact_messages` table
5. Returns success/error response to client

### Changes

- **New:** `src/app/api/contact/route.ts` — POST handler with hCaptcha verification + Supabase insert
- **New:** `@hcaptcha/react-hcaptcha` package
- **Modified:** Contact page form — adds hCaptcha widget, submits to API route instead of direct Supabase

### Environment Variables

```
HCAPTCHA_SITE_KEY=...        # Client-side (NEXT_PUBLIC_)
HCAPTCHA_SECRET_KEY=...      # Server-side only
```

---

## Section 6: Experience Entry Update

- exp2 (DEMOS plan GmbH): title "Software Engineer - Frontend" → "Software Engineer - Frontend / Product"
- This creates a visible career evolution arc with exp1 (GALVANY): "Software Engineer - Frontend / Product" → "Senior Software Engineer - Frontend / Product"
- Both DE and EN locale files updated

---

## Out of Scope

- Email notifications via Resend (already installed, can be wired up separately)
- Analytics (Vercel Analytics, Google Analytics)
- Performance optimization beyond what next-intl provides
- Converting demo pages to i18n
