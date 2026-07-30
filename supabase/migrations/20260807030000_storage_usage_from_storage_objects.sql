-- get_storage_usage_bytes only summed public.files (the Documents module),
-- so report/devis PDFs, feed photos, voice messages, and branding assets
-- never counted against a plan's storage quota even though they live in
-- the same bucket and cost the same storage. Every upload path in the app
-- writes under `${organization_id}/...` in the opus-storage bucket, so
-- summing storage.objects by that prefix is the one place that actually
-- captures everything, instead of relying on every table that stores a
-- path to also correctly track its own size_bytes.
create or replace function public.get_storage_usage_bytes(org_id uuid)
returns bigint
language sql security definer stable set search_path = public as $$
  select coalesce(sum((metadata->>'size')::bigint), 0)::bigint
  from storage.objects
  where bucket_id = 'opus-storage' and name like org_id::text || '/%';
$$;
