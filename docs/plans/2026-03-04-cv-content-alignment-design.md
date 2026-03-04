# CV Content Alignment & Video Replacement Design

**Date:** 2026-03-04
**Status:** Approved

## Goal

Align all website text content with Velimir's current CV/LinkedIn profile. Replace the dashboard promo video with a highlight statement card. No visual/UI changes except the video replacement.

## Decisions

- **Positioning:** "Senior Product Engineer" as primary title (replaces "Senior Frontend Engineer")
- **Experience entries:** Add cimdata + Servicezentrum internship (skip earlier non-tech entries)
- **Video replacement:** Bold highlight statement about ML achievement, reusing existing card/typography styles
- **Scope:** Text-only changes in EN + DE translation files, plus video component swap. No layout/style changes.

## Changes by Section

### 1. Positioning & Title Updates

All "Senior Frontend Engineer" instances become "Senior Product Engineer":

| Translation Key | Current | New |
|---|---|---|
| `home.subtitle` | Senior Frontend Engineer | Senior Product Engineer |
| `home.subtitleSecondary` | Product Engineer | Full-Stack · ML · Infrastructure |
| `home.personRole` | Frontend Engineer | Product Engineer |
| `footer.tagline` | Senior Frontend Engineer. | Senior Product Engineer. |
| `footer.taglineSecondary` | Product Engineer. | Full-Stack · ML · Infrastructure. |
| `about.bio1Bold` | Senior Frontend Engineer & Product Engineer | Senior Product Engineer |

Homepage description, footer taglineDesc, and contact intro shift from frontend-first to full-stack lifecycle ownership language.

### 2. About Page Bio & Stats

Bio paragraphs rewritten to match CV summary: product engineer who ships end-to-end, 9 years from frontend specialist to full lifecycle owner (Figma > React > AWS/Azure > Terraform), ML model projecting 100% conversion lift.

Skills terminal updated:
- `"frontend"`: Next.js, React, Vue, TypeScript, Tailwind
- `"backend"`: Laravel/PHP, Supabase, Ruby on Rails
- `"infrastructure"`: AWS, Azure, Terraform, Docker, Vercel, CI/CD
- `"process"`: Requirements Engineering, UX/UI, Figma, Claude AI
- `"ml"`: Data Analysis, Model Development, Python

Stats remain unchanged (9+, E2E, UX).

### 3. Experience Entry Updates

**GALVANY** (text update):
- Title: "Senior Software Engineer - Frontend / Product"
- Description: Lead management platform (Laravel, React, TypeScript, Inertia, Terraform), 3-4x faster assignment, ML conversion model (100% lift), Figma design systems, AWS/Azure infra, Docker, full testing pyramid

**DEMOS** (text update):
- Description enriched: architecture patterns for Vue 2/3, state management (Vuex, Pinia), interactive maps (OpenLayers), mentoring/training, TDD sessions

**Freelance** (minor text alignment to CV wording)

**Zalando** (stays as-is)

**NEW: cimdata Bildungsakademie GmbH**
- Title: IT-Trainee - Application Development
- Tag: IT Training (IHK)
- Date: Apr 2019 - Jun 2021
- Description: IHK-certified IT Specialist, 10-month internship included

**NEW: Servicezentrum der Berliner Volkshochschulen**
- Title: Internship Program
- Tag: Public Sector IT
- Date: Aug 2020 - May 2021
- Description: Linux infrastructure, IT-security, Ruby on Rails + React, warehouse management

### 4. Video Replacement

Replace `DashboardPromoVideo` component with a highlight statement card:
- Same grid position and dimensions
- Bold typography: ML model achievement statement
- Uses existing AnimateIn + BentoCard patterns
- No new visual components
- Remove `/dashboard-promo.mp4` reference

### 5. Services & Contact Updates

Services page: Shift from "frontend" to "product engineering" framing. Add backend (Laravel, Supabase), infrastructure (AWS, Azure, Terraform), and ML mentions.

Contact intro: Update to full-stack product engineering availability.

## What Does NOT Change

- All UI layouts, colors, spacing, animations
- Navigation structure
- Projects page content
- Imprint and privacy pages
- Component architecture

## Files Affected

- `src/locales/en.json` — all English text
- `src/locales/de.json` — all German text
- `src/app/(main)/page.tsx` — video component swap
- `src/app/(main)/about/page.tsx` — new experience entries (if hardcoded structure)
