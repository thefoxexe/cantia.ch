-- §4.1 "des comptes par défaut sont créés à l'ouverture d'une organisation"
-- + §4.5 default journals. Same auto-seed-on-signup pattern as
-- seed_standard_payroll_catalog (20260911232000): idempotent by code, a
-- real trigger on organizations insert (not a one-off backfill), and a
-- callable RPC to restore/complete an org that predates this or is
-- missing pieces.
create or replace function public.seed_accounting_defaults(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year integer := extract(year from now())::integer;
  v_fiscal_year_id uuid;
begin
  insert into public.accounting_accounts (organization_id, code, label, class, type, normal_balance, is_system)
  select p_organization_id, x.code, x.label, x.class, x.type, x.normal_balance, true
  from (values
    ('1000', 'Caisse', 1, 'actif', 'debit'),
    ('1020', 'Banque', 1, 'actif', 'debit'),
    ('1100', 'Débiteurs', 1, 'actif', 'debit'),
    ('1109', 'Ducroire (provision débiteurs)', 1, 'actif', 'credit'),
    ('1170', 'TVA préalable', 1, 'actif', 'debit'),
    ('1180', 'Acomptes versés à des fournisseurs', 1, 'actif', 'debit'),
    ('1300', 'Travaux en cours (chantiers)', 1, 'actif', 'debit'),
    ('1400', 'Charges payées d''avance', 1, 'actif', 'debit'),
    ('1600', 'Immobilisations corporelles', 1, 'actif', 'debit'),
    ('1609', 'Amortissements cumulés', 1, 'actif', 'credit'),
    ('2000', 'Créanciers (dettes fournisseurs)', 2, 'passif', 'credit'),
    ('2030', 'Acomptes reçus de clients', 2, 'passif', 'credit'),
    ('2100', 'Dettes bancaires à court terme', 2, 'passif', 'credit'),
    ('2200', 'TVA due', 2, 'passif', 'credit'),
    ('2270', 'Charges sociales dues', 2, 'passif', 'credit'),
    ('2300', 'Salaires à payer', 2, 'passif', 'credit'),
    ('2400', 'Dettes bancaires à long terme', 2, 'passif', 'credit'),
    ('2800', 'Capital propre', 2, 'passif', 'credit'),
    ('3200', 'Produits des prestations', 3, 'produit', 'credit'),
    ('3800', 'Autres produits d''exploitation', 3, 'produit', 'credit'),
    ('4000', 'Charges de matériel et sous-traitance', 4, 'charge', 'debit'),
    ('5000', 'Charges de personnel', 5, 'charge', 'debit'),
    ('5700', 'Charges sociales employeur', 5, 'charge', 'debit'),
    ('5800', 'Autres charges de personnel', 5, 'charge', 'debit'),
    ('6500', 'Autres charges d''exploitation', 6, 'charge', 'debit'),
    ('6800', 'Amortissements', 6, 'charge', 'debit'),
    ('6900', 'Charges et produits financiers', 6, 'charge', 'debit'),
    ('9000', 'Bilan d''ouverture', 9, 'actif', 'debit'),
    ('9900', 'Bilan de clôture', 9, 'actif', 'debit')
  ) as x(code, label, class, type, normal_balance)
  where not exists (
    select 1 from public.accounting_accounts a
    where a.organization_id = p_organization_id and a.code = x.code
  );

  insert into public.accounting_journals (organization_id, code, label, kind)
  select p_organization_id, x.code, x.label, 'system'
  from (values
    ('VE', 'Ventes'),
    ('AC', 'Achats'),
    ('BQ', 'Banque'),
    ('CA', 'Caisse'),
    ('SA', 'Salaires'),
    ('OD', 'Opérations diverses'),
    ('OU', 'Ouverture'),
    ('CL', 'Clôture')
  ) as x(code, label)
  where not exists (
    select 1 from public.accounting_journals j
    where j.organization_id = p_organization_id and j.code = x.code
  );

  -- Default calendar-year fiscal year for the org's signup year, only if
  -- it has no fiscal year covering today yet (an org restoring defaults
  -- later, or one that already set up custom exercise dates, is left
  -- alone).
  if not exists (
    select 1 from public.accounting_fiscal_years fy
    where fy.organization_id = p_organization_id and current_date between fy.start_date and fy.end_date
  ) then
    insert into public.accounting_fiscal_years (organization_id, start_date, end_date, status)
    values (p_organization_id, make_date(v_year, 1, 1), make_date(v_year, 12, 31), 'open')
    on conflict do nothing
    returning id into v_fiscal_year_id;
  end if;
end;
$$;
revoke all on function public.seed_accounting_defaults(uuid) from public;

create or replace function public.trg_seed_accounting_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_accounting_defaults(new.id);
  return new;
end;
$$;

create trigger organizations_seed_accounting_defaults
  after insert on public.organizations
  for each row execute function public.trg_seed_accounting_defaults();

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
end;
$$;
revoke all on function public.rpc_seed_accounting_defaults(uuid) from public;
revoke execute on function public.rpc_seed_accounting_defaults(uuid) from anon;
grant execute on function public.rpc_seed_accounting_defaults(uuid) to authenticated;

notify pgrst, 'reload schema';
