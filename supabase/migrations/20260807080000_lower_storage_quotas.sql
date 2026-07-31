-- Storage is photos + PDFs only (no video), so the original quotas were far
-- more generous than real usage needs — this cuts each plan roughly 4-5x to
-- keep Supabase storage cost in line with what customers actually pay.
update public.plans set storage_quota_mb = 500 where id = 'free';
update public.plans set storage_quota_mb = 3072 where id = 'solo';
update public.plans set storage_quota_mb = 8192 where id = 'equipe';
update public.plans set storage_quota_mb = 20480 where id = 'pro';
