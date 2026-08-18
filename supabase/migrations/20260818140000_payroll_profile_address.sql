-- Employee postal address on the payroll profile — needed to print a real,
-- mailable payslip letter (letterhead + recipient address block), not just
-- show numbers on screen. Editable only by payroll managers, same as the
-- rest of payroll_profiles (RLS already restricts this table to
-- can_manage_org_payroll).
alter table public.payroll_profiles
  add column street text,
  add column postal_code text,
  add column locality text;
