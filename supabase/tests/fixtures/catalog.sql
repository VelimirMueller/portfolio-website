-- CI fixture: a stand-in card catalog for a fresh database. Not for production.
-- 20261008150000_magic_v2.sql needs a loaded catalog (scripts/mtg/load-catalog.sql):
-- at least 25000 cards, every card of the pool seed, the four photo fixes and the
-- cards of the "Stapelbruch" deck seed. scripts/db/test-migrations.sh loads this
-- file right before 20261008150000_magic_v2.sql.
\set ON_ERROR_STOP on
begin;

-- 1. Every card of the pool seed (20261008120100), with the seed's oracle id.
insert into public.mtg_catalog (oracle_id, name, type_line, colors)
select distinct on (oracle_id) oracle_id, name, type_line, colors
  from public.mtg_collection
 where oracle_id is not null
 order by oracle_id, created_at
on conflict (oracle_id) do nothing;

-- 2. The real names of the photo fixes and the deck seed. One row per name: the
--    deck seed joins on the name, so a duplicate name doubles a deck row.
insert into public.mtg_catalog (oracle_id, name)
select gen_random_uuid(), n.name
  from unnest(array[
         -- photo fixes
         'Last Gasp', 'Hallway Heckler // Vicious Verse', 'Eardrum Rattler', 'Marwyn, the Clearcutter',
         -- Stapelbruch: main
         'Countersculpt', 'Essence Scatter', 'Icy Reception', 'Aetherize', 'Unsummon', 'Into the Roil',
         'Opt', 'Cyclonic Rift', 'Infinite Coursework', 'Plan for All Outcomes', 'Theorist''s Proxy',
         'Traxos, Academy Guardian', 'Divining Duelist', 'Surveillance Phantasm', 'Cryotheory Adept',
         'Chandra, Chill of Compliance', 'Way of the Cryomancer', 'Protege''s Awakening',
         'Sphinx''s Approach', 'Island',
         -- Stapelbruch: sideboard
         'Annul', 'Hurkyl''s Recall', 'Negate', 'Disperse', 'Perfected Theory', 'Bitter Chill',
         -- Stapelbruch: upgrades
         'Otawara, Soaring City', 'Mana Drain', 'Rhystic Study', 'Force of Will', 'Consecrated Sphinx',
         'Teferi, Hero of Dominaria'
       ]) as n(name)
 where not exists (select 1 from public.mtg_catalog c where c.name = n.name);

-- 3. Filler up to the size check. The names match no test fixture.
insert into public.mtg_catalog (oracle_id, name)
select gen_random_uuid(), 'CI filler card ' || i
  from generate_series(1, greatest(0, 25000 - (select count(*) from public.mtg_catalog))) as i;

commit;
