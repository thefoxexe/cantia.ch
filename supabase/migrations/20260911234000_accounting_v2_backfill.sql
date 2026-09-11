-- One-time backfill: seeds the chart of accounts/journals/fiscal year/
-- mappings for every organization that existed before the auto-seed
-- trigger (20260911233500/233600), then generates real posted entries for
-- every pre-existing facture, encaissement and dépense — idempotent by
-- source_id (safe to re-run), and deliberately NOT done via a bulk UPDATE
-- on factures/facture_payments (which would fire unrelated notification/
-- log triggers already attached to those tables) but by re-deriving each
-- entry directly, exactly like the real triggers do.
do $$
declare
  v_org record;
begin
  for v_org in select id from public.organizations loop
    perform public.seed_accounting_defaults(v_org.id);
    perform public.seed_default_account_mappings(v_org.id);
  end loop;
end $$;

do $$
declare
  v_f record;
  v_p record;
  v_e record;
  v_ht numeric(14,2);
  v_vat numeric(14,2);
  v_total numeric(14,2);
  v_fiscal_year_id uuid;
  v_journal_id uuid;
  v_debiteurs uuid;
  v_produits uuid;
  v_tva_collectee uuid;
  v_banque uuid;
  v_achats uuid;
  v_tva_prealable uuid;
  v_entry_id uuid;
  v_label text;
