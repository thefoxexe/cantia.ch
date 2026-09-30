-- organizations uses column-level UPDATE grants for `authenticated`, and
-- work_term (20260929…_work_term) was never added to them: every save of
-- Paramètres › Entreprise (which sends work_term with the other fields)
-- was refused as a whole, and the vocabulary never changed.
grant update (work_term) on public.organizations to authenticated;
