-- Portal consultation broke with "violates check constraint
-- notifications_type_check": log_devis_portal_view inserts 'devis_viewed',
-- which was missing from the list. The list now carries every type the
-- database and the functions insert, plus the e-mail hub ones.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'devis_stale_draft', 'devis_expiring_soon', 'facture_overdue',
  'recurring_expense_due', 'extra_work_accepted', 'feed_message', 'devis_accepted',
  'join_request_received', 'payslip_ready', 'devis_bounced', 'devis_viewed',
  'fiduciary_access_request', 'fiduciary_access_update',
  'email_bounced', 'email_replied', 'facture_viewed'
)) not valid;

-- A notification is never allowed to break the client's consultation.
create or replace function public.log_devis_portal_view(p_devis_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_devis record;
  v_count integer;
begin
  select id, organization_id, number, client_name into v_devis from public.devis where id = p_devis_id;
  if not found then
    return;
  end if;
  if exists (
    select 1 from public.devis_events
    where devis_id = p_devis_id and kind = 'portal_viewed' and occurred_at > now() - interval '10 minutes'
  ) then
    return;
  end if;

  insert into public.devis_events (organization_id, devis_id, kind) values (v_devis.organization_id, p_devis_id, 'portal_viewed');

  if not public.org_has_sales_tracking(v_devis.organization_id) then
    return;
  end if;

  select count(*) into v_count from public.devis_events where devis_id = p_devis_id and kind = 'portal_viewed';

  begin
    insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
    select v_devis.organization_id, fm.user_id, 'devis_viewed',
           'Devis consulté — ' || coalesce(v_devis.number, ''),
           coalesce(nullif(v_devis.client_name, ''), 'Le client') || ' a consulté le devis'
             || case when v_count > 1 then ' (' || v_count || 'e fois).' else '.' end,
           '/(app)/devis/' || v_devis.id,
           'devis', v_devis.id
    from public.finance_member_user_ids(v_devis.organization_id) as fm(user_id);
  exception when others then
    null;
  end;
end;
$$;
