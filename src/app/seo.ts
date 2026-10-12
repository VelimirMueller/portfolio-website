import type { Metadata } from 'next';
import { SITE_URL } from '@/config/site';
import { SITE_NAME, getPositioning, siteTitle } from '@/config/positioning';

/**
 * Locale-aware default metadata and structured data for the [locale] tree.
 * Title and description come from the positioning config, so the job title
 * lives in one place. Pages override title/description; Open Graph and
 * Twitter fall back to these values.
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
      // Per-locale og:locale and alternates come with #76.
      locale: 'en',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
