-- Bexio sync was already bidirectional for clients (Bexio -> Cantia via the
-- cron pull, Cantia -> Bexio automatically on creation — see
-- lib/api/clients.ts::createClient / bexio-push-client) but NOT for devis
-- and factures: those only had a manual "Envoyer vers Bexio" button, no
-- automatic push on creation, even though the pull direction (invoices
-- created in Bexio, devis/invoice status) was already automatic via the
-- 15-minute cron sweep. This closes that gap the same way clients already
-- work: an AFTER INSERT trigger fires bexio-push-devis / bexio-push-invoice
-- right after a devis/facture is created, for every creation path (the
-- editor screens, the RH "Facturer ce chantier" flow, the voice assistant,
-- convert_devis_to_facture, data import) — a table-level trigger, unlike a
-- client-side fire-and-forget call, needs adding in exactly one place to
-- cover all of them.
--
-- Same dispatch-secret pattern as dispatch_notification_http() (see
-- 20260828140000_dispatch_secret_vault.sql): the secret lives in Vault,
-- never in this migration, and is sent as X-Dispatch-Secret instead of a
-- user JWT — bexio-push-devis/bexio-push-invoice were updated to accept
-- that as an alternative to a logged-in user's Authorization header (see
-- their own diffs), skipping the is_org_admin gate for this system-
-- triggered path (there's no user to check) but never skipping the actual
-- Bexio checks (plan entitlement, connected, needs_reconnect).
--
-- Only fires when the org's own Bexio integration is connected AND
-- auto_sync_enabled — checked here first (cheap early exit for the many
-- orgs without Bexio at all, so this trigger costs nothing for them) and
-- re-checked inside the edge function itself as a second layer.
create or replace function public.dispatch_bexio_push_devis()
returns trigger
language plpgsql security definer set search_path = public, vault as $$
declare
  v_connected boolean;
  v_secret text;
begin
  select true into v_connected
  from public.integrations
  where organization_id = new.organization_id
    and provider = 'bexio'
    and status = 'connected'
    and auto_sync_enabled = true
  limit 1;

  if v_connected is null then
    return new;
  end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'dispatch_secret';

  perform net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/bexio-push-devis',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', coalesce(v_secret, '')
    ),
    body := jsonb_build_object('organization_id', new.organization_id, 'devis_id', new.id),
    timeout_milliseconds := 30000
  );

  return new;
end;
$$;

create or replace function public.dispatch_bexio_push_facture()
returns trigger
language plpgsql security definer set search_path = public, vault as $$
declare
  v_connected boolean;
  v_secret text;
begin
  select true into v_connected
  from public.integrations
  where organization_id = new.organization_id
    and provider = 'bexio'
    and status = 'connected'
    and auto_sync_enabled = true
  limit 1;

  if v_connected is null then
    return new;
  end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'dispatch_secret';

  perform net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/bexio-push-invoice',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', coalesce(v_secret, '')
    ),
    body := jsonb_build_object('organization_id', new.organization_id, 'facture_id', new.id),
    timeout_milliseconds := 30000
  );

  return new;
end;
$$;

drop trigger if exists bexio_push_devis_after_insert on public.devis;
create trigger bexio_push_devis_after_insert
  after insert on public.devis
  for each row
  execute function public.dispatch_bexio_push_devis();

drop trigger if exists bexio_push_facture_after_insert on public.factures;
create trigger bexio_push_facture_after_insert
  after insert on public.factures
  for each row
  execute function public.dispatch_bexio_push_facture();
