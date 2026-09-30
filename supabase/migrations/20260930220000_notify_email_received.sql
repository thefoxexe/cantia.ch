-- A client (or anyone) writes to the company's Cantia address: everyone
-- who follows the money (finance_member_user_ids: owners, admins, roles
-- with can_view_finances) gets a notification (in-app + push, through
-- notifications_dispatch), unless they muted "E-mail reçu". The member
-- who forwarded it to the mailbox is not notified of their own e-mail.
create or replace function public.notify_sales_email_received()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_who text;
  v_doc text;
begin
  if new.direction <> 'incoming' then
    return new;
  end if;
  v_who := coalesce(nullif(trim(new.from_name), ''), new.counterpart_email, new.from_email, 'Un client');
  select coalesce(
    (select 'Devis ' || d.number from public.devis d where d.id = new.devis_id),
    (select 'Facture ' || f.number from public.factures f where f.id = new.facture_id)
  ) into v_doc;
  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select new.organization_id, u.id, 'email_replied',
         'Nouvel e-mail — ' || left(v_who, 80),
         left(coalesce(nullif(new.subject, ''), '(sans objet)') || coalesce(' · ' || v_doc, ''), 200),
         '/(app)/emails?r=' || new.id,
         'sales_emails', new.id
  from public.finance_member_user_ids(new.organization_id) as u(id)
  where u.id is distinct from new.member_user_id
    and public.notif_in_app_enabled(u.id, 'email_replied');
  return new;
exception when others then
  -- A notification never blocks filing the e-mail.
  return new;
end;
$$;
revoke execute on function public.notify_sales_email_received() from public, anon, authenticated;

drop trigger if exists sales_emails_notify_received on public.sales_emails;
create trigger sales_emails_notify_received
  after insert on public.sales_emails
  for each row execute function public.notify_sales_email_received();
