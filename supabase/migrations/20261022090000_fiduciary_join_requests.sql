-- A new user on accounting.cantia.ch either creates a fiduciary or asks to
-- join an existing one. The request waits until an owner or administrator
-- of that fiduciary accepts it (with a role) or declines it; both sides get
-- an e-mail. No payment step: the fiduciary space is free.

create table if not exists public.fiduciary_join_requests (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  message text,
  status text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED')),
  role text check (role in ('ADMIN', 'MEMBER')),
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists fiduciary_join_requests_one_pending
  on public.fiduciary_join_requests (user_id) where status = 'PENDING';
create index if not exists fiduciary_join_requests_firm on public.fiduciary_join_requests (firm_id, status);

alter table public.fiduciary_join_requests enable row level security;
-- Read and written only through the functions below.

-- Fiduciaries a new user can ask to join (name or city, two letters at least).
create or replace function public.acc_find_firms(p_query text)
returns table (id uuid, name text, city text)
language sql
stable
security definer
set search_path to 'public'
as $$
  select f.id, f.name, f.city
  from public.fiduciary_firms f
  where auth.uid() is not null
    and f.status <> 'BLOCKED'
    and length(trim(coalesce(p_query, ''))) >= 2
    and (f.name ilike '%' || trim(p_query) || '%' or f.city ilike '%' || trim(p_query) || '%')
  order by (f.name ilike trim(p_query) || '%') desc, f.name
  limit 12;
$$;

create or replace function public.acc_request_join(p_firm uuid, p_first_name text, p_last_name text, p_message text default null)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_email text;
  v_firm public.fiduciary_firms%rowtype;
  v_id uuid;
  r record;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if exists (select 1 from public.fiduciary_members where user_id = auth.uid()) then
    raise exception 'Ce compte fait déjà partie d''une fiduciaire.';
  end if;
  if length(trim(coalesce(p_first_name, ''))) < 1 or length(trim(coalesce(p_last_name, ''))) < 1 then
    raise exception 'Prénom et nom sont requis.';
  end if;
  select * into v_firm from public.fiduciary_firms where id = p_firm and status <> 'BLOCKED';
  if v_firm.id is null then raise exception 'Fiduciaire introuvable.'; end if;
  select email into v_email from auth.users where id = auth.uid();

  update public.fiduciary_join_requests set status = 'CANCELLED', decided_at = now()
  where user_id = auth.uid() and status = 'PENDING';

  insert into public.fiduciary_join_requests (firm_id, user_id, first_name, last_name, email, message)
  values (p_firm, auth.uid(), trim(p_first_name), trim(p_last_name), lower(v_email), nullif(left(trim(coalesce(p_message, '')), 500), ''))
  returning id into v_id;

  perform public.fiduciary_audit(p_firm, null, 'join_requested', jsonb_build_object('email', lower(v_email)));
  for r in select email from public.fiduciary_firm_admin_emails(p_firm) loop
    perform public.fiduciary_queue_email('join_request', r.email, v_firm.locale, jsonb_build_object(
      'firm_name', v_firm.name,
      'first_name', trim(p_first_name),
      'contact_name', trim(p_first_name) || ' ' || trim(p_last_name),
      'details', lower(v_email),
      'title', nullif(left(trim(coalesce(p_message, '')), 500), '')
    ));
  end loop;
  return v_id;
end;
$$;

create or replace function public.acc_my_join_request()
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select jsonb_build_object('id', j.id, 'firm_id', j.firm_id, 'firm_name', f.name, 'firm_city', f.city, 'created_at', j.created_at)
  from public.fiduciary_join_requests j join public.fiduciary_firms f on f.id = j.firm_id
  where j.user_id = auth.uid() and j.status = 'PENDING'
  order by j.created_at desc
  limit 1;
$$;

create or replace function public.acc_cancel_join_request()
returns void
language sql
security definer
set search_path to 'public'
as $$
  update public.fiduciary_join_requests set status = 'CANCELLED', decided_at = now()
  where user_id = auth.uid() and status = 'PENDING';
$$;

-- Pending requests of the caller's fiduciary (owners and administrators).
create or replace function public.acc_join_requests()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null or public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', j.id, 'first_name', j.first_name, 'last_name', j.last_name, 'email', j.email,
      'message', j.message, 'created_at', j.created_at) order by j.created_at)
    from public.fiduciary_join_requests j where j.firm_id = v_firm and j.status = 'PENDING'), '[]'::jsonb);
