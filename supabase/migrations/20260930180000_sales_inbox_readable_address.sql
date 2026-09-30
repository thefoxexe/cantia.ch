-- The Cantia address of each organization is built from its name
-- ("WebAlp.ch" -> webalp@suivi.cantia.ch) instead of 12 random characters,
-- so clients see something clear in "Répondre à". Set automatically, not
-- editable. The previous addresses stay valid (legacy_tokens): e-mails
-- already sent carry them as Reply-To.

alter table public.sales_email_settings
  add column if not exists legacy_tokens text[] not null default '{}';

create index if not exists sales_email_settings_legacy_tokens_idx
  on public.sales_email_settings using gin (legacy_tokens);

-- Local part from a company name: lower case, no accents, no ".ch" /
-- ".com", no legal form (SA, Sàrl, GmbH, AG…), words joined by "-".
create or replace function public.sales_inbox_base(p_name text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  v text := lower(coalesce(p_name, ''));
begin
  v := translate(v, 'àáâãäåçèéêëìíîïñòóôõöùúûüýÿœæß', 'aaaaaaceeeeiiiinooooouuuuyyoas');
  v := regexp_replace(v, '\.(ch|swiss|com|net|org|li|fr|de|it|eu)\s*$', '');
  v := regexp_replace(v, '[''’`]', '', 'g');
  v := regexp_replace(v, '[^a-z0-9]+', ' ', 'g');
  v := regexp_replace(v, '\s(sa|sarl|sagl|gmbh|ag|snc|sas|sarl|ltd|inc|co|cie|et cie)\s*$', '');
  v := trim(v);
  v := regexp_replace(v, '\s+', '-', 'g');
  if length(v) > 40 then
    v := regexp_replace(left(v, 40), '-[^-]*$', '');
  end if;
  v := trim(both '-' from v);
  if length(v) < 2 or v in ('noreply', 'no-reply', 'info', 'admin', 'support', 'postmaster', 'abuse', 'contact', 'cantia', 'suivi') then
    v := concat_ws('-', nullif(v, ''), 'entreprise');
  end if;
  return v;
end;
$$;

-- A free local part for this organization: the base, else base-2, base-3…
create or replace function public.sales_inbox_free_token(p_org_id uuid, p_base text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_candidate text := p_base;
  v_n int := 1;
begin
  while exists (
    select 1 from public.sales_email_settings s
    where s.organization_id <> p_org_id and (s.inbox_token = v_candidate or v_candidate = any (s.legacy_tokens))
  ) loop
    v_n := v_n + 1;
    v_candidate := p_base || '-' || v_n;
  end loop;
  return v_candidate;
end;
$$;

-- New settings rows get the readable address.
create or replace function public.sales_email_settings_set_token()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  select name into v_name from public.organizations where id = new.organization_id;
  new.inbox_token := public.sales_inbox_free_token(new.organization_id, public.sales_inbox_base(v_name));
  return new;
end;
$$;

drop trigger if exists sales_email_settings_set_token on public.sales_email_settings;
create trigger sales_email_settings_set_token
  before insert on public.sales_email_settings
  for each row execute function public.sales_email_settings_set_token();

-- Existing organizations: readable address, the old one kept as an alias.
do $$
declare
  r record;
  v_name text;
begin
  for r in select organization_id, inbox_token from public.sales_email_settings loop
    select name into v_name from public.organizations where id = r.organization_id;
    update public.sales_email_settings
      set legacy_tokens = array_append(legacy_tokens, r.inbox_token),
          inbox_token = public.sales_inbox_free_token(r.organization_id, public.sales_inbox_base(v_name)),
          updated_at = now()
      where organization_id = r.organization_id;
  end loop;
end $$;

-- "Nouvelle adresse" (address leaked, spam): the name plus a short random
-- part; the previous address stops working on purpose.
create or replace function public.regenerate_sales_inbox(p_org_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_token text;
begin
  if not (public.can_view_org_finances(p_org_id) and public.org_has_sales_tracking(p_org_id)) then
    raise exception 'Accès refusé';
  end if;
  select name into v_name from public.organizations where id = p_org_id;
  v_token := public.sales_inbox_free_token(p_org_id, public.sales_inbox_base(v_name) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
  insert into public.sales_email_settings (organization_id) values (p_org_id)
  on conflict (organization_id) do nothing;
  update public.sales_email_settings set inbox_token = v_token, legacy_tokens = '{}', updated_at = now() where organization_id = p_org_id;
  return v_token;
end;
$$;

-- The webhook's lookup: an address (current or previous) -> organization.
create or replace function public.sales_inbox_lookup(p_tokens text[])
returns table (organization_id uuid, enabled boolean, reply_delivery text)
language sql
stable
security definer
set search_path = public
as $$
  select s.organization_id, s.enabled, s.reply_delivery
  from public.sales_email_settings s
  where s.inbox_token = any (p_tokens) or s.legacy_tokens && p_tokens
  limit 1;
$$;

revoke all on function public.sales_inbox_lookup(text[]) from public, anon, authenticated;
grant execute on function public.sales_inbox_lookup(text[]) to service_role;
revoke all on function public.sales_inbox_free_token(uuid, text) from public, anon, authenticated;
