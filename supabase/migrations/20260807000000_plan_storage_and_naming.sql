-- Bump paid-plan storage quotas (Indépendant 2 Go -> 10 Go, Entreprise 20 Go -> 50 Go)
-- and rename the top tier from "Pro" to "Entreprise" to match its multi-member
-- positioning (Gratuit / Indépendant / Entreprise).
update public.plans set storage_quota_mb = 10240 where id = 'solo';
update public.plans set storage_quota_mb = 51200, name = 'Entreprise' where id = 'pro';
