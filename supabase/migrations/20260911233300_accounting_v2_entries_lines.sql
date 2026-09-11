-- §4.3: pièces + lignes en partie double.
create table public.accounting_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  fiscal_year_id uuid not null references public.accounting_fiscal_years(id),
  journal_id uuid not null references public.accounting_journals(id),
  entry_number integer,
  entry_date date not null,
  document_date date,
  label text not null,
  external_reference text,
  source text not null check (source in (
    'facture_client', 'avoir_client', 'encaissement_client',
    'facture_fournisseur', 'avoir_fournisseur', 'paiement_fournisseur',
    'salaire', 'paiement_salaire',
    'manuelle', 'import_bancaire', 'amortissement', 'ouverture', 'cloture', 'extourne'
  )),
  source_id uuid,
  status text not null default 'brouillon' check (status in ('brouillon', 'validee', 'comptabilisee', 'extournee')),
  currency text not null default 'CHF',
  exchange_rate numeric(12, 6) not null default 1,
  created_by uuid references auth.users(id),
  reversed_entry_id uuid references public.accounting_entries(id),
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.accounting_entries (organization_id, fiscal_year_id, entry_date);
create index on public.accounting_entries (organization_id, source, source_id);
-- entry_number is only assigned at posting time (brouillons have none), and
-- must be unique+sequential per fiscal year once assigned.
create unique index accounting_entries_number_idx on public.accounting_entries (fiscal_year_id, entry_number) where entry_number is not null;

-- Atomic, collision-free sequence, one row per fiscal year (§4.5 "La
-- numérotation d'une pièce comptabilisée doit être atomique et sans
-- collision" — an UPDATE ... RETURNING on a single row is race-free under
-- Postgres's MVCC row locking, unlike a MAX()+1 read).
create table public.accounting_entry_sequences (
  fiscal_year_id uuid primary key references public.accounting_fiscal_years(id) on delete cascade,
  next_number integer not null default 1
);

create table public.accounting_entry_lines (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.accounting_entries(id) on delete cascade,
  account_id uuid not null references public.accounting_accounts(id),
  debit numeric(12, 2) not null default 0 check (debit >= 0),
  credit numeric(12, 2) not null default 0 check (credit >= 0),
  label text,
  tiers text,
  project_id uuid references public.projects(id) on delete set null,
  vat_code text,
  vat_base numeric(12, 2),
  vat_amount numeric(12, 2),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (
    (debit > 0 and credit = 0) or (credit > 0 and debit = 0)
  )
);
create index on public.accounting_entry_lines (entry_id);
create index on public.accounting_entry_lines (account_id);
create index on public.accounting_entry_lines (project_id) where project_id is not null;

create table public.accounting_attachments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.accounting_entries(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index on public.accounting_attachments (entry_id);

-- §3.3 traçabilité — generic audit trail, reused across the accounting
-- module rather than one table per entity.
create table public.accounting_audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  old_values jsonb,
  new_values jsonb,
  source text,
  created_at timestamptz not null default now()
);
create index on public.accounting_audit_events (organization_id, entity_type, entity_id);

alter table public.accounting_entries enable row level security;
alter table public.accounting_entry_lines enable row level security;
alter table public.accounting_entry_sequences enable row level security;
alter table public.accounting_attachments enable row level security;
alter table public.accounting_audit_events enable row level security;

notify pgrst, 'reload schema';
