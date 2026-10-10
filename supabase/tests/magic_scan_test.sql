-- Tests for 20261009120000_magic_scan.sql. Self-contained: inserts its own cards,
-- asserts, then rolls everything back. Run against a local copy of the schema:
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/magic_scan_test.sql
-- Any failed check raises and stops the run.
\set ON_ERROR_STOP on
begin;

create function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', what; end if;
  raise notice 'ok: %', what;
end $$;

-- Fixture: three cards, printings, a German name, a deck. Fake oracle ids.
insert into public.mtg_catalog (oracle_id, name, type_line, colors) values
  ('00000000-0000-4000-8000-0000000000a1', 'Testing Gecko', 'Creature — Lizard', '{G}'),
  ('00000000-0000-4000-8000-0000000000a2', 'Testing Mercy', 'Sorcery', '{B}'),
  ('00000000-0000-4000-8000-0000000000a3', 'Testing Shaper // Omit Testing', 'Creature — Octopus // Sorcery', '{U}');
insert into public.mtg_printing (set_code, collector_number, lang, oracle_id) values
  ('tst', '229', 'en', '00000000-0000-4000-8000-0000000000a1'),
  ('tst', '229', 'de', '00000000-0000-4000-8000-0000000000a1'),
  ('tst', '71',  'en', '00000000-0000-4000-8000-0000000000a2');
insert into public.mtg_card_name (lang, printed_name, oracle_id) values
  ('de', 'Prüfender Gecko', '00000000-0000-4000-8000-0000000000a1');

-- 1. Normalisation matches LineFilter.normalize() in the app.
select pg_temp.check(public.mtg_norm('Stärke des Stiers') = 'starke des stiers', 'norm: umlaut');
select pg_temp.check(public.mtg_norm('Großer Zorn') = 'grosser zorn', 'norm: ß -> ss');
select pg_temp.check(public.mtg_norm('Vraska’s Final Mercy!') = 'vraska''s final mercy', 'norm: apostrophe, punctuation');
select pg_temp.check(public.mtg_norm('  Loot,   the Anomaly ') = 'loot, the anomaly', 'norm: whitespace');

-- Matching runs as the admin (RLS on).
set local test.uid = 'bf3817e9-307a-490e-a3d4-5e63ed65da4a';
set local role authenticated;

