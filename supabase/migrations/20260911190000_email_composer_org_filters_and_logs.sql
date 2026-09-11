-- Org-level quick filters for the admin e-mail composer ("résiliés", "en
-- essai", "plan découverte sans carte", "inscription incomplète") —
-- resolves to the ORG OWNER only (they're the one who deals with billing),
-- unlike admin_filter_user_ids which returns every member of matching
-- orgs for plan/newsletter-preference segments. Same subscribed-by-default
-- safety as that function.
create or replace function public.admin_filter_owner_ids(p_org_status text default null, p_subscribed boolean default null)
returns table(user_id uuid)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select distinct m.user_id
  from public.organization_members m
  join public.organizations o on o.id = m.organization_id
  left join public.newsletter_subscriptions ns on ns.user_id = m.user_id
  where m.role = 'owner'
    and (
      p_org_status is null
      or (p_org_status = 'canceled' and o.subscription_status = 'canceled')
      or (p_org_status = 'trialing' and o.subscription_status = 'trialing')
      or (p_org_status = 'decouverte' and o.plan_id = 'decouverte')
      or (p_org_status = 'incomplete' and o.plan_id is null)
    )
    and (p_subscribed is null or coalesce(ns.subscribed, true) = p_subscribed);
end;
$$;

revoke all on function public.admin_filter_owner_ids(text, boolean) from public;
revoke execute on function public.admin_filter_owner_ids(text, boolean) from anon;
grant execute on function public.admin_filter_owner_ids(text, boolean) to authenticated;

-- Simple send history for the admin e-mail composer — "qui a reçu quoi,
-- quand, quel sujet". Written by send-newsletter-campaign (service role)
-- right after a real send (not a test send). recipient_emails is the
-- actual list mailed, not just a count, so a past campaign can be audited
-- precisely later.
create table public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  html text not null,
  from_persona text not null check (from_persona in ('newsletter', 'info')),
  sent_by uuid references auth.users(id) on delete set null,
  recipient_emails jsonb not null default '[]'::jsonb,
  sent_count int not null default 0,
  skipped_count int not null default 0,
  total_count int not null default 0,
  created_at timestamptz not null default now()
);

create index newsletter_campaigns_created_at_idx on public.newsletter_campaigns (created_at desc);

alter table public.newsletter_campaigns enable row level security;

create policy "platform admins can view newsletter campaigns" on public.newsletter_campaigns
  for select using (public.is_platform_admin());

-- No insert/update/delete policy — only the service role (the edge
-- function) writes here, same pattern as admin_audit_logs.

-- Per-organization subscription lifecycle timeline — "ça va être annulé
-- bientôt, il faut que je les relance", "voir comment ça va être résilié".
-- Written by stripe-webhook (service role) as the real events happen.
create table public.organization_subscription_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type text not null check (event_type in ('activated', 'trial_started', 'plan_changed', 'canceled')),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index organization_subscription_events_org_idx on public.organization_subscription_events (organization_id, created_at desc);

alter table public.organization_subscription_events enable row level security;

create policy "platform admins can view organization subscription events" on public.organization_subscription_events
  for select using (public.is_platform_admin());

-- Returns an org's subscription timeline, newest first — a thin RPC rather
-- than a direct table read so this stays consistent with the rest of this
-- schema's admin-only reads (is_platform_admin() checked server-side, not
-- just via RLS) and so the admin org detail screen doesn't need its own
-- policy-shaped query.
create or replace function public.admin_get_organization_events(p_organization_id uuid)
returns table(id uuid, event_type text, detail jsonb, created_at timestamptz)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select e.id, e.event_type, e.detail, e.created_at
  from public.organization_subscription_events e
  where e.organization_id = p_organization_id
  order by e.created_at desc;
end;
$$;

revoke all on function public.admin_get_organization_events(uuid) from public;
revoke execute on function public.admin_get_organization_events(uuid) from anon;
grant execute on function public.admin_get_organization_events(uuid) to authenticated;
notify pgrst, 'reload schema';
