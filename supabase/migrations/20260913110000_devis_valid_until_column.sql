-- Devis validity was purely a fixed org-level setting (devis_validity_days)
-- computed at PDF-render time from created_at — never stored, never
-- editable per-document. Adding an explicit, optional per-devis override
-- lets the creator pick "valide 20/30/60 jours" or an exact date at
-- creation time; null preserves the old computed-from-org-default behavior
-- for every devis created before this column existed.
alter table public.devis add column if not exists valid_until date;
notify pgrst, 'reload schema';
