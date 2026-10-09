-- Wishlist: cards you want but do not own yet. Its own table, so the pool,
-- mtg_deck_ownership and everything counting owned copies stay unchanged.
-- One row per card (unique oracle_id), like the pool. Additive only.

create table public.mtg_wishlist (
  id         uuid primary key default gen_random_uuid(),
  oracle_id  uuid not null unique references public.mtg_catalog (oracle_id) on delete restrict,
  qty        integer not null check (qty between 1 and 99),
  note       text,
  created_at timestamptz not null default now()
);

alter table public.mtg_wishlist enable row level security;

create policy "Admin manages the wishlist"
  on public.mtg_wishlist for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Adds wanted copies: a new row, or more copies on the card's existing row.
create or replace function public.mtg_add_to_wishlist(p_oracle_id uuid, p_qty integer, p_note text default null)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  insert into public.mtg_wishlist (oracle_id, qty, note)
  values (p_oracle_id, p_qty, nullif(btrim(p_note), ''))
  on conflict (oracle_id) do update
     set qty  = least(public.mtg_wishlist.qty + excluded.qty, 99),
         note = nullif(concat_ws(' ', public.mtg_wishlist.note, excluded.note), '')
  returning id;
$$;

-- One wanted copy more or less; the last one removes the row. Same contract as
-- mtg_change_qty: returns the new count, 0 when removed, null when not found.
create or replace function public.mtg_change_wish_qty(p_id uuid, p_delta integer)
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
  update public.mtg_wishlist
     set qty = qty + p_delta
   where id = p_id and qty + p_delta between 1 and 99
  returning qty into new_qty;
  if found then
    return new_qty;
  end if;
  delete from public.mtg_wishlist where id = p_id and qty + p_delta < 1;
  return case when found then 0 else null end;
end;
$$;

-- "Got it": moves all wanted copies of a row into the pool in one transaction.
-- Returns the pool row id, or null when the wish row does not exist (or RLS hid it).
create or replace function public.mtg_wish_to_pool(p_id uuid, p_copies_de integer default 0)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  wish public.mtg_wishlist%rowtype;
  pool_id uuid;
begin
  delete from public.mtg_wishlist where id = p_id returning * into wish;
  if not found then
    return null;
  end if;
  if p_copies_de < 0 or p_copies_de > wish.qty then
    raise exception 'invalid German copies';
  end if;
  pool_id := public.mtg_add_to_pool(wish.oracle_id, wish.qty, p_copies_de, null, null);
  return pool_id;
end;
$$;

revoke execute on function public.mtg_add_to_wishlist(uuid, integer, text) from public, anon;
revoke execute on function public.mtg_change_wish_qty(uuid, integer) from public, anon;
revoke execute on function public.mtg_wish_to_pool(uuid, integer) from public, anon;
grant execute on function public.mtg_add_to_wishlist(uuid, integer, text) to authenticated;
grant execute on function public.mtg_change_wish_qty(uuid, integer) to authenticated;
grant execute on function public.mtg_wish_to_pool(uuid, integer) to authenticated;
