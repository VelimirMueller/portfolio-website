/** @jest-environment node */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

// Guards issue #215: the Playwright jobs run in mcr.microsoft.com/playwright.
// The image holds the browsers for exactly one Playwright version, so its tag
// must equal the locked @playwright/test version, and every job must use the
// same image, pinned by digest.
//
// When this test fails after a @playwright/test bump: take the new version,
// read the digest with
//   docker buildx imagetools inspect mcr.microsoft.com/playwright:v<version>-noble
// and replace the image in every workflow. Then run `pnpm run test:visual:update`
// and commit the baselines that changed.

const ROOT = join(__dirname, '..', '..');
const WORKFLOWS = join(ROOT, '.github', 'workflows');
// Only `image:` keys count, so a comment that names an image cannot hide a missing one.
const IMAGE = /^\s*image:\s*(mcr\.microsoft\.com\/playwright:v([^\s@]+)-noble(@sha256:[0-9a-f]{64})?)\s*$/gm;

// Package keys sit at two spaces in pnpm-lock.yaml; a peer suffix "(...)" is not part of the version.
function lockedVersion(): string {
  const lock = readFileSync(join(ROOT, 'pnpm-lock.yaml'), 'utf8');
  const versions = new Set([...lock.matchAll(/^ {2}'@playwright\/test@([^'(]+)[^']*':$/gm)].map((m) => m[1]));
  if (versions.size !== 1) throw new Error(`expected one locked @playwright/test version, found: ${[...versions].join(', ') || 'none'}`);
  return [...versions][0];
}

function imageRefs(): { file: string; ref: string; version: string; digest?: string }[] {
  return readdirSync(WORKFLOWS)
    .filter((name) => /\.ya?ml$/.test(name))
    .flatMap((name) =>
      [...readFileSync(join(WORKFLOWS, name), 'utf8').matchAll(IMAGE)].map((m) => ({
        file: name,
        ref: m[1],
        version: m[2],
        digest: m[3],
      })),
    );
}

describe('Playwright CI image', () => {
  const refs = imageRefs();

  it('is used by the CI workflows', () => {
    expect(refs.map((r) => r.file)).toEqual(expect.arrayContaining(['ci.yml', 'live-check.yml']));
  });

  it('has the tag of the locked @playwright/test version', () => {
    const locked = lockedVersion();
    for (const ref of refs) expect(`${ref.file}: ${ref.version}`).toBe(`${ref.file}: ${locked}`);
  });

  it('is pinned by digest', () => {
    for (const ref of refs) expect(`${ref.file}: ${ref.digest ?? 'no digest'}`).toMatch(/: @sha256:/);
  });

  it('is the same image in every job', () => {
    expect(new Set(refs.map((r) => r.ref)).size).toBe(1);
  });
});
