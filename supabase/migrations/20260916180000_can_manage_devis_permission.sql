-- Splits devis/facture creation-and-management out of the "Finance"
-- permission into its own opt-in flag (can_manage_devis), so an owner can
-- let e.g. a chef de chantier create/manage devis, factures, travaux
-- supplémentaires and situations de chantier without also handing them
-- visibility into the company's aggregate financial health. can_view_finances
-- keeps its narrower, stricter meaning going forward: chiffre d'affaires,
-- rentabilité (project_expenses), trésorerie, comptabilité, and the voice
-- assistant's financial Q&A — none of that is touched here.
--
-- Backfilled true wherever can_view_finances is already true, so no
-- existing role/member loses access they have today: can_manage_org_devis()
-- below is is_org_admin() OR can_view_org_finances() OR the new flag, i.e.
-- finance access still implies devis access (the broader permission implies
-- the narrower one), it just isn't required for it anymore.

alter table public.organization_roles
  add column can_manage_devis boolean not null default false;

update public.organization_roles set can_manage_devis = true where can_view_finances;

create or replace function public.can_manage_org_devis(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or public.can_view_org_finances(org_id)
    or exists (
      select 1
      from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_manage_devis
    );
$$;

-- ==========================================================================
-- devis
-- ==========================================================================
drop policy "finance-permitted members can view devis" on public.devis;
drop policy "finance-permitted members can create devis" on public.devis;
drop policy "finance-permitted members can update devis" on public.devis;

create policy "devis-permitted members can view devis" on public.devis
  for select using (public.can_manage_org_devis(organization_id));
create policy "devis-permitted members can create devis" on public.devis
  for insert with check (public.can_manage_org_devis(organization_id));
create policy "devis-permitted members can update devis" on public.devis
  for update using (public.can_manage_org_devis(organization_id));
-- "admins can delete devis" is unchanged (already admin-only).

drop policy "finance-permitted members can view devis items" on public.devis_items;
drop policy "finance-permitted members can manage devis items" on public.devis_items;
drop policy "finance-permitted members can update devis items" on public.devis_items;
drop policy "finance-permitted members can delete devis items" on public.devis_items;

create policy "devis-permitted members can view devis items" on public.devis_items
  for select using (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.can_manage_org_devis(d.organization_id)
  ));
create policy "devis-permitted members can manage devis items" on public.devis_items
  for insert with check (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.can_manage_org_devis(d.organization_id)
  ));
create policy "devis-permitted members can update devis items" on public.devis_items
  for update using (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.can_manage_org_devis(d.organization_id)
  ));
create policy "devis-permitted members can delete devis items" on public.devis_items
  for delete using (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.can_manage_org_devis(d.organization_id)
  ));

drop policy "finance-permitted members can view devis status history" on public.devis_status_history;
create policy "devis-permitted members can view devis status history" on public.devis_status_history
  for select using (exists (
    select 1 from public.devis d where d.id = devis_status_history.devis_id and public.can_manage_org_devis(d.organization_id)
  ));

-- ==========================================================================
-- factures
-- ==========================================================================
drop policy "finance-permitted members can view factures" on public.factures;
drop policy "finance-permitted members can create factures" on public.factures;
drop policy "finance-permitted members can update factures" on public.factures;

create policy "devis-permitted members can view factures" on public.factures
  for select using (public.can_manage_org_devis(organization_id));
create policy "devis-permitted members can create factures" on public.factures
  for insert with check (public.can_manage_org_devis(organization_id));
create policy "devis-permitted members can update factures" on public.factures
  for update using (public.can_manage_org_devis(organization_id));
-- "admins can delete factures" is unchanged (already admin-only).

drop policy "finance-permitted members can view facture items" on public.facture_items;
drop policy "finance-permitted members can manage facture items" on public.facture_items;
drop policy "finance-permitted members can update facture items" on public.facture_items;
drop policy "finance-permitted members can delete facture items" on public.facture_items;

create policy "devis-permitted members can view facture items" on public.facture_items
  for select using (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.can_manage_org_devis(f.organization_id)
  ));
create policy "devis-permitted members can manage facture items" on public.facture_items
  for insert with check (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.can_manage_org_devis(f.organization_id)
  ));
create policy "devis-permitted members can update facture items" on public.facture_items
  for update using (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.can_manage_org_devis(f.organization_id)
  ));
create policy "devis-permitted members can delete facture items" on public.facture_items
  for delete using (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.can_manage_org_devis(f.organization_id)
  ));

