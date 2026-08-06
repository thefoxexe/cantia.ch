-- Public client portal: unguessable per-document links a client can open
-- without an account, gated by a second factor (their own email matching
-- devis/facture.client_email) so a leaked/guessed token alone isn't enough.
-- Devis get an accept+sign flow; factures are read-only (payment status
-- must stay an internal, reconciled action — never client-self-service).

alter table public.devis
  add column public_token uuid not null default gen_random_uuid(),
  add column client_signed_at timestamptz,
  add column client_signer_name text,
  add column client_signature_data text;

create unique index devis_public_token_idx on public.devis (public_token);

alter table public.factures
  add column public_token uuid not null default gen_random_uuid();

create unique index factures_public_token_idx on public.factures (public_token);

-- ==========================================================================
-- Split convert_devis_to_facture into an internal (unchecked) core reused by
-- both the authenticated RPC and the public accept flow below, and a thin
-- authenticated wrapper that keeps the existing org-membership + status
-- checks exactly as before.
-- ==========================================================================
create or replace function public.convert_devis_to_facture_internal(
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
  v_org_id uuid;
begin
  select organization_id into v_org_id from public.devis where id = p_devis_id;
  if v_org_id is null then
    raise exception 'Devis introuvable';
  end if;
  if not public.is_org_member(v_org_id) then
    raise exception 'Accès refusé';
  end if;
  return public.convert_devis_to_facture_internal(p_devis_id, p_due_days, p_deposit_percent);
end;
$$;

grant execute on function public.convert_devis_to_facture_internal(uuid, integer, numeric) to authenticated;

-- ==========================================================================
-- Public devis portal
-- ==========================================================================
create or replace function public.get_public_devis(p_token uuid, p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_devis public.devis%rowtype;
  v_org record;
  v_items jsonb;
  v_subtotal numeric;
begin
  select * into v_devis from public.devis where public_token = p_token;
  if not found then
    raise exception 'Lien invalide';
  end if;
  if v_devis.client_email is null or lower(trim(v_devis.client_email)) <> lower(trim(p_email)) then
    raise exception 'Vérification impossible';
  end if;

  select name, phone, street, postal_code, locality, address, ide_number
  into v_org
  from public.organizations where id = v_devis.organization_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'description', description, 'quantity', quantity,
    'unit', unit, 'unit_price', unit_price, 'sort_order', sort_order
  ) order by sort_order), '[]'::jsonb), coalesce(sum(quantity * unit_price), 0)
  into v_items, v_subtotal
  from public.devis_items where devis_id = v_devis.id;

  return jsonb_build_object(
    'devis', jsonb_build_object(
      'id', v_devis.id, 'number', v_devis.number, 'status', v_devis.status,
      'client_name', v_devis.client_name, 'client_address', v_devis.client_address,
      'notes', v_devis.notes, 'vat_rate', v_devis.vat_rate, 'created_at', v_devis.created_at,
      'client_signed_at', v_devis.client_signed_at, 'client_signer_name', v_devis.client_signer_name
    ),
    'items', v_items,
    'totals', jsonb_build_object(
      'subtotal', v_subtotal,
      'vat', round(v_subtotal * v_devis.vat_rate / 100, 2),
      'total', round(v_subtotal * (1 + v_devis.vat_rate / 100), 2)
    ),
    'organization', to_jsonb(v_org)
  );
end;
$$;

grant execute on function public.get_public_devis(uuid, text) to anon, authenticated;

create or replace function public.accept_public_devis(
  p_token uuid,
  p_email text,
  p_signer_name text,
  p_signature_data text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_devis public.devis%rowtype;
begin
  select * into v_devis from public.devis where public_token = p_token;
  if not found then
    raise exception 'Lien invalide';
  end if;
  if v_devis.client_email is null or lower(trim(v_devis.client_email)) <> lower(trim(p_email)) then
    raise exception 'Vérification impossible';
  end if;
  if trim(coalesce(p_signer_name, '')) = '' then
    raise exception 'Le nom du signataire est requis';
  end if;
  if trim(coalesce(p_signature_data, '')) = '' then
    raise exception 'Une signature est requise';
  end if;

  if v_devis.status = 'refused' then
    raise exception 'Ce devis a été refusé et ne peut plus être accepté en ligne';
  end if;

  if v_devis.status <> 'accepted' then
    update public.devis
    set status = 'accepted',
        client_signed_at = now(),
        client_signer_name = p_signer_name,
        client_signature_data = p_signature_data
    where id = v_devis.id;

    if not exists (select 1 from public.factures where devis_id = v_devis.id and not is_deposit) then
      perform public.convert_devis_to_facture_internal(v_devis.id);
    end if;
  end if;

  select * into v_devis from public.devis where id = v_devis.id;
  return jsonb_build_object('status', v_devis.status, 'client_signed_at', v_devis.client_signed_at);
end;
$$;

grant execute on function public.accept_public_devis(uuid, text, text, text) to anon, authenticated;

-- ==========================================================================
-- Public facture portal — read-only: a client can view the invoice and its
-- remaining balance, but never mark it paid themselves. Payment status only
-- ever changes from a real reconciled payment recorded by the org.
-- ==========================================================================
create or replace function public.get_public_facture(p_token uuid, p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_facture public.factures%rowtype;
  v_org record;
  v_items jsonb;
  v_subtotal numeric;
  v_total numeric;
  v_paid numeric;
begin
  select * into v_facture from public.factures where public_token = p_token;
  if not found then
    raise exception 'Lien invalide';
  end if;
  if v_facture.client_email is null or lower(trim(v_facture.client_email)) <> lower(trim(p_email)) then
    raise exception 'Vérification impossible';
  end if;

  select name, phone, street, postal_code, locality, address, ide_number
  into v_org
  from public.organizations where id = v_facture.organization_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'description', description, 'quantity', quantity,
    'unit', unit, 'unit_price', unit_price, 'sort_order', sort_order
  ) order by sort_order), '[]'::jsonb), coalesce(sum(quantity * unit_price), 0)
  into v_items, v_subtotal
  from public.facture_items where facture_id = v_facture.id;

  v_total := round(v_subtotal * (1 + v_facture.vat_rate / 100), 2);

  select coalesce(sum(amount), 0) into v_paid
  from public.facture_payments where facture_id = v_facture.id;

  return jsonb_build_object(
    'facture', jsonb_build_object(
      'id', v_facture.id, 'number', v_facture.number, 'status', v_facture.status,
      'is_deposit', v_facture.is_deposit,
      'client_name', v_facture.client_name, 'client_address', v_facture.client_address,
      'notes', v_facture.notes, 'vat_rate', v_facture.vat_rate,
      'due_date', v_facture.due_date, 'paid_at', v_facture.paid_at, 'created_at', v_facture.created_at
    ),
    'items', v_items,
    'totals', jsonb_build_object('subtotal', v_subtotal, 'vat', round(v_subtotal * v_facture.vat_rate / 100, 2), 'total', v_total),
    'paid', v_paid,
    'remaining', greatest(v_total - v_paid, 0),
    'organization', to_jsonb(v_org)
  );
end;
$$;

grant execute on function public.get_public_facture(uuid, text) to anon, authenticated;
