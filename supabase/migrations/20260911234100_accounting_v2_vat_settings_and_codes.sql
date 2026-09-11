-- Cahier des charges V2, Lot 2 (§5.1-5.2). Separates the two axes the
-- cahier explicitly warns not to confuse: MODE de décompte (convenues vs
-- reçues — when revenue counts) and MÉTHODE de décompte (effective vs
-- taux de la dette fiscale nette — how the tax itself is computed).
-- organizations.ide_number is reused as-is for the VAT number (the Swiss
-- VAT number IS the IDE number with a "TVA" suffix, not a separate
-- number) and organizations.default_vat_rate is untouched (still the
-- default rate suggested on a new devis/facture line).
alter table public.organizations
  add column vat_liable boolean not null default false,
  add column vat_method text not null default 'effective' check (vat_method in ('effective', 'tdfn')),
  add column vat_basis_default text not null default 'invoiced' check (vat_basis_default in ('invoiced', 'collected')),
  add column vat_periodicity text not null default 'trimestrielle' check (vat_periodicity in ('mensuelle', 'trimestrielle', 'semestrielle', 'annuelle')),
  add column vat_liable_since date,
  add column vat_rounding text not null default 'aucun' check (vat_rounding in ('aucun', 'cinq_centimes'));

-- Versioned VAT codes (§5.2) — rate history matters: 7.7/2.5/3.7% until
-- 31.12.2023, 8.1/2.6/3.8% from 01.01.2024 (confirmed via estv.admin.ch
-- rate announcements). Kept per-organization (not a single global table)
-- so an org can add its own codes (e.g. a specific export code) without
-- affecting others, same as the chart of accounts.
create table public.vat_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  label text not null,
  category text not null check (category in (
    'vente_normal', 'vente_reduit', 'vente_hebergement',
    'vente_exoneree', 'vente_exclue', 'vente_etranger',
    'achat_materiel', 'achat_investissement', 'achat_autre',
    'correction', 'sans_tva'
  )),
  rate numeric(5, 3) not null default 0,
  valid_from date not null,
  valid_to date,
  is_active boolean not null default true,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, code, valid_from)
);
create index on public.vat_codes (organization_id);
create index on public.vat_codes (organization_id, category, valid_from);
alter table public.vat_codes enable row level security;

create policy "org members can view vat codes" on public.vat_codes
  for select using (public.can_view_org_accounting(organization_id));
create policy "authorized members manage vat codes" on public.vat_codes
  for insert with check (public.can_manage_org_chart_of_accounts(organization_id));
create policy "authorized members update vat codes" on public.vat_codes
  for update using (public.can_manage_org_chart_of_accounts(organization_id));

create or replace function public.seed_vat_codes(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.vat_codes (organization_id, code, label, category, rate, valid_from, valid_to, is_system)
  select p_organization_id, x.code, x.label, x.category, x.rate, x.valid_from::date, x.valid_to::date, true
  from (values
    ('V-NORM', 'Ventes — taux normal', 'vente_normal', 7.700, '2018-01-01', '2023-12-31'),
    ('V-NORM', 'Ventes — taux normal', 'vente_normal', 8.100, '2024-01-01', null),
    ('V-RED', 'Ventes — taux réduit', 'vente_reduit', 2.500, '2018-01-01', '2023-12-31'),
    ('V-RED', 'Ventes — taux réduit', 'vente_reduit', 2.600, '2024-01-01', null),
    ('V-HEB', 'Ventes — hébergement', 'vente_hebergement', 3.700, '2018-01-01', '2023-12-31'),
    ('V-HEB', 'Ventes — hébergement', 'vente_hebergement', 3.800, '2024-01-01', null),
    ('V-EXO', 'Ventes exonérées (avec droit à déduction, ex. export)', 'vente_exoneree', 0.000, '2018-01-01', null),
    ('V-EXC', 'Ventes exclues du champ (sans droit à déduction)', 'vente_exclue', 0.000, '2018-01-01', null),
    ('V-ETR', 'Prestations à l''étranger', 'vente_etranger', 0.000, '2018-01-01', null),
    ('P-MAT', 'TVA préalable — matériel et prestations, taux normal', 'achat_materiel', 7.700, '2018-01-01', '2023-12-31'),
    ('P-MAT', 'TVA préalable — matériel et prestations, taux normal', 'achat_materiel', 8.100, '2024-01-01', null),
    ('P-MAT-RED', 'TVA préalable — matériel, taux réduit', 'achat_materiel', 2.500, '2018-01-01', '2023-12-31'),
    ('P-MAT-RED', 'TVA préalable — matériel, taux réduit', 'achat_materiel', 2.600, '2024-01-01', null),
    ('P-INV', 'TVA préalable — investissements', 'achat_investissement', 7.700, '2018-01-01', '2023-12-31'),
    ('P-INV', 'TVA préalable — investissements', 'achat_investissement', 8.100, '2024-01-01', null),
    ('P-AUTRE', 'TVA préalable — autres charges', 'achat_autre', 7.700, '2018-01-01', '2023-12-31'),
    ('P-AUTRE', 'TVA préalable — autres charges', 'achat_autre', 8.100, '2024-01-01', null),
    ('CORR', 'Correction / réduction de la déduction', 'correction', 0.000, '2018-01-01', null),
    ('SANS', 'Sans TVA (hors champ)', 'sans_tva', 0.000, '2018-01-01', null)
  ) as x(code, label, category, rate, valid_from, valid_to)
  where not exists (
    select 1 from public.vat_codes v
    where v.organization_id = p_organization_id and v.code = x.code and v.valid_from = x.valid_from::date
  );
end;
$$;
revoke all on function public.seed_vat_codes(uuid) from public;

create or replace function public.trg_seed_accounting_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_accounting_defaults(new.id);
  perform public.seed_default_account_mappings(new.id);
  perform public.seed_vat_codes(new.id);
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
  perform public.seed_vat_codes(p_organization_id);
end;
$$;

do $$
declare v_org record;
begin
  for v_org in select id from public.organizations loop
    perform public.seed_vat_codes(v_org.id);
  end loop;
end $$;

notify pgrst, 'reload schema';
