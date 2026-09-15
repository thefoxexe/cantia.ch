-- Replaces the previous in-app "Mes fiches de salaire" + notification-bell
-- approach for the employee payslip flow (explicit user feedback: not every
-- employee uses the app at all — some are fixed-salary and never log in —
-- so an in-app self-service screen and an in-app notification can never
-- reach them). The real mechanism is now the same two-factor public portal
-- already used for devis/factures (public_document_verifications +
-- verify_public_document_code, both already fully generic), applied to
-- payroll_profiles: a per-employee public_token, a personal_email the
-- payroll manager sets (deliberately separate from any app login email —
-- ghost employees have no login at all), and a portal reachable at
-- /salaire-employe/[token] that any employee can open regardless of
-- whether they otherwise use Cantia.

alter table public.payroll_profiles add column if not exists personal_email text;
alter table public.payroll_profiles add column if not exists public_token uuid not null default gen_random_uuid();
create unique index if not exists payroll_profiles_public_token_idx on public.payroll_profiles (public_token);

-- Tear down the notification-bell approach from the previous pass — the
-- payslip_ready type, its RPC, and dispatch-notification's email-default
-- override are no longer used by anything (the "Notifier" button in
-- Fiches de salaire is replaced by a real "Envoyer par e-mail" action that
-- calls the new send-payslip-email edge function instead of this RPC).
drop function if exists public.notify_payslip_ready(uuid);
delete from public.notifications where type = 'payslip_ready';
alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'devis_stale_draft', 'devis_expiring_soon', 'facture_overdue',
  'recurring_expense_due', 'extra_work_accepted', 'feed_message', 'devis_accepted',
  'join_request_received'
));

notify pgrst, 'reload schema';
