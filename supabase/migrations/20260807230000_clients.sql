-- Contacts/clients directory — a reusable address book so a devis/facture's
-- client info can be picked from a saved contact instead of retyped every
-- time. Deliberately NOT foreign-keyed from devis/factures: those documents
-- keep their own free-text client_name/address/email columns (a devis is a
-- snapshot of the client info at creation time, not a live link), a client
-- picker just autofills those fields from here.
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  type text not null default 'particulier' check (type in ('particulier', 'entreprise')),
  name text not null,
  company_name text,
  email text,
  phone text,
  address text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.clients (organization_id);

create trigger clients_set_updated_at before update on public.clients
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;

create policy "members can view clients" on public.clients
  for select using (public.is_org_member(organization_id));
create policy "members can create clients" on public.clients
  for insert with check (public.is_org_member(organization_id));
create policy "members can update clients" on public.clients
  for update using (public.is_org_member(organization_id));
create policy "admins can delete clients" on public.clients
  for delete using (public.is_org_admin(organization_id));
