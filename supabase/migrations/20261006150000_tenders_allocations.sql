-- Métrés & Soumissions — phase E : d'une mesure sur plan aux quantités du métré.
--
-- quantity_allocations links a measured object to a position (N–N): one
-- wall feeds formwork, concrete and rebar; one position sums many walls.
-- Each link has a fixed formula (same table as lib/tenders/allocation.ts)
-- and its parameters (height, thickness, faces, kg/m³, number of times).
-- Quantities are always recomputed here from the measure; the position's
-- quantity_measured is the sum of its live links.

create table public.quantity_allocations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  position_id uuid not null references public.tender_positions(id) on delete cascade,
  breakdown_id uuid references public.position_breakdowns(id) on delete set null,
  measured_object_id uuid references public.measured_objects(id) on delete cascade,
  formula text not null check (formula in (
    'length', 'perimeter', 'area', 'count',
    'wall_area', 'wall_formwork', 'wall_volume', 'wall_rebar',
    'strip_area', 'strip_volume', 'slab_volume', 'slab_rebar', 'edge_formwork', 'manual'
  )),
  params jsonb not null default '{}'::jsonb,
  calculated_quantity numeric(14, 3),
  manual_adjustment numeric(14, 3) not null default 0,
  final_quantity numeric(14, 3),
  comment text check (comment is null or char_length(comment) <= 500),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index quantity_allocations_position_idx on public.quantity_allocations (position_id) where deleted_at is null;
create index quantity_allocations_object_idx on public.quantity_allocations (measured_object_id) where deleted_at is null;
create index quantity_allocations_tender_idx on public.quantity_allocations (tender_id);
create trigger quantity_allocations_set_updated_at before update on public.quantity_allocations for each row execute function public.set_updated_at();
alter table public.quantity_allocations enable row level security;

-- ---------------------------------------------------------------------------
-- Formula table (mirror of FORMULAS in lib/tenders/allocation.ts)
-- ---------------------------------------------------------------------------
create or replace function public.tender_alloc_quantity(p_formula text, p_kind text, p_length numeric, p_area numeric, p_perimeter numeric, p_count integer, p_params jsonb)
returns numeric language plpgsql immutable as $$
declare
  base numeric;
  q numeric;
  needs text[];
  k text;
  v numeric;
  factor numeric := coalesce(nullif(p_params->>'factor', '')::numeric, 1);
begin
  case p_formula
    when 'length' then base := coalesce(p_length, p_perimeter); needs := '{}';
    when 'perimeter' then base := coalesce(p_perimeter, p_length); needs := '{}';
    when 'area' then base := p_area; needs := '{}';
    when 'count' then base := p_count; needs := '{}';
    when 'wall_area' then base := coalesce(p_length, p_perimeter); needs := '{height}';
    when 'wall_formwork' then base := coalesce(p_length, p_perimeter); needs := '{height,faces}';
    when 'wall_volume' then base := coalesce(p_length, p_perimeter); needs := '{height,thickness}';
    when 'wall_rebar' then base := coalesce(p_length, p_perimeter); needs := '{height,thickness,rate}';
    when 'strip_area' then base := coalesce(p_length, p_perimeter); needs := '{width}';
    when 'strip_volume' then base := coalesce(p_length, p_perimeter); needs := '{width,height}';
    when 'slab_volume' then base := p_area; needs := '{thickness}';
    when 'slab_rebar' then base := p_area; needs := '{thickness,rate}';
    when 'edge_formwork' then base := coalesce(p_perimeter, p_length); needs := '{height}';
    else return null;
  end case;
  if base is null then return null; end if;
  q := base;
  foreach k in array needs loop
    v := coalesce(nullif(p_params->>k, '')::numeric, case k when 'faces' then 2 end);
    if v is null or v <= 0 then return null; end if;
    q := q * v;
  end loop;
  if factor > 0 then q := q * factor; end if;
  return round(q, 3);
end;
$$;

