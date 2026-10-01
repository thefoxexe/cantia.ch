-- One VAT return (« décompte TVA ») per period: the amounts the taxpayer
-- typed in (adjustments: transfers, acquisition tax, corrections, TDFN
-- rates…), and once filed, a frozen copy of every figure as declared to the
-- AFC (figures), with the filing / payment dates. Computed figures for a
-- draft are always recomputed from the ledger (lib/vat/afcForm.ts).
create table if not exists public.vat_declarations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  method text not null check (method in ('effective', 'tdfn')),
  status text not null default 'draft' check (status in ('draft', 'filed', 'paid')),
  adjustments jsonb not null default '{}'::jsonb,
  figures jsonb,
  amount_due numeric(14, 2),
  afc_reference text check (afc_reference is null or char_length(afc_reference) <= 80),
  filed_at date,
  paid_at date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, period_start, period_end),
  check (period_end >= period_start)
);
create index if not exists vat_declarations_org_idx on public.vat_declarations (organization_id, period_start desc);
alter table public.vat_declarations enable row level security;

drop policy if exists "vat declarations: accounting viewers read" on public.vat_declarations;
drop policy if exists "vat declarations: accounting managers write" on public.vat_declarations;
create policy "vat declarations: accounting viewers read" on public.vat_declarations
  for select using (public.can_view_org_accounting(organization_id));
create policy "vat declarations: accounting managers write" on public.vat_declarations
  for all using (public.can_manage_org_accounting_drafts(organization_id))
  with check (public.can_manage_org_accounting_drafts(organization_id));
grant select, insert, update, delete on public.vat_declarations to authenticated;

create or replace function public.touch_vat_declarations() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists trg_touch_vat_declarations on public.vat_declarations;
create trigger trg_touch_vat_declarations before update on public.vat_declarations
  for each row execute function public.touch_vat_declarations();
