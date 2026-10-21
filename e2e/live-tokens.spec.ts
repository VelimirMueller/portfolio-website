import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import { OPT_OUT_KEY } from '../src/utils/analytics/optOut';
import tokens from '../.figma/tokens.json';

/**
 * Live token check (issue #151): opens the deployed site in dark and light,
 * reads the computed colours of page, text, line and accent, and compares
 * them with .figma/tokens.json. `vfb drift` compares files; this sees what the
 * deployed site renders. Mismatches go to test-results/live-tokens.json for
 * ops-control.
 */

type Mode = 'dark' | 'light';
type Role = 'bg' | 'text' | 'border' | 'accent-text';

const PAGE_PATH = '/de/projects';
const REPORT = path.join('test-results', 'live-tokens.json');

const collections = tokens.collections as unknown as Record<string, Record<string, { value: string | number }>>;

const lookup = (name: string) => collections.color[name]?.value ?? collections.primitive[name]?.value;

/** Resolves `{zinc/950}` aliases (color or primitive, max 5 hops) to a hex value. */
function tokenHex(name: string): string {
  let value = String(lookup(name) ?? '');
  for (let hop = 0; hop < 5 && value.startsWith('{'); hop++) value = String(lookup(value.slice(1, -1)) ?? '');
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`token ${name} does not resolve to a hex colour (got "${value}")`);
  return value.toUpperCase();
}

/**
 * `rgb(9, 9, 11)` → `#09090B`. The sampled roles are opaque: a translucent or
 * non-rgb value fails loudly instead of comparing as a wrong hex.
 */
function cssToHex(css: string): string {
  const match = css.trim().match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!match || (match[4] !== undefined && Number(match[4]) !== 1)) {
    throw new Error(`expected an opaque rgb() colour, got "${css}"`);
  }
  return `#${match.slice(1, 4).map((c) => Number(c).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** Computed colour per role, from elements every deploy has on PAGE_PATH. */
async function readRoles(page: Page): Promise<Record<Role, string>> {
  const style = (selector: string, prop: string) =>
    page.locator(selector).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
  return {
    bg: cssToHex(await style('body', 'background-color')),
    text: cssToHex(await style('body', 'color')),
    // The navigation pill border (border-light-border / dark:border-dark-border).
    border: cssToHex(await style('nav > div', 'border-top-color')),
    // The SectionHeader eyebrow (text-brand-600 / dark:text-brand-400).
    'accent-text': cssToHex(
      await page
        .locator('h1')
        .first()
        .locator('xpath=preceding-sibling::div[1]/span[last()]')
        .evaluate((el) => getComputedStyle(el).color),
    ),
  };
}

interface Mismatch {
  mode: Mode;
  role: Role;
  token: string;
  expected: string;
  actual: string;
}

/**
 * Adds one mode's result to the report. Each test merges into the file, because
 * Playwright starts a new worker after a failure (module state is lost);
 * test-results/ is emptied at the start of every run, so no stale entries stay.
 */
function report(url: string | undefined, mode: Mode, found: Mismatch[]) {
  const previous = fs.existsSync(REPORT)
    ? (JSON.parse(fs.readFileSync(REPORT, 'utf8')) as { checked: Mode[]; mismatches: Mismatch[] })
    : { checked: [], mismatches: [] };
  const next = { url, checked: [...previous.checked, mode], mismatches: [...previous.mismatches, ...found] };
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, `${JSON.stringify(next, null, 2)}\n`);
}

test.describe('live tokens', () => {
  for (const mode of ['dark', 'light'] as const) {
    test(`${mode} mode renders the token colours`, async ({ page, baseURL }) => {
      // Saved theme wins over the system preference in ThemeProvider; the
      // opt-out keeps the check out of the site's own analytics.
      await page.addInitScript(
        ([theme, optOut]) => {
          window.localStorage.setItem('theme', theme);
          window.localStorage.setItem(optOut, '1');
        },
        [mode, OPT_OUT_KEY] as const,
      );
      await page.emulateMedia({ colorScheme: mode, reducedMotion: 'reduce' });
      const response = await page.goto(PAGE_PATH);
      expect(response?.ok(), PAGE_PATH).toBe(true);
      await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${mode}\\b`));

      const actual = await readRoles(page);
      const mismatches: Mismatch[] = [];
      for (const role of Object.keys(actual) as Role[]) {
        const token = `${mode}/${role}`;
        const expected = tokenHex(token);
        if (actual[role] !== expected) mismatches.push({ mode, role, token, expected, actual: actual[role] });
      }
      report(baseURL, mode, mismatches);
      expect(mismatches).toEqual([]);
    });
  }
});
