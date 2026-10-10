-- Tests for 20261010060000_admin_dashboard_stats.sql. Self-contained: asserts, then
-- rolls everything back. Run against a local copy of the schema:
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/admin_dashboard_stats_test.sql
-- Any failed check raises and stops the run.
\set ON_ERROR_STOP on
begin;

create function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', what; end if;
  raise notice 'ok: %', what;
end $$;

create function pg_temp.raises(stmt text) returns boolean language plpgsql as $$
begin
  execute stmt;
  return false;
exception when others then
  return true;
end $$;

-- 1. Grants ---------------------------------------------------------------------------
select pg_temp.check(not has_function_privilege('anon', 'public.admin_dashboard_stats()', 'execute'),
                     'anon cannot execute admin_dashboard_stats');
select pg_temp.check(has_function_privilege('authenticated', 'public.admin_dashboard_stats()', 'execute'),
                     'authenticated may call it (the admin check is inside)');

-- 2. A stranger is refused --------------------------------------------------------------
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-00000000dead';
select pg_temp.check(pg_temp.raises('select public.admin_dashboard_stats()'), 'a stranger is refused');

-- 3. The admin gets both sections --------------------------------------------------------
set local request.jwt.claim.sub = 'bf3817e9-307a-490e-a3d4-5e63ed65da4a';
create temp table s as select public.admin_dashboard_stats() as j;
select pg_temp.check((select j ? 'supabase' and j ? 'magic' and j ? 'generated_at' from s),
                     'the answer has supabase, magic and generated_at');
select pg_temp.check((select (j #>> '{supabase,db_bytes}')::bigint > 0 from s), 'db_bytes is positive');
select pg_temp.check((select jsonb_typeof(j #> '{supabase,tables}') = 'array'
                         and jsonb_array_length(j #> '{supabase,tables}') > 0 from s),
                     'tables lists the public tables');
select pg_temp.check((select exists (select 1 from jsonb_array_elements(j #> '{supabase,buckets}') b
                                      where b ->> 'id' = 'mtg-testdata') from s),
                     'buckets includes mtg-testdata');
select pg_temp.check((select (j #>> '{magic,pool_copies}') is not null
                         and (j #>> '{magic,test_cases_unsent}') is not null from s),
                     'magic has pool and test-data counts');

rollback;
