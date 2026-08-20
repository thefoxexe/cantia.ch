-- Travaux supplémentaires ("TS") — extras demandés en cours de chantier
-- ("tant que vous y êtes...") qui aujourd'hui ne rentrent dans aucun
-- document propre et finissent oubliés ou contestés. Calqué directement
-- sur devis/devis_items (mêmes primitives : lignes, numérotation,
-- portail public avec signature) plutôt qu'un modèle inventé — un TS est
-- accepté et signé par le client exactement comme un devis, puis se
-- transforme automatiquement en facture dédiée.

create type public.extra_work_status as enum ('draft', 'sent', 'accepted', 'refused');

create sequence public.extra_work_number_seq;

create table public.extra_works (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  devis_id uuid references public.devis(id) on delete set null,
  number text unique,
  title text not null,
  client_name text not null,
  client_email text,
  notes text,
  status public.extra_work_status not null default 'draft',
  vat_rate numeric(5,2) not null default 8.1,
  public_token uuid not null default gen_random_uuid(),
  client_signed_at timestamptz,
  client_signer_name text,
  client_signature_data text,
  facture_id uuid references public.factures(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.extra_works (organization_id);
create index on public.extra_works (project_id);
create unique index extra_works_public_token_idx on public.extra_works (public_token);

create or replace function public.set_extra_work_number()
returns trigger language plpgsql as $$
begin
  if new.number is null then
    new.number := 'TS-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.extra_work_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger extra_works_set_number before insert on public.extra_works
for each row execute function public.set_extra_work_number();

create trigger extra_works_set_updated_at before update on public.extra_works
for each row execute function public.set_updated_at();

create table public.extra_work_items (
  id uuid primary key default gen_random_uuid(),
  extra_work_id uuid not null references public.extra_works(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit text default 'pce',
  unit_price numeric(10,2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Mêmes politiques financières que devis/factures : lecture/écriture
-- réservées aux membres avec can_view_org_finances (gate déjà en place
-- pour tout ce qui touche à l'argent, réutilisé tel quel).
alter table public.extra_works enable row level security;

create policy "finance members can view extra works" on public.extra_works
  for select using (public.can_view_org_finances(organization_id));
create policy "finance members can insert extra works" on public.extra_works
  for insert with check (public.can_view_org_finances(organization_id) and created_by = auth.uid());
create policy "finance members can update extra works" on public.extra_works
  for update using (public.can_view_org_finances(organization_id));
create policy "admins can delete extra works" on public.extra_works
  for delete using (public.is_org_admin(organization_id));

alter table public.extra_work_items enable row level security;

create policy "finance members can view extra work items" on public.extra_work_items
  for select using (exists (
    select 1 from public.extra_works w where w.id = extra_work_items.extra_work_id and public.can_view_org_finances(w.organization_id)
  ));
create policy "finance members can insert extra work items" on public.extra_work_items
  for insert with check (exists (
    select 1 from public.extra_works w where w.id = extra_work_items.extra_work_id and public.can_view_org_finances(w.organization_id)
  ));
create policy "finance members can update extra work items" on public.extra_work_items
  for update using (exists (
    select 1 from public.extra_works w where w.id = extra_work_items.extra_work_id and public.can_view_org_finances(w.organization_id)
  ));
create policy "finance members can delete extra work items" on public.extra_work_items
  for delete using (exists (
    select 1 from public.extra_works w where w.id = extra_work_items.extra_work_id and public.can_view_org_finances(w.organization_id)
  ));

-- Les lignes de TS alimentent le catalogue exactement comme les lignes de
-- devis (même fonction de normalisation, même règle "jamais d'écrasement
-- silencieux du prix").
create or replace function public.sync_catalog_from_extra_work_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_key text;
begin
  select organization_id into v_org_id from public.extra_works where id = new.extra_work_id;
  if v_org_id is null then
    return new;
  end if;
  v_key := public.normalize_catalog_key(new.description);
  if v_key = '' then
    return new;
  end if;

  insert into public.catalog_items (organization_id, description, description_key, unit, unit_price)
  values (v_org_id, new.description, v_key, coalesce(new.unit, 'pce'), new.unit_price)
  on conflict (organization_id, description_key)
  do update set use_count = public.catalog_items.use_count + 1, last_used_at = now();

  return new;
end;
$$;

create trigger extra_work_items_sync_catalog after insert on public.extra_work_items
for each row execute function public.sync_catalog_from_extra_work_item();

-- ==========================================================================
-- Conversion en facture dédiée — même schéma que convert_devis_to_facture_internal
-- mais sans la logique d'acompte (un TS n'a pas de notion d'acompte).
-- ==========================================================================
create or replace function public.convert_extra_work_to_facture_internal(p_extra_work_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_extra_work public.extra_works%rowtype;
  v_facture_id uuid;
begin
  select * into v_extra_work from public.extra_works where id = p_extra_work_id;
  if not found then
    raise exception 'Travaux supplémentaires introuvables';
  end if;
  if v_extra_work.status <> 'accepted' then
    raise exception 'Seuls des travaux supplémentaires acceptés peuvent être transformés en facture';
  end if;
  if v_extra_work.facture_id is not null then
    return v_extra_work.facture_id;
  end if;

  insert into public.factures (
    organization_id, project_id, devis_id, client_name, client_email, notes,
    vat_rate, due_date, created_by
  ) values (
    v_extra_work.organization_id, v_extra_work.project_id, v_extra_work.devis_id,
    v_extra_work.client_name, v_extra_work.client_email,
    'Travaux supplémentaires ' || coalesce(v_extra_work.number, '') || coalesce(' — ' || v_extra_work.title, ''),
    v_extra_work.vat_rate, current_date + 30, v_extra_work.created_by
  )
  returning id into v_facture_id;

  insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
  select v_facture_id, description, quantity, unit, unit_price, sort_order
  from public.extra_work_items
  where extra_work_id = v_extra_work.id;

  update public.extra_works set facture_id = v_facture_id where id = v_extra_work.id;

  return v_facture_id;
end;
$$;

grant execute on function public.convert_extra_work_to_facture_internal(uuid) to authenticated;

-- ==========================================================================
-- Portail public — même modèle de confiance que get_public_devis /
-- accept_public_devis : token + email du client, RPC security definer.
-- ==========================================================================
create or replace function public.get_public_extra_work(p_token uuid, p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_work public.extra_works%rowtype;
  v_org record;
  v_items jsonb;
  v_subtotal numeric;
begin
  select * into v_work from public.extra_works where public_token = p_token;
  if not found then
    raise exception 'Lien invalide';
  end if;
  if v_work.client_email is null or lower(trim(v_work.client_email)) <> lower(trim(p_email)) then
    raise exception 'Vérification impossible';
  end if;

  select name, phone, street, postal_code, locality, address, ide_number
  into v_org
  from public.organizations where id = v_work.organization_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'description', description, 'quantity', quantity,
    'unit', unit, 'unit_price', unit_price, 'sort_order', sort_order
  ) order by sort_order), '[]'::jsonb), coalesce(sum(quantity * unit_price), 0)
  into v_items, v_subtotal
  from public.extra_work_items where extra_work_id = v_work.id;

  return jsonb_build_object(
    'extra_work', jsonb_build_object(
      'id', v_work.id, 'number', v_work.number, 'title', v_work.title, 'status', v_work.status,
      'client_name', v_work.client_name, 'notes', v_work.notes, 'vat_rate', v_work.vat_rate,
      'created_at', v_work.created_at,
      'client_signed_at', v_work.client_signed_at, 'client_signer_name', v_work.client_signer_name
    ),
    'items', v_items,
    'totals', jsonb_build_object(
      'subtotal', v_subtotal,
      'vat', round(v_subtotal * v_work.vat_rate / 100, 2),
      'total', round(v_subtotal * (1 + v_work.vat_rate / 100), 2)
    ),
    'organization', to_jsonb(v_org)
  );
end;
$$;

grant execute on function public.get_public_extra_work(uuid, text) to anon, authenticated;

create or replace function public.accept_public_extra_work(
  p_token uuid,
  p_email text,
  p_signer_name text,
  p_signature_data text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_work public.extra_works%rowtype;
begin
  select * into v_work from public.extra_works where public_token = p_token;
  if not found then
    raise exception 'Lien invalide';
  end if;
  if v_work.client_email is null or lower(trim(v_work.client_email)) <> lower(trim(p_email)) then
    raise exception 'Vérification impossible';
  end if;
  if trim(coalesce(p_signer_name, '')) = '' then
    raise exception 'Le nom du signataire est requis';
  end if;
  if trim(coalesce(p_signature_data, '')) = '' then
    raise exception 'Une signature est requise';
  end if;

  if v_work.status = 'refused' then
    raise exception 'Ces travaux supplémentaires ont été refusés et ne peuvent plus être acceptés en ligne';
  end if;

  if v_work.status <> 'accepted' then
    update public.extra_works
    set status = 'accepted',
        client_signed_at = now(),
        client_signer_name = p_signer_name,
        client_signature_data = p_signature_data
    where id = v_work.id;

    perform public.convert_extra_work_to_facture_internal(v_work.id);
  end if;

  select * into v_work from public.extra_works where id = v_work.id;
  return jsonb_build_object('status', v_work.status, 'client_signed_at', v_work.client_signed_at);
end;
$$;

grant execute on function public.accept_public_extra_work(uuid, text, text, text) to anon, authenticated;
