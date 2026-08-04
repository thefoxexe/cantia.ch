-- Category breakdown of get_storage_usage_bytes: same storage.objects sum,
-- but bucketed by the top-level path segment each upload path already uses
-- (see lib/api/storage.ts and every uploadToOrgBucket() call site), so the
-- "Stockage" screen can show what's actually eating the quota instead of
-- just one opaque total.
create or replace function public.get_storage_usage_breakdown(org_id uuid)
returns table(category text, bytes bigint)
language sql security definer stable set search_path = public as $$
  select
    case
      when name like org_id::text || '/reports/%/photos/%' then 'photos'
      when name like org_id::text || '/feed/%' then 'photos'
      when name like org_id::text || '/reports/%' then 'rapports'
      when name like org_id::text || '/devis/%' then 'devis_factures'
      when name like org_id::text || '/factures/%' then 'devis_factures'
      when name like org_id::text || '/projects/%/documents/%' then 'documents'
      when name like org_id::text || '/exports/%' then 'exports'
      when name like org_id::text || '/branding/%' then 'marque'
      when name like org_id::text || '/avatars/%' then 'marque'
      else 'autre'
    end as category,
    coalesce(sum((metadata->>'size')::bigint), 0)::bigint as bytes
  from storage.objects
  where bucket_id = 'opus-storage' and name like org_id::text || '/%'
  group by 1;
$$;
