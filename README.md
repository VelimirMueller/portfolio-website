<div align="center">

# velimir-portfolio

**Senior Frontend Engineer / Product Engineer**

Personal portfolio and service platform showcasing end-to-end product engineering — from requirements analysis and UX/UI design through frontend development to automated deployment.

[![Live Site](https://img.shields.io/badge/Live-velimir--mueller.com-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://velimir-mueller.com)
[![CI](https://img.shields.io/github/actions/workflow/status/VelimirMueller/portfolio-website/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=white)](https://github.com/VelimirMueller/portfolio-website/actions)

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat-square&logo=storybook&logoColor=white)

</div>

---

## Table of Contents

- [Stack](#stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Testing](#testing)
- [Storybook](#storybook)
- [CI / CD](#ci--cd)
- [Pages](#pages)
- [Design](#design)
- [Deployment](#deployment)

---

## Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Deployment | Vercel |
| Testing | Jest · React Testing Library · Playwright |
| AI Tooling | Claude AI |

---

## Architecture

The project follows **Atomic Design** with a clear separation between presentational and container components:

```
src/
├── app/
│   ├── (main)/
│   │   ├── page.tsx              # Bento grid homepage
│   │   ├── about/page.tsx        # Profile, skills, experience timeline
│   │   ├── services/page.tsx     # End-to-end service offerings
│   │   ├── projects/page.tsx     # Work & interactive demos
│   │   └── contact/page.tsx      # Contact form & social links
│   └── projects/
│       └── dashboard-demo/       # Live CRM dashboard demo
├── components/
│   ├── atoms/                    # Button, Input, Icon, Typography
│   ├── molecules/                # BentoCard, SectionHeader, SearchBar
│   ├── organisms/                # NavigationBar, LoginForm
│   └── templates/                # Page layouts
├── containers/                   # Smart components (state, side effects, API)
├── utils/
│   └── supabase/
│       ├── server.ts             # SSR Supabase client
│       └── client.ts             # CSR Supabase client
├── hooks/
└── types/
```

> **Presentational components** receive data via props, contain no business logic, and are easy to test.
> **Container components** manage state, handle side effects, and pass data down.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/VelimirMueller/velimir-portfolio.git
cd velimir-portfolio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# → Add your Supabase URL and anon key to .env.local

# Start the dev server
npm run dev
```

Open **[localhost:3000](http://localhost:3000)** to view the app.

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint check |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with coverage report |
| `npm run type-check` | TypeScript type check (no emit) |
| `npm run storybook` | Start Storybook on port 6006 |
| `npm run build-storybook` | Build static Storybook site |
| `npm run test:visual` | Playwright visual regression tests |
| `npm run test:e2e` | Playwright E2E tests |

---

## Testing

### Unit & Integration Tests

Jest with React Testing Library for component and utility testing.

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Generate coverage report
```

### Visual Regression Tests

Playwright screenshots every Storybook story and compares against baselines.

```bash
npm run test:visual -- --update-snapshots   # Generate baselines
npm run test:visual                          # Run comparison
```

> Config: `playwright-storybook.config.ts` · Tests: `e2e/storybook-visual.spec.ts`

### End-to-End Tests

Full E2E tests using [Playwright](https://playwright.dev/) against the production build — covering navigation, theme/language toggle, contact form, service pages, project demos, and 404 handling.

```bash
npm run test:e2e                        # Run all E2E tests
npm run test:e2e -- --grep "Navigation" # Run specific tests
```

> Config: `playwright.config.ts` · Tests: `e2e/app.spec.ts`

---

## Storybook

Component library and visual documentation powered by [Storybook 8](https://storybook.js.org/).

```bash
npm run storybook   # → localhost:6006
```

Components are organized by Atomic Design:

- **Atoms** — Button, CodeBlock, LanguageToggle
- **Molecules** — BentoCard, SectionHeader
- **Organisms** — Navigation, Footer

Features include autodocs, controls panel, dark/light mode toolbar toggle, responsive viewport presets, and accessibility audit panel (a11y).

---

## CI / CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR to `main`:

| Job | Description |
| :--- | :--- |
| **Lint & Type Check** | ESLint + `tsc --noEmit` |
| **Unit Tests** | Jest with coverage |
| **Build** | Next.js production build |
| **Storybook Build** | Verifies all stories compile |
| **E2E Tests** | Playwright against production build |

---

## Pages

| Page | Highlights |
| :--- | :--- |
| **Home** | Bento grid layout, auto-rotating impact metrics, tech stack overview, service teaser |
| **About** | Professional summary, skills terminal (JSON-style), experience timeline (2017–present) |
| **Services** | Requirements Engineering, UX/UI & Branding, Frontend Dev, Project Planning, Modern Stack consulting |
| **Projects** | Interactive CRM dashboard demo (CSS/SVG charts, responsive sidebar, micro-interactions), case studies |
| **Contact** | Contact form, email, LinkedIn, GitHub links |

---

## Design

The UI follows a **monochrome + accent** design system with full dark mode support.

| Pattern | Detail |
| :--- | :--- |
| Layout | Bento grid with `rounded-[1.5rem]` cards |
| Typography | Monospace for labels and data |
| Backgrounds | Subtle grid backgrounds and blur gradients |
| Interactions | Hover micro-animations (translate, scale, color transitions) |
| Status | Green pulse indicators for availability |

---

## Deployment

Connected to **Vercel** via GitHub — every push to `main` triggers an automatic production deployment.

Required environment variables (configured in the Vercel dashboard):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
```

---

<div align="center">

**[velimir-mueller.com](https://velimir-mueller.com)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/velimir-m%C3%BCller-07b460175)
[![Email](https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:velimir.mueller@googlemail.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/VelimirMueller)

</div>
