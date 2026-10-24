-- Super Admin › E-mails: target by sector and trades, plan, account status,
-- language, activity, module usage and sign-up channel, then send one
-- message per language (FR/DE/IT) with the recipient's name and company
-- filled in.

-- Every filter is optional and they combine with AND; inside one filter the
-- values combine with OR. p_filters keys:
--   trades        text[]  organizations.trade values (sector labels)
--   specialties   text[]  any of organizations.trade_specialties
--   plans         text[]  organizations.plan_id
--   statuses      text[]  subscription status: active, trialing, canceled,
--                         past_due, trial_expired, none (no subscription)
--   locales       text[]  fr, de, it (member's language, else company's)
--   owners_only   boolean only the owner of each company
--   activity      text    active7 | active30 | inactive30 | never
--   used          text[]  area prefixes the company opened (org_usage_days)
--   not_used      text[]  area prefixes the company never opened
--   channels      text[]  signup_channel(org)->>'key'
--   created_days  int     company created within the last N days
--   subscribed    boolean newsletter preference (null = everyone)
--   include_internal boolean (default false)
create or replace function public.admin_email_audience(p_filters jsonb default '{}'::jsonb)
returns table(
  user_id uuid,
  email text,
  full_name text,
  organization_id uuid,
  organization_name text,
  trade text,
  specialties text[],
  plan_id text,
  subscription_status text,
  role text,
  locale text,
  subscribed boolean,
  last_active_at timestamptz,
  channel text
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  f jsonb := coalesce(p_filters, '{}'::jsonb);
  v_trades text[] := (select array_agg(x) from jsonb_array_elements_text(f->'trades') x);
  v_specs text[] := (select array_agg(x) from jsonb_array_elements_text(f->'specialties') x);
  v_plans text[] := (select array_agg(x) from jsonb_array_elements_text(f->'plans') x);
  v_statuses text[] := (select array_agg(x) from jsonb_array_elements_text(f->'statuses') x);
  v_locales text[] := (select array_agg(x) from jsonb_array_elements_text(f->'locales') x);
  v_used text[] := (select array_agg(x) from jsonb_array_elements_text(f->'used') x);
  v_not_used text[] := (select array_agg(x) from jsonb_array_elements_text(f->'not_used') x);
  v_channels text[] := (select array_agg(x) from jsonb_array_elements_text(f->'channels') x);
  v_owners boolean := coalesce((f->>'owners_only')::boolean, false);
  v_activity text := f->>'activity';
  v_created int := (f->>'created_days')::int;
  v_subscribed boolean := (f->>'subscribed')::boolean;
  v_internal boolean := coalesce((f->>'include_internal')::boolean, false);
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  with base as (
    select distinct on (m.user_id)
      m.user_id,
      u.email::text as email,
      m.full_name,
      o.id as organization_id,
      o.name as organization_name,
      o.trade,
      coalesce(o.trade_specialties, '{}') as specialties,
      o.plan_id,
      coalesce(o.subscription_status, 'none') as subscription_status,
      m.role::text as role,
      coalesce(nullif(m.locale, ''), nullif(o.locale, ''), 'fr') as locale,
      coalesce(ns.subscribed, true) as subscribed,
      greatest(
        m.last_seen_at,
        u.last_sign_in_at,
        (select max(d.last_at) from public.org_usage_days d where d.organization_id = o.id and d.user_id = m.user_id)
      ) as last_active_at,
      o.created_at as org_created_at,
      o.is_internal
    from public.organization_members m
    join auth.users u on u.id = m.user_id
    join public.organizations o on o.id = m.organization_id
    left join public.newsletter_subscriptions ns on ns.user_id = m.user_id
    where u.email is not null
    order by m.user_id, (m.role = 'owner') desc, m.created_at
  )
  select
    b.user_id, b.email, b.full_name, b.organization_id, b.organization_name, b.trade, b.specialties,
    b.plan_id, b.subscription_status, b.role, b.locale, b.subscribed, b.last_active_at,
    public.signup_channel(b.organization_id)->>'key' as channel
  from base b
  where (v_internal or not coalesce(b.is_internal, false))
    and (v_trades is null or b.trade = any(v_trades))
    and (v_specs is null or b.specialties && v_specs)
    and (v_plans is null or b.plan_id = any(v_plans))
    and (v_statuses is null or b.subscription_status = any(v_statuses))
    and (v_locales is null or b.locale = any(v_locales))
    and (not v_owners or b.role = 'owner')
    and (v_subscribed is null or b.subscribed = v_subscribed)
    and (v_created is null or b.org_created_at >= now() - make_interval(days => v_created))
    and (
      v_activity is null
      or (v_activity = 'active7' and b.last_active_at >= now() - interval '7 days')
      or (v_activity = 'active30' and b.last_active_at >= now() - interval '30 days')
      or (v_activity = 'inactive30' and (b.last_active_at is null or b.last_active_at < now() - interval '30 days'))
      or (v_activity = 'never' and not exists (select 1 from public.org_usage_days d where d.organization_id = b.organization_id))
    )
    and (v_used is null or exists (
      select 1 from public.org_usage_days d, unnest(v_used) p
       where d.organization_id = b.organization_id and (d.area = p or d.area like p || '.%' or d.area like '%.' || p || '%')
    ))
    and (v_not_used is null or not exists (
      select 1 from public.org_usage_days d, unnest(v_not_used) p
       where d.organization_id = b.organization_id and (d.area = p or d.area like p || '.%' or d.area like '%.' || p || '%')
    ))
    and (v_channels is null or (public.signup_channel(b.organization_id)->>'key') = any(v_channels))
  order by b.last_active_at desc nulls last;
end;
$$;
revoke all on function public.admin_email_audience(jsonb) from public;
revoke execute on function public.admin_email_audience(jsonb) from anon;
grant execute on function public.admin_email_audience(jsonb) to authenticated;

-- One message per language, and a readable description of who it went to.
alter table public.newsletter_campaigns add column if not exists variants jsonb;
alter table public.newsletter_campaigns add column if not exists audience_label text;
alter table public.scheduled_newsletter_sends add column if not exists variants jsonb;
alter table public.scheduled_newsletter_sends add column if not exists audience_label text;

create or replace function public.admin_schedule_newsletter_send_v2(
  p_subject text,
  p_html text,
  p_user_ids uuid[],
  p_from_persona text,
  p_include_unsubscribed boolean,
  p_scheduled_at timestamptz,
  p_variants jsonb default null,
  p_audience_label text default null
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  if p_scheduled_at <= now() then
    raise exception 'scheduled_at must be in the future';
  end if;

  insert into public.scheduled_newsletter_sends
    (subject, html, from_persona, user_ids, include_unsubscribed, scheduled_at, created_by, variants, audience_label)
  values
    (p_subject, p_html, case when p_from_persona = 'info' then 'info' else 'newsletter' end, p_user_ids, p_include_unsubscribed, p_scheduled_at, auth.uid(), p_variants, p_audience_label)
  returning id into v_id;

  return v_id;
end;
$$;
revoke all on function public.admin_schedule_newsletter_send_v2(text, text, uuid[], text, boolean, timestamptz, jsonb, text) from public;
revoke execute on function public.admin_schedule_newsletter_send_v2(text, text, uuid[], text, boolean, timestamptz, jsonb, text) from anon;
grant execute on function public.admin_schedule_newsletter_send_v2(text, text, uuid[], text, boolean, timestamptz, jsonb, text) to authenticated;

notify pgrst, 'reload schema';
