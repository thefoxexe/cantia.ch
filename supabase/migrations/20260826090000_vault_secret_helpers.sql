-- Thin wrappers around Supabase Vault so edge functions (service role) can
-- create/read/update encrypted secrets through PostgREST without the
-- `vault` schema itself being exposed. Execute is granted to service_role
-- only — anon/authenticated can never call these, since they return or
-- accept plaintext OAuth tokens.

create or replace function public.vault_create_secret(secret text, secret_name text default null)
returns uuid
language sql
security definer
set search_path = public, vault
as $$
  select vault.create_secret(secret, secret_name);
$$;

create or replace function public.vault_update_secret(secret_id uuid, new_secret text)
returns void
language sql
security definer
set search_path = public, vault
as $$
  select vault.update_secret(secret_id, new_secret);
$$;

create or replace function public.vault_read_secret(secret_id uuid)
returns text
language sql
security definer
set search_path = public, vault
as $$
  select decrypted_secret from vault.decrypted_secrets where id = secret_id;
$$;

revoke execute on function public.vault_create_secret(text, text) from public, anon, authenticated;
revoke execute on function public.vault_update_secret(uuid, text) from public, anon, authenticated;
revoke execute on function public.vault_read_secret(uuid) from public, anon, authenticated;
grant execute on function public.vault_create_secret(text, text) to service_role;
grant execute on function public.vault_update_secret(uuid, text) to service_role;
grant execute on function public.vault_read_secret(uuid) to service_role;

notify pgrst, 'reload schema';
