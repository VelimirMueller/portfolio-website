-- Magic scan backend: what the MTG Scanner app (and later the web) needs to turn
-- OCR readings into cards, add them in one go, and count deck ownership the
-- same way everywhere.
--
-- Adds: mtg_norm() (the shared name normalisation), mtg_printing (set + number),
-- mtg_card_name (German printed names), mtg_match_scan(), mtg_add_many(), and the
-- mtg_deck_ownership view. Printings and names are filled by
-- scripts/mtg/load-printings.sql. Additive only; nothing existing changes.

create extension if not exists unaccent with schema extensions;

-- 1. Name normalisation ------------------------------------------------------------
-- Must give the same result as LineFilter.normalize() in the app and norm() in
-- the spike: lowercase, accents removed, ß -> ss, curly apostrophe -> ', anything
-- but letters/digits/space/comma/apostrophe/hyphen -> space, whitespace collapsed.
-- The two-argument unaccent() with an explicit dictionary is what makes this safe
-- to declare immutable (and so usable in indexes and generated columns).
create or replace function public.mtg_norm(p_text text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select btrim(regexp_replace(regexp_replace(
           replace(replace(lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(p_text, ''))), 'ß', 'ss'), '’', ''''),
           '[^a-z0-9'',\- ]+', ' ', 'g'),
         '\s+', ' ', 'g'));
$$;

-- English front-face names of the catalog, normalised, for exact and fuzzy matching.
create index if not exists mtg_catalog_front_norm
  on public.mtg_catalog (public.mtg_norm(split_part(name, ' // ', 1)));
create index if not exists mtg_catalog_front_norm_trgm
  on public.mtg_catalog using gin (public.mtg_norm(split_part(name, ' // ', 1)) extensions.gin_trgm_ops);

-- 2. Printings: set + collector number -> card ------------------------------------
create table if not exists public.mtg_printing (
  set_code         text not null check (set_code ~ '^[a-z0-9]{2,6}$'),
  collector_number text not null check (length(collector_number) between 1 and 12),
  lang             text not null check (lang ~ '^[a-z]{2,3}$'),
  oracle_id        uuid not null references public.mtg_catalog (oracle_id) on delete cascade,
  primary key (set_code, collector_number, lang)
);
create index if not exists mtg_printing_oracle_id on public.mtg_printing (oracle_id);

-- 3. Printed names in other languages (German for now) ------------------------------
create table if not exists public.mtg_card_name (
  lang         text not null check (lang ~ '^[a-z]{2,3}$'),
  printed_name text not null check (length(printed_name) between 1 and 200),
  oracle_id    uuid not null references public.mtg_catalog (oracle_id) on delete cascade,
  name_norm    text generated always as (public.mtg_norm(printed_name)) stored,
  primary key (lang, printed_name, oracle_id)
);
create index if not exists mtg_card_name_norm on public.mtg_card_name (lang, name_norm);
create index if not exists mtg_card_name_norm_trgm on public.mtg_card_name using gin (name_norm extensions.gin_trgm_ops);
create index if not exists mtg_card_name_oracle_id on public.mtg_card_name (oracle_id);

alter table public.mtg_printing enable row level security;
alter table public.mtg_card_name enable row level security;

drop policy if exists "Admin can read printings" on public.mtg_printing;
create policy "Admin can read printings"
  on public.mtg_printing for select to authenticated using (public.is_admin());

drop policy if exists "Admin can read card names" on public.mtg_card_name;
create policy "Admin can read card names"
  on public.mtg_card_name for select to authenticated using (public.is_admin());

-- 4. Matching ------------------------------------------------------------------------
-- Input: a JSON array (max 50) of readings, one per card the phone saw:
--   { "name": "Eisiger Empfang", "set": "FRA", "number": 71, "lang": "de" }
-- every field optional, but a reading needs a name or set + number.
-- Output: one JSON object per reading, same order:
--   { index, status: matched|check|not_found, method, confidence, oracle_id, name,
--     lang, candidates: [{ oracle_id, name, score }] }
-- Ladder: printing (set + number) 1.0 > exact English name 0.95 > exact German
-- name 0.95 > trigram similarity >= 0.55 (up to 3 candidates).
-- "matched" = trust it; "check" = show candidates; "not_found" = search by hand.
create or replace function public.mtg_match_scan(p_readings jsonb)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_out     jsonb := '[]'::jsonb;
  v_item    jsonb;
  v_index   int := 0;
  v_name    text;
  v_norm    text;
  v_set     text;
  v_number  text;
  v_lang    text;
  v_oracle  uuid;
  v_card    text;
  v_clang   text;
  v_score   numeric;
  v_cands   jsonb;
  v_top     numeric;
  v_second  numeric;
  v_status  text;
  v_method  text;
begin
  if jsonb_typeof(p_readings) <> 'array' then
    raise exception 'readings must be a JSON array';
  end if;
  if jsonb_array_length(p_readings) > 50 then
    raise exception 'at most 50 readings per call';
  end if;

  for v_item in select * from jsonb_array_elements(p_readings) loop
    v_name   := left(nullif(btrim(v_item ->> 'name'), ''), 200);
    v_norm   := public.mtg_norm(v_name);
    v_set    := lower(left(nullif(btrim(v_item ->> 'set'), ''), 6));
    v_number := nullif(ltrim(left(btrim(v_item ->> 'number'), 12), '0'), '');
    v_lang   := lower(left(nullif(btrim(v_item ->> 'lang'), ''), 3));
    v_oracle := null; v_card := null; v_clang := null; v_score := null;
    v_cands  := '[]'::jsonb;
    v_status := 'not_found';
    v_method := null;

    -- 1) Exact printing. The language from the info line picks the printing when
    --    known; otherwise any language of that set + number.
    if v_set is not null and v_number is not null then
      select p.oracle_id, c.name, p.lang, 1.0
        into v_oracle, v_card, v_clang, v_score
        from public.mtg_printing p
        join public.mtg_catalog c using (oracle_id)
       where p.set_code = v_set and p.collector_number = v_number
       order by (p.lang = coalesce(v_lang, 'en')) desc, p.lang
       limit 1;
      if found then
        v_method := 'printing';
        -- A name that clearly disagrees with the printing means a misread number
        -- or a mis-paired line: ask instead of trusting either. 0.5 sits in the gap
        -- measured on real names: different cards sharing a word score 0.24-0.40
        -- ("Garruk, Curse Breaker" vs "Garruk, Veiled Butcher" 0.27), OCR typos of
        -- the same card 0.58-0.74 ("Theorix Metamae" 0.74, "Rolling Canopy" 0.67).
        if v_norm <> '' and extensions.similarity(v_norm, public.mtg_norm(split_part(v_card, ' // ', 1))) < 0.5
           and not exists (select 1 from public.mtg_card_name n
                            where n.oracle_id = v_oracle
                              and extensions.similarity(v_norm, n.name_norm) >= 0.5) then
          v_status := 'check';
        else
          v_status := 'matched';
        end if;
      end if;
    end if;

    -- 2) Exact English front name, 3) exact German printed name.
    if v_oracle is null and v_norm <> '' then
      select c.oracle_id, c.name, 'en', 0.95
        into v_oracle, v_card, v_clang, v_score
        from public.mtg_catalog c
       where public.mtg_norm(split_part(c.name, ' // ', 1)) = v_norm
       limit 1;
      if found then
        v_method := 'exact_en';
        v_status := 'matched';
      else
        select n.oracle_id, c.name, n.lang, 0.95
          into v_oracle, v_card, v_clang, v_score
          from public.mtg_card_name n
          join public.mtg_catalog c using (oracle_id)
         where n.name_norm = v_norm
         order by (n.lang = 'de') desc
         limit 1;
        if found then
          v_method := 'exact_' || v_clang;
          v_status := 'matched';
        end if;
      end if;
    end if;

    -- 4) Fuzzy: best names in English and German; up to 3 cards.
    if v_oracle is null and length(v_norm) >= 4 then
      with scored as (
        select c.oracle_id, c.name, 'en'::text as lang,
               extensions.similarity(public.mtg_norm(split_part(c.name, ' // ', 1)), v_norm) as score
          from public.mtg_catalog c
         where public.mtg_norm(split_part(c.name, ' // ', 1)) operator(extensions.%) v_norm
        union all
        select n.oracle_id, c.name, n.lang, extensions.similarity(n.name_norm, v_norm)
          from public.mtg_card_name n
          join public.mtg_catalog c using (oracle_id)
         where n.name_norm operator(extensions.%) v_norm
      ), best as (
        select distinct on (oracle_id) oracle_id, name, lang, score
          from scored
         where score >= 0.55
         order by oracle_id, score desc
      ), top3 as (
        select * from best order by score desc, name limit 3
      )
      select coalesce(jsonb_agg(jsonb_build_object('oracle_id', oracle_id, 'name', name, 'lang', lang,
                                                    'score', round(score::numeric, 3))
                                order by score desc, name), '[]'::jsonb)
        into v_cands
        from top3;

      if jsonb_array_length(v_cands) > 0 then
        v_top    := (v_cands -> 0 ->> 'score')::numeric;
        v_second := (v_cands -> 1 ->> 'score')::numeric;
        v_oracle := (v_cands -> 0 ->> 'oracle_id')::uuid;
        v_card   := v_cands -> 0 ->> 'name';
        v_clang  := v_cands -> 0 ->> 'lang';
        v_score  := v_top;
        v_method := 'fuzzy';
        -- Trust a fuzzy hit only when it is strong and clearly ahead of the next one.
        v_status := case when v_top >= 0.9 and (v_second is null or v_second <= v_top - 0.1)
                         then 'matched' else 'check' end;
      end if;
    end if;

    v_out := v_out || jsonb_build_array(jsonb_build_object(
      'index', v_index,
      'status', v_status,
      'method', v_method,
      'confidence', v_score,
      'oracle_id', v_oracle,
      'name', v_card,
      'lang', coalesce(v_lang, v_clang),
      'candidates', v_cands
    ));
    v_index := v_index + 1;
  end loop;

  return v_out;
end;
$$;

-- 5. Add many cards at once -----------------------------------------------------------
-- Input: JSON array (max 100) of { oracle_id, qty, copies_de?, name_de?, note? }.
-- Runs mtg_add_to_pool for each in one transaction: all rows are added or none.
-- Returns the number of cards added (sum of qty).
create or replace function public.mtg_add_many(p_items jsonb)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item  jsonb;
  v_total integer := 0;
  v_qty   integer;
begin
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'items must be a JSON array';
  end if;
  if jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 100 then
    raise exception 'between 1 and 100 items per call';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    if coalesce(v_item ->> 'oracle_id', '') !~ '^[0-9a-f-]{36}$' then
      raise exception 'item without a valid oracle_id: %', v_item;
    end if;
    if coalesce(v_item ->> 'qty', '') !~ '^[0-9]{1,3}$' or (v_item ->> 'qty')::integer < 1 then
      raise exception 'item needs qty between 1 and 999: %', v_item;
    end if;
    v_qty := (v_item ->> 'qty')::integer;
    if public.mtg_add_to_pool(
         (v_item ->> 'oracle_id')::uuid,
         v_qty,
         coalesce((v_item ->> 'copies_de')::integer, 0),
         left(nullif(btrim(v_item ->> 'name_de'), ''), 200),
         left(nullif(btrim(v_item ->> 'note'), ''), 500)
       ) is null then
      raise exception 'could not add %', v_item ->> 'oracle_id';
    end if;
    v_total := v_total + v_qty;
  end loop;
  return v_total;
end;
$$;

-- 6. Deck ownership -------------------------------------------------------------------
-- How many copies of each deck line the pool covers. A copy fills a main-deck
-- slot before a sideboard slot (lines of one card are consumed in that order).
-- Upgrades are plans and are not counted. The web and the app both read this.
create or replace view public.mtg_deck_ownership
with (security_invoker = true)
as
select dc.id,
       dc.deck_id,
       dc.oracle_id,
       dc.section,
       dc.position,
       dc.qty,
       least(dc.qty, greatest(0, coalesce(p.owned_qty, 0)
                                - (sum(dc.qty) over w - dc.qty)))::integer as owned
  from public.mtg_deck_card dc
  left join public.mtg_collection p using (oracle_id)
 where dc.section in ('main', 'sideboard')
window w as (partition by dc.deck_id, dc.oracle_id
             order by case dc.section when 'main' then 0 else 1 end, dc.position
             rows between unbounded preceding and current row);

revoke execute on function public.mtg_match_scan(jsonb) from public, anon;
revoke execute on function public.mtg_add_many(jsonb) from public, anon;
grant execute on function public.mtg_match_scan(jsonb) to authenticated;
grant execute on function public.mtg_add_many(jsonb) to authenticated;
grant execute on function public.mtg_norm(text) to authenticated;
