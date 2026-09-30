-- Where clients' replies to devis / factures go (App › E-mails › Réglages):
--   'both'  : filed in the Cantia mailbox and forwarded to the company address
--   'app'   : filed in the Cantia mailbox only
--   'email' : straight to the company address (Reply-To is that address;
--             nothing goes through Cantia)
-- reply_to_copy stays in sync (true unless 'email'): the senders read it
-- (supabase/functions/_shared/sales-inbox.ts). resend-webhook/inbound.ts
-- skips the forward only for 'app', and only while the mailbox really files
-- the reply (enabled + plan), so a reply is never lost.

alter table public.sales_email_settings
  add column if not exists reply_delivery text not null default 'both'
    check (reply_delivery in ('both', 'app', 'email'));

update public.sales_email_settings set reply_delivery = 'email' where reply_to_copy = false;
