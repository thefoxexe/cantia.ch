-- Lets a client who already proved control of an email (via one valid
-- devis/facture public_token) browse every other devis/facture they have
-- with the same organization under that same email — grouped by chantier
-- in the client app. Reuses the exact same token+email verification as
-- get_public_devis/get_public_facture; the anchor document is just the
-- entry point, the returned list can include other documents' tokens too
-- since the caller has already demonstrated the same proof of ownership
-- required to open any one of them individually.
create or replace function public.list_client_documents(p_token uuid, p_kind text, p_email text)
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

  select name into v_org_name from public.organizations where id = v_org_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'token', d.public_token, 'number', d.number, 'status', d.status,
    'created_at', d.created_at, 'project_name', p.name
  ) order by d.created_at desc), '[]'::jsonb)
  into v_devis
  from public.devis d
  left join public.projects p on p.id = d.project_id
  where d.organization_id = v_org_id and lower(trim(d.client_email)) = lower(trim(p_email));

  select coalesce(jsonb_agg(jsonb_build_object(
    'token', f.public_token, 'number', f.number, 'status', f.status, 'is_deposit', f.is_deposit,
    'created_at', f.created_at, 'project_name', p.name
  ) order by f.created_at desc), '[]'::jsonb)
  into v_factures
  from public.factures f
  left join public.projects p on p.id = f.project_id
  where f.organization_id = v_org_id and lower(trim(f.client_email)) = lower(trim(p_email));

  return jsonb_build_object('organization_name', v_org_name, 'devis', v_devis, 'factures', v_factures);
end;
$$;

grant execute on function public.list_client_documents(uuid, text, text) to anon, authenticated;
