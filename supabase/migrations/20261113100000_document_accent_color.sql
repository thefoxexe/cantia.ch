-- Document models (Compte → Apparence): besides the main colour, each
-- company picks a second, accent colour, used by the Angle, Plan and Épuré
-- models for their details (second triangle, crop marks, underline). Null
-- means the model's own default accent.
alter table public.organizations
  add column if not exists brand_accent_color text
    check (brand_accent_color is null or brand_accent_color ~ '^#[0-9A-Fa-f]{6}$');

-- organizations is updated column by column (grants per column).
grant update (brand_accent_color) on public.organizations to authenticated;

-- Same plan rule as the main colour.
create or replace function public.check_organization_branding_plan()
returns trigger language plpgsql set search_path = public as $$
begin
  if (new.brand_color is distinct from old.brand_color
      or new.brand_accent_color is distinct from old.brand_accent_color
      or new.logo_placement is distinct from old.logo_placement
      or new.footer_text is distinct from old.footer_text)
     and not public.org_has_customization(new.id) then
    raise exception 'La personnalisation de marque nécessite un plan payant (dès Indépendant).';
  end if;
  return new;
end;
$$;

notify pgrst, 'reload schema';
