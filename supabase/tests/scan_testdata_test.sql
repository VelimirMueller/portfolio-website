-- Tests for 20261009220000_scan_testdata.sql. Self-contained: inserts its own cases,
-- asserts, then rolls everything back (no request reaches GitHub: pg_net only sends
-- committed requests). Run against a local copy of the schema:
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/scan_testdata_test.sql
-- Any failed check raises and stops the run.
\set ON_ERROR_STOP on
begin;

create function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', what; end if;
  raise notice 'ok: %', what;
end $$;

-- Runs a statement and reports whether it raised, without aborting the transaction.
create function pg_temp.raises(stmt text) returns boolean language plpgsql as $$
begin
  execute stmt;
  return false;
exception when others then
  return true;
end $$;

create function pg_temp.add_case() returns void language sql as $$
  insert into public.mtg_test_case (photo_path, app_version, readings, predicted, expected)
  values ('cases/' || gen_random_uuid() || '.jpg', '0.4.1', '{"lines": []}', '[]',
          '[{"oracle_id": "00000000-0000-4000-8000-0000000000a1", "qty": 1, "lang": "de"}]')
$$;
grant execute on function pg_temp.add_case() to authenticated;

-- 1. Nobody calls the functions through the API ----------------------------------------
select pg_temp.check(not has_function_privilege('anon', 'public.mtg_dispatch_test_batch(uuid)', 'execute')
                 and not has_function_privilege('authenticated', 'public.mtg_dispatch_test_batch(uuid)', 'execute'),
                     'anon and authenticated cannot execute mtg_dispatch_test_batch');
select pg_temp.check(not has_function_privilege('anon', 'public.mtg_collect_test_batch()', 'execute')
                 and not has_function_privilege('authenticated', 'public.mtg_collect_test_batch()', 'execute'),
                     'anon and authenticated cannot execute mtg_collect_test_batch');
select pg_temp.check(pg_temp.raises('select public.mtg_collect_test_batch()'),
                     'the trigger function cannot be called directly, even by the owner');

select pg_temp.check(not public.is_admin(), 'the SQL editor itself is not the admin');
set local role service_role;
select pg_temp.check(public.is_admin(), 'the service role (Edge Functions) counts as admin');
reset role;

-- 2. A signed-in stranger sees and writes nothing -------------------------------------------
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-00000000dead';
select pg_temp.check(pg_temp.raises('select pg_temp.add_case()'), 'stranger cannot add a case');
select pg_temp.check(pg_temp.raises($q$insert into public.mtg_test_batch (note) values ('x')$q$),
                     'stranger cannot send a batch');
select pg_temp.check(pg_temp.raises($q$insert into storage.objects (bucket_id, name) values ('mtg-testdata', 'cases/x.jpg')$q$),
                     'stranger cannot upload a test photo');

-- 3. The admin collects every unsent case into one batch --------------------------------------
set local request.jwt.claim.sub = 'bf3817e9-307a-490e-a3d4-5e63ed65da4a';
select pg_temp.check(pg_temp.raises($q$insert into public.mtg_test_batch (note) values ('empty')$q$),
                     'an empty batch is refused');
select pg_temp.add_case();
select pg_temp.add_case();
insert into public.mtg_test_batch (note) values ('first');
select pg_temp.check((select case_count from public.mtg_test_batch where note = 'first') = 2,
                     'the batch counts its two cases');
select pg_temp.check(not exists (select 1 from public.mtg_test_case where batch_id is null),
                     'no case is left unsent');
select pg_temp.add_case();
insert into public.mtg_test_batch (note) values ('second');
select pg_temp.check((select case_count from public.mtg_test_batch where note = 'second') = 1
                 and (select count(*) from public.mtg_test_case c
                        join public.mtg_test_batch b on b.id = c.batch_id where b.note = 'first') = 2,
                     'a second batch takes only the new case and leaves the first batch intact');
select pg_temp.check(pg_temp.raises($q$insert into public.mtg_test_case (photo_path, app_version, readings, predicted, expected)
                                     values ('../x.jpg', '0.4.1', '{}', '[]', '[]')$q$),
                     'a photo path outside cases/ is refused');

rollback;
