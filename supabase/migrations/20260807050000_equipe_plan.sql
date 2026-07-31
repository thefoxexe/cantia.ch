-- Middle tier between Indépendant (29.-, 1 membre) and Entreprise (89.-, 10
-- membres) — the gap between those two was both a price jump and a member-count
-- jump, so this fills it rather than tweaking either existing plan.
insert into public.plans (id, name, storage_quota_mb, max_members, price_chf_monthly, has_rtk, stripe_price_id) values
  ('equipe', 'Équipe', 25600, 5, 49, true, 'price_1TzBAoD8Ba3GEHSn5gObKMLc')
on conflict (id) do nothing;
