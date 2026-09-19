-- Mirrors the devis 'draft' -> 'ready' -> 'sent' flow: "Finaliser" on a
-- facture used to jump straight from 'draft' to 'sent', so a facture could
-- show as "Envoyé" without ever actually being emailed to the client.
-- 'ready' now sits between them; only a successful send (or a manual
-- payment/cancel action) advances it further.
alter type public.facture_status add value 'ready' before 'sent';
