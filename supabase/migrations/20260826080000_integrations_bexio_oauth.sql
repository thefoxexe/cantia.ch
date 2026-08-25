-- Realigns Phase 0's generic integrations schema onto the exact table/column
-- names given in the user's own Bexio cahier des charges (section 62-66), and
-- adds what OAuth Phase 1 needs. Safe to ALTER rather than recreate: no real
-- integration rows exist yet (nothing has connected).
--
-- Token storage moves out of `integrations` into a dedicated
-- `integration_credentials` table with NO client-facing RLS policy at all
-- (not even org-admin SELECT) — only the service-role key used by edge
-- functions can touch it. This is defense in depth: even a bug in
-- `integrations`' own policy could never leak a token, because tokens are
-- never in that table to begin with.

alter table public.integrations rename column external_account_id to external_company_id;
alter table public.integrations rename column external_account_name to external_company_name;
alter table public.integrations rename column last_synced_at to last_sync_at;
alter table public.integrations rename column created_by to connected_by;
alter table public.integrations add column last_successful_sync_at timestamptz;
alter table public.integrations add column auto_sync_enabled boolean not null default false;
alter table public.integrations drop column access_token_secret_id;
alter table public.integrations drop column refresh_token_secret_id;
alter table public.integrations drop column token_expires_at;
alter table public.integrations drop column scopes;

create table public.integration_credentials (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade unique,
  -- Ids of secrets created via Supabase Vault (vault.create_secret) by the
  -- oauth-callback edge function — the actual token strings never touch
  -- this table, this codebase's git history, or any client.
  access_token_secret_id uuid not null,
  refresh_token_secret_id uuid,
  expires_at timestamptz,
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.integration_credentials enable row level security;
-- Deliberately zero policies: RLS with no policies denies every row to
-- anon/authenticated regardless of who they are, while the service-role key
-- (used only inside edge functions) bypasses RLS entirely as always. No
-- SELECT policy for org admins or platform admins either — nothing outside
-- a trusted edge function ever needs to read a token.

create trigger integration_credentials_set_updated_at before update on public.integration_credentials
  for each row execute function public.set_updated_at();

-- Short-lived CSRF state for the OAuth authorization-code flow. A row is
-- created by bexio-oauth-start (after verifying the caller is an admin of
-- organization_id) and consumed exactly once by bexio-oauth-callback, which
-- is hit directly by Bexio's redirect with no Cantia session attached — this
-- table is what lets that unauthenticated callback know which organization
-- and which user initiated the connection, and rules out both CSRF and stale
-- replay (checked against created_at at consumption time).
create table public.integration_oauth_states (
  state text primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('bexio')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.integration_oauth_states enable row level security;
-- No client-facing policies here either: only edge functions (service role)
-- create and consume these rows.

notify pgrst, 'reload schema';
