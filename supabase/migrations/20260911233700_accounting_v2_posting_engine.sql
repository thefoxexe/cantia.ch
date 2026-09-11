-- §3.1 (balance invariant), §3.2 (brouillon -> comptabilisée -> extournée),
-- §4.5 (atomic collision-free numbering), §3.3 (audit trail).
create or replace function public.find_org_open_fiscal_year(p_organization_id uuid, p_date date)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.accounting_fiscal_years
  where organization_id = p_organization_id
    and p_date between start_date and end_date
    and status = 'open'
  limit 1;
$$;

-- Validates balance + period lock, assigns the entry number atomically,
-- flips status to comptabilisée. Raises (refusing the transaction) rather
-- than silently accepting an unbalanced or out-of-period entry — a failed
-- call leaves the entry exactly as it was, still a brouillon.
--
-- The permission check only applies when auth.uid() is set (a direct
-- client RPC call under RLS). Trusted server-side callers — the
-- auto-posting triggers on factures/paiements/dépenses, and the payroll
-- edge function's service-role client (which already re-checks the
-- calling user's permission itself before calling this) — run with
-- auth.uid() null and are not re-checked here a second, weaker way.
create or replace function public.post_accounting_entry(p_entry_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry record;
  v_fiscal_year record;
  v_total_debit numeric(14, 2);
  v_total_credit numeric(14, 2);
  v_line_count integer;
  v_number integer;
begin
  select * into v_entry from public.accounting_entries where id = p_entry_id for update;
  if not found then
    raise exception 'Écriture introuvable';
  end if;
  if auth.uid() is not null and not public.can_post_org_accounting_entries(v_entry.organization_id) then
    raise exception 'Accès refusé : vous ne pouvez pas comptabiliser d''écritures pour cette organisation';
  end if;
  if v_entry.status not in ('brouillon', 'validee') then
    raise exception 'Cette écriture ne peut plus être comptabilisée (statut : %)', v_entry.status;
  end if;

  select count(*), coalesce(sum(debit), 0), coalesce(sum(credit), 0)
  into v_line_count, v_total_debit, v_total_credit
  from public.accounting_entry_lines where entry_id = p_entry_id;

  if v_line_count < 2 then
    raise exception 'Une pièce comptable doit contenir au moins deux lignes';
  end if;
  if v_total_debit <> v_total_credit then
    raise exception 'Écriture déséquilibrée : débit % ≠ crédit %', v_total_debit, v_total_credit;
  end if;

  select * into v_fiscal_year from public.accounting_fiscal_years where id = v_entry.fiscal_year_id for update;
  if v_fiscal_year.status <> 'open' then
    raise exception 'L''exercice comptable de cette pièce est fermé';
  end if;
  if v_fiscal_year.locked_until_date is not null and v_entry.entry_date <= v_fiscal_year.locked_until_date then
    raise exception 'La période du % est verrouillée (verrouillé jusqu''au %)', v_entry.entry_date, v_fiscal_year.locked_until_date;
  end if;

  insert into public.accounting_entry_sequences (fiscal_year_id, next_number)
  values (v_entry.fiscal_year_id, 2)
  on conflict (fiscal_year_id) do update set next_number = accounting_entry_sequences.next_number + 1
  returning next_number - 1 into v_number;

  update public.accounting_entries
  set status = 'comptabilisee', entry_number = v_number, posted_at = now(), updated_at = now()
  where id = p_entry_id;

  insert into public.accounting_audit_events (organization_id, user_id, action, entity_type, entity_id, new_values, source)
  values (v_entry.organization_id, auth.uid(), 'post', 'accounting_entry', p_entry_id, jsonb_build_object('entry_number', v_number), v_entry.source);

  return v_number;
end;
$$;
revoke all on function public.post_accounting_entry(uuid) from public;
revoke execute on function public.post_accounting_entry(uuid) from anon;
grant execute on function public.post_accounting_entry(uuid) to authenticated;

-- Creates a new entry with every line's debit/credit swapped, posts it
-- into the fiscal year covering p_reversal_date (defaults to today), then
-- marks the original as extournée. A period-locked or closed original
-- fiscal year is untouched — the reversal itself lands in whichever open
-- period is current, exactly like a real accountant correcting a prior,
-- already-filed period from today rather than editing history.
create or replace function public.reverse_accounting_entry(p_entry_id uuid, p_reversal_date date default current_date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry record;
  v_reversal_fiscal_year_id uuid;
  v_new_entry_id uuid;
  v_od_journal_id uuid;
begin
  select * into v_entry from public.accounting_entries where id = p_entry_id for update;
  if not found then
    raise exception 'Écriture introuvable';
  end if;
  if auth.uid() is not null and not public.can_reverse_org_accounting_entries(v_entry.organization_id) then
    raise exception 'Accès refusé : vous ne pouvez pas extourner d''écritures pour cette organisation';
  end if;
  if v_entry.status <> 'comptabilisee' then
    raise exception 'Seule une écriture comptabilisée peut être extournée (statut actuel : %)', v_entry.status;
  end if;

  v_reversal_fiscal_year_id := public.find_org_open_fiscal_year(v_entry.organization_id, p_reversal_date);
  if v_reversal_fiscal_year_id is null then
    raise exception 'Aucun exercice ouvert ne couvre le %', p_reversal_date;
  end if;

  select id into v_od_journal_id from public.accounting_journals
  where organization_id = v_entry.organization_id and code = 'OD' limit 1;
  if v_od_journal_id is null then v_od_journal_id := v_entry.journal_id; end if;

  insert into public.accounting_entries
    (organization_id, fiscal_year_id, journal_id, entry_date, document_date, label, source, source_id, status, created_by)
  values
    (v_entry.organization_id, v_reversal_fiscal_year_id, v_od_journal_id, p_reversal_date, v_entry.entry_date,
     'Extourne — ' || v_entry.label, 'extourne', v_entry.id, 'brouillon', auth.uid())
  returning id into v_new_entry_id;

  insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, tiers, project_id, vat_code, vat_base, vat_amount, sort_order)
  select v_new_entry_id, account_id, credit, debit, label, tiers, project_id, vat_code, vat_base, vat_amount, sort_order
  from public.accounting_entry_lines
  where entry_id = p_entry_id;

  perform public.post_accounting_entry(v_new_entry_id);

  update public.accounting_entries
  set status = 'extournee', reversed_entry_id = v_new_entry_id, updated_at = now()
  where id = p_entry_id;

  insert into public.accounting_audit_events (organization_id, user_id, action, entity_type, entity_id, new_values, source)
  values (v_entry.organization_id, auth.uid(), 'reverse', 'accounting_entry', p_entry_id, jsonb_build_object('reversal_entry_id', v_new_entry_id), 'extourne');

  return v_new_entry_id;
end;
$$;
revoke all on function public.reverse_accounting_entry(uuid, date) from public;
revoke execute on function public.reverse_accounting_entry(uuid, date) from anon;
grant execute on function public.reverse_accounting_entry(uuid, date) to authenticated;

notify pgrst, 'reload schema';
