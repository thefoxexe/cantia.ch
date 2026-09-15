-- "Notifier l'employé" button on a validated/payée payslip: reuses the
-- existing notifications system (20260820120000_notifications.sql) rather
-- than a bespoke email — the generic dispatch-notification edge function
-- already sends a title/body/link e-mail with no salary figures in it
-- (respecting the recipient's own email_enabled preference), which is
-- exactly the "secure link, no numbers in plain e-mail" the employee
-- portal needs. Unlike every other type in this table, this one is not
-- trigger-generated: the payroll manager fires it explicitly per payslip,
-- so it's a plain callable RPC instead of an AFTER INSERT/UPDATE trigger.

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'devis_stale_draft', 'devis_expiring_soon', 'facture_overdue',
  'recurring_expense_due', 'extra_work_accepted', 'feed_message', 'devis_accepted',
  'join_request_received', 'payslip_ready'
));

create or replace function public.notify_payslip_ready(p_slip_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slip public.payroll_slips%rowtype;
  v_month_label text;
begin
  select * into v_slip from public.payroll_slips where id = p_slip_id;
  if not found then
    raise exception 'Fiche introuvable';
  end if;
  if not public.can_manage_org_payroll(v_slip.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if v_slip.user_id is null then
    raise exception 'Cet employé n''a pas de compte pour recevoir une notification.';
  end if;
  if v_slip.status not in ('validee', 'payee') then
    raise exception 'Cette fiche doit être validée avant de notifier l''employé.';
  end if;

  v_month_label := (array['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'])[v_slip.month]
    || ' ' || v_slip.year;

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  values (
    v_slip.organization_id, v_slip.user_id, 'payslip_ready',
    'Fiche de salaire disponible — ' || v_month_label,
    'Votre fiche de salaire est prête. Connectez-vous pour la consulter et la télécharger.',
    '/(app)/rh/mes-fiches',
    'payroll_slips', v_slip.id
  )
  on conflict (user_id, type, source_id) do nothing;
end;
$$;

grant execute on function public.notify_payslip_ready(uuid) to authenticated;

notify pgrst, 'reload schema';
