-- A cover photo per chantier, shown as a thumbnail in the chantiers list —
-- same storage-bucket-path convention as organization_members.avatar_url
-- (a path into the shared org bucket, resolved to a signed URL client-side
-- via lib/api/storage.ts), not a public URL column.
alter table public.projects add column cover_photo_url text;
