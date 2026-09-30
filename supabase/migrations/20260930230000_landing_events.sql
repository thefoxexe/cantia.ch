-- What visitors do on the campaign landing pages (cantia.ch/presentation,
-- linked from e-mails): video played, which button clicked. Pageviews are
-- already in site_pageviews (path + UTM). Anonymous and insert-only, same
-- pattern as blog_cta_clicks: the random visitor id from
-- lib/siteAnalytics.ts, no personal data. Read by admins only (SQL / admin).
create table if not exists public.landing_events (
  id bigint generated always as identity primary key,
  page text not null check (char_length(page) between 1 and 60),
  kind text not null check (kind in ('video_play', 'cta_signup', 'cta_call', 'cta_email')),
  location text check (location is null or char_length(location) <= 40),
  visitor_id text check (visitor_id is null or char_length(visitor_id) <= 64),
  utm_source text check (utm_source is null or char_length(utm_source) <= 100),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 100),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 100),
  created_at timestamptz not null default now()
);
create index if not exists landing_events_page_idx on public.landing_events (page, created_at desc);

alter table public.landing_events enable row level security;
drop policy if exists "anyone can log a landing event" on public.landing_events;
create policy "anyone can log a landing event" on public.landing_events
  for insert to anon, authenticated with check (true);
grant insert on public.landing_events to anon, authenticated;
