-- ============================================================================
-- Richer stats for the admin Trafic screen: day-over-day and week-over-week
-- comparisons (today vs yesterday, this week vs the previous 7 days), plus a
-- longer 60-day timeseries carrying signups and Ads-attributed (gclid)
-- visits per day so the admin chart can plot real trend lines, not just
-- flat totals. No signature change — same 0-arg admin_site_traffic_overview().
-- ============================================================================

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
    'visits_yesterday', (
      select count(*) from public.site_pageviews
      where created_at >= date_trunc('day', now()) - interval '1 day' and created_at < date_trunc('day', now())
    ),
    'visits_7d', (select count(*) from public.site_pageviews where created_at >= now() - interval '7 days'),
    'visits_prev_7d', (
      select count(*) from public.site_pageviews
      where created_at >= now() - interval '14 days' and created_at < now() - interval '7 days'
    ),
    'visits_30d', (select count(*) from public.site_pageviews where created_at >= now() - interval '30 days'),
    'unique_visitors_today', (select count(distinct visitor_id) from public.site_pageviews where created_at >= date_trunc('day', now())),
    'unique_visitors_yesterday', (
      select count(distinct visitor_id) from public.site_pageviews
      where created_at >= date_trunc('day', now()) - interval '1 day' and created_at < date_trunc('day', now())
    ),
    'unique_visitors_7d', (select count(distinct visitor_id) from public.site_pageviews where created_at >= now() - interval '7 days'),
    'unique_visitors_prev_7d', (
      select count(distinct visitor_id) from public.site_pageviews
      where created_at >= now() - interval '14 days' and created_at < now() - interval '7 days'
    ),
    'signups_today', (select count(*) from public.organizations where created_at >= date_trunc('day', now())),
    'signups_yesterday', (
      select count(*) from public.organizations
      where created_at >= date_trunc('day', now()) - interval '1 day' and created_at < date_trunc('day', now())
    ),
    'signups_7d', (select count(*) from public.organizations where created_at >= now() - interval '7 days'),
    'signups_prev_7d', (
      select count(*) from public.organizations
      where created_at >= now() - interval '14 days' and created_at < now() - interval '7 days'
    ),
    'ads_visits_today', (select count(*) from public.site_pageviews where created_at >= date_trunc('day', now()) and gclid is not null),
    'ads_visits_7d', (select count(*) from public.site_pageviews where created_at >= now() - interval '7 days' and gclid is not null),
    'ads_visits_prev_7d', (
      select count(*) from public.site_pageviews
      where created_at >= now() - interval '14 days' and created_at < now() - interval '7 days' and gclid is not null
    ),
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
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'date', to_char(d.day, 'YYYY-MM-DD'),
            'visits', coalesce(v.visits, 0),
            'unique_visitors', coalesce(v.uniques, 0),
            'ads_visits', coalesce(v.ads_visits, 0),
            'signups', coalesce(s.signups, 0)
          )
          order by d.day
        ),
        '[]'::jsonb
      )
      from generate_series(date_trunc('day', now()) - interval '59 days', date_trunc('day', now()), interval '1 day') as d(day)
      left join (
        select
          date_trunc('day', created_at) as day,
          count(*) as visits,
          count(distinct visitor_id) as uniques,
          count(*) filter (where gclid is not null) as ads_visits
        from public.site_pageviews
        where created_at >= now() - interval '60 days'
        group by 1
      ) v on v.day = d.day
      left join (
        select date_trunc('day', created_at) as day, count(*) as signups
        from public.organizations
        where created_at >= now() - interval '60 days'
        group by 1
      ) s on s.day = d.day
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
