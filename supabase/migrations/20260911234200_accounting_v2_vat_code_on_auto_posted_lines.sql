-- Populates vat_code/vat_base/vat_amount on the TVA line of every
-- auto-posted facture/dépense entry (previously left null) — this is what
-- lets the per-code VAT report (§5.3) read real numbers straight from the
-- ledger instead of re-deriving them from factures/dépenses directly.
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

  v_label := 'Facture ' || coalesce(NEW.number, '') || ' — ' || coalesce(NEW.client_name, '');

  begin
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, source_id, status, created_by)
    values (NEW.organization_id, v_fiscal_year_id, v_journal_id, v_entry_date, v_label, 'facture_client', NEW.id, 'brouillon', NEW.created_by)
    returning id into v_entry_id;

    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order) values
      (v_entry_id, v_debiteurs, v_ht + v_vat, 0, v_label, 0),
      (v_entry_id, v_produits, 0, v_ht, v_label, 1);
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

create or replace function public.trg_post_expense_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ht numeric(14, 2);
  v_vat numeric(14, 2);
  v_total numeric(14, 2);
  v_fiscal_year_id uuid;
  v_journal_id uuid;
  v_achats uuid;
  v_tva_prealable uuid;
  v_banque uuid;
  v_entry_id uuid;
  v_source_table text := TG_ARGV[0];
  v_vat_code text;
  v_entry_date date;
begin
  if exists (select 1 from public.accounting_entries where source = 'facture_fournisseur' and source_id = NEW.id) then
    return NEW;
  end if;

  if v_source_table = 'expenses' then
    v_total := NEW.amount_chf;
  else
    v_total := NEW.amount;
  end if;
  if v_total is null or v_total = 0 then return NEW; end if;

  if NEW.vat_rate is not null then
    v_ht := round(v_total / (1 + NEW.vat_rate / 100), 2);
  else
    v_ht := v_total;
  end if;
  v_vat := round(v_total - v_ht, 2);
  v_entry_date := coalesce(NEW.expense_date, NEW.created_at::date);

  v_fiscal_year_id := public.find_org_open_fiscal_year(NEW.organization_id, v_entry_date);
  select account_id into v_achats from public.accounting_account_mappings where organization_id = NEW.organization_id and mapping_key = 'achats_materiel';
  select account_id into v_tva_prealable from public.accounting_account_mappings where organization_id = NEW.organization_id and mapping_key = 'tva_prealable';
  select account_id into v_banque from public.accounting_account_mappings where organization_id = NEW.organization_id and mapping_key = 'banque';
  select id into v_journal_id from public.accounting_journals where organization_id = NEW.organization_id and code = 'AC';

  if v_fiscal_year_id is null or v_achats is null or v_banque is null or v_journal_id is null or (v_vat > 0 and v_tva_prealable is null) then
    raise warning 'Comptabilisation auto ignorée pour la dépense % (%) : exercice ou mapping de compte manquant', NEW.id, v_source_table;
    return NEW;
  end if;

  select code into v_vat_code from public.vat_codes
  where organization_id = NEW.organization_id
    and category = 'achat_materiel'
    and rate = coalesce(NEW.vat_rate, 0)
    and valid_from <= v_entry_date and (valid_to is null or valid_to >= v_entry_date)
  order by (code = 'P-MAT') desc
  limit 1;

  begin
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, source_id, status, created_by)
    values (NEW.organization_id, v_fiscal_year_id, v_journal_id, v_entry_date, NEW.label, 'facture_fournisseur', NEW.id, 'brouillon', NEW.created_by)
    returning id into v_entry_id;

    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order) values
      (v_entry_id, v_achats, v_ht, 0, NEW.label, 0);
    if v_vat > 0 then
      insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order, vat_code, vat_base, vat_amount)
      values (v_entry_id, v_tva_prealable, v_vat, 0, 'TVA — ' || NEW.label, 1, v_vat_code, v_ht, v_vat);
    end if;
    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order)
    values (v_entry_id, v_banque, 0, v_total, NEW.label, 2);

    perform public.post_accounting_entry(v_entry_id);
  exception when others then
    raise warning 'Comptabilisation auto échouée pour la dépense % : %', NEW.id, SQLERRM;
  end;

  return NEW;
end;
$$;

notify pgrst, 'reload schema';