drop policy "finance-permitted members can view facture status history" on public.facture_status_history;
create policy "devis-permitted members can view facture status history" on public.facture_status_history
  for select using (exists (
    select 1 from public.factures f where f.id = facture_status_history.facture_id and public.can_manage_org_devis(f.organization_id)
  ));

drop policy "finance-permitted members can view facture payments" on public.facture_payments;
drop policy "finance-permitted members can create facture payments" on public.facture_payments;
drop policy "finance-permitted members can delete facture payments" on public.facture_payments;

create policy "devis-permitted members can view facture payments" on public.facture_payments
  for select using (exists (
    select 1 from public.factures f where f.id = facture_payments.facture_id and public.can_manage_org_devis(f.organization_id)
  ));
create policy "devis-permitted members can create facture payments" on public.facture_payments
  for insert with check (exists (
    select 1 from public.factures f where f.id = facture_payments.facture_id and public.can_manage_org_devis(f.organization_id)
  ));
create policy "devis-permitted members can delete facture payments" on public.facture_payments
  for delete using (exists (
    select 1 from public.factures f where f.id = facture_payments.facture_id and public.can_manage_org_devis(f.organization_id)
  ));

-- ==========================================================================
-- extra_works (travaux supplémentaires) — a devis-like document that
-- converts to a facture, so it follows the same permission.
-- ==========================================================================
drop policy "finance members can view extra works" on public.extra_works;
drop policy "finance members can insert extra works" on public.extra_works;
drop policy "finance members can update extra works" on public.extra_works;

create policy "devis-permitted members can view extra works" on public.extra_works
  for select using (public.can_manage_org_devis(organization_id));
create policy "devis-permitted members can insert extra works" on public.extra_works
  for insert with check (public.can_manage_org_devis(organization_id) and created_by = auth.uid());
create policy "devis-permitted members can update extra works" on public.extra_works
  for update using (public.can_manage_org_devis(organization_id));
-- "admins can delete extra works" is unchanged (already admin-only).

drop policy "finance members can view extra work items" on public.extra_work_items;
drop policy "finance members can insert extra work items" on public.extra_work_items;
drop policy "finance members can update extra work items" on public.extra_work_items;
drop policy "finance members can delete extra work items" on public.extra_work_items;

create policy "devis-permitted members can view extra work items" on public.extra_work_items
  for select using (exists (
    select 1 from public.extra_works w where w.id = extra_work_items.extra_work_id and public.can_manage_org_devis(w.organization_id)
  ));
create policy "devis-permitted members can insert extra work items" on public.extra_work_items
  for insert with check (exists (
    select 1 from public.extra_works w where w.id = extra_work_items.extra_work_id and public.can_manage_org_devis(w.organization_id)
  ));
create policy "devis-permitted members can update extra work items" on public.extra_work_items
  for update using (exists (
    select 1 from public.extra_works w where w.id = extra_work_items.extra_work_id and public.can_manage_org_devis(w.organization_id)
  ));
create policy "devis-permitted members can delete extra work items" on public.extra_work_items
  for delete using (exists (
    select 1 from public.extra_works w where w.id = extra_work_items.extra_work_id and public.can_manage_org_devis(w.organization_id)
  ));

-- ==========================================================================
-- chantier_situations (facturation progressive) — same reasoning.
-- ==========================================================================
drop policy "finance members can view situations" on public.chantier_situations;
drop policy "finance members can insert situations" on public.chantier_situations;
drop policy "finance members can update situations" on public.chantier_situations;

create policy "devis-permitted members can view situations" on public.chantier_situations
  for select using (public.can_manage_org_devis(organization_id));
create policy "devis-permitted members can insert situations" on public.chantier_situations
  for insert with check (public.can_manage_org_devis(organization_id) and created_by = auth.uid());
create policy "devis-permitted members can update situations" on public.chantier_situations
  for update using (public.can_manage_org_devis(organization_id));
-- "admins can delete situations" is unchanged (already admin-only).

drop policy "finance members can view situation items" on public.chantier_situation_items;
drop policy "finance members can insert situation items" on public.chantier_situation_items;
drop policy "finance members can update situation items" on public.chantier_situation_items;
drop policy "finance members can delete situation items" on public.chantier_situation_items;

create policy "devis-permitted members can view situation items" on public.chantier_situation_items
  for select using (exists (
    select 1 from public.chantier_situations s where s.id = chantier_situation_items.situation_id and public.can_manage_org_devis(s.organization_id)
  ));
