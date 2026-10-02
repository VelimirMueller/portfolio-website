-- First-party, cookieless analytics (v2.1.0).
--
-- Privacy model (mirrored in the privacy policy, section 8):
-- * Nothing is stored on the visitor's device. A visitor is a daily hash of
--   salt + IP + user agent, computed here; the IP itself is never stored.
-- * The salt rotates every UTC day and the previous one is deleted, so a hash
--   cannot be recomputed later and visitors are not linkable across days.
-- * Raw events are kept for 90 days.
--
-- Only /api/collect writes, through record_analytics_event(). The function
-- checks a shared ingest secret, so a direct REST call with the public key
-- cannot forge events. Setup after applying (secret value only in Vercel env
-- ANALYTICS_INGEST_SECRET, never in git):
--   insert into analytics_private.ingest_secret (secret_sha256)
--   values (encode(extensions.digest('<secret>', 'sha256'), 'hex'));

create extension if not exists pgcrypto with schema extensions;

-- 1. Private schema — not exposed through PostgREST, no grants to API roles.
create schema if not exists analytics_private;
revoke all on schema analytics_private from public;

create table if not exists analytics_private.salts (
  day  date primary key,
  salt bytea not null
);

create table if not exists analytics_private.ingest_secret (
  id            boolean primary key default true check (id),
  secret_sha256 text not null
);

-- 2. Events.
create table if not exists public.analytics_events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type       text not null check (type in ('pageview', 'click')),
  visitor    text not null check (char_length(visitor) = 64),
  path       text not null check (char_length(path) between 1 and 300),
  prev_path  text check (char_length(prev_path) <= 300),
  referrer   text check (char_length(referrer) <= 200),
  target     text check (char_length(target) <= 120),
  country    text check (country ~ '^[A-Z]{2}$'),
  device     text check (device in ('desktop', 'mobile', 'tablet')),
  browser    text check (char_length(browser) <= 40)
);

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at);

alter table public.analytics_events enable row level security;

drop policy if exists "Admin can read analytics" on public.analytics_events;
create policy "Admin can read analytics"
  on public.analytics_events for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin can delete analytics" on public.analytics_events;
create policy "Admin can delete analytics"
  on public.analytics_events for delete
  to authenticated
  using (public.is_admin());

-- No insert/update policy: API roles cannot write rows directly.
revoke insert, update on public.analytics_events from anon, authenticated;

-- 3. Ingest.
create or replace function public.record_analytics_event(
  p_secret     text,
  p_ip         text,
  p_user_agent text,
  p_type       text,
  p_path       text,
  p_prev_path  text default null,
  p_referrer   text default null,
  p_target     text default null,
  p_country    text default null,
  p_device     text default null,
  p_browser    text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_salt  bytea;
begin
  if p_secret is null or not exists (
    select 1 from analytics_private.ingest_secret
    where secret_sha256 = encode(extensions.digest(p_secret, 'sha256'), 'hex')
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select salt into v_salt from analytics_private.salts where day = v_today;
  if v_salt is null then
    -- First event of the day: new salt, forget the old ones, apply retention.
    insert into analytics_private.salts (day, salt)
    values (v_today, extensions.gen_random_bytes(32))
    on conflict (day) do nothing;
    select salt into v_salt from analytics_private.salts where day = v_today;
    delete from analytics_private.salts where day < v_today;
    delete from public.analytics_events where created_at < now() - interval '90 days';
  end if;

  insert into public.analytics_events (type, visitor, path, prev_path, referrer, target, country, device, browser)
  values (
    p_type,
    encode(extensions.digest(v_salt || convert_to(coalesce(p_ip, '') || '|' || coalesce(p_user_agent, ''), 'UTF8'), 'sha256'), 'hex'),
    p_path,
    p_prev_path,
    p_referrer,
    p_target,
    p_country,
    p_device,
    p_browser
  );
end;
$$;

revoke all on function public.record_analytics_event(text, text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.record_analytics_event(text, text, text, text, text, text, text, text, text, text, text) to anon;
