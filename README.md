<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/banner/hero-v2-light.svg">
  <img alt="VM. / flagship. PORTFOLIO-WEBSITE. A CV that compiles. Next.js, Supabase, Vercel. Stable, v2.3.0." src="assets/banner/hero-v2-dark.svg" width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/lead-v2-light.svg">
  <img alt="The source of www.velimir-mueller.de (https://www.velimir-mueller.de): portfolio, services and live demos, plus a private admin. It sets no cookies. It still remembers your language, for the length of one URL." src="assets/readme/lead-v2-dark.svg" width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/stats-v2-light.svg">
  <img alt="0 COOKIES PER VISIT. 2 LOCALES. 3 LIVE DEMOS. 4 CI JOBS" src="assets/readme/stats-v2-dark.svg" width="100%">
</picture>
</p>

<br>

<p>
<img alt="01 WHAT IT DOES. A WEBSITE. ABOUT ME. BY ME." src="assets/readme/divider-what-v2.svg" width="100%">
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/features-v2-light.svg">
  <img alt="Portfolio: Bento home, about, services, projects and contact. German and English. Live demos: A CRM dashboard, an MCP demo and an arcade shooter in WASM. Private admin: Contact inbox, cookieless traffic KPIs and a Magic card collection" src="assets/readme/features-v2-dark.svg" width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/what-v2-light.svg">
  <img alt="End-to-end product engineering: Requirements, UX/UI, full-stack code, automated deployment. German and English: A visit sets no cookie, so the site needs no consent banner. Three live demos: A CRM dashboard, an MCP demo and an arcade shooter in WASM. One private admin: A private area at /admin: contact inbox, cookieless traffic KPIs and a Magic: The Gathering collection" src="assets/readme/what-v2-dark.svg" width="100%">
</picture>
</p>

<br>

<p>
<img alt="02 QUICK START. COPY. PASTE. PORT 3000." src="assets/readme/divider-start-v2.svg" width="100%">
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/start-v2-light.svg">
  <img alt="Terminal: $ git clone https://github.com/VelimirMueller/portfolio-website.git | $ cd portfolio-website &amp;&amp; npm install | $ cp .env.example .env.local | # add your Supabase URL and anon key | $ npm run dev" src="assets/readme/start-v2-dark.svg" width="100%">
</picture>
</p>

<details>
<summary><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-7-v2-light.svg"><img alt="Plain text" src="assets/readme/links-7-v2-dark.svg" width="32%"></picture></summary>

```bash
git clone https://github.com/VelimirMueller/portfolio-website.git
cd portfolio-website
npm install
cp .env.example .env.local   # add your Supabase URL and anon key
npm run dev
```

</details>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/devnotes-v2-light.svg">
  <img alt="Open localhost:3000: npm run dev serves the app on localhost:3000 (http://localhost:3000). CSP blocks eval under next dev: Client components (counters, keyboard shortcuts) do not hydrate locally. Check interactive behaviour with npm run build &amp;&amp; npm start" src="assets/readme/devnotes-v2-dark.svg" width="100%">
</picture>
</p>

<br>

<p>
<img alt="03 HOW IT WORKS. BOXES AND ARROWS, AS PROMISED." src="assets/readme/divider-how-v2.svg" width="100%">
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/flow-v2-light.svg">
  <img alt="BROWSER -&gt; NEXT.JS 14 -&gt; SUPABASE -&gt; VERCEL. Atomic Design: presentational components get props. Containers own state and side effects." src="assets/readme/flow-v2-dark.svg" width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/layers-v2-light.svg">
  <img alt="containers/ -&gt; props -&gt; components/" src="assets/readme/layers-v2-dark.svg" width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/how-v2-light.svg">
  <img alt="Stack: Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS, Supabase, Vercel. Tests: Jest, React Testing Library, Playwright. AI tooling: Claude AI. Design: Monochrome + accent, full dark mode. Bento grid with rounded-[1.5rem] cards, monospace labels and data, subtle grid backgrounds and blur gradients, hover micro-animations, green pulse indicators for availability. No cookies: next-intl runs with localeCookie: false. e2e/headers.spec.ts asserts that public pages set no cookie. hCaptcha loads only when the contact form is sent. Full source tree: The architecture and the page list are in docs/REFERENCE.md" src="assets/readme/how-v2-dark.svg" width="100%">
