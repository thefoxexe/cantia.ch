-- §10: configurable default accounts the auto-posting engine (and the
-- backfill) reads from, instead of hardcoding account codes into
-- application logic. "Si un mapping requis manque, afficher une erreur
-- explicite et ne pas créer une pièce partielle" — enforced by the posting
-- functions raising instead of silently skipping a line.
create table public.accounting_account_mappings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  mapping_key text not null check (mapping_key in (
    'debiteurs', 'crediteurs', 'banque', 'produits_default',
    'achats_materiel', 'salaires_bruts', 'charges_sociales_employe',
    'charges_sociales_employeur', 'salaires_a_payer', 'charges_sociales_a_payer',
    'tva_collectee', 'tva_prealable', 'arrondis',
    'acomptes_clients', 'acomptes_fournisseurs', 'immobilisations', 'amortissements'
  )),
  account_id uuid not null references public.accounting_accounts(id),
  unique (organization_id, mapping_key)
);
create index on public.accounting_account_mappings (organization_id);
alter table public.accounting_account_mappings enable row level security;

create policy "org members can view account mappings" on public.accounting_account_mappings
  for select using (public.can_view_org_accounting(organization_id));
create policy "authorized members manage account mappings" on public.accounting_account_mappings
  for insert with check (public.can_manage_org_chart_of_accounts(organization_id));
create policy "authorized members update account mappings" on public.accounting_account_mappings
  for update using (public.can_manage_org_chart_of_accounts(organization_id));
create policy "authorized members delete account mappings" on public.accounting_account_mappings
  for delete using (public.can_manage_org_chart_of_accounts(organization_id));

-- Points every mapping at the matching default account seeded by
-- seed_accounting_defaults — called from that same function so a brand
-- new organization's mappings are complete from the start.
create or replace function public.seed_default_account_mappings(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.accounting_account_mappings (organization_id, mapping_key, account_id)
  select p_organization_id, x.mapping_key, a.id
  from (values
    ('debiteurs', '1100'), ('crediteurs', '2000'), ('banque', '1020'),
    ('produits_default', '3200'), ('achats_materiel', '4000'),
    ('salaires_bruts', '5000'), ('charges_sociales_employe', '2270'),
    ('charges_sociales_employeur', '5700'), ('salaires_a_payer', '2300'),
    ('charges_sociales_a_payer', '2270'), ('tva_collectee', '2200'),
    ('tva_prealable', '1170'), ('acomptes_clients', '2030'),
    ('acomptes_fournisseurs', '1180'), ('immobilisations', '1600'),
    ('amortissements', '6800')
  ) as x(mapping_key, code)
  join public.accounting_accounts a on a.organization_id = p_organization_id and a.code = x.code
  where not exists (
    select 1 from public.accounting_account_mappings m
    where m.organization_id = p_organization_id and m.mapping_key = x.mapping_key
  );
end;
$$;
revoke all on function public.seed_default_account_mappings(uuid) from public;

create or replace function public.trg_seed_accounting_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_accounting_defaults(new.id);
  perform public.seed_default_account_mappings(new.id);
  return new;
end;
$$;

create or replace function public.rpc_seed_accounting_defaults(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_manage_org_chart_of_accounts(p_organization_id) then
    raise exception 'access denied: cannot manage chart of accounts for this organization';
  end if;
  perform public.seed_accounting_defaults(p_organization_id);
  perform public.seed_default_account_mappings(p_organization_id);
end;
$$;

notify pgrst, 'reload schema';
