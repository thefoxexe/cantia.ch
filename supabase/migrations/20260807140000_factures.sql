-- Facture module: a devis, once "accepted", can be converted into its own
-- tracked invoice — separate numbering, due date, paid/unpaid status — so a
-- user isn't stuck sending the quote itself as the payment document. Mirrors
-- the devis/devis_items/devis_status_history shape closely on purpose (same
-- RLS pattern, same PDF renderers downstream).
create type public.facture_status as enum ('draft', 'sent', 'paid', 'cancelled');

create sequence public.facture_number_seq;

create table public.factures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  devis_id uuid references public.devis(id) on delete set null,
  template_id uuid references public.pdf_templates(id) on delete set null,
  number text unique,
  client_name text not null,
  client_address text,
  client_email text,
  notes text,
  status public.facture_status not null default 'draft',
  vat_rate numeric(5,2) not null default 8.1,
  due_date date not null default (current_date + 30),
  paid_at timestamptz,
  pdf_path text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One facture per devis in v1 — a devis "accepted" converts once. Partial
-- index (not a plain unique constraint) since devis_id is nullable for
-- factures created without a source devis.
create unique index factures_devis_id_key on public.factures (devis_id) where devis_id is not null;
create index on public.factures (organization_id);

create or replace function public.set_facture_number()
returns trigger language plpgsql as $$
begin
  if new.number is null then
    new.number := 'FAC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.facture_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger factures_set_number before insert on public.factures
for each row execute function public.set_facture_number();

create trigger factures_set_updated_at before update on public.factures
for each row execute function public.set_updated_at();

create or replace function public.log_facture_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.facture_status_history (facture_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

alter table public.factures enable row level security;

create policy "members can view factures" on public.factures
  for select using (public.is_org_member(organization_id));
create policy "members can create factures" on public.factures
  for insert with check (public.is_org_member(organization_id));
create policy "members can update factures" on public.factures
  for update using (public.is_org_member(organization_id));
create policy "admins can delete factures" on public.factures
  for delete using (public.is_org_admin(organization_id));

create table public.facture_items (
  id uuid primary key default gen_random_uuid(),
  facture_id uuid not null references public.factures(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit text default 'pce',
  unit_price numeric(10,2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index on public.facture_items (facture_id);

alter table public.facture_items enable row level security;

create policy "members can view facture items" on public.facture_items
  for select using (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.is_org_member(f.organization_id)
  ));
create policy "members can manage facture items" on public.facture_items
  for insert with check (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.is_org_member(f.organization_id)
  ));
create policy "members can update facture items" on public.facture_items
  for update using (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.is_org_member(f.organization_id)
  ));
create policy "members can delete facture items" on public.facture_items
  for delete using (exists (
    select 1 from public.factures f where f.id = facture_items.facture_id and public.is_org_member(f.organization_id)
  ));

create table public.facture_status_history (
  id uuid primary key default gen_random_uuid(),
  facture_id uuid not null references public.factures(id) on delete cascade,
  status public.facture_status not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create trigger factures_log_status_change after insert or update on public.factures
for each row execute function public.log_facture_status_change();

alter table public.facture_status_history enable row level security;

create policy "members can view facture status history" on public.facture_status_history
  for select using (exists (
    select 1 from public.factures f where f.id = facture_status_history.facture_id and public.is_org_member(f.organization_id)
  ));

-- Converts an accepted devis into a facture, copying client/VAT info and
-- line items across. Security definer + explicit membership check (same
-- pattern as the pdf_templates CRUD RPCs) rather than relying only on RLS,
-- since this does a multi-table write in one call.
create or replace function public.convert_devis_to_facture(p_devis_id uuid, p_due_days integer default 30)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_devis public.devis%rowtype;
  v_facture_id uuid;
begin
  select * into v_devis from public.devis where id = p_devis_id;
  if not found then
    raise exception 'Devis introuvable';
  end if;
  if not public.is_org_member(v_devis.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if v_devis.status <> 'accepted' then
    raise exception 'Seul un devis accepté peut être transformé en facture';
  end if;

  insert into public.factures (
    organization_id, project_id, devis_id, template_id,
    client_name, client_address, client_email, notes,
    vat_rate, due_date, created_by
  ) values (
    v_devis.organization_id, v_devis.project_id, v_devis.id, v_devis.template_id,
    v_devis.client_name, v_devis.client_address, v_devis.client_email, v_devis.notes,
    v_devis.vat_rate, current_date + p_due_days, auth.uid()
  )
  returning id into v_facture_id;

  insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
  select v_facture_id, description, quantity, unit, unit_price, sort_order
  from public.devis_items
  where devis_id = v_devis.id;

  return v_facture_id;
end;
$$;
