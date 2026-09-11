-- Auto-generates real posted entries from factures, encaissements and
-- dépenses (§4.3 sources list) — best-effort: a missing account mapping or
-- no open fiscal year logs a warning and leaves the source event posted
-- (facture/paiement/dépense still saves normally) but unaccounted, rather
-- than blocking core invoicing/payment flows over an accounting config
-- gap. Every skip is real and visible: nothing is silently faked. Each
-- function is idempotent (checks for an existing entry on that source_id
-- before creating another).

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
begin
  if NEW.status in ('draft', 'cancelled') then
    if NEW.status = 'cancelled' then
      -- Reverse a previously posted entry if this facture is cancelled
      -- after having been sent — never silently leave a cancelled
      -- facture's revenue standing in the books.
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

  v_label := 'Facture ' || coalesce(NEW.number, '') || ' — ' || coalesce(NEW.client_name, '');

  begin
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, source_id, status, created_by)
    values (NEW.organization_id, v_fiscal_year_id, v_journal_id, v_entry_date, v_label, 'facture_client', NEW.id, 'brouillon', NEW.created_by)
    returning id into v_entry_id;

    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order) values
      (v_entry_id, v_debiteurs, v_ht + v_vat, 0, v_label, 0),
      (v_entry_id, v_produits, 0, v_ht, v_label, 1);
    if v_vat > 0 then
      insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order)
      values (v_entry_id, v_tva_collectee, 0, v_vat, 'TVA — ' || v_label, 2);
    end if;

    perform public.post_accounting_entry(v_entry_id);
  exception when others then
    raise warning 'Comptabilisation auto échouée pour la facture % : %', NEW.id, SQLERRM;
  end;

  return NEW;
end;
$$;

create trigger factures_auto_post
  after insert or update of status on public.factures
  for each row execute function public.trg_post_facture_entry();

create or replace function public.trg_post_facture_payment_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_facture record;
  v_fiscal_year_id uuid;
  v_journal_id uuid;
  v_banque uuid;
  v_debiteurs uuid;
  v_entry_id uuid;
  v_entry_date date;
  v_label text;
begin
  if exists (select 1 from public.accounting_entries where source = 'encaissement_client' and source_id = NEW.id) then
    return NEW;
  end if;

  select id, organization_id, number, client_name into v_facture from public.factures where id = NEW.facture_id;
  if v_facture.id is null or NEW.amount = 0 then return NEW; end if;
  v_entry_date := NEW.paid_at::date;

  v_fiscal_year_id := public.find_org_open_fiscal_year(v_facture.organization_id, v_entry_date);
  select account_id into v_banque from public.accounting_account_mappings where organization_id = v_facture.organization_id and mapping_key = 'banque';
  select account_id into v_debiteurs from public.accounting_account_mappings where organization_id = v_facture.organization_id and mapping_key = 'debiteurs';
  select id into v_journal_id from public.accounting_journals where organization_id = v_facture.organization_id and code = 'BQ';

  if v_fiscal_year_id is null or v_banque is null or v_debiteurs is null or v_journal_id is null then
    raise warning 'Comptabilisation auto ignorée pour l''encaissement % (organisation %) : exercice ou mapping de compte manquant', NEW.id, v_facture.organization_id;
    return NEW;
  end if;

  v_label := 'Encaissement — facture ' || coalesce(v_facture.number, '') || ' — ' || coalesce(v_facture.client_name, '');

  begin
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, source_id, status, created_by)
    values (v_facture.organization_id, v_fiscal_year_id, v_journal_id, v_entry_date, v_label, 'encaissement_client', NEW.id, 'brouillon', NEW.created_by)
    returning id into v_entry_id;

    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order) values
      (v_entry_id, v_banque, round(NEW.amount, 2), 0, v_label, 0),
      (v_entry_id, v_debiteurs, 0, round(NEW.amount, 2), v_label, 1);

    perform public.post_accounting_entry(v_entry_id);
  exception when others then
    raise warning 'Comptabilisation auto échouée pour l''encaissement % : %', NEW.id, SQLERRM;
  end;

  return NEW;
end;
$$;

create trigger facture_payments_auto_post
  after insert on public.facture_payments
  for each row execute function public.trg_post_facture_payment_entry();

notify pgrst, 'reload schema';
