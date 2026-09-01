-- Real usage right now is ~2 MB/org average (62 MB across 27 orgs) — the
-- 10/50/200 Go quotas set in 20260901000000 were arbitrarily large numbers
-- that no customer will ever approach, which reads as unconsidered rather
-- than generous. Lowered to values that are still ~1000x+ current usage
-- per org, but plausible.
update public.plans set storage_quota_mb = 5120 where id = 'solo';
update public.plans set storage_quota_mb = 15360 where id = 'equipe';
update public.plans set storage_quota_mb = 40960 where id = 'pro';
