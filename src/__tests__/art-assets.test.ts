/** @jest-environment node */
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

// Guards vm-brand#24: every brand render the code names exists in public/art,
// so removing or renaming an art file fails here and not as a blank section in production.

const ROOT = join(__dirname, '..', '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : walk(path);
    return /\.(ts|tsx)$/.test(path) && !/\.test\.tsx?$/.test(path) ? [path] : [];
  });
}

// Literal paths only, e.g. url('/art/v2/site-contact.webp'). Template paths (`/art/build-${key}-v1.webp`) are skipped.
const ART_PATH = /['"(]\/(art\/[\w./-]+\.(?:webp|png|jpe?g|avif|svg))/g;

const referenced = new Map<string, string>();
for (const file of walk(join(ROOT, 'src'))) {
  for (const match of readFileSync(file, 'utf8').matchAll(ART_PATH)) {
    if (!referenced.has(match[1])) referenced.set(match[1], relative(ROOT, file));
  }
}

describe('brand art', () => {
  it('finds the literal art paths, including every site render', () => {
    const site = ['site-contact', 'site-svc-requirements', 'site-svc-ux', 'site-svc-frontend', 'site-svc-delivery', 'site-svc-stack'];
    for (const name of site) expect(referenced.has(`art/v2/${name}.webp`)).toBe(true);
  });

  it('has a file in public/ for every art path the code uses', () => {
    const missing = [...referenced]
      .filter(([path]) => !existsSync(join(ROOT, 'public', path)))
      .map(([path, file]) => `/${path} (${file})`);
    expect(missing).toEqual([]);
  });
});
