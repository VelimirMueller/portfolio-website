-- Loads the CSV from build-catalog.mjs into public.mtg_catalog.
--   psql "$SUPABASE_DB_URL" -v csv=/path/catalog.csv -f scripts/mtg/load-catalog.sql
-- Upserts every row and removes cards Scryfall no longer lists. Pool rows keep
-- their own snapshot, so nothing in mtg_collection changes.
\set ON_ERROR_STOP on
begin;

create temp table mtg_catalog_import (like public.mtg_catalog including defaults) on commit drop;

\set copy_cmd '\\copy mtg_catalog_import (oracle_id, name, mana_cost, mana_value, type_line, oracle_text, colors, power_toughness, loyalty, rarity, set_code, set_name, released_at, image_url, scryfall_uri) from ' :'csv' ' with (format csv)'
:copy_cmd

-- A truncated CSV must not wipe the catalog: Scryfall lists ~33k paper cards,
-- and a refresh never shrinks it by more than 2%.
do $guard$
declare
  incoming bigint := (select count(*) from mtg_catalog_import);
  current_size bigint := (select count(*) from public.mtg_catalog);
begin
  if incoming < 25000 or incoming < current_size * 0.98 then
    raise exception 'Only % cards in the CSV (catalog has %); refusing to replace the catalog', incoming, current_size;
  end if;
end
$guard$;

insert into public.mtg_catalog
select * from mtg_catalog_import
on conflict (oracle_id) do update set
  name = excluded.name,
  mana_cost = excluded.mana_cost,
  mana_value = excluded.mana_value,
  type_line = excluded.type_line,
  oracle_text = excluded.oracle_text,
  colors = excluded.colors,
  power_toughness = excluded.power_toughness,
  loyalty = excluded.loyalty,
  rarity = excluded.rarity,
  set_code = excluded.set_code,
  set_name = excluded.set_name,
  released_at = excluded.released_at,
  image_url = excluded.image_url,
  scryfall_uri = excluded.scryfall_uri;

delete from public.mtg_catalog c
where not exists (select 1 from mtg_catalog_import i where i.oracle_id = c.oracle_id);

select count(*) as catalog_cards from public.mtg_catalog;
commit;
