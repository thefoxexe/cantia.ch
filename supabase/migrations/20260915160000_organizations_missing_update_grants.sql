-- organizations uses column-level GRANTs rather than a blanket table GRANT,
-- and several columns that legitimate client-side settings screens write to
-- were never actually granted UPDATE for `authenticated` — every save
-- touching any of them has been failing with 403 (insufficient_privilege)
-- since RLS is satisfied but Postgres column privileges still block it in
-- the same statement. Confirmed via information_schema against every
-- `.update({...})` call on organizations in the app: Entreprise (address +
-- IBAN), Apparence (branding), Emails (message templates), Devis settings
-- (hourly_cost), and the new post-payment onboarding wizard.
grant update (
  street, postal_code, locality, iban,
  brand_color, logo_placement, footer_text,
  devis_email_message, facture_email_message, extra_work_email_message,
  facture_reminder_message_upcoming, facture_reminder_message_overdue, email_signature,
  hourly_cost,
  onboarding_completed
) on public.organizations to authenticated, anon;
