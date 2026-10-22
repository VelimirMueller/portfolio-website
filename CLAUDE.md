# CLAUDE.md

Development rules for velimir-mueller.de. Details live in the [README](README.md) and [docs/REFERENCE.md](docs/REFERENCE.md); env var names live in [.env.example](.env.example).

## Core rule

**Every change must keep the existing behaviour of the site.** The app must work exactly as before, unless the change is the behaviour. Every push to `main` deploys to production on Vercel.

## Stack

- Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 3.
- `next-intl`: locales `de` (default) and `en`, both prefixed in the URL (`/de`, `/en`). Config in `src/i18n/`, copy in `src/locales/*.json`.
- Supabase (Postgres, Auth with magic link, RLS) through `@supabase/ssr`. Clients in `src/utils/supabase/`.
- Contact form: hCaptcha; the `send-contact-email` Edge Function sends the mail with Resend.
- Analytics: first-party and cookieless (`/api/collect`), plus Vercel Speed Insights through the same-origin `/_vercel/speed-insights/*` path. One opt-out (`src/utils/analytics/optOut.ts`) covers both.
- Tests: Jest + React Testing Library, Playwright (e2e and visual regression), Storybook 10 (`@storybook/nextjs-vite`), SQL tests against a local Supabase.
- Node 22 or later.

## Commands

| Command | What it does |
| :--- | :--- |
| `pnpm run dev` | Dev server on `localhost:3000`. The CSP blocks `eval` here, so client components do not hydrate. Check interactive behaviour with `pnpm run build && pnpm start`. |
| `pnpm run build` / `pnpm start` | Production build / serve it. |
| `pnpm run lint` | ESLint CLI (`eslint .`, flat config `eslint.config.mjs` with `next/core-web-vitals`). |
| `pnpm run type-check` | `tsc --noEmit`. |
| `pnpm test` / `pnpm run test:watch` | Jest unit and integration tests. |
| `pnpm run test:coverage` | Jest with the enforced coverage floor (CI runs this). |
| `pnpm run storybook` / `pnpm run build-storybook` | Storybook on port 6006 / static build. |
| `pnpm run test:visual` | Playwright screenshots of every story (`playwright-storybook.config.ts`). |
| `pnpm run test:visual:docker` / `pnpm run test:visual:update` | The visual suite in the CI Playwright image (Docker) / the same with `--update-snapshots`: the only way to write new baselines. |
| `pnpm run test:e2e` | Playwright against the production build (`playwright.config.ts`, `e2e/*.spec.ts`). |
| `pnpm run test:db` | Applies `supabase/migrations/` to a fresh local database and runs `supabase/tests/*.sql`. Needs Docker and psql. |
| `pnpm run db:types` | Writes `src/types/supabase.ts` from `supabase/migrations/` on a fresh local database (never the hosted project). CI fails when the file is stale. |

CI (`.github/workflows/ci.yml`) runs on every PR: dependency audit, lint and type check, database migrations and SQL tests, unit tests with coverage and build, Storybook visual regression, e2e.

## Where things live

- `src/app/[locale]/(main)/`: public pages (home, about, services, projects, contact).
- `src/app/projects/`: live demos `dashboard-demo` (CRM; views in `_components/`, sample data and pure logic in `_lib/`, `page.tsx` is only the route) and `mcp-demo`. Outside `[locale]` on purpose; the `src/proxy.ts` matcher (Next.js 16 proxy, formerly middleware) excludes them by name. The WASM shooter and the MCP demo page are static files in `public/games/` and `public/demos/`.
- `src/app/admin/`: private admin (English, `noindex`). UI in `_components/`, queries and logic in `_lib/`.
- `src/app/api/`: route handlers (contact, analytics collect).
- `src/components/`: shared UI in Atomic Design layers: `atoms/` (`Button`, `CodeBlock`, `LanguageToggle`), `molecules/` (`BentoCard`, `SectionHeader`), `organisms/` (`Navigation`, `Footer`).
- `src/config/`: single sources of truth: `site.ts` (URL), `positioning.ts` (job title, description), `admin.ts` (admin UUID), `legal.ts`.
- `src/app/seo.ts`: localized metadata (Open Graph, Twitter) per page.
- `supabase/migrations/`, `supabase/tests/`: schema and SQL tests. `scripts/mtg/`: Magic catalog loaders.

## Components

