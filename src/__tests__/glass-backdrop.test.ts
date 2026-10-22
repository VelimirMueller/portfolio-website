/**
 * Contract for the liquid-glass look (issue #208): `.glass` blurs whatever is behind it, unless an ancestor is a
 * backdrop root. Opacity < 1, a filter or will-change on those makes one, so the panels render flat during the
 * animation and snap to blurred at its end. The animations that wrap whole pages must therefore move with transform
 * only. AnimateIn has the same rule in its own tests.
 */
import { readFileSync } from 'fs';
import path from 'path';

const css = readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');

function keyframes(name: string): string {
  const start = css.indexOf(`@keyframes ${name} {`);
  expect(start).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error(`unterminated @keyframes ${name}`);
}

describe('page transition keeps the glass blurred', () => {
  it('warp-in animates transform only', () => {
    const body = keyframes('warp-in');
    expect(body).toMatch(/transform:/);
    expect(body).not.toMatch(/opacity|filter|clip-path|mask|mix-blend-mode/);
  });
});
