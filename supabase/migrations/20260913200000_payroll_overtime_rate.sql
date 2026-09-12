-- §7.1 follow-up: "Heures supplémentaires" was a free-typed CHF amount with
-- no link to actual overtime hours. Adds a per-employee CHF/heure rate so
-- the Rubriques UI can take a number of hours and compute the amount,
-- instead of the manager doing that math by hand every time.
alter table public.payroll_profiles add column if not exists overtime_hourly_rate_chf numeric(10, 2);

-- A stable machine key per wage type, independent of its (renameable)
-- display label — needed so the app can reliably recognize "this is the
-- Heures supplémentaires type" without matching on label text. Nullable:
-- only the 5 standard seeded types get one; a custom wage type an org adds
-- itself has no special automation to hook into, so it stays null.
alter table public.payroll_wage_types add column if not exists code text;

update public.payroll_wage_types set code = 'treizieme_salaire' where label = '13e salaire' and code is null;
update public.payroll_wage_types set code = 'heures_sup' where label = 'Heures supplémentaires' and code is null;
update public.payroll_wage_types set code = 'bonus_prime' where label = 'Bonus / prime' and code is null;
update public.payroll_wage_types set code = 'avance_salaire' where label = 'Avance sur salaire' and code is null;
update public.payroll_wage_types set code = 'regularisation_retroactive' where label = 'Régularisation rétroactive' and code is null;

create or replace function public.seed_standard_payroll_wage_types(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.payroll_wage_types (organization_id, label, kind, mode, sort_order, code)
  select p_organization_id, x.label, x.kind, 'manual_entry', x.ord, x.code
  from (
    values
      ('13e salaire', 'addition', 0, 'treizieme_salaire'),
      ('Heures supplémentaires', 'addition', 1, 'heures_sup'),
      ('Bonus / prime', 'addition', 2, 'bonus_prime'),
      ('Avance sur salaire', 'net_adjustment', 3, 'avance_salaire'),
      ('Régularisation rétroactive', 'net_adjustment', 4, 'regularisation_retroactive')
  ) as x(label, kind, ord, code)
  where not exists (
    select 1 from public.payroll_wage_types wt
    where wt.organization_id = p_organization_id and wt.label = x.label
  );
end;
$$;
revoke all on function public.seed_standard_payroll_wage_types(uuid) from public;

notify pgrst, 'reload schema';
