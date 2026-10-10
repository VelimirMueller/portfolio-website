# Reference

The long parts of the README live here: the source tree, the pages and the private admin.
Back to the [README](../README.md).

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

## Pages

| Page | Highlights |
| :--- | :--- |
| **Home** | Bento grid layout, auto-rotating impact metrics, tech stack overview, service teaser |
| **About** | Professional summary, skills terminal (JSON-style), experience timeline (2017–present) |
| **Services** | Requirements Engineering, UX/UI & Branding, Frontend Dev, Project Planning, Modern Stack consulting |
| **Projects** | Interactive CRM dashboard demo (CSS/SVG charts, responsive sidebar, micro-interactions), case studies |
| **Contact** | Contact form, email, LinkedIn, GitHub links |
| **Admin** (`/admin`, private) | Contact inbox and KPIs — see [Admin (v2)](#admin-v2) |


## Admin (v2)

A private area at `/admin`, introduced in **v2.0.0** (traffic KPIs since **v2.1.0**, Magic since **v2.2.0**), in the same visual language as the CRM demo. English-only, outside `[locale]`, `noindex` and disallowed in `robots.txt`.

| Section | What it does |
| :--- | :--- |
| **Inbox** | Mail-client split view for contact-form messages: status tabs (unread / read / archived / spam / all), search, hover quick actions, multi-select bulk bar, auto-advance, keyboard shortcuts (`j`/`k` · `e` · `s` · `u` · `r` · `x` · `/` · `Esc`) |
| **Magic** | Velimir's Magic: The Gathering cards. **Pool**: every owned card with Scryfall image, exact text, copies (± in place), German copies, notes; search plus color and type filters. **Decks**: every deck with how much of it you own; per deck the main deck, sideboard and upgrade path, each card marked owned / buy N against the pool, a priced list of what is still to buy, and warnings when the plan is off (card count, off-color cards). **Wishlist**: cards you want but do not own yet, with copies (± in place), notes and *Got it*, which moves them into the pool. **Add card**: search the catalog of every paper card ever printed (Scryfall) and add copies to the pool (*Own it*) or to the wishlist (*Want it*) |
| **KPIs** | One section per data source. **Traffic** (v2.1.0) first: live visitors, visitors / page views / clicks / bounce rate / session length with trends, time series with previous-period comparison, weekday × hour heatmap, top pages, sources and audience (click any row to filter), a flow explorer (came from → page → went to, walkable page by page) and a click leaderboard. Range, filters, metric and flow focus live in the URL. Keyboard: `1`–`4` range · `v`/`p`/`c` metric · `r` refresh · `⌫` drop newest filter · `⌘K` command palette. Then **Messages** — 30-day volume and trend, unread, spam rate, messages per day, status breakdown, busiest weekdays (Europe/Berlin) |

**Access.** Supabase Auth magic link for a single admin user (sign-ups off, `shouldCreateUser: false`). Three layers check the admin: middleware, `requireAdmin()` in every page and server action, and Postgres RLS via `public.is_admin()`. The admin's user UUID lives in `src/config/admin.ts` **and** in the migration — change both together. No service-role key is used.

**Database.** `supabase/migrations/` versions the `contact_messages` table, its `status` column and the RLS policies. Apply new migrations in the Supabase SQL editor.

**Supabase Auth settings** (dashboard, not in the repo): Site URL `https://www.velimir-mueller.de`; redirect URLs `https://www.velimir-mueller.de/admin/auth/callback` and `http://localhost:3000/admin/auth/callback`; custom SMTP via Resend for the login mails.

**Analytics (v2.1.0).** First-party and cookieless, replacing Vercel Web Analytics (Speed Insights stays). The client sends a beacon per page view (with the previous page) and per click to `/api/collect`; clicks are labelled by `data-track`, then link target, then button name — form fields are never read. The database stores no IP: a visitor is `sha256(daily salt + IP + user agent)`, computed inside `record_analytics_event()`, and the salt rotates every UTC day. Raw events are kept 90 days. Bots, Do Not Track / Global Privacy Control and the signed-in admin are not counted. The privacy policy (section 8) describes exactly this — change both together.

Setup after applying `20261002120000_analytics_events.sql`:

1. Generate a secret: `openssl rand -hex 32`.
2. In the Supabase SQL editor: `insert into analytics_private.ingest_secret (secret_sha256) values (encode(extensions.digest('<secret>', 'sha256'), 'hex'));`
3. In Vercel: `ANALYTICS_INGEST_SECRET=<secret>` (Production), then redeploy. Without it `/api/collect` answers 204 and stores nothing.

**Magic.** Admin-only tables (RLS via `is_admin()`):

| Table | Holds |
| :--- | :--- |
| `mtg_catalog` | Every paper card from Scryfall's *Oracle Cards* bulk file (~33k rows; image URLs, no images) |
| `mtg_collection` | The pool: one row per owned card → `mtg_catalog`, with copies, German copies, German name, note |
| `mtg_wishlist` | Cards wanted but not owned: one row per card → `mtg_catalog`, with copies and note |
| `mtg_deck`, `mtg_deck_card` | Decks; each card row is in `main`, `sideboard` or `upgrade` → `mtg_catalog`, with a planned price per copy |
| `mtg_image_cache` | Card images, stored on first view |
| `mtg_printing`, `mtg_card_name` | Set + collector number → card, and German printed names (for the MTG Scanner app) |

Card text and images always come from the catalog, so a catalog refresh updates the pool and decks too. Writes go through SQL functions (`mtg_add_to_pool`, `mtg_change_qty`, `mtg_add_many`; for the wishlist `mtg_add_to_wishlist`, `mtg_change_wish_qty` and `mtg_wish_to_pool`, which moves a wish into the pool in one transaction); the add form (and the app) searches with `mtg_search_catalog`; `mtg_match_scan` turns OCR readings from the scanner app into cards (printing → exact English or German name → fuzzy). Deck ownership comes from the view `mtg_deck_ownership`, which web and app share. Names are compared through `mtg_norm()`, the same normalisation as the app's `LineFilter.normalize()`. **Search covers English, German and French**: the catalog search and the pool search match the English name and every printed name in `mtg_card_name`, ignoring case and accents ("starke des stiers" finds *Stärke des Stiers*, "ile" finds *Île*). SQL tests: `supabase/tests/magic_scan_test.sql`, `supabase/tests/magic_search_test.sql`, `supabase/tests/magic_wishlist_test.sql`. Images are same-origin: `/admin/magic/img/<size>/<face>/…` serves them from `mtg_image_cache` and fetches from Scryfall's CDN only on the first view of each image (then the browser keeps it a year). No third-party image host in the CSP. Code: queries in `src/app/admin/_lib/magic/queries.ts`, pure logic next to it (`pool.ts`, `deck.ts`, `cards.ts`), UI in `src/app/admin/_components/magic/`.

Setup on a new database, in this order:

1. Apply `20261008120000_magic.sql`, `20261008120100_magic_seed.sql`, `20261008130000_magic_image_cache.sql`.
2. Load the catalog:
   ```bash
   node scripts/mtg/build-catalog.mjs /tmp/mtg-catalog.csv
   psql "$SUPABASE_DB_URL" -v csv=/tmp/mtg-catalog.csv -f scripts/mtg/load-catalog.sql
   ```
   `SUPABASE_DB_URL` is the session-pooler connection string from the Supabase dashboard (*Connect*). Run the same two commands any time to refresh the catalog (Scryfall updates daily); it refuses a CSV under 98% of the current catalog and keeps cards the pool or a deck uses.
3. Apply `20261008150000_magic_v2.sql`. It needs the catalog: it links the seeded pool to it and seeds the deck *Stapelbruch*.
4. Apply `20261009120000_magic_scan.sql`, then load printings and German names (also the refresh, after new sets):
   ```bash
   node scripts/mtg/build-printings.mjs /tmp/mtg-printings.csv /tmp/mtg-names.csv
   psql "$SUPABASE_DB_URL" -v printings=/tmp/mtg-printings.csv -v names=/tmp/mtg-names.csv -f scripts/mtg/load-printings.sql
   ```
   The first command streams Scryfall's *All Cards* file (~400 MB, 1–10 minutes depending on the connection). The load refuses a CSV under 98 % of the current tables.
5. Apply `20261009150000_magic_wishlist.sql` (the wishlist; additive, leaves the pool and decks unchanged).
6. Apply `20261009200000_search_three_languages.sql` (catalog search over English, German and French names; replaces `mtg_search_catalog`, same signature).

**No cookies on a visit.** `next-intl` runs with `localeCookie: false`, and `e2e/headers.spec.ts` asserts that public pages set no cookie — the reason the site needs no consent banner. hCaptcha loads only when the contact form is sent.

**Local note.** Under `next dev` the CSP blocks `eval`, so client components (counters, keyboard shortcuts) do not hydrate locally. Check interactive behaviour against `npm run build && npm start`.

## Design

The UI follows a **monochrome + accent** design system with full dark mode support.

| Pattern | Detail |
| :--- | :--- |
| Layout | Bento grid with `rounded-[1.5rem]` cards |
| Typography | Monospace for labels and data |
| Backgrounds | Subtle grid backgrounds and blur gradients |
| Interactions | Hover micro-animations (translate, scale, color transitions) |
| Status | Green pulse indicators for availability |
