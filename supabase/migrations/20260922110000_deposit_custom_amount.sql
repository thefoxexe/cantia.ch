-- Deposit invoicing was percent-only (p_deposit_percent, capped 0-100 of the
-- devis subtotal) — no way to type a fixed CHF amount instead. Replaces the
-- 3-arg convert_devis_to_facture/_internal overloads with 4-arg versions
-- taking an alternative p_deposit_amount; at most one of the two may be set.
-- Existing callers passing only p_deposit_percent (or neither) are
-- unaffected — the new parameter defaults to null.
drop function if exists public.convert_devis_to_facture(uuid, integer, numeric);
drop function if exists public.convert_devis_to_facture_internal(uuid, integer, numeric);

create or replace function public.convert_devis_to_facture_internal(
  p_devis_id uuid,
  p_due_days integer default 30,
  p_deposit_percent numeric default null,
  p_deposit_amount numeric default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_devis public.devis%rowtype;
  v_facture_id uuid;
  v_subtotal numeric;
  v_deposits_subtotal numeric;
  v_is_deposit boolean;
begin
  select * into v_devis from public.devis where id = p_devis_id;
  if not found then
    raise exception 'Devis introuvable';
  end if;
  if v_devis.status <> 'accepted' then
    raise exception 'Seul un devis accepté peut être transformé en facture';
  end if;
  if p_deposit_percent is not null and p_deposit_amount is not null then
    raise exception 'Choisissez soit un pourcentage, soit un montant pour l''acompte, pas les deux';
  end if;
  if p_deposit_percent is not null and (p_deposit_percent <= 0 or p_deposit_percent > 100) then
    raise exception 'Le pourcentage d''acompte doit être compris entre 0 et 100';
  end if;
  if p_deposit_amount is not null and p_deposit_amount <= 0 then
    raise exception 'Le montant de l''acompte doit être positif';
  end if;
  v_is_deposit := p_deposit_percent is not null or p_deposit_amount is not null;

  insert into public.factures (
    organization_id, project_id, devis_id, client_id, template_id,
    client_name, client_address, client_email, notes,
    vat_rate, due_date, created_by, is_deposit
  ) values (
    v_devis.organization_id, v_devis.project_id, v_devis.id, v_devis.client_id, v_devis.template_id,
    v_devis.client_name, v_devis.client_address, v_devis.client_email, v_devis.notes,
    v_devis.vat_rate, current_date + p_due_days, auth.uid(), v_is_deposit
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
  elsif p_deposit_amount is not null then
    insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
    values (
      v_facture_id,
      format('Acompte — Devis %s', coalesce(v_devis.number, '')),
      1, 'forfait', round(p_deposit_amount, 2), 0
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
$function$;

-- This project grants EXECUTE on new functions to authenticated/anon by
-- default (via default privileges, not just the PUBLIC pseudo-role — "from
-- public" alone does not revoke those per-role grants). The prior 3-arg
-- _internal had this revoked (it's only ever meant to be reached through
-- the permission-checked wrapper below), and re-creating it under a new
-- 4-arg signature starts that over unless revoked again here, explicitly
-- from every role that could otherwise call it directly.
revoke all on function public.convert_devis_to_facture_internal(uuid, integer, numeric, numeric) from public, anon, authenticated;

create or replace function public.convert_devis_to_facture(
  p_devis_id uuid,
  p_due_days integer default 30,
  p_deposit_percent numeric default null,
  p_deposit_amount numeric default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_org_id uuid;
begin
  select organization_id into v_org_id from public.devis where id = p_devis_id;
  if v_org_id is null then
    raise exception 'Devis introuvable';
  end if;
  if not public.can_manage_org_devis(v_org_id) then
    raise exception 'Accès refusé';
  end if;
  return public.convert_devis_to_facture_internal(p_devis_id, p_due_days, p_deposit_percent, p_deposit_amount);
end;
$function$;
