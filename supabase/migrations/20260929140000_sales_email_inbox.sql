-- Suivi des e-mails (plan Entreprise): each organization gets a private
-- address (<token>@suivi.cantia.ch, Resend inbound). Mails that reach it are
-- filed on the client and the devis they are about:
-- - put it in Bcc when writing to a client from Outlook/Gmail;
-- - forward a client's email to it;
-- - or let Cantia add it to the Reply-To of devis emails, so a client's
--   reply is detected (and stops the follow-ups) without doing anything.
-- Written by the resend-webhook function (email.received) with the service
-- role; read in the app by finance members, like devis_events.

alter table public.devis_events drop constraint if exists devis_events_kind_check;
alter table public.devis_events add constraint devis_events_kind_check check (kind in (
  'sent', 'followup_sent', 'delivered', 'bounced', 'complained',
  'opened', 'clicked', 'portal_viewed', 'pdf_downloaded', 'reply_received', 'email_logged'
));

create table public.sales_email_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  enabled boolean not null default false,
  inbox_token text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  -- Add the address to the Reply-To of devis emails and follow-ups.
  reply_to_copy boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.sales_email_settings enable row level security;
create policy "finance members read sales email settings" on public.sales_email_settings
  for select using (public.can_view_org_finances(organization_id) and public.org_has_sales_tracking(organization_id));
create policy "finance members create sales email settings" on public.sales_email_settings
  for insert with check (public.can_view_org_finances(organization_id) and public.org_has_sales_tracking(organization_id));
create policy "finance members update sales email settings" on public.sales_email_settings
  for update using (public.can_view_org_finances(organization_id) and public.org_has_sales_tracking(organization_id))
  with check (public.can_view_org_finances(organization_id) and public.org_has_sales_tracking(organization_id));

-- New address (the old one stops working at once), e.g. after it leaked.
create or replace function public.regenerate_sales_inbox(p_org_id uuid)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_token text := substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
begin
  if not (public.can_view_org_finances(p_org_id) and public.org_has_sales_tracking(p_org_id)) then
    raise exception 'Accès refusé';
  end if;
  insert into public.sales_email_settings (organization_id, inbox_token) values (p_org_id, v_token)
  on conflict (organization_id) do update set inbox_token = v_token, updated_at = now();
  return v_token;
end;
$$;
revoke execute on function public.regenerate_sales_inbox(uuid) from public, anon;
grant execute on function public.regenerate_sales_inbox(uuid) to authenticated;

create table public.sales_emails (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  direction text not null check (direction in ('outgoing', 'incoming')),
  from_email text not null,
  counterpart_email text,
  subject text,
  snippet text,
  devis_id uuid references public.devis(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  member_user_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(),
  resend_email_id text unique,
  created_at timestamptz not null default now()
);
create index on public.sales_emails (organization_id, occurred_at desc);
create index on public.sales_emails (devis_id) where devis_id is not null;
alter table public.sales_emails enable row level security;
create policy "finance members read sales emails" on public.sales_emails
  for select using (public.can_view_org_finances(organization_id) and public.org_has_sales_tracking(organization_id));
create policy "finance members delete sales emails" on public.sales_emails
  for delete using (public.can_view_org_finances(organization_id) and public.org_has_sales_tracking(organization_id));

-- For the webhook (service role only): the member of an organization behind
-- an email address, and the organizations whose inbox is on for a member
-- address (fallback when the Bcc address is not in the headers).
create or replace function public.sales_inbox_member(p_org_id uuid, p_email text)
returns uuid
language sql stable security definer set search_path = public as $$
  select m.user_id
  from public.organization_members m
  join auth.users u on u.id = m.user_id
  where m.organization_id = p_org_id and lower(u.email) = lower(trim(p_email))
  limit 1;
$$;
revoke execute on function public.sales_inbox_member(uuid, text) from public, anon, authenticated;
grant execute on function public.sales_inbox_member(uuid, text) to service_role;

create or replace function public.sales_inbox_orgs_for_member(p_email text)
returns setof uuid
language sql stable security definer set search_path = public as $$
  select s.organization_id
  from public.sales_email_settings s
  join public.organization_members m on m.organization_id = s.organization_id
  join auth.users u on u.id = m.user_id
  where s.enabled and public.org_has_sales_tracking(s.organization_id) and lower(u.email) = lower(trim(p_email));
$$;
revoke execute on function public.sales_inbox_orgs_for_member(text) from public, anon, authenticated;
grant execute on function public.sales_inbox_orgs_for_member(text) to service_role;
