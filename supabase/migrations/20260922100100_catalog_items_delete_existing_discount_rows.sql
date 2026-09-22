-- Retroactive cleanup of the discount-line pollution fixed in
-- 20260922100000_catalog_skip_discounts_and_sync_factures.sql.
delete from public.catalog_items where unit_price < 0;
