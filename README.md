```
velimir-portfolio
=================
Senior Frontend Engineer / Product Engineer -- Portfolio & Services
```

<br>

Personal portfolio and service platform for **Velimir Mueller**, built to showcase end-to-end product engineering: from requirements analysis and UX/UI design through frontend development to automated deployment.

**Live:** [velimir-mueller.com](https://velimir-mueller.com)

<br>

---

<br>

## Stack

| Layer | Technology |
|:------|:-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Deployment | Vercel |
| Testing | Jest + React Testing Library + Playwright |
| AI Tooling | Claude AI |

<br>

## Architecture

The project follows **Atomic Design** with a clear separation between presentational and container components:

```
src/
  app/
    (main)/
      page.tsx             # Bento grid homepage
      about/page.tsx       # Profile, skills, experience timeline
      services/page.tsx    # End-to-end service offerings
      projects/page.tsx    # Work & interactive demos
      contact/page.tsx     # Contact form & social links
    projects/
      dashboard-demo/      # Live CRM dashboard demo
  components/
    atoms/                 # Button, Input, Icon, Typography
    molecules/             # BentoCard, SectionHeader, SearchBar
    organisms/             # NavigationBar, LoginForm
    templates/             # Page layouts
  containers/              # Smart components (state, side effects, API)
  utils/
    supabase/
      server.ts            # SSR Supabase client
      client.ts            # CSR Supabase client
  hooks/
  types/
```

**Presentational components** receive data via props, contain no business logic, and are easy to test.
**Container components** manage state, handle side effects, and pass data down.

<br>

## Getting started

```bash
# Clone
git clone https://github.com/VelimirMueller/velimir-portfolio.git
cd velimir-portfolio

# Install
npm install

# Environment
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local

# Dev server
npm run dev
```

Open [localhost:3000](http://localhost:3000).

<br>

## Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint check |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with coverage report |
| `npm run type-check` | TypeScript type check (no emit) |
| `npm run storybook` | Start Storybook dev server on port 6006 |
| `npm run build-storybook` | Build static Storybook site |
| `npm run test:visual` | Run Playwright visual regression tests against Storybook |
| `npm run test:e2e` | Run Playwright E2E tests against the app |

<br>

## Storybook

Component library and visual documentation using [Storybook 8](https://storybook.js.org/).

```bash
npm run storybook
```

Open [localhost:6006](http://localhost:6006). Components are organized by Atomic Design:

- **Atoms** -- Button, CodeBlock, LanguageToggle
- **Molecules** -- BentoCard, SectionHeader
- **Organisms** -- Navigation, Footer

Features: autodocs, controls panel, dark/light mode toolbar toggle, responsive viewport presets, accessibility audit panel (a11y).

### Visual Regression Testing

Uses Playwright to screenshot every Storybook story and compare against baselines.

```bash
# Generate baseline screenshots (first run)
npm run test:visual -- --update-snapshots

# Run regression comparison
npm run test:visual
```

Config: `playwright-storybook.config.ts` | Tests: `e2e/storybook-visual.spec.ts`

<br>

## E2E Testing

End-to-end tests using [Playwright](https://playwright.dev/) against the production build. Covers all pages, navigation, theme/language toggle, contact form, service detail pages, project demos, and 404 handling.

```bash
# Run all E2E tests (builds app automatically)
npm run test:e2e

# Run specific test file
npm run test:e2e -- --grep "Navigation"
```

Config: `playwright.config.ts` | Tests: `e2e/app.spec.ts`

<br>

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR to `main`:

| Job | What it does |
|:----|:-------------|
| **Lint & Type Check** | ESLint + `tsc --noEmit` |
| **Unit Tests** | Jest with coverage |
| **Build** | Next.js production build |
| **Storybook Build** | Verifies all stories compile |
| **E2E Tests** | Playwright against production build (after Build passes) |

<br>

## Pages

**Home** -- Bento grid layout with impact metrics (auto-rotating), tech stack overview, personal quote, and service teaser.

**About** -- Professional summary, skills terminal (JSON-style), and experience timeline (2017 - present).

**Services** -- End-to-end offering: Requirements Engineering, UX/UI & Branding, Frontend Development, Project Planning & Delivery, Modern Stack consulting.

**Projects** -- Featured interactive CRM dashboard demo (CSS/SVG only charts, responsive sidebar, micro-interactions), enterprise workflow case study, SaaS platform & brand identity case study.

**Contact** -- Contact form, email, LinkedIn, and GitHub links.

<br>

## Design

The UI follows a **monochrome + accent** design system with full dark mode support. Key patterns:

- Bento grid layouts with `rounded-[1.5rem]` cards
- Monospace typography for labels and data
- Subtle grid backgrounds and blur gradients
- Micro-interactions on hover (translate, scale, color transitions)
- Green pulse indicators for status/availability

<br>

## Deployment

Connected to **Vercel** via GitHub. Environment variables configured in the Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
```

Every push to `main` triggers an automatic production deployment.

<br>

---

<p align="center">
  <a href="https://www.linkedin.com/in/velimir-m%C3%BCller-07b460175">LinkedIn</a>&ensp;&middot;&ensp;
  <a href="mailto:velimir.mueller@googlemail.com">Email</a>&ensp;&middot;&ensp;
  <a href="https://github.com/VelimirMueller">GitHub</a>
</p>
