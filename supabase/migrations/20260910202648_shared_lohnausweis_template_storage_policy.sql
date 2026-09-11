-- The existing org-scoped storage policies cast the first path segment to
-- uuid unconditionally. A shared, non-org-prefixed path (like the one this
-- migration introduces for the Lohnausweis template) would make that cast
-- throw and abort the whole query rather than just failing the check, so
-- every org-scoped policy is guarded with a uuid-shape check first.
create or replace function public.is_uuid_like(v text)
returns boolean language sql immutable as $$
  select v ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
$$;

drop policy if exists "org admins can delete storage objects" on storage.objects;
create policy "org admins can delete storage objects" on storage.objects
  for delete
  using (
    bucket_id = 'opus-storage'
    and public.is_uuid_like((storage.foldername(name))[1])
    and is_org_admin(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "org members can read their storage objects" on storage.objects;
create policy "org members can read their storage objects" on storage.objects
  for select
  using (
    bucket_id = 'opus-storage'
    and public.is_uuid_like((storage.foldername(name))[1])
    and is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "org members can update their storage objects" on storage.objects;
create policy "org members can update their storage objects" on storage.objects
  for update
  using (
    bucket_id = 'opus-storage'
    and public.is_uuid_like((storage.foldername(name))[1])
    and is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "org members can upload storage objects" on storage.objects;
create policy "org members can upload storage objects" on storage.objects
  for insert
  with check (
    bucket_id = 'opus-storage'
    and public.is_uuid_like((storage.foldername(name))[1])
    and is_org_member(((storage.foldername(name))[1])::uuid)
  );

-- The Lohnausweis AcroForm template is shared across every organization
-- (it's the federal form, not tenant data), cached once at this fixed path
-- and read by the edge function via the service-role client (bypasses RLS).
-- Only the platform owner may replace it from the client app.
create policy "platform owner can manage shared pdf templates" on storage.objects
  for all
  using (
    bucket_id = 'opus-storage'
    and name = '_shared/lohnausweis-form11.pdf'
    and auth.jwt() ->> 'email' = 'bastienryser20004@gmail.com'
  )
  with check (
    bucket_id = 'opus-storage'
    and name = '_shared/lohnausweis-form11.pdf'
    and auth.jwt() ->> 'email' = 'bastienryser20004@gmail.com'
  );
