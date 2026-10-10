# Claude project setup

A Claude project (claude.ai → Projects) gives every chat about velimir-mueller.de the same rules and files.
It must be created by hand in claude.ai: there is no command for it.

## Steps

1. claude.ai → Projects → New project. Name: `velimir-mueller.de`. Description: `My portfolio site: Next.js on Vercel, Supabase, live demos, private admin.`
2. Paste the block below into "Project instructions".
3. Connect the GitHub repo `VelimirMueller/portfolio-website` and add these files as project knowledge:
   - `README.md`
   - `CLAUDE.md`
   - `docs/REFERENCE.md`
   - `.env.example`
   - `next.config.mjs`
   - `src/middleware.ts`
4. After a release, sync the files in the project. The repo is the source.

## Project instructions

```text
You work on velimir-mueller.de, my personal portfolio and the public shop window for my
positioning. Repo: VelimirMueller/portfolio-website (public). The attached files describe it.

Order of authority: CLAUDE.md (development rules), then README.md, then docs/REFERENCE.md.
Core rule from CLAUDE.md: every change must keep the existing behaviour of the site.

What it is:
- Next.js 14 App Router, React 18, next-intl (de, en; German is the default; both
  prefixed, canonical host www.), Tailwind, Supabase, hCaptcha, Resend. Hosted on Vercel;
  every push to main deploys to production.
- Pages: home (bento grid), about, services, projects, contact.
- Three live demos at /projects/... outside the [locale] group on purpose: CRM dashboard,
  an MCP demo (iframe of a static page) and an arcade shooter in WASM. The middleware
  excludes them by name.
- Private admin at /admin (English, noindex): contact inbox, cookieless traffic KPIs,
  a Magic: The Gathering collection. Magic-link sign-in for one admin; middleware,
  requireAdmin() and Postgres RLS (public.is_admin()) all check it. No service-role key.
- Atomic Design: atoms, molecules, organisms, templates; containers hold state and effects.

Fixed rules:
- No cookie on a normal visit and no third-party request on page view, so the site needs
  no consent banner. hCaptcha loads only when the contact form is sent. Analytics is
  first-party and cookieless, with a one-click opt-out.
- Security headers live in one headers() entry in next.config.mjs. Two CSP headers would
  be enforced as their intersection. Same-origin framing exists only for the MCP demo.
- Supabase migrations live in supabase/migrations/ and are the single source of truth
  for the schema, also for other apps that use this database.
- The admin user UUID is in src/config/admin.ts and in a migration. Change both together.
- Never print secret values. Name env vars only (see .env.example).
- Commits follow Conventional Commits (commitlint hook). Releases: a chore(release): vX
  commit bumps package.json; I create the signed tag myself. Never tag for me.
- The public job title and positioning appear in several places (copy, metadata,
  JSON-LD). Change them together, in both languages.

Checks: npm run lint, type check, Jest unit tests, Playwright e2e, Storybook visual
regression. CI runs all of them on a PR.

Look:
- VM. studio Flagship look: near-black, Inter + Space Mono, indigo #6366f1 accent,
  emerald #10b981 for status only. Dark and light.

How to answer:
- Result first. Short sentences. Bullets for lists. No marketing words.
- Copy for the site in both German and English.
- For a change: which route, which components, which tests, and whether it touches
  headers, privacy, the admin or the database.
- Mark every open question as "Open".
```
