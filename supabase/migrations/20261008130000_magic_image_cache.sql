-- Card images for the admin Magic section, cached on first view.
-- /admin/magic/img/... fetches an image from Scryfall's CDN once, stores the
-- bytes here, and serves every later request from this table. Admin-only.
-- Key = Scryfall's image path without host, query and extension,
-- e.g. 'small/front/1/4/145b928d-a7ff-4fe5-ae4d-bbae7b1d955b'.

create table if not exists public.mtg_image_cache (
  key          text primary key check (key ~ '^(small|normal|large)/(front|back)/[0-9a-f]/[0-9a-f]/[0-9a-f-]{36}$'),
  content_type text not null check (content_type in ('image/jpeg', 'image/png')),
  bytes        bytea not null check (octet_length(bytes) between 1 and 2000000),
  created_at   timestamptz not null default now()
);

alter table public.mtg_image_cache enable row level security;

drop policy if exists "Admin can read cached images" on public.mtg_image_cache;
create policy "Admin can read cached images"
  on public.mtg_image_cache for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin can cache images" on public.mtg_image_cache;
create policy "Admin can cache images"
  on public.mtg_image_cache for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin can clear cached images" on public.mtg_image_cache;
create policy "Admin can clear cached images"
  on public.mtg_image_cache for delete
  to authenticated
  using (public.is_admin());
