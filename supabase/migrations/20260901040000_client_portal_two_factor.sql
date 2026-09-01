-- Client portal 2-factor verification: knowing (or guessing) a client's
-- email address alone used to be enough to view their devis/facture
-- amounts through the public token link. This adds an emailed one-time
-- code as a second factor: the code-request step lives in an edge
-- function (it needs to send mail), verification and the resulting
-- short-lived session live here so every document RPC can require it.

create table public.public_document_verifications (
  id uuid primary key default gen_random_uuid(),
  document_token uuid not null,
  email text not null,
  code_hash text not null,
  attempts int not null default 0,
  verified boolean not null default false,
  session_token text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index public_document_verifications_lookup_idx
  on public.public_document_verifications (document_token, email, created_at desc);
create unique index public_document_verifications_session_idx
  on public.public_document_verifications (session_token) where session_token is not null;

-- No policies: this table is only ever touched by SECURITY DEFINER
-- functions below and by the request-portal-code edge function's
-- service-role client, both of which bypass RLS. Anon/authenticated get
-- zero direct access, which is the point.
alter table public.public_document_verifications enable row level security;

create or replace function public.verify_public_document_code(p_token uuid, p_email text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.public_document_verifications%rowtype;
  v_session text;
  v_expires timestamptz;
begin
  select * into v_row
  from public.public_document_verifications
  where document_token = p_token
    and email = lower(trim(p_email))
    and verified = false
    and expires_at > now()
  order by created_at desc
  limit 1;

  if not found then
    raise exception 'Code invalide ou expiré. Demandez un nouveau code.';
  end if;

  if v_row.attempts >= 5 then
    raise exception 'Trop de tentatives. Demandez un nouveau code.';
  end if;

  if v_row.code_hash <> encode(extensions.digest(trim(p_code), 'sha256'), 'hex') then
    update public.public_document_verifications set attempts = attempts + 1 where id = v_row.id;
    raise exception 'Code incorrect.';
  end if;

  v_session := encode(extensions.gen_random_bytes(24), 'hex');
  v_expires := now() + interval '60 minutes';

  update public.public_document_verifications
  set verified = true, session_token = v_session, expires_at = v_expires
  where id = v_row.id;

  return jsonb_build_object('session_token', v_session, 'expires_at', v_expires);
end;
$$;

grant execute on function public.verify_public_document_code(uuid, text, text) to anon, authenticated;

-- Shared by every public document RPC below and by the public-document-pdf
-- edge function (via admin.rpc, since it already bypasses RLS but this
-- keeps the check in exactly one place).
create or replace function public.has_valid_document_session(p_token uuid, p_email text, p_session text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.public_document_verifications
    where document_token = p_token
      and email = lower(trim(p_email))
      and session_token = p_session
      and verified = true
      and expires_at > now()
  );
$$;

grant execute on function public.has_valid_document_session(uuid, text, text) to anon, authenticated;

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
  if not public.has_valid_document_session(p_token, p_email, p_session) then
    raise exception 'Vérification requise';
  end if;

  select name, phone, street, postal_code, locality, address, ide_number
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
      'has_pdf', v_devis.pdf_path is not null
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
  if not public.has_valid_document_session(p_token, p_email, p_session) then
    raise exception 'Vérification requise';
  end if;

  select name, phone, street, postal_code, locality, address, ide_number
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
      'has_pdf', v_facture.pdf_path is not null
    ),
    'items', v_items,
    'totals', jsonb_build_object('subtotal', v_subtotal, 'vat', round(v_subtotal * v_facture.vat_rate / 100, 2), 'total', v_total),
    'paid', v_paid,
    'remaining', greatest(v_total - v_paid, 0),
    'organization', to_jsonb(v_org)
  );
end;
$$;

create or replace function public.accept_public_devis(p_token uuid, p_email text, p_signer_name text, p_signature_data text, p_session text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_devis public.devis%rowtype;
begin
  select * into v_devis from public.devis where public_token = p_token;
  if not found then
    raise exception 'Lien invalide';
  end if;
  if v_devis.client_email is null or lower(trim(v_devis.client_email)) <> lower(trim(p_email)) then
    raise exception 'Vérification impossible';
  end if;
  if not public.has_valid_document_session(p_token, p_email, p_session) then
    raise exception 'Vérification requise';
  end if;
  if trim(coalesce(p_signer_name, '')) = '' then
    raise exception 'Le nom du signataire est requis';
  end if;
  if trim(coalesce(p_signature_data, '')) = '' then
    raise exception 'Une signature est requise';
  end if;

  if v_devis.status = 'refused' then
    raise exception 'Ce devis a été refusé et ne peut plus être accepté en ligne';
  end if;

  if v_devis.status <> 'accepted' then
    update public.devis
    set status = 'accepted',
        client_signed_at = now(),
        client_signer_name = p_signer_name,
        client_signature_data = p_signature_data
    where id = v_devis.id;

    if not exists (select 1 from public.factures where devis_id = v_devis.id and not is_deposit) then
      perform public.convert_devis_to_facture_internal(v_devis.id);
    end if;
  end if;

  select * into v_devis from public.devis where id = v_devis.id;
  return jsonb_build_object('status', v_devis.status, 'client_signed_at', v_devis.client_signed_at);
end;
$$;

create or replace function public.list_client_documents(p_token uuid, p_kind text, p_email text, p_session text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_org_name text;
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
  if not public.has_valid_document_session(p_token, p_email, p_session) then
    raise exception 'Vérification requise';
  end if;

  select name into v_org_name from public.organizations where id = v_org_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'token', d.public_token, 'number', d.number, 'status', d.status,
    'created_at', d.created_at, 'project_name', p.name, 'has_pdf', d.pdf_path is not null
  ) order by d.created_at desc), '[]'::jsonb)
  into v_devis
  from public.devis d
  left join public.projects p on p.id = d.project_id
  where d.organization_id = v_org_id and lower(trim(d.client_email)) = lower(trim(p_email))
    and d.status <> 'draft';

  select coalesce(jsonb_agg(jsonb_build_object(
    'token', f.public_token, 'number', f.number, 'status', f.status, 'is_deposit', f.is_deposit,
    'created_at', f.created_at, 'project_name', p.name, 'has_pdf', f.pdf_path is not null
  ) order by f.created_at desc), '[]'::jsonb)
  into v_factures
  from public.factures f
  left join public.projects p on p.id = f.project_id
  where f.organization_id = v_org_id and lower(trim(f.client_email)) = lower(trim(p_email))
    and f.status <> 'draft';

  return jsonb_build_object('organization_name', v_org_name, 'devis', v_devis, 'factures', v_factures);
end;
$$;
