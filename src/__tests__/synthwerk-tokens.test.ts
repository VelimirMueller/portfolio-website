/** @jest-environment node */
import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { join, relative, sep } from 'path';

// @synthwerk/tokens is vendored (not on npm yet, vm-brand B-52). The lock records
// the synthwerk-sdk commit and a SHA-256 per file. A hand edit or a partial sync
// fails here: rerun scripts/tokens/sync.sh <commit> instead.

const ROOT = join(__dirname, '..', '..');
const VENDOR = join(ROOT, 'vendor', 'synthwerk-tokens');
const lock = JSON.parse(readFileSync(join(ROOT, 'vendor', 'synthwerk-tokens.lock.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

describe('vendored @synthwerk/tokens', () => {
  it('pins one synthwerk-sdk commit', () => {
    expect(lock.source.repository).toBe('https://github.com/VelimirMueller/synthwerk-sdk.git');
    expect(lock.source.directory).toBe('packages/tokens');
    expect(lock.source.commit).toMatch(/^[0-9a-f]{40}$/);
  });

  it('is the package and version the lock names', () => {
    const vendored = JSON.parse(readFileSync(join(VENDOR, 'package.json'), 'utf8'));
    expect([vendored.name, vendored.version]).toEqual([lock.name, lock.version]);
  });

  it('is consumed from vendor/ by package.json', () => {
    expect(pkg.dependencies['@synthwerk/tokens']).toBe('file:vendor/synthwerk-tokens');
  });

  it('has exactly the files of the lock, byte for byte', () => {
    const actual = Object.fromEntries(
      walk(VENDOR)
        .map((file) => [relative(VENDOR, file).split(sep).join('/'), file] as const)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([name, file]) => [name, createHash('sha256').update(readFileSync(file)).digest('hex')]),
    );
    expect(actual).toEqual(lock.files);
  });
});
