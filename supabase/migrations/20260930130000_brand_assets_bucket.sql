-- Public bucket for brand assets used outside the web app, first of all the
-- logo at the top of every transactional e-mail. Gmail does not display
-- images embedded as data: URIs, so e-mails link a hosted PNG instead; a
-- Supabase public object has a stable URL and a correct image/png type.
-- Read-only for everyone: only the service role writes to it.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('brand', 'brand', true, 1048576, array['image/png', 'image/svg+xml', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
