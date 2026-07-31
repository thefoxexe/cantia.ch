-- Adds a 5th, purely additive layout option to pdf_templates: a free-form
-- block canvas ('custom'), alongside the 4 existing hand-coded base_layout
-- renderers ('preset', the default and the value of every row that exists
-- today — zero behavior change for anyone not opting in). base_layout stays
-- populated but unused when layout_mode is 'custom'.
alter table public.pdf_templates
  add column layout_mode text not null default 'preset' check (layout_mode in ('preset', 'custom')),
  add column blocks jsonb not null default '[]'::jsonb,
  add constraint pdf_templates_blocks_is_array check (jsonb_typeof(blocks) = 'array');

-- Reasonable non-empty starting point for a freshly created custom
-- template — coordinates are top-left/y-down (distance from the top of the
-- page), converted to pdf-lib's bottom-left/y-up space at render time in
-- pdf-blocks.ts. 'notes'/'photos' (report) and 'items_table'/'totals'
-- (devis) are the "flow" bindings — see pdf-blocks.ts for why their y is
-- only a starting point, not a fixed absolute position.
create or replace function public.default_pdf_blocks(p_kind text)
returns jsonb language sql immutable as $$
  select case p_kind
    when 'report' then '[
      {"id":"logo","binding":"logo","x":42,"y":30,"width":90,"height":40,"z":1},
      {"id":"title","binding":"document.title","x":150,"y":34,"width":300,"height":24,"z":1,"style":{"fontSize":16,"bold":true}},
      {"id":"meta","binding":"document.meta","x":150,"y":62,"width":300,"height":50,"z":1,"style":{"fontSize":10}},
      {"id":"divider","binding":"divider","x":42,"y":120,"width":511,"height":1,"z":1,"style":{"shapeKind":"line"}},
      {"id":"notes","binding":"notes","x":42,"y":132,"width":511,"height":90,"z":1,"style":{"fontSize":10}},
      {"id":"photos","binding":"photos","x":42,"y":230,"width":511,"height":560,"z":1},
      {"id":"signature","binding":"signature","x":400,"y":760,"width":150,"height":50,"z":1}
    ]'::jsonb
    else '[
      {"id":"logo","binding":"logo","x":42,"y":30,"width":100,"height":44,"z":1},
      {"id":"title","binding":"document.title","x":160,"y":34,"width":290,"height":24,"z":1,"style":{"fontSize":16,"bold":true}},
      {"id":"meta","binding":"document.meta","x":160,"y":62,"width":290,"height":60,"z":1,"style":{"fontSize":10}},
      {"id":"divider","binding":"divider","x":42,"y":130,"width":511,"height":1,"z":1,"style":{"shapeKind":"line"}},
      {"id":"items","binding":"items_table","x":42,"y":142,"width":511,"height":400,"z":1},
      {"id":"totals","binding":"totals","x":330,"y":0,"width":223,"height":80,"z":1},
      {"id":"signature","binding":"signature","x":400,"y":760,"width":150,"height":50,"z":1}
    ]'::jsonb
  end;
$$;

-- CREATE OR REPLACE can't change a function's parameter list in place — it
-- would just add a second, overloaded 5-arg version alongside the existing
-- 4-arg one, and every 4-arg call site (create_pdf_template(org, kind,
-- layout, name)) would then be ambiguous between the two. Drop the old
-- signature first so only one version of this function exists.
drop function if exists public.create_pdf_template(uuid, text, text, text);

create or replace function public.create_pdf_template(
  p_org uuid, p_kind text, p_base_layout text, p_name text,
  p_layout_mode text default 'preset'
)
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
  if p_layout_mode not in ('preset', 'custom') then
    raise exception 'layout_mode invalide';
  end if;
  insert into public.pdf_templates (organization_id, name, kind, base_layout, is_default, sections, layout_mode, blocks)
  values (
    p_org, p_name, p_kind, p_base_layout, false,
    case when p_kind = 'report' then '["intro","photos","signature"]'::jsonb else '[]'::jsonb end,
    p_layout_mode,
    case when p_layout_mode = 'custom' then public.default_pdf_blocks(p_kind) else '[]'::jsonb end
  )
  returning * into new_row;
  return new_row;
end;
$$;
grant execute on function public.create_pdf_template(uuid, text, text, text, text) to authenticated;

-- Previously omitted layout_mode/blocks from the copy — duplicating a
-- custom template used to silently revert it to an empty preset row.
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
    brand_color_override, logo_placement_override, footer_text_override,
    layout_mode, blocks
  )
  values (
    src.organization_id, p_name, src.kind, src.base_layout, false, src.sections,
    src.brand_color_override, src.logo_placement_override, src.footer_text_override,
    src.layout_mode, src.blocks
  )
  returning * into new_row;
  return new_row;
end;
$$;
grant execute on function public.duplicate_pdf_template(uuid, text) to authenticated;

-- Saves the block canvas — the write path the (future) visual editor's
-- "Enregistrer" calls. Same gating pattern as every other write RPC here.
create or replace function public.update_pdf_template_blocks(p_template uuid, p_blocks jsonb)
returns public.pdf_templates language plpgsql security definer set search_path = public as $$
declare
  org uuid;
  new_row public.pdf_templates;
begin
  if jsonb_typeof(p_blocks) is distinct from 'array' then
    raise exception 'blocks doit être un tableau';
  end if;
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
  update public.pdf_templates set blocks = p_blocks, updated_at = now()
  where id = p_template
  returning * into new_row;
  return new_row;
end;
$$;
grant execute on function public.update_pdf_template_blocks(uuid, jsonb) to authenticated;
