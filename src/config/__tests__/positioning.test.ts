import fs from 'fs';
import path from 'path';
import { routing } from '@/i18n/routing';
import de from '@/locales/de.json';
import en from '@/locales/en.json';
import {
  POSITIONING,
  SITE_NAME,
  getPositioning,
  siteTitle,
} from '../positioning';

const SRC = path.resolve(__dirname, '..', '..');
const catalogs = { de, en } as const;

/** Every string value in a message catalog, with its dotted key. */
function strings(node: unknown, prefix = ''): [string, string][] {
  if (typeof node === 'string') return [[prefix, node]];
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) =>
      strings(v, prefix ? `${prefix}.${k}` : k)
    );
  }
  return [];
}

/** Source files under src/, without tests and stories. */
function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : sourceFiles(full);
    }
    return /\.(ts|tsx)$/.test(entry.name) && !/\.stories\.tsx$/.test(entry.name)
      ? [full]
      : [];
  });
}

describe('positioning config', () => {
  it('defines a job title and a description for every locale', () => {
    for (const locale of routing.locales) {
      const { jobTitle, description } = POSITIONING[locale];
      expect(jobTitle.trim()).not.toBe('');
      expect(description).toContain(jobTitle);
    }
  });

  it('falls back to the default locale for an unknown locale', () => {
    expect(getPositioning('fr')).toBe(POSITIONING[routing.defaultLocale]);
  });

  it('builds the site title from the name and the job title', () => {
    for (const locale of routing.locales) {
      expect(siteTitle(locale)).toBe(
        `${SITE_NAME} | ${POSITIONING[locale].jobTitle}`
      );
    }
  });

  it.each(routing.locales)(
    'the %s catalog never hard-codes the job title',
    (locale) => {
      const { jobTitle } = POSITIONING[locale];
      const offenders = strings(catalogs[locale])
        .filter(([, value]) => value.includes(jobTitle))
        .map(([key]) => key);
      expect(offenders).toEqual([]);
    }
  );

  it('no source file outside the config hard-codes the job title', () => {
    const titles = new Set(Object.values(POSITIONING).map((p) => p.jobTitle));
    const config = path.join(SRC, 'config', 'positioning.ts');
    const offenders = sourceFiles(SRC)
      .filter((file) => file !== config)
      .filter((file) => {
        const text = fs.readFileSync(file, 'utf8');
        return [...titles].some((title) => text.includes(title));
      })
      .map((file) => path.relative(SRC, file));
    expect(offenders).toEqual([]);
  });

  it.each(routing.locales)(
    'the %s Open Graph image alt text names the job title',
    (locale) => {
      expect(POSITIONING[locale].ogImageAlt).toContain(
        `${SITE_NAME}, ${POSITIONING[locale].jobTitle}.`
      );
    }
  );
});