-- ---------------------------------------------------------------------------
-- Derivation + checks + computed quantity
-- ---------------------------------------------------------------------------
create or replace function public.quantity_allocations_compute()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pos record;
  m public.measured_objects%rowtype;
begin
  select p.tender_id, p.organization_id, t.project_id into pos
  from public.tender_positions p join public.tenders t on t.id = p.tender_id where p.id = new.position_id;
  if pos.tender_id is null then raise exception 'Position introuvable'; end if;
  new.tender_id := pos.tender_id;
  new.organization_id := pos.organization_id;
  if new.breakdown_id is not null and not exists (select 1 from public.position_breakdowns b where b.id = new.breakdown_id and b.position_id = new.position_id) then
    raise exception 'Ventilation d’une autre position';
  end if;
  if jsonb_typeof(new.params) <> 'object' then raise exception 'Paramètres invalides'; end if;
  if new.measured_object_id is not null then
    select * into m from public.measured_objects where id = new.measured_object_id;
    if m.id is null or m.project_id <> pos.project_id then raise exception 'Mesure d’un autre chantier'; end if;
    if new.formula = 'manual' then raise exception 'Formule manquante'; end if;
    new.calculated_quantity := case when m.deleted_at is null
      then public.tender_alloc_quantity(new.formula, m.kind, m.length_m, m.area_m2, m.perimeter_m, m.count, new.params) end;
  else
    -- Manual line (no plan): the quantity is the adjustment itself.
    new.formula := 'manual';
    new.calculated_quantity := 0;
  end if;
  new.final_quantity := case when new.calculated_quantity is null then null else round(new.calculated_quantity + new.manual_adjustment, 3) end;
  return new;
end;
$$;
create trigger quantity_allocations_compute before insert or update on public.quantity_allocations
for each row execute function public.quantity_allocations_compute();

-- Sum of the live links → tender_positions.quantity_measured (and the
-- breakdown it targets). Null when nothing is linked any more.
create or replace function public.tender_position_remeasure(p_position uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.tender_positions p set quantity_measured = (
    select round(sum(a.final_quantity), 3)
    from public.quantity_allocations a where a.position_id = p.id and a.deleted_at is null and a.final_quantity is not null
  ) where p.id = p_position;
  update public.position_breakdowns b set quantity_measured = (
    select round(sum(a.final_quantity), 3) from public.quantity_allocations a where a.breakdown_id = b.id and a.deleted_at is null
  ) where b.position_id = p_position;
end;
$$;

create or replace function public.quantity_allocations_after()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op <> 'INSERT' then perform public.tender_position_remeasure(old.position_id); end if;
  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and new.position_id is distinct from old.position_id) then
    perform public.tender_position_remeasure(new.position_id);
  end if;
  return null;
end;
$$;
create trigger quantity_allocations_after after insert or update or delete on public.quantity_allocations
for each row execute function public.quantity_allocations_after();

-- A measure redrawn, recalibrated or deleted: its links follow.
create or replace function public.measured_objects_reallocate()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.quantity_allocations set params = params where measured_object_id = new.id and deleted_at is null;
  return null;
end;
$$;
create trigger measured_objects_reallocate after update on public.measured_objects
for each row when (
  old.length_m is distinct from new.length_m or old.area_m2 is distinct from new.area_m2
  or old.perimeter_m is distinct from new.perimeter_m or old.count is distinct from new.count
  or old.deleted_at is distinct from new.deleted_at
)
execute function public.measured_objects_reallocate();

-- ---------------------------------------------------------------------------
-- RLS: allowed to edit the métré (and to see the plan, for a measure link)
-- ---------------------------------------------------------------------------
create policy "allocation readers" on public.quantity_allocations for select using (public.can_access_tender(tender_id));
create policy "allocation writers insert" on public.quantity_allocations for insert with check (public.can_edit_tender(tender_id));
create policy "allocation writers update" on public.quantity_allocations for update using (public.can_edit_tender(tender_id));
create policy "allocation writers delete" on public.quantity_allocations for delete using (public.can_edit_tender(tender_id));
