-- A reversal entry (source = 'extourne') is itself posted as comptabilisée
-- so it stays visible in reports and ledgers — but it must never be
-- re-reversible, or a user can click "Extourner" on the reversal, then on
-- that result, chaining indefinitely (each individually valid, since only
-- the target entry's own status was checked, never whether it is itself
-- already a correction of something else). The client now also hides the
-- button for these, but the RPC is the actual authority — enforce it here.
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
  if v_entry.source = 'extourne' then
    raise exception 'Cette écriture est déjà une extourne d''une autre écriture — elle ne peut pas être extournée à son tour';
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
