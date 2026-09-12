-- Extends upsert_payroll_slip (20260912170100) with the employer cost
-- computed alongside gross/net — same function, same lifecycle guard,
-- just one more figure to persist as part of the snapshot.
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
  p_snapshot jsonb,
  p_employer_cost_chf numeric default null
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
      employer_cost_chf = p_employer_cost_chf,
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
      gross_chf, total_deductions_chf, net_chf, employer_cost_chf, snapshot, status, calculated_at, calculated_by
    ) values (
      p_run_id, v_run.organization_id, p_user_id, p_ghost_employee_id, v_run.year, v_run.month,
      p_salary_type, p_hourly_rate_chf, p_monthly_salary_chf, p_total_hours,
      p_gross_chf, p_total_deductions_chf, p_net_chf, p_employer_cost_chf, p_snapshot, 'calculee', now(), auth.uid()
    )
    returning id into v_slip_id;
  end if;

  return v_slip_id;
end;
$$;
revoke all on function public.upsert_payroll_slip(uuid, uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, jsonb, numeric) from public;
revoke execute on function public.upsert_payroll_slip(uuid, uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, jsonb, numeric) from anon;
grant execute on function public.upsert_payroll_slip(uuid, uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, jsonb, numeric) to authenticated;

-- The old 11-argument signature is superseded — drop it so PostgREST
-- doesn't keep exposing two overloads for the same RPC name (it would
-- otherwise require callers to disambiguate by argument count forever).
drop function if exists public.upsert_payroll_slip(uuid, uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, jsonb);

notify pgrst, 'reload schema';
