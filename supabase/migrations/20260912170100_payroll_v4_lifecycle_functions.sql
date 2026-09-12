-- Corrects the previous migration's plain unique index to a partial one:
-- reverse_payroll_slip below needs to mark a slip 'extournee' and insert
-- a fresh 'brouillon' for the same run+employee to redo it, which a
-- plain (run_id, owner_key) unique index would reject outright.
drop index if exists public.payroll_slips_run_owner_idx;
create unique index payroll_slips_run_owner_idx on public.payroll_slips (run_id, owner_key) where status <> 'extournee';

create or replace function public.find_or_create_payroll_run(p_organization_id uuid, p_year integer, p_month integer)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid;
begin
  if auth.uid() is not null and not public.can_manage_org_payroll(p_organization_id) then
    raise exception 'Accès refusé';
  end if;
  insert into public.payroll_runs (organization_id, year, month, created_by)
  values (p_organization_id, p_year, p_month, auth.uid())
  on conflict (organization_id, year, month) do update set organization_id = excluded.organization_id
  returning id into v_run_id;
  return v_run_id;
end;
$$;
revoke all on function public.find_or_create_payroll_run(uuid, integer, integer) from public;
revoke execute on function public.find_or_create_payroll_run(uuid, integer, integer) from anon;
grant execute on function public.find_or_create_payroll_run(uuid, integer, integer) to authenticated;

