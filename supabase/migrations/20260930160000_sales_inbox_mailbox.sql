-- App › E-mails becomes a real mailbox: every e-mail received on the
-- organization's Cantia address is kept whole (body, recipients,
-- attachments), whoever sent it, with a read / unread state.
-- Filled by supabase/functions/resend-webhook/inbound.ts.

alter table public.sales_emails
  add column if not exists from_name text,
  add column if not exists to_emails text[] not null default '{}',
  add column if not exists cc_emails text[] not null default '{}',
  add column if not exists body_text text,
  add column if not exists body_html text,
  -- [{ name, path, size, content_type }], files in the mail-attachments bucket
  add column if not exists attachments jsonb not null default '[]'::jsonb,
  add column if not exists read_at timestamptz;

create index if not exists sales_emails_org_direction_idx
  on public.sales_emails (organization_id, direction, occurred_at desc);

-- Read / unread, for the people who can see the mailbox.
create or replace function public.set_sales_email_read(p_id uuid, p_read boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.sales_emails where id = p_id;
  if v_org is null or not (public.can_view_org_finances(v_org) and public.org_has_sales_tracking(v_org)) then
    raise exception 'not allowed';
  end if;
  update public.sales_emails set read_at = case when p_read then coalesce(read_at, now()) else null end where id = p_id;
end;
$$;

revoke all on function public.set_sales_email_read(uuid, boolean) from public, anon;
grant execute on function public.set_sales_email_read(uuid, boolean) to authenticated;

-- Attachments of received e-mails: private bucket, path
-- <organization_id>/<sales_email_id>/<file>, readable by the same people
-- as the e-mails (finance access + plan with e-mail tracking). Written by
-- the webhook with the service role only.
insert into storage.buckets (id, name, public, file_size_limit)
values ('mail-attachments', 'mail-attachments', false, 26214400)
on conflict (id) do nothing;

drop policy if exists "finance members read mail attachments" on storage.objects;
create policy "finance members read mail attachments" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'mail-attachments'
    and public.is_uuid_like((storage.foldername(name))[1])
    and public.can_view_org_finances(((storage.foldername(name))[1])::uuid)
    and public.org_has_sales_tracking(((storage.foldername(name))[1])::uuid)
  );
