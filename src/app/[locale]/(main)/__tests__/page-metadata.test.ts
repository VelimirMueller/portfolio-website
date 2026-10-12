/**
 * Page metadata reads the job title from the positioning config. The
 * catalogs hold only the `{jobTitle}` placeholder.
 */
import { routing } from '@/i18n/routing';
import { POSITIONING, siteTitle } from '@/config/positioning';
import { generateMetadata as homeMetadata } from '../page';
import { generateMetadata as aboutMetadata } from '../about/page';

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
      (messages[namespace][key] as string).replace(
        /\{(\w+)\}/g,
        (match, name: string) => values[name] ?? match
      );
  },
}));

jest.mock('../HomeContent', () => () => null);
jest.mock('../about/AboutContent', () => () => null);

const params = (locale: string) => ({ params: Promise.resolve({ locale }) });

describe.each(routing.locales)('page metadata (%s)', (locale) => {
  const { jobTitle } = POSITIONING[locale];

  it('home: the title is the site title and the description names the job title', async () => {
    const meta = await homeMetadata(params(locale));
    expect(meta.title).toBe(siteTitle(locale));
    expect(meta.description).toMatch(new RegExp(`^${jobTitle}\\. `));
    expect(meta.description).not.toContain('{jobTitle}');
  });

  it('about: the description names the job title', async () => {
    const meta = await aboutMetadata(params(locale));
    expect(meta.description).toMatch(new RegExp(`^${jobTitle}\\. `));
    expect(meta.description).not.toContain('{jobTitle}');
  });
});
