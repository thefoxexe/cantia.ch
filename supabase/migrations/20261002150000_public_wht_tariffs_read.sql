-- The ESTV withholding-tax scales are public data: let the free salary
-- calculator on cantia.ch (app/calculateur-salaire.tsx) read them without
-- an account. Read-only; writes stay with the import function (service role).
drop policy if exists "anyone reads wht tariffs" on public.swiss_wht_tariffs;
create policy "anyone reads wht tariffs" on public.swiss_wht_tariffs for select to anon using (true);
grant select on public.swiss_wht_tariffs to anon;
