-- Admin › origine d'une inscription : ajoute la réponse à « Comment avez-vous
-- connu Cantia ? ». Patch of the live definition (only this key is added).
do $$
declare
  v_def text := pg_get_functiondef('public.admin_get_organization_origin'::regproc);
  v_new text;
begin
  if position('''acquisition''' in v_def) > 0 then
    return;
  end if;
  v_new := replace(
    v_def,
    '''signup_referrer'', o.signup_referrer,',
    '''signup_referrer'', o.signup_referrer,
    ''acquisition'', case when o.acquisition_source is null then null else jsonb_build_object(''source'', o.acquisition_source, ''detail'', o.acquisition_detail, ''at'', o.acquisition_answered_at) end,'
  );
  if v_new = v_def then
    raise exception 'admin_get_organization_origin: anchor not found';
  end if;
  execute v_new;
end;
$$;
