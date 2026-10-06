-- Planning ↔ Google Calendar / Outlook, per person. Each member may connect
-- their own Google and/or Microsoft calendar:
--   · Cantia → calendar: their planning events are written into it;
--   · calendar → Cantia: their own appointments come into their planning as
--     private events (colleagues only see « Rendez-vous privé »).
-- Tokens live in Vault (vault_upsert_secret), never in a table the app can
-- read. Edge function: supabase/functions/calendar-sync.

-- One-time OAuth state: the provider's redirect carries no Cantia session,
-- this row says who asked (consumed once, 10 minutes max).
create table if not exists public.calendar_oauth_states (
  state text primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google', 'microsoft')),
  return_to text,
  created_at timestamptz not null default now()
);
alter table public.calendar_oauth_states enable row level security;
revoke all on public.calendar_oauth_states from anon, authenticated;

create table if not exists public.calendar_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google', 'microsoft')),
  account_email text,
  calendar_id text not null default 'primary',
  -- incremental read position: Google nextSyncToken / Graph deltaLink
  sync_cursor text,
  access_token_secret_id uuid,
  refresh_token_secret_id uuid,
  access_expires_at timestamptz,
  status text not null default 'connected' check (status in ('connected', 'error')),
  last_error text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, provider)
);

alter table public.calendar_connections enable row level security;
-- Everyone sees only their own connections, and never the token columns.
revoke all on public.calendar_connections from anon, authenticated;
grant select (id, organization_id, user_id, provider, account_email, status, last_error, last_synced_at, created_at) on public.calendar_connections to authenticated;
create policy "calendar: own connections" on public.calendar_connections for select using (user_id = auth.uid());

-- One Cantia event ↔ one calendar event. assignment_id goes null when the
-- Cantia event is deleted: the next sync then deletes it in the calendar.
create table if not exists public.calendar_event_links (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.calendar_connections(id) on delete cascade,
  assignment_id uuid references public.planning_assignments(id) on delete set null,
  external_id text not null,
  origin text not null check (origin in ('cantia', 'calendar')),
  -- planning_assignments.updated_at last written to the calendar
  pushed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (connection_id, external_id)
);
create index if not exists calendar_event_links_assignment on public.calendar_event_links (assignment_id);
alter table public.calendar_event_links enable row level security;
revoke all on public.calendar_event_links from anon, authenticated;

-- Appointments imported from a calendar: removed with the connection.
alter table public.planning_assignments add column if not exists calendar_connection_id uuid references public.calendar_connections(id) on delete cascade;
