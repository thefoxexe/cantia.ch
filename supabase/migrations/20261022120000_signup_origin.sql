-- ============================================================================
-- Where a company's signup came from, for the admin dashboard
-- (app/(admin)/organizations/[id].tsx).
--
-- Already known per organization: UTM / gclid of the first campaign visit,
-- the referrer of the signup page, a partner attribution, a fiduciary
-- invitation. Added here: the first visit on cantia.ch (landing page,
-- external referrer, date) and the anonymous visitor id of that browser,
-- so the pages seen before signing up can be read back from
-- site_pageviews. These travel in the .cantia.ch cookie cantia_origin,
-- written only after the visitor accepted cookies (lib/siteAnalytics.ts),
-- and are recorded once, by the owner, right after the company is created.
-- ============================================================================

alter table public.organizations
  add column if not exists signup_visitor_id text,
  add column if not exists signup_landing_path text,
  add column if not exists signup_landing_referrer text,
  add column if not exists signup_first_seen_at timestamptz,
  add column if not exists signup_host text;

-- Called by the owner right after create_organization(). Written once, and
-- only during the first day of the company.
create or replace function public.record_signup_origin(
  p_org uuid,
  p_visitor_id text default null,
  p_landing_path text default null,
  p_landing_referrer text default null,
  p_first_seen_at timestamptz default null,
  p_host text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  if not exists (
    select 1 from public.organization_members
    where organization_id = p_org and user_id = auth.uid() and role = 'owner'
  ) then
    return;
  end if;
  update public.organizations
     set signup_visitor_id = left(nullif(trim(p_visitor_id), ''), 64),
         signup_landing_path = left(nullif(trim(p_landing_path), ''), 300),
         signup_landing_referrer = left(nullif(trim(p_landing_referrer), ''), 300),
         signup_first_seen_at = case when p_first_seen_at <= now() then p_first_seen_at end,
         signup_host = left(nullif(trim(p_host), ''), 100)
   where id = p_org
     and signup_host is null
     and created_at > now() - interval '1 day';
end;
$$;
revoke execute on function public.record_signup_origin(uuid, text, text, text, timestamptz, text) from public, anon;
grant execute on function public.record_signup_origin(uuid, text, text, text, timestamptz, text) to authenticated;

-- Host of a URL, without "www.".
create or replace function public.url_host(p_url text)
returns text
language sql
immutable
as $$
  select nullif(regexp_replace(lower(substring(coalesce(p_url, '') from '^[a-z]+://([^/?#:]+)')), '^www\.', ''), '');
$$;

-- The channel that brought a company, most specific first: partner,
-- fiduciary, paid campaign, the outside site the visitor came from, a blog
-- article, the site itself.
create or replace function public.signup_channel(p_org uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  o public.organizations;
  v_partner text;
  v_firm text;
  v_host text;
  v_owner_email text;
  v_lead text;
begin
  select * into o from public.organizations where id = p_org;
  if not found then
    return null;
  end if;

  select coalesce(nullif(p.company_name, ''), nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), ra.code)
    into v_partner
    from public.referral_attributions ra
    left join public.partner_profiles p on p.id = ra.partner_id
   where ra.organization_id = p_org
   limit 1;
  if v_partner is not null then
    return jsonb_build_object('key', 'partner', 'label', 'Partenaire', 'detail', v_partner);
  end if;

  select f.name into v_firm
    from public.fiduciary_client_access a
    join public.fiduciary_firms f on f.id = a.firm_id
   where a.organization_id = p_org
     and a.source in ('NEW_CLIENT_INVITE', 'CLIENT_INVITE')
     and a.created_at < o.created_at + interval '1 day'
   order by a.created_at
   limit 1;
  if v_firm is not null then
    return jsonb_build_object('key', 'fiduciary', 'label', 'Invitation d’une fiduciaire', 'detail', v_firm);
  end if;

  if o.signup_gclid is not null then
    return jsonb_build_object('key', 'google_ads', 'label', 'Google Ads', 'detail', coalesce(o.signup_utm_campaign, o.signup_utm_source));
  end if;
  if o.signup_utm_source is not null then
    return jsonb_build_object('key', 'campaign', 'label', 'Campagne', 'detail', concat_ws(' · ', o.signup_utm_source, o.signup_utm_medium, o.signup_utm_campaign));
  end if;

  -- The outside site of the first visit, else the one before the signup
  -- page (accounts.google.com is only the Google sign-in step).
  v_host := coalesce(
    case when public.url_host(o.signup_landing_referrer) !~ '(^|\.)cantia\.ch$' then public.url_host(o.signup_landing_referrer) end,
    case when public.url_host(o.signup_referrer) !~ '(^|\.)cantia\.ch$' and public.url_host(o.signup_referrer) <> 'accounts.google.com' then public.url_host(o.signup_referrer) end
  );
  if v_host is not null then
    return jsonb_build_object(
      'key', case
        when v_host ~ '(^|\.)google\.' or v_host ~ '(^|\.)(bing\.com|duckduckgo\.com|search\.yahoo\.com|ecosia\.org|qwant\.com|search\.brave\.com)$' then 'search'
        when v_host ~ '(^|\.)(linkedin\.com|lnkd\.in|facebook\.com|fb\.com|instagram\.com|tiktok\.com|twitter\.com|x\.com|t\.co|youtube\.com|whatsapp\.com|reddit\.com)$' then 'social'
        when v_host ~ '(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$' then 'ai'
        else 'website' end,
      'label', case
        when v_host ~ '(^|\.)google\.' then 'Recherche Google'
        when v_host ~ '(^|\.)(bing\.com|duckduckgo\.com|search\.yahoo\.com|ecosia\.org|qwant\.com|search\.brave\.com)$' then 'Moteur de recherche'
        when v_host ~ '(^|\.)(linkedin\.com|lnkd\.in)$' then 'LinkedIn'
        when v_host ~ '(^|\.)(facebook\.com|fb\.com)$' then 'Facebook'
        when v_host ~ '(^|\.)instagram\.com$' then 'Instagram'
        when v_host ~ '(^|\.)tiktok\.com$' then 'TikTok'
        when v_host ~ '(^|\.)youtube\.com$' then 'YouTube'
        when v_host ~ '(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$' then 'Assistant IA'
        when v_host ~ '(^|\.)(twitter\.com|x\.com|t\.co|whatsapp\.com|reddit\.com)$' then 'Réseau social'
        else 'Autre site' end,
      'detail', v_host);
  end if;

  select u.email into v_owner_email
    from public.organization_members m
    join auth.users u on u.id = m.user_id
   where m.organization_id = p_org and m.role = 'owner'
   order by m.created_at
   limit 1;
  select bl.source_slug into v_lead
    from public.blog_leads bl
   where v_owner_email is not null and lower(bl.email) = lower(v_owner_email) and bl.created_at <= o.created_at + interval '1 hour'
   order by bl.created_at
   limit 1;
  if v_lead is not null then
    return jsonb_build_object('key', 'blog', 'label', 'Article du blog', 'detail', v_lead);
  end if;

  if o.signup_landing_path is not null then
    return jsonb_build_object('key', 'direct', 'label', 'Accès direct au site', 'detail', o.signup_landing_path);
  end if;
  if public.url_host(o.signup_referrer) ~ '(^|\.)cantia\.ch$' then
    return jsonb_build_object('key', 'site', 'label', 'Site cantia.ch', 'detail', null);
  end if;
  return jsonb_build_object('key', 'unknown', 'label', 'Inconnue', 'detail', null);
end;
$$;
revoke execute on function public.signup_channel(uuid) from public, anon, authenticated;

-- Channel of each company of the admin list.
create or replace function public.admin_signup_channels(p_ids uuid[])
returns table(organization_id uuid, channel jsonb)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  return query
    select o.id, public.signup_channel(o.id)
      from public.organizations o
     where o.id = any(p_ids);
end;
$$;
revoke execute on function public.admin_signup_channels(uuid[]) from public, anon;
grant execute on function public.admin_signup_channels(uuid[]) to authenticated;

-- Everything known about how a company signed up.
create or replace function public.admin_get_organization_origin(p_org uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  o public.organizations;
  v_owner record;
  v_until timestamptz;
  v_vid uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  select * into o from public.organizations where id = p_org;
  if not found then
    raise exception 'organization not found';
  end if;
  v_until := o.created_at + interval '1 hour';
  -- site_pageviews keys visitors by uuid.
  if o.signup_visitor_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_vid := o.signup_visitor_id::uuid;
  end if;

  select u.email, u.created_at, u.raw_app_meta_data ->> 'provider' as provider,
         u.raw_user_meta_data ->> 'signup_source' as signup_source,
         (u.raw_user_meta_data ->> 'newsletter_opt_in')::boolean as newsletter
    into v_owner
    from public.organization_members m
    join auth.users u on u.id = m.user_id
   where m.organization_id = p_org and m.role = 'owner'
   order by m.created_at
   limit 1;

  return jsonb_build_object(
    'channel', public.signup_channel(p_org),
    'created_at', o.created_at,
    'host', o.signup_host,
    'owner', case when v_owner.email is null then null else jsonb_build_object(
      'email', v_owner.email,
      'account_created_at', v_owner.created_at,
      'provider', v_owner.provider,
      'signup_source', v_owner.signup_source,
      'newsletter', v_owner.newsletter) end,
    'campaign', case when coalesce(o.signup_utm_source, o.signup_utm_medium, o.signup_utm_campaign, o.signup_gclid) is null then null else jsonb_build_object(
      'utm_source', o.signup_utm_source,
      'utm_medium', o.signup_utm_medium,
      'utm_campaign', o.signup_utm_campaign,
      'utm_content', o.signup_utm_content,
      'utm_term', o.signup_utm_term,
      'gclid', o.signup_gclid is not null) end,
    'signup_referrer', o.signup_referrer,
    'first_visit', case when o.signup_landing_path is null and o.signup_first_seen_at is null then null else jsonb_build_object(
      'landing_path', o.signup_landing_path,
      'referrer', o.signup_landing_referrer,
      'at', o.signup_first_seen_at) end,
    'journey', case when v_vid is null then null else (
      select jsonb_build_object(
        'pageviews', count(*),
        'days', count(distinct (pv.created_at at time zone 'Europe/Zurich')::date),
        'first_at', min(pv.created_at),
        'last_at', max(pv.created_at),
        'pages', coalesce((
          select jsonb_agg(jsonb_build_object('path', x.path, 'at', x.first_at, 'views', x.views) order by x.first_at)
            from (
              select p2.path, min(p2.created_at) as first_at, count(*) as views
                from public.site_pageviews p2
               where p2.visitor_id = v_vid and p2.created_at <= v_until
               group by p2.path
               order by min(p2.created_at)
               limit 40
            ) x), '[]'::jsonb),
        'referrers', coalesce((
          select jsonb_agg(distinct public.url_host(p3.referrer))
            from public.site_pageviews p3
           where p3.visitor_id = v_vid and p3.created_at <= v_until
             and public.url_host(p3.referrer) is not null
             and public.url_host(p3.referrer) !~ '(^|\.)cantia\.ch$'), '[]'::jsonb),
        'actions', coalesce((
          select jsonb_agg(jsonb_build_object('page', le.page, 'kind', le.kind, 'at', le.created_at) order by le.created_at)
            from public.landing_events le
           where le.visitor_id = o.signup_visitor_id and le.created_at <= v_until), '[]'::jsonb))
      from public.site_pageviews pv
     where pv.visitor_id = v_vid and pv.created_at <= v_until) end,
    'partner', (
      select jsonb_build_object(
        'name', coalesce(nullif(p.company_name, ''), nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '')),
        'code', ra.code,
        'source', ra.source,
        'first_click_at', ra.first_click_at,
        'attributed_at', ra.attributed_at,
        'clicks', coalesce((
          select jsonb_agg(jsonb_build_object('landing_page', rc.landing_page, 'referrer', public.url_host(rc.referrer), 'at', rc.created_at) order by rc.created_at)
            from public.referral_clicks rc
           where ra.visitor_id is not null and rc.visitor_id = ra.visitor_id and rc.created_at <= v_until), '[]'::jsonb))
        from public.referral_attributions ra
        left join public.partner_profiles p on p.id = ra.partner_id
       where ra.organization_id = p_org
       limit 1),
    'fiduciaries', coalesce((
      select jsonb_agg(jsonb_build_object('firm', f.name, 'city', f.city, 'source', a.source, 'status', a.status, 'requested_at', a.requested_at) order by a.created_at)
        from public.fiduciary_client_access a
        join public.fiduciary_firms f on f.id = a.firm_id
       where a.organization_id = p_org), '[]'::jsonb),
    'blog_leads', coalesce((
      select jsonb_agg(jsonb_build_object('slug', bl.source_slug, 'at', bl.created_at) order by bl.created_at)
        from public.blog_leads bl
       where v_owner.email is not null and lower(bl.email) = lower(v_owner.email)), '[]'::jsonb)
  );
end;
$$;
revoke execute on function public.admin_get_organization_origin(uuid) from public, anon;
grant execute on function public.admin_get_organization_origin(uuid) to authenticated;
