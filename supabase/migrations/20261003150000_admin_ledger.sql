-- Bookkeeping of the platform owner as a self-employed person (admin ›
-- Comptabilité, app/(admin)/compta): every income and expense with its
-- receipt, the basis of the yearly income statement (« compte de résultat
-- recettes / dépenses », art. 957 al. 2 CO) the AVS or the tax office may
-- ask for. Platform admins only. Stripe payments and fees can be imported
-- (source = 'stripe', source_id unique: importing twice never duplicates).
create table if not exists public.admin_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  kind text not null check (kind in ('recette', 'depense')),
  category text not null check (char_length(category) between 1 and 60),
  label text not null check (char_length(label) between 1 and 300),
  counterparty text check (counterparty is null or char_length(counterparty) <= 200),
  amount_chf numeric(12, 2) not null check (amount_chf >= 0),
  vat_rate numeric(4, 2) not null default 0 check (vat_rate >= 0 and vat_rate < 30),
  payment_method text check (payment_method is null or payment_method in ('banque', 'carte', 'twint', 'especes', 'stripe', 'autre')),
  reference text check (reference is null or char_length(reference) <= 120),
  receipt_path text,
  notes text check (notes is null or char_length(notes) <= 2000),
  source text not null default 'manuel' check (source in ('manuel', 'stripe')),
  source_id text unique,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_ledger_entries_date_idx on public.admin_ledger_entries (entry_date desc);

alter table public.admin_ledger_entries enable row level security;
drop policy if exists "platform admins manage the ledger" on public.admin_ledger_entries;
create policy "platform admins manage the ledger" on public.admin_ledger_entries
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());
grant select, insert, update, delete on public.admin_ledger_entries to authenticated;

-- Receipts (photos, PDF): private bucket, platform admins only.
insert into storage.buckets (id, name, public, file_size_limit)
values ('admin-ledger', 'admin-ledger', false, 15728640)
on conflict (id) do nothing;

drop policy if exists "platform admins read ledger receipts" on storage.objects;
create policy "platform admins read ledger receipts" on storage.objects
  for select using (bucket_id = 'admin-ledger' and public.is_platform_admin());
drop policy if exists "platform admins add ledger receipts" on storage.objects;
create policy "platform admins add ledger receipts" on storage.objects
  for insert with check (bucket_id = 'admin-ledger' and public.is_platform_admin());
drop policy if exists "platform admins remove ledger receipts" on storage.objects;
create policy "platform admins remove ledger receipts" on storage.objects
  for delete using (bucket_id = 'admin-ledger' and public.is_platform_admin());
