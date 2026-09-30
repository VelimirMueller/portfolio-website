# Admin Inbox Design

**Date:** 2026-09-30
**Status:** Approved — decisions settled 2026-09-30

## Goal

A private `/admin` area on velimir-mueller.de where Velimir signs in and works through contact-form submissions: read, archive, mark as spam. It is the first admin feature, so it also lays the groundwork (auth, admin check, versioned RLS) that later admin pages reuse.

## Non-goals (for now)

- Analytics, content editing, deploy/CI status — possible later pages on the same foundation.
- Replying from the dashboard — replies still go out from the normal mail client.
- Multiple admins or roles.

## Findings from the current code

- Submissions land in `contact_messages` (`name`, `email`, `message`) via `src/app/api/contact/route.ts`, written with the **publishable key** — so RLS must allow `anon` INSERT.
- The table, its RLS policies and the database webhook that calls `supabase/functions/send-contact-email` were all set up by hand in the Supabase dashboard. **None of it is in the repo.**
- `@supabase/ssr` resolves to `0.1.0`. That version reads cookies via `get/set/remove`; `src/utils/supabase/server.ts` passes `getAll/setAll`, which 0.1.0 ignores. Harmless for anonymous inserts, fatal for a login session.
- The middleware is plain `next-intl` with a matcher that excludes demo routes by name.
- The CSP already allows Supabase — auth needs no header change.

## Step 0 — Pre-flight (before any feature code)

1. **Audit the live RLS policies** in the Supabase SQL editor:
   ```sql
   select policyname, roles, cmd, qual, with_check
   from pg_policies where tablename = 'contact_messages';
   select relrowsecurity from pg_class where relname = 'contact_messages';
   ```
   If RLS is off, or any SELECT policy covers `anon`/`public`, every message is publicly readable right now — fix that immediately, independent of this feature.

   **Result 2026-09-30 (project `zkvpvhrmrbkpuspypqrj`):** RLS enabled; one policy, `Allow public inserts` — `{anon}`, `INSERT`, `with check (true)`. No read path for `anon`: messages are not publicly readable. ✅
2. **Upgrade `@supabase/ssr`** to the current release (0.12.x) and confirm the contact form still submits (unit + e2e green).

   **Partially done 2026-09-30 — e2e and live form submit pending** (branch `chore/supabase-ssr-upgrade`): `0.1.0` → `0.12.7`; type-check, lint, 139 unit tests and build green. The Supabase 2.108+ packages require Node >= 22, so CI moves from Node 20 to 24 (the Vercel project runs 24.x — confirmed 2026-09-30) and `package.json` gets `engines.node: ">=22"` (Vercel reads it to pick the runtime). Vercel Node.js Version: **24.x** ✅. Not complete until a real contact submit on production lands a row and the email.

   Note: `package-lock.json` at `cc6b432` still said `1.2.8` while `package.json` said `1.2.10`; the install re-synced it. `cookie@1.1.1` is consumed only by `@supabase/ssr` (`npm ls cookie`).

## Design

### Auth

- Supabase Auth, **magic link** to Velimir's address.
- **Disable public sign-ups** in Supabase Auth settings; create the one user by hand.
- Redirect URLs allow-listed: `https://www.velimir-mueller.de/admin/auth/callback` and `http://localhost:3000/admin/auth/callback`. (Vercel previews are behind SSO anyway.)

### Admin check

- A SQL function `public.is_admin()` returning `auth.uid() = 'bf3817e9-307a-490e-a3d4-5e63ed65da4a'` — the UUID is fixed at user creation and cannot be changed by the user (unlike email or `user_metadata`).
- The same check runs in three places: middleware (redirect), every server component that reads data, and every server action. Middleware alone is not trusted: server actions are public POST endpoints.
- **No service-role key.** Admin pages query with the signed-in user's session; RLS does the gating.

### Live shape of `contact_messages` (read 2026-09-30)

| Column | Type |
|---|---|
| `id` | `uuid default gen_random_uuid() not null` |
| `name` | `text not null` |
| `email` | `text not null` |
| `message` | `text not null` |
| `created_at` | `timestamptz default now()` (nullable) |

Two `AFTER INSERT` triggers exist: `create_email_hook` and `on_new_contact_message`. If both call `send-contact-email`, every submission sends two emails — check the full definitions before versioning them, and keep only one.

### Data — first migration `supabase/migrations/<ts>_contact_messages_admin.sql`

- `create table if not exists` for the existing shape, so the live table (and its webhook trigger) is untouched.
- Add `status text not null default 'new'` (check: `new | read | archived | spam`). `created_at` already exists.
- Policies, replacing whatever the audit found:
  - `anon`: INSERT only.
  - `authenticated` + `is_admin()`: SELECT and UPDATE (UPDATE limited to `status`).
  - `authenticated` + `is_admin()`: DELETE (hard delete, behind a confirm step in the UI).
- Capture the webhook to `send-contact-email` in the migration too, so the whole contact pipeline is versioned.

### Routes — outside `[locale]`, English-only

| Route | Purpose |
|---|---|
| `/admin/login` | email field → magic link |
| `/admin/auth/callback` | exchanges the code for a session, redirects to `/admin` |
| `/admin` | inbox list: filter by status, newest first |
| `/admin/[id]` | single message, actions: mark read / archive / spam / delete (confirm first) |

- Middleware: `/admin` is excluded from `next-intl` (same pattern as the demos) and gets its own session guard. Unauthenticated → `/admin/login`.
- `robots.ts`: add `/admin` to `disallow`. Admin layout sets `robots: { index: false }` metadata. Do **not** add a second `headers()` entry in `next.config.mjs` — two CSP headers intersect (see the header contract).

## Tests

- Unit: `is_admin` guard helper, server actions reject without session / non-admin.
- E2E: `/admin` and `/admin/[id]` redirect to `/admin/login` when signed out; `/de/admin` is 404; `headers.spec.ts` unchanged and green.
- RLS check (manual, documented in the PR): with the publishable key, `select * from contact_messages` returns zero rows; insert still works.

## Rollout

1. Pre-flight fixes (Step 0) ship on their own PR.
2. Apply the migration to Supabase; verify the contact form end to end (row + email).
3. Configure Auth (sign-ups off, user, redirect URLs).
4. Merge the admin PR; sign in on production once.

## Follow-ups (not in this work)

- `Allow public inserts` has `with check (true)`, so anyone holding the publishable key can insert through the Supabase REST API directly, skipping hCaptcha and the rate limit in `/api/contact`. Close it by moving the insert server-side (a `security definer` function or a server-only key) and dropping the `anon` INSERT policy.

## Decisions

1. **Admin identity:** the user UUID, hard-coded in `is_admin()`. Email match was rejected because an email can change; `app_metadata` roles are more than one admin needs.
2. **Delete:** hard DELETE is allowed from the dashboard, behind a confirm step. Archive and spam stay as statuses.
3. **Login:** magic link. No extra OAuth app is needed.
