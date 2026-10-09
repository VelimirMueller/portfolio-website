-- The contact email trigger, versioned at last. It used to be a dashboard
-- webhook whose body held a bearer key, and the send-contact-email Edge
-- Function accepted any caller (an open mail relay to the inbox).
--
-- Now: the trigger reads a shared secret from Vault and sends it in the
-- x-contact-hook-secret header; the function rejects every request without it.
-- No key is in this file. Set the secret before running this migration:
--   select vault.create_secret('<secret>', 'contact_hook_secret', 'DB trigger -> send-contact-email');
-- and the same value as the function secret CONTACT_HOOK_SECRET.

create extension if not exists pg_net;

create or replace function public.send_contact_email_hook()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  hook_secret text;
begin
  select decrypted_secret into hook_secret
    from vault.decrypted_secrets
   where name = 'contact_hook_secret';
  if hook_secret is null then
    -- Never block the visitor's message; the admin inbox still has it.
    raise warning 'contact_hook_secret is missing in Vault; no email sent for message %', new.id;
    return new;
  end if;

  -- Asynchronous (pg_net queues it): the insert never waits for the email. A failed
  -- send loses no message (it is in the admin inbox); pg_net keeps each response in
  -- net._http_response for 6 hours to look up why.
  perform net.http_post(
    url := 'https://zkvpvhrmrbkpuspypqrj.supabase.co/functions/v1/send-contact-email',
    body := jsonb_build_object('type', 'INSERT', 'table', 'contact_messages', 'record', to_jsonb(new)),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-contact-hook-secret', hook_secret),
    timeout_milliseconds := 5000
  );
  return new;
end;
$$;

-- Only the trigger runs it; nobody can call it through the API.
revoke execute on function public.send_contact_email_hook() from public, anon, authenticated;

-- Same name as the dashboard webhook it replaces (see 20260930160000_contact_messages_admin.sql),
-- so the old one goes and only one email is sent per message.
drop trigger if exists on_new_contact_message on public.contact_messages;
create trigger on_new_contact_message
  after insert on public.contact_messages
  for each row execute function public.send_contact_email_hook();
