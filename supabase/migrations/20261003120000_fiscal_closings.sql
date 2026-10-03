-- Year-end closing assistant (app/(app)/compta/bouclement.tsx): one row per
-- fiscal year with what the company typed in (legal form, tax rate, assets,
-- accruals, work in progress…), the entries generated, and whether the
-- closing was locked and sent to the fiduciary. The fiduciary reads it with
-- the same permission as the ledger.
create table if not exists public.fiscal_closings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  fiscal_year_id uuid not null references public.accounting_fiscal_years(id) on delete cascade,
  legal_form text check (legal_form in ('ri', 'sarl', 'sa')),
  data jsonb not null default '{}'::jsonb,
  status text not null default 'en_cours' check (status in ('en_cours', 'verrouille', 'transmis')),
  transmitted_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fiscal_year_id)
);

create index if not exists fiscal_closings_org_idx on public.fiscal_closings (organization_id);

alter table public.fiscal_closings enable row level security;

drop policy if exists "accounting members view closings" on public.fiscal_closings;
create policy "accounting members view closings" on public.fiscal_closings
  for select using (public.can_view_org_accounting(organization_id));
drop policy if exists "fiduciaries view closings" on public.fiscal_closings;
create policy "fiduciaries view closings" on public.fiscal_closings
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS')));
drop policy if exists "accounting managers create closings" on public.fiscal_closings;
create policy "accounting managers create closings" on public.fiscal_closings
  for insert with check (public.can_manage_org_accounting_drafts(organization_id));
drop policy if exists "accounting managers update closings" on public.fiscal_closings;
create policy "accounting managers update closings" on public.fiscal_closings
  for update using (public.can_manage_org_accounting_drafts(organization_id));

grant select, insert, update on public.fiscal_closings to authenticated;