end;
$$;

create or replace function public.acc_respond_join_request(p_id uuid, p_accept boolean, p_role text default 'MEMBER')
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_f public.fiduciary_firms%rowtype;
  v_req public.fiduciary_join_requests%rowtype;
  v_role text := case when p_role = 'ADMIN' then 'ADMIN' else 'MEMBER' end;
begin
  if v_firm is null or public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Accès refusé'; end if;
  if v_role = 'ADMIN' and public.my_fiduciary_role() <> 'OWNER' then raise exception 'Seul le propriétaire peut nommer un administrateur.'; end if;
  select * into v_req from public.fiduciary_join_requests where id = p_id and firm_id = v_firm and status = 'PENDING' for update;
  if v_req.id is null then raise exception 'Demande introuvable ou déjà traitée.'; end if;
  select * into v_f from public.fiduciary_firms where id = v_firm;

  if p_accept then
    if exists (select 1 from public.fiduciary_members where user_id = v_req.user_id) then
      update public.fiduciary_join_requests set status = 'CANCELLED', decided_by = auth.uid(), decided_at = now() where id = p_id;
      raise exception 'Cette personne fait déjà partie d''une fiduciaire.';
    end if;
    insert into public.fiduciary_members (firm_id, user_id, role, first_name, last_name, email)
    values (v_firm, v_req.user_id, v_role, v_req.first_name, v_req.last_name, v_req.email);
    update public.fiduciary_join_requests set status = 'ACCEPTED', role = v_role, decided_by = auth.uid(), decided_at = now() where id = p_id;
    -- An invitation sent to the same address is no longer needed.
    update public.fiduciary_invitations set status = 'CANCELLED'
    where firm_id = v_firm and kind = 'STAFF' and status = 'PENDING' and lower(email) = lower(v_req.email);
    perform public.fiduciary_audit(v_firm, null, 'join_accepted', jsonb_build_object('email', v_req.email, 'role', v_role));
  else
    update public.fiduciary_join_requests set status = 'DECLINED', decided_by = auth.uid(), decided_at = now() where id = p_id;
    perform public.fiduciary_audit(v_firm, null, 'join_declined', jsonb_build_object('email', v_req.email));
  end if;

  perform public.fiduciary_queue_email(case when p_accept then 'join_accepted' else 'join_declined' end, v_req.email, v_f.locale,
    jsonb_build_object('firm_name', v_f.name, 'first_name', v_req.first_name, 'role', v_role, 'accepted', p_accept));
end;
$$;

-- Joining by request or by invitation closes any other pending request.
create or replace function public.fiduciary_join_requests_close_others()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  update public.fiduciary_join_requests set status = 'CANCELLED', decided_at = now()
  where user_id = new.user_id and status = 'PENDING' and firm_id <> new.firm_id;
  return new;
end;
$$;

create or replace trigger fiduciary_join_requests_close_others after insert on public.fiduciary_members
for each row execute function public.fiduciary_join_requests_close_others();

revoke all on function public.acc_find_firms(text) from public, anon;
revoke all on function public.acc_request_join(uuid, text, text, text) from public, anon;
revoke all on function public.acc_my_join_request() from public, anon;
revoke all on function public.acc_cancel_join_request() from public, anon;
revoke all on function public.acc_join_requests() from public, anon;
revoke all on function public.acc_respond_join_request(uuid, boolean, text) from public, anon;
revoke all on function public.fiduciary_join_requests_close_others() from public, anon, authenticated;
grant execute on function public.acc_find_firms(text) to authenticated;
grant execute on function public.acc_request_join(uuid, text, text, text) to authenticated;
grant execute on function public.acc_my_join_request() to authenticated;
grant execute on function public.acc_cancel_join_request() to authenticated;
grant execute on function public.acc_join_requests() to authenticated;
grant execute on function public.acc_respond_join_request(uuid, boolean, text) to authenticated;
