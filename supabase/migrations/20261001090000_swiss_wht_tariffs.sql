-- Swiss withholding tax (impôt à la source) scales, imported from the
-- official ESTV files (estv2.admin.ch/qst/<year>/loehne/tarYYxx.zip) by the
-- import-wht-tariffs function. One row per canton + tariff code (e.g.
-- "A0N": single, 0 children, no church tax): steps = [[income_from_chf,
-- rate_percent, min_tax_chf], ...] sorted by income, for the monthly
-- taxable income. Public data: readable by every signed-in user.
create table if not exists public.swiss_wht_tariffs (
  year int not null,
  canton text not null check (canton ~ '^[A-Z]{2}$'),
  code text not null check (char_length(code) between 2 and 10),
  valid_from date,
  steps jsonb not null,
  imported_at timestamptz not null default now(),
  primary key (year, canton, code)
);
alter table public.swiss_wht_tariffs enable row level security;
drop policy if exists "signed-in users read wht tariffs" on public.swiss_wht_tariffs;
create policy "signed-in users read wht tariffs" on public.swiss_wht_tariffs for select to authenticated using (true);
grant select on public.swiss_wht_tariffs to authenticated;
