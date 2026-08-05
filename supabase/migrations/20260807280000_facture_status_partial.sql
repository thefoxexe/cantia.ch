-- Distinguishes "some money received but not the full amount" from the
-- plain "sent, still waiting" state — the payments ledger already tracked
-- this internally, this just surfaces it as its own status/badge.
alter type public.facture_status add value 'partial' after 'sent';
