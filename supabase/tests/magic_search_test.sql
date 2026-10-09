-- Tests for 20261009200000_search_three_languages.sql (mtg_search_catalog in
-- English, German and French). Self-contained: inserts its own cards (names with
-- "zqx" so the real catalog never interferes), asserts, then rolls everything back.
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/magic_search_test.sql
-- Any failed check raises and stops the run.
\set ON_ERROR_STOP on
begin;

create function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', what; end if;
  raise notice 'ok: %', what;
end $$;

-- Fixture. Fake oracle ids.
insert into public.mtg_catalog (oracle_id, name, type_line, colors) values
  ('00000000-0000-4000-8000-0000000000b1', 'Zqxtest Strength', 'Instant', '{G}'),
  ('00000000-0000-4000-8000-0000000000b2', 'Zqxville Shore', 'Land', '{}'),
  ('00000000-0000-4000-8000-0000000000c1', 'Zqxrank', 'Sorcery', '{R}'),
  ('00000000-0000-4000-8000-0000000000c2', 'Zqxrank Hound', 'Creature — Dog', '{R}'),
  ('00000000-0000-4000-8000-0000000000c3', 'Old Zqxrank', 'Creature — Giant', '{R}'),
  ('00000000-0000-4000-8000-0000000000c4', 'Bigzqxrank', 'Artifact', '{}'),
  ('00000000-0000-4000-8000-0000000000c5', 'Aaa Moonzqx', 'Enchantment', '{W}'),
  ('00000000-0000-4000-8000-0000000000d1', 'Zqx 100% Card', 'Artifact', '{}'),
  ('00000000-0000-4000-8000-0000000000d2', 'Zqx 1000 Card', 'Artifact', '{}'),
  ('00000000-0000-4000-8000-0000000000d3', 'Zqx_under', 'Artifact', '{}'),
  ('00000000-0000-4000-8000-0000000000d4', 'Zqxaunder', 'Artifact', '{}');
insert into public.mtg_card_name (lang, printed_name, oracle_id) values
  ('de', 'Stärke des Zqxtest', '00000000-0000-4000-8000-0000000000b1'),
  ('fr', 'Force du Zqxtest', '00000000-0000-4000-8000-0000000000b1'),
  ('de', 'Zqxville-Küste', '00000000-0000-4000-8000-0000000000b2'),
  ('fr', 'Île de Zqxville', '00000000-0000-4000-8000-0000000000b2'),
  -- A card whose only exact hit is its German name: ranks with the exact English one.
  ('de', 'Zqxrank', '00000000-0000-4000-8000-0000000000c5');

-- Search runs as the admin.
set local test.uid = 'bf3817e9-307a-490e-a3d4-5e63ed65da4a';
set local role authenticated;

create function pg_temp.ids(q text, lim int default 24) returns text[] language sql as $$
  select coalesce(array_agg(right(s.oracle_id::text, 2) order by s.ordinality), '{}')
    from public.mtg_search_catalog(q, lim) with ordinality as s
   where s.oracle_id::text like '00000000-0000-4000-8000-0000000000%'
$$;

-- 1. Languages.
select pg_temp.check(pg_temp.ids('zqxtest str') = '{b1}', 'English name');
select pg_temp.check(pg_temp.ids('Stärke des Zqx') = '{b1}', 'German printed name with umlaut');
select pg_temp.check(pg_temp.ids('starke des zqx') = '{b1}', 'German printed name without umlaut');
select pg_temp.check(pg_temp.ids('zqxville-kuste') = '{b2}', 'German printed name, ü typed as u');
select pg_temp.check(pg_temp.ids('Île de Zqx') = '{b2}', 'French printed name with accent');
select pg_temp.check(pg_temp.ids('ile de zqx') = '{b2}', 'French printed name without accent');
select pg_temp.check(pg_temp.ids('FORCE DU ZQX') = '{b1}', 'French printed name, any case');

-- 2. One row per card even when several of its names hit.
select pg_temp.check((select count(*) = 1 from public.mtg_search_catalog('zqxtest', 24)
                       where oracle_id = '00000000-0000-4000-8000-0000000000b1'), 'one row per card when EN, DE and FR all hit');
select pg_temp.check((select count(*) = count(distinct oracle_id) from public.mtg_search_catalog('zqx', 100)),
                     'no duplicate cards in a broad search');

-- 3. Ranking: exact (English or printed) 0, prefix 1, word start 2, anywhere 3; ties by English name.
select pg_temp.check(pg_temp.ids('zqxrank') = '{c5,c1,c2,c3,c4}',
                     'ranking: exact (DE exact ties EN exact, by name) > prefix > word start > anywhere');
select pg_temp.check(pg_temp.ids('Stärke des Zqxtest') = '{b1}', 'exact printed name found');

-- 4. Pattern characters are literal.
select pg_temp.check(pg_temp.ids('0%') = '{d1}', '% is literal');
select pg_temp.check(pg_temp.ids('zqx_u') = '{d3}', '_ is literal');

-- 5. Guards: minimum length 2, limit + 1 rows mean "more".
select pg_temp.check((select count(*) = 0 from public.mtg_search_catalog('z', 24)), 'query shorter than 2 -> nothing');
select pg_temp.check((select count(*) = 0 from public.mtg_search_catalog('  ', 24)), 'blank query -> nothing');
select pg_temp.check((select count(*) = 3 from public.mtg_search_catalog('zqxrank', 2)), 'limit 2 returns 3 rows (more)');

-- 6. Access: security definer refuses other users itself; anon cannot call it.
reset role;
set local test.uid = '11111111-1111-4111-8111-111111111111';
set local role authenticated;
do $$ begin
  perform public.mtg_search_catalog('zqxrank', 24);
  raise exception 'FAILED: another user could search';
exception when insufficient_privilege then
  raise notice 'ok: search refuses another user (42501)';
end $$;
reset role;
set local role anon;
do $$ begin
  perform public.mtg_search_catalog('zqxrank', 24);
  raise exception 'FAILED: anon may call mtg_search_catalog';
exception when insufficient_privilege then
  raise notice 'ok: anon cannot call mtg_search_catalog';
end $$;

reset role;
rollback;
