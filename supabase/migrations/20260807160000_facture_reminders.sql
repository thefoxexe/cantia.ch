-- Tracks when a payment reminder was last sent for a facture, so the
-- billing dashboard can show "relancée le ..." instead of just letting the
-- user re-send blindly with no memory of the last attempt.
alter table public.factures add column if not exists last_reminded_at timestamptz;
