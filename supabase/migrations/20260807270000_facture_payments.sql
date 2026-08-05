-- Partial-payment ledger for factures — "Marquer payée" alone couldn't
-- represent a client who only paid part of the invoice. Each row is one
-- payment received; a facture's paid/remaining amount is the sum of its
-- rows, computed client-side (lib/api/factures.ts) rather than a stored
-- column, so it's always derived from the actual ledger.
create table public.facture_payments (
  id uuid primary key default gen_random_uuid(),
  facture_id uuid not null references public.factures(id) on delete cascade,
  amount numeric(10,2) not null,
  paid_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index on public.facture_payments (facture_id);

alter table public.facture_payments enable row level security;

create policy "members can view facture payments" on public.facture_payments
  for select using (exists (
    select 1 from public.factures f where f.id = facture_payments.facture_id and public.is_org_member(f.organization_id)
  ));
create policy "members can create facture payments" on public.facture_payments
  for insert with check (exists (
    select 1 from public.factures f where f.id = facture_payments.facture_id and public.is_org_member(f.organization_id)
  ));
create policy "members can delete facture payments" on public.facture_payments
  for delete using (exists (
    select 1 from public.factures f where f.id = facture_payments.facture_id and public.is_org_member(f.organization_id)
  ));
