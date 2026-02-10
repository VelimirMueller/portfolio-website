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
