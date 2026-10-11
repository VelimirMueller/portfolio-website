-- mtg_import_deck was security invoker. Under RLS, Postgres may only use an index
-- whose condition is leakproof, and mtg_norm() is not, so every pasted line
-- scanned the whole catalog (~33k cards) with mtg_norm() per row. The first real
-- import (a 60-card list) hit the 8 s statement timeout on prod (57014), the
-- same trap as mtg_match_scan (20261009190000_match_scan_definer.sql).
--
-- Now security definer: it runs as the table owner, which RLS does not apply to,
-- so the expression and trigram indexes are used. It checks is_admin() itself
-- first, which is exactly what the RLS policies on mtg_catalog, mtg_card_name,
-- mtg_deck and mtg_deck_card check. Typo suggestions need similarity >= 0.5
-- (was the pg_trgm default 0.3). Body unchanged otherwise
-- (see 20261011120000_magic_deck_import.sql).

create or replace function public.mtg_import_deck(p_name text, p_slug text, p_summary text, p_lines jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_line       jsonb;
  v_index      integer := 0;
  v_name       text;
  v_norm       text;
  v_section    text;
  v_qty        integer;
  v_hits       uuid[];
  v_resolved   jsonb := '[]'::jsonb;
  v_unresolved jsonb := '[]'::jsonb;
  v_deck_id    uuid;
  v_main       integer;
  v_side       integer;
begin
  -- Runs as the owner, so RLS does not apply: this check replaces the policies.
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  -- Suggestions only for close typos. The default 0.3 lets a shared word ("Goblin")
  -- match hundreds of cards, and each one is scored; 0.5 keeps that bounded.
  -- Transaction-local.
  perform set_config('pg_trgm.similarity_threshold', '0.5', true);
  if coalesce(btrim(p_name), '') = '' or length(btrim(p_name)) > 80 then
    raise exception 'deck name must have 1 to 80 characters';
  end if;
  if coalesce(p_slug, '') !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug) > 80 then
    raise exception 'invalid slug: %', p_slug;
  end if;
  if jsonb_typeof(p_lines) is distinct from 'array'
     or jsonb_array_length(p_lines) = 0 or jsonb_array_length(p_lines) > 250 then
    raise exception 'lines must be a JSON array of 1 to 250 lines';
  end if;

  for v_line in select * from jsonb_array_elements(p_lines) loop
    v_section := v_line ->> 'section';
    v_name    := left(btrim(coalesce(v_line ->> 'name', '')), 200);
    if v_section is null or v_section not in ('main', 'sideboard') then
      raise exception 'line % has no valid section', v_index;
    end if;
    if coalesce(v_line ->> 'qty', '') !~ '^[0-9]{1,2}$' or (v_line ->> 'qty')::integer < 1 then
      raise exception 'line % needs qty between 1 and 99', v_index;
    end if;
    v_qty  := (v_line ->> 'qty')::integer;
    v_norm := public.mtg_norm(split_part(v_name, ' // ', 1));

    select array_agg(distinct c.oracle_id) into v_hits
      from public.mtg_catalog c
     where v_norm <> '' and public.mtg_norm(split_part(c.name, ' // ', 1)) = v_norm;
    if v_hits is null then
      select array_agg(distinct n.oracle_id) into v_hits
        from public.mtg_card_name n
       where v_norm <> '' and n.name_norm = v_norm;
    end if;

    if cardinality(v_hits) = 1 then
      v_resolved := v_resolved || jsonb_build_object(
        'idx', v_index, 'section', v_section, 'qty', v_qty, 'oracle_id', v_hits[1]);
    else
      v_unresolved := v_unresolved || jsonb_build_object(
        'index', v_index,
        'name', v_name,
        'candidates', coalesce((
          select jsonb_agg(t.name order by t.score desc, t.name)
            from (select c.name,
                         extensions.similarity(public.mtg_norm(split_part(c.name, ' // ', 1)), v_norm) as score
                    from public.mtg_catalog c
                   where v_norm <> ''
                     and case when v_hits is not null
                              then c.oracle_id = any (v_hits)   -- ambiguous: exactly the cards it hit
                              else public.mtg_norm(split_part(c.name, ' // ', 1)) operator(extensions.%) v_norm
                         end
                   order by score desc, c.name
                   limit 3) t
        ), '[]'::jsonb));
    end if;
    v_index := v_index + 1;
  end loop;

  if jsonb_array_length(v_unresolved) > 0 then
    return jsonb_build_object('status', 'unresolved', 'names', v_unresolved);
  end if;

  select coalesce(sum(qty) filter (where section = 'main'), 0),
         coalesce(sum(qty) filter (where section = 'sideboard'), 0)
    into v_main, v_side
    from jsonb_to_recordset(v_resolved) as l(section text, qty integer);
  if v_main = 0 then
    raise exception 'the main deck is empty';
  end if;

  -- Deck colors: every color of every card, in WUBRG order. The unique slug decides
  -- "exists", so two imports at the same time cannot both create the deck.
  begin
    insert into public.mtg_deck (slug, name, summary, colors, main_size, sideboard_size)
    values (p_slug, btrim(p_name), left(btrim(coalesce(p_summary, '')), 500),
            array(select x.color
                    from unnest(array['W', 'U', 'B', 'R', 'G']) with ordinality as x(color, ord)
                   where exists (select 1
                                   from jsonb_to_recordset(v_resolved) as l(oracle_id uuid)
                                   join public.mtg_catalog c using (oracle_id)
                                  where x.color = any (c.colors))
                   order by x.ord),
            v_main, v_side)
    returning id into v_deck_id;
  exception when unique_violation then
    return jsonb_build_object('status', 'exists');
  end;

  -- The same card twice in one section (a pasted list may split it) becomes one line.
  -- Position follows the pasted order.
  insert into public.mtg_deck_card (deck_id, oracle_id, section, qty, position)
  select v_deck_id, oracle_id, section, sum(qty),
         row_number() over (partition by section order by min(idx))
    from jsonb_to_recordset(v_resolved) as l(idx integer, section text, qty integer, oracle_id uuid)
   group by section, oracle_id;

  return jsonb_build_object('status', 'created', 'slug', p_slug, 'main', v_main, 'sideboard', v_side);
end;
$$;

revoke all on function public.mtg_import_deck(text, text, text, jsonb) from public, anon;
grant execute on function public.mtg_import_deck(text, text, text, jsonb) to authenticated;