- Presentational components get data through props. They hold only UI state (hover, open, focus). No data fetching, no side effects.
- Server components (pages, layouts) and server actions fetch data and pass it down.
- Client components (`'use client'`) own browser state and effects, e.g. `ThemeProvider`, `LanguageToggle`, `Analytics`, the admin dashboards. Keep them as small as possible.
- Stories (`*.stories.tsx`) sit next to the component; tests sit in the `__tests__/` folder next to the code.

## Fixed rules

- **No cookies on a visit.** `next-intl` runs with `localeCookie: false`; `e2e/headers.spec.ts` asserts that public pages set no cookie. No third-party request on page view: hCaptcha loads only when the contact form is sent. Only the admin login sets a session cookie.
- **One `headers()` entry.** All security headers come from `headerRules` in `next.config.mjs`; `buildCsp()` builds the one CSP per response. Never add a second CSP header (two CSPs are enforced as their intersection). Same-origin framing exists only for `/demos/mcp-demo.html`.
- **Migrations are the source.** `supabase/migrations/` is the single source of truth for the schema, also for other apps on this database. Add a new migration; never edit an applied one. Add or update a SQL test in `supabase/tests/`, and run `pnpm run db:types` so the typed Supabase clients see the change.
- **Admin UUID in two places.** `src/config/admin.ts` and `public.is_admin()` in the migration. Change both together. Middleware, `requireAdmin()` and RLS all check it. No service-role key.
- **Positioning in one place.** The public job title and positioning line come from `src/config/positioning.ts`. Locale copy uses the `{jobTitle}` placeholder. Change copy in both languages.
- **Env vars: names only.** Never write a value into a file, commit, PR or log. The names are in `.env.example` and `supabase/functions/.env.example`; values live in `.env.local`, in Vercel and in Supabase function secrets.
- **No tags.** Releases are a `chore(release): vX.Y.Z` commit that bumps `package.json`. The owner creates the signed tag. Never create or push a tag.
- **Commits** follow Conventional Commits; the husky `commit-msg` hook runs commitlint. The `pre-commit` hook runs lint-staged: ESLint on the staged files and `tsc --noEmit`.
- **CI actions are pinned** to a full commit SHA with the version as a comment (`uses: owner/action@<sha> # vX.Y.Z`). Dependabot bumps both. The workflow token is read-only (`permissions: contents: read`).

## Testing

- Test behaviour, not implementation. Mock Supabase and network calls in unit tests.
- Coverage ratchet: `coverageThreshold` in jest.config.js is the enforced floor (CI runs `pnpm run test:coverage`).
  Each value is the measured global number rounded down, minus 1 point. When a change raises coverage, raise the floor in the same PR. Never lower it.
- A UI change that alters a story's look needs new visual baselines (`pnpm run test:visual:update`). Baselines are rendered in the pinned CI image `mcr.microsoft.com/playwright`, never on macOS.
- **Playwright CI image.** The visual, e2e and live-check jobs run in `mcr.microsoft.com/playwright:v<version>-noble`, pinned by digest (no apt at run time, issue #215). The tag must equal the locked `@playwright/test` version; `src/__tests__/playwright-image.test.ts` fails otherwise and says how to bump it.
- A schema change needs `pnpm run test:db` green.

## Environment variables

Names only. App and scripts: `.env.example`. Edge Function secrets: `supabase/functions/.env.example`. Details in [docs/REFERENCE.md](docs/REFERENCE.md#environment-variables). `src/__tests__/env-example.test.ts` fails when code reads a name that no template lists.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: required.
- `NEXT_PUBLIC_HCAPTCHA_SITEKEY`, `HCAPTCHA_SECRET`: contact form captcha.
- `ANALYTICS_INGEST_SECRET`: analytics ingest (Vercel).
- `NEXT_PUBLIC_SITE_URL`: optional, overrides the canonical URL (preview deployments).
- `VERCEL_API_TOKEN`, `VERCEL_PROJECT`, `VERCEL_TEAM_ID`: optional, admin KPI tab *Vercel*.
- `SUPABASE_DB_URL`: local only, for the Magic catalog loaders in `scripts/mtg/`.
- Edge Function secrets, not read by Next.js: `RESEND_API_KEY`, `CONTACT_HOOK_SECRET`, `EMAIL_FROM`, `CONTACT_TO` (`send-contact-email`, which sends the contact mail); `TESTDATA_EXPORT_KEY` (`testdata-eval`). Set them with `supabase secrets set`.
