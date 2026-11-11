-- Super Admin › E-mails: three more audiences, chosen through p_filters
-- 'statuses' (every other filter starts from organization_members, so they
-- were in no segment):
--   no_company  signed up but never created their company
--   fiduciary   members of a fiduciary firm (accounting.cantia.ch)
--   partner     Cantia Partners (partners.cantia.ch)
-- Same function as 20261024150000_email_audience.sql otherwise.

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
  union all
  -- Signed up but never created a company (statuses contains 'no_company'):
  -- not members of any organization, and not a fiduciary, a partner or a
  -- platform admin, who have their own spaces without a company.
  select
    u.id, u.email::text, coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), '')::text,
    null::uuid, null::text, null::text, '{}'::text[], null::text, 'no_company'::text, null::text,
    coalesce(nullif(u.raw_user_meta_data->>'locale', ''), 'fr')::text,
    coalesce(ns.subscribed, true), u.last_sign_in_at, null::text
  from auth.users u
  left join public.newsletter_subscriptions ns on ns.user_id = u.id
  where v_statuses is not null and 'no_company' = any(v_statuses)
    and u.email is not null
    and not exists (select 1 from public.organization_members m where m.user_id = u.id)
    and not exists (select 1 from public.partner_profiles pp where pp.user_id = u.id)
    and not exists (select 1 from public.fiduciary_members fm where fm.user_id = u.id)
    and not exists (select 1 from public.platform_admins pa where pa.user_id = u.id)
    and (v_subscribed is null or coalesce(ns.subscribed, true) = v_subscribed)
    and (v_locales is null or coalesce(nullif(u.raw_user_meta_data->>'locale', ''), 'fr') = any(v_locales))
    and (v_created is null or u.created_at >= now() - make_interval(days => v_created))
  union all
  -- Fiduciaries (statuses contains 'fiduciary'): one row per member, with
  -- the firm as company.
  select
    fm.user_id, u.email::text, trim(concat_ws(' ', fm.first_name, fm.last_name))::text,
    null::uuid, ff.name::text, null::text, '{}'::text[], null::text, 'fiduciary'::text, lower(fm.role)::text,
    ff.locale::text, coalesce(ns.subscribed, true), greatest(fm.last_seen_at, u.last_sign_in_at), null::text
  from public.fiduciary_members fm
  join public.fiduciary_firms ff on ff.id = fm.firm_id
  join auth.users u on u.id = fm.user_id
  left join public.newsletter_subscriptions ns on ns.user_id = fm.user_id
  where v_statuses is not null and 'fiduciary' = any(v_statuses)
    and u.email is not null and ff.status = 'ACTIVE'
    and (not v_owners or fm.role = 'OWNER')
    and (v_subscribed is null or coalesce(ns.subscribed, true) = v_subscribed)
    and (v_locales is null or ff.locale = any(v_locales))
    and (v_created is null or fm.created_at >= now() - make_interval(days => v_created))
  union all
  -- Partners (statuses contains 'partner').
  select
    pp.user_id, u.email::text, trim(concat_ws(' ', pp.first_name, pp.last_name))::text,
    null::uuid, pp.company_name::text, null::text, '{}'::text[], null::text, 'partner'::text, lower(pp.partner_type)::text,
    pp.locale::text, coalesce(ns.subscribed, true), u.last_sign_in_at, null::text
  from public.partner_profiles pp
  join auth.users u on u.id = pp.user_id
  left join public.newsletter_subscriptions ns on ns.user_id = pp.user_id
  where v_statuses is not null and 'partner' = any(v_statuses)
    and u.email is not null and pp.status = 'ACTIVE'
    and (v_subscribed is null or coalesce(ns.subscribed, true) = v_subscribed)
    and (v_locales is null or pp.locale = any(v_locales))
    and (v_created is null or pp.created_at >= now() - make_interval(days => v_created))
  order by 13 desc nulls last;
end;
$$;
revoke all on function public.admin_email_audience(jsonb) from public;
revoke execute on function public.admin_email_audience(jsonb) from anon;
grant execute on function public.admin_email_audience(jsonb) to authenticated;
