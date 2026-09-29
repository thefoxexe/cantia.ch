-- Replies to a facture email (Reply-To copy, see
-- supabase/functions/_shared/sales-inbox.ts) are filed on the facture.
alter table public.sales_emails
  add column if not exists facture_id uuid references public.factures(id) on delete set null;

create index if not exists sales_emails_facture_idx on public.sales_emails (facture_id) where facture_id is not null;

-- The single "Suivre les réponses" switch drives both flags; keep existing
-- rows consistent with it.
update public.sales_email_settings set reply_to_copy = enabled where reply_to_copy is distinct from enabled;
