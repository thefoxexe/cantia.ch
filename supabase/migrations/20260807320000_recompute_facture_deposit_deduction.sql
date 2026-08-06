-- Makes the deposit deduction fully symmetric: 20260807300000 fixed
-- "deposit created after the final invoice" but a deposit later cancelled
-- or deleted still left its now-stale deduction line sitting on the final
-- invoice. Extracted into its own RPC so both directions (create a
-- deposit, remove a deposit) can call the same recompute logic.
create or replace function public.recompute_facture_deposit_deduction(p_devis_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_final_facture_id uuid;
  v_deposits_subtotal numeric;
begin
  select organization_id into v_org_id from public.devis where id = p_devis_id;
  if v_org_id is null then
    raise exception 'Devis introuvable';
  end if;
  if not public.is_org_member(v_org_id) then
    raise exception 'Accès refusé';
  end if;

  for v_final_facture_id in
    select id from public.factures
    where devis_id = p_devis_id and not is_deposit and status <> 'cancelled'
  loop
    delete from public.facture_items
    where facture_id = v_final_facture_id and description = 'Acompte(s) déjà facturé(s) à déduire';

    select coalesce(sum(fi.quantity * fi.unit_price), 0) into v_deposits_subtotal
    from public.facture_items fi
    join public.factures f on f.id = fi.facture_id
    where f.devis_id = p_devis_id and f.is_deposit and f.status <> 'cancelled';

    if v_deposits_subtotal > 0 then
      insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
      values (v_final_facture_id, 'Acompte(s) déjà facturé(s) à déduire', 1, 'forfait', -v_deposits_subtotal, 9999);
    end if;
  end loop;
end;
$$;

grant execute on function public.recompute_facture_deposit_deduction(uuid) to authenticated;

-- Reuse the shared function instead of duplicating the loop inline.
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

    perform public.recompute_facture_deposit_deduction(v_devis.id);
  else
    insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
    select v_facture_id, description, quantity, unit, unit_price, sort_order
    from public.devis_items
    where devis_id = v_devis.id;

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
