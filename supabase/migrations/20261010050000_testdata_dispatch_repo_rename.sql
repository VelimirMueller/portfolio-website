-- mtg_dispatch_test_batch: send repository_dispatch to the renamed repo.
-- The GitHub repo mtg-scanner is lab-mtg-scanner since 2026-10-10. GitHub answers
-- a POST to the old name with a redirect, and pg_net may not follow it: the batch
-- would be stored but no eval would start, with no error in the app. This calls
-- the new name directly. The fine-grained token in Vault (github_dispatch_token)
-- is bound to the repository, not its name, so it stays valid.
-- Rest of the body unchanged from 20261009220000.
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
  -- exposed to anon/authenticated. Keep the token scoped to lab-mtg-scanner only.
  request_id := net.http_post(
    url := 'https://api.github.com/repos/VelimirMueller/lab-mtg-scanner/dispatches',
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
