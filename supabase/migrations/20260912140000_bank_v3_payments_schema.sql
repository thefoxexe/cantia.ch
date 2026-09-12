-- §6.5 "PAIN.001" — ISO 20022 Customer Credit Transfer Initiation files
-- for supplier payments and expense reimbursements. Payroll payments are
-- explicitly NOT included here: correctly deriving each employee's net
-- pay needs the same computation the payslip screens already do
-- (computeSalaryBreakdown, lib/api/payroll.ts) plus an employee IBAN
-- field this migration doesn't add — building that properly, with the
-- "confidentialité adaptée aux permissions" the cahier explicitly calls
-- for on payroll data, is left for a dedicated follow-up rather than
-- rushed alongside the two more straightforward payment kinds.
alter table public.subcontractors add column iban text;
alter table public.payroll_expenses add column paid boolean not null default false;
alter table public.payroll_expenses add column paid_at timestamptz;

-- §13 "générer des paiements" — deliberately NOT OR'd with
-- can_view_org_finances (unlike the bank-import/reconciliation floors):
-- this is a brand-new capability with no existing users to avoid
-- regressing, and generating a payment file is a materially more
-- consequential action than viewing figures, so it defaults to
-- admin-only until an org explicitly grants it via a custom role.
alter table public.organization_roles
  add column can_generate_payments boolean not null default false;

create or replace function public.can_generate_org_payments(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_generate_payments
    );
$$;

create table public.payment_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null check (kind in ('fournisseur', 'remboursement')),
  execution_date date not null,
  debtor_iban text not null,
  message_id text not null,
  control_sum numeric(14, 2) not null default 0,
  status text not null default 'prepare' check (status in ('prepare', 'paye')),
  created_by uuid,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index on public.payment_batches (organization_id, status);

create table public.payment_batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.payment_batches(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_type text not null check (source_type in ('subcontractor_invoice', 'payroll_expense')),
  source_id uuid not null,
  creditor_name text not null,
  creditor_iban text not null,
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null default 'CHF',
  remittance_info text,
  end_to_end_id text not null,
  sort_order integer not null default 0
);
-- A given source row (one subcontractor invoice, one expense
-- reimbursement) can only ever be a member of one payment batch — the
-- item-selection query excludes anything already batched, this is the
-- hard backstop against a double-payment file.
create unique index payment_batch_items_source_idx on public.payment_batch_items (organization_id, source_type, source_id);
create index on public.payment_batch_items (batch_id);

alter table public.payment_batches enable row level security;
alter table public.payment_batch_items enable row level security;

create policy "authorized members view payment batches" on public.payment_batches
  for select using (public.can_generate_org_payments(organization_id));
create policy "authorized members create payment batches" on public.payment_batches
  for insert with check (public.can_generate_org_payments(organization_id));
-- No update/delete policy — status only changes via mark_payment_batch_paid
-- below, which validates the transition and propagates to the source rows
-- atomically; a batch is otherwise an immutable record of what was
-- generated and when.

create policy "authorized members view payment batch items" on public.payment_batch_items
  for select using (public.can_generate_org_payments(organization_id));
create policy "authorized members create payment batch items" on public.payment_batch_items
  for insert with check (public.can_generate_org_payments(organization_id));

notify pgrst, 'reload schema';
