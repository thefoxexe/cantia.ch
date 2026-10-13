-- Cantia Relief: the company as a living 3D miniature, built by the AI from
-- what the owner dictates about the business and its process
-- (supabase/functions/relief-build), then fed by the company's real data
-- (projects, today's planning, tasks, money) in the app (app/(app)/relief.tsx).
--
-- One world per organization. The row is written only by the build function
-- (service role); members read it.

create table if not exists public.relief_worlds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  status text not null default 'building' check (status in ('building', 'ready', 'failed')),
  -- What the owner dictated or typed about the business.
  brief text not null check (char_length(brief) between 1 and 8000),
  -- The world plan produced by the AI (lib/relief/types.ts ReliefSpec).
  spec jsonb,
  error text,
  requested_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ready_at timestamptz
);

create trigger relief_worlds_set_updated_at before update on public.relief_worlds
for each row execute function public.set_updated_at();

alter table public.relief_worlds enable row level security;

create policy "members can view their relief world" on public.relief_worlds
  for select using (public.is_org_member(organization_id));

-- Realtime: the app waits on the row while the world is being built.
alter publication supabase_realtime add table public.relief_worlds;

-- Paid add-on: granted per organization by a platform admin, then switched
-- on by the organization's own admin (lib/modules.ts hasModule).
insert into public.modules (key, name, description, category, visibility, status)
values (
  'relief',
  'Cantia Relief',
  'L’entreprise en maquette 3D vivante, construite par l’IA selon votre métier et reliée à vos projets, au planning et aux tâches.',
  'premium',
  'private',
  'beta'
)
on conflict (key) do nothing;

-- Notifications sent when a world is ready (or could not be built).
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (
  type = any (array[
    'devis_stale_draft', 'devis_expiring_soon', 'facture_overdue', 'recurring_expense_due',
    'extra_work_accepted', 'feed_message', 'devis_accepted', 'join_request_received',
    'payslip_ready', 'devis_bounced', 'devis_viewed', 'fiduciary_access_request',
    'fiduciary_access_update', 'fiduciary_request', 'email_bounced', 'email_replied',
    'facture_viewed', 'relief_ready', 'relief_failed'
  ])
) not valid;
