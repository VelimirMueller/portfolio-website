import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the live token check (issue #151) against a deployed
 * site. Runs after a Vercel deploy, never on a PR: LIVE_URL is the deployment
 * URL (default: production). Run with: pnpm run test:live
 */
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: './e2e',
  testMatch: 'live-tokens.spec.ts',
  // No retries: a retry runs in a new worker and would rewrite the report with a partial list.
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.LIVE_URL || 'https://www.velimir-mueller.de',
    // Vercel Deployment Protection on previews; the header is sent only when the secret is set.
    extraHTTPHeaders: bypass ? { 'x-vercel-protection-bypass': bypass } : undefined,
  },
});
