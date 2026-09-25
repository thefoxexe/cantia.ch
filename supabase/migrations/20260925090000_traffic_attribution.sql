-- ============================================================================
-- Traffic-source attribution: UTM params + Google's gclid, captured on
-- marketing-site pageviews (lib/siteAnalytics.ts) and threaded through to
-- signup so an organization can be traced back to the campaign that
-- actually drove it — not just "someone signed up," but "someone signed up
-- because of this ad." See lib/siteAnalytics.ts's writeAttrCookie for how
-- attribution survives the cantia.ch -> app.cantia.ch domain jump.
-- ============================================================================

alter table public.site_pageviews
  add column if not exists utm_source text check (utm_source is null or char_length(utm_source) <= 100),
  add column if not exists utm_medium text check (utm_medium is null or char_length(utm_medium) <= 100),
  add column if not exists utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 150),
  add column if not exists utm_content text check (utm_content is null or char_length(utm_content) <= 150),
  add column if not exists utm_term text check (utm_term is null or char_length(utm_term) <= 150),
  add column if not exists gclid text check (gclid is null or char_length(gclid) <= 200);

create index if not exists site_pageviews_utm_source_idx on public.site_pageviews (utm_source) where utm_source is not null;

alter table public.organizations
  add column if not exists signup_utm_source text,
  add column if not exists signup_utm_medium text,
  add column if not exists signup_utm_campaign text,
  add column if not exists signup_utm_content text,
  add column if not exists signup_utm_term text,
  add column if not exists signup_gclid text,
  add column if not exists signup_referrer text;

-- Replaces create_organization() with an attribution-aware version, kept
-- otherwise identical to the current live definition (owner name/locale
-- pulled from auth.users, default pdf_templates seeded). All new params
-- are optional so every existing caller (only lib/auth-context.tsx's
-- createOrganization, but defensive anyway) keeps working unchanged until
-- it's updated to actually pass attribution through.
--
-- Dropped explicitly first: CREATE OR REPLACE cannot change a function's
-- parameter list, and leaving the old 2-arg overload in place alongside
-- this one would make every call with exactly (org_name, org_trade) an
-- ambiguous-overload error rather than silently picking either.
drop function if exists public.create_organization(text, text);

create or replace function public.create_organization(
  org_name text,
  org_trade text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_content text default null,
  p_utm_term text default null,
  p_gclid text default null,
  p_referrer text default null
)
returns public.organizations
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  new_org public.organizations;
  owner_full_name text;
  owner_locale text;
begin
  select coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), u.email, ''),
         coalesce(nullif(u.raw_user_meta_data ->> 'locale', ''), 'fr')
    into owner_full_name, owner_locale
    from auth.users u
    where u.id = auth.uid();

  insert into public.organizations (
    name, trade,
    signup_utm_source, signup_utm_medium, signup_utm_campaign,
    signup_utm_content, signup_utm_term, signup_gclid, signup_referrer
  ) values (
    org_name, org_trade,
    p_utm_source, p_utm_medium, p_utm_campaign,
    p_utm_content, p_utm_term, p_gclid, p_referrer
  )
  returning * into new_org;

  insert into public.organization_members (organization_id, user_id, role, full_name, locale)
  values (new_org.id, auth.uid(), 'owner', owner_full_name, owner_locale);

  insert into public.pdf_templates (organization_id, name, kind, base_layout, is_default, sections) values
    (new_org.id, 'Rapport de chantier standard', 'report', 'classic', true, '["intro","photos","signature"]'::jsonb),
    (new_org.id, 'Classique', 'devis', 'classic', true, '[]'::jsonb),
    (new_org.id, 'Moderne', 'devis', 'moderne', false, '[]'::jsonb),
    (new_org.id, 'Minimal', 'devis', 'minimal', false, '[]'::jsonb),
    (new_org.id, 'Structuré', 'devis', 'structure', false, '[]'::jsonb);

  return new_org;
end;
$$;

-- Dropping and recreating a function with a new parameter list resets its
-- privileges to Postgres's function default — EXECUTE granted to PUBLIC,
-- which includes anon. Close that explicitly instead of relying on the
-- grant below alone (it's additive, not exclusive).
revoke all on function public.create_organization(text, text, text, text, text, text, text, text, text) from public;
revoke execute on function public.create_organization(text, text, text, text, text, text, text, text, text) from anon;
grant execute on function public.create_organization(text, text, text, text, text, text, text, text, text) to authenticated;

-- Extends admin_site_traffic_overview() with a source breakdown (visits by
-- utm_source/medium/campaign) and a signups-by-source breakdown, on top of
-- the visit counts / top pages / timeseries it already returned.
create or replace function public.admin_site_traffic_overview()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  select jsonb_build_object(
    'visits_today', (select count(*) from public.site_pageviews where created_at >= date_trunc('day', now())),
    'visits_7d', (select count(*) from public.site_pageviews where created_at >= now() - interval '7 days'),
    'visits_30d', (select count(*) from public.site_pageviews where created_at >= now() - interval '30 days'),
    'unique_visitors_today', (select count(distinct visitor_id) from public.site_pageviews where created_at >= date_trunc('day', now())),
    'unique_visitors_7d', (select count(distinct visitor_id) from public.site_pageviews where created_at >= now() - interval '7 days'),
    'top_pages', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select path, count(*) as visits
        from public.site_pageviews
        where created_at >= now() - interval '7 days'
        group by path
        order by count(*) desc
        limit 8
      ) t
    ),
    'timeseries', (
      select coalesce(jsonb_agg(jsonb_build_object('date', to_char(d.day, 'YYYY-MM-DD'), 'visits', coalesce(v.visits, 0), 'unique_visitors', coalesce(v.uniques, 0)) order by d.day), '[]'::jsonb)
      from generate_series(date_trunc('day', now()) - interval '29 days', date_trunc('day', now()), interval '1 day') as d(day)
      left join (
        select date_trunc('day', created_at) as day, count(*) as visits, count(distinct visitor_id) as uniques
        from public.site_pageviews
        where created_at >= now() - interval '30 days'
        group by 1
      ) v on v.day = d.day
    ),
    'sources_30d', (
      select coalesce(jsonb_agg(t order by t.visits desc), '[]'::jsonb) from (
        select
          coalesce(utm_source, '(direct / organique)') as source,
          utm_medium as medium,
          utm_campaign as campaign,
          count(*) as visits,
          count(distinct visitor_id) as unique_visitors,
          count(*) filter (where gclid is not null) as gclid_visits
        from public.site_pageviews
        where created_at >= now() - interval '30 days'
        group by 1, 2, 3
        order by count(*) desc
        limit 20
      ) t
    ),
    'signups_by_source_30d', (
      select coalesce(jsonb_agg(t order by t.signups desc), '[]'::jsonb) from (
        select
          coalesce(signup_utm_source, '(direct / organique)') as source,
          signup_utm_campaign as campaign,
          count(*) as signups
        from public.organizations
        where created_at >= now() - interval '30 days'
        group by 1, 2
        order by count(*) desc
        limit 20
      ) t
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_site_traffic_overview() from public;
revoke execute on function public.admin_site_traffic_overview() from anon;
grant execute on function public.admin_site_traffic_overview() to authenticated;
