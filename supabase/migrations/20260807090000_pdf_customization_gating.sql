-- Gates the whole "personnalisation" surface (choosing among the 4 base
-- layouts, org brand kit, per-template overrides, creating/duplicating
-- templates) behind paid plans, same defense-in-depth pattern as
-- org_has_rtk/check_survey_points_plan: a DB-level check so a free-plan
-- member can't bypass the UI by calling the API directly. Free orgs keep
-- using their seeded default (classic layout, default brand color) —
-- nothing about generating documents itself is gated, only changing how
-- they look.
alter table public.plans add column has_customization boolean not null default true;
update public.plans set has_customization = false where id = 'free';

create or replace function public.org_has_customization(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce(p.has_customization, true)
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where o.id = org_id;
$$;

create or replace function public.check_organization_branding_plan()
returns trigger language plpgsql set search_path = public as $$
begin
  if (new.brand_color is distinct from old.brand_color
      or new.logo_placement is distinct from old.logo_placement
      or new.footer_text is distinct from old.footer_text)
     and not public.org_has_customization(new.id) then
    raise exception 'La personnalisation de marque nécessite un plan payant (dès Indépendant).';
  end if;
  return new;
end;
$$;

create trigger organizations_branding_requires_plan
before update on public.organizations
for each row execute function public.check_organization_branding_plan();

-- Per-template overrides: a template can carry its own color/logo
-- placement/footer, falling back to the org's brand kit when null. This is
-- what makes "create several templates and switch between them" actually
-- useful rather than every template just inheriting one org-wide look.
alter table public.pdf_templates
  add column brand_color_override text,
  add column logo_placement_override text check (logo_placement_override in ('left', 'center', 'right')),
  add column footer_text_override text;

-- Re-gate the existing default-switch RPC (same signature, just adds the
-- plan check before mutating).
create or replace function public.set_default_pdf_template(p_org uuid, p_template uuid, p_kind text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_org_admin(p_org) then
    raise exception 'not authorized';
  end if;
  if not public.org_has_customization(p_org) then
    raise exception 'La personnalisation des modèles PDF nécessite un plan payant (dès Indépendant).';
  end if;
  update public.pdf_templates set is_default = false where organization_id = p_org and kind = p_kind;
  update public.pdf_templates set is_default = true where id = p_template and organization_id = p_org and kind = p_kind;
end;
$$;

create or replace function public.create_pdf_template(p_org uuid, p_kind text, p_base_layout text, p_name text)
returns public.pdf_templates language plpgsql security definer set search_path = public as $$
declare
  new_row public.pdf_templates;
begin
  if not public.is_org_admin(p_org) then
    raise exception 'not authorized';
  end if;
  if not public.org_has_customization(p_org) then
    raise exception 'La personnalisation des modèles PDF nécessite un plan payant (dès Indépendant).';
  end if;
  insert into public.pdf_templates (organization_id, name, kind, base_layout, is_default, sections)
  values (
    p_org, p_name, p_kind, p_base_layout, false,
    case when p_kind = 'report' then '["intro","photos","signature"]'::jsonb else '[]'::jsonb end
  )
  returning * into new_row;
  return new_row;
end;
$$;
grant execute on function public.create_pdf_template(uuid, text, text, text) to authenticated;

create or replace function public.duplicate_pdf_template(p_template uuid, p_name text)
returns public.pdf_templates language plpgsql security definer set search_path = public as $$
declare
  src public.pdf_templates;
  new_row public.pdf_templates;
begin
  select * into src from public.pdf_templates where id = p_template;
  if src.id is null then
    raise exception 'template introuvable';
  end if;
  if not public.is_org_admin(src.organization_id) then
    raise exception 'not authorized';
  end if;
  if not public.org_has_customization(src.organization_id) then
    raise exception 'La personnalisation des modèles PDF nécessite un plan payant (dès Indépendant).';
  end if;
  insert into public.pdf_templates (
    organization_id, name, kind, base_layout, is_default, sections,
    brand_color_override, logo_placement_override, footer_text_override
  )
  values (
    src.organization_id, p_name, src.kind, src.base_layout, false, src.sections,
    src.brand_color_override, src.logo_placement_override, src.footer_text_override
  )
  returning * into new_row;
  return new_row;
end;
$$;
grant execute on function public.duplicate_pdf_template(uuid, text) to authenticated;

create or replace function public.update_pdf_template(
  p_template uuid,
  p_name text,
  p_brand_color_override text,
  p_logo_placement_override text,
  p_footer_text_override text
)
returns public.pdf_templates language plpgsql security definer set search_path = public as $$
declare
  org uuid;
  new_row public.pdf_templates;
begin
  select organization_id into org from public.pdf_templates where id = p_template;
  if org is null then
    raise exception 'template introuvable';
  end if;
  if not public.is_org_admin(org) then
    raise exception 'not authorized';
  end if;
  if not public.org_has_customization(org) then
    raise exception 'La personnalisation des modèles PDF nécessite un plan payant (dès Indépendant).';
  end if;
  update public.pdf_templates set
    name = coalesce(p_name, name),
    brand_color_override = p_brand_color_override,
    logo_placement_override = p_logo_placement_override,
    footer_text_override = p_footer_text_override,
    updated_at = now()
  where id = p_template
  returning * into new_row;
  return new_row;
end;
$$;
grant execute on function public.update_pdf_template(uuid, text, text, text, text) to authenticated;

create or replace function public.delete_pdf_template(p_template uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  org uuid;
  is_def boolean;
begin
  select organization_id, is_default into org, is_def from public.pdf_templates where id = p_template;
  if org is null then
    raise exception 'template introuvable';
  end if;
  if not public.is_org_admin(org) then
    raise exception 'not authorized';
  end if;
  if is_def then
    raise exception 'Impossible de supprimer le modèle actif — définissez-en un autre par défaut d''abord.';
  end if;
  delete from public.pdf_templates where id = p_template;
end;
$$;
grant execute on function public.delete_pdf_template(uuid) to authenticated;
