-- The Cantia mailbox is on by default, replies delivered both in the app and
-- to the company's address ("both"). Every organization gets its settings
-- row (readable address from its name, trigger sales_email_settings_set_token);
-- it only takes effect on a plan with sales tracking (checked when sending
-- and when filing), so nothing changes for the other plans until they
-- upgrade. A company can still switch it off in E-mails › Réglages.
alter table public.sales_email_settings alter column enabled set default true;

insert into public.sales_email_settings (organization_id)
select o.id from public.organizations o
where not exists (select 1 from public.sales_email_settings s where s.organization_id = o.id);

create or replace function public.trg_seed_sales_email_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.sales_email_settings (organization_id) values (new.id)
  on conflict (organization_id) do nothing;
  return new;
end;
$$;

revoke all on function public.trg_seed_sales_email_settings() from public, anon, authenticated;

drop trigger if exists organizations_seed_sales_email_settings on public.organizations;
create trigger organizations_seed_sales_email_settings
after insert on public.organizations
for each row execute function public.trg_seed_sales_email_settings();
