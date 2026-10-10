-- mtg_match_scan: a unique-prefix step between the exact names and fuzzy.
-- The first 27-card test photo (testdata case 6eabc990, 2026-10-10) had names
-- cut off at the edge or by glare: "Way of the Cryoma", "Endlose Kursarbei",
-- "Chandra., Chill of Complian". Fuzzy similarity of a cut-off name stays under
-- p_sure_min, so each became a "Which card?" question although only one card
-- starts with that text. Rest of the body unchanged from 20261009210000.

create or replace function public.mtg_match_scan(
  p_readings jsonb,
  p_fuzzy_min numeric default 0.55,
  p_sure_min  numeric default 0.9,
  p_agree_min numeric default 0.5
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  -- Thresholds from the app's settings, clamped to what makes sense: below 0.3
  -- the trigram operator (%) finds nothing anyway; above 1 nothing matches.
  v_fuzzy   numeric := least(greatest(coalesce(p_fuzzy_min, 0.55), 0.3), 1);
  v_sure    numeric := least(greatest(coalesce(p_sure_min, 0.9), 0.3), 1);
  v_agree   numeric := least(greatest(coalesce(p_agree_min, 0.5), 0), 1);
  v_out     jsonb := '[]'::jsonb;
  v_prefix  text;
  v_like    text;
  v_full    int;
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
        if v_norm <> '' and extensions.similarity(v_norm, public.mtg_norm(split_part(v_card, ' // ', 1))) < v_agree
           and not exists (select 1 from public.mtg_card_name n
                            where n.oracle_id = v_oracle
                              and extensions.similarity(v_norm, n.name_norm) >= v_agree) then
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

    -- 3b) Unique prefix: a name cut off at the photo edge or by glare
    --     ("Way of the Cryoma", "Endlose Kursarbei") in English, German or French.
    --     Trusted only when it is at least 8 characters and half the name long,
    --     and exactly one card starts with it. " ," from OCR punctuation is closed
    --     up first ("Chandra., Chill" -> "chandra, chill").
    if v_oracle is null and length(v_norm) >= 8 then
      v_prefix := regexp_replace(v_norm, ' ([,''])', '\1', 'g');
      v_like := replace(replace(replace(v_prefix, '\', '\\'), '%', '\%'), '_', '\_') || '%';
      with hits as (
        select c.oracle_id, c.name, 'en'::text as lang, length(public.mtg_norm(split_part(c.name, ' // ', 1))) as full_len
          from public.mtg_catalog c
         where public.mtg_norm(split_part(c.name, ' // ', 1)) like v_like
        union all
        select n.oracle_id, c.name, n.lang, length(n.name_norm)
          from public.mtg_card_name n
          join public.mtg_catalog c using (oracle_id)
         where n.name_norm like v_like
      ), cards as (
        select oracle_id, min(name) as name, min(lang) as lang, max(full_len) as full_len
          from hits group by oracle_id
      )
      select oracle_id, name, lang, full_len into v_oracle, v_card, v_clang, v_full
        from cards
       where (select count(*) from cards) = 1;
      if v_oracle is not null and length(v_prefix) * 2 >= v_full then
        v_method := 'prefix';
        v_score := 0.9;
        v_status := 'matched';
      else
        v_oracle := null; v_card := null; v_clang := null;
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
         where score >= v_fuzzy
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
        v_status := case when v_top >= v_sure and (v_second is null or v_second <= v_top - 0.1)
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

revoke execute on function public.mtg_match_scan(jsonb, numeric, numeric, numeric) from public, anon;
grant execute on function public.mtg_match_scan(jsonb, numeric, numeric, numeric) to authenticated;
