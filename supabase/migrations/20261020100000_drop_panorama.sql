-- Cantia Panorama (code name relief) is removed: its tables, function,
-- notifications, module and the two notification types.

delete from public.notifications where type in ('relief_ready', 'relief_failed');

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (
  type = any (array[
    'devis_stale_draft', 'devis_expiring_soon', 'facture_overdue', 'recurring_expense_due',
    'extra_work_accepted', 'feed_message', 'devis_accepted', 'join_request_received',
    'payslip_ready', 'devis_bounced', 'devis_viewed', 'fiduciary_access_request',
    'fiduciary_access_update', 'fiduciary_request', 'email_bounced', 'email_replied',
    'facture_viewed'
  ])
) not valid;

drop function if exists public.relief_save_answers(uuid, jsonb);
drop table if exists public.relief_item_progress;
drop table if exists public.relief_worlds;

delete from public.organization_modules where module_id in (select id from public.modules where key = 'relief');
delete from public.modules where key = 'relief';
