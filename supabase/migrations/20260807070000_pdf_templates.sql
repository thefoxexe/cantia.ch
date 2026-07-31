-- Turns the existing-but-unused report_templates table into a shared catalog
-- for BOTH devis and report PDF templates, replacing devis's separate
-- single-column setting (organizations.devis_template) with real rows an org
-- can eventually create/duplicate/customize (Phase 3). The rename preserves
-- the reports.template_id FK and existing RLS policies automatically.
alter table public.report_templates rename to pdf_templates;

alter table public.pdf_templates
  add column kind text not null default 'report' check (kind in ('devis', 'report')),
  add column base_layout text not null default 'classic'
    check (base_layout in ('classic', 'moderne', 'minimal', 'structure')),
  add column is_default boolean not null default false,
  add column sections jsonb not null default '["intro","photos","signature"]'::jsonb,
  add column updated_at timestamptz not null default now();

create trigger pdf_templates_set_updated_at before update on public.pdf_templates
for each row execute function public.set_updated_at();

-- Every existing row is the single report template create_organization()
-- seeded at signup (never touched by app code since) — mark it as that org's
-- default report template. kind/base_layout already backfilled to
-- 'report'/'classic' by the column defaults above.
update public.pdf_templates set is_default = true;

-- Seed the 4 devis layouts per org, defaulting to whichever one the org had
-- already picked via the old single-column setting.
insert into public.pdf_templates (organization_id, name, kind, base_layout, is_default, sections)
select
  o.id,
  case bl.base_layout
    when 'classic' then 'Classique'
    when 'moderne' then 'Moderne'
    when 'minimal' then 'Minimal'
    else 'Structuré'
  end,
  'devis',
  bl.base_layout,
  bl.base_layout = case when o.devis_template in ('classic', 'moderne', 'minimal', 'structure') then o.devis_template else 'classic' end,
  '[]'::jsonb
from public.organizations o
cross join (values ('classic'), ('moderne'), ('minimal'), ('structure')) as bl(base_layout);

-- Per-document override, unused by the UI until Phase 3 but resolved by
-- generate-devis-pdf from day one (falls back to the org's default row).
alter table public.devis add column template_id uuid references public.pdf_templates(id) on delete set null;

-- Reseed the 4 devis rows + 1 report row for every new org going forward.
create or replace function public.create_organization(org_name text, org_trade text default null)
returns public.organizations
language plpgsql security definer set search_path = public as $$
declare
  new_org public.organizations;
begin
  insert into public.organizations (name, trade) values (org_name, org_trade)
  returning * into new_org;

  insert into public.organization_members (organization_id, user_id, role, full_name)
  values (new_org.id, auth.uid(), 'owner', coalesce(auth.jwt() ->> 'email', ''));

  insert into public.pdf_templates (organization_id, name, kind, base_layout, is_default, sections) values
    (new_org.id, 'Rapport de chantier standard', 'report', 'classic', true, '["intro","photos","signature"]'::jsonb),
    (new_org.id, 'Classique', 'devis', 'classic', true, '[]'::jsonb),
    (new_org.id, 'Moderne', 'devis', 'moderne', false, '[]'::jsonb),
    (new_org.id, 'Minimal', 'devis', 'minimal', false, '[]'::jsonb),
    (new_org.id, 'Structuré', 'devis', 'structure', false, '[]'::jsonb);

  return new_org;
end;
$$;

-- Atomic default-swap: unsets the previous default before setting the new
-- one, admin-gated server-side (the table's own RLS "members can update
-- templates" policy is intentionally broader — same permissiveness the old
-- report_templates table already had before this migration — this function
-- is what the picker UI actually calls to change an org's active template).
create or replace function public.set_default_pdf_template(p_org uuid, p_template uuid, p_kind text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_org_admin(p_org) then
    raise exception 'not authorized';
  end if;
  update public.pdf_templates set is_default = false where organization_id = p_org and kind = p_kind;
  update public.pdf_templates set is_default = true where id = p_template and organization_id = p_org and kind = p_kind;
end;
$$;

grant execute on function public.set_default_pdf_template(uuid, uuid, text) to authenticated;
