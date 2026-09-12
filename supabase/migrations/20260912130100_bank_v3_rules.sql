-- §6.4 "Règles automatiques" — recognizes a beneficiary/label pattern on
-- future imports and proposes an account, a code TVA, a chantier, a
-- supplier label and a booking label. auto_post defaults to false (a rule
-- only proposes, per the cahier's own default); a user who explicitly
-- turns it on for a specific rule accepts that matching debit
-- transactions will be booked as a dépense without a manual confirmation
-- step — every such booking is still traceable via the entry it produced
-- and via a dedicated accounting_audit_events row naming the rule.
create table public.bank_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  match_field text not null check (match_field in ('counterparty_name', 'counterparty_iban', 'remittance_info')),
  match_pattern text not null,
  proposed_account_id uuid references public.accounting_accounts(id),
  proposed_vat_code text,
  proposed_project_id uuid references public.projects(id),
  proposed_tiers text,
  proposed_label text,
  auto_post boolean not null default false,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index on public.bank_rules (organization_id, is_active);

alter table public.bank_rules enable row level security;

create policy "org members can view bank rules" on public.bank_rules
  for select using (public.can_import_org_bank_statements(organization_id) or public.can_validate_org_bank_reconciliations(organization_id));
create policy "authorized members manage bank rules" on public.bank_rules
  for insert with check (public.can_import_org_bank_statements(organization_id));
create policy "authorized members update bank rules" on public.bank_rules
  for update using (public.can_import_org_bank_statements(organization_id));
create policy "authorized members delete bank rules" on public.bank_rules
  for delete using (public.can_import_org_bank_statements(organization_id));

notify pgrst, 'reload schema';
