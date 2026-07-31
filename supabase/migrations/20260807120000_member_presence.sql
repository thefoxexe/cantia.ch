-- Lightweight "who's online" presence for the team screen/dashboard — no
-- realtime channel, just a heartbeat timestamp the client bumps every ~60s
-- while the app is foregrounded. A member is considered online if this is
-- within the last couple of minutes (computed client-side against now()).
alter table public.organization_members
  add column last_seen_at timestamptz not null default now();

-- Marks the caller "online" everywhere they're a member. No organization_id
-- param: presence means "this person has the app open right now", not
-- "...in whichever org the client currently has selected" — simpler, and
-- avoids a race with client-side org-switching state. Security definer so
-- the heartbeat doesn't need a broad UPDATE RLS policy on this table; the
-- WHERE clause already scopes it to the caller's own rows.
create or replace function public.touch_presence()
returns void language sql security definer set search_path = public as $$
  update public.organization_members set last_seen_at = now() where user_id = auth.uid();
$$;
grant execute on function public.touch_presence() to authenticated;
