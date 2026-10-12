# Reference

The long parts of the README live here: the source tree, the routes, the private admin and the database.
Development rules are in [CLAUDE.md](../CLAUDE.md). Back to the [README](../README.md).

## Source tree

Generated from the repository (`find src -type f`), without tests (`__tests__/`, `*.test.tsx`) and stories (`*.stories.tsx`).

```
src/
├── middleware.ts                   # /admin: session + admin check; everything else: next-intl
├── app/
│   ├── globals.css
│   ├── seo.ts                      # Localized metadata (Open Graph, Twitter, hreflang)
│   ├── shared-layout.ts            # Fonts (Inter, Space Mono) and the no-flash theme script
│   ├── robots.ts, sitemap.ts
│   ├── [locale]/                   # de, en
│   │   ├── layout.tsx, error.tsx, not-found.tsx
│   │   └── (main)/
│   │       ├── layout.tsx          # Navigation, footer, backdrop
│   │       ├── page.tsx            # Home (HomeContent.tsx)
│   │       ├── about/              # page.tsx, AboutContent.tsx
│   │       ├── services/           # page.tsx, ServicesContent.tsx
│   │       │   └── [serviceId]/    # page.tsx, ServiceDetailContent.tsx
│   │       ├── projects/           # page.tsx, ProjectsContent.tsx
│   │       ├── contact/            # page.tsx, ContactContent.tsx
│   │       ├── imprint/            # page.tsx, ImprintContent.tsx
│   │       └── privacy/            # page.tsx, PrivacyContent.tsx
│   ├── projects/                   # Live demos, English only, outside [locale]
│   │   ├── layout.tsx
│   │   ├── dashboard-demo/page.tsx # CRM dashboard demo
│   │   ├── mcp-demo/page.tsx       # Frames public/demos/mcp-demo.html
│   │   └── dist/index.html         # Old arcade build output; no route or link uses it
│   ├── admin/                      # Private admin, English only, noindex
│   │   ├── layout.tsx, actions.ts
│   │   ├── login/page.tsx
│   │   ├── auth/callback/route.ts  # Magic-link callback
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx, page.tsx, not-found.tsx   # page.tsx = inbox
│   │   │   ├── [id]/page.tsx       # Old message URL, redirects to the inbox
│   │   │   ├── kpis/page.tsx
│   │   │   └── magic/
│   │   │       ├── layout.tsx, page.tsx, actions.ts  # page.tsx = pool
│   │   │       ├── add/page.tsx
│   │   │       ├── wishlist/page.tsx
│   │   │       ├── decks/page.tsx, decks/new/page.tsx, decks/[slug]/page.tsx
│   │   │       └── img/[...key]/route.ts             # Same-origin card images
│   │   ├── _components/            # AdminShell, InboxWorkspace, KpisView, SubmitButton, ui.tsx
│   │   │   ├── kpi/                # KpiDashboard, SectionSwitcher, SupabaseStats, VercelPanel, MagicStats, charts
│   │   │   ├── traffic/            # TrafficDashboard, FlowExplorer, Heatmap, ClickBoard, CommandPalette, ...
│   │   │   ├── magic/              # PoolView, DeckView, DeckList, DeckImportForm, WishlistView, AddCardSearch, ...
│   │   │   └── ui/Tabs.tsx
│   │   └── _lib/                   # auth, inbox, messages, kpis, traffic, trafficQuery, dashboardStats, vercelStats, format
│   │       └── magic/              # queries, pool, deck, decklist, cards, imageCache, types
│   └── api/
│       ├── collect/                # route.ts, parse.ts: analytics beacon
│       └── contact/                # route.ts, validation.ts, rateLimit.ts: contact form
├── components/
│   ├── Analytics.tsx, SiteAnalytics.tsx, SpeedInsights.tsx
│   ├── atoms/                      # AnimateIn, ArtBackdrop, AsciiArt, Button, CodeBlock, LanguageToggle, Signature
│   ├── molecules/                  # AnalyticsToggle, BentoCard, BuildCard, ExpandableProjectCard, ExperienceTimeline,
│   │                               # GlassPanel, SectionDivider, SectionHeader, SectionStage
│   ├── organisms/                  # Footer, Navigation
│   ├── effects/                    # SiteHyperspace, Starfield
│   └── theme/ThemeProvider.tsx
├── config/                         # admin.ts, legal.ts, positioning.ts, site.ts
├── hooks/useReducedMotion.ts
├── i18n/                           # routing.ts, request.ts, navigation.ts, clientMessages.ts
├── locales/                        # de.json, en.json
├── types/                          # contact.ts, project.ts, service.ts, index.ts
└── utils/
    ├── escapeHtml.ts
    ├── analytics/                  # optOut.ts, describeClickTarget.ts
    └── supabase/                   # server.ts (SSR), client.ts (browser), middleware.ts (session refresh)
```

