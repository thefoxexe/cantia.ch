-- Cahier des charges Cantia Comptabilité V2, Lot 1 (§4.1-4.2, §4.5).
-- Real chart of accounts, fiscal years, journals — replacing the 8
-- hardcoded accounts previously recomputed on the fly in lib/api/accounting.ts.
-- The 8 existing codes (1020, 1100, 1170, 2200, 2270, 3200, 4000, 5000) are
-- preserved so historical reports and the CSV export format stay compatible.

create table public.accounting_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  label text not null,
  class smallint not null check (class between 1 and 9),
  type text not null check (type in ('actif', 'passif', 'produit', 'charge')),
  normal_balance text not null check (normal_balance in ('debit', 'credit')),
  parent_account_id uuid references public.accounting_accounts(id) on delete set null,
  currency text not null default 'CHF',
  is_active boolean not null default true,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);
create index on public.accounting_accounts (organization_id);

create table public.accounting_fiscal_years (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null default 'open' check (status in ('open', 'closing', 'closed')),
  locked_until_date date,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);
create index on public.accounting_fiscal_years (organization_id, start_date);
-- No two fiscal years of the same org may cover the same date.
create extension if not exists btree_gist;
alter table public.accounting_fiscal_years
  add constraint accounting_fiscal_years_no_overlap
  exclude using gist (organization_id with =, daterange(start_date, end_date, '[]') with &&);

create table public.accounting_journals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  label text not null,
  kind text not null default 'custom' check (kind in ('system', 'custom')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, code)
);
create index on public.accounting_journals (organization_id);

alter table public.accounting_accounts enable row level security;
alter table public.accounting_fiscal_years enable row level security;
alter table public.accounting_journals enable row level security;

notify pgrst, 'reload schema';
