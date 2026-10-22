/** @jest-environment node */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { BRAND_GROUP } from '@/config/brand';

// Guards issue #184: a `brand-<step>` class with no `--color-brand-<step>` in a
// @theme block of src/app/globals.css renders no CSS, so the style silently does
// nothing (hover:bg-brand-700 did).

const ROOT = join(__dirname, '..', '..');
const GLOBALS_CSS = join(ROOT, 'src', 'app', 'globals.css');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : walk(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe('brand colour classes', () => {
  const brand: Record<string, string> = Object.fromEntries(
    [...readFileSync(GLOBALS_CSS, 'utf8').matchAll(/--color-brand-(\d{2,3}):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );

  it('every brand-<step> class in src/ has a value in the @theme block', () => {
    const missing: string[] = [];
    for (const file of walk(join(ROOT, 'src'))) {
      if (file === __filename) continue;
      for (const match of readFileSync(file, 'utf8').matchAll(/\bbrand-(\d{2,3})\b/g)) {
        if (!(match[1] in brand)) missing.push(`${relative(ROOT, file)}: brand-${match[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  describe('site colours against @synthwerk/tokens and .figma/tokens.json', () => {
    // The colours stay hex so vfb drift can read them. These tests tie each one
    // to the vendored package (vm-brand B-52) and to its Figma variable.
    const pkg = JSON.parse(readFileSync(join(ROOT, 'vendor', 'synthwerk-tokens', 'dist', 'tokens.json'), 'utf8'));
    const figma = JSON.parse(readFileSync(join(ROOT, '.figma', 'tokens.json'), 'utf8')).collections;
    const site = [...readFileSync(GLOBALS_CSS, 'utf8').matchAll(/--color-(light|dark|brand)-([a-z0-9]+):\s*(#[0-9a-f]{6});/gi)].map(
      ([, family, step, hex]) => ({ name: `${family}-${step}`, family, step, hex: hex.toUpperCase() }),
    );
    const primitives = new Set(Object.values(pkg.primitives as Record<string, string>).map((v) => v.toUpperCase()));

    // Neutrals with no package value (PLAYBOOK §2: neutrals may override, with a reason).
    // #0A0A0B: vm-brand B-54 dark page and brand.json base.light.text. #26262B: base.dark.line.
    const NEUTRAL_OVERRIDES: Record<string, string> = {
      'dark-bg': '#0A0A0B',
      'light-text': '#0A0A0B',
      'dark-border': '#26262B',
    };

    it('reads every site colour', () => {
      expect(site.length).toBeGreaterThanOrEqual(17);
    });

    it('brand-500 is the fill of the site group', () => {
      expect(site.find((c) => c.name === 'brand-500')?.hex).toBe(pkg.groups[BRAND_GROUP].fill.toUpperCase());
    });

    it('every other colour is a package primitive or a listed neutral override', () => {
      const off = site
        .filter((c) => c.name !== 'brand-500')
        .filter((c) => (c.name in NEUTRAL_OVERRIDES ? NEUTRAL_OVERRIDES[c.name] !== c.hex : !primitives.has(c.hex)))
        .map((c) => `${c.name} ${c.hex}`);
      expect(off).toEqual([]);
    });

    it('accents never override: no brand step is a neutral override', () => {
      expect(Object.keys(NEUTRAL_OVERRIDES).filter((name) => name.startsWith('brand-'))).toEqual([]);
    });

    it('every site colour matches its Figma variable', () => {
      const resolveFigma = (key: string): string => {
        let value: string = (figma.color[key] ?? figma.primitive[key])?.value ?? '';
        for (let hop = 0; hop < 5 && value.startsWith('{'); hop++) value = figma.primitive[value.slice(1, -1)]?.value ?? '';
        return value.toUpperCase();
      };
      const mismatches = site
        .map((c) => {
          const key = c.family === 'brand' ? `brand/${c.step}` : `${c.family}/${c.step}`;
          return { key, site: c.hex, figma: resolveFigma(key) };
        })
        .filter((row) => row.site !== row.figma);
      expect(mismatches).toEqual([]);
    });
  });
});