Other folders:

| Path | Holds |
| :--- | :--- |
| `public/demos/mcp-demo.html` | The MCP demo document (framed by `/projects/mcp-demo`) |
| `public/projects/cyberpunk-arcade/index.html` | The arcade page; it loads `public/games/cyberpunk/` (desktop) or `public/games/cyberpunk_mobile/` (touch or narrow screen) |
| `public/games/dist/` | Old arcade build output; no route or link uses it |
| `public/art/`, `public/email/` | Page art, the email header image |
| `supabase/migrations/`, `supabase/tests/` | Schema and SQL tests (see [Database](#database)) |
| `supabase/functions/` | Edge Functions `send-contact-email` and `testdata-eval` |
| `supabase/templates/magic-link.html` | The admin login mail |
| `scripts/mtg/` | Magic catalog and printings loaders |
| `scripts/db/test-migrations.sh` | `npm run test:db` |
| `scripts/email/` | Builds the email header image |
| `e2e/` | Playwright specs: `app`, `a11y`, `admin`, `analytics`, `demos`, `headers`, `storybook-visual` |
| `.storybook/` | Storybook 9 config |
| `.figma/`, `docs/design-system.md` | The Figma design-system pack |
| `assets/`, `brand/`, `vm-brand.json` | README art and brand kit |

**Component rules** are in [CLAUDE.md](../CLAUDE.md#components): presentational components get data through props; server components and server actions fetch; client components own browser state and effects. There is no `containers/` or `templates/` folder.

**Stories** (Storybook): atoms `Button`, `CodeBlock`, `LanguageToggle`; molecules `BentoCard`, `ExperienceTimeline`, `GlassPanel`, `SectionDivider`, `SectionHeader`; organisms `Navigation`, `Footer`.

## Routes

### Public pages

Every public page exists in both locales: German (default) under `/de`, English under `/en`. `/` redirects to `/de`. No locale cookie is set; the locale is always in the URL. All of these are in `sitemap.ts`.

| Path (after `/de` or `/en`) | Page | Highlights |
| :--- | :--- | :--- |
| `/` | Home | Positioning, key numbers, pipeline, stack, practice and roles, service teaser |
| `/about` | About | Profile, skills terminal, experience timeline |
| `/services` | Services | The five services, value add |
| `/services/requirements-engineering` | Service detail | Challenges, approach, tech stack |
| `/services/ux-ui-branding` | Service detail | Same layout |
| `/services/frontend-development` | Service detail | Same layout |
| `/services/project-delivery` | Service detail | Same layout |
| `/services/modern-stack` | Service detail | Same layout |
| `/projects` | Projects | Interactive demos (MCP, CRM dashboard, arcade), real-world work, builds |
| `/contact` | Contact | Contact form (hCaptcha loads on send), email, LinkedIn, GitHub |
| `/imprint` | Imprint | Legal notice (data in `src/config/legal.ts`) |
| `/privacy` | Privacy | Privacy policy; section 8 describes the analytics |

An unknown service id or path shows the localized 404 page.

### Demos

English only, outside `[locale]`. The middleware matcher excludes `projects/dashboard-demo` and `projects/mcp-demo` by name, and files with an extension never reach it.

| Path | Demo |
| :--- | :--- |
| `/projects/dashboard-demo` | CRM dashboard: CSS/SVG charts, responsive sidebar, micro-interactions. Disallowed in `robots.txt` |
| `/projects/mcp-demo` | Code Context MCP demo; frames `/demos/mcp-demo.html` (the only path that allows same-origin framing) |
| `/projects/cyberpunk-arcade/index.html` | Arcade shooter in WASM (static file); picks the desktop or mobile build |

### Admin

English only, `noindex`, disallowed in `robots.txt`. Every path except the first two needs the admin session.

| Path | What it is |
| :--- | :--- |
| `/admin/login` | Magic-link login form |
| `/admin/auth/callback` | Magic-link callback (route handler) |
| `/admin` | Inbox (`?status=` and `?id=` in the URL) |
| `/admin/<id>` | Old message URL; redirects to `/admin?status=all&id=<id>` |
| `/admin/kpis` | KPI tabs (`?tab=`) and traffic views (`?view=`) |
| `/admin/magic` | Magic pool |
| `/admin/magic/decks`, `/admin/magic/decks/<slug>` | Deck list, one deck |
| `/admin/magic/decks/new` | Deck import from a pasted decklist |
| `/admin/magic/wishlist` | Wishlist |
| `/admin/magic/add` | Add a card from the catalog |
| `/admin/magic/img/<size>/<face>/...` | Card images from `mtg_image_cache` (route handler) |

### Other routes

| Path | What it is |
| :--- | :--- |
| `POST /api/contact` | Validates, rate-limits and checks hCaptcha, then inserts into `contact_messages` as `anon` |
| `POST /api/collect` | Analytics beacon; calls `record_analytics_event()`. Without `ANALYTICS_INGEST_SECRET` it answers 204 and stores nothing |
| `/sitemap.xml`, `/robots.txt` | From `sitemap.ts` and `robots.ts` |
| `/_vercel/speed-insights/*` | Vercel Speed Insights, same origin |

## Admin (v2)

A private area at `/admin`, introduced in **v2.0.0** (traffic KPIs since **v2.1.0**, Magic since **v2.2.0**), in the same visual language as the CRM demo. Navigation: **Inbox**, **KPIs**, **Magic**.

| Section | What it does |
| :--- | :--- |
| **Inbox** | Mail-client split view for contact-form messages: status tabs (unread / read / archived / spam / all), search, hover quick actions, multi-select bulk bar, auto-advance, keyboard shortcuts (`j`/`k` · `e` · `s` · `u` · `r` · `x` · `/` · `Esc`) |
| **KPIs** | Four tabs (`?tab=`). **Website**: traffic first, then messages. Traffic: live visitors, visitors / page views / clicks / bounce rate / session length with trends, time series with previous-period comparison, weekday × hour heatmap, top pages, sources and audience (click any row to filter), a flow explorer (came from → page → went to) and a click leaderboard. A section switcher (`?view=`: all, overview, when, audience, flow, clicks, messages) shows one part at a time. Range, filters, metric and flow focus live in the URL. Keyboard: `1`–`4` range · `v`/`p`/`c` metric · `r` refresh · `⌫` drop newest filter · `⌘K` command palette. Messages: 30-day volume and trend, unread, spam rate, messages per day, status breakdown, busiest weekdays (Europe/Berlin). **Supabase**: database size, Postgres version, connections, table sizes, storage buckets (from `admin_dashboard_stats()`). **Vercel**: production deployment, build success rate and build times from the Vercel REST API; without `VERCEL_API_TOKEN` it shows how to set it up. **Magic**: pool, wishlist, decks and scan test-data counts (from `admin_dashboard_stats()`) |
| **Magic** | Velimir's Magic: The Gathering cards. Tabs: **Pool**: every owned card with Scryfall image, exact text, copies (± in place), German copies, notes; search plus color and type filters. **Decks**: every deck with how much of it you own; per deck the main deck, sideboard and upgrade path, each card marked owned / buy N against the pool, a priced list of what is still to buy, and warnings when the plan is off (card count, off-color cards). *New deck* imports a pasted decklist. **Wishlist**: cards you want but do not own yet, with copies (± in place), notes and *Got it*, which moves them into the pool. **Add card**: search the catalog of every paper card ever printed (Scryfall) and add copies to the pool (*Own it*) or to the wishlist (*Want it*) |

**Access.** Supabase Auth magic link for a single admin user (sign-ups off, `shouldCreateUser: false`). Three layers check the admin: the middleware, `requireAdmin()` in every page and server action, and Postgres RLS via `public.is_admin()`. The admin's user UUID lives in `src/config/admin.ts` **and** in the migration; change both together. The Next.js app uses no service-role key. Only the session cookie of the admin login is ever set.

**Supabase Auth settings** (dashboard, not in the repo): Site URL `https://www.velimir-mueller.de`; redirect URLs `https://www.velimir-mueller.de/admin/auth/callback` and `http://localhost:3000/admin/auth/callback`; custom SMTP via Resend for the login mails; mail template `supabase/templates/magic-link.html`.

**Analytics (v2.1.0).** First-party and cookieless, replacing Vercel Web Analytics (Speed Insights stays). The client sends a beacon per page view (with the previous page) and per click to `/api/collect`; clicks are labelled by `data-track`, then link target, then button name; form fields are never read. The database stores no IP: a visitor is `sha256(daily salt + IP + user agent)`, computed inside `record_analytics_event()`, and the salt rotates every UTC day. Raw events are kept 90 days. Bots, Do Not Track / Global Privacy Control, the visitor opt-out (`src/utils/analytics/optOut.ts`, also covers Speed Insights) and the signed-in admin are not counted. The privacy policy (section 8) describes exactly this; change both together.

**Magic code.** Queries in `src/app/admin/_lib/magic/queries.ts`, pure logic next to it (`pool.ts`, `deck.ts`, `decklist.ts`, `cards.ts`), UI in `src/app/admin/_components/magic/`. Card text and images always come from the catalog, so a catalog refresh updates the pool and decks too. Images are same-origin: `/admin/magic/img/<size>/<face>/...` serves them from `mtg_image_cache` and fetches from Scryfall's CDN only on the first view of each image (then the browser keeps it a year). No third-party image host in the CSP.

## Database

Supabase Postgres. `supabase/migrations/` is the single source of truth for the schema, also for other apps on this database (the MTG Scanner Android app). Add a new migration; never edit an applied one. Apply new migrations in the Supabase SQL editor.

### Migrations

| Migration | Purpose |
| :--- | :--- |
| `20260930160000_contact_messages_admin` | Versions `contact_messages`, adds `status`, `is_admin()` and the admin RLS policies; drops the dead `create_email_hook` trigger |
| `20261002120000_analytics_events` | First-party analytics: `analytics_events`, the private salt and ingest-secret tables, `record_analytics_event()` |
| `20261008120000_magic` | Magic catalog and pool tables, pool write functions |
| `20261008120100_magic_seed` | Seeds the pool once (skipped when the pool has rows) |
| `20261008130000_magic_image_cache` | `mtg_image_cache` |
| `20261008150000_magic_v2` | Pool references the catalog; adds decks (seeds *Stapelbruch*); new add and search functions. Needs the loaded catalog |
| `20261009120000_magic_scan` | `mtg_norm()`, printings and printed names, `mtg_match_scan()`, `mtg_add_many()`, view `mtg_deck_ownership` |
| `20261009150000_magic_wishlist` | `mtg_wishlist` and its functions |
| `20261009170000_contact_email_hook` | Versions the contact email trigger; the secret comes from Vault |
| `20261009190000_match_scan_definer` | `mtg_match_scan()` becomes `security definer` (statement timeout fix) |
| `20261009200000_search_three_languages` | `mtg_search_catalog()` matches English, German and French names |
| `20261009210000_match_scan_thresholds` | `mtg_match_scan()` takes optional thresholds |
| `20261009220000_scan_testdata` | Scan test data: bucket, `mtg_test_batch`, `mtg_test_case`, GitHub dispatch; `is_admin()` also accepts the service role |
| `20261010010000_match_scan_prefix` | `mtg_match_scan()`: unique-prefix step |
| `20261010030000_match_scan_clear_lead` | `mtg_match_scan()`: accepts a fuzzy hit far ahead of the runner-up |
| `20261010040000_match_scan_lang_ties` | `mtg_match_scan()`: an English/printed-name tie goes to English |
| `20261010050000_testdata_dispatch_repo_rename` | Dispatch goes to the renamed repo `lab-mtg-scanner` |
| `20261010060000_admin_dashboard_stats` | `admin_dashboard_stats()` for the KPI tabs Supabase and Magic |
| `20261011120000_magic_deck_import` | `mtg_import_deck()` |
| `20261011130000_magic_deck_import_definer` | `mtg_import_deck()` becomes `security definer` (statement timeout fix) |

### Tables

Every table has RLS on. "Admin" means a policy through `public.is_admin()`.

| Table | Holds | Access |
| :--- | :--- | :--- |
| `contact_messages` | Contact-form messages; `status` is `new`, `read`, `archived` or `spam` | `anon` may insert with `status = 'new'` only; admin reads, deletes and updates `status` (the only updatable column) |
| `analytics_events` | Page views and clicks: hashed visitor, path, previous path, referrer, click target, country, device, browser. Kept 90 days | Admin reads and deletes; no direct insert or update for `anon` or `authenticated` |
| `analytics_private.salts` | One salt per UTC day; older salts are deleted | Private schema, no API access |
| `analytics_private.ingest_secret` | SHA-256 of the analytics ingest secret (one row) | Private schema, no API access |
| `mtg_catalog` | Every paper card from Scryfall's *Oracle Cards* bulk file (~33k rows; image URLs, no images) | Admin reads; filled by `scripts/mtg/load-catalog.sql` |
| `mtg_collection` | The pool: one row per owned card → `mtg_catalog`, with copies, German copies, German name, note | Admin |
| `mtg_wishlist` | Cards wanted but not owned: one row per card → `mtg_catalog`, with copies and note | Admin |
| `mtg_deck`, `mtg_deck_card` | Decks; each card row is in `main`, `sideboard` or `upgrade` → `mtg_catalog`, with a planned price per copy | Admin |
| `mtg_image_cache` | Card images, stored on first view | Admin |
| `mtg_printing`, `mtg_card_name` | Set + collector number → card; printed names in other languages (German, French) | Admin reads; filled by `scripts/mtg/load-printings.sql` |
| `mtg_test_batch`, `mtg_test_case` | Scan test cases from the MTG Scanner app (photo path, OCR readings, proposed and confirmed cards) and the batches sent for evaluation | Admin |

View: `mtg_deck_ownership`, how much of each deck the pool covers; web and app share it.

Storage: private bucket `mtg-testdata` (scan test photos, up to 30 MB each), admin only.

### Functions

All functions that write or read admin data check `is_admin()`, through RLS or by themselves. `execute` is revoked from `anon` on every function below except `is_admin()` and `mtg_norm()`.

| Function | Purpose |
| :--- | :--- |
| `is_admin()` | True for the admin user's UUID, or for the service role (server-side callers such as the `testdata-eval` Edge Function) |
| `record_analytics_event(...)` | The only write path into `analytics_events`. Checks the ingest secret, rotates the daily salt, hashes the visitor, applies the 90-day retention |
| `mtg_norm(text)` | Name normalisation shared with the app's `LineFilter.normalize()`: lowercase, no accents, `ß` → `ss` |
| `mtg_add_to_pool`, `mtg_change_qty`, `mtg_add_many` | Pool writes (one card, ± copies, many cards in one call) |
| `mtg_add_to_wishlist`, `mtg_change_wish_qty`, `mtg_wish_to_pool` | Wishlist writes; `mtg_wish_to_pool` moves a wish into the pool in one transaction |
| `mtg_search_catalog(query, limit)` | Catalog search over the English name and every printed name, ignoring case and accents ("starke des stiers" finds *Stärke des Stiers*, "ile" finds *Île*). `security definer` |
| `mtg_match_scan(readings, ...)` | Turns OCR readings into cards: printing → exact English or printed name → unique prefix → fuzzy. Optional thresholds `p_fuzzy_min`, `p_sure_min`, `p_agree_min`. `security definer` |
| `mtg_import_deck(name, slug, summary, lines)` | Creates a deck from parsed decklist lines in one transaction; if a name does not resolve to exactly one card, creates nothing and returns the names with suggestions. `security definer` |
| `mtg_touch_updated_at()` | Trigger function: keeps `updated_at` current on the pool and decks |
| `admin_dashboard_stats()` | Numbers for the KPI tabs Supabase and Magic in one call. Planner row estimates, no row content. `security definer` |
| `send_contact_email_hook()` | Trigger function: posts a new message to the `send-contact-email` Edge Function with the Vault secret `contact_hook_secret`. Not callable through the API |
| `mtg_collect_test_batch()` | Trigger function: assigns every unsent test case to the new batch, then dispatches it. Not callable through the API |
| `mtg_dispatch_test_batch(batch_id)` | Asks GitHub (`repository_dispatch`, repo `lab-mtg-scanner`) to evaluate a batch, with the Vault secret `github_dispatch_token`. Not callable through the API; rerun by hand in the SQL editor |

Why `security definer`: under RLS, Postgres may only use an index whose condition is leakproof, and `mtg_norm()` is not. As invoker functions, a 60-card deck import or a 24-reading scan hit the 8 s statement timeout. The definer functions check `is_admin()` themselves first.

### Triggers and hooks

| Trigger | On | Does |
| :--- | :--- | :--- |
| `on_new_contact_message` | insert on `contact_messages` | `send_contact_email_hook()` → Edge Function `send-contact-email` (Resend) |
| `on_new_test_batch` | insert on `mtg_test_batch` | `mtg_collect_test_batch()` → GitHub dispatch |
| `mtg_collection_touch`, `mtg_deck_touch` | update on `mtg_collection`, `mtg_deck` | `mtg_touch_updated_at()` |

Both HTTP calls go through `pg_net`. Extensions used: `pgcrypto`, `pg_trgm`, `unaccent`, `pg_net`.

### Edge Functions

| Function | Called by | Does |
| :--- | :--- | :--- |
| `send-contact-email` | The `on_new_contact_message` trigger only (shared secret in the `x-contact-hook-secret` header) | Sends the contact message to the inbox with Resend |
| `testdata-eval` | The `lab-mtg-scanner` testdata workflow only (shared secret in the `x-testdata-key` header) | Returns a batch with signed photo URLs, or runs `mtg_match_scan` for up to 50 readings. Uses the service role |

Their secrets are Supabase function secrets, not app env vars (template: [supabase/functions/.env.example](../supabase/functions/.env.example)): `RESEND_API_KEY`, `CONTACT_HOOK_SECRET`, optional `EMAIL_FROM` and `CONTACT_TO` (`send-contact-email`); `TESTDATA_EXPORT_KEY` (`testdata-eval`). Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the functions.

### SQL tests

CI (job *Database Migrations & SQL Tests*) applies every migration to a fresh local database and runs `supabase/tests/*.sql`; locally `npm run test:db` (needs Docker and psql). The fixture `supabase/tests/fixtures/catalog.sql` stands in for the Scryfall catalog that `20261008150000_magic_v2.sql` needs, and the script puts a dummy `contact_hook_secret` in Vault. SQL tests act as a user with `set local request.jwt.claim.sub = '<uuid>'`.

| Test | Covers |
| :--- | :--- |
| `magic_scan_test.sql` | `mtg_match_scan()` |
| `magic_search_test.sql` | `mtg_search_catalog()` in English, German and French |
| `magic_wishlist_test.sql` | Wishlist functions |
| `magic_deck_import_test.sql` | `mtg_import_deck()` |
| `scan_testdata_test.sql` | Test-data tables, batch trigger and dispatch |
| `admin_dashboard_stats_test.sql` | `admin_dashboard_stats()` |

### Setup on a new database

Apply the migrations in filename order. Four steps need something extra:

1. **Before `20261009170000_contact_email_hook.sql`**: store the hook secret in Vault as `contact_hook_secret` (`select vault.create_secret(...)`), and set the same value as the function secret `CONTACT_HOOK_SECRET`.
2. **Before `20261008150000_magic_v2.sql`**: load the catalog. It links the seeded pool to the catalog and seeds the deck *Stapelbruch*.
   ```bash
   node scripts/mtg/build-catalog.mjs /tmp/mtg-catalog.csv
   psql "$SUPABASE_DB_URL" -v csv=/tmp/mtg-catalog.csv -f scripts/mtg/load-catalog.sql
   ```
   `SUPABASE_DB_URL` is the session-pooler connection string from the Supabase dashboard (*Connect*). Run the same two commands any time to refresh the catalog (Scryfall updates daily); the load refuses a CSV under 98 % of the current catalog and keeps cards the pool or a deck uses.
3. **After `20261009120000_magic_scan.sql`**: load printings and printed names (also the refresh, after new sets).
   ```bash
   node scripts/mtg/build-printings.mjs /tmp/mtg-printings.csv /tmp/mtg-names.csv
   psql "$SUPABASE_DB_URL" -v printings=/tmp/mtg-printings.csv -v names=/tmp/mtg-names.csv -f scripts/mtg/load-printings.sql
   ```
   The first command streams Scryfall's *All Cards* file (~400 MB, 1–10 minutes). The load refuses a CSV under 98 % of the current tables.
4. **After `20261009220000_scan_testdata.sql`**: store a fine-grained GitHub token (repo `lab-mtg-scanner` only, *Contents: read and write*) in Vault as `github_dispatch_token`. Without it a batch is stored but not sent; send it later with `select public.mtg_dispatch_test_batch('<batch id>');`.

**Analytics** needs one more step after `20261002120000_analytics_events.sql`:

1. Generate a secret: `openssl rand -hex 32`.
2. In the Supabase SQL editor: `insert into analytics_private.ingest_secret (secret_sha256) values (encode(extensions.digest('<secret>', 'sha256'), 'hex'));`
3. In Vercel: set `ANALYTICS_INGEST_SECRET` to the same secret (Production), then redeploy.

Never write a secret value into a file, commit or PR.

## Environment variables

Names only. Values live in `.env.local`, in Vercel and in Supabase function secrets. The templates are [.env.example](../.env.example) (app and scripts) and [supabase/functions/.env.example](../supabase/functions/.env.example) (Edge Functions). `src/__tests__/env-example.test.ts` fails when code reads a name that no template lists. `NEXT_PUBLIC_*` is public (inlined into the browser bundle); every other name is server-only.

| Name | Set in | Used for |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Supabase project URL. Required |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Vercel | Supabase publishable key. Required |
| `NEXT_PUBLIC_SITE_URL` | Vercel (previews) | Optional. Overrides the canonical URL |
| `NEXT_PUBLIC_HCAPTCHA_SITEKEY` | Vercel | Contact form captcha (public key) |
| `HCAPTCHA_SECRET` | Vercel | Contact form captcha check in `/api/contact` |
| `ANALYTICS_INGEST_SECRET` | Vercel (Production) | Analytics ingest. Without it `/api/collect` stores nothing |
| `VERCEL_API_TOKEN` | Vercel | Optional. Admin KPI tab Vercel; without it the tab shows how to set it up |
| `VERCEL_PROJECT`, `VERCEL_TEAM_ID` | Vercel | Optional. Vercel project (default `portfolio-website`) and team for that tab |
| `SUPABASE_DB_URL` | Local only | Magic catalog loaders in `scripts/mtg/` (`psql`); the app does not read it |

The Next.js app does not read `RESEND_API_KEY`: the contact mail goes out through the `send-contact-email` Edge Function. Its secrets and those of `testdata-eval` are listed under [Edge Functions](#edge-functions); set them with `supabase secrets set`.

## Design

The VM. flagship look. The Figma file and its tokens are described in [docs/design-system.md](design-system.md).

| Pattern | Detail |
| :--- | :--- |
| Type | Inter for text, Space Mono for labels, data and eyebrows (`src/app/shared-layout.ts`) |
| Colour | Dark by default, full light mode. Indigo brand scale (`brand-300` to `brand-900`, `brand-500` = `#6366f1`). Emerald only for status (availability, success) |
| Surfaces | Public pages and demos: content on stages with a brand art backdrop, glass panels and cards (`SectionStage`, `ArtBackdrop`, `GlassPanel`), numbered section dividers. Admin: flat, opaque panels |
| Layout | Card grids with large radii (`rounded-[1.5rem]`, `rounded-3xl`) |
| Motion | Fade-in on scroll (`AnimateIn`), starfield and hyperspace effects, hover micro-animations; all respect reduced motion (`useReducedMotion`) |
