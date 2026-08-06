-- Fixes a one-directional bug: the final invoice already deducted deposits
-- billed *before* it existed (see 20260807220000), but a deposit created
-- *after* the final invoice (via "Facturer un acompte" from the final
-- facture itself) never updated that already-existing final invoice — its
-- total and "reste dû" stayed wrong, showing the full amount even after a
-- deposit had been billed against it. This makes the deduction symmetric:
-- creating a deposit now also recomputes the deduction line on every
-- non-cancelled final invoice for the same devis.
create or replace function public.convert_devis_to_facture(
  p_devis_id uuid,
  p_due_days integer default 30,
  p_deposit_percent numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_devis public.devis%rowtype;
  v_facture_id uuid;
  v_subtotal numeric;
  v_deposits_subtotal numeric;
  v_final_facture_id uuid;
begin
  select * into v_devis from public.devis where id = p_devis_id;
  if not found then
    raise exception 'Devis introuvable';
  end if;
  if not public.is_org_member(v_devis.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if v_devis.status <> 'accepted' then
    raise exception 'Seul un devis accepté peut être transformé en facture';
  end if;
  if p_deposit_percent is not null and (p_deposit_percent <= 0 or p_deposit_percent > 100) then
    raise exception 'Le pourcentage d''acompte doit être compris entre 0 et 100';
  end if;

  insert into public.factures (
    organization_id, project_id, devis_id, template_id,
    client_name, client_address, client_email, notes,
    vat_rate, due_date, created_by, is_deposit
  ) values (
    v_devis.organization_id, v_devis.project_id, v_devis.id, v_devis.template_id,
    v_devis.client_name, v_devis.client_address, v_devis.client_email, v_devis.notes,
    v_devis.vat_rate, current_date + p_due_days, auth.uid(), p_deposit_percent is not null
  )
  returning id into v_facture_id;

  if p_deposit_percent is not null then
    select coalesce(sum(quantity * unit_price), 0) into v_subtotal
    from public.devis_items where devis_id = v_devis.id;

    insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
    values (
      v_facture_id,
      format(
        'Acompte %s%% — Devis %s',
        case when p_deposit_percent = trunc(p_deposit_percent)
          then trunc(p_deposit_percent)::text
          else p_deposit_percent::text
        end,
        coalesce(v_devis.number, '')
      ),
      1, 'forfait', round(v_subtotal * p_deposit_percent / 100, 2), 0
    );

    -- Symmetric case: a final invoice for this devis may already exist —
    -- refresh its deduction line to include this new deposit too.
    for v_final_facture_id in
      select id from public.factures
      where devis_id = v_devis.id and not is_deposit and status <> 'cancelled' and id <> v_facture_id
    loop
      delete from public.facture_items
      where facture_id = v_final_facture_id and description = 'Acompte(s) déjà facturé(s) à déduire';

      select coalesce(sum(fi.quantity * fi.unit_price), 0) into v_deposits_subtotal
      from public.facture_items fi
      join public.factures f on f.id = fi.facture_id
      where f.devis_id = v_devis.id and f.is_deposit and f.status <> 'cancelled';

      if v_deposits_subtotal > 0 then
        insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
        values (v_final_facture_id, 'Acompte(s) déjà facturé(s) à déduire', 1, 'forfait', -v_deposits_subtotal, 9999);
      end if;
    end loop;
  else
    insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
    select v_facture_id, description, quantity, unit, unit_price, sort_order
    from public.devis_items
    where devis_id = v_devis.id;

    -- Deduct any deposits already invoiced on this devis (draft/sent/paid —
    -- a cancelled deposit never happened, so it isn't deducted).
    select coalesce(sum(fi.quantity * fi.unit_price), 0) into v_deposits_subtotal
    from public.facture_items fi
    join public.factures f on f.id = fi.facture_id
    where f.devis_id = v_devis.id and f.is_deposit and f.status <> 'cancelled' and f.id <> v_facture_id;

    if v_deposits_subtotal > 0 then
      insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
      values (
        v_facture_id,
        'Acompte(s) déjà facturé(s) à déduire',
        1, 'forfait', -v_deposits_subtotal, 9999
      );
    end if;
  end if;

  return v_facture_id;
end;
$$;
