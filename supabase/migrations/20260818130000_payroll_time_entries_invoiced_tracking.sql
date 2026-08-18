-- Tracks which logged hours have already been turned into a facture, so
-- "Facturer ce chantier" in the RH cockpit stops offering the same hours a
-- second time once they've been billed (previously nothing prevented
-- double-invoicing the same worked hours).
alter table public.payroll_time_entries
  add column invoiced_facture_id uuid references public.factures(id) on delete set null;

create index on public.payroll_time_entries (invoiced_facture_id);