begin
  -- Factures
  for v_f in
    select f.* from public.factures f
    where f.status not in ('draft','cancelled')
      and not exists (select 1 from public.accounting_entries e where e.source='facture_client' and e.source_id=f.id)
  loop
    select coalesce(sum(quantity*unit_price),0) into v_ht from public.facture_items where facture_id = v_f.id;
    if v_ht = 0 then continue; end if;
    v_ht := round(v_ht,2);
    v_vat := round(v_ht * coalesce(v_f.vat_rate,0)/100, 2);

    v_fiscal_year_id := public.find_org_open_fiscal_year(v_f.organization_id, v_f.created_at::date);
    select account_id into v_debiteurs from public.accounting_account_mappings where organization_id=v_f.organization_id and mapping_key='debiteurs';
    select account_id into v_produits from public.accounting_account_mappings where organization_id=v_f.organization_id and mapping_key='produits_default';
    select account_id into v_tva_collectee from public.accounting_account_mappings where organization_id=v_f.organization_id and mapping_key='tva_collectee';
    select id into v_journal_id from public.accounting_journals where organization_id=v_f.organization_id and code='VE';

    if v_fiscal_year_id is null or v_debiteurs is null or v_produits is null or v_journal_id is null or (v_vat>0 and v_tva_collectee is null) then
      continue;
    end if;

    v_label := 'Facture ' || coalesce(v_f.number,'') || ' — ' || coalesce(v_f.client_name,'');
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, source_id, status, created_by)
    values (v_f.organization_id, v_fiscal_year_id, v_journal_id, v_f.created_at::date, v_label, 'facture_client', v_f.id, 'brouillon', v_f.created_by)
    returning id into v_entry_id;

    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order) values
      (v_entry_id, v_debiteurs, v_ht+v_vat, 0, v_label, 0),
      (v_entry_id, v_produits, 0, v_ht, v_label, 1);
    if v_vat > 0 then
      insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order)
      values (v_entry_id, v_tva_collectee, 0, v_vat, 'TVA — '||v_label, 2);
    end if;
    perform public.post_accounting_entry(v_entry_id);
  end loop;

  -- Encaissements
  for v_p in
    select p.*, f.organization_id, f.number, f.client_name from public.facture_payments p
    join public.factures f on f.id = p.facture_id
    where not exists (select 1 from public.accounting_entries e where e.source='encaissement_client' and e.source_id=p.id)
  loop
    if v_p.amount = 0 then continue; end if;
    v_fiscal_year_id := public.find_org_open_fiscal_year(v_p.organization_id, v_p.paid_at::date);
    select account_id into v_banque from public.accounting_account_mappings where organization_id=v_p.organization_id and mapping_key='banque';
    select account_id into v_debiteurs from public.accounting_account_mappings where organization_id=v_p.organization_id and mapping_key='debiteurs';
    select id into v_journal_id from public.accounting_journals where organization_id=v_p.organization_id and code='BQ';
    if v_fiscal_year_id is null or v_banque is null or v_debiteurs is null or v_journal_id is null then
      continue;
    end if;
    v_label := 'Encaissement — facture ' || coalesce(v_p.number,'') || ' — ' || coalesce(v_p.client_name,'');
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, source_id, status, created_by)
    values (v_p.organization_id, v_fiscal_year_id, v_journal_id, v_p.paid_at::date, v_label, 'encaissement_client', v_p.id, 'brouillon', v_p.created_by)
    returning id into v_entry_id;
    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order) values
      (v_entry_id, v_banque, round(v_p.amount,2), 0, v_label, 0),
      (v_entry_id, v_debiteurs, 0, round(v_p.amount,2), v_label, 1);
    perform public.post_accounting_entry(v_entry_id);
  end loop;

  -- Dépenses générales
  for v_e in select * from public.expenses where not exists (select 1 from public.accounting_entries e2 where e2.source='facture_fournisseur' and e2.source_id=expenses.id)
  loop
    v_total := v_e.amount_chf;
    if v_total is null or v_total = 0 then continue; end if;
    if v_e.vat_rate is not null then v_ht := round(v_total/(1+v_e.vat_rate/100),2); else v_ht := v_total; end if;
    v_vat := round(v_total - v_ht, 2);
    v_fiscal_year_id := public.find_org_open_fiscal_year(v_e.organization_id, coalesce(v_e.expense_date, v_e.created_at::date));
    select account_id into v_achats from public.accounting_account_mappings where organization_id=v_e.organization_id and mapping_key='achats_materiel';
    select account_id into v_tva_prealable from public.accounting_account_mappings where organization_id=v_e.organization_id and mapping_key='tva_prealable';
    select account_id into v_banque from public.accounting_account_mappings where organization_id=v_e.organization_id and mapping_key='banque';
    select id into v_journal_id from public.accounting_journals where organization_id=v_e.organization_id and code='AC';
    if v_fiscal_year_id is null or v_achats is null or v_banque is null or v_journal_id is null or (v_vat>0 and v_tva_prealable is null) then
      continue;
    end if;
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, source_id, status, created_by)
    values (v_e.organization_id, v_fiscal_year_id, v_journal_id, coalesce(v_e.expense_date, v_e.created_at::date), v_e.label, 'facture_fournisseur', v_e.id, 'brouillon', v_e.created_by)
    returning id into v_entry_id;
    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order) values (v_entry_id, v_achats, v_ht, 0, v_e.label, 0);
    if v_vat > 0 then
      insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order) values (v_entry_id, v_tva_prealable, v_vat, 0, 'TVA — '||v_e.label, 1);
    end if;
    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order) values (v_entry_id, v_banque, 0, v_total, v_e.label, 2);
    perform public.post_accounting_entry(v_entry_id);
  end loop;

  -- Dépenses de chantier
  for v_e in select * from public.project_expenses where not exists (select 1 from public.accounting_entries e2 where e2.source='facture_fournisseur' and e2.source_id=project_expenses.id)
  loop
    v_total := v_e.amount;
    if v_total is null or v_total = 0 then continue; end if;
    if v_e.vat_rate is not null then v_ht := round(v_total/(1+v_e.vat_rate/100),2); else v_ht := v_total; end if;
    v_vat := round(v_total - v_ht, 2);
    v_fiscal_year_id := public.find_org_open_fiscal_year(v_e.organization_id, coalesce(v_e.expense_date, v_e.created_at::date));
    select account_id into v_achats from public.accounting_account_mappings where organization_id=v_e.organization_id and mapping_key='achats_materiel';
    select account_id into v_tva_prealable from public.accounting_account_mappings where organization_id=v_e.organization_id and mapping_key='tva_prealable';
    select account_id into v_banque from public.accounting_account_mappings where organization_id=v_e.organization_id and mapping_key='banque';
    select id into v_journal_id from public.accounting_journals where organization_id=v_e.organization_id and code='AC';
    if v_fiscal_year_id is null or v_achats is null or v_banque is null or v_journal_id is null or (v_vat>0 and v_tva_prealable is null) then
      continue;
    end if;
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, source_id, status, created_by)
    values (v_e.organization_id, v_fiscal_year_id, v_journal_id, coalesce(v_e.expense_date, v_e.created_at::date), v_e.label, 'facture_fournisseur', v_e.id, 'brouillon', v_e.created_by)
    returning id into v_entry_id;
    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order, project_id) values (v_entry_id, v_achats, v_ht, 0, v_e.label, 0, v_e.project_id);
    if v_vat > 0 then
      insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order, project_id) values (v_entry_id, v_tva_prealable, v_vat, 0, 'TVA — '||v_e.label, 1, v_e.project_id);
    end if;
    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order, project_id) values (v_entry_id, v_banque, 0, v_total, v_e.label, 2, v_e.project_id);
    perform public.post_accounting_entry(v_entry_id);
  end loop;
end $$;
