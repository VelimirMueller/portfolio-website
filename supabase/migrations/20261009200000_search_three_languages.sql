-- Catalog search in English, German and French. Velimir owns cards in all three
-- languages, so mtg_search_catalog (web "Add card" page and the Android app) now
-- also matches the printed names in mtg_card_name (any lang), not only the
-- English catalog name.
--
-- English: lower(name) like '%query%', as in 20261008150000_magic_v2.sql
-- (trigram index mtg_catalog_name_trgm, % and _ taken literally).
-- Printed names: accent-insensitive, name_norm like '%' || mtg_norm(query) || '%'
-- ("starke des stiers" finds "Stärke des Stiers", "ile" finds "Île ...");
-- trigram index mtg_card_name_norm_trgm.
--
-- Security definer for the same reason as mtg_match_scan
-- (20261009190000_match_scan_definer.sql): under RLS Postgres may not use an
-- index on a non-leakproof expression, so every search would scan both tables.
-- It runs as the owner and checks is_admin() itself first, which is exactly what
-- the RLS policies on mtg_catalog and mtg_card_name check. Read-only (stable).
--
-- Rank per card by its best hit over all names: exact 0, prefix 1, word start 2,
-- anywhere 3; ties by English name. One row per card. Returns limit + 1 rows so
-- the caller can tell there are more.

create or replace function public.mtg_search_catalog(p_query text, p_limit integer default 24)
returns setof public.mtg_catalog
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  -- Runs as the owner (see the header), so check the caller here, first.
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  return query
  with q as (
    select t.text,
           replace(replace(replace(t.text, '\', '\\'), '%', '\%'), '_', '\_') as pattern,
           '(^|[\s,/-])' || regexp_replace(t.text, '([^a-z0-9])', '\\\1', 'g') as word,
           t.norm,
           replace(replace(replace(t.norm, '\', '\\'), '%', '\%'), '_', '\_') as norm_pattern,
           '(^|[\s,/-])' || regexp_replace(t.norm, '([^a-z0-9])', '\\\1', 'g') as norm_word
      from (select lower(btrim(p_query)) as text, public.mtg_norm(p_query) as norm) t
     where length(t.text) >= 2
  ), hits as (
    select c.oracle_id,
           case
             when lower(c.name) = q.text then 0
             when lower(c.name) like q.pattern || '%' then 1
             when lower(c.name) ~ q.word then 2
             else 3
           end as rank
      from public.mtg_catalog c, q
     where lower(c.name) like '%' || q.pattern || '%'
    union all
    select n.oracle_id,
           case
             when n.name_norm = q.norm then 0
             when n.name_norm like q.norm_pattern || '%' then 1
             when n.name_norm ~ q.norm_word then 2
             else 3
           end
      from public.mtg_card_name n, q
     where length(q.norm) >= 2
       and n.name_norm like '%' || q.norm_pattern || '%'
  ), best as (
    select h.oracle_id, min(h.rank) as rank
      from hits h
     group by h.oracle_id
  )
  select c.*
    from best b
    join public.mtg_catalog c on c.oracle_id = b.oracle_id
   order by b.rank, c.name
   limit least(greatest(p_limit, 1), 100) + 1;
end;
$$;

revoke execute on function public.mtg_search_catalog(text, integer) from public, anon;
grant execute on function public.mtg_search_catalog(text, integer) to authenticated;
