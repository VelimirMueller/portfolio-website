-- Tests for 20261009150000_magic_wishlist.sql. Self-contained, rolls back.
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/magic_wishlist_test.sql
\set ON_ERROR_STOP on
begin;

create function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', what; end if;
  raise notice 'ok: %', what;
end $$;

insert into public.mtg_catalog (oracle_id, name, type_line, colors) values
  ('00000000-0000-4000-8000-0000000000b1', 'Wishful Gecko', 'Creature — Lizard', '{G}'),
  ('00000000-0000-4000-8000-0000000000b2', 'Wishful Mercy', 'Sorcery', '{B}');

set local test.uid = 'bf3817e9-307a-490e-a3d4-5e63ed65da4a';
set local role authenticated;

-- Add, add again: one row, copies summed, notes joined, capped at 99.
create temp table w (id uuid);
insert into w select public.mtg_add_to_wishlist('00000000-0000-4000-8000-0000000000b1', 2, 'for Stapelbruch');
select pg_temp.check(public.mtg_add_to_wishlist('00000000-0000-4000-8000-0000000000b1', 1, ' ') = (select id from w), 'add twice: same row');
select pg_temp.check((select qty from public.mtg_wishlist where id = (select id from w)) = 3, 'add twice: copies summed');
select pg_temp.check((select note from public.mtg_wishlist where id = (select id from w)) = 'for Stapelbruch', 'blank note ignored');
select public.mtg_add_to_wishlist('00000000-0000-4000-8000-0000000000b1', 99);
select pg_temp.check((select qty from public.mtg_wishlist where id = (select id from w)) = 99, 'capped at 99');

-- Change: +1 at the cap is refused (null), -1 works, last copy removes.
select pg_temp.check(public.mtg_change_wish_qty((select id from w), 1) is null, 'no +1 over 99');
select pg_temp.check(public.mtg_change_wish_qty((select id from w), -1) = 98, '-1');
update public.mtg_wishlist set qty = 1 where id = (select id from w);
select pg_temp.check(public.mtg_change_wish_qty((select id from w), -1) = 0, 'last copy removes');
select pg_temp.check(not exists (select 1 from public.mtg_wishlist where id = (select id from w)), 'row gone');
select pg_temp.check(public.mtg_change_wish_qty((select id from w), 1) is null, 'unknown row: null');

-- Got it: moves copies into the pool (new row, then onto an existing row).
delete from w;
insert into w select public.mtg_add_to_wishlist('00000000-0000-4000-8000-0000000000b2', 3);
select pg_temp.check(public.mtg_wish_to_pool((select id from w), 1) is not null, 'to pool: pool id');
select pg_temp.check((select owned_qty from public.mtg_collection where oracle_id = '00000000-0000-4000-8000-0000000000b2') = 3, 'to pool: 3 owned');
select pg_temp.check((select copies_de from public.mtg_collection where oracle_id = '00000000-0000-4000-8000-0000000000b2') = 1, 'to pool: 1 German');
select pg_temp.check(not exists (select 1 from public.mtg_wishlist where oracle_id = '00000000-0000-4000-8000-0000000000b2'), 'to pool: wish gone');
delete from w;
insert into w select public.mtg_add_to_wishlist('00000000-0000-4000-8000-0000000000b2', 2);
select public.mtg_wish_to_pool((select id from w));
select pg_temp.check((select owned_qty from public.mtg_collection where oracle_id = '00000000-0000-4000-8000-0000000000b2') = 5, 'to pool: adds onto the pool row');
select pg_temp.check(public.mtg_wish_to_pool((select id from w)) is null, 'to pool twice: null, nothing added');
select pg_temp.check((select owned_qty from public.mtg_collection where oracle_id = '00000000-0000-4000-8000-0000000000b2') = 5, 'to pool twice: still 5');

-- Too many German copies: refused, wish row kept (whole call rolls back).
delete from w;
insert into w select public.mtg_add_to_wishlist('00000000-0000-4000-8000-0000000000b1', 1);
do $$ begin
  perform public.mtg_wish_to_pool((select id from w), 2);
  raise exception 'FAILED: German > qty accepted';
exception when raise_exception then
  if sqlerrm like 'FAILED%' then raise; end if;
end $$;
select pg_temp.check(exists (select 1 from public.mtg_wishlist where id = (select id from w)), 'refused move keeps the wish');

-- Not the admin: RLS shows and changes nothing.
set local test.uid = '11111111-1111-4111-8111-111111111111';
select pg_temp.check((select count(*) from public.mtg_wishlist) = 0, 'other user: sees no wish');
select pg_temp.check(public.mtg_change_wish_qty((select id from w), 1) is null, 'other user: cannot change');
select pg_temp.check(public.mtg_wish_to_pool((select id from w)) is null, 'other user: cannot move');
do $$ begin
  perform public.mtg_add_to_wishlist('00000000-0000-4000-8000-0000000000b2', 1);
  raise exception 'FAILED: other user could add';
exception when insufficient_privilege then null;
end $$;
select pg_temp.check(true, 'other user: cannot add');

rollback;
