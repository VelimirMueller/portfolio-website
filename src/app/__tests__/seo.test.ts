import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/config/site';
import { POSITIONING, siteTitle } from '@/config/positioning';
import {
  OG_IMAGE_PATH,
  languageAlternates,
  ogImage,
  ogLocales,
  pageMetadata,
  rootMetadata,
  siteJsonLd,
} from '../seo';

describe('rootMetadata', () => {
  it.each(routing.locales)(
    'uses the %s positioning for title, description, Open Graph and Twitter',
    (locale) => {
      const { description } = POSITIONING[locale];
      const meta = rootMetadata(locale);

      expect(meta.metadataBase?.toString()).toBe(`${SITE_URL}/`);
      expect(meta.title).toBe(siteTitle(locale));
      expect(meta.description).toBe(description);
      expect(meta.keywords).toContain(POSITIONING[locale].jobTitle);
      expect(meta.openGraph).toMatchObject({
        title: siteTitle(locale),
        description,
      });
      expect(meta.twitter).toMatchObject({
        title: siteTitle(locale),
        description,
        images: [ogImage(locale)],
      });
    }
  );

  it('sets og:locale de_DE with en_US as the alternate on German pages', () => {
    expect(rootMetadata('de').openGraph).toMatchObject({
      locale: 'de_DE',
      alternateLocale: ['en_US'],
    });
  });

  it('sets og:locale en_US with de_DE as the alternate on English pages', () => {
    expect(rootMetadata('en').openGraph).toMatchObject({
      locale: 'en_US',
      alternateLocale: ['de_DE'],
    });
  });
});

describe('ogLocales', () => {
  it('falls back to the default locale for an unknown locale', () => {
    expect(ogLocales('fr')).toEqual(ogLocales(routing.defaultLocale));
  });
});

describe('ogImage', () => {
  it.each(routing.locales)('uses the %s alt text', (locale) => {
    expect(ogImage(locale)).toEqual({
      url: OG_IMAGE_PATH,
      width: 1200,
      height: 630,
      type: 'image/jpeg',
      alt: POSITIONING[locale].ogImageAlt,
    });
  });

  it('has a German alt text that differs from the English one', () => {
    expect(ogImage('de').alt).not.toBe(ogImage('en').alt);
  });
});

describe('languageAlternates', () => {
  it('lists every locale and x-default on the default locale', () => {
    expect(languageAlternates('/about')).toEqual({
      de: `${SITE_URL}/de/about`,
      en: `${SITE_URL}/en/about`,
      'x-default': `${SITE_URL}/${routing.defaultLocale}/about`,
    });
  });

  it('uses the bare locale URL for the home page', () => {
    expect(languageAlternates()).toMatchObject({
      de: `${SITE_URL}/de`,
      en: `${SITE_URL}/en`,
    });
  });
});

describe('pageMetadata', () => {
  const input = {
    locale: 'de',
    path: '/contact',
    title: 'Kontakt — Velimir Müller',
    description: 'Kontaktieren Sie mich.',
  };

  it('copies the page title and description into Open Graph and Twitter', () => {
    const meta = pageMetadata(input);
    expect(meta.title).toBe(input.title);
    expect(meta.description).toBe(input.description);
    expect(meta.openGraph).toMatchObject({
      type: 'website',
      url: `${SITE_URL}/de/contact`,
      title: input.title,
      description: input.description,
      locale: 'de_DE',
      alternateLocale: ['en_US'],
      images: [ogImage('de')],
    });
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [ogImage('de')],
    });
  });

  it('sets the canonical URL and the hreflang alternates', () => {
    expect(pageMetadata(input).alternates).toEqual({
      canonical: `${SITE_URL}/de/contact`,
      languages: languageAlternates('/contact'),
    });
  });

  it('builds the canonical URL on the default locale for an unknown locale', () => {
    expect(pageMetadata({ ...input, locale: 'fr' }).alternates?.canonical).toBe(
      `${SITE_URL}/${routing.defaultLocale}/contact`
    );
  });
});

describe('siteJsonLd', () => {
  it.each(routing.locales)(
    'reads the %s job title for Person and Occupation',
    (locale) => {
      const { jobTitle, description } = POSITIONING[locale];
      const [person, website] = siteJsonLd(locale);

      expect(person).toMatchObject({
        '@type': 'Person',
        jobTitle,
        description,
        url: SITE_URL,
        hasOccupation: { '@type': 'Occupation', name: jobTitle },
      });
      expect(website).toMatchObject({ '@type': 'WebSite', description });
    }
  );
});
