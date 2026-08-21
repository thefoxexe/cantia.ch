-- Extends the org-level email-text customization (devis_email_message,
-- facture_email_message, email_signature — already shipped) to the two
-- remaining send paths that were still hardcoded server-side: the facture
-- reminder (two variants, upcoming vs overdue — the wording genuinely
-- differs) and the "travaux supplémentaires" send. Every devis/facture/
-- relance/TS email body is now editable from one place (Compte → E-mails).
alter table public.organizations
  add column extra_work_email_message text,
  add column facture_reminder_message_upcoming text,
  add column facture_reminder_message_overdue text;
