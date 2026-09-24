-- The 'free' plan (the only plan row with max_devis_factures_per_month set)
-- is retired — choose-plan.tsx already excludes it from what new orgs can
-- pick, and zero organizations currently carry plan_id = 'free'. The
-- trigger itself is left as a safety net for that plan id, but its error
-- message hardcoded "sur le plan gratuit", which is stale framing now that
-- there's no free plan being sold — every plan actually offered today is
-- unlimited. Generic wording instead, accurate regardless of which plan
-- (if any, going forward) ever carries a numeric cap again.
create or replace function public.check_devis_facture_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_limit integer;
  v_count integer;
begin
  v_org_id := new.organization_id;

  select p.max_devis_factures_per_month into v_limit
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where o.id = v_org_id;

  if v_limit is null then
    return new;
  end if;

  select
    (select count(*) from public.devis where organization_id = v_org_id and created_at >= date_trunc('month', now()))
    + (select count(*) from public.factures where organization_id = v_org_id and created_at >= date_trunc('month', now()))
  into v_count;

  if v_count >= v_limit then
    raise exception 'Limite de % devis/factures atteinte ce mois-ci sur votre plan. Passez à un plan supérieur pour un nombre illimité.', v_limit;
  end if;

  return new;
end;
$$;
