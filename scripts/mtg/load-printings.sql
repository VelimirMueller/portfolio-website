-- Loads the CSVs from build-printings.mjs into public.mtg_printing and
-- public.mtg_card_name. Both are reference data nothing else points at, so the
-- tables are replaced as a whole, after the size guards pass.
--   psql "$SUPABASE_DB_URL" -v printings=/path/printings.csv -v names=/path/names.csv -f scripts/mtg/load-printings.sql
\set ON_ERROR_STOP on
begin;

create temp table printing_import (oracle_id uuid, set_code text, collector_number text, lang text) on commit drop;
create temp table name_import (lang text, printed_name text, oracle_id uuid) on commit drop;

\set copy_printings '\\copy printing_import (oracle_id, set_code, collector_number, lang) from ' :'printings' ' with (format csv)'
:copy_printings
\set copy_names '\\copy name_import (lang, printed_name, oracle_id) from ' :'names' ' with (format csv)'
:copy_names

-- A truncated CSV must not shrink the tables: Scryfall has ~120k English+German
-- paper printings and ~30k German names; a refresh never loses more than 2 %.
do $guard$
declare
  p_in bigint := (select count(*) from printing_import);
  n_in bigint := (select count(*) from name_import);
  p_now bigint := (select count(*) from public.mtg_printing);
  n_now bigint := (select count(*) from public.mtg_card_name);
begin
  if p_in < 80000 or p_in < p_now * 0.98 then
    raise exception 'Only % printings in the CSV (table has %); refusing to replace', p_in, p_now;
  end if;
  if n_in < 20000 or n_in < n_now * 0.98 then
    raise exception 'Only % names in the CSV (table has %); refusing to replace', n_in, n_now;
  end if;
end
$guard$;

delete from public.mtg_printing;
delete from public.mtg_card_name;

-- Only cards the catalog knows (the catalog skips tokens, art cards, digital-only).
insert into public.mtg_printing (set_code, collector_number, lang, oracle_id)
select distinct on (i.set_code, i.collector_number, i.lang) i.set_code, i.collector_number, i.lang, i.oracle_id
  from printing_import i
  join public.mtg_catalog c using (oracle_id)
 where i.set_code ~ '^[a-z0-9]{2,6}$' and length(i.collector_number) between 1 and 12
 order by i.set_code, i.collector_number, i.lang;

insert into public.mtg_card_name (lang, printed_name, oracle_id)
select distinct i.lang, i.printed_name, i.oracle_id
  from name_import i
  join public.mtg_catalog c using (oracle_id)
 where length(i.printed_name) between 1 and 200;

-- Rows lost to validation or unknown cards (tokens, digital-only); a big number
-- here means a bad export even when the size guard passed.
select (select count(*) from public.mtg_printing) as printings,
       (select count(*) from printing_import) - (select count(*) from public.mtg_printing) as printings_dropped,
       (select count(*) from public.mtg_card_name) as names,
       (select count(*) from name_import) - (select count(*) from public.mtg_card_name) as names_dropped;
commit;
