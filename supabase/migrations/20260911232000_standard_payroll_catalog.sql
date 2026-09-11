-- ==========================================================================
-- Standard Swiss payroll catalog — automatic on signup, restorable on
-- demand for orgs that predate this or deleted their defaults.
--
-- 20260818120000_payroll_configurable_types.sql seeded every THEN-EXISTING
-- org with 6 deduction types + Kilométrage once, as a one-off backfill —
-- any organization created since (no trigger ever existed) got nothing at
-- all, an empty catalog to build from scratch. This closes that gap for
-- good with a real trigger, and fixes the same defaults' certificate box
-- assignment on the way: AVS/AC now read their percentage from
-- swiss_social_insurance_rates (the current year's official rate, see
-- 20260911230000) instead of a value baked into this migration forever,
-- and "Cotisation IJM" — the loss-of-earnings-insurance premium — now maps
-- to case 15 (the "Remarque" box added in the same release), which is
-- where it actually belongs on the real form, rather than being left
-- unmapped like 20260911130000 originally had to leave it (case 15 didn't
-- exist yet at that point).
-- ==========================================================================
create or replace function public.seed_standard_payroll_catalog(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year integer := extract(year from now())::integer;
  v_rates record;
begin
  select * into v_rates from public.swiss_social_insurance_rates where year = v_year;
  if not found then
    -- The current year's row hasn't been added yet (the yearly review
    -- Routine runs every December, ahead of need) — fall back to the
    -- latest known year rather than blocking org creation on it.
    select * into v_rates from public.swiss_social_insurance_rates order by year desc limit 1;
  end if;

  -- Idempotent by label — safe to call again for an org that already has
  -- some or all of these (e.g. re-running the "restaurer" action).
  insert into public.payroll_deduction_types
    (organization_id, label, default_rate_percent, certificate_box, certificate_box_reviewed, sort_order)
  select p_organization_id, x.label, x.rate, x.box, true, x.ord
  from (
    values
      ('Cotisation AVS/AI/APG', coalesce(v_rates.avs_ai_apg_employee_percent, 5.300), 'box9'::text, 0),
      ('Cotisation AC', coalesce(v_rates.ac_employee_percent, 1.100), 'box9', 1),
      -- CAF (allocations familiales) and LAAC (accident complémentaire)
      -- have no dedicated case on the official form and are usually not
      -- itemized there — left unmapped ("Aucune"), matching the judgment
      -- already made in 20260911130000 for pre-existing orgs.
      ('Cotisation CAF', 0.130, null, 2),
      ('Cotisation AANP', 0.890, 'box9', 3),
      ('Cotisation LAAC', 0.243, null, 4),
      ('Cotisation IJM', 0.435, 'box15', 5)
  ) as x(label, rate, box, ord)
  where not exists (
    select 1 from public.payroll_deduction_types dt
    where dt.organization_id = p_organization_id and dt.label = x.label
  );

  insert into public.payroll_expense_types
    (organization_id, label, unit, rate_chf, certificate_subbox, certificate_subbox_reviewed, sort_order)
  select p_organization_id, 'Kilométrage', 'km', 0.70, '13_2_2', true, 0
  where not exists (
    select 1 from public.payroll_expense_types et
    where et.organization_id = p_organization_id and et.label = 'Kilométrage'
  );
end;
$$;
revoke all on function public.seed_standard_payroll_catalog(uuid) from public;

-- Automatic path: every organization created from now on gets the
-- standard catalog immediately, no admin action needed.
create or replace function public.trg_seed_standard_payroll_catalog()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_standard_payroll_catalog(new.id);
  return new;
end;
$$;

create trigger organizations_seed_standard_payroll_catalog
  after insert on public.organizations
  for each row execute function public.trg_seed_standard_payroll_catalog();

-- Manual path: "Ajouter/restaurer les cotisations standards suisses" in
-- Compte -> RH & Salaires, for an org created before this trigger existed
-- or that deleted some/all of its defaults.
create or replace function public.rpc_seed_standard_payroll_catalog(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_manage_org_payroll(p_organization_id) then
    raise exception 'access denied: cannot manage payroll for this organization';
  end if;
  perform public.seed_standard_payroll_catalog(p_organization_id);
end;
$$;
revoke all on function public.rpc_seed_standard_payroll_catalog(uuid) from public;
revoke execute on function public.rpc_seed_standard_payroll_catalog(uuid) from anon;
grant execute on function public.rpc_seed_standard_payroll_catalog(uuid) to authenticated;

-- Corrective backfill: "Cotisation IJM" rows that 20260911130000 left at
-- certificate_box = null (reviewed, but with nowhere to go) now that case
-- 15 exists. Only touches rows still at that exact untouched default —
-- matches by the original seeded label, same targeted approach
-- 20260911130000 itself used.
update public.payroll_deduction_types
set certificate_box = 'box15'
where label = 'Cotisation IJM' and certificate_box is null and certificate_box_reviewed = true;

notify pgrst, 'reload schema';