</picture>
</p>

<br>

<p>
<img alt="04 USAGE. TWELVE SCRIPTS. ALL OF THEM USED." src="assets/readme/divider-usage-v2.svg" width="100%">
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/scripts-v2-light.svg">
  <img alt="npm run dev: Start the development server. npm run build: Production build. npm run start: Serve the production build. npm run lint: ESLint check. npm run type-check: TypeScript type check (no emit). npm test: Jest unit tests. npm run test:watch: Jest in watch mode. npm run test:coverage: Coverage report. npm run storybook: Storybook on port 6006. npm run build-storybook: Static Storybook site. npm run test:visual: Playwright visual regression tests. -- --update-snapshots writes new baselines. npm run test:e2e: Playwright E2E tests. -- --grep &quot;Navigation&quot; runs one group" src="assets/readme/scripts-v2-dark.svg" width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/testing-v2-light.svg">
  <img alt="Unit and integration: Jest with React Testing Library. Visual regression: Playwright screenshots every Storybook story and compares it with the baseline. Config playwright-storybook.config.ts, tests e2e/storybook-visual.spec.ts. End-to-end: Playwright (https://playwright.dev/) against the production build: navigation, theme/language toggle, contact form, service pages, project demos and 404 handling. Config playwright.config.ts, tests e2e/app.spec.ts. Storybook 8: Storybook (https://storybook.js.org/) is the component library and the visual documentation, on localhost:6006. Stories: Atoms: Button, CodeBlock, LanguageToggle. Molecules: BentoCard, SectionHeader. Organisms: Navigation, Footer. Addons: Autodocs, controls panel, dark/light toolbar toggle, responsive viewport presets, accessibility (a11y) audit panel" src="assets/readme/testing-v2-dark.svg" width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/commits-v2-light.svg">
  <img alt="Terminal: # Conventional Commits. husky commit-msg runs commitlint; npm install sets it up. | type(scope?): subject |  | feat(contact): add honeypot field | fix(theme): honor system light preference | chore(release): v2.0.0 | # types: feat fix chore docs test refactor perf ci" src="assets/readme/commits-v2-dark.svg" width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/admin-v2-light.svg">
  <img alt="Private area at /admin since v2.0.0: Contact inbox, traffic KPIs (v2.1.0), Magic (v2.2.0). English only, noindex, disallowed in robots.txt. Access: Supabase Auth magic link for one admin user. Middleware, requireAdmin() and Postgres RLS via public.is_admin() check it. No service-role key. Admin UUID: Lives in src/config/admin.ts and in the migration. Change both together. Migrations: In supabase/migrations/. Apply them in the Supabase SQL editor. Secrets: Analytics needs ANALYTICS_INGEST_SECRET in Vercel. The Magic catalog loader needs SUPABASE_DB_URL. Everything else: Every table, setup step, keyboard shortcut and Supabase Auth setting is in docs/REFERENCE.md" src="assets/readme/admin-v2-dark.svg" width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/deploy-v2-light.svg">
  <img alt="NEXT_PUBLIC_SUPABASE_URL: Required. Set in the Vercel dashboard. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: Required. Set in the Vercel dashboard. NEXT_PUBLIC_HCAPTCHA_SITEKEY: Contact form captcha (public key). HCAPTCHA_SECRET: Contact form captcha check. ANALYTICS_INGEST_SECRET: Optional. Analytics ingest. Other optional names: .env.example. Edge Function secrets: supabase/functions/.env.example" src="assets/readme/deploy-v2-dark.svg" width="100%">
</picture>
</p>

