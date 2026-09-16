-- "Signer maintenant" — en plus du flux existant (lien envoyé par e-mail,
-- vérifié par token + e-mail du client, voir accept_public_extra_work),
-- un membre de l'équipe peut aussi faire signer le client en direct sur sa
-- propre tablette pendant que celui-ci est encore sur place. Même logique
-- métier que le flux public (passe à accepted, capture la signature,
-- convertit en facture), mais l'accès est vérifié via la session de
-- l'artisan (can_view_org_finances) plutôt que via un token public.
create or replace function public.accept_extra_work_live(
  p_extra_work_id uuid,
  p_signer_name text,
  p_signature_data text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_work public.extra_works%rowtype;
begin
  select * into v_work from public.extra_works where id = p_extra_work_id;
  if not found then
    raise exception 'Travaux supplémentaires introuvables';
  end if;
  if not public.can_view_org_finances(v_work.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if trim(coalesce(p_signer_name, '')) = '' then
    raise exception 'Le nom du signataire est requis';
  end if;
  if trim(coalesce(p_signature_data, '')) = '' then
    raise exception 'Une signature est requise';
  end if;
  if v_work.status = 'refused' then
    raise exception 'Ces travaux supplémentaires ont été refusés et ne peuvent plus être acceptés';
  end if;

  if v_work.status <> 'accepted' then
    update public.extra_works
    set status = 'accepted',
        client_signed_at = now(),
        client_signer_name = p_signer_name,
        client_signature_data = p_signature_data
    where id = v_work.id;

    perform public.convert_extra_work_to_facture_internal(v_work.id);
  end if;

  select * into v_work from public.extra_works where id = v_work.id;
  return jsonb_build_object('status', v_work.status, 'client_signed_at', v_work.client_signed_at);
end;
$$;

grant execute on function public.accept_extra_work_live(uuid, text, text) to authenticated;
revoke execute on function public.accept_extra_work_live(uuid, text, text) from anon;
