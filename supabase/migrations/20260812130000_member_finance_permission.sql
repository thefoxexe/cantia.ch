-- Standard members ('member' role) previously had the exact same read/write
-- access to devis/factures as admins — the only difference was delete
-- rights. The owner can now grant a specific member visibility into
-- devis/factures via this per-member flag, instead of promoting them to
-- admin (which would also hand them member management and org settings
-- they may not need). Default false: a brand new member sees neither by
-- default, matching "un membre standard ne doit pas voir les devis et
-- factures" — the owner opts members in individually from the équipe screen.
alter table public.organization_members
  add column can_view_finances boolean not null default false;

-- Owner/admin rows are already granted access via is_org_admin() below
-- regardless of this flag — backfilling it true for them is purely cosmetic
-- (so the équipe screen doesn't show a misleading "off" toggle for admins).
update public.organization_members set can_view_finances = true where role in ('owner', 'admin');

create or replace function public.can_view_org_finances(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = org_id and m.user_id = auth.uid() and m.can_view_finances
    );
$$;

-- ==========================================================================
-- devis
-- ==========================================================================
drop policy "members can view devis" on public.devis;
drop policy "members can create devis" on public.devis;
drop policy "members can update devis" on public.devis;

create policy "finance-permitted members can view devis" on public.devis
  for select using (public.can_view_org_finances(organization_id));
create policy "finance-permitted members can create devis" on public.devis
  for insert with check (public.can_view_org_finances(organization_id));
create policy "finance-permitted members can update devis" on public.devis
  for update using (public.can_view_org_finances(organization_id));
-- "admins can delete devis" is unchanged (already admin-only).

drop policy "members can view devis items" on public.devis_items;
drop policy "members can manage devis items" on public.devis_items;
drop policy "members can update devis items" on public.devis_items;
drop policy "members can delete devis items" on public.devis_items;

create policy "finance-permitted members can view devis items" on public.devis_items
  for select using (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.can_view_org_finances(d.organization_id)
  ));
create policy "finance-permitted members can manage devis items" on public.devis_items
  for insert with check (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.can_view_org_finances(d.organization_id)
  ));
create policy "finance-permitted members can update devis items" on public.devis_items
  for update using (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.can_view_org_finances(d.organization_id)
  ));
create policy "finance-permitted members can delete devis items" on public.devis_items
  for delete using (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.can_view_org_finances(d.organization_id)
  ));

drop policy "members can view devis status history" on public.devis_status_history;
create policy "finance-permitted members can view devis status history" on public.devis_status_history
  for select using (exists (
    select 1 from public.devis d where d.id = devis_status_history.devis_id and public.can_view_org_finances(d.organization_id)
  ));

-- ==========================================================================
-- factures
-- ==========================================================================
drop policy "members can view factures" on public.factures;
drop policy "members can create factures" on public.factures;
drop policy "members can update factures" on public.factures;

create policy "finance-permitted members can view factures" on public.factures
  for select using (public.can_view_org_finances(organization_id));
create policy "finance-permitted members can create factures" on public.factures
  for insert with check (public.can_view_org_finances(organization_id));
create policy "finance-permitted members can update factures" on public.factures
  for update using (public.can_view_org_finances(organization_id));
-- "admins can delete factures" is unchanged (already admin-only).

drop policy "members can view facture items" on public.facture_items;
drop policy "members can manage facture items" on public.facture_items;
drop policy "members can update facture items" on public.facture_items;
drop policy "members can delete facture items" on public.facture_items;

create policy "finance-permitted members can view facture items" on public.facture_items
  for select using (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.can_view_org_finances(f.organization_id)
  ));
create policy "finance-permitted members can manage facture items" on public.facture_items
  for insert with check (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.can_view_org_finances(f.organization_id)
  ));
create policy "finance-permitted members can update facture items" on public.facture_items
  for update using (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.can_view_org_finances(f.organization_id)
  ));
create policy "finance-permitted members can delete facture items" on public.facture_items
  for delete using (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.can_view_org_finances(f.organization_id)
  ));

drop policy "members can view facture status history" on public.facture_status_history;
create policy "finance-permitted members can view facture status history" on public.facture_status_history
  for select using (exists (
    select 1 from public.factures f where f.id = facture_status_history.facture_id and public.can_view_org_finances(f.organization_id)
  ));

drop policy "members can view facture payments" on public.facture_payments;
drop policy "members can create facture payments" on public.facture_payments;
drop policy "members can delete facture payments" on public.facture_payments;

create policy "finance-permitted members can view facture payments" on public.facture_payments
  for select using (exists (
    select 1 from public.factures f where f.id = facture_payments.facture_id and public.can_view_org_finances(f.organization_id)
  ));
create policy "finance-permitted members can create facture payments" on public.facture_payments
  for insert with check (exists (
    select 1 from public.factures f where f.id = facture_payments.facture_id and public.can_view_org_finances(f.organization_id)
  ));
create policy "finance-permitted members can delete facture payments" on public.facture_payments
  for delete using (exists (
    select 1 from public.factures f where f.id = facture_payments.facture_id and public.can_view_org_finances(f.organization_id)
  ));

-- Two RPCs still checked plain org membership before this permission
-- existed — tighten both to match the policies above, since converting a
-- devis to a facture (and recomputing its deposit deduction) is itself a
-- finance write. Both are the actual currently-active definitions: the
-- authenticated convert_devis_to_facture(uuid, integer, numeric) wrapper
-- added in 20260807410000_public_client_portal.sql (it delegates the real
-- work to convert_devis_to_facture_internal, which has no permission check
-- of its own and is intentionally left untouched — it's also called from
-- the public client-portal accept flow, gated by its own token+email check
-- instead), and recompute_facture_deposit_deduction from
-- 20260807320000_recompute_facture_deposit_deduction.sql. The earlier
-- convert_devis_to_facture(uuid, integer) 2-argument overload from
-- 20260807140000_factures.sql is dead code (no caller passes only 2 args
-- since p_deposit_percent was introduced) and is left as-is.
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
  if not public.can_view_org_finances(v_org_id) then
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
  if not public.can_view_org_finances(v_org_id) then
    raise exception 'Accès refusé';
  end if;
  return public.convert_devis_to_facture_internal(p_devis_id, p_due_days, p_deposit_percent);
end;
$$;
