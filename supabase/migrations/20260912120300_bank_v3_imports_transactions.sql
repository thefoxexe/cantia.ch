-- §6.2 "Import CAMT" — persists what app/(app)/devis/factures/import-releve.tsx
-- previously only held in memory for the duration of one screen visit.
-- Storing the file's fingerprint and every transaction's own dedupe key is
-- what makes "le même fichier ou la même transaction ne doit pas être
-- enregistré deux fois" (§6.2) actually true rather than merely intended —
-- before this migration, re-running the same import and re-applying its
-- suggested matches would have booked every payment twice.
create table public.bank_statement_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  bank_account_id uuid not null references public.bank_accounts(id) on delete cascade,
  format text not null check (format in ('camt053', 'camt054')),
  file_name text,
  -- Cheap non-cryptographic fingerprint (see lib/bank/hash.ts) of the whole
  -- raw file — not a security boundary, just a fast "you already imported
  -- this exact file" check; the real integrity guarantee is the per-row
  -- unique dedupe_key on bank_transactions below.
  file_hash text not null,
  statement_from date,
  statement_to date,
  opening_balance numeric(14, 2),
  closing_balance numeric(14, 2),
  transaction_count integer not null default 0,
  imported_by uuid,
  imported_at timestamptz not null default now()
);

create unique index bank_statement_imports_dedupe_idx on public.bank_statement_imports (bank_account_id, file_hash);
create index on public.bank_statement_imports (organization_id);

alter table public.bank_statement_imports enable row level security;

create table public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  bank_account_id uuid not null references public.bank_accounts(id) on delete cascade,
  import_id uuid not null references public.bank_statement_imports(id) on delete cascade,
  bank_reference text, -- AcctSvcrRef — the bank's own id for this entry, when the statement provides one
  -- Deterministic composite identity for the entries that don't carry a
  -- reliable bank_reference — built from booking date + amount + remittance
  -- text + end-to-end id (see lib/bank/hash.ts). A plain string, not an
  -- actual hash: short enough to index directly, and keeping it legible
  -- helps when diagnosing a "why did this get skipped as a duplicate" report.
  dedupe_key text not null,
  booking_date date not null,
  value_date date,
  amount numeric(14, 2) not null, -- signed: positive = inflow (CRDT), negative = outflow (DBIT)
  currency text not null default 'CHF',
  counterparty_name text,
  counterparty_iban text,
  end_to_end_id text,
  qr_reference text,
  remittance_info text,
  status text not null default 'unmatched' check (status in ('unmatched', 'matched', 'ignored')),
  -- The existing posting engine (Lot 1) already creates a banque-account
  -- line for every encaissement/dépense/écriture manuelle that touches
  -- cash — reconciling is therefore "which already-posted line is this
  -- transaction", never "invent a new entry for it". See the reconciliation
  -- functions migration for why this is safe against double-booking.
  matched_entry_line_id uuid references public.accounting_entry_lines(id),
  matched_by uuid,
  matched_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index bank_transactions_dedupe_idx on public.bank_transactions (bank_account_id, dedupe_key);
create unique index bank_transactions_matched_line_idx on public.bank_transactions (matched_entry_line_id) where matched_entry_line_id is not null;
create index on public.bank_transactions (organization_id, status);
create index on public.bank_transactions (import_id);

alter table public.bank_transactions enable row level security;

notify pgrst, 'reload schema';
