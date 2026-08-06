-- Beyond storage/team size, the only differentiator between plans so far
-- was the free plan's devis/facture monthly cap and RTK access. This adds
-- the feature-level gates confirmed by the user: automated e-mail sending
-- (devis/facture send + reminders), the Planning and Rentabilité modules,
-- a trames library cap, and a monthly AI-usage quota (voice dictation,
-- report polishing, devis-line generation — these cost real money per
-- call, so free needs a cap rather than a hard block to stay usable).
alter table public.plans
  add column has_email_sending boolean not null default true,
  add column has_planning boolean not null default true,
  add column has_profitability boolean not null default true,
  add column max_trames integer,
  add column max_ai_uses_per_month integer;

update public.plans set
  has_email_sending = false,
  has_planning = false,
  has_profitability = false,
  max_trames = 0,
  max_ai_uses_per_month = 10
where id = 'free';

update public.plans set
  has_email_sending = true,
  has_planning = false,
  has_profitability = false,
  max_trames = null,
  max_ai_uses_per_month = null
where id = 'solo';

update public.plans set
  has_email_sending = true,
  has_planning = true,
  has_profitability = true,
  max_trames = null,
  max_ai_uses_per_month = null
where id in ('equipe', 'pro');

-- ==========================================================================
-- Trames library cap — a trigger (like the existing devis/facture monthly
-- quota) rather than app-level checking alone, since devis_trames is
-- inserted into directly from the client (lib/api/trames.ts), not through
-- an RPC choke point.
-- ==========================================================================
create or replace function public.check_trames_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_count integer;
begin
  select p.max_trames into v_limit
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where o.id = new.organization_id;

  if v_limit is null then
    return new;
  end if;

  select count(*) into v_count from public.devis_trames where organization_id = new.organization_id;

  if v_count >= v_limit then
    if v_limit = 0 then
      raise exception 'La bibliothèque de trames n''est pas disponible sur le plan gratuit. Passez à un plan payant pour l''utiliser.';
    end if;
    raise exception 'Limite de % trames atteinte sur votre plan. Passez à un plan supérieur pour en ajouter.', v_limit;
  end if;

  return new;
end;
$$;

drop trigger if exists devis_trames_check_quota on public.devis_trames;
create trigger devis_trames_check_quota before insert on public.devis_trames
for each row execute function public.check_trames_quota();

-- ==========================================================================
-- AI usage quota — voice transcription, report note polishing, and devis
-- line generation from dictation all call an external AI API per use (real
-- cost per call), so the free plan gets a monthly count instead of an
-- outright block. One shared log table + one RPC called by all three
-- edge functions before doing the actual (paid) work.
-- ==========================================================================
create table public.ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index on public.ai_usage_log (organization_id, created_at);

alter table public.ai_usage_log enable row level security;

create policy "members can view ai usage" on public.ai_usage_log
  for select using (public.is_org_member(organization_id));

-- No insert/update/delete policy for authenticated — every write goes
-- through check_and_log_ai_usage (SECURITY DEFINER) below, never a direct
-- client insert, so a client can't log a phantom "use" to inflate history
-- or (more relevantly) simply skip logging to dodge the quota.

create or replace function public.check_and_log_ai_usage(p_organization_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_count integer;
begin
  if not public.is_org_member(p_organization_id) then
    raise exception 'Accès refusé';
  end if;

  select p.max_ai_uses_per_month into v_limit
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where o.id = p_organization_id;

  if v_limit is not null then
    select count(*) into v_count
    from public.ai_usage_log
    where organization_id = p_organization_id and created_at >= date_trunc('month', now());

    if v_count >= v_limit then
      return false;
    end if;
  end if;

  insert into public.ai_usage_log (organization_id, created_by) values (p_organization_id, auth.uid());
  return true;
end;
$$;

grant execute on function public.check_and_log_ai_usage(uuid) to authenticated;