create temp table r as
select (e.r ->> 'index')::int as i, e.r ->> 'status' as status, e.r ->> 'method' as method,
       e.r ->> 'name' as name, e.r ->> 'lang' as lang, (e.r ->> 'confidence')::numeric as conf,
       jsonb_array_length(e.r -> 'candidates') as cands
  from jsonb_array_elements(public.mtg_match_scan('[
    {"set": "TST", "number": "0229"},
    {"set": "TST", "number": "229", "lang": "de"},
    {"name": "Testing Mercy", "set": "TST", "number": "229"},
    {"name": "Testing Mercy"},
    {"name": "Prüfender Gecko"},
    {"name": "Testing Shaper"},
    {"name": "Omit Testing"},
    {"name": "Testing Gekko"},
    {"name": "Completely Unrelated Words"},
    {}
  ]'::jsonb)) as e(r);

select pg_temp.check((select status = 'matched' and method = 'printing' and name = 'Testing Gecko' and conf = 1 from r where i = 0), 'printing: set + number, leading zeros ignored');
select pg_temp.check((select lang = 'de' and method = 'printing' from r where i = 1), 'printing: language from the info line');
select pg_temp.check((select status = 'check' from r where i = 2), 'printing: name that disagrees with the number -> check');
select pg_temp.check((select status = 'matched' and method = 'exact_en' and lang = 'en' from r where i = 3), 'exact English name');
select pg_temp.check((select status = 'matched' and method = 'exact_de' and lang = 'de' and name = 'Testing Gecko' from r where i = 4), 'exact German name -> English card, lang de');
select pg_temp.check((select status = 'matched' and name = 'Testing Shaper // Omit Testing' from r where i = 5), 'front face of a two-name card');
select pg_temp.check((select status <> 'matched' from r where i = 6), 'the prepared-spell name alone is not trusted');
select pg_temp.check((select status = 'check' and method = 'fuzzy' and cands >= 1 and name = 'Testing Gecko' from r where i = 7), 'fuzzy typo -> check with candidate');
select pg_temp.check((select status = 'not_found' and name is null from r where i = 8), 'unrelated text -> not_found');
select pg_temp.check((select status = 'not_found' from r where i = 9), 'empty reading -> not_found');

-- Input guards.
do $$ begin
  perform public.mtg_match_scan('{"name": "x"}'::jsonb);
  raise exception 'FAILED: non-array accepted';
exception when others then
  if sqlerrm not like 'readings must be a JSON array%' then raise; end if;
  raise notice 'ok: non-array refused';
end $$;
do $$ begin
  perform public.mtg_match_scan((select jsonb_agg('{"name":"x"}'::jsonb) from generate_series(1, 51)));
  raise exception 'FAILED: 51 readings accepted';
exception when others then
  if sqlerrm not like 'at most 50 readings%' then raise; end if;
  raise notice 'ok: more than 50 readings refused';
end $$;

-- 2. mtg_add_many: sums, merges into existing rows, all or nothing.
select pg_temp.check(public.mtg_add_many('[
  {"oracle_id": "00000000-0000-4000-8000-0000000000a1", "qty": 2, "copies_de": 1, "name_de": "Prüfender Gecko"},
  {"oracle_id": "00000000-0000-4000-8000-0000000000a2", "qty": 1}
]'::jsonb) = 3, 'add_many returns the number of copies added');
select pg_temp.check((select owned_qty = 2 and copies_de = 1 from public.mtg_collection where oracle_id = '00000000-0000-4000-8000-0000000000a1'), 'add_many created the row');
do $$ begin
  perform public.mtg_add_many('[
    {"oracle_id": "00000000-0000-4000-8000-0000000000a1", "qty": 5},
    {"oracle_id": "00000000-0000-4000-8000-0000000000ff", "qty": 1}
  ]'::jsonb);
  raise exception 'FAILED: unknown card accepted';
exception when foreign_key_violation then
  raise notice 'ok: unknown card refused';
end $$;
select pg_temp.check((select owned_qty = 2 from public.mtg_collection where oracle_id = '00000000-0000-4000-8000-0000000000a1'), 'add_many is atomic: nothing added after a failure');
do $$ begin
  perform public.mtg_add_many('[{"oracle_id": "00000000-0000-4000-8000-0000000000a1", "qty": 0}]'::jsonb);
  raise exception 'FAILED: qty 0 accepted';
exception when others then
  if sqlerrm not like 'item needs qty%' then raise; end if;
  raise notice 'ok: qty 0 refused with a clear message';
end $$;

-- 3. Deck ownership: main before sideboard, upgrades ignored.
reset role;
insert into public.mtg_deck (id, slug, name, colors) values ('00000000-0000-4000-8000-0000000000d1', 'test-deck', 'Test deck', '{G}');
insert into public.mtg_deck_card (deck_id, oracle_id, section, qty, position) values
  ('00000000-0000-4000-8000-0000000000d1', '00000000-0000-4000-8000-0000000000a1', 'main', 1, 1),
  ('00000000-0000-4000-8000-0000000000d1', '00000000-0000-4000-8000-0000000000a1', 'sideboard', 3, 1),
  ('00000000-0000-4000-8000-0000000000d1', '00000000-0000-4000-8000-0000000000a1', 'upgrade', 1, 1),
  ('00000000-0000-4000-8000-0000000000d1', '00000000-0000-4000-8000-0000000000a3', 'main', 4, 2);
set local role authenticated;
select pg_temp.check((select owned = 1 from public.mtg_deck_ownership where deck_id = '00000000-0000-4000-8000-0000000000d1' and section = 'main' and position = 1), 'ownership: main line filled first (1 of 1)');
select pg_temp.check((select owned = 1 from public.mtg_deck_ownership where deck_id = '00000000-0000-4000-8000-0000000000d1' and section = 'sideboard'), 'ownership: sideboard gets the rest (1 of 3)');
select pg_temp.check((select owned = 0 from public.mtg_deck_ownership where deck_id = '00000000-0000-4000-8000-0000000000d1' and section = 'main' and position = 2), 'ownership: card not in the pool');
select pg_temp.check((select count(*) = 3 from public.mtg_deck_ownership where deck_id = '00000000-0000-4000-8000-0000000000d1'), 'ownership: upgrades are not counted');

-- 4. Access: another user and anon see and change nothing.
reset role;
-- Thresholds as parameters (20261009210000): defaults unchanged, the app can tune them.
select pg_temp.check((select r ->> 'status' from jsonb_array_elements(public.mtg_match_scan('[{"name": "Testing Gekko"}]')) r) = 'check',
  'thresholds: a typo is a check by default');
select pg_temp.check((select r ->> 'status' from jsonb_array_elements(public.mtg_match_scan('[{"name": "Testing Gekko"}]', p_sure_min => 0.6)) r) = 'matched',
  'thresholds: a lower sure-minimum trusts the typo');
select pg_temp.check((select r ->> 'status' from jsonb_array_elements(public.mtg_match_scan('[{"name": "Testing Gekko"}]', p_fuzzy_min => 0.95)) r) = 'not_found',
  'thresholds: a higher fuzzy-minimum drops the typo');
select pg_temp.check((select r ->> 'status' from jsonb_array_elements(public.mtg_match_scan('[{"name": "Testing Gekko"}]', p_fuzzy_min => -5, p_sure_min => 7)) r) = 'check',
  'thresholds: out-of-range values are clamped, not trusted');

-- Unique prefix (20261010010000): a cut-off name of exactly one card matches.
select pg_temp.check((select r ->> 'status' || '/' || (r ->> 'method') from jsonb_array_elements(public.mtg_match_scan('[{"name": "Testing Merc"}]')) r) = 'matched/prefix',
  'prefix: "Testing Merc" -> Testing Mercy');
select pg_temp.check((select r ->> 'status' || '/' || (r ->> 'method') from jsonb_array_elements(public.mtg_match_scan('[{"name": "Prüfender Gec"}]')) r) = 'matched/prefix',
  'prefix: German printed name cut off');
select pg_temp.check((select r ->> 'method' from jsonb_array_elements(public.mtg_match_scan('[{"name": "Testing"}]')) r) is distinct from 'prefix',
  'prefix: under 8 characters is never a prefix match');
select pg_temp.check((select r ->> 'method' from jsonb_array_elements(public.mtg_match_scan('[{"name": "Testing "}]')) r) is distinct from 'prefix',
  'prefix: a word shared by every test card (not unique) is not a prefix match');

-- Clear lead (20261010030000): a typo far ahead of every other card matches, a close race stays a question.
select pg_temp.check((select r ->> 'status' || '/' || (r ->> 'method') || '/' || (r ->> 'name') from jsonb_array_elements(public.mtg_match_scan('[{"name": "Testing Mercv"}]')) r) = 'matched/fuzzy/Testing Mercy',
  'clear lead: "Testing Mercv" 0.75, next card 0.40 -> matched');
select pg_temp.check((select r ->> 'status' from jsonb_array_elements(public.mtg_match_scan('[{"name": "Testing Gekko"}]')) r) = 'check',
  'clear lead: 0.65 is under p_sure_min - 0.2 -> check');
reset role;
insert into public.mtg_catalog (oracle_id, name, type_line, colors) values
  ('00000000-0000-4000-8000-0000000000a4', 'Testing Merch', 'Artifact', '{}');
set local role authenticated;
select pg_temp.check((select r ->> 'status' from jsonb_array_elements(public.mtg_match_scan('[{"name": "Testing Mercv"}]')) r) = 'check',
  'clear lead: two cards at 0.75 -> check');

set local test.uid = '11111111-1111-4111-8111-111111111111';
set local role authenticated;
select pg_temp.check((select count(*) = 0 from public.mtg_printing), 'RLS: other user sees no printings');
select pg_temp.check((select count(*) = 0 from public.mtg_card_name), 'RLS: other user sees no names');
select pg_temp.check((select count(*) = 0 from public.mtg_deck_ownership), 'RLS: other user sees no ownership');
-- mtg_match_scan is security definer (20261009190000) and refuses other users itself.
do $$ begin
  perform public.mtg_match_scan('[{"name": "Testing Mercy"}]'::jsonb);
  raise exception 'FAILED: another user could match';
exception when insufficient_privilege then null;
end $$;
select pg_temp.check(true, 'matching refuses another user');
reset role;
set local role anon;
do $$ begin
  perform public.mtg_match_scan('[]'::jsonb);
  raise exception 'FAILED: anon may call mtg_match_scan';
exception when insufficient_privilege then
  raise notice 'ok: anon cannot call mtg_match_scan';
end $$;

reset role;
rollback;
