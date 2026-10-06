-- Métrés & Soumissions — phase A (docs/metres-soumissions/phase-0.md).
--
-- A chantier can hold any number of métrés (tenders). A tender is a tree of
-- nodes (chapters, groups, articles, notes, totals); billable nodes carry a
-- tender_positions row with the quantities, and their prices live apart in
-- tender_position_prices so they can be hidden from members without the
-- Finances permission (RLS cannot hide a single column).
--
-- Non-negotiable rules enforced here:
--   * quantity_original (what the soumission says) is never overwritten by
--     a measure or a manual entry — those have their own columns, and
--     quantity_selected only points at one of them;
--   * organization_id / project_id are always derived server-side from the
--     parent row, never trusted from the client;
--   * selected quantities and amounts are recomputed by triggers, so the
--     stored figures are always reproducible from their inputs.

-- ---------------------------------------------------------------------------
-- Plan entitlement + module default
-- ---------------------------------------------------------------------------
alter table public.plans add column if not exists has_tenders boolean not null default false;
update public.plans set has_tenders = true where id in ('equipe', 'pro', 'illimite', 'custom');

-- The métré is no longer switched on for every new chantier.
alter table public.projects alter column enabled_modules set default array['documents', 'photos', 'survey'];

create or replace function public.org_has_tenders(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((
    select p.has_tenders from public.organizations o join public.plans p on p.id = o.plan_id where o.id = org_id
  ), false);
$$;
grant execute on function public.org_has_tenders(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- tenders
-- ---------------------------------------------------------------------------
create table public.tenders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  number text check (number is null or char_length(number) <= 60),
  kind text not null default 'soumission' check (kind in ('soumission', 'interne', 'variante', 'complementaire')),
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'priced', 'offered', 'archived')),
  classification_type text not null default 'UNKNOWN' check (classification_type in ('CAN', 'CUSTOM', 'UNKNOWN')),
  cfc_code text check (cfc_code is null or char_length(cfc_code) <= 20),
  cfc_label text check (cfc_label is null or char_length(cfc_label) <= 200),
  language text not null default 'fr' check (language in ('fr', 'de', 'it')),
  currency text not null default 'CHF',
  source_type text not null default 'manual' check (source_type in ('manual', 'pdf', 'duplicate', 'csv', 'crbx', 'legacy')),
  -- Detected document metadata (projet, maître d'ouvrage, architecte, date…)
  metadata jsonb not null default '{}'::jsonb,
  -- Financial conditions of the soumission (Brut → Rabais → Escompte → TVA → Net)
  discount_percent numeric(6, 3) not null default 0 check (discount_percent >= 0 and discount_percent < 100),
  escompte_percent numeric(6, 3) not null default 0 check (escompte_percent >= 0 and escompte_percent < 100),
  vat_rate numeric(5, 2) not null default 8.1 check (vat_rate >= 0 and vat_rate < 30),
  devis_id uuid references public.devis(id) on delete set null,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tenders_project_idx on public.tenders (project_id, sort_order);
create index tenders_org_idx on public.tenders (organization_id);
create trigger tenders_set_updated_at before update on public.tenders for each row execute function public.set_updated_at();

-- organization_id always comes from the chantier, never from the client.
create or replace function public.tenders_derive_org()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select p.organization_id into new.organization_id from public.projects p where p.id = new.project_id;
  if new.organization_id is null then
    raise exception 'Chantier introuvable';
  end if;
  return new;
end;
$$;
create trigger tenders_derive_org before insert or update of project_id, organization_id on public.tenders
for each row execute function public.tenders_derive_org();

-- One gate for every tender table: member of the org, allowed on the
-- chantier (project_members whitelist) and allowed to see the métré.
create or replace function public.can_access_tender(t_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.tenders t
    where t.id = t_id
      and public.is_org_member(t.organization_id)
      and public.has_project_access(t.project_id)
      and public.can_view_org_metre(t.organization_id)
  );
$$;
-- Writing additionally needs a plan that includes the module.
create or replace function public.can_edit_tender(t_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select public.can_access_tender(t_id)
    and exists (select 1 from public.tenders t where t.id = t_id and public.org_has_tenders(t.organization_id));
$$;
create or replace function public.can_price_tender(t_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select public.can_access_tender(t_id)
    and exists (select 1 from public.tenders t where t.id = t_id and public.can_view_org_finances(t.organization_id));
$$;
grant execute on function public.can_access_tender(uuid), public.can_edit_tender(uuid), public.can_price_tender(uuid) to authenticated;

alter table public.tenders enable row level security;
create policy "tender readers" on public.tenders for select using (
  public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_metre(organization_id)
);
create policy "tender creators" on public.tenders for insert with check (
  public.is_org_member(organization_id) and public.has_project_access(project_id)
  and public.can_view_org_metre(organization_id) and public.org_has_tenders(organization_id)
);
create policy "tender editors" on public.tenders for update using (public.can_edit_tender(id));
create policy "tender deleters" on public.tenders for delete using (public.can_edit_tender(id));

-- ---------------------------------------------------------------------------
-- Child tables share one shape: tender_id + organization_id derived from it.
-- ---------------------------------------------------------------------------
create or replace function public.tender_child_derive_org()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select t.organization_id into new.organization_id from public.tenders t where t.id = new.tender_id;
  if new.organization_id is null then
    raise exception 'Métré introuvable';
  end if;
  return new;
end;
$$;

-- Source files (the original PDF stays an untouched row of public.files).
create table public.tender_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  file_id uuid references public.files(id) on delete set null,
  role text not null default 'soumission' check (role in ('soumission', 'annexe')),
  file_name text,
  page_count integer,
  sha256 text,
  parser_version text,
  ai_model_version text,
  detected jsonb not null default '{}'::jsonb,
  imported_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.tender_documents (tender_id);

create table public.tender_nodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  parent_id uuid references public.tender_nodes(id) on delete cascade,
  node_type text not null check (node_type in (
    'contract', 'chapter', 'section', 'subsection', 'article', 'subarticle', 'billable_position',
    'carry_forward', 'subtotal', 'chapter_total', 'financial_adjustment', 'note', 'other'
  )),
  sort_order integer not null default 0,
  depth smallint not null default 0,
  raw_number text,
  position_path text,
  display_reference text,
  classification_type text check (classification_type is null or classification_type in ('CAN', 'CUSTOM', 'UNKNOWN')),
  cfc_code text,
  can_chapter text,
  can_position text,
  can_version text,
  can_language text,
  is_reserved boolean not null default false,
  title text,
  description text,
  raw_text text,
  source_document_id uuid references public.tender_documents(id) on delete set null,
  source_page integer,
  source_bbox jsonb,
  confidence numeric(4, 3) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  needs_review boolean not null default false,
  validated_by uuid references auth.users(id),
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tender_nodes_tree_idx on public.tender_nodes (tender_id, sort_order);
create index on public.tender_nodes (parent_id);
create index tender_nodes_search_idx on public.tender_nodes using gin (
  to_tsvector('simple', coalesce(display_reference, '') || ' ' || coalesce(raw_number, '') || ' ' || coalesce(title, '') || ' ' || coalesce(description, ''))
);
create trigger tender_nodes_set_updated_at before update on public.tender_nodes for each row execute function public.set_updated_at();

create table public.tender_positions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  node_id uuid not null unique references public.tender_nodes(id) on delete cascade,
  raw_unit text,
  unit text,
  quantity_original numeric(14, 3),
  quantity_measured numeric(14, 3),
  quantity_manual numeric(14, 3),
  manual_note text check (manual_note is null or char_length(manual_note) <= 1000),
  quantity_selected_source text not null default 'original' check (quantity_selected_source in ('original', 'measured', 'manual')),
  quantity_selected numeric(14, 3),
  -- Prepared for contract → execution → invoicing, unused in V1.
  quantity_contractual numeric(14, 3),
  quantity_executed numeric(14, 3),
  quantity_invoiced numeric(14, 3),
  status text not null default 'imported' check (status in ('imported', 'to_review', 'validated', 'to_measure', 'measured', 'to_price', 'priced', 'complete', 'excluded')),
  excluded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.tender_positions (tender_id);
create trigger tender_positions_set_updated_at before update on public.tender_positions for each row execute function public.set_updated_at();

create table public.position_breakdowns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  position_id uuid not null references public.tender_positions(id) on delete cascade,
  code text not null check (char_length(code) between 1 and 40),
  label text,
  unit text,
  quantity_original numeric(14, 3),
  quantity_measured numeric(14, 3),
  quantity_manual numeric(14, 3),
  sort_order integer not null default 0,
  source_page integer,
  source_bbox jsonb,
  confidence numeric(4, 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.position_breakdowns (position_id, sort_order);
create index on public.position_breakdowns (tender_id);
create trigger position_breakdowns_set_updated_at before update on public.position_breakdowns for each row execute function public.set_updated_at();

-- Meaning of zone codes (PG, A-B…) — per tender, never a universal truth.
create table public.tender_zone_labels (
  tender_id uuid not null references public.tenders(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null check (char_length(code) between 1 and 40),
  label text check (label is null or char_length(label) <= 200),
  source text not null default 'user' check (source in ('document', 'user')),
  primary key (tender_id, code)
);

-- Prices: separate table so RLS can hide them without the Finances permission.
create table public.tender_position_prices (
  position_id uuid primary key references public.tender_positions(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  unit_price numeric(14, 4),
  price_source text check (price_source is null or price_source in ('document', 'manual', 'catalog', 'last_used', 'history_average', 'external')),
  -- As printed in the soumission, kept for the q × p ≈ montant check.
  document_unit_price numeric(14, 4),
  document_amount numeric(14, 2),
  amount numeric(14, 2),
  updated_at timestamptz not null default now()
);
create index on public.tender_position_prices (tender_id);
create trigger tender_position_prices_set_updated_at before update on public.tender_position_prices for each row execute function public.set_updated_at();

do $$
declare tbl text;
begin
  foreach tbl in array array['tender_documents', 'tender_nodes', 'tender_positions', 'position_breakdowns', 'tender_zone_labels', 'tender_position_prices'] loop
    execute format('create trigger %I before insert or update of tender_id, organization_id on public.%I for each row execute function public.tender_child_derive_org()', tbl || '_derive_org', tbl);
    execute format('alter table public.%I enable row level security', tbl);
  end loop;
  foreach tbl in array array['tender_documents', 'tender_nodes', 'tender_positions', 'position_breakdowns', 'tender_zone_labels'] loop
    execute format('create policy "tender readers" on public.%I for select using (public.can_access_tender(tender_id))', tbl);
    execute format('create policy "tender writers insert" on public.%I for insert with check (public.can_edit_tender(tender_id))', tbl);
    execute format('create policy "tender writers update" on public.%I for update using (public.can_edit_tender(tender_id))', tbl);
    execute format('create policy "tender writers delete" on public.%I for delete using (public.can_edit_tender(tender_id))', tbl);
  end loop;
end $$;

create policy "tender price readers" on public.tender_position_prices for select using (public.can_price_tender(tender_id));
create policy "tender price writers insert" on public.tender_position_prices for insert with check (public.can_price_tender(tender_id) and public.can_edit_tender(tender_id));
create policy "tender price writers update" on public.tender_position_prices for update using (public.can_price_tender(tender_id) and public.can_edit_tender(tender_id));
create policy "tender price writers delete" on public.tender_position_prices for delete using (public.can_price_tender(tender_id) and public.can_edit_tender(tender_id));

-- A position, its breakdowns and its price must belong to the same tender.
create or replace function public.tender_position_same_tender()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_table_name = 'tender_positions' then
    if not exists (select 1 from public.tender_nodes n where n.id = new.node_id and n.tender_id = new.tender_id) then
      raise exception 'Le nœud n''appartient pas à ce métré';
    end if;
  elsif not exists (select 1 from public.tender_positions p where p.id = new.position_id and p.tender_id = new.tender_id) then
    raise exception 'La position n''appartient pas à ce métré';
  end if;
  return new;
end;
$$;
create trigger tender_positions_same_tender before insert or update on public.tender_positions for each row execute function public.tender_position_same_tender();
create trigger position_breakdowns_same_tender before insert or update on public.position_breakdowns for each row execute function public.tender_position_same_tender();
create trigger tender_position_prices_same_tender before insert or update on public.tender_position_prices for each row execute function public.tender_position_same_tender();

create or replace function public.tender_nodes_same_tender()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.parent_id is not null and not exists (select 1 from public.tender_nodes n where n.id = new.parent_id and n.tender_id = new.tender_id) then
    raise exception 'Le parent n''appartient pas à ce métré';
  end if;
  return new;
end;
$$;
create trigger tender_nodes_same_tender before insert or update of parent_id, tender_id on public.tender_nodes for each row execute function public.tender_nodes_same_tender();

-- ---------------------------------------------------------------------------
-- Derived figures (same rules as lib/tenders/calc.ts)
-- ---------------------------------------------------------------------------
create or replace function public.tender_positions_select_quantity()
returns trigger language plpgsql set search_path = public as $$
begin
  new.quantity_selected := case new.quantity_selected_source
    when 'measured' then new.quantity_measured
    when 'manual' then new.quantity_manual
    else new.quantity_original
  end;
  return new;
end;
$$;
create trigger tender_positions_select_quantity before insert or update on public.tender_positions
for each row execute function public.tender_positions_select_quantity();

create or replace function public.tender_price_amount(p_position uuid, p_unit_price numeric)
returns numeric language sql stable set search_path = public as $$
  select case when p.excluded or p_unit_price is null or p.quantity_selected is null then null
    else round(p.quantity_selected * p_unit_price, 2) end
  from public.tender_positions p where p.id = p_position;
$$;

create or replace function public.tender_prices_compute_amount()
returns trigger language plpgsql set search_path = public as $$
begin
  new.amount := public.tender_price_amount(new.position_id, new.unit_price);
  return new;
end;
$$;
create trigger tender_prices_compute_amount before insert or update on public.tender_position_prices
for each row execute function public.tender_prices_compute_amount();

-- A quantity change re-prices the line. Runs as definer so a member without
-- the Finances permission still keeps the stored amount consistent.
create or replace function public.tender_positions_reprice()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.quantity_selected is distinct from old.quantity_selected or new.excluded is distinct from old.excluded then
    update public.tender_position_prices set amount = public.tender_price_amount(new.id, unit_price) where position_id = new.id;
  end if;
  return null;
end;
$$;
create trigger tender_positions_reprice after update on public.tender_positions
for each row execute function public.tender_positions_reprice();

-- ---------------------------------------------------------------------------
-- Audit (who changed a quantity, a unit or a price, from what to what)
-- ---------------------------------------------------------------------------
create table public.tender_audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  entity text not null,
  entity_id uuid not null,
  field text not null,
  old_value text,
  new_value text,
  actor uuid default auth.uid(),
  at timestamptz not null default now()
);
create index on public.tender_audit_log (tender_id, at desc);
alter table public.tender_audit_log enable row level security;
create policy "tender audit readers" on public.tender_audit_log for select using (public.can_access_tender(tender_id));

create or replace function public.tender_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  f text;
  fields text[];
  o jsonb := to_jsonb(old);
  n jsonb := to_jsonb(new);
begin
  fields := case tg_table_name
    when 'tender_positions' then array['unit', 'quantity_manual', 'quantity_selected_source', 'quantity_selected', 'excluded']
    when 'position_breakdowns' then array['quantity_manual', 'label']
    when 'tender_position_prices' then array['unit_price', 'price_source']
    else array[]::text[] end;
  foreach f in array fields loop
    if (o ->> f) is distinct from (n ->> f) then
      insert into public.tender_audit_log (organization_id, tender_id, entity, entity_id, field, old_value, new_value)
      values (new.organization_id, new.tender_id, tg_table_name,
        case when tg_table_name = 'tender_position_prices' then (n ->> 'position_id')::uuid else (n ->> 'id')::uuid end,
        f, o ->> f, n ->> f);
    end if;
  end loop;
  return null;
end;
$$;
create trigger tender_positions_audit after update on public.tender_positions for each row execute function public.tender_audit();
create trigger position_breakdowns_audit after update on public.position_breakdowns for each row execute function public.tender_audit();
create trigger tender_position_prices_audit after update on public.tender_position_prices for each row execute function public.tender_audit();

-- ---------------------------------------------------------------------------
-- Duplicate a tender (structure, quantities, zone labels; prices only when
-- the caller may see them).
-- ---------------------------------------------------------------------------
create or replace function public.duplicate_tender(p_tender uuid, p_name text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  src public.tenders;
  v_new uuid;
  with_prices boolean;
  node_map jsonb;
  pos_map jsonb;
begin
  select * into src from public.tenders where id = p_tender;
  if src.id is null or not public.can_access_tender(p_tender) or not public.org_has_tenders(src.organization_id) then
    raise exception 'Accès refusé';
  end if;
  with_prices := public.can_view_org_finances(src.organization_id);

  insert into public.tenders (project_id, name, number, kind, status, classification_type, cfc_code, cfc_label, language, currency,
    source_type, metadata, discount_percent, escompte_percent, vat_rate, sort_order)
  values (src.project_id, coalesce(nullif(trim(p_name), ''), src.name || ' (copie)'), src.number, src.kind, 'draft', src.classification_type,
    src.cfc_code, src.cfc_label, src.language, src.currency, 'duplicate', src.metadata, src.discount_percent, src.escompte_percent,
    src.vat_rate, src.sort_order + 1)
  returning id into v_new;

  -- old id → new id, so parents and positions can be re-linked.
  select coalesce(jsonb_object_agg(id, gen_random_uuid()), '{}'::jsonb) into node_map from public.tender_nodes where tender_id = p_tender;
  select coalesce(jsonb_object_agg(id, gen_random_uuid()), '{}'::jsonb) into pos_map from public.tender_positions where tender_id = p_tender;

  insert into public.tender_nodes (id, tender_id, parent_id, node_type, sort_order, depth, raw_number, position_path, display_reference,
    classification_type, cfc_code, can_chapter, can_position, can_version, can_language, is_reserved, title, description, raw_text,
    source_page, source_bbox, confidence, needs_review, validated_by, validated_at)
  select (node_map ->> n.id::text)::uuid, v_new, (node_map ->> n.parent_id::text)::uuid, n.node_type, n.sort_order, n.depth, n.raw_number,
    n.position_path, n.display_reference, n.classification_type, n.cfc_code, n.can_chapter, n.can_position, n.can_version, n.can_language,
    n.is_reserved, n.title, n.description, n.raw_text, n.source_page, n.source_bbox, n.confidence, n.needs_review, n.validated_by, n.validated_at
  from public.tender_nodes n
  where n.tender_id = p_tender
  order by n.depth;

  insert into public.tender_positions (id, tender_id, node_id, raw_unit, unit, quantity_original, quantity_measured, quantity_manual,
    manual_note, quantity_selected_source, status, excluded)
  select (pos_map ->> p.id::text)::uuid, v_new, (node_map ->> p.node_id::text)::uuid, p.raw_unit, p.unit, p.quantity_original, null,
    p.quantity_manual, p.manual_note,
    case when p.quantity_selected_source = 'measured' then 'original' else p.quantity_selected_source end, p.status, p.excluded
  from public.tender_positions p where p.tender_id = p_tender;

  insert into public.position_breakdowns (tender_id, position_id, code, label, unit, quantity_original, quantity_manual, sort_order,
    source_page, source_bbox, confidence)
  select v_new, (pos_map ->> b.position_id::text)::uuid, b.code, b.label, b.unit, b.quantity_original, b.quantity_manual, b.sort_order,
    b.source_page, b.source_bbox, b.confidence
  from public.position_breakdowns b where b.tender_id = p_tender;

  insert into public.tender_zone_labels (tender_id, code, label, source)
  select v_new, code, label, source from public.tender_zone_labels where tender_id = p_tender;

  if with_prices then
    insert into public.tender_position_prices (position_id, tender_id, unit_price, price_source, document_unit_price, document_amount)
    select (pos_map ->> pr.position_id::text)::uuid, v_new, pr.unit_price, pr.price_source, pr.document_unit_price, pr.document_amount
    from public.tender_position_prices pr where pr.tender_id = p_tender;
  end if;

  return v_new;
end;
$$;
grant execute on function public.duplicate_tender(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- The previous flat métré (metre_items) becomes one "Métré interne" per
-- chantier: sections → section nodes, lines → positions with a manual
-- quantity (they never came from a soumission). The old table stays,
-- read-only in the app, for one release.
-- ---------------------------------------------------------------------------
do $$
declare
  proj record;
  t_id uuid;
  sec record;
  sec_id uuid;
  item record;
  node_id uuid;
  pos_id uuid;
  i integer;
begin
  for proj in select distinct project_id from public.metre_items loop
    if exists (select 1 from public.tenders where project_id = proj.project_id and source_type = 'legacy') then
      continue;
    end if;
    insert into public.tenders (project_id, name, kind, status, classification_type, source_type)
    values (proj.project_id, 'Métré interne', 'interne', 'in_progress', 'CUSTOM', 'legacy')
    returning id into t_id;
    i := 0;
    for sec in
      select coalesce(nullif(trim(section), ''), '') as name, min(sort_order) as first_sort
      from public.metre_items where project_id = proj.project_id
      group by 1 order by 2
    loop
      sec_id := null;
      if sec.name <> '' then
        i := i + 1;
        insert into public.tender_nodes (tender_id, node_type, sort_order, depth, title)
        values (t_id, 'section', i * 1000, 0, sec.name) returning id into sec_id;
      end if;
      for item in
        select * from public.metre_items
        where project_id = proj.project_id and coalesce(nullif(trim(section), ''), '') = sec.name
        order by sort_order, created_at
      loop
        i := i + 1;
        insert into public.tender_nodes (tender_id, parent_id, node_type, sort_order, depth, raw_number, display_reference, title, classification_type)
        values (t_id, sec_id, 'billable_position', i * 1000, case when sec_id is null then 0 else 1 end,
          nullif(trim(item.reference), ''), nullif(trim(item.reference), ''), item.description, 'CUSTOM')
        returning id into node_id;
        insert into public.tender_positions (tender_id, node_id, raw_unit, unit, quantity_manual, quantity_selected_source, status)
        values (t_id, node_id, item.unit, item.unit, item.quantity, 'manual', case when item.unit_price > 0 then 'priced' else 'to_price' end)
        returning id into pos_id;
        if item.unit_price > 0 then
          insert into public.tender_position_prices (position_id, tender_id, unit_price, price_source)
          values (pos_id, t_id, item.unit_price, 'manual');
        end if;
      end loop;
    end loop;
  end loop;
end $$;
