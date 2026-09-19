-- Platform-side (Cantia-the-business, not a customer org) expense
-- tracking, so the admin dashboard can show real net profitability:
-- cash actually collected (admin-billing-overview's ca_total_chf, already
-- net of Stripe fees) minus what running the business costs — hosting,
-- tools, marketing, legal/accounting, etc. Same closed-RLS + security
-- definer RPC pattern as social_posts/tutorial_chapters.

create table public.platform_expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('hebergement', 'marketing', 'outils', 'domaine_email', 'juridique_comptable', 'autre')),
  label text not null,
  amount_chf numeric(10, 2) not null check (amount_chf >= 0),
  expense_date date not null default current_date,
  recurring boolean not null default false,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.platform_expenses (expense_date);

alter table public.platform_expenses enable row level security;
-- No self-service policy — only reachable through the admin_* functions
-- below, which re-check is_platform_admin() themselves.

create or replace function public.admin_list_platform_expenses()
returns setof public.platform_expenses
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select * from public.platform_expenses
  order by expense_date desc, created_at desc;
end;
$$;

create or replace function public.admin_upsert_platform_expense(
  expense_id uuid default null,
  p_category text default 'autre',
  p_label text default '',
  p_amount_chf numeric default 0,
  p_expense_date date default current_date,
  p_recurring boolean default false,
  p_notes text default null
)
returns public.platform_expenses
language plpgsql security definer set search_path = public as $$
declare
  result public.platform_expenses;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  if expense_id is null then
    insert into public.platform_expenses
      (category, label, amount_chf, expense_date, recurring, notes, created_by)
    values
      (p_category, p_label, p_amount_chf, p_expense_date, p_recurring, p_notes, auth.uid())
    returning * into result;
  else
    update public.platform_expenses set
      category = p_category,
      label = p_label,
      amount_chf = p_amount_chf,
      expense_date = p_expense_date,
      recurring = p_recurring,
      notes = p_notes,
      updated_at = now()
    where id = expense_id
    returning * into result;
  end if;

  return result;
end;
$$;

create or replace function public.admin_delete_platform_expense(expense_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  delete from public.platform_expenses where id = expense_id;
end;
$$;

revoke all on function public.admin_list_platform_expenses() from public;
revoke all on function public.admin_upsert_platform_expense(uuid, text, text, numeric, date, boolean, text) from public;
revoke all on function public.admin_delete_platform_expense(uuid) from public;

grant execute on function public.admin_list_platform_expenses() to authenticated;
grant execute on function public.admin_upsert_platform_expense(uuid, text, text, numeric, date, boolean, text) to authenticated;
grant execute on function public.admin_delete_platform_expense(uuid) to authenticated;
