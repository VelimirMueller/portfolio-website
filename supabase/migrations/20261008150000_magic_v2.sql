-- Magic v2: the pool references the catalog instead of copying it, and decks
-- live in the database.
--
-- Runs once, after 20261008120000 / 120100 / 130000, with the catalog loaded.
-- Steps: resolve the cards read from photos, clean the seed notes, one pool
-- row per card, drop the copied card columns, add decks (seed "Stapelbruch"),
-- replace the write and search functions. Run it as one transaction.

-- 0. Preconditions ----------------------------------------------------------------
do $pre$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'mtg_collection' and column_name = 'status') then
    raise exception 'magic v2 is already applied (mtg_collection.status is gone)';
  end if;
  if (select count(*) from public.mtg_catalog) < 25000 then
    raise exception 'load the catalog first (scripts/mtg/load-catalog.sql)';
  end if;
end
$pre$;

-- 1. Resolve the cards read from photos -------------------------------------------
-- Matched by rules text and type on Scryfall (2026-10-08). The two titles with
-- no match are dropped; they get re-added by name later.
update public.mtg_collection p
   set oracle_id = c.oracle_id
  from (values
          ('Fell Grasp',           'Last Gasp'),
          ('Hallway Hexer',        'Hallway Heckler // Vicious Verse'),
          ('Endflame Battler',     'Eardrum Rattler'),
          ('Marwyn, the Observer', 'Marwyn, the Clearcutter')
       ) as fix(photo_name, real_name)
  join public.mtg_catalog c on c.name = fix.real_name
 where p.oracle_id is null and p.name = fix.photo_name;

delete from public.mtg_collection
 where oracle_id is null and name in ('Calamitous Fury', 'Wrath of the Revolution');

do $resolved$
begin
  if exists (select 1 from public.mtg_collection where oracle_id is null) then
    raise exception 'unresolved pool rows: %',
      (select string_agg(name, ', ') from public.mtg_collection where oracle_id is null);
  end if;
  if exists (select 1 from public.mtg_collection p
             where not exists (select 1 from public.mtg_catalog c where c.oracle_id = p.oracle_id)) then
    raise exception 'pool rows whose card is not in the catalog';
  end if;
end
$resolved$;

-- 2. Clean the seed notes ---------------------------------------------------------
-- They were photo-transcription remarks ("FRA #75", "listed as …"). Only facts
-- about the copies stay. Rows added by hand after the seed keep their notes.
create temp table mtg_full_art on commit drop as
  select oracle_id, sum(owned_qty) as copies
    from public.mtg_collection
   where note like '%Full-art printing.%'
   group by oracle_id;

update public.mtg_collection
   set note = case when note like '%One copy is foil.%' then 'One copy is foil.' end
 where created_at = (select min(created_at) from public.mtg_collection);

-- 3. One row per card (basic and full-art lands were two rows) --------------------
with grouped as (
  select oracle_id,
         (array_agg(id order by created_at, id))[1] as keep_id,
         sum(owned_qty)                             as owned,
         sum(copies_de)                             as de,
         max(name_de)                               as name_de,
         string_agg(note, ' ' order by created_at)  as note
    from public.mtg_collection
   group by oracle_id
  having count(*) > 1
)
update public.mtg_collection p
   set owned_qty = g.owned, copies_de = g.de, name_de = g.name_de, note = g.note
  from grouped g
 where p.id = g.keep_id;

delete from public.mtg_collection p
 where exists (select 1 from public.mtg_collection k
                where k.oracle_id = p.oracle_id
                  and (k.created_at, k.id) < (p.created_at, p.id));

update public.mtg_collection p
   set note = concat_ws(' ', f.copies || ' full art.', p.note)
  from mtg_full_art f
 where p.oracle_id = f.oracle_id;

-- 4. The pool references the catalog ---------------------------------------------
alter table public.mtg_collection
  drop column name,
  drop column colors,
  drop column type_line,
  drop column mana_cost,
  drop column mana_value,
  drop column power_toughness,
  drop column oracle_text,
  drop column short,
  drop column status,
  drop column image_url,
  drop column scryfall_uri,
  alter column oracle_id set not null,
  add constraint mtg_collection_oracle_id_fkey
    foreign key (oracle_id) references public.mtg_catalog (oracle_id) on delete restrict;

drop index if exists public.mtg_collection_oracle_id;
alter table public.mtg_collection
  add constraint mtg_collection_oracle_id_key unique (oracle_id);

