-- Invoices pulled from Bexio before c05f4e3 (2026-09-23) had
-- "Importée automatiquement depuis Bexio." written straight into
-- factures.notes, the same column the PDF prints under "Remarque" — every
-- one of those documents was silently sending that internal sync note to
-- the actual client. The insert path no longer sets it (origin is now
-- shown via the sync-direction badge instead), but existing rows were
-- never backfilled. Exact-match only: a real user-authored remark
-- happening to equal this precise sentence is not a realistic risk.
update public.factures
set notes = null
where notes = 'Importée automatiquement depuis Bexio.';
