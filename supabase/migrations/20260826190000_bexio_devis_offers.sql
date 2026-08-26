-- Devis <-> Bexio "Offre" (kb_offer) linkage, per the client's own Bexio
-- kb_offer API cahier des charges. Informational/display columns only —
-- the mapping itself (local_id <-> external_id) lives in the existing
-- integration_mappings table (entity_type='devis'), same pattern as
-- factures. kb_item_status_id is stored raw and never translated into a
-- Cantia devis.status: the cahier des charges explicitly warns against
-- inventing a full status-code correspondence table from guesses, so the
-- Bexio status is shown as-is rather than mapped.
alter table public.devis
  add column bexio_document_nr text,
  add column bexio_status_id integer,
  add column bexio_network_link text;
