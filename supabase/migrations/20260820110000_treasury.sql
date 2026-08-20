-- Trésorerie prévisionnelle : personne ne sait, à un instant T, s'il pourra
-- payer les salaires dans 3 semaines, parce que factures à encaisser,
-- salaires à sortir, factures sous-traitants à régler et dépenses
-- récurrentes (abonnements, assurances...) vivent chacun dans leur coin.
-- Cette migration pose les fondations données : un solde de référence
-- (cash_snapshots, saisi à la main — pas de connexion bancaire réelle),
-- les dépenses récurrentes avec rappel avant échéance, et le trou identifié
-- en recherche : subcontractor_invoices n'avait ni échéance ni statut payé,
-- rendant impossible de savoir ce qui reste dû aux sous-traitants.
-- L'agrégation elle-même (lib/api/treasury.ts) reste côté client, même
-- pattern que le reste du dashboard (app/(app)/index.tsx).

alter table public.plans add column has_treasury boolean not null default false;
update public.plans set has_treasury = true where has_profitability;

alter table public.organizations add column payroll_payday integer not null default 25 check (payroll_payday between 1 and 28);

alter table public.subcontractor_invoices
  add column due_date date,
  add column paid boolean not null default false,
  add column paid_at timestamptz;

create table public.cash_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  balance_chf numeric(12,2) not null,
  recorded_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index on public.cash_snapshots (organization_id, recorded_at desc);

alter table public.cash_snapshots enable row level security;

create policy "finance members can view cash snapshots" on public.cash_snapshots
  for select using (public.can_view_org_finances(organization_id));
create policy "finance members can insert cash snapshots" on public.cash_snapshots
  for insert with check (public.can_view_org_finances(organization_id) and created_by = auth.uid());
create policy "admins can delete cash snapshots" on public.cash_snapshots
  for delete using (public.is_org_admin(organization_id));

create table public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  category text,
  amount_chf numeric(10,2) not null check (amount_chf >= 0),
  frequency text not null check (frequency in ('monthly', 'yearly')),
  next_due_date date not null,
  reminder_days_before integer not null default 3 check (reminder_days_before >= 0),
  active boolean not null default true,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.recurring_expenses (organization_id);

alter table public.recurring_expenses enable row level security;

create policy "finance members can view recurring expenses" on public.recurring_expenses
  for select using (public.can_view_org_finances(organization_id));
create policy "finance members can insert recurring expenses" on public.recurring_expenses
  for insert with check (public.can_view_org_finances(organization_id) and created_by = auth.uid());
create policy "finance members can update recurring expenses" on public.recurring_expenses
  for update using (public.can_view_org_finances(organization_id));
create policy "finance members can delete recurring expenses" on public.recurring_expenses
  for delete using (public.can_view_org_finances(organization_id));

create trigger recurring_expenses_set_updated_at before update on public.recurring_expenses
for each row execute function public.set_updated_at();
