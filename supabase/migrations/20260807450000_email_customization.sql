-- Per-org default message text for devis/facture emails, plus an optional
-- plain-text signature — editable in Compte → Entreprise, pre-filled (and
-- further editable) at send time. Kept as plain text rather than rich HTML:
-- it's rendered into the email by escaping it and converting newlines to
-- <br>, so there's no stored-HTML injection surface to worry about.
alter table public.organizations
  add column devis_email_message text,
  add column facture_email_message text,
  add column email_signature text;
