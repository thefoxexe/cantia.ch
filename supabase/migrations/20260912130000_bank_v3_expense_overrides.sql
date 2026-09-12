-- §6.4 "Règles automatiques" needs a rule to be able to actually propose a
-- specific charge account and supplier for a dépense, not just its
-- category text — today's auto-posting trigger always books every dépense
-- to the org's single 'achats_materiel' mapping, with no per-row override
-- and no supplier recorded anywhere. Both columns are nullable and
-- opt-in: an ordinary dépense created by hand, exactly as before, still
-- falls back to the default mapping and an untagged tiers.
alter table public.expenses
  add column accounting_account_id uuid references public.accounting_accounts(id),
  add column tiers text;
alter table public.project_expenses
  add column accounting_account_id uuid references public.accounting_accounts(id),
  add column tiers text;

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

  v_fiscal_year_id := public.find_org_open_fiscal_year(NEW.organization_id, coalesce(NEW.expense_date, NEW.created_at::date));
  select account_id into v_achats from public.accounting_account_mappings where organization_id = NEW.organization_id and mapping_key = 'achats_materiel';
  v_achats := coalesce(NEW.accounting_account_id, v_achats);
  select account_id into v_tva_prealable from public.accounting_account_mappings where organization_id = NEW.organization_id and mapping_key = 'tva_prealable';
  select account_id into v_banque from public.accounting_account_mappings where organization_id = NEW.organization_id and mapping_key = 'banque';
  select id into v_journal_id from public.accounting_journals where organization_id = NEW.organization_id and code = 'AC';

  if v_fiscal_year_id is null or v_achats is null or v_banque is null or v_journal_id is null or (v_vat > 0 and v_tva_prealable is null) then
    raise warning 'Comptabilisation auto ignorée pour la dépense % (%) : exercice ou mapping de compte manquant', NEW.id, v_source_table;
    return NEW;
  end if;

  begin
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, source_id, status, created_by)
    values (NEW.organization_id, v_fiscal_year_id, v_journal_id, coalesce(NEW.expense_date, NEW.created_at::date), NEW.label, 'facture_fournisseur', NEW.id, 'brouillon', NEW.created_by)
    returning id into v_entry_id;

    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, tiers, sort_order) values
      (v_entry_id, v_achats, v_ht, 0, NEW.label, NEW.tiers, 0);
    if v_vat > 0 then
      insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, tiers, sort_order)
      values (v_entry_id, v_tva_prealable, v_vat, 0, 'TVA — ' || NEW.label, NEW.tiers, 1);
    end if;
    insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, tiers, sort_order)
    values (v_entry_id, v_banque, 0, v_total, NEW.label, NEW.tiers, 2);

    perform public.post_accounting_entry(v_entry_id);
  exception when others then
    raise warning 'Comptabilisation auto échouée pour la dépense % : %', NEW.id, SQLERRM;
  end;

  return NEW;
end;
$$;

notify pgrst, 'reload schema';
