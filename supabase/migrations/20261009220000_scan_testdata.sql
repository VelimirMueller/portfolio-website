-- Scan test data: the MTG Scanner app saves a scan as a test case (the original
-- photo, the raw OCR readings, what the app proposed and what the admin confirmed
-- in review). "Send batch" inserts one mtg_test_batch row; that collects every
-- unsent case and asks GitHub to run the testdata workflow in mtg-scanner, which
-- evaluates the batch and opens a PR with the new fixtures.
--
-- Admin only, end to end: private bucket, RLS on both tables, and the dispatch
-- function cannot be called through the API. No key is in this file. Set the
-- token before the first batch (fine-grained PAT, repo mtg-scanner only,
-- "Contents: read and write", which repository_dispatch needs):
--   select vault.create_secret('<token>', 'github_dispatch_token', 'DB trigger -> mtg-scanner repository_dispatch');
-- Without it a batch is still stored (dispatch_requested_at stays null) and can be sent again
-- with: select public.mtg_dispatch_test_batch('<batch id>');

create extension if not exists pg_net;

-- 1. Photos -------------------------------------------------------------------------
-- Full-resolution originals (8000x6000 JPEG is ~10-20 MB), because the spike showed
-- that downsized copies lose the card names. Path: cases/<case id>.<ext>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mtg-testdata', 'mtg-testdata', false, 31457280,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admin manages scan test photos" on storage.objects;
create policy "Admin manages scan test photos"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'mtg-testdata' and public.is_admin())
  with check (bucket_id = 'mtg-testdata' and public.is_admin());

-- 2. Batches ------------------------------------------------------------------------
create table if not exists public.mtg_test_batch (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  note                text check (length(note) <= 500),
  case_count          integer not null default 0,
  -- When the request was queued, not that GitHub accepted it: check net._http_response.
  dispatch_requested_at timestamptz,
  dispatch_request_id bigint  -- pg_net request id; the response is in net._http_response for 6 hours
);

-- 3. Cases --------------------------------------------------------------------------
create table if not exists public.mtg_test_case (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  batch_id    uuid references public.mtg_test_batch (id) on delete set null,
  photo_path  text not null unique check (photo_path ~ '^cases/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|heic)$'),
  app_version text not null check (app_version ~ '^[0-9]+\.[0-9]+\.[0-9]+([-+][0-9A-Za-z.-]+)?$'),
  -- Raw ML Kit output (lines + boxes), so a rule bug replays as a plain JVM test.
  readings    jsonb not null check (jsonb_typeof(readings) = 'object' and pg_column_size(readings) <= 262144),
  -- What the app proposed, and what the admin confirmed in review (the label).
  predicted   jsonb not null check (jsonb_typeof(predicted) = 'array' and pg_column_size(predicted) <= 65536),
  expected    jsonb not null check (jsonb_typeof(expected) = 'array' and pg_column_size(expected) <= 65536),
  -- False = blurred or cut-off photo: kept, but not counted as a rule failure.
  photo_ok    boolean not null default true,
  note        text check (length(note) <= 500)
);
create index if not exists mtg_test_case_unsent on public.mtg_test_case (created_at) where batch_id is null;
create index if not exists mtg_test_case_batch on public.mtg_test_case (batch_id);

alter table public.mtg_test_batch enable row level security;
alter table public.mtg_test_case enable row level security;

drop policy if exists "Admin manages scan test batches" on public.mtg_test_batch;
create policy "Admin manages scan test batches"
  on public.mtg_test_batch for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin manages scan test cases" on public.mtg_test_case;
create policy "Admin manages scan test cases"
  on public.mtg_test_case for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Dispatch -----------------------------------------------------------------------
create or replace function public.mtg_dispatch_test_batch(p_batch_id uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  gh_token   text;
  request_id bigint;
begin
  select decrypted_secret into gh_token
    from vault.decrypted_secrets
   where name = 'github_dispatch_token';
  if gh_token is null then
    -- Never lose the batch; it can be sent again once the token is in Vault.
    raise warning 'github_dispatch_token is missing in Vault; batch % stored but not dispatched', p_batch_id;
    return null;
  end if;

  -- Asynchronous: the app's insert never waits for GitHub. GitHub answers 204 on
  -- success and rejects requests without a User-Agent. The header (with the token)
  -- sits in net.http_request_queue until pg_net sends it; the net schema is not
  -- exposed to anon/authenticated. Keep the token scoped to mtg-scanner only.
  request_id := net.http_post(
    url := 'https://api.github.com/repos/VelimirMueller/mtg-scanner/dispatches',
    body := jsonb_build_object(
      'event_type', 'testdata-batch',
      'client_payload', jsonb_build_object('batch_id', p_batch_id)),
    headers := jsonb_build_object(
      'Accept', 'application/vnd.github+json',
      'Authorization', 'Bearer ' || gh_token,
      'User-Agent', 'velimir-mueller.de-testdata',
      'X-GitHub-Api-Version', '2022-11-28',
      'Content-Type', 'application/json'),
    timeout_milliseconds := 5000
  );

  update public.mtg_test_batch
     set dispatch_requested_at = now(), dispatch_request_id = request_id
   where id = p_batch_id;
  return request_id;
end;
$$;

-- Only the trigger (and the SQL editor) runs it; nobody can call it through the API.
revoke execute on function public.mtg_dispatch_test_batch(uuid) from public, anon, authenticated;

create or replace function public.mtg_collect_test_batch()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  -- Two batches at once cannot share or lose a case: the second UPDATE waits for
  -- the first one's row locks, re-checks batch_id is null, finds nothing and
  -- raises below. Cases added meanwhile simply go with the next batch.
  update public.mtg_test_case
     set batch_id = new.id
   where batch_id is null;
  get diagnostics n = row_count;
  if n = 0 then
    -- Rolls back the batch row too: an empty batch is never stored or sent.
    raise exception 'no unsent test cases; nothing to send' using errcode = 'P0001';
  end if;

  update public.mtg_test_batch set case_count = n where id = new.id;
  perform public.mtg_dispatch_test_batch(new.id);
  return new;
end;
$$;

revoke execute on function public.mtg_collect_test_batch() from public, anon, authenticated;

drop trigger if exists on_new_test_batch on public.mtg_test_batch;
create trigger on_new_test_batch
  after insert on public.mtg_test_batch
  for each row execute function public.mtg_collect_test_batch();
