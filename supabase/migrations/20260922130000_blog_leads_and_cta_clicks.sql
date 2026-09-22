-- ============================================================================
-- Blog conversion funnel: lead-magnet email capture + CTA click tracking.
-- Same anonymous insert-only + admin-only security-definer read pattern as
-- site_pageviews (20260827000000_site_pageviews.sql) — a marketing-site
-- visitor can log a click or submit an email, but can never read this table
-- back, not even their own row.
-- ============================================================================

create table public.blog_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 320 and email like '%_@_%.__%'),
  source_slug text check (source_slug is null or char_length(source_slug) <= 200),
  created_at timestamptz not null default now()
);

create index blog_leads_created_at_idx on public.blog_leads (created_at desc);
create index blog_leads_source_slug_idx on public.blog_leads (source_slug);

alter table public.blog_leads enable row level security;

create policy "anyone can submit a lead" on public.blog_leads
  for insert to anon, authenticated
  with check (true);

create table public.blog_cta_clicks (
  id uuid primary key default gen_random_uuid(),
  source_slug text not null check (char_length(source_slug) <= 200),
  category text check (category is null or char_length(category) <= 80),
  cta_kind text not null check (cta_kind in ('inline', 'closing', 'leadmagnet')),
  created_at timestamptz not null default now()
);

create index blog_cta_clicks_created_at_idx on public.blog_cta_clicks (created_at desc);
create index blog_cta_clicks_source_slug_idx on public.blog_cta_clicks (source_slug);

alter table public.blog_cta_clicks enable row level security;

create policy "anyone can log a cta click" on public.blog_cta_clicks
  for insert to anon, authenticated
  with check (true);

-- Per-article funnel: pageviews (from site_pageviews, FR /blog/<slug> paths
-- only — DE/IT traffic on untranslated slugs is comparatively small and
-- muddies the join), CTA clicks and leads captured, over the last 30 days,
-- so admin can see which articles actually drive signups rather than
-- guessing from traffic alone.
create or replace function public.admin_blog_funnel_overview()
returns jsonb
language plpgsql security definer stable set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  select jsonb_build_object(
    'leads_total', (select count(*) from public.blog_leads),
    'leads_7d', (select count(*) from public.blog_leads where created_at >= now() - interval '7 days'),
    'leads_30d', (select count(*) from public.blog_leads where created_at >= now() - interval '30 days'),
    'clicks_total', (select count(*) from public.blog_cta_clicks),
    'clicks_7d', (select count(*) from public.blog_cta_clicks where created_at >= now() - interval '7 days'),
    'clicks_30d', (select count(*) from public.blog_cta_clicks where created_at >= now() - interval '30 days'),
    'per_article', (
      select coalesce(jsonb_agg(t order by t.pageviews_30d desc), '[]'::jsonb) from (
        select
          slugs.slug,
          coalesce(pv.pageviews_30d, 0) as pageviews_30d,
          coalesce(cl.clicks_30d, 0) as clicks_30d,
          coalesce(ld.leads_30d, 0) as leads_30d
        from (
          select distinct source_slug as slug from public.blog_cta_clicks where created_at >= now() - interval '30 days'
          union
          select distinct source_slug as slug from public.blog_leads where created_at >= now() - interval '30 days' and source_slug is not null
          union
          select distinct substring(path from 7) as slug from public.site_pageviews
          where path like '/blog/%' and created_at >= now() - interval '30 days'
        ) slugs
        left join (
          select substring(path from 7) as slug, count(*) as pageviews_30d
          from public.site_pageviews
          where path like '/blog/%' and created_at >= now() - interval '30 days'
          group by 1
        ) pv on pv.slug = slugs.slug
        left join (
          select source_slug as slug, count(*) as clicks_30d
          from public.blog_cta_clicks
          where created_at >= now() - interval '30 days'
          group by 1
        ) cl on cl.slug = slugs.slug
        left join (
          select source_slug as slug, count(*) as leads_30d
          from public.blog_leads
          where created_at >= now() - interval '30 days' and source_slug is not null
          group by 1
        ) ld on ld.slug = slugs.slug
        where slugs.slug is not null and slugs.slug <> ''
        limit 40
      ) t
    ),
    'recent_leads', (
      select coalesce(jsonb_agg(t order by t.created_at desc), '[]'::jsonb) from (
        select email, source_slug, created_at from public.blog_leads order by created_at desc limit 30
      ) t
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_blog_funnel_overview() from public;
revoke execute on function public.admin_blog_funnel_overview() from anon;
grant execute on function public.admin_blog_funnel_overview() to authenticated;
