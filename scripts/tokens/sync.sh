#!/usr/bin/env bash
# Vendors @synthwerk/tokens (vm-brand B-52) from one synthwerk-sdk commit.
#
# The package is not on npm. This script builds it from a pinned commit, packs it
# with `pnpm pack` (only the files the package publishes), and unpacks it into
# vendor/synthwerk-tokens/. package.json consumes it as "file:vendor/synthwerk-tokens".
# vendor/synthwerk-tokens.lock.json records the commit, the version and a SHA-256
# per file; src/__tests__/synthwerk-tokens.test.ts fails when the copy differs
# from the lock, so nobody edits the vendored files by hand.
#
# Usage: bash scripts/tokens/sync.sh <full-commit-sha>
# Then:  pnpm install, check the diff, commit vendor/ and pnpm-lock.yaml together.
# When the package is on npm, replace the file: dependency with the version and
# delete vendor/ and this script.
set -euo pipefail

REPO_URL="https://github.com/VelimirMueller/synthwerk-sdk.git"
PACKAGE_DIR="packages/tokens"

commit="${1:-}"
if [[ ! "$commit" =~ ^[0-9a-f]{40}$ ]]; then
  echo "usage: $0 <full 40-character synthwerk-sdk commit sha>" >&2
  exit 2
fi

root="$(git rev-parse --show-toplevel)"
dest="$root/vendor/synthwerk-tokens"
lock="$root/vendor/synthwerk-tokens.lock.json"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

echo "→ clone synthwerk-sdk at $commit"
git init -q "$work/sdk"
git -C "$work/sdk" remote add origin "$REPO_URL"
git -C "$work/sdk" fetch -q --depth 1 origin "$commit"
git -C "$work/sdk" checkout -q FETCH_HEAD

echo "→ build $PACKAGE_DIR"
(cd "$work/sdk" && pnpm install --frozen-lockfile --silent && pnpm --filter ./"$PACKAGE_DIR" run build)

echo "→ pack"
mkdir -p "$work/pack"
(cd "$work/sdk/$PACKAGE_DIR" && pnpm pack --pack-destination "$work/pack" >/dev/null)
tarball="$(find "$work/pack" -name '*.tgz' -print -quit)"

echo "→ unpack into vendor/synthwerk-tokens"
rm -rf "$dest"
mkdir -p "$dest"
tar -xzf "$tarball" -C "$dest" --strip-components=1

node --input-type=module - "$dest" "$lock" "$REPO_URL" "$commit" "$PACKAGE_DIR" <<'NODE'
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const [dest, lock, repository, commit, directory] = process.argv.slice(2);
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
const files = Object.fromEntries(
  walk(dest)
    .map((file) => [relative(dest, file).split('\\').join('/'), file])
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([name, file]) => [name, createHash('sha256').update(readFileSync(file)).digest('hex')]),
);
const { name, version } = JSON.parse(readFileSync(join(dest, 'package.json'), 'utf8'));
const out = { name, version, source: { repository, commit, directory }, files };
writeFileSync(lock, `${JSON.stringify(out, null, 2)}\n`);
console.log(`→ ${name}@${version}: ${Object.keys(files).length} files, lock written`);
NODE
