-- Per-document language override, on top of the org-wide default added by
-- 20260902090000_organization_document_locale.sql. That migration covers
-- the normal case (a business always documents in one language), but an
-- org occasionally serving a client in the other language needs a single
-- devis/facture/extra-work to render (portal, PDF, email) in that other
-- language without changing its whole default. NULL keeps inheriting the
-- org's locale — nothing changes for existing rows or orgs that never touch
-- this. Gated by plan (see has_document_locale_override below): a small
-- upsell, not core functionality every plan needs.
alter table public.devis
  add column if not exists locale text check (locale in ('fr', 'de'));
alter table public.factures
  add column if not exists locale text check (locale in ('fr', 'de'));
alter table public.extra_works
  add column if not exists locale text check (locale in ('fr', 'de'));

alter table public.plans
  add column if not exists has_document_locale_override boolean not null default false;

update public.plans set has_document_locale_override = true
  where id in ('equipe', 'pro', 'illimite', 'custom', 'decouverte');

-- Expose the document's own override alongside the org's default so the
-- client-portal screens can coalesce (document locale wins when set).
create or replace function public.get_public_devis(p_token uuid, p_email text, p_session text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_devis public.devis%rowtype;
  v_org record;
  v_items jsonb;
  v_subtotal numeric;
begin
  select * into v_devis from public.devis where public_token = p_token;
  if not found then
    raise exception 'Lien invalide';
  end if;
  if v_devis.client_email is null or lower(trim(v_devis.client_email)) <> lower(trim(p_email)) then
    raise exception 'Vérification impossible';
  end if;
  if not public.has_valid_document_session(p_email, p_session) then
    raise exception 'Vérification requise';
  end if;

  select name, phone, street, postal_code, locality, address, ide_number, locale
  into v_org
  from public.organizations where id = v_devis.organization_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'description', description, 'quantity', quantity,
    'unit', unit, 'unit_price', unit_price, 'sort_order', sort_order
  ) order by sort_order), '[]'::jsonb), coalesce(sum(quantity * unit_price), 0)
  into v_items, v_subtotal
  from public.devis_items where devis_id = v_devis.id;

  return jsonb_build_object(
    'devis', jsonb_build_object(
      'id', v_devis.id, 'number', v_devis.number, 'status', v_devis.status,
      'client_name', v_devis.client_name, 'client_address', v_devis.client_address,
      'notes', v_devis.notes, 'vat_rate', v_devis.vat_rate, 'created_at', v_devis.created_at,
      'client_signed_at', v_devis.client_signed_at, 'client_signer_name', v_devis.client_signer_name,
      'has_pdf', v_devis.pdf_path is not null, 'locale', v_devis.locale
    ),
    'items', v_items,
    'totals', jsonb_build_object(
      'subtotal', v_subtotal,
      'vat', round(v_subtotal * v_devis.vat_rate / 100, 2),
      'total', round(v_subtotal * (1 + v_devis.vat_rate / 100), 2)
    ),
    'organization', to_jsonb(v_org)
  );
end;
$$;

