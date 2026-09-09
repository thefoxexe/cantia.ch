-- Widens project_expenses to support the standalone "Dépenses" module: a
-- purchase can now be logged without a chantier (general/overhead expense),
-- not just from inside a chantier's Rentabilité tab. Chantier-linked rows
-- behave exactly as before and still feed that project's profitability —
-- this only relaxes the constraint, it doesn't change any existing row.
alter table public.project_expenses alter column project_id drop not null;
