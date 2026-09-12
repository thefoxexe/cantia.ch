-- Cahier des charges V2, Lot 4 §7.7 "Correction rétroactive" — the full
-- workflow reverse_payroll_slip's own comment (20260912170100) explicitly
-- deferred: simulate a past, already-validée/payée period with today's
-- catalog/profile/hours, diff it against what was actually paid, and post
-- the DIFFERENCE into a currently open period — never silently rewriting
-- the closed one (which stays exactly as filed/declared).
--
-- The simulation and the diff are computed in lib/api/payroll.ts, reusing
-- the exact same computeMonthlyGross/computeSalaryBreakdown/
-- computeEmployerCost pipeline as every other calculation in this app —
-- this migration only persists the RESULT: one net_adjustment wage line
-- ("Régularisation rétroactive", seeded in 20260912200000) in the target
-- period, plus an immutable audit row recording exactly what was
-- corrected and why. Posting a single net figure (rather than
-- re-decomposing into per-cotisation deltas re-injected into the new
-- period) is the same lump-sum "régularisation" practice used by Swiss
-- fiduciaries — safe because it doesn't require re-declaring AVS/AC
-- periods retroactively, a much deeper compliance mechanism this app
-- cannot claim to implement correctly without a verified official
-- specification (same discipline as never fabricating a legal rate).
create table public.payroll_corrections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  ghost_employee_id uuid references public.payroll_ghost_employees(id) on delete cascade,
  owner_key uuid generated always as (coalesce(user_id, ghost_employee_id)) stored,
  source_slip_id uuid not null references public.payroll_slips(id),
  source_year integer not null,
  source_month integer not null,
  target_year integer not null,
  target_month integer not null,
  net_diff_chf numeric(10, 2) not null,
  diff jsonb not null,
  wage_line_id uuid references public.payroll_slip_wage_lines(id),
  applied_by uuid references auth.users(id),
  applied_at timestamptz not null default now(),
  check ((user_id is not null and ghost_employee_id is null) or (user_id is null and ghost_employee_id is not null))
);
create index on public.payroll_corrections (organization_id, owner_key);
alter table public.payroll_corrections enable row level security;

-- Read-only audit trail — every write goes through apply_payroll_correction.
create policy "payroll managers can view corrections" on public.payroll_corrections
  for select using (public.can_manage_org_payroll(organization_id));

create or replace function public.apply_payroll_correction(
  p_organization_id uuid,
  p_user_id uuid,
  p_ghost_employee_id uuid,
  p_source_slip_id uuid,
  p_target_year integer,
  p_target_month integer,
  p_net_diff_chf numeric,
  p_diff jsonb,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_key uuid := coalesce(p_user_id, p_ghost_employee_id);
  v_source record;
  v_wage_type_id uuid;
  v_line_id uuid;
  v_correction_id uuid;
begin
  if auth.uid() is not null and not public.can_manage_org_payroll(p_organization_id) then
    raise exception 'Accès refusé';
  end if;
  if v_owner_key is null then
    raise exception 'Employé manquant (ni user_id ni ghost_employee_id)';
  end if;

  select * into v_source from public.payroll_slips
  where id = p_source_slip_id and organization_id = p_organization_id and owner_key = v_owner_key;
  if not found then
    raise exception 'Fiche source introuvable';
  end if;
  if v_source.status not in ('validee', 'payee') then
    raise exception 'Seule une fiche validée ou payée peut être corrigée rétroactivement (statut actuel : %)', v_source.status;
  end if;
  if v_source.year = p_target_year and v_source.month = p_target_month then
    raise exception 'La période cible doit être différente de la période source';
  end if;
  if p_net_diff_chf = 0 then
    raise exception 'Aucun écart à régulariser';
  end if;

  select id into v_wage_type_id from public.payroll_wage_types
  where organization_id = p_organization_id and label = 'Régularisation rétroactive';
  if v_wage_type_id is null then
    raise exception 'Rubrique "Régularisation rétroactive" introuvable — restaurez le catalogue standard des rubriques';
  end if;

  -- Fires payroll_slip_wage_lines_guard: refuses outright if the target
  -- period's own slip is already validée/payée, exactly as it would for
  -- a manually-added line.
  insert into public.payroll_slip_wage_lines
    (organization_id, user_id, ghost_employee_id, year, month, wage_type_id, amount_chf, note, created_by)
  values
    (p_organization_id, p_user_id, p_ghost_employee_id, p_target_year, p_target_month, v_wage_type_id, p_net_diff_chf, p_note, auth.uid())
  returning id into v_line_id;

  insert into public.payroll_corrections
    (organization_id, user_id, ghost_employee_id, source_slip_id, source_year, source_month, target_year, target_month, net_diff_chf, diff, wage_line_id, applied_by)
  values
    (p_organization_id, p_user_id, p_ghost_employee_id, p_source_slip_id, v_source.year, v_source.month, p_target_year, p_target_month, p_net_diff_chf, p_diff, v_line_id, auth.uid())
  returning id into v_correction_id;

  return v_correction_id;
end;
$$;
revoke all on function public.apply_payroll_correction(uuid, uuid, uuid, uuid, integer, integer, numeric, jsonb, text) from public;
revoke execute on function public.apply_payroll_correction(uuid, uuid, uuid, uuid, integer, integer, numeric, jsonb, text) from anon;
grant execute on function public.apply_payroll_correction(uuid, uuid, uuid, uuid, integer, integer, numeric, jsonb, text) to authenticated;

notify pgrst, 'reload schema';
