-- mtg_match_scan was security invoker. Under RLS, Postgres may only use an index
-- whose condition is leakproof, and mtg_norm() is not (only a superuser can mark
-- it so). Every reading then scanned all ~33k catalog and ~31k German names with
-- mtg_norm() per row: 24 readings took 4.4 s locally and hit the 8 s statement
-- timeout on prod (57014) on the first real photo.
--
-- Now security definer: it runs as the table owner, which RLS does not apply to,
-- so the expression and trigram indexes are used. It checks is_admin() itself
-- first, which is exactly what the RLS policies on the three tables it reads
-- check. Read-only (stable); execute stays revoked from anon. Body unchanged
-- otherwise (see 20261009120000_magic_scan.sql).

create or replace function public.mtg_match_scan(p_readings jsonb)
returns jsonb
language plpgsql
stable
security definer
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
  -- Runs as the owner (see the header), so check the caller here, first.
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
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

revoke execute on function public.mtg_match_scan(jsonb) from public, anon;
grant execute on function public.mtg_match_scan(jsonb) to authenticated;
