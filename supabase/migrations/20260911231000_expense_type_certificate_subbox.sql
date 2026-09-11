-- ==========================================================================
-- Case 13 (Spesenvergütung / Indemnités de frais / Indennità per spese) of
-- the official Lohnausweis — six official sub-boxes (13.1.1/13.1.2 =
-- "effectifs", 13.2.1/13.2.2/13.2.3 = "forfaitaires", 13.3 = formation
-- continue). payroll_expenses already logs real per-employee expense
-- entries (see payroll_module.sql / payroll_configurable_types.sql) but
-- nothing ever mapped an expense TYPE to which of these six boxes it
-- belongs on — same gap case 15 had for deductions before today, and the
-- same fix: a per-type box assignment, reviewed explicitly before a real
-- amount can be silently left off (or silently mis-boxed on) an official
-- tax document.
--
-- 13.1.2 and 13.2.3 are catch-all "Übrige/Autres/Altre" lines on the real
-- form and carry their own free-text "Art/Genre/Genere" field next to the
-- amount — certificate_subbox_art is that text, only meaningful for those
-- two sub-boxes.
-- ==========================================================================
alter table public.payroll_expense_types
  add column certificate_subbox text check (certificate_subbox in ('13_1_1', '13_1_2', '13_2_1', '13_2_2', '13_2_3', '13_3')),
  add column certificate_subbox_art text,
  add column certificate_subbox_reviewed boolean not null default false;

notify pgrst, 'reload schema';
