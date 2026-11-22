-- A member's own settings (language, name, photo, signature) live on their
-- organization_members row, but the only update policy on that table is
-- "admins can update non-owner members" (20260828100000). So a plain member,
-- and the owner too, could never save them: PostgREST filtered the row out,
-- the update touched nothing and returned no error. The language was the
-- visible part: the app saved Italian, the database kept French, and every
-- reload of the organization switched the app back to French.
--
-- A policy letting members update their own row would also let them change
-- their own role or role_id, so this goes through a function that writes
-- only these four columns, on the caller's own row.

create or replace function public.update_my_member_profile(p_organization_id uuid, p_changes jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_locale text := p_changes ->> 'locale';
  v_count int;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_changes ? 'locale' and (v_locale is null or v_locale not in ('fr', 'de', 'it')) then
    raise exception 'invalid locale' using errcode = '22023';
  end if;

  update public.organization_members
  set
    locale = case when p_changes ? 'locale' then v_locale else locale end,
    full_name = case when p_changes ? 'full_name' then nullif(btrim(p_changes ->> 'full_name'), '') else full_name end,
    avatar_url = case when p_changes ? 'avatar_url' then p_changes ->> 'avatar_url' else avatar_url end,
    signature_url = case when p_changes ? 'signature_url' then p_changes ->> 'signature_url' else signature_url end
  where organization_id = p_organization_id
    and user_id = auth.uid();

  get diagnostics v_count = row_count;
  if v_count = 0 then
    raise exception 'not a member of this organization' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.update_my_member_profile(uuid, jsonb) from public, anon;
grant execute on function public.update_my_member_profile(uuid, jsonb) to authenticated;

notify pgrst, 'reload schema';
