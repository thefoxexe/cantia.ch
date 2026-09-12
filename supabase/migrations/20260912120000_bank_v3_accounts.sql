-- Cahier des charges V2, Lot 3 §6.1 "Comptes financiers" — real bank/cash
-- accounts linked to the chart of accounts, replacing the previous
-- "declare a balance by hand" cash_snapshots as the source of truth for
-- reconciliation while keeping cash_snapshots itself untouched (still the
-- fallback for orgs that never import a statement, per the cahier's
-- explicit "conserver toutefois le mécanisme manuel comme solution de
-- secours").
create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  institution_name text not null,
  account_name text not null,
  iban text,
  currency text not null default 'CHF',
  accounting_account_id uuid references public.accounting_accounts(id),
  opening_balance numeric(14, 2) not null default 0,
  opening_balance_date date,
  last_imported_balance numeric(14, 2),
  last_imported_at timestamptz,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index on public.bank_accounts (organization_id);
-- One bank_accounts row per distinct IBAN per org — lets a CAMT import
-- auto-resolve which account it belongs to instead of asking the user
-- every time (the statement's own <Acct><Id><IBAN> names it).
create unique index bank_accounts_org_iban_idx on public.bank_accounts (organization_id, iban) where iban is not null;

alter table public.bank_accounts enable row level security;

notify pgrst, 'reload schema';
