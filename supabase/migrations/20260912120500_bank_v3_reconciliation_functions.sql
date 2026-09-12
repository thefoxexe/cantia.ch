-- §6.3 "Rapprochement bancaire" — deliberately does NOT create any new
-- accounting_entry. Every cash movement Cantia already knows about
-- (encaissement client, dépense, écriture manuelle, virement entre
-- comptes...) already produced a posted line on the bank account's mapped
-- accounting_account via the Lot 1 posting engine before this transaction
-- was ever imported. Reconciling is therefore always "point this bank
-- transaction at the accounting_entry_line that already represents it" —
-- never "guess and book something". This is what makes it safe to let the
-- user confirm a suggested match with one tap: the money movement it
-- points to was already validated (balanced, permission-checked, posted)
-- by the existing engine; linking can only fail closed (wrong amount/sign,
-- already claimed by another transaction, wrong account), never book
-- anything incorrect.
--
-- A transaction with no existing candidate line (a payment Cantia doesn't
-- know about yet) is not handled here at all — the UI sends the user to
-- create the missing encaissement/dépense/écriture first (through the
-- existing, permission-checked flows), which then shows up as a normal
-- match candidate.
create or replace function public.link_bank_transaction_to_entry_line(p_transaction_id uuid, p_entry_line_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx record;
  v_line record;
  v_entry record;
  v_account record;
begin
  select * into v_tx from public.bank_transactions where id = p_transaction_id for update;
  if not found then
    raise exception 'Transaction bancaire introuvable';
  end if;
  if auth.uid() is not null and not public.can_validate_org_bank_reconciliations(v_tx.organization_id) then
    raise exception 'Accès refusé : vous ne pouvez pas valider de rapprochements pour cette organisation';
  end if;
  if v_tx.status <> 'unmatched' then
    raise exception 'Cette transaction n''est plus en attente de rapprochement (statut : %)', v_tx.status;
  end if;

  select * into v_line from public.accounting_entry_lines where id = p_entry_line_id for update;
  if not found then
    raise exception 'Ligne comptable introuvable';
  end if;
  select * into v_entry from public.accounting_entries where id = v_line.entry_id;
  if v_entry.organization_id <> v_tx.organization_id or v_entry.status <> 'comptabilisee' then
    raise exception 'Cette ligne comptable ne peut pas être rapprochée (organisation ou statut invalide)';
  end if;

  select ba.* into v_account from public.bank_accounts ba where ba.id = v_tx.bank_account_id;
  if v_account.accounting_account_id is null or v_line.account_id <> v_account.accounting_account_id then
    raise exception 'Cette ligne comptable n''appartient pas au compte comptable de ce compte bancaire';
  end if;

  -- Sign/amount consistency: an inflow (positive) can only settle a debit
  -- line on the (actif, normal_balance=debit) banque account; an outflow
  -- (negative) can only settle a credit line — within 1 centime for
  -- rounding noise, never silently accepted beyond that.
  if v_tx.amount > 0 then
    if abs(v_line.debit - v_tx.amount) > 0.01 or v_line.credit <> 0 then
      raise exception 'Le montant ou le sens de la ligne comptable ne correspond pas à cette transaction (entrée de CHF %)', v_tx.amount;
    end if;
  else
    if abs(v_line.credit - abs(v_tx.amount)) > 0.01 or v_line.debit <> 0 then
      raise exception 'Le montant ou le sens de la ligne comptable ne correspond pas à cette transaction (sortie de CHF %)', abs(v_tx.amount);
    end if;
  end if;

  update public.bank_transactions
  set status = 'matched', matched_entry_line_id = p_entry_line_id, matched_by = auth.uid(), matched_at = now()
  where id = p_transaction_id;

  insert into public.accounting_audit_events (organization_id, user_id, action, entity_type, entity_id, new_values, source)
  values (v_tx.organization_id, auth.uid(), 'match', 'bank_transaction', p_transaction_id, jsonb_build_object('entry_line_id', p_entry_line_id), 'import_bancaire');
end;
$$;
revoke all on function public.link_bank_transaction_to_entry_line(uuid, uuid) from public;
revoke execute on function public.link_bank_transaction_to_entry_line(uuid, uuid) from anon;
grant execute on function public.link_bank_transaction_to_entry_line(uuid, uuid) to authenticated;

create or replace function public.ignore_bank_transaction(p_transaction_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx record;
begin
  select * into v_tx from public.bank_transactions where id = p_transaction_id for update;
  if not found then
    raise exception 'Transaction bancaire introuvable';
  end if;
  if auth.uid() is not null and not public.can_validate_org_bank_reconciliations(v_tx.organization_id) then
    raise exception 'Accès refusé : vous ne pouvez pas valider de rapprochements pour cette organisation';
  end if;
  if v_tx.status <> 'unmatched' then
    raise exception 'Cette transaction n''est plus en attente de rapprochement (statut : %)', v_tx.status;
  end if;

  update public.bank_transactions set status = 'ignored', matched_by = auth.uid(), matched_at = now() where id = p_transaction_id;

  insert into public.accounting_audit_events (organization_id, user_id, action, entity_type, entity_id, source)
  values (v_tx.organization_id, auth.uid(), 'ignore', 'bank_transaction', p_transaction_id, 'import_bancaire');
end;
$$;
revoke all on function public.ignore_bank_transaction(uuid) from public;
revoke execute on function public.ignore_bank_transaction(uuid) from anon;
grant execute on function public.ignore_bank_transaction(uuid) to authenticated;

-- Undoes a mistaken match/ignore decision. Deliberately does not touch the
-- underlying accounting_entry — that still happened and is still correct;
-- this only resets the bank side so the transaction can be matched again.
-- Reversing the accounting movement itself, if that's genuinely what's
-- needed, goes through the existing extourne flow instead.
create or replace function public.unmatch_bank_transaction(p_transaction_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx record;
begin
  select * into v_tx from public.bank_transactions where id = p_transaction_id for update;
  if not found then
    raise exception 'Transaction bancaire introuvable';
  end if;
  if auth.uid() is not null and not public.can_validate_org_bank_reconciliations(v_tx.organization_id) then
    raise exception 'Accès refusé : vous ne pouvez pas valider de rapprochements pour cette organisation';
  end if;
  if v_tx.status = 'unmatched' then
    raise exception 'Cette transaction n''est pas encore rapprochée';
  end if;

  update public.bank_transactions
  set status = 'unmatched', matched_entry_line_id = null, matched_by = null, matched_at = null
  where id = p_transaction_id;

  insert into public.accounting_audit_events (organization_id, user_id, action, entity_type, entity_id, source)
  values (v_tx.organization_id, auth.uid(), 'unmatch', 'bank_transaction', p_transaction_id, 'import_bancaire');
end;
$$;
revoke all on function public.unmatch_bank_transaction(uuid) from public;
revoke execute on function public.unmatch_bank_transaction(uuid) from anon;
grant execute on function public.unmatch_bank_transaction(uuid) to authenticated;

notify pgrst, 'reload schema';
