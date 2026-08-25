-- Needed for incremental sync bookkeeping (cahier des charges section 59) —
-- Phase 0's integration_mappings table had last_synced_at/last_local_hash/
-- last_remote_hash but not the remote record's own updated_at, which the
-- contacts sync writes on every pull.
alter table public.integration_mappings add column external_updated_at timestamptz;

notify pgrst, 'reload schema';
