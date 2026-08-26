-- vault.create_secret() requires a unique secret_name, but the OAuth
-- callback's "no existing credentials row" branch always calls it with a
-- name derived only from the integration id (bexio_access_<id>,
-- bexio_refresh_<id>) — stable across a disconnect/reconnect because the
-- integrations row (and its id) survives disconnect. bexio-disconnect
-- overwrites the secret value in place rather than deleting it (Vault has
-- no public delete function) and only removes the integration_credentials
-- row, so a reconnect after any disconnect hit a duplicate-name error on
-- vault_create_secret every time — silently, since the edge function never
-- checked that RPC's error before inserting into integration_credentials,
-- leaving an integration stuck showing "connected" for a few milliseconds
-- (until the callback's own best-effort sync calls found no credentials
-- and flipped it to 'error') and then no valid Bexio connection at all.
-- This makes secret storage idempotent by name: update in place if a
-- secret with that name already exists, create it otherwise.
create or replace function public.vault_upsert_secret(secret_name text, secret text)
returns uuid
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  existing_id uuid;
begin
  select id into existing_id from vault.secrets where name = secret_name;
  if existing_id is not null then
    perform vault.update_secret(existing_id, secret);
    return existing_id;
  else
    return vault.create_secret(secret, secret_name);
  end if;
end;
$$;
