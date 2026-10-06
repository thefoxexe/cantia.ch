-- Secteur d'activité: one sector (organizations.trade, French label) and its
-- trades (organizations.trade_specialties). Every company on Cantia so far is
-- a building company: all move to « Construction & bâtiment », keeping their
-- former trade as a ticked trade. The building sector gets the site tools
-- (soumissions, construction schedule) compulsorily, whatever the
-- vocabulary (chantiers, projets, mandats, dossiers). lib/trades.ts mirrors this.

update public.organizations o set
  trade_specialties = (
    select coalesce(array_agg(distinct x), '{}') from unnest(
      o.trade_specialties || case o.trade
        when 'Génie civil' then array['genieCivil']
        when 'Maçonnerie' then array['maconnerie']
        when 'Serrurerie' then array['serrurerie']
        when 'Électricité' then array['electricite']
        when 'Plomberie / Sanitaire' then array['sanitaire']
        when 'Menuiserie / Charpente' then array['menuiserie', 'charpente']
        when 'Peinture' then array['platreriePeinture']
        when 'Carrelage' then array['carrelage']
        when 'Chauffage / Ventilation' then array['chauffage', 'ventilation']
        when 'Paysagisme' then array['amenagements']
        when 'Paysagisme & extérieurs' then array['amenagements']
        when 'Architecture & ingénierie' then array['architecture', 'ingenierie']
        when 'Immobilier & gérance' then array['immobilier']
        else array[]::text[]
      end
    ) as x
  ),
  trade = 'Construction & bâtiment'
where o.trade is distinct from 'Construction & bâtiment';

create or replace function public.org_fills_soumissions(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((
    select o.trade in (
        'Construction & bâtiment',
        -- values stored before the sector list
        'Construction & gros œuvre', 'Second œuvre & finitions', 'Technique du bâtiment', 'Architecture & ingénierie', 'Paysagisme & extérieurs', 'Immobilier & gérance',
        'Génie civil', 'Maçonnerie', 'Serrurerie', 'Électricité', 'Plomberie / Sanitaire', 'Menuiserie / Charpente',
        'Peinture', 'Carrelage', 'Chauffage / Ventilation', 'Paysagisme')
    from public.organizations o where o.id = org_id
  ), false);
$$;
