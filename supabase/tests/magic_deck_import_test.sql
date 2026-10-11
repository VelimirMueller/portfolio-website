-- Tests for 20261011120000_magic_deck_import.sql. Self-contained: inserts its own
-- cards, asserts, then rolls everything back. Run against a local copy of the schema:
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/magic_deck_import_test.sql
-- Any failed check raises and stops the run.
\set ON_ERROR_STOP on
begin;

create function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', what; end if;
  raise notice 'ok: %', what;
end $$;

-- Fixture: fake oracle ids. Two cards share the front face "Testing Twin".
insert into public.mtg_catalog (oracle_id, name, type_line, colors) values
  ('00000000-0000-4000-8000-0000000000b1', 'Testing Goblin Boss', 'Legendary Creature — Goblin', '{R}'),
  ('00000000-0000-4000-8000-0000000000b2', 'Testing Haste', 'Instant', '{R}'),
  ('00000000-0000-4000-8000-0000000000b3', 'Testing Fire // Testing Ice', 'Instant // Instant', '{R,U}'),
  ('00000000-0000-4000-8000-0000000000b4', 'Testing Mountain', 'Basic Land — Mountain', '{}'),
  ('00000000-0000-4000-8000-0000000000b5', 'Testing Twin', 'Creature', '{G}'),
  ('00000000-0000-4000-8000-0000000000b6', 'Testing Twin // Other Half', 'Creature // Sorcery', '{G}');
insert into public.mtg_card_name (lang, printed_name, oracle_id) values
  ('de', 'Prüfende Eile', '00000000-0000-4000-8000-0000000000b2');

set local test.uid = 'bf3817e9-307a-490e-a3d4-5e63ed65da4a';
set local role authenticated;

-- 1. A typo, an ambiguous front face: nothing is created, both are reported.
create temp table r1 as select public.mtg_import_deck('Testing Goblins', 'testing-goblins', '', '[
  {"section": "main", "qty": 4, "name": "Testing Goblin Bos"},
  {"section": "main", "qty": 1, "name": "Testing Twin"},
  {"section": "main", "qty": 20, "name": "Testing Mountain"}
]') as r;
select pg_temp.check((select r ->> 'status' from r1) = 'unresolved', 'unresolved: status');
select pg_temp.check((select jsonb_array_length(r -> 'names') from r1) = 2, 'unresolved: two names');
select pg_temp.check((select (r -> 'names' -> 0 ->> 'index')::int from r1) = 0, 'unresolved: index of the typo');
select pg_temp.check((select r -> 'names' -> 0 -> 'candidates' ->> 0 from r1) = 'Testing Goblin Boss', 'unresolved: typo suggests the card');
select pg_temp.check((select jsonb_array_length(r -> 'names' -> 1 -> 'candidates') from r1) = 2, 'unresolved: ambiguous name lists both cards');
select pg_temp.check(not exists (select 1 from public.mtg_deck where slug = 'testing-goblins'), 'unresolved: no deck created');

-- 2. Everything resolves: English, German, front face of a split card, case and accents ignored.
create temp table r2 as select public.mtg_import_deck('  Testing Goblins ', 'testing-goblins', 'Go wide, go fast.', '[
  {"section": "main", "qty": 4, "name": "testing goblin boss"},
  {"section": "main", "qty": 2, "name": "Prufende Eile"},
  {"section": "main", "qty": 2, "name": "Testing Haste"},
  {"section": "main", "qty": 1, "name": "Testing Fire"},
  {"section": "main", "qty": 20, "name": "Testing Mountain"},
  {"section": "sideboard", "qty": 3, "name": "Testing Fire // Testing Ice"}
]') as r;
select pg_temp.check((select r ->> 'status' from r2) = 'created', 'created: status');
select pg_temp.check((select (r ->> 'main')::int from r2) = 29 and (select (r ->> 'sideboard')::int from r2) = 3, 'created: counts');
select pg_temp.check((select name from public.mtg_deck where slug = 'testing-goblins') = 'Testing Goblins', 'created: name trimmed');
select pg_temp.check((select main_size from public.mtg_deck where slug = 'testing-goblins') = 29, 'created: main_size');
select pg_temp.check((select sideboard_size from public.mtg_deck where slug = 'testing-goblins') = 3, 'created: sideboard_size');
select pg_temp.check((select colors from public.mtg_deck where slug = 'testing-goblins') = array['U', 'R'], 'created: colors in WUBRG order');
select pg_temp.check((select qty from public.mtg_deck_card dc join public.mtg_deck d on d.id = dc.deck_id
                       where d.slug = 'testing-goblins' and dc.section = 'main'
                         and dc.oracle_id = '00000000-0000-4000-8000-0000000000b2') = 4,
                     'created: German and English line of one card merged');
