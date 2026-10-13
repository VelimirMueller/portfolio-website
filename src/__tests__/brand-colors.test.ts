/** @jest-environment node */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import config from '../../tailwind.config';

// Guards issue #184: a `brand-<step>` class with no step in tailwind.config.ts
// renders no CSS, so the style silently does nothing (hover:bg-brand-700 did).

const ROOT = join(__dirname, '..', '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : walk(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe('brand colour classes', () => {
  const brand = (config.theme?.extend?.colors as Record<string, Record<string, string>>).brand;

  it('every brand-<step> class in src/ has a value in tailwind.config.ts', () => {
    const missing: string[] = [];
    for (const file of walk(join(ROOT, 'src'))) {
      if (file === __filename) continue;
      for (const match of readFileSync(file, 'utf8').matchAll(/\bbrand-(\d{2,3})\b/g)) {
        if (!(match[1] in brand)) missing.push(`${relative(ROOT, file)}: brand-${match[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('brand-700 matches the token in .figma/tokens.json', () => {
    const tokens = JSON.parse(readFileSync(join(ROOT, '.figma', 'tokens.json'), 'utf8'));
    const find = (node: unknown): string | undefined => {
      if (!node || typeof node !== 'object') return undefined;
      const entry = (node as Record<string, unknown>)['brand/700'];
      if (entry && typeof entry === 'object') return (entry as { value: string }).value;
      for (const child of Object.values(node)) {
        const value = find(child);
        if (value) return value;
      }
      return undefined;
    };
    expect(brand['700'].toLowerCase()).toBe(find(tokens)?.toLowerCase());
  });
});
