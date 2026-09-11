-- Backfills vat_code/vat_base/vat_amount onto TVA lines of entries posted
-- before this feature existed (the 209 factures + 0 dépenses with VAT
-- from the Lot 1 backfill).
with tva_lines as (
  select l.id as line_id, e.organization_id, e.entry_date, e.id as entry_id
  from public.accounting_entry_lines l
  join public.accounting_entries e on e.id = l.entry_id
  join public.accounting_account_mappings m on m.organization_id = e.organization_id and m.mapping_key = 'tva_collectee'
  where e.source = 'facture_client' and l.account_id = m.account_id and l.vat_code is null and l.credit > 0
),
produits as (
  select l.entry_id, l.credit as ht
  from public.accounting_entry_lines l
  join public.accounting_entries e on e.id = l.entry_id
  join public.accounting_account_mappings m on m.organization_id = e.organization_id and m.mapping_key = 'produits_default'
  where l.account_id = m.account_id
)
update public.accounting_entry_lines l
set vat_code = 'V-NORM', vat_amount = l.credit, vat_base = p.ht
from tva_lines tl
join produits p on p.entry_id = tl.entry_id
where l.id = tl.line_id;

with tva_lines as (
  select l.id as line_id, e.organization_id, e.entry_date, e.id as entry_id
  from public.accounting_entry_lines l
  join public.accounting_entries e on e.id = l.entry_id
  join public.accounting_account_mappings m on m.organization_id = e.organization_id and m.mapping_key = 'tva_prealable'
  where e.source = 'facture_fournisseur' and l.account_id = m.account_id and l.vat_code is null and l.debit > 0
),
achats as (
  select l.entry_id, l.debit as ht
  from public.accounting_entry_lines l
  join public.accounting_entries e on e.id = l.entry_id
  join public.accounting_account_mappings m on m.organization_id = e.organization_id and m.mapping_key = 'achats_materiel'
  where l.account_id = m.account_id
)
update public.accounting_entry_lines l
set vat_code = 'P-MAT', vat_amount = l.debit, vat_base = a.ht
from tva_lines tl
join achats a on a.entry_id = tl.entry_id
where l.id = tl.line_id;
