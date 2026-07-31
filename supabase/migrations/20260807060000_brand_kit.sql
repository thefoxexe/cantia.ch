-- Brand kit: lets an org's PDF documents (devis + reports) use their own
-- color, logo placement and footer text instead of the hardcoded constants
-- every generate-*-pdf function used before this. Defaults reproduce the
-- exact previous hardcoded values so existing orgs' PDFs render unchanged
-- until they actually touch these settings.
alter table public.organizations
  add column brand_color text not null default '#1F3D3A',
  add column logo_placement text not null default 'right'
    check (logo_placement in ('left', 'center', 'right')),
  add column footer_text text;
