-- Why a company cancels its subscription. Two sources:
--   'app'    : the reason picked in Compte → Abonnement just before opening
--              Stripe's cancellation flow (app/(app)/compte/facturation.tsx);
--   'stripe' : Stripe's own cancellation_details (feedback + comment), when
--              the customer portal is set to ask for it (stripe-webhook).
-- Read in the admin panel (app/(admin)/organizations/[id].tsx and the
-- overview). Members can only add their own row; nobody edits or deletes.
create table if not exists public.subscription_cancellation_reasons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  source text not null check (source in ('app', 'stripe')),
  reason text,
  comment text check (comment is null or char_length(comment) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists subscription_cancellation_reasons_org_idx
  on public.subscription_cancellation_reasons (organization_id, created_at desc);

alter table public.subscription_cancellation_reasons enable row level security;

drop policy if exists "members add their own cancellation reason" on public.subscription_cancellation_reasons;
create policy "members add their own cancellation reason" on public.subscription_cancellation_reasons
  for insert to authenticated
  with check (source = 'app' and user_id = auth.uid() and public.is_org_member(organization_id));

drop policy if exists "platform admins read cancellation reasons" on public.subscription_cancellation_reasons;
create policy "platform admins read cancellation reasons" on public.subscription_cancellation_reasons
  for select to authenticated
  using (public.is_platform_admin());
