-- ============================================================================
-- Site traffic (cantia.ch pageviews) — lightweight self-hosted analytics.
-- No third-party script, no tracking cookie/banner needed: an anonymous
-- per-browser id generated client-side into localStorage (lib/siteAnalytics.ts),
-- never leaves this domain, no PII. Logged only from the marketing host
-- (cantia.ch), never from the authenticated app — see the isMarketingHost()
-- gate around the insert call.
-- ============================================================================
create table public.site_pageviews (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) between 1 and 300),
  visitor_id uuid not null,
  referrer text check (referrer is null or char_length(referrer) <= 500),
  created_at timestamptz not null default now()
);

create index site_pageviews_created_at_idx on public.site_pageviews (created_at desc);
create index site_pageviews_visitor_idx on public.site_pageviews (visitor_id);

alter table public.site_pageviews enable row level security;

-- Insert-only, no select policy at all — a client can log a pageview but can
-- never read the table back (not even its own rows). Reading happens
-- exclusively through admin_site_traffic_overview() below, which is
-- security definer + gated on is_platform_admin(), same pattern as every
-- other admin_* RPC.
create policy "anyone can log a pageview" on public.site_pageviews
  for insert to anon, authenticated
  with check (true);

create or replace function public.admin_site_traffic_overview()
returns jsonb
language plpgsql security definer stable set search_path = public as $$
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
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_site_traffic_overview() from public;
revoke execute on function public.admin_site_traffic_overview() from anon;
grant execute on function public.admin_site_traffic_overview() to authenticated;
