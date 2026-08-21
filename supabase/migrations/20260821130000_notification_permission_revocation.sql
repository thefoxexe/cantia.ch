-- Ferme la fenêtre restante identifiée sur le système de notifications :
-- finance_member_user_ids() cible déjà correctement qui reçoit une
-- notification finance-gated au moment de sa GÉNÉRATION (triggers +
-- generate_scheduled_notifications), mais rien ne nettoyait les
-- notifications déjà en base quand la PERMISSION d'un membre est retirée
-- après coup (rôle rétrogradé, rôle personnalisé dont can_view_finances
-- passe à false). Deux triggers ciblés, plus une correction mineure du
-- ménage périodique pour la désactivation du module trésorerie.

create or replace function public.cleanup_member_finance_notifications()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.finance_member_user_ids(new.organization_id) fm where fm.user_id = new.user_id) then
    delete from public.notifications
    where organization_id = new.organization_id and user_id = new.user_id
      and type in ('devis_stale_draft', 'devis_expiring_soon', 'facture_overdue', 'recurring_expense_due', 'extra_work_accepted');
  end if;
  return new;
end;
$$;

create trigger organization_members_cleanup_notify
after update of role, role_id on public.organization_members
for each row execute function public.cleanup_member_finance_notifications();

create or replace function public.cleanup_role_finance_notifications()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.can_view_finances = false and old.can_view_finances is not false then
    delete from public.notifications n
    where n.type in ('devis_stale_draft', 'devis_expiring_soon', 'facture_overdue', 'recurring_expense_due', 'extra_work_accepted')
      and exists (
        select 1 from public.organization_members m
        where m.role_id = new.id and m.organization_id = n.organization_id and m.user_id = n.user_id
      )
      and not exists (
        select 1 from public.finance_member_user_ids(n.organization_id) fm where fm.user_id = n.user_id
      );
  end if;
  return new;
end;
$$;

create trigger organization_roles_cleanup_notify
after update of can_view_finances on public.organization_roles
for each row execute function public.cleanup_role_finance_notifications();

-- Correctif mineur : le ménage périodique de recurring_expense_due ne
-- revérifiait pas la désactivation du module trésorerie (uniquement la
-- génération le faisait) — une notif déjà créée pouvait donc survivre à la
-- désactivation du module jusqu'au prochain changement d'échéance.
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
  cross join lateral public.finance_member_user_ids(d.organization_id) as fm(user_id)
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
  cross join lateral public.finance_member_user_ids(d.organization_id) as fm(user_id)
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
  cross join lateral public.finance_member_user_ids(f.organization_id) as fm(user_id)
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
