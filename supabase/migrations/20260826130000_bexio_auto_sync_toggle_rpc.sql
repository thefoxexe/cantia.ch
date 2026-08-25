-- integrations has no client-facing UPDATE policy (Phase 0 kept it
-- read-only for org admins, writes only via edge functions) — this RPC is
-- the one exception, a narrow security-definer toggle so an org admin can
-- turn the hourly auto-sync on/off from Compte > Intégrations without a
-- round trip through an edge function for a single boolean flip.
create or replace function public.set_bexio_auto_sync(org_id uuid, enabled boolean)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_org_admin(org_id) then
    raise exception 'not authorized';
  end if;
  update public.integrations
  set auto_sync_enabled = enabled
  where organization_id = org_id and provider = 'bexio';
end;
$$;

revoke execute on function public.set_bexio_auto_sync(uuid, boolean) from public, anon;
grant execute on function public.set_bexio_auto_sync(uuid, boolean) to authenticated;

notify pgrst, 'reload schema';
