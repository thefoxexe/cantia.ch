-- Free plan gets a small monthly cap on devis+factures created; paid plans
-- (max_devis_factures_per_month left null) are unlimited. Enforced with a
-- trigger on both tables rather than only in client code, since factures
-- can also be created server-side via convert_devis_to_facture() — one
-- check function covers both insert paths no matter how they're reached.
alter table public.plans add column if not exists max_devis_factures_per_month integer;
update public.plans set max_devis_factures_per_month = 5 where id = 'free';

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
    raise exception 'Limite de % devis/factures atteinte ce mois-ci sur le plan gratuit. Passez à un plan payant pour un nombre illimité.', v_limit;
  end if;

  return new;
end;
$$;

drop trigger if exists devis_check_quota on public.devis;
create trigger devis_check_quota before insert on public.devis
for each row execute function public.check_devis_facture_quota();

drop trigger if exists factures_check_quota on public.factures;
create trigger factures_check_quota before insert on public.factures
for each row execute function public.check_devis_facture_quota();
