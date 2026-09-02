-- Extra-works ("travaux supplémentaires") public portal missed the same
-- organizations.locale exposure that 20260902090000_organization_document_
-- locale.sql already added to get_public_devis/get_public_facture/
-- list_client_documents — this closes that gap so the travaux-supplémentaires
-- -client screen can default to the org's document locale too.
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
      'created_at', v_work.created_at,
      'client_signed_at', v_work.client_signed_at, 'client_signer_name', v_work.client_signer_name
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

notify pgrst, 'reload schema';