select pg_temp.check((select array_agg(c.name order by dc.position) from public.mtg_deck_card dc
                        join public.mtg_deck d on d.id = dc.deck_id
                        join public.mtg_catalog c using (oracle_id)
                       where d.slug = 'testing-goblins' and dc.section = 'main')
                     = array['Testing Goblin Boss', 'Testing Haste', 'Testing Fire // Testing Ice', 'Testing Mountain'],
                     'created: positions follow the pasted order');
select pg_temp.check((select count(*) from public.mtg_deck_ownership o join public.mtg_deck d on d.id = o.deck_id
                       where d.slug = 'testing-goblins') = 5, 'created: ownership view sees the lines');

-- 3. Same slug again: nothing created.
select pg_temp.check(public.mtg_import_deck('Testing Goblins', 'testing-goblins', '',
                       '[{"section": "main", "qty": 1, "name": "Testing Haste"}]') ->> 'status' = 'exists',
                     'exists: second import with the same slug');
select pg_temp.check((select count(*) from public.mtg_deck where slug = 'testing-goblins') = 1, 'exists: still one deck');

-- 4. Bad input raises.
create function pg_temp.raises(p_sql text) returns boolean language plpgsql as $$
begin
  execute p_sql;
  return false;
exception when others then
  return true;
end $$;
select pg_temp.check(pg_temp.raises($q$select public.mtg_import_deck('', 'x', '', '[{"section":"main","qty":1,"name":"Testing Haste"}]')$q$), 'raises: empty name');
select pg_temp.check(pg_temp.raises($q$select public.mtg_import_deck('X', 'Bad Slug', '', '[{"section":"main","qty":1,"name":"Testing Haste"}]')$q$), 'raises: bad slug');
select pg_temp.check(pg_temp.raises($q$select public.mtg_import_deck('X', 'x', '', '[]')$q$), 'raises: no lines');
select pg_temp.check(pg_temp.raises($q$select public.mtg_import_deck('X', 'x', '', '[{"section":"maybe","qty":1,"name":"Testing Haste"}]')$q$), 'raises: bad section');
select pg_temp.check(pg_temp.raises($q$select public.mtg_import_deck('X', 'x', '', '[{"section":"main","qty":0,"name":"Testing Haste"}]')$q$), 'raises: qty 0');
select pg_temp.check(pg_temp.raises($q$select public.mtg_import_deck('X', 'x', '', '[{"section":"sideboard","qty":1,"name":"Testing Haste"}]')$q$), 'raises: empty main deck');

-- 5. Not the admin: RLS hides the catalog, so no name resolves and nothing is created.
set local test.uid = '00000000-0000-4000-8000-00000000dead';
select pg_temp.check(public.mtg_import_deck('Intruder', 'intruder', '',
                       '[{"section":"main","qty":1,"name":"Testing Haste"}]') ->> 'status' = 'unresolved',
                     'rls: a non-admin resolves nothing');
set local test.uid = 'bf3817e9-307a-490e-a3d4-5e63ed65da4a';
select pg_temp.check(not exists (select 1 from public.mtg_deck where slug = 'intruder'), 'rls: no deck created');

rollback;
