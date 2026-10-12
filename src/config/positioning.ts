import { routing } from '@/i18n/routing';

/**
 * Single source of truth for the public job title and the short positioning
 * line. Page titles, metadata (Open Graph, Twitter), JSON-LD, the about bio
 * and the footer all read from here, in both locales. Change the title here
 * only — the unit tests fail if a surface hard-codes it again.
 *
 * Copy in the locale catalogs refers to the title with the `{jobTitle}`
 * placeholder; call sites pass `jobTitle` from getPositioning().
 */

export type Locale = (typeof routing.locales)[number];

export type Positioning = {
  /** Public job title, e.g. in <title>, JSON-LD jobTitle and the footer. */
  jobTitle: string;
  /** One-sentence positioning used as the default meta description. */
  description: string;
  /** Alt text of the shared Open Graph / Twitter image. */
  ogImageAlt: string;
};

export const SITE_NAME = 'Velimir Müller';

// The English title is used in German too, on purpose (the live copy does
// so). For a German title, set de.jobTitle to its own string.
const JOB_TITLE = 'Senior Product Engineer';

export const POSITIONING: Record<Locale, Positioning> = {
  de: {
    jobTitle: JOB_TITLE,
    description: `${JOB_TITLE} — End-to-End-Produktverantwortung, MCP-Server-Entwicklung und Full-Stack-Engineering mit Next.js, React und Claude Code.`,
    // The image text is English; both alts quote its tagline verbatim.
    ogImageAlt: `${SITE_NAME}, ${JOB_TITLE}. Darunter der Leitsatz „Models propose. Rules gate. I decide.“`,
  },
  en: {
    jobTitle: JOB_TITLE,
    description: `${JOB_TITLE} — end-to-end product ownership, MCP server development, and full-stack engineering with Next.js, React, and Claude Code.`,
    ogImageAlt: `${SITE_NAME}, ${JOB_TITLE}. Models propose. Rules gate. I decide.`,
  },
};

function isLocale(locale: string): locale is Locale {
  return (routing.locales as readonly string[]).includes(locale);
}

/** The locale itself when supported, otherwise the default locale. */
export function resolveLocale(locale: string): Locale {
  return isLocale(locale) ? locale : routing.defaultLocale;
}

/** Positioning for a locale; unknown locales fall back to the default one. */
export function getPositioning(locale: string): Positioning {
  return POSITIONING[resolveLocale(locale)];
}

/** "<name> | <job title>", the site-wide document title. */
export function siteTitle(locale: string): string {
  return `${SITE_NAME} | ${getPositioning(locale).jobTitle}`;
}
