-- Versions the hand-made contact_messages setup and adds what the admin inbox needs.
-- Safe to run against the live project: every statement is idempotent and the
-- existing table, its rows and the on_new_contact_message email trigger are kept.

-- 1. Table — matches the live shape as read on 2026-09-30.
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz default now()
);

alter table public.contact_messages
  add column if not exists status text not null default 'new';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'contact_messages_status_check'
      and conrelid = 'public.contact_messages'::regclass
  ) then
    alter table public.contact_messages
      add constraint contact_messages_status_check
      check (status in ('new', 'read', 'archived', 'spam'));
  end if;
end $$;

alter table public.contact_messages enable row level security;

-- 2. Admin check. The UUID is the only admin user; it is fixed at user creation.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.uid()) = 'bf3817e9-307a-490e-a3d4-5e63ed65da4a'::uuid, false);
$$;

-- 3. Policies.
-- Visitors may only create messages, and only as 'new' (the column default),
-- so a direct REST insert cannot pre-file itself as read/archived.
drop policy if exists "Allow public inserts" on public.contact_messages;
create policy "Allow public inserts"
  on public.contact_messages for insert
  to anon
  with check (status = 'new');

drop policy if exists "Admin can read messages" on public.contact_messages;
create policy "Admin can read messages"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin can update messages" on public.contact_messages;
create policy "Admin can update messages"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin can delete messages" on public.contact_messages;
create policy "Admin can delete messages"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());

-- The admin may change the status and nothing else about a message.
revoke update on public.contact_messages from authenticated;
grant update (status) on public.contact_messages to authenticated;

-- 4. Triggers.
-- create_email_hook posted '{}' to https://velimir-mueller.de/api/send-contact-email,
-- a route removed in 3c7c2a9 (308 -> www -> 404). Emails come from
-- on_new_contact_message -> the send-contact-email Edge Function, which stays as is.
-- It is not versioned here because its function body holds a bearer key;
-- moving that key to Vault is a follow-up.
drop trigger if exists create_email_hook on public.contact_messages;
