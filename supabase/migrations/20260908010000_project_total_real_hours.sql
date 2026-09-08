-- ProjectProfitability now sums real logged hours per chantier instead of
-- only estimating from Planning — but payroll_time_entries' own RLS
-- ("members can view own or managed time entries") restricts SELECT to a
-- member's own rows unless they can manage payroll, which would silently
-- undercount the total for anyone else viewing a chantier's rentabilité
-- tab. This returns only the aggregate sum (no per-row user_id, note, or
-- individual hours), which carries no more information than the old
-- planning-based estimate did — safe for any org member of the project.
create function public.project_total_real_hours(p_project_id uuid)
returns numeric
language plpgsql stable security definer set search_path = public
as $$
declare
  v_org_id uuid;
  v_total numeric;
begin
  select organization_id into v_org_id from public.projects where id = p_project_id;
  if v_org_id is null or not public.is_org_member(v_org_id) then
    raise exception 'access denied';
  end if;

  select coalesce(sum(hours), 0) into v_total
  from public.payroll_time_entries
  where project_id = p_project_id;

  return v_total;
end;
$$;

revoke execute on function public.project_total_real_hours(uuid) from anon;