<p align="center">
<a href="https://playwright.dev/"><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-8-v2-light.svg"><img alt="Playwright (https://playwright.dev/)" src="assets/readme/links-8-v2-dark.svg" width="32%"></picture></a>
<a href="https://storybook.js.org/"><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-9-v2-light.svg"><img alt="Storybook (https://storybook.js.org/)" src="assets/readme/links-9-v2-dark.svg" width="32%"></picture></a>
<a href="https://www.conventionalcommits.org/"><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-10-v2-light.svg"><img alt="Conv. Commits (https://www.conventionalcommits.org/)" src="assets/readme/links-10-v2-dark.svg" width="32%"></picture></a>
</p>

<details>
<summary><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-7-v2-light.svg"><img alt="Plain text" src="assets/readme/links-7-v2-dark.svg" width="32%"></picture></summary>

```bash
npm test                                      # all unit tests
npm run test:visual -- --update-snapshots     # new visual baselines
npm run test:e2e -- --grep "Navigation"       # one E2E group
npm run storybook                             # localhost:6006
```

```text
type(scope?): subject

feat(contact): add honeypot field
fix(theme): honor system light preference
chore(release): v2.0.0
```

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
```

</details>

<br>

<p>
<img alt="05 STATUS. LIVE. CHECKED ON EVERY PUSH." src="assets/readme/divider-status-v2.svg" width="100%">
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/status-v2-light.svg">
  <img alt="Public site, DE + EN: live. Live demos: live. Admin inbox + traffic KPIs: live. Magic pool, decks, wishlist: live. Scanner card match: tuning. Lint, unit, build, visual, E2E: on every push" src="assets/readme/status-v2-dark.svg" width="100%">
</picture>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/ci-v2-light.svg">
  <img alt="GitHub Actions: .github/workflows/ci.yml runs on every push and PR to main. Jobs: Lint &amp; type check (ESLint + tsc --noEmit), unit tests with coverage + Next.js build, Storybook build + visual regression, E2E against the production build. Same checks locally: npm run lint &amp;&amp; npm run type-check &amp;&amp; npm test &amp;&amp; npm run test:e2e" src="assets/readme/ci-v2-dark.svg" width="100%">
</picture>
</p>

<p align="center">
<a href="docs/REFERENCE.md"><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-1-v2-light.svg"><img alt="Reference (docs/REFERENCE.md)" src="assets/readme/links-1-v2-dark.svg" width="32%"></picture></a>
<a href="https://github.com/VelimirMueller/portfolio-website/actions"><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-2-v2-light.svg"><img alt="CI runs (https://github.com/VelimirMueller/portfolio-website/actions)" src="assets/readme/links-2-v2-dark.svg" width="32%"></picture></a>
<a href="https://www.velimir-mueller.de"><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-3-v2-light.svg"><img alt="Live site (https://www.velimir-mueller.de)" src="assets/readme/links-3-v2-dark.svg" width="32%"></picture></a>
</p>

<p align="center">
<a href="https://www.linkedin.com/in/velimir-m%C3%BCller-07b460175"><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-4-v2-light.svg"><img alt="LinkedIn (https://www.linkedin.com/in/velimir-m%C3%BCller-07b460175)" src="assets/readme/links-4-v2-dark.svg" width="32%"></picture></a>
<a href="mailto:velimir.mueller@googlemail.com"><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-5-v2-light.svg"><img alt="Email (mailto:velimir.mueller@googlemail.com)" src="assets/readme/links-5-v2-dark.svg" width="32%"></picture></a>
<a href="https://github.com/VelimirMueller"><picture><source media="(prefers-color-scheme: light)" srcset="assets/readme/links-6-v2-light.svg"><img alt="GitHub (https://github.com/VelimirMueller)" src="assets/readme/links-6-v2-dark.svg" width="32%"></picture></a>
</p>

<p>
<picture>
  <source media="(prefers-color-scheme: light)" srcset="assets/readme/footer-v2-light.svg">
  <img alt="VM. studio / flagship · source available, all rights reserved · look per vm-brand playbook · -- EOF -- no cookies were set --" src="assets/readme/footer-v2-dark.svg" width="100%">
</picture>
</p>
