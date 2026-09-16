-- Situations de chantier — facturation progressive : contrairement à une
-- facture d'acompte simple (montant fixe, `factures.is_deposit`), une
-- situation facture l'avancement RÉEL de chaque poste d'un devis, en
-- déduisant ce qui a déjà été facturé lors des situations précédentes sur
-- ce même devis, avec une retenue de garantie optionnelle. Chaque situation
-- finalisée se transforme en une vraie `factures` row (comme un travail
-- supplémentaire accepté) — elle hérite donc gratuitement de tout ce qui
-- existe déjà pour les factures : PDF brandé, QR-facture, suivi de
-- paiement, relances.
create type public.chantier_situation_status as enum ('draft', 'finalized');

create sequence public.chantier_situation_number_seq;

create table public.chantier_situations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  devis_id uuid references public.devis(id) on delete set null,
  number text unique,
  situation_index integer not null,
  title text not null,
  status public.chantier_situation_status not null default 'draft',
  client_name text not null,
  client_email text,
  vat_rate numeric(5,2) not null default 8.1,
  retenue_garantie_percent numeric(5,2) not null default 0,
  facture_id uuid references public.factures(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.chantier_situations (organization_id);
create index on public.chantier_situations (project_id);
create index on public.chantier_situations (devis_id);

create or replace function public.set_chantier_situation_number()
returns trigger language plpgsql as $$
begin
  if new.number is null then
    new.number := 'SIT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.chantier_situation_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger chantier_situations_set_number before insert on public.chantier_situations
for each row execute function public.set_chantier_situation_number();

create trigger chantier_situations_set_updated_at before update on public.chantier_situations
for each row execute function public.set_updated_at();

-- source_devis_item_id links each line back to its originating devis_items
-- row — the exact, unambiguous way to find "this same line's cumulative %
-- from the previous situation" (a description-text match would break the
-- moment someone edits wording between situations).
create table public.chantier_situation_items (
  id uuid primary key default gen_random_uuid(),
  situation_id uuid not null references public.chantier_situations(id) on delete cascade,
  source_devis_item_id uuid references public.devis_items(id) on delete set null,
  description text not null,
  unit text default 'pce',
  contract_quantity numeric(12,2) not null default 0,
  unit_price numeric(12,2) not null default 0,
  previous_percent numeric(5,2) not null default 0,
  cumulative_percent numeric(5,2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index on public.chantier_situation_items (situation_id);

-- Même politique financière que devis/factures/travaux supplémentaires.
alter table public.chantier_situations enable row level security;

create policy "finance members can view situations" on public.chantier_situations
  for select using (public.can_view_org_finances(organization_id));
create policy "finance members can insert situations" on public.chantier_situations
  for insert with check (public.can_view_org_finances(organization_id) and created_by = auth.uid());
create policy "finance members can update situations" on public.chantier_situations
  for update using (public.can_view_org_finances(organization_id));
create policy "admins can delete situations" on public.chantier_situations
  for delete using (public.is_org_admin(organization_id));

alter table public.chantier_situation_items enable row level security;

create policy "finance members can view situation items" on public.chantier_situation_items
  for select using (exists (
    select 1 from public.chantier_situations s where s.id = chantier_situation_items.situation_id and public.can_view_org_finances(s.organization_id)
  ));
create policy "finance members can insert situation items" on public.chantier_situation_items
  for insert with check (exists (
    select 1 from public.chantier_situations s where s.id = chantier_situation_items.situation_id and public.can_view_org_finances(s.organization_id)
  ));
create policy "finance members can update situation items" on public.chantier_situation_items
  for update using (exists (
    select 1 from public.chantier_situations s where s.id = chantier_situation_items.situation_id and public.can_view_org_finances(s.organization_id)
  ));
create policy "finance members can delete situation items" on public.chantier_situation_items
  for delete using (exists (
    select 1 from public.chantier_situations s where s.id = chantier_situation_items.situation_id and public.can_view_org_finances(s.organization_id)
  ));

-- A generated facture carries a visible "this is a situation" badge/number,
-- same shape as the existing is_deposit flag.
alter table public.factures add column is_situation boolean not null default false;
alter table public.factures add column situation_number integer;

-- ==========================================================================
-- Finalisation — ne facture QUE les postes qui ont réellement avancé ce
-- tour-ci (cumulative_percent > previous_percent), une ligne par poste
-- représentée en "delta % du marché" (quantity = delta%, unit = '%',
-- unit_price = valeur d'un point de %) pour que la facture générée reste
-- lisible sans réinventer un nouveau moteur de rendu PDF. La retenue de
-- garantie, si non nulle, s'ajoute comme une ligne négative distincte.
-- ==========================================================================
create or replace function public.finalize_chantier_situation(p_situation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_situation public.chantier_situations%rowtype;
  v_facture_id uuid;
  v_item record;
  v_subtotal numeric := 0;
  v_delta_amount numeric;
  v_sort integer := 0;
begin
  select * into v_situation from public.chantier_situations where id = p_situation_id;
  if not found then
    raise exception 'Situation introuvable';
  end if;
  if not public.can_view_org_finances(v_situation.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if v_situation.status = 'finalized' then
    return v_situation.facture_id;
  end if;

  insert into public.factures (
    organization_id, project_id, devis_id, client_name, client_email, notes,
    vat_rate, due_date, created_by, is_situation, situation_number
  ) values (
    v_situation.organization_id, v_situation.project_id, v_situation.devis_id,
    v_situation.client_name, v_situation.client_email,
    v_situation.title,
    v_situation.vat_rate, current_date + 30, v_situation.created_by, true, v_situation.situation_index
  )
  returning id into v_facture_id;

  for v_item in
    select * from public.chantier_situation_items
    where situation_id = p_situation_id
    order by sort_order
  loop
    if v_item.cumulative_percent > v_item.previous_percent then
      v_delta_amount := round(v_item.contract_quantity * v_item.unit_price * (v_item.cumulative_percent - v_item.previous_percent) / 100, 2);
      v_subtotal := v_subtotal + v_delta_amount;
      insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
      values (
        v_facture_id,
        v_item.description || ' — avancement ' || v_item.previous_percent::text || '% -> ' || v_item.cumulative_percent::text || '%',
        v_item.cumulative_percent - v_item.previous_percent,
        '%',
        round(v_item.contract_quantity * v_item.unit_price / 100, 4),
        v_sort
      );
      v_sort := v_sort + 1;
    end if;
  end loop;

  if v_situation.retenue_garantie_percent > 0 and v_subtotal > 0 then
    insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
    values (
      v_facture_id,
      'Retenue de garantie (' || v_situation.retenue_garantie_percent::text || '%)',
      1,
      'forfait',
      -round(v_subtotal * v_situation.retenue_garantie_percent / 100, 2),
      v_sort
    );
  end if;

  update public.chantier_situations
  set status = 'finalized', facture_id = v_facture_id
  where id = p_situation_id;

  return v_facture_id;
end;
$$;

-- Postgres grants EXECUTE to PUBLIC by default at CREATE FUNCTION time (on
-- top of Supabase's own standing `alter default privileges ... grant
-- execute to anon, authenticated`), so `revoke ... from anon` alone leaves
-- anon executing it via its PUBLIC membership — revoke from PUBLIC itself,
-- same fix as 20260826000000_admin_rpcs_revoke_anon.sql.
revoke execute on function public.finalize_chantier_situation(uuid) from public;
grant execute on function public.finalize_chantier_situation(uuid) to authenticated;
