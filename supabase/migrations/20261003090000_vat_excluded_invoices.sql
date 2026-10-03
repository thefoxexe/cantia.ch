-- « Sans TVA » invoices of a VAT-registered company (insurance brokerage,
-- art. 21 LTVA…) were posted without any VAT code, so the AFC return
-- (app/(app)/compta/tva.tsx) never saw them: they belong in figure 200 and
-- are deducted again in figure 230 (excluded turnover). The revenue line
-- of such an invoice now carries the V-EXC code (base = amount, VAT 0),
-- and past ones are backfilled. Companies that are not registered are left
-- alone: they file no VAT return.

-- Every registered company needs the V-EXC code.
insert into public.vat_codes (organization_id, code, label, category, rate, valid_from, valid_to, is_system)
select o.id, 'V-EXC', 'Ventes exclues du champ (sans droit à déduction)', 'vente_exclue', 0, '2018-01-01', null, true
from public.organizations o
where o.vat_liable
  and not exists (select 1 from public.vat_codes v where v.organization_id = o.id and v.code = 'V-EXC');

create or replace function public.trg_post_facture_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ht numeric(14, 2);
  v_vat numeric(14, 2);
  v_fiscal_year_id uuid;
  v_journal_id uuid;
  v_debiteurs uuid;
  v_produits uuid;
  v_tva_collectee uuid;
  v_entry_id uuid;
  v_entry_date date;
  v_label text;
  v_vat_code text;
  v_excluded boolean;
begin
  if NEW.status in ('draft', 'cancelled') then
    if NEW.status = 'cancelled' then
      perform public.reverse_accounting_entry(e.id)
      from public.accounting_entries e
      where e.source = 'facture_client' and e.source_id = NEW.id and e.status = 'comptabilisee';
    end if;
    return NEW;
  end if;

  if exists (select 1 from public.accounting_entries where source = 'facture_client' and source_id = NEW.id) then
    return NEW;
  end if;

  select coalesce(sum(quantity * unit_price), 0) into v_ht from public.facture_items where facture_id = NEW.id;
  if v_ht = 0 then return NEW; end if;
  v_ht := round(v_ht, 2);
  v_vat := round(v_ht * coalesce(NEW.vat_rate, 0) / 100, 2);
  v_entry_date := NEW.created_at::date;

  v_fiscal_year_id := public.find_org_open_fiscal_year(NEW.organization_id, v_entry_date);
  select account_id into v_debiteurs from public.accounting_account_mappings where organization_id = NEW.organization_id and mapping_key = 'debiteurs';
  select account_id into v_produits from public.accounting_account_mappings where organization_id = NEW.organization_id and mapping_key = 'produits_default';
  select account_id into v_tva_collectee from public.accounting_account_mappings where organization_id = NEW.organization_id and mapping_key = 'tva_collectee';
  select id into v_journal_id from public.accounting_journals where organization_id = NEW.organization_id and code = 'VE';

  if v_fiscal_year_id is null or v_debiteurs is null or v_produits is null or v_journal_id is null or (v_vat > 0 and v_tva_collectee is null) then
    raise warning 'Comptabilisation auto ignorée pour la facture % (organisation %) : exercice ou mapping de compte manquant', NEW.id, NEW.organization_id;
    return NEW;
  end if;

  select code into v_vat_code from public.vat_codes
  where organization_id = NEW.organization_id
    and category in ('vente_normal', 'vente_reduit', 'vente_hebergement')
    and rate = coalesce(NEW.vat_rate, 0)
    and valid_from <= v_entry_date and (valid_to is null or valid_to >= v_entry_date)
  order by (category = 'vente_normal') desc
  limit 1;

  v_excluded := v_vat = 0 and exists (select 1 from public.organizations o where o.id = NEW.organization_id and o.vat_liable);

  v_label := 'Facture ' || coalesce(NEW.number, '') || ' — ' || coalesce(NEW.client_name, '');

  begin
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, source_id, status, created_by)
    values (NEW.organization_id, v_fiscal_year_id, v_journal_id, v_entry_date, v_label, 'facture_client', NEW.id, 'brouillon', NEW.created_by)
    returning id into v_entry_id;

    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order) values
      (v_entry_id, v_debiteurs, v_ht + v_vat, 0, v_label, 0);
    if v_excluded then
      insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order, vat_code, vat_base, vat_amount)
      values (v_entry_id, v_produits, 0, v_ht, v_label, 1, 'V-EXC', v_ht, 0);
    else
      insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order)
      values (v_entry_id, v_produits, 0, v_ht, v_label, 1);
    end if;
    if v_vat > 0 then
      insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order, vat_code, vat_base, vat_amount)
      values (v_entry_id, v_tva_collectee, 0, v_vat, 'TVA — ' || v_label, 2, v_vat_code, v_ht, v_vat);
    end if;

    perform public.post_accounting_entry(v_entry_id);
  exception when others then
    raise warning 'Comptabilisation auto échouée pour la facture % : %', NEW.id, SQLERRM;
  end;

  return NEW;
end;
$$;

-- Past « Sans TVA » invoices of registered companies: tag their revenue
-- line (credit side, sort_order 1) so they show up in the return.
update public.accounting_entry_lines l
set vat_code = 'V-EXC', vat_base = l.credit, vat_amount = 0
from public.accounting_entries e
join public.factures f on f.id = e.source_id
join public.organizations o on o.id = e.organization_id
where l.entry_id = e.id
  and e.source = 'facture_client'
  and o.vat_liable
  and coalesce(f.vat_rate, 0) = 0
  and l.sort_order = 1
  and l.credit > 0
  and l.vat_code is null
  and not exists (select 1 from public.accounting_entry_lines x where x.entry_id = e.id and x.vat_code is not null);
