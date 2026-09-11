-- The partial unique indexes from the previous migration can't back a
-- plain "ON CONFLICT (columns) DO UPDATE" upsert (Postgres only infers a
-- partial index when the ON CONFLICT clause repeats its exact WHERE
-- predicate, which PostgREST's upsert() never does). A generated
-- owner_key column — coalesce(user_id, ghost_employee_id), always
-- non-null thanks to the xor check — gives a normal, full unique
-- constraint back, so upsertPayrollProfile/upsertProfileDeduction can use
-- one onConflict target regardless of which kind of employee it is.
drop index public.payroll_profile_deductions_user_unique;
drop index public.payroll_profile_deductions_ghost_unique;

alter table public.payroll_profiles add column owner_key uuid generated always as (coalesce(user_id, ghost_employee_id)) stored;
alter table public.payroll_profiles drop constraint payroll_profiles_organization_id_user_id_key;
alter table public.payroll_profiles drop constraint payroll_profiles_organization_id_ghost_employee_id_key;
alter table public.payroll_profiles add constraint payroll_profiles_organization_id_owner_key_key unique (organization_id, owner_key);

alter table public.payroll_profile_deductions add column owner_key uuid generated always as (coalesce(user_id, ghost_employee_id)) stored;
alter table public.payroll_profile_deductions add constraint payroll_profile_deductions_org_owner_deduction_key unique (organization_id, owner_key, deduction_type_id);