-- 5. Decks ------------------------------------------------------------------------
create table public.mtg_deck (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name           text not null,
  summary        text not null default '',
  colors         text[] not null default '{}' check (colors <@ array['W', 'U', 'B', 'R', 'G']),
  main_size      integer not null default 60 check (main_size > 0),
  sideboard_size integer not null default 15 check (sideboard_size >= 0),
  -- Planned shipping for buying the missing cards in one order.
  shipping_eur   numeric(8, 2) not null default 0 check (shipping_eur >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- One row per card and section. Section meaning of the text columns:
--   main      note = its job in the deck
--   sideboard note = what it is against, swap_out = what leaves the main deck
--   upgrade   note = why,                swap_out = what it replaces; position = step
create table public.mtg_deck_card (
  id        uuid primary key default gen_random_uuid(),
  deck_id   uuid not null references public.mtg_deck (id) on delete cascade,
  oracle_id uuid not null references public.mtg_catalog (oracle_id) on delete restrict,
  section   text not null check (section in ('main', 'sideboard', 'upgrade')),
  qty       integer not null check (qty > 0),
  position  integer not null,
  note      text not null default '',
  swap_out  text,
  -- Planned price per copy (cheapest near-mint, EUR) for the shopping list.
  price_eur numeric(8, 2) check (price_eur >= 0),
  unique (deck_id, section, oracle_id),
  unique (deck_id, section, position)
);

create index mtg_deck_card_oracle_id on public.mtg_deck_card (oracle_id);

drop trigger if exists mtg_deck_touch on public.mtg_deck;
create trigger mtg_deck_touch
  before update on public.mtg_deck
  for each row execute function public.mtg_touch_updated_at();

alter table public.mtg_deck enable row level security;
alter table public.mtg_deck_card enable row level security;

create policy "Admin manages decks"
  on public.mtg_deck for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin manages deck cards"
  on public.mtg_deck_card for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seed: "Stapelbruch" (stapelbruch_deck.pdf), fixed on 2026-10-08 to 60 + 15
-- mono-blue: 23 Islands, and Perfected Theory / Bitter Chill instead of the
-- black Multiply by Zero / Extended Absence.
with deck as (
  insert into public.mtg_deck (slug, name, summary, colors, shipping_eur)
  values ('stapelbruch', 'Stapelbruch',
          'Mono-blue kitchen-table deck against 2013 Goblins and artifact decks. Keep two mana open, counter Krenko and the haste card on the stack, bounce the rest when it attacks.',
          array['U'], 8)
  returning id
),
cards (section, position, qty, name, note, swap_out, price_eur) as (
  values
    ('main',  1, 4,  'Countersculpt',                'Counters any spell. Krenko dies on the stack. Jace +1.', null, null),
    ('main',  2, 4,  'Essence Scatter',              'Creatures only. The cheap second counter.', null, 0.38),
    ('main',  3, 1,  'Icy Reception',                'Creature or legendary spell unless they pay {3}, or −5/−0.', null, null),
    ('main',  4, 4,  'Aetherize',                    'All attackers back to hand. The answer to the token swarm.', null, null),
    ('main',  5, 3,  'Unsummon',                     'One creature back before it attacks or taps.', null, 0.25),
    ('main',  6, 2,  'Into the Roil',                'Bounce; kicked for {1}{U} more, also draw a card.', null, 0.75),
    ('main',  7, 4,  'Opt',                          'Finds counters and lands. Keeps the deck running.', null, 0.38),
    ('main',  8, 1,  'Cyclonic Rift',                'One permanent back. Overload {6}{U}: everything of theirs.', null, 22),
    ('main',  9, 1,  'Infinite Coursework',          'Taps, removes all abilities, never untaps. Krenko or an artifact.', null, null),
    ('main', 10, 1,  'Plan for All Outcomes',        'One permanent into the library. Jace every turn.', null, null),
    ('main', 11, 3,  'Theorist''s Proxy',            '0/3 flash blocker. Sacrifice: the next spell can''t be countered.', null, null),
    ('main', 12, 2,  'Traxos, Academy Guardian',     '1/5 flier. Costs 2 less after a noncreature spell.', null, null),
    ('main', 13, 1,  'Divining Duelist',             'Flash. Taps a creature when it enters.', null, null),
    ('main', 14, 1,  'Surveillance Phantasm',        '2/3 flier, defender.', null, null),
    ('main', 15, 1,  'Cryotheory Adept',             'From the graveyard: tap and stun.', null, null),
    ('main', 16, 1,  'Chandra, Chill of Compliance', '−X taps and stuns. Card draw later.', null, null),
    ('main', 17, 1,  'Way of the Cryomancer',        'Jace 5. Planeswalkers copy your next spell.', null, null),
    ('main', 18, 1,  'Protege''s Awakening',         'Jace 6, one card.', null, null),
    ('main', 19, 1,  'Sphinx''s Approach',           'Two cards.', null, null),
    ('main', 20, 23, 'Island',                       'Only Islands. No splash, no bad mana.', null, 0.17),
    ('sideboard', 1, 4, 'Annul',            'Artifacts and enchantments', '2 Essence Scatter, 2 Aetherize', 0.50),
    ('sideboard', 2, 2, 'Hurkyl''s Recall', 'A full artifact board', '2 Theorist''s Proxy', 3),
    ('sideboard', 3, 3, 'Negate',           'Slow decks, big spells from 4 mana', '3 Essence Scatter', 0.50),
    ('sideboard', 4, 2, 'Disperse',         'One strong permanent', '1 Unsummon, 1 Opt', 0.50),
    ('sideboard', 5, 2, 'Perfected Theory', 'A big creature that did not die on the stack', '1 Surveillance Phantasm, 1 Opt', 0.02),
    ('sideboard', 6, 2, 'Bitter Chill',     'A creature that must stay down, not just bounce', '1 Cryotheory Adept, 1 Unsummon', 0.12),
    ('upgrade', 1, 1, 'Otawara, Soaring City',     'An Island that bounces a creature late. No color problem.', '1 Island', null),
    ('upgrade', 2, 1, 'Cyclonic Rift',             'Overload is the best play of the deck. A second copy finds it more often.', '1 Aetherize', null),
    ('upgrade', 3, 1, 'Mana Drain',                'Counter, and the mana stays for your turn. Expensive, the biggest single upgrade.', '1 Countersculpt', null),
    ('upgrade', 4, 1, 'Rhystic Study',             'Draws every turn against slow decks. Weaker against Goblins.', '1 Sphinx''s Approach', null),
    ('upgrade', 5, 1, 'Force of Will',             'A counter without mana, for the one turn you are tapped out.', '1 Essence Scatter', null),
    ('upgrade', 6, 1, 'Consecrated Sphinx',        'The finisher against slow decks. Draws two when they draw.', '1 Traxos, Academy Guardian', null),
    ('upgrade', 7, 1, 'Teferi, Hero of Dominaria', 'Draws, untaps lands, and the emblem clears the board.', 'Chandra, Chill of Compliance', null)
)
insert into public.mtg_deck_card (deck_id, oracle_id, section, position, qty, note, swap_out, price_eur)
select deck.id, c.oracle_id, cards.section, cards.position, cards.qty, cards.note, cards.swap_out, cards.price_eur
  from cards
  cross join deck
  join public.mtg_catalog c on c.name = cards.name;

do $deck$
begin
  if (select count(*) from public.mtg_deck_card) <> 33 then
    raise exception 'Stapelbruch seed: % of 33 cards found in the catalog', (select count(*) from public.mtg_deck_card);
  end if;
end
$deck$;

-- 6. Functions --------------------------------------------------------------------
-- Adds copies of a catalog card in one statement: new row, or more copies on the
-- existing one (one row per card). security invoker: RLS decides.
drop function if exists public.mtg_add_to_pool(uuid, integer, integer, text, text);
create function public.mtg_add_to_pool(
  p_oracle_id uuid,
  p_qty integer,
  p_copies_de integer default 0,
  p_name_de text default null,
  p_note text default null
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  insert into public.mtg_collection (oracle_id, owned_qty, copies_de, name_de, note)
  values (p_oracle_id, p_qty, p_copies_de, p_name_de, p_note)
  on conflict (oracle_id) do update
     set owned_qty = public.mtg_collection.owned_qty + excluded.owned_qty,
         copies_de = public.mtg_collection.copies_de + excluded.copies_de,
         name_de   = coalesce(public.mtg_collection.name_de, excluded.name_de),
         note      = nullif(concat_ws(' ', public.mtg_collection.note, excluded.note), '')
  returning id;
$$;

-- Catalog search by name: exact match, then prefix, then word start, then
-- anywhere; ties by name. Returns up to p_limit + 1 rows so the caller can tell
-- that more matched. The query is matched literally (% and _ are not wildcards).
create or replace function public.mtg_search_catalog(p_query text, p_limit integer default 24)
returns setof public.mtg_catalog
language sql
stable
security invoker
set search_path = ''
as $$
  with q as (
    select lower(btrim(p_query)) as text,
           replace(replace(replace(lower(btrim(p_query)), '\', '\\'), '%', '\%'), '_', '\_') as pattern
  )
  select c.*
    from public.mtg_catalog c, q
   where length(q.text) >= 2
     and lower(c.name) like '%' || q.pattern || '%'
   order by case
              when lower(c.name) = q.text then 0
              when lower(c.name) like q.pattern || '%' then 1
              when lower(c.name) ~ ('(^|[\s,/-])' || regexp_replace(q.text, '([^a-z0-9])', '\\\1', 'g')) then 2
              else 3
            end,
            c.name
   limit least(greatest(p_limit, 1), 100) + 1;
$$;

revoke execute on function public.mtg_add_to_pool(uuid, integer, integer, text, text) from public, anon;
revoke execute on function public.mtg_search_catalog(text, integer) from public, anon;
grant execute on function public.mtg_add_to_pool(uuid, integer, integer, text, text) to authenticated;
grant execute on function public.mtg_search_catalog(text, integer) to authenticated;