create policy "devis-permitted members can insert situation items" on public.chantier_situation_items
  for insert with check (exists (
    select 1 from public.chantier_situations s where s.id = chantier_situation_items.situation_id and public.can_manage_org_devis(s.organization_id)
  ));
create policy "devis-permitted members can update situation items" on public.chantier_situation_items
  for update using (exists (
    select 1 from public.chantier_situations s where s.id = chantier_situation_items.situation_id and public.can_manage_org_devis(s.organization_id)
  ));
create policy "devis-permitted members can delete situation items" on public.chantier_situation_items
  for delete using (exists (
    select 1 from public.chantier_situations s where s.id = chantier_situation_items.situation_id and public.can_manage_org_devis(s.organization_id)
  ));

-- ==========================================================================
-- RPCs that had their own explicit can_view_org_finances() check
-- ==========================================================================
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
  if not public.can_manage_org_devis(v_org_id) then
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
  if not public.can_manage_org_devis(v_org_id) then
    raise exception 'Accès refusé';
  end if;
  return public.convert_devis_to_facture_internal(p_devis_id, p_due_days, p_deposit_percent);
end;
$$;

create or replace function public.finalize_chantier_situation(p_situation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_situation public.chantier_situations%rowtype;
  v_facture_id uuid;
  v_item record;
  v_subtotal numeric := 0;
  v_delta_amount numeric;
  v_sort integer := 0;
begin
  select * into v_situation from public.chantier_situations where id = p_situation_id;
  if not found then
    raise exception 'Situation introuvable';
  end if;
  if not public.can_manage_org_devis(v_situation.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if v_situation.status = 'finalized' then
    return v_situation.facture_id;
  end if;

  insert into public.factures (
    organization_id, project_id, devis_id, client_name, client_email, notes,
    vat_rate, due_date, created_by, is_situation, situation_number
  ) values (
    v_situation.organization_id, v_situation.project_id, v_situation.devis_id,
    v_situation.client_name, v_situation.client_email,
    v_situation.title,
    v_situation.vat_rate, current_date + 30, v_situation.created_by, true, v_situation.situation_index
  )
  returning id into v_facture_id;

  for v_item in
    select * from public.chantier_situation_items
    where situation_id = p_situation_id
    order by sort_order
  loop
    if v_item.cumulative_percent > v_item.previous_percent then
      v_delta_amount := round(v_item.contract_quantity * v_item.unit_price * (v_item.cumulative_percent - v_item.previous_percent) / 100, 2);
      v_subtotal := v_subtotal + v_delta_amount;
      insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
      values (
        v_facture_id,
        v_item.description || ' — avancement ' || v_item.previous_percent::text || '% -> ' || v_item.cumulative_percent::text || '%',
        v_item.cumulative_percent - v_item.previous_percent,
        '%',
        round(v_item.contract_quantity * v_item.unit_price / 100, 4),
        v_sort
      );
      v_sort := v_sort + 1;
    end if;
  end loop;

  if v_situation.retenue_garantie_percent > 0 and v_subtotal > 0 then
    insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
    values (
      v_facture_id,
      'Retenue de garantie (' || v_situation.retenue_garantie_percent::text || '%)',
      1,
      'forfait',
      -round(v_subtotal * v_situation.retenue_garantie_percent / 100, 2),
      v_sort
    );
  end if;

  update public.chantier_situations
  set status = 'finalized', facture_id = v_facture_id
  where id = p_situation_id;

  return v_facture_id;
end;
$$;

create or replace function public.accept_extra_work_live(p_extra_work_id uuid, p_signer_name text, p_signature_data text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_work public.extra_works%rowtype;
begin
  select * into v_work from public.extra_works where id = p_extra_work_id;
  if not found then
    raise exception 'Travaux supplémentaires introuvables';
  end if;
  if not public.can_manage_org_devis(v_work.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if trim(coalesce(p_signer_name, '')) = '' then
    raise exception 'Le nom du signataire est requis';
  end if;
  if trim(coalesce(p_signature_data, '')) = '' then
    raise exception 'Une signature est requise';
  end if;
  if v_work.status = 'refused' then
    raise exception 'Ces travaux supplémentaires ont été refusés et ne peuvent plus être acceptés';
  end if;

  if v_work.status <> 'accepted' then
    update public.extra_works
    set status = 'accepted',
        client_signed_at = now(),
        client_signer_name = p_signer_name,
        client_signature_data = p_signature_data
    where id = v_work.id;

    perform public.convert_extra_work_to_facture_internal(v_work.id);
  end if;

  select * into v_work from public.extra_works where id = v_work.id;
  return jsonb_build_object('status', v_work.status, 'client_signed_at', v_work.client_signed_at);
end;
$$;

-- ==========================================================================
-- Default role seeding: "Administration" (full access) now also grants the
-- new permission explicitly; "Employé" stays without it, same as finance.
-- ==========================================================================
create or replace function public.seed_default_org_roles()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.organization_roles (
    organization_id, name, color,
    can_view_finances, can_view_survey, can_view_metre, can_view_planning,
    can_view_documents, can_view_subcontractors, can_create_projects, can_manage_payroll,
    can_manage_devis
  ) values
    (new.id, 'Administration', '#BC5A31', true, true, true, true, true, true, true, true, true),
    (new.id, 'Employé', '#2E6B4F', false, true, true, true, true, false, false, false, false)
  on conflict (organization_id, name) do nothing;
  return new;
end;
$$;

-- ==========================================================================
-- Notifications: devis_stale_draft / devis_expiring_soon / facture_overdue /
-- extra_work_accepted are about devis/facture lifecycle, not aggregate
-- finance — they should target whoever can manage devis now, not just
-- whoever can view finances. recurring_expense_due stays finance-only
-- (trésorerie).
-- ==========================================================================
create or replace function public.devis_member_user_ids(org_id uuid)
returns setof uuid
language sql
stable security definer
set search_path to 'public'
as $$
  select m.user_id from public.organization_members m
  where m.organization_id = org_id and m.role in ('owner', 'admin')
  union
  select m.user_id from public.organization_members m
  join public.organization_roles r on r.id = m.role_id
  where m.organization_id = org_id and (r.can_manage_devis or r.can_view_finances);
$$;

create or replace function public.notify_extra_work_accepted()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
    select new.organization_id, fm.user_id, 'extra_work_accepted',
           'Travaux supplémentaires accepté — ' || coalesce(new.number, ''),
           new.title,
           '/(app)/chantiers/' || new.project_id || '/travaux-supplementaires/' || new.id,
           'extra_works', new.id
    from public.devis_member_user_ids(new.organization_id) as fm(user_id)
    where public.notif_in_app_enabled(fm.user_id, 'extra_work_accepted')
    on conflict (user_id, type, source_id) do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.generate_scheduled_notifications()
returns void
language plpgsql security definer set search_path = public as $$
begin
  -- devis_stale_draft : brouillon depuis plus de 5 jours.
  delete from public.notifications n
  where n.type = 'devis_stale_draft'
    and not exists (
      select 1 from public.devis d
      where d.id = n.source_id and d.status = 'draft' and d.created_at < now() - interval '5 days'
    );

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select d.organization_id, fm.user_id, 'devis_stale_draft',
         'Devis en attente — ' || coalesce(d.number, ''),
         'Ce devis est en brouillon depuis plusieurs jours et n''a pas encore été envoyé.',
         '/(app)/devis/' || d.id,
         'devis', d.id
  from public.devis d
  cross join lateral public.devis_member_user_ids(d.organization_id) as fm(user_id)
  where d.status = 'draft' and d.created_at < now() - interval '5 days'
    and public.notif_in_app_enabled(fm.user_id, 'devis_stale_draft')
  on conflict (user_id, type, source_id) do nothing;

  -- devis_expiring_soon : envoyé, fenêtre de validité qui se termine dans les 3 jours.
  delete from public.notifications n
  where n.type = 'devis_expiring_soon'
    and not exists (
      select 1 from public.devis d
      join public.organizations o on o.id = d.organization_id
      where d.id = n.source_id and d.status = 'sent'
        and d.created_at + make_interval(days => o.devis_validity_days) between now() and now() + interval '3 days'
    );

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select d.organization_id, fm.user_id, 'devis_expiring_soon',
         'Devis bientôt échu — ' || coalesce(d.number, ''),
         'Ce devis arrive à échéance de validité, relancez le client si besoin.',
         '/(app)/devis/' || d.id,
         'devis', d.id
  from public.devis d
  join public.organizations o on o.id = d.organization_id
  cross join lateral public.devis_member_user_ids(d.organization_id) as fm(user_id)
  where d.status = 'sent'
    and d.created_at + make_interval(days => o.devis_validity_days) between now() and now() + interval '3 days'
    and public.notif_in_app_enabled(fm.user_id, 'devis_expiring_soon')
  on conflict (user_id, type, source_id) do nothing;

  -- facture_overdue : envoyée/partielle, échéance dépassée.
  delete from public.notifications n
  where n.type = 'facture_overdue'
    and not exists (
      select 1 from public.factures f
      where f.id = n.source_id and f.status in ('sent', 'partial') and f.due_date < current_date
    );

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select f.organization_id, fm.user_id, 'facture_overdue',
         'Facture en retard — ' || coalesce(f.number, ''),
         'Échéance dépassée le ' || to_char(f.due_date, 'DD.MM.YYYY') || ', pensez à relancer.',
         '/(app)/devis/factures/' || f.id,
         'factures', f.id
  from public.factures f
  cross join lateral public.devis_member_user_ids(f.organization_id) as fm(user_id)
  where f.status in ('sent', 'partial') and f.due_date < current_date
    and public.notif_in_app_enabled(fm.user_id, 'facture_overdue')
  on conflict (user_id, type, source_id) do nothing;

  -- recurring_expense_due : dépense active dont l'échéance approche, uniquement si la trésorerie est activée.
  delete from public.notifications n
  where n.type = 'recurring_expense_due'
    and not exists (
      select 1 from public.recurring_expenses e
      join public.organizations o on o.id = e.organization_id
      where e.id = n.source_id and e.active
        and e.next_due_date between current_date and current_date + e.reminder_days_before
        and o.enabled_modules @> array['treasury']
    );

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select e.organization_id, fm.user_id, 'recurring_expense_due',
         'Dépense récurrente à venir — ' || e.label,
         'CHF ' || e.amount_chf::text || ' prévu le ' || to_char(e.next_due_date, 'DD.MM.YYYY') || '.',
         '/(app)/tresorerie',
         'recurring_expenses', e.id
  from public.recurring_expenses e
  join public.organizations o on o.id = e.organization_id
  cross join lateral public.finance_member_user_ids(e.organization_id) as fm(user_id)
  where e.active
    and e.next_due_date between current_date and current_date + e.reminder_days_before
    and o.enabled_modules @> array['treasury']
    and public.notif_in_app_enabled(fm.user_id, 'recurring_expense_due')
  on conflict (user_id, type, source_id) do nothing;

  -- Ménage : les notifications lues s'effacent après 30 jours, les non lues après 90.
  delete from public.notifications where read_at is not null and read_at < now() - interval '30 days';
  delete from public.notifications where read_at is null and created_at < now() - interval '90 days';
end;
$$;

-- Revocation cleanup (mirrors 20260821130000_notification_permission_revocation.sql,
-- now split between the devis-type notifications and the finance-only one).
create or replace function public.cleanup_member_finance_notifications()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.devis_member_user_ids(new.organization_id) fm where fm.user_id = new.user_id) then
    delete from public.notifications
    where organization_id = new.organization_id and user_id = new.user_id
      and type in ('devis_stale_draft', 'devis_expiring_soon', 'facture_overdue', 'extra_work_accepted');
  end if;
  if not exists (select 1 from public.finance_member_user_ids(new.organization_id) fm where fm.user_id = new.user_id) then
    delete from public.notifications
    where organization_id = new.organization_id and user_id = new.user_id
      and type = 'recurring_expense_due';
  end if;
  return new;
end;
$$;

create or replace function public.cleanup_role_finance_notifications()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.notifications n
  where n.type in ('devis_stale_draft', 'devis_expiring_soon', 'facture_overdue', 'extra_work_accepted')
    and exists (
      select 1 from public.organization_members m
      where m.role_id = new.id and m.organization_id = n.organization_id and m.user_id = n.user_id
    )
    and not exists (
      select 1 from public.devis_member_user_ids(n.organization_id) fm where fm.user_id = n.user_id
    );

  delete from public.notifications n
  where n.type = 'recurring_expense_due'
    and exists (
      select 1 from public.organization_members m
      where m.role_id = new.id and m.organization_id = n.organization_id and m.user_id = n.user_id
    )
    and not exists (
      select 1 from public.finance_member_user_ids(n.organization_id) fm where fm.user_id = n.user_id
    );

  return new;
end;
$$;

drop trigger if exists organization_roles_cleanup_notify on public.organization_roles;
create trigger organization_roles_cleanup_notify
after update of can_view_finances, can_manage_devis on public.organization_roles
for each row execute function public.cleanup_role_finance_notifications();
