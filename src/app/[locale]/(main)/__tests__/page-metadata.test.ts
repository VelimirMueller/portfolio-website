/**
 * Page metadata reads the job title from the positioning config. The
 * catalogs hold only the `{jobTitle}` placeholder. Every page sets Open
 * Graph and Twitter data in its own language (#76).
 */
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { localeUrl } from '@/config/site';
import { POSITIONING, siteTitle } from '@/config/positioning';
import { OG_IMAGE_PATH, OG_LOCALES } from '@/app/seo';
import { generateMetadata as homeMetadata } from '../page';
import { generateMetadata as aboutMetadata } from '../about/page';
import { generateMetadata as contactMetadata } from '../contact/page';
import { generateMetadata as imprintMetadata } from '../imprint/page';
import { generateMetadata as privacyMetadata } from '../privacy/page';
import { generateMetadata as projectsMetadata } from '../projects/page';
import { generateMetadata as servicesMetadata } from '../services/page';
import { generateMetadata as serviceDetailMetadata } from '../services/[serviceId]/page';

jest.mock('next-intl/server', () => ({
  setRequestLocale: jest.fn(),
  getTranslations: async ({
    locale,
    namespace,
  }: {
    locale: string;
    namespace: string;
  }) => {
    const messages = jest.requireActual(`@/locales/${locale}.json`);
    return (key: string, values: Record<string, string> = {}) =>
      (
        key
          .split('.')
          .reduce((node, part) => node[part], messages[namespace]) as string
      ).replace(
        /\{(\w+)\}/g,
        (match, name: string) => values[name] ?? match
      );
  },
}));

jest.mock('../HomeContent', () => () => null);
jest.mock('../about/AboutContent', () => () => null);
jest.mock('../contact/ContactContent', () => () => null);
jest.mock('../imprint/ImprintContent', () => () => null);
jest.mock('../privacy/PrivacyContent', () => () => null);
jest.mock('../projects/ProjectsContent', () => () => null);
jest.mock('../services/ServicesContent', () => () => null);
jest.mock('../services/[serviceId]/ServiceDetailContent', () => ({
  ServiceDetailContent: () => null,
}));

const params = (locale: string) => ({ params: Promise.resolve({ locale }) });

describe.each(routing.locales)('page metadata (%s)', (locale) => {
  const { jobTitle } = POSITIONING[locale];

  it('home: the title is the site title and the description names the job title', async () => {
    const meta = await homeMetadata(params(locale));
    expect(meta.title).toBe(siteTitle(locale));
    expect(meta.description).toMatch(new RegExp(`^${jobTitle}\\. `));
    expect(meta.description).not.toContain('{jobTitle}');
  });

  it('home: the metadata names no employer, no press and no benchmark number (#123)', async () => {
    const serialized = JSON.stringify(await homeMetadata(params(locale)));
    for (const term of ['GALVANY', 'DEMOS', 'bewerbermappe', 'BILD', 'Zeit', 'n-tv', '3–4×', '~40%', '81 tools', '81 Tools']) {
      expect(serialized).not.toContain(term);
    }
  });

  it('about: the description names the job title', async () => {
    const meta = await aboutMetadata(params(locale));
    expect(meta.description).toMatch(new RegExp(`^${jobTitle}\\. `));
    expect(meta.description).not.toContain('{jobTitle}');
  });
});

type MetadataFn = (props: {
  params: Promise<{ locale: string; serviceId: string }>;
}) => Promise<Metadata>;

const pages: [string, string, MetadataFn][] = [
  ['home', '', homeMetadata],
  ['about', '/about', aboutMetadata],
  ['contact', '/contact', contactMetadata],
  ['imprint', '/imprint', imprintMetadata],
  ['privacy', '/privacy', privacyMetadata],
  ['projects', '/projects', projectsMetadata],
  ['services', '/services', servicesMetadata],
  ['service detail', '/services/modern-stack', serviceDetailMetadata],
];

describe.each(routing.locales)('localized social metadata (%s)', (locale) => {
  const other = routing.locales.filter((l) => l !== locale);

  it.each(pages)('%s', async (_name, path, metadata) => {
    const meta = await metadata({
      params: Promise.resolve({ locale, serviceId: 'modern-stack' }),
    });
    const url = localeUrl(locale, path);

    expect(typeof meta.title).toBe('string');
    expect(typeof meta.description).toBe('string');
    expect(meta.alternates).toEqual({
      canonical: url,
      languages: {
        de: localeUrl('de', path),
        en: localeUrl('en', path),
        'x-default': localeUrl(routing.defaultLocale, path),
      },
    });
    expect(meta.openGraph).toMatchObject({
      url,
      title: meta.title,
      description: meta.description,
      locale: OG_LOCALES[locale],
      alternateLocale: other.map((l) => OG_LOCALES[l]),
      images: [{ url: OG_IMAGE_PATH, alt: POSITIONING[locale].ogImageAlt }],
    });
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [{ url: OG_IMAGE_PATH, alt: POSITIONING[locale].ogImageAlt }],
    });
  });
});

it('German and English pages do not share social descriptions', async () => {
  // Titles may match (e.g. "Modern Stack"); descriptions are always translated.
  for (const [, , metadata] of pages) {
    const [de, en] = await Promise.all(
      (['de', 'en'] as const).map((locale) =>
        metadata({ params: Promise.resolve({ locale, serviceId: 'modern-stack' }) })
      )
    );
    expect(de.openGraph?.description).not.toBe(en.openGraph?.description);
  }
});
