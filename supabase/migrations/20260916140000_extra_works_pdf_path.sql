-- Travaux supplémentaires finally get a real downloadable/attachable PDF
-- (generate-extra-work-pdf) — same pdf_path column pattern already used by
-- devis/factures/reports.
alter table public.extra_works add column pdf_path text;
