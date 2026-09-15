-- Employees currently have no way to see their own payslip: both
-- payroll_profiles and payroll_slips are RLS-gated to
-- can_manage_org_payroll only. This adds narrow self-access (additive
-- SELECT policies — Postgres RLS ORs multiple policies together, so the
-- existing manager policies are untouched) so an employee can view their
-- own salary profile and finalized payslips from inside the app, without
-- widening any existing shared permission function.
--
-- payroll_slips self-access is limited to 'validee'/'payee' status: a
-- 'brouillon'/'calculee' slip can still change before a manager
-- finalizes it, and showing a draft figure to the employee it's about
-- would be actively misleading.
create policy "employees can view own payroll profile" on public.payroll_profiles
  for select using (user_id = auth.uid());

create policy "employees can view own finalized payroll slips" on public.payroll_slips
  for select using (user_id = auth.uid() and status in ('validee', 'payee'));

notify pgrst, 'reload schema';