create or replace function public.get_public_facture(p_token uuid, p_email text, p_session text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_facture public.factures%rowtype;
  v_org record;
  v_items jsonb;
  v_subtotal numeric;
  v_total numeric;
  v_paid numeric;
begin
  select * into v_facture from public.factures where public_token = p_token;
  if not found then
    raise exception 'Lien invalide';
  end if;
  if v_facture.client_email is null or lower(trim(v_facture.client_email)) <> lower(trim(p_email)) then
    raise exception 'Vérification impossible';
  end if;
  if not public.has_valid_document_session(p_email, p_session) then
    raise exception 'Vérification requise';
  end if;

  select name, phone, street, postal_code, locality, address, ide_number, locale
  into v_org
  from public.organizations where id = v_facture.organization_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'description', description, 'quantity', quantity,
    'unit', unit, 'unit_price', unit_price, 'sort_order', sort_order
  ) order by sort_order), '[]'::jsonb), coalesce(sum(quantity * unit_price), 0)
  into v_items, v_subtotal
  from public.facture_items where facture_id = v_facture.id;

  v_total := round(v_subtotal * (1 + v_facture.vat_rate / 100), 2);

  select coalesce(sum(amount), 0) into v_paid
  from public.facture_payments where facture_id = v_facture.id;

  return jsonb_build_object(
    'facture', jsonb_build_object(
      'id', v_facture.id, 'number', v_facture.number, 'status', v_facture.status,
      'is_deposit', v_facture.is_deposit,
      'client_name', v_facture.client_name, 'client_address', v_facture.client_address,
      'notes', v_facture.notes, 'vat_rate', v_facture.vat_rate,
      'due_date', v_facture.due_date, 'paid_at', v_facture.paid_at, 'created_at', v_facture.created_at,
      'has_pdf', v_facture.pdf_path is not null, 'locale', v_facture.locale
    ),
    'items', v_items,
    'totals', jsonb_build_object('subtotal', v_subtotal, 'vat', round(v_subtotal * v_facture.vat_rate / 100, 2), 'total', v_total),
    'paid', v_paid,
    'remaining', greatest(v_total - v_paid, 0),
    'organization', to_jsonb(v_org)
  );
end;
$$;

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

  select name, phone, street, postal_code, locality, address, ide_number, locale
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
      'created_at', v_work.created_at, 'client_signed_at', v_work.client_signed_at,
      'client_signer_name', v_work.client_signer_name, 'locale', v_work.locale
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

-- Per-document locale surfaced in the mixed devis+factures list too, so a
-- future list-view language cue (or a client filtering by language) has it
-- available; list_client_documents still defaults the page itself to the
-- org's locale (a mixed list can't render two languages of chrome at once).
create or replace function public.list_client_documents(p_token uuid, p_kind text, p_email text, p_session text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_org_name text;
  v_org_locale text;
  v_devis jsonb;
  v_factures jsonb;
begin
  if p_kind = 'devis' then
    select organization_id into v_org_id from public.devis
    where public_token = p_token and client_email is not null
      and lower(trim(client_email)) = lower(trim(p_email));
  elsif p_kind = 'facture' then
    select organization_id into v_org_id from public.factures
    where public_token = p_token and client_email is not null
      and lower(trim(client_email)) = lower(trim(p_email));
  else
    raise exception 'Type de document invalide';
  end if;

  if v_org_id is null then
    raise exception 'Vérification impossible';
  end if;
  if not public.has_valid_document_session(p_email, p_session) then
    raise exception 'Vérification requise';
  end if;

  select name, locale into v_org_name, v_org_locale from public.organizations where id = v_org_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'token', d.public_token, 'number', d.number, 'status', d.status,
    'created_at', d.created_at, 'project_name', p.name, 'has_pdf', d.pdf_path is not null,
    'locale', d.locale
  ) order by d.created_at desc), '[]'::jsonb)
  into v_devis
  from public.devis d
  left join public.projects p on p.id = d.project_id
  where d.organization_id = v_org_id and lower(trim(d.client_email)) = lower(trim(p_email))
    and d.status <> 'draft';

  select coalesce(jsonb_agg(jsonb_build_object(
    'token', f.public_token, 'number', f.number, 'status', f.status, 'is_deposit', f.is_deposit,
    'created_at', f.created_at, 'project_name', p.name, 'has_pdf', f.pdf_path is not null,
    'locale', f.locale
  ) order by f.created_at desc), '[]'::jsonb)
  into v_factures
  from public.factures f
  left join public.projects p on p.id = f.project_id
  where f.organization_id = v_org_id and lower(trim(f.client_email)) = lower(trim(p_email))
    and f.status <> 'draft';

  return jsonb_build_object(
    'organization_name', v_org_name,
    'organization_locale', v_org_locale,
    'devis', v_devis,
    'factures', v_factures
  );
end;
$$;

notify pgrst, 'reload schema';
