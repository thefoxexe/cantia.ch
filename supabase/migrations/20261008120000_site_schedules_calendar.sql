-- Planning de chantier — working-day calendar: the canton whose public
-- holidays are off (null = guessed from the chantier's address, else the
-- company's), whether they apply, extra days off for this chantier, and the
-- company-wide closures (congés du bâtiment…) shared by every planning.
alter table public.site_schedules
  add column if not exists canton text check (canton is null or canton ~ '^[A-Z]{2}$'),
  add column if not exists holidays boolean not null default true,
  add column if not exists days_off date[] not null default '{}';

-- [{ "from": "2026-07-20", "to": "2026-08-07", "label": "Congés du bâtiment" }]
alter table public.organizations
  add column if not exists closure_periods jsonb not null default '[]'::jsonb
    check (jsonb_typeof(closure_periods) = 'array');