-- Computes nothing itself — gross/deductions/net are computed in
-- lib/api/payroll.ts (computeSalaryBreakdown, already used by the RH
-- payslip screen) and passed in already-final, so the calculation logic
-- lives in exactly one place rather than being reimplemented a second
-- time in PL/pgSQL. This function's job is purely the lifecycle
-- invariant: a slip can be freely recalculated while still brouillon/
-- calculée, but once validée/payée/extournée it must never be silently
-- overwritten (§7.6) — recalculating it requires reverse_payroll_slip
-- first, an explicit, auditable action.
create or replace function public.upsert_payroll_slip(
  p_run_id uuid,
  p_user_id uuid,
  p_ghost_employee_id uuid,
  p_salary_type text,
  p_hourly_rate_chf numeric,
  p_monthly_salary_chf numeric,
  p_total_hours numeric,
  p_gross_chf numeric,
  p_total_deductions_chf numeric,
  p_net_chf numeric,
  p_snapshot jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run record;
  v_existing record;
  v_owner_key uuid := coalesce(p_user_id, p_ghost_employee_id);
  v_slip_id uuid;
begin
  select * into v_run from public.payroll_runs where id = p_run_id;
  if not found then
    raise exception 'Période de paie introuvable';
  end if;
  if auth.uid() is not null and not public.can_manage_org_payroll(v_run.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if v_owner_key is null then
    raise exception 'Employé manquant (ni user_id ni ghost_employee_id)';
  end if;

  select * into v_existing from public.payroll_slips where run_id = p_run_id and owner_key = v_owner_key and status <> 'extournee';

  if found then
    if v_existing.status not in ('brouillon', 'calculee') then
      raise exception 'Cette fiche de salaire est % et ne peut plus être recalculée automatiquement — extournez-la d''abord', v_existing.status;
    end if;
    update public.payroll_slips set
      salary_type = p_salary_type,
      hourly_rate_chf = p_hourly_rate_chf,
      monthly_salary_chf = p_monthly_salary_chf,
      total_hours = p_total_hours,
      gross_chf = p_gross_chf,
      total_deductions_chf = p_total_deductions_chf,
      net_chf = p_net_chf,
      snapshot = p_snapshot,
      status = 'calculee',
      calculated_at = now(),
      calculated_by = auth.uid()
    where id = v_existing.id
    returning id into v_slip_id;
  else
    insert into public.payroll_slips (
      run_id, organization_id, user_id, ghost_employee_id, year, month,
      salary_type, hourly_rate_chf, monthly_salary_chf, total_hours,
      gross_chf, total_deductions_chf, net_chf, snapshot, status, calculated_at, calculated_by
    ) values (
      p_run_id, v_run.organization_id, p_user_id, p_ghost_employee_id, v_run.year, v_run.month,
      p_salary_type, p_hourly_rate_chf, p_monthly_salary_chf, p_total_hours,
      p_gross_chf, p_total_deductions_chf, p_net_chf, p_snapshot, 'calculee', now(), auth.uid()
    )
    returning id into v_slip_id;
  end if;

  return v_slip_id;
end;
$$;
revoke all on function public.upsert_payroll_slip(uuid, uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, jsonb) from public;
revoke execute on function public.upsert_payroll_slip(uuid, uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, jsonb) from anon;
grant execute on function public.upsert_payroll_slip(uuid, uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, jsonb) to authenticated;

create or replace function public.validate_payroll_slip(p_slip_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slip record;
begin
  select * into v_slip from public.payroll_slips where id = p_slip_id;
  if not found then
    raise exception 'Fiche de salaire introuvable';
  end if;
  if auth.uid() is not null and not public.can_manage_org_payroll(v_slip.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if v_slip.status <> 'calculee' then
    raise exception 'Seule une fiche calculée peut être validée (statut actuel : %)', v_slip.status;
  end if;
  update public.payroll_slips set status = 'validee', validated_at = now(), validated_by = auth.uid() where id = p_slip_id;
end;
$$;
revoke all on function public.validate_payroll_slip(uuid) from public;
revoke execute on function public.validate_payroll_slip(uuid) from anon;
grant execute on function public.validate_payroll_slip(uuid) to authenticated;

create or replace function public.mark_payroll_slip_paid(p_slip_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slip record;
begin
  select * into v_slip from public.payroll_slips where id = p_slip_id;
  if not found then
    raise exception 'Fiche de salaire introuvable';
  end if;
  if auth.uid() is not null and not public.can_manage_org_payroll(v_slip.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if v_slip.status <> 'validee' then
    raise exception 'Seule une fiche validée peut être marquée payée (statut actuel : %)', v_slip.status;
  end if;
  update public.payroll_slips set status = 'payee', paid_at = now() where id = p_slip_id;
end;
$$;
revoke all on function public.mark_payroll_slip_paid(uuid) from public;
revoke execute on function public.mark_payroll_slip_paid(uuid) from anon;
grant execute on function public.mark_payroll_slip_paid(uuid) to authenticated;

-- A deliberately narrow "undo and redo this same month" — NOT the full
-- §7.7 retroactive-correction workflow (simulate a past period, diff
-- against the original, post the difference into a currently open
-- period). That needs its own comparison UI and is left for a dedicated
-- follow-up; this only lets a mistake in an already-validated/payée slip
-- be corrected by reopening the same period, never altering the
-- extournée row itself (kept as the historical record, same principle
-- as accounting_entries' own extourne).
create or replace function public.reverse_payroll_slip(p_slip_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slip record;
  v_new_id uuid;
begin
  select * into v_slip from public.payroll_slips where id = p_slip_id;
  if not found then
    raise exception 'Fiche de salaire introuvable';
  end if;
  if auth.uid() is not null and not public.can_manage_org_payroll(v_slip.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if v_slip.status not in ('validee', 'payee') then
    raise exception 'Seule une fiche validée ou payée peut être extournée (statut actuel : %)', v_slip.status;
  end if;

  update public.payroll_slips set status = 'extournee' where id = p_slip_id;

  insert into public.payroll_slips (run_id, organization_id, user_id, ghost_employee_id, year, month, salary_type, snapshot, status, reversed_slip_id)
  values (v_slip.run_id, v_slip.organization_id, v_slip.user_id, v_slip.ghost_employee_id, v_slip.year, v_slip.month, v_slip.salary_type, '{}'::jsonb, 'brouillon', p_slip_id)
  returning id into v_new_id;

  return v_new_id;
end;
$$;
revoke all on function public.reverse_payroll_slip(uuid) from public;
revoke execute on function public.reverse_payroll_slip(uuid) from anon;
grant execute on function public.reverse_payroll_slip(uuid) to authenticated;

notify pgrst, 'reload schema';
