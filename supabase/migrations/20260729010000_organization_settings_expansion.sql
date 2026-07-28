alter table public.organizations
  add column phone text,
  add column email text,
  add column website text,
  add column default_vat_rate numeric(5,2) not null default 8.1,
  add column devis_validity_days integer not null default 30,
  add column devis_terms text;
