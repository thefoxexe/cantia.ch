-- Admin › Comptabilité, second step:
-- * recurring entries (subscriptions, ads, phone, rent…) that the page posts
--   into the journal when they fall due;
-- * how each entry is justified when there is no file attached
--   (invoice available online, bank statement only, internal receipt).
begin;

create table if not exists public.admin_ledger_recurring (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('recette', 'depense')),
  category text not null check (char_length(category) between 1 and 60),
  label text not null check (char_length(label) between 1 and 300),
  counterparty text check (counterparty is null or char_length(counterparty) <= 200),
  amount_chf numeric(12, 2) not null check (amount_chf > 0),
  vat_rate numeric(4, 2) not null default 0 check (vat_rate >= 0 and vat_rate < 30),
  payment_method text check (payment_method is null or payment_method in ('banque', 'carte', 'twint', 'especes', 'stripe', 'autre')),
  frequency text not null default 'monthly' check (frequency in ('weekly', 'monthly', 'quarterly', 'yearly')),
  day_of_month smallint not null default 1 check (day_of_month between 1 and 31),
  start_date date not null,
  end_date date,
  -- Last occurrence already posted: only later ones are posted again, so an
  -- entry deleted from the journal does not come back.
  last_date date,
  proof text check (proof is null or proof in ('piece', 'facture_en_ligne', 'releve', 'quittance_interne')),
  notes text check (notes is null or char_length(notes) <= 2000),
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_ledger_recurring enable row level security;
drop policy if exists "platform admins manage recurring entries" on public.admin_ledger_recurring;
create policy "platform admins manage recurring entries" on public.admin_ledger_recurring
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());
grant select, insert, update, delete on public.admin_ledger_recurring to authenticated;

alter table public.admin_ledger_entries add column if not exists proof text;
alter table public.admin_ledger_entries drop constraint if exists admin_ledger_entries_proof_check;
alter table public.admin_ledger_entries add constraint admin_ledger_entries_proof_check
  check (proof is null or proof in ('piece', 'facture_en_ligne', 'releve', 'quittance_interne'));
alter table public.admin_ledger_entries add column if not exists recurring_id uuid references public.admin_ledger_recurring(id) on delete set null;
alter table public.admin_ledger_entries drop constraint if exists admin_ledger_entries_source_check;
alter table public.admin_ledger_entries add constraint admin_ledger_entries_source_check
  check (source in ('manuel', 'stripe', 'recurrent'));

commit;
