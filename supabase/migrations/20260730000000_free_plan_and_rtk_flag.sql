alter table public.plans add column has_rtk boolean not null default false;

update public.plans set has_rtk = true where id in ('solo', 'pro', 'entreprise');

insert into public.plans (id, name, storage_quota_mb, max_members, price_chf_monthly, has_rtk) values
  ('free', 'Gratuit', 2048, 1, 0, false)
on conflict (id) do nothing;

alter table public.organizations alter column plan_id set default 'free';
