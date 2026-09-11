-- Real ownership-transfer flow, closing the gap 20260828100000 explicitly
-- left open ("Ownership transfer needs a real flow (out of scope of this
-- fix)"): organization_members' RLS policies forbid promoting anyone to
-- 'owner' or touching an existing owner's row from the client, so the swap
-- can only happen through a SECURITY DEFINER function that enforces the
-- real invariant (still exactly one owner) itself. The email-confirmation
-- step means a member can't be made owner without knowingly accepting —
-- the token only becomes usable by the account it was addressed to.

create table public.organization_ownership_transfers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  resolved_at timestamptz
);

-- Only one transfer in flight per organization at a time — starting a new
-- one while another is pending would leave two competing tokens live.
create unique index organization_ownership_transfers_one_pending
  on public.organization_ownership_transfers (organization_id)
  where status = 'pending';

alter table public.organization_ownership_transfers enable row level security;

-- Only the two people involved can see a transfer row (the danger-zone
-- screen reads this directly to show a pending-transfer banner to either
-- side). No insert/update/delete policies: every write goes through the
-- functions below, which check the real invariants themselves.
create policy "parties can view their ownership transfer"
  on public.organization_ownership_transfers for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create or replace function public.initiate_ownership_transfer(target_user_id uuid)
returns table (transfer_id uuid, token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_from uuid := auth.uid();
  v_token text;
  v_id uuid;
begin
  if v_from is null then
    raise exception 'Non authentifié.';
  end if;

  select organization_id into v_org_id
  from public.organization_members
  where user_id = v_from and role = 'owner';

  if v_org_id is null then
    raise exception 'Seul le propriétaire peut transférer la propriété.';
  end if;

  if target_user_id = v_from then
    raise exception 'Choisissez un autre membre.';
  end if;

  if not exists (
    select 1 from public.organization_members
    where organization_id = v_org_id and user_id = target_user_id and role in ('admin', 'member')
  ) then
    raise exception 'Ce membre ne fait pas partie de votre entreprise.';
  end if;

  if exists (
    select 1 from public.organization_ownership_transfers
    where organization_id = v_org_id and status = 'pending'
  ) then
    raise exception 'Un transfert est déjà en attente pour cette entreprise.';
  end if;

  v_token := encode(extensions.gen_random_bytes(24), 'hex');

  insert into public.organization_ownership_transfers (organization_id, from_user_id, to_user_id, token)
  values (v_org_id, v_from, target_user_id, v_token)
  returning id into v_id;

  return query select v_id, v_token;
end;
$$;

grant execute on function public.initiate_ownership_transfer(uuid) to authenticated;

create or replace function public.cancel_ownership_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  update public.organization_ownership_transfers
  set status = 'cancelled', resolved_at = now()
  where id = p_transfer_id
    and status = 'pending'
    and (from_user_id = v_uid or to_user_id = v_uid);

  if not found then
    raise exception 'Transfert introuvable ou déjà résolu.';
  end if;
end;
$$;

grant execute on function public.cancel_ownership_transfer(uuid) to authenticated;

create or replace function public.confirm_ownership_transfer(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.organization_ownership_transfers%rowtype;
begin
  if v_uid is null then
    raise exception 'Non authentifié.';
  end if;

  select * into v_row
  from public.organization_ownership_transfers
  where token = p_token and status = 'pending'
  for update;

  if not found then
    raise exception 'Ce lien de transfert est invalide ou a déjà été utilisé.';
  end if;

  if v_row.expires_at < now() then
    update public.organization_ownership_transfers set status = 'expired', resolved_at = now() where id = v_row.id;
    raise exception 'Ce lien de transfert a expiré.';
  end if;

  if v_uid <> v_row.to_user_id then
    raise exception 'Ce transfert n''est pas destiné à ce compte. Connectez-vous avec le compte invité.';
  end if;

  -- Atomic swap: demote the current owner to admin (they keep their access,
  -- just not the owner-only powers), promote the target to owner. Both
  -- updates target a single known row each, so there's never a moment with
  -- zero or two owners.
  update public.organization_members set role = 'admin'
  where organization_id = v_row.organization_id and user_id = v_row.from_user_id and role = 'owner';

  update public.organization_members set role = 'owner'
  where organization_id = v_row.organization_id and user_id = v_row.to_user_id;

  update public.organization_ownership_transfers
  set status = 'confirmed', resolved_at = now()
  where id = v_row.id;
end;
$$;

grant execute on function public.confirm_ownership_transfer(text) to authenticated;

notify pgrst, 'reload schema';
