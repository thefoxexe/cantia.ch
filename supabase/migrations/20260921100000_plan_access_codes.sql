create table public.plan_access_codes (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null references public.plans(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

alter table public.plan_access_codes enable row level security;
-- No policies granted to anon/authenticated: nobody can read or write this
-- table directly from the client. The only way to use a code is through
-- redeem_plan_code below, which never returns the code itself — just the
-- plan it unlocks, or nothing at all for a wrong/unknown code.

create or replace function public.redeem_plan_code(p_code text)
returns public.plans
language plpgsql security definer stable set search_path = public as $$
declare
  result public.plans;
begin
  select p.* into result
  from public.plan_access_codes c
  join public.plans p on p.id = c.plan_id
  where lower(c.code) = lower(trim(p_code));

  return result;
end;
$$;

revoke all on function public.redeem_plan_code(text) from public;
grant execute on function public.redeem_plan_code(text) to authenticated;

insert into public.plans (
  id, name, storage_quota_mb, max_members, price_chf_monthly, price_chf_yearly,
  is_contact_only, max_devis_factures_per_month,
  has_customization, has_email_sending, has_planning, has_profitability,
  has_payroll, has_treasury, has_bexio_integration, has_document_locale_override,
  stripe_price_id
) values (
  'custom-besson', 'Besson-Peintures Sàrl', 5120, 3, 39.90, null,
  true, null,
  false, false, false, true,
  true, false, true, false,
  null
);

insert into public.plan_access_codes (plan_id, code) values ('custom-besson', 'BESSON2026');
