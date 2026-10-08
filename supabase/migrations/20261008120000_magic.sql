-- Admin "Magic" section: the Scryfall card catalog (every card ever printed,
-- one row per Oracle card) and Velimir's own card pool.
-- Admin-only: no anon access, all policies go through public.is_admin().
-- The catalog is filled by scripts/mtg/load-catalog.sql; the pool seed is
-- 20261008120100_magic_seed.sql.

create extension if not exists pg_trgm with schema extensions;

-- 1. Catalog — a trimmed copy of Scryfall's "Oracle Cards" bulk file.
create table if not exists public.mtg_catalog (
  oracle_id    uuid primary key,
  name         text not null,
  mana_cost    text,
  mana_value   numeric not null default 0,
  type_line    text not null default '',
  oracle_text  text not null default '',
  colors       text[] not null default '{}',
  power_toughness text,
  loyalty      text,
  rarity       text,
  set_code     text,
  set_name     text,
  released_at  date,
  image_url    text,
  scryfall_uri text
);

-- Substring search on the name ("rift" finds Cyclonic Rift).
create index if not exists mtg_catalog_name_trgm
  on public.mtg_catalog using gin (lower(name) extensions.gin_trgm_ops);

alter table public.mtg_catalog enable row level security;

drop policy if exists "Admin can read the catalog" on public.mtg_catalog;
create policy "Admin can read the catalog"
  on public.mtg_catalog for select
  to authenticated
  using (public.is_admin());

-- 2. Pool — the cards Velimir owns. Card fields are a snapshot taken when the
-- card is added (from the catalog), so the pool renders without the catalog
-- and keeps cards Scryfall does not know (oracle_id null, read from photos).
create table if not exists public.mtg_collection (
  id              uuid primary key default gen_random_uuid(),
  oracle_id       uuid,
  name            text not null,
  name_de         text,
  owned_qty       integer not null check (owned_qty > 0),
  copies_de       integer not null default 0,
  colors          text[] not null default '{}',
  type_line       text not null default '',
  mana_cost       text,
  mana_value      numeric,
  power_toughness text,
  oracle_text     text not null default '',
  short           text,
  status          text not null default 'scryfall'
                  check (status in ('scryfall', 'photo', 'partial', 'verify')),
  note            text,
  image_url       text,
  scryfall_uri    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint mtg_collection_copies_de_check check (copies_de between 0 and owned_qty)
);

create index if not exists mtg_collection_oracle_id on public.mtg_collection (oracle_id);

create or replace function public.mtg_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists mtg_collection_touch on public.mtg_collection;
create trigger mtg_collection_touch
  before update on public.mtg_collection
  for each row execute function public.mtg_touch_updated_at();

alter table public.mtg_collection enable row level security;

drop policy if exists "Admin can read the pool" on public.mtg_collection;
create policy "Admin can read the pool"
  on public.mtg_collection for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin can add to the pool" on public.mtg_collection;
create policy "Admin can add to the pool"
  on public.mtg_collection for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin can update the pool" on public.mtg_collection;
create policy "Admin can update the pool"
  on public.mtg_collection for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin can remove from the pool" on public.mtg_collection;
create policy "Admin can remove from the pool"
  on public.mtg_collection for delete
  to authenticated
  using (public.is_admin());

-- 3. Writes as single statements, so a double click or a double submit
-- cannot lose a count. security invoker: RLS above still decides.

-- One copy more or less; below one copy the row is removed. German copies
-- never exceed the total. Returns the new count (0 = removed, null = no row).
create or replace function public.mtg_change_qty(p_id uuid, p_delta integer)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_qty integer;
begin
  if p_delta not in (-1, 1) then
    raise exception 'delta must be -1 or 1';
  end if;
  update public.mtg_collection
     set owned_qty = owned_qty + p_delta,
         copies_de = least(copies_de, owned_qty + p_delta)
   where id = p_id and owned_qty + p_delta >= 1
  returning owned_qty into new_qty;
  if found then
    return new_qty;
  end if;
  delete from public.mtg_collection where id = p_id and owned_qty + p_delta < 1;
  return case when found then 0 else null end;
end;
$$;

-- Adds copies of a catalog card: onto the card's first pool row if there is
-- one, else as a new row with a snapshot of the catalog fields. A per-card
-- lock makes two concurrent adds of a new card end up in one row.
create or replace function public.mtg_add_to_pool(
  p_oracle_id uuid,
  p_qty integer,
  p_copies_de integer default 0,
  p_name_de text default null,
  p_note text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  row_id uuid;
begin
  if p_qty < 1 or p_copies_de < 0 or p_copies_de > p_qty then
    raise exception 'invalid copies';
  end if;
  perform pg_advisory_xact_lock(hashtext('mtg_add:' || p_oracle_id::text));

  update public.mtg_collection
     set owned_qty = owned_qty + p_qty,
         copies_de = copies_de + p_copies_de,
         name_de = coalesce(name_de, p_name_de),
         note = nullif(concat_ws(' ', note, p_note), '')
   where id = (select id from public.mtg_collection
                where oracle_id = p_oracle_id
                order by created_at
                limit 1)
  returning id into row_id;
  if found then
    return row_id;
  end if;

  insert into public.mtg_collection (
    oracle_id, name, name_de, owned_qty, copies_de, colors, type_line, mana_cost, mana_value,
    power_toughness, oracle_text, status, note, image_url, scryfall_uri
  )
  select c.oracle_id, c.name, p_name_de, p_qty, p_copies_de, c.colors, c.type_line, c.mana_cost, c.mana_value,
         coalesce(c.power_toughness, 'Loyalty ' || c.loyalty), c.oracle_text, 'scryfall', p_note, c.image_url, c.scryfall_uri
    from public.mtg_catalog c
   where c.oracle_id = p_oracle_id
  returning id into row_id;
  return row_id;
end;
$$;

revoke execute on function public.mtg_change_qty(uuid, integer) from public, anon;
revoke execute on function public.mtg_add_to_pool(uuid, integer, integer, text, text) from public, anon;
grant execute on function public.mtg_change_qty(uuid, integer) to authenticated;
grant execute on function public.mtg_add_to_pool(uuid, integer, integer, text, text) to authenticated;
