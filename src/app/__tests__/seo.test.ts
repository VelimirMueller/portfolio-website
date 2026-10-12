import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/config/site';
import { POSITIONING, siteTitle } from '@/config/positioning';
import { rootMetadata, siteJsonLd } from '../seo';

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
      });
    }
  );
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
