# Design system

The Figma file mirrors the live site. It is the base for the full UI rebuild (#83).

- Figma: <https://www.figma.com/design/6QGVjgjKuloaT3QDBAM7Yx>
- Source in this repo: `.figma/` (a [vfb](https://github.com/VelimirMueller/vm-figma-builder) pack, id `website`).
- Plan: Figma Starter. Limits: 3 pages, 1 variable mode. Dark and light are separate variables (`dark/*`, `light/*`).

## Rebuild the file

1. Run the local checks. Both must pass:
   ```sh
   vfb check website
   vfb test website --strict
   ```
2. Bundle the plugin and start the art server:
   ```sh
   vfb build
   vfb up
   ```
3. In Figma desktop, open the file and run **Plugins → Development → VM Design Builder**.
4. Click **Sync tokens**. This creates or updates the variables, text styles and effect styles. It never deletes.
5. Click **Build**. This rebuilds every section. To rebuild one section, pick it in the panel.
6. Read the result in `.figma/out/report.json` and `.figma/out/shots/` (`vfb report website --open`).
7. Stop the art server: `vfb down`.

## Pack layout

| Path | Content |
|---|---|
| `.figma/pack.json` | Pack id, file match, pages, fonts, quality gate (85 % token and text-style coverage) |
| `.figma/tokens.json` | Variables, text styles, effect styles. Names match the Figma file |
| `.figma/sections/00-kit.js` | Shared helpers: bound paints, text styles, layout, component sets, instances, icons |
| `.figma/sections/19-templates-kit.js` | Template helpers: page frame, nav and footer slots, admin shell |
| `.figma/sections/NN-*.js` | One section per file. Files run in name order |
| `.figma/art/` | Art for image fills. `art/light/` holds the light-mode renders |

## Pages and sections

Section names are identities. Do not rename a section; the plugin finds it by name.

### 00 · Foundations

| Section | Content |
|---|---|
| 00 · Cover | Purpose, status, pages, studio projects, three rules |
| 01 · Colour | Semantic roles (dark and light), brand scale, status and group colours, primitives, drift |
| 02 · Type | Space Mono and Inter, all 25 text styles |
| 03 · Space, Radius & Grid | Spacing, radius, sizes, grids (1440 / 768 / 390), page rhythm |
| 04 · Effects & Imagery | 12 effect styles, dark and light art pairs, light-mode rule, all art |
| 05 · Code issues | Drift between code and tokens (F-1 to F-6) |
| 06 · Iconography | `Icon` set (42 lucide-style icons × Mode), sizes, colours |
| 07 · Motion | Durations, easings, named animations |

### 10 · Components

Every component is a component set with `Mode=Dark|Light`, plus state and size where they apply.

| Section | Component sets |
|---|---|
| 10 · Actions | Button (Kind × Size × State), Icon Button, Link |
| 11 · Navigation | Nav Bar, Mobile Header, Mobile Menu, Nav Dropdown, Footer, Breadcrumbs, Tab, Tab Bar, Pagination |
| 12 · Cards | Section Header, Bento Card, Project Card, Build Card, Service Card, Quote Card, Stat, Badge, Tag, Avatar, Timeline Item, Terminal Chip |
| 13 · Forms | Input, Textarea, Select, Search, Field, Contact Form |
| 14 · Controls | Checkbox, Radio, Switch, Toggle Button |
| 15 · Admin | Admin Sidebar, Admin Header, Inbox Row, Message Pane, KPI Card, Login Card, Card Tile, Deck Card, Quantity Stepper, Kbd |
| 16 · Feedback | Alert, Toast, Modal, Tooltip, Skeleton, Empty State, Progress |
| 17 · Data | Table Row, Table, Accordion |

### 20 · Templates

One section per live route in `src/app`. Each shows desktop 1440 and mobile 390. Dark comes first. Public routes also show light. Admin and demos are dark only, as in code.

| Section | Route |
|---|---|
| 20 · Home | `/` |
| 21 · About | `/about` |
| 22 · Services | `/services` |
| 23 · Projects | `/projects` |
| 24 · Contact | `/contact` |
| 25 · Admin inbox | `/admin` |
| 26 · Service detail | `/services/[serviceId]` |
| 27 · Imprint | `/imprint` |
| 28 · Privacy | `/privacy` |
| 29 · Demo dashboard | `/projects/dashboard-demo` |
| 30 · Demo MCP | `/projects/mcp-demo` |
| 31 · Admin login | `/admin/login` |
| 32 · Admin message | `/admin/[id]` (redirects to the inbox with the message open) |
| 33 · Admin KPIs | `/admin/kpis` |
| 34 · Magic pool | `/admin/magic` |
| 35 · Magic add | `/admin/magic/add` |
| 36 · Magic decks | `/admin/magic/decks` |
| 37 · Magic deck | `/admin/magic/decks/[slug]` |
| 38 · Magic new deck | `/admin/magic/decks/new` |
| 39 · Magic wishlist | `/admin/magic/wishlist` |

## Tokens

| Collection | Count | Content |
|---|---|---|
| `primitive` | 47 | Raw colours. Hidden from the pickers. Includes `legacy/*` drift values for documentation only |
| `color` | 84 | Semantic roles `dark/*` and `light/*`, `brand/*`, `status/*`, `group/*` |
| `space` | 43 | Spacing, radius, stroke, sizes, grid, opacity |
| `motion` | 11 | Durations, distances, scales, easings |

- Text styles: 25. Effect styles: 12.
- Each variable has scopes, a description and WEB code syntax (the Tailwind class or `theme()` path).
- Use the semantic roles in new UI. Do not use primitives directly.

### Token sources

| Token group | Source |
|---|---|
| `dark/*`, `light/*` base roles, `brand/*` | `tailwind.config.ts` (`colors.dark`, `colors.light`, `colors.brand`) |
| Body colours, scrollbar, card hover shadow | `src/app/globals.css` |
| Button, input, nav, card states | `src/components/atoms/Button.tsx`, `src/components/molecules/*`, `src/components/organisms/*`, `ContactContent.tsx` |
| Admin roles | `src/app/admin/_components/*` (mapped from drift greys, see F-3) |
| Fonts and text styles | `tailwind.config.ts` `fontFamily` and the type classes in `src/` |
| Radius, spacing, grid | Tailwind defaults and the classes in `src/` (`rounded-[1.5rem]`, `max-w-7xl`, `gap-4`) |
| Motion | `tailwind.config.ts` `animation` and `keyframes`, `globals.css` |
| Group colours | `vm-brand` `brand.json` (flagship, lab, ops, venture) |

## Change rules

- Change a value in code first. Then update `.figma/tokens.json` and run **Sync tokens**.
- Bind every colour to a variable (`K.c('<var>')`). Use a text style for every text (`K.t(str, '<style>', '<var>')`).
- Keep `vfb test website --strict` green before a commit.
- Fix drift in code, not in Figma. Section `05 · Code issues` lists it.
