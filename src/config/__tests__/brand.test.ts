/** @jest-environment node */
import { readFileSync } from 'fs';
import { join } from 'path';
import { BRAND_GROUP, PAGE_COLOR } from '../brand';

const ROOT = join(__dirname, '..', '..', '..');
const read = (...path: string[]) => readFileSync(join(ROOT, ...path), 'utf8');

describe('brand config', () => {
  const tokens = JSON.parse(read('vendor', 'synthwerk-tokens', 'dist', 'tokens.json'));

  it('names a group that @synthwerk/tokens defines', () => {
    expect(Object.keys(tokens.groups)).toContain(BRAND_GROUP);
  });

  it('uses the one dark page of vm-brand B-54', () => {
    expect(PAGE_COLOR.dark).toBe('#0a0a0b');
  });

  it('matches the page colours in globals.css', () => {
    const css = read('src', 'app', 'globals.css');
    expect(css).toContain(`--color-dark-bg: ${PAGE_COLOR.dark};`);
    expect(css).toContain(`--color-light-bg: ${PAGE_COLOR.light};`);
    expect(tokens.primitives['zinc-50'].toLowerCase()).toBe(PAGE_COLOR.light);
  });
});
