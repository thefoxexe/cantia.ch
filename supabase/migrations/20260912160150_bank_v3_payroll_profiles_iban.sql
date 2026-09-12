-- Self-review fix: setEmployeeIban (lib/api/payments.ts) has updated
-- payroll_profiles.iban since it was written, but the column itself was
-- never actually added in 20260912140000_bank_v3_payments_schema.sql —
-- an oversight caught only when payments_list_payable_expense_reimbursements
-- (the next migration) tried to select it and Postgres rejected the
-- unknown column. Every expense-reimbursement IBAN lookup and save was
-- silently broken until this was applied.
alter table public.payroll_profiles add column iban text;

notify pgrst, 'reload schema';
