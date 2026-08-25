-- Phase 0 of native accounting-software integrations (Bexio is the first
-- provider, per the user's own cahier des charges). Deliberately
-- provider-agnostic: `provider` is just a text column, not a Bexio-specific
-- schema, so a future integration (Klara, Abacus, Zapier...) reuses the same
-- four tables instead of a parallel structure being bolted on later.
--
-- No OAuth wiring, no Bexio endpoints, no Bexio scopes are implemented here —
-- this migration only lays the generic data model. The actual Bexio
-- connection (edge function, token exchange, sync logic) is deliberately not
-- built yet: it must be verified against live Bexio docs/sandbox first, per
-- the explicit rule "ne jamais inventer le fonctionnement de Bexio".
--
-- Feature gating reuses the existing modules/organization_modules registry
-- (see 20260825010000_super_admin_and_modules.sql and
-- 20260826060000_org_self_service_private_modules.sql) rather than a new
-- flag mechanism: a platform admin grants the 'bexio_integration' module to
-- a specific org, and that org's own admin then activates it — same
-- two-tier model as every other private module.

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('bexio')),
  status text not null default 'disconnected' check (status in ('disconnected', 'connecting', 'connected', 'error', 'revoked')),
  external_account_id text,
  external_account_name text,
  scopes text[] not null default '{}',
  -- Actual OAuth tokens are never stored in plaintext in this table. These
  -- columns hold the id of a secret created via Supabase Vault
  -- (vault.create_secret) from the edge function that performs the token
  -- exchange — never written to or read from client code.
  access_token_secret_id uuid,
  refresh_token_secret_id uuid,
  token_expires_at timestamptz,
  last_synced_at timestamptz,
  last_error text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create table public.integration_mappings (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text not null,
  local_id uuid not null,
  external_id text not null,
  external_type text,
  sync_direction text not null default 'push' check (sync_direction in ('push', 'pull', 'bidirectional')),
  last_synced_at timestamptz,
  last_local_hash text,
  last_remote_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integration_id, entity_type, local_id),
  unique (integration_id, entity_type, external_id)
);

-- Append-only audit trail: every sync attempt is traceable, per the spec's
-- explicit requirement ("toute synchronisation doit être traçable,
-- idempotente, réessayable et isolée par entreprise"). request_id carries
-- whatever idempotency key the sync call used, so a retried call can be
-- matched back to its original attempt.
create table public.integration_sync_logs (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text,
  local_id uuid,
  external_id text,
  direction text check (direction in ('push', 'pull')),
  action text check (action in ('create', 'update', 'delete', 'skip', 'error')),
  status text not null check (status in ('success', 'error', 'retrying')),
  error_message text,
  request_id text,
  payload_summary jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.integration_settings (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade unique,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  auto_sync_enabled boolean not null default false,
  sync_frequency_minutes int,
  entity_settings jsonb not null default '{}',
  field_mappings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index integrations_organization_id_idx on public.integrations(organization_id);
create index integration_mappings_integration_id_idx on public.integration_mappings(integration_id);
create index integration_mappings_organization_id_idx on public.integration_mappings(organization_id);
create index integration_sync_logs_integration_id_created_at_idx on public.integration_sync_logs(integration_id, created_at desc);
create index integration_sync_logs_organization_id_created_at_idx on public.integration_sync_logs(organization_id, created_at desc);

create trigger integrations_set_updated_at before update on public.integrations
  for each row execute function public.set_updated_at();
create trigger integration_mappings_set_updated_at before update on public.integration_mappings
  for each row execute function public.set_updated_at();
create trigger integration_settings_set_updated_at before update on public.integration_settings
  for each row execute function public.set_updated_at();

alter table public.integrations enable row level security;
alter table public.integration_mappings enable row level security;
alter table public.integration_sync_logs enable row level security;
alter table public.integration_settings enable row level security;

-- Read-only for the org's own admins (and platform admins) — this is a
-- billing/finance-adjacent, admin-level concern, not something every member
-- should see. No client-side write policy on any of the four tables at all:
-- connecting, syncing, and reconfiguring all go through security-definer
-- RPCs or the service-role edge function, never a direct client write.
create policy integrations_select_org_admin on public.integrations
  for select using (public.is_org_admin(organization_id) or public.is_platform_admin());
create policy integration_mappings_select_org_admin on public.integration_mappings
  for select using (public.is_org_admin(organization_id) or public.is_platform_admin());
create policy integration_sync_logs_select_org_admin on public.integration_sync_logs
  for select using (public.is_org_admin(organization_id) or public.is_platform_admin());
create policy integration_settings_select_org_admin on public.integration_settings
  for select using (public.is_org_admin(organization_id) or public.is_platform_admin());

-- Registry entry for the module registry/self-service system: not yet
-- granted to any organization (organization_modules stays empty for it) —
-- a platform admin grants it explicitly once the connection is real.
insert into public.modules (key, name, description, category, visibility, status)
values (
  'bexio_integration',
  'Intégration Bexio',
  'Synchronisation native avec Bexio (contacts, factures, articles) — en cours de construction.',
  'integrations',
  'private',
  'beta'
)
on conflict (key) do nothing;

notify pgrst, 'reload schema';
