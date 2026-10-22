#!/usr/bin/env bash
# Runs the Storybook visual regression suite in the same Playwright image as CI
# (issue #215), so screenshots render with the same browsers, fonts and libraries.
# Baselines are made only here; a render on macOS or another image differs.
#
#   pnpm run test:visual:docker      compare with the committed baselines
#   pnpm run test:visual:update      write new baselines (--update-snapshots)
#
# Extra arguments go to `playwright test`. Needs Docker. The image reference is
# read from .github/workflows/ci.yml, so a local run always uses the CI image.
# PLAYWRIGHT_PLATFORM=linux/amd64 renders on the CI architecture (slower on Apple
# silicon); the default is the native architecture of the Docker host.
set -euo pipefail

cd "$(dirname "$0")/../.."

image="$(grep -m1 -oE 'image: mcr\.microsoft\.com/playwright:v[^[:space:]@]+@sha256:[0-9a-f]{64}' .github/workflows/ci.yml | cut -d' ' -f2 || true)"
[[ -n "$image" ]] || { echo "No digest-pinned Playwright image in .github/workflows/ci.yml" >&2; exit 1; }

platform=()
[[ -n "${PLAYWRIGHT_PLATFORM:-}" ]] && platform=(--platform "$PLAYWRIGHT_PLATFORM")

# node_modules lives in an anonymous volume: the host's node_modules holds
# binaries for the host OS. The pnpm store volume keeps later runs fast. Files
# the run writes are given back to the host user at the end.
docker run --rm --ipc=host ${platform[@]+"${platform[@]}"} \
  -v "$PWD":/work -v /work/node_modules -v portfolio-pnpm-store:/pnpm-store \
  -w /work -e CI=1 -e HOST_UID="$(id -u)" -e HOST_GID="$(id -g)" \
  "$image" bash -c '
    set -euo pipefail
    corepack enable
    pnpm install --frozen-lockfile --store-dir /pnpm-store
    pnpm run build-storybook
    status=0
    pnpm run test:visual "$@" || status=$?
    for dir in e2e/storybook-visual.spec.ts-snapshots storybook-static test-results playwright-report; do
      if [[ -e "$dir" ]]; then chown -R "$HOST_UID:$HOST_GID" "$dir"; fi
    done
    exit "$status"
  ' bash "$@"
