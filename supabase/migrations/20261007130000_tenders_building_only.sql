-- "Remplir une soumission" is for building companies only: the ones that
-- receive soumissions (CAN / NPK) to price. A fiduciaire, a drone pilot or a
-- consultancy never sees it and cannot switch it on. The company says what it
-- does at sign-up: a sector, then its trades inside it.
-- Same rule client-side: lib/trades.ts (BUILDING_SECTORS, fillsSoumissions).

alter table public.organizations add column if not exists trade_specialties text[] not null default '{}'
  check (cardinality(trade_specialties) <= 20);
grant update (trade_specialties) on public.organizations to authenticated;

create or replace function public.org_fills_soumissions(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((
    select o.trade in (
        'Construction & gros œuvre', 'Second œuvre & finitions', 'Technique du bâtiment', 'Paysagisme & extérieurs',
        -- first, trade-level values still stored on older companies
        'Génie civil', 'Maçonnerie', 'Serrurerie', 'Électricité', 'Plomberie / Sanitaire', 'Menuiserie / Charpente',
        'Peinture', 'Carrelage', 'Chauffage / Ventilation', 'Paysagisme')
      and coalesce(o.work_term, 'chantier') not in ('mandat', 'dossier')
    from public.organizations o where o.id = org_id
  ), false);
$$;
grant execute on function public.org_fills_soumissions(uuid) to authenticated;

-- Every gate of the module (RLS, import, edge functions) goes through this.
create or replace function public.org_has_tenders(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((
    select p.has_tenders from public.organizations o join public.plans p on p.id = o.plan_id where o.id = org_id
  ), false) and public.org_fills_soumissions(org_id);
$$;
