import sitemap from '../sitemap';
import { routing } from '@/i18n/routing';

describe('sitemap', () => {
  const entries = sitemap();

  it('lists every path once per locale', () => {
    const perLocale = entries.length / routing.locales.length;
    expect(Number.isInteger(perLocale)).toBe(true);
    for (const locale of routing.locales) {
      const localeEntries = entries.filter((e) =>
        new URL(e.url).pathname.startsWith(`/${locale}`)
      );
      expect(localeEntries).toHaveLength(perLocale);
    }
  });

  it('declares hreflang alternates for every locale plus x-default', () => {
    for (const entry of entries) {
      const languages = entry.alternates?.languages as Record<string, string>;
      expect(Object.keys(languages).sort()).toEqual(
        [...routing.locales, 'x-default'].sort()
      );
      expect(languages['x-default']).toContain(`/${routing.defaultLocale}`);
    }
  });

  it('uses one absolute base URL for all entries', () => {
    const origins = new Set(entries.map((e) => new URL(e.url).origin));
    expect(origins.size).toBe(1);
  });

  it('gives the homepage the highest priority', () => {
    const max = Math.max(...entries.map((e) => e.priority ?? 0));
    const homepages = entries.filter((e) => e.priority === max);
    for (const home of homepages) {
      expect(new URL(home.url).pathname).toMatch(/^\/(de|en)$/);
    }
  });
});
