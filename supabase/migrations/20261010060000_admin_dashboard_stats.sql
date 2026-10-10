-- admin_dashboard_stats: the numbers behind the admin KPI tabs "Supabase" and
-- "Magic", in one call. Read-only and admin only (is_admin(), else 42501).
-- security definer, because the catalog views (pg_class, pg_stat_activity) and
-- storage.objects are not readable for the authenticated role. Row counts of the
-- big tables are planner estimates (reltuples, refreshed by autovacuum); exact
-- counts would scan 150k+ rows on every page view. No secrets, no row content.
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_supabase jsonb;
  v_magic    jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'db_bytes', pg_catalog.pg_database_size(pg_catalog.current_database()),
    'postgres_version', pg_catalog.current_setting('server_version'),
    'connections', (select count(*) from pg_catalog.pg_stat_activity
                     where datname = pg_catalog.current_database()),
    'tables', coalesce((
      select jsonb_agg(jsonb_build_object(
               'name', c.relname,
               'rows', greatest(c.reltuples, 0)::bigint,
               'bytes', pg_catalog.pg_total_relation_size(c.oid))
             order by pg_catalog.pg_total_relation_size(c.oid) desc)
        from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r'), '[]'::jsonb),
    'buckets', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', b.id,
               'public', b.public,
               'objects', (select count(*) from storage.objects o where o.bucket_id = b.id),
               'bytes', (select coalesce(sum((o.metadata ->> 'size')::bigint), 0)
                           from storage.objects o where o.bucket_id = b.id))
             order by b.id)
        from storage.buckets b), '[]'::jsonb)
  ) into v_supabase;

  select jsonb_build_object(
    'pool_unique', (select count(*) from public.mtg_collection),
    'pool_copies', (select coalesce(sum(owned_qty), 0) from public.mtg_collection),
    'pool_copies_de', (select coalesce(sum(copies_de), 0) from public.mtg_collection),
    'pool_added_7d', (select count(*) from public.mtg_collection
                       where created_at > now() - interval '7 days'),
    'wishlist_cards', (select count(*) from public.mtg_wishlist),
    'wishlist_copies', (select coalesce(sum(qty), 0) from public.mtg_wishlist),
    'decks', (select count(*) from public.mtg_deck),
    'test_cases', (select count(*) from public.mtg_test_case),
    'test_cases_unsent', (select count(*) from public.mtg_test_case where batch_id is null),
    'test_batches', (select count(*) from public.mtg_test_batch),
    'last_batch_at', (select max(created_at) from public.mtg_test_batch),
    'last_dispatch_at', (select max(dispatch_requested_at) from public.mtg_test_batch)
  ) into v_magic;

  return jsonb_build_object('generated_at', now(), 'supabase', v_supabase, 'magic', v_magic);
end;
$$;

revoke execute on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;
