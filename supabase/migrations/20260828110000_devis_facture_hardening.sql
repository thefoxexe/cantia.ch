-- Security/correctness audit fix, three issues in the devis→facture path:
--
-- 1. convert_devis_to_facture_internal and convert_extra_work_to_facture_internal
--    were granted EXECUTE directly to `authenticated`, with no org-membership
--    check inside either function — callable via PostgREST RPC by ANY signed-in
--    Cantia user against ANY devis/extra-work id, from a different organization
--    entirely, creating a real facture in a victim org's books. Neither grant
--    was actually needed: the app only ever calls the checked wrappers
--    (convert_devis_to_facture, which verifies is_org_member) or the public
--    accept flows (accept_public_devis / accept_public_extra_work, both
--    security definer and thus able to call the _internal functions without
--    holding their own grant). Revoking these closes the hole with zero
--    behavior change for legitimate callers.
--
-- 2. A devis could be turned into a final (non-deposit) facture twice — a
--    double-click, retry, or two staff members accepting the same devis
--    within the same page load could each pass the only guard that existed
--    (a stale array in the client), producing two full invoices for the
--    same devis. Deposits are intentionally exempt (multiple are allowed).
--
-- 3. accept_public_devis never checked the devis's age against the org's
--    own devis_validity_days, despite that field existing and being printed
--    on the PDF — a client could sign a long-expired quote, locking in
--    stale pricing and auto-generating a facture from it.

revoke execute on function public.convert_devis_to_facture_internal(uuid, integer, numeric) from authenticated, anon, public;
revoke execute on function public.convert_extra_work_to_facture_internal(uuid) from authenticated, anon, public;

-- Hard backstop against a genuine concurrent race (two calls both pass the
-- in-function idempotency check before either INSERT commits) — a partial
-- unique index so the second INSERT fails instead of silently succeeding.
-- The predicate excludes cancelled invoices so re-issuing after a
-- cancellation is still possible.
--
-- If this statement fails on an existing database, it means the bug this
-- migration fixes has already produced duplicate final factures for at
-- least one devis — find them with the query below and resolve each
-- manually (cancel the wrong one, or confirm both are legitimately needed)
-- before re-running this migration; do NOT auto-cancel them here, one of
-- the duplicates may already be sent or paid.
--   select devis_id, array_agg(id) from public.factures
--   where devis_id is not null and not is_deposit and status <> 'cancelled'
--   group by devis_id having count(*) > 1;
create unique index if not exists factures_one_final_per_devis_idx
  on public.factures (devis_id)
  where devis_id is not null and not is_deposit and status <> 'cancelled';

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
  v_validity_days integer;
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

  -- Idempotency: a devis only ever gets one live final (non-deposit)
  -- facture. A repeat call (double-click, retry) just returns it again.
  if p_deposit_percent is null then
    select id into v_facture_id from public.factures
    where devis_id = v_devis.id and not is_deposit and status <> 'cancelled'
    order by created_at
    limit 1;
    if v_facture_id is not null then
      return v_facture_id;
    end if;
  end if;

  begin
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
  exception when unique_violation then
    -- Lost a genuine race against a concurrent call — the other one won,
    -- return its result instead of erroring.
    select id into v_facture_id from public.factures
    where devis_id = v_devis.id and not is_deposit and status <> 'cancelled'
    order by created_at
    limit 1;
    return v_facture_id;
  end;

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
  v_validity_days integer;
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
    select devis_validity_days into v_validity_days
    from public.organizations where id = v_devis.organization_id;

    if v_devis.created_at + make_interval(days => coalesce(v_validity_days, 30)) < now() then
      raise exception 'Ce devis a expiré et ne peut plus être signé en ligne. Contactez l''entreprise pour en obtenir un nouveau.';
    end if;

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
