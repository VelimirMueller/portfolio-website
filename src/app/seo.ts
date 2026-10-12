import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { SITE_URL, localeUrl } from '@/config/site';
import {
  type Locale,
  SITE_NAME,
  getPositioning,
  resolveLocale,
  siteTitle,
} from '@/config/positioning';

/** Open Graph locale tag (language_TERRITORY) per site locale. */
export const OG_LOCALES: Record<Locale, string> = {
  de: 'de_DE',
  en: 'en_US',
};

/** The shared preview image in public/, 1200x630. */
export const OG_IMAGE_PATH = '/og-image.jpg';

/** og:locale and og:locale:alternate for a locale. */
export function ogLocales(locale: string) {
  const current = resolveLocale(locale);
  return {
    locale: OG_LOCALES[current],
    alternateLocale: routing.locales
      .filter((other) => other !== current)
      .map((other) => OG_LOCALES[other]),
  };
}

/** The shared Open Graph / Twitter image with the alt text of a locale. */
export function ogImage(locale: string) {
  return {
    url: OG_IMAGE_PATH,
    width: 1200,
    height: 630,
    type: 'image/jpeg',
    alt: getPositioning(locale).ogImageAlt,
  };
}

/**
 * hreflang alternates for a path ('' for the home page): one URL per locale
 * plus x-default on the default locale. The sitemap uses the same map.
 */
export function languageAlternates(path: string = ''): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = localeUrl(locale, path);
  }
  languages['x-default'] = localeUrl(routing.defaultLocale, path);
  return languages;
}

type PageMetadataInput = {
  locale: string;
  /** Path after the locale prefix, e.g. '/about'; '' for the home page. */
  path: string;
  title: string;
  description: string;
};

/**
 * Metadata for one page of the [locale] tree: title and description, the
 * canonical URL and hreflang alternates, and Open Graph and Twitter data in
 * the page's own language. Next.js does not deep-merge openGraph or
 * twitter, so every page sets the full objects here.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: PageMetadataInput): Metadata {
  const url = localeUrl(resolveLocale(locale), path);
  const image = ogImage(locale);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: SITE_NAME,
      ...ogLocales(locale),
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

/**
 * Locale-aware default metadata and structured data for the [locale] tree.
 * Title and description come from the positioning config, so the job title
 * lives in one place. Pages replace these values with pageMetadata().
 */
export function rootMetadata(locale: string): Metadata {
  const { jobTitle, description } = getPositioning(locale);
  const title = siteTitle(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: [
      jobTitle,
      'AI Agentic Developer',
      'MCP Server Developer',
      'Model Context Protocol',
      'Claude Code',
      'Product Owner',
      'Full-stack Developer',
      'Next.js Developer',
      'Agentic AI',
      'React',
      'TypeScript',
    ],
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: SITE_NAME,
      ...ogLocales(locale),
      images: [ogImage(locale)],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage(locale)],
    },
  };
}

/** Person + WebSite JSON-LD for the main layout. */
export function siteJsonLd(locale: string) {
  const { jobTitle, description } = getPositioning(locale);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: SITE_NAME,
      jobTitle,
      description,
      url: SITE_URL,
      sameAs: [
        'https://www.linkedin.com/in/velimir-müller-07b460175',
        'https://github.com/VelimirMueller',
      ],
      knowsAbout: [
        'React',
        'TypeScript',
        'Next.js',
        'Laravel',
        'Supabase',
        'AWS',
        'ML',
        'Agentic AI',
        'Model Context Protocol',
        'MCP Server Development',
        'Claude Code',
        'Product Management',
        'AI-Powered Development Tools',
        'Vercel',
        'Full-Stack Development',
      ],
      hasOccupation: {
        '@type': 'Occupation',
        name: jobTitle,
        occupationLocation: { '@type': 'Country', name: 'Germany' },
        skills:
          'Full-Stack Development, Next.js, React, TypeScript, AI Agentic Development, MCP Server Development, Product Ownership, Claude Code',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description,
      inLanguage: ['de', 'en'],
    },
  ];
}
