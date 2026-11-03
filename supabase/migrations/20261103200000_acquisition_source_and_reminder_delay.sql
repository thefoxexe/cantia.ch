-- 1. « Comment avez-vous connu Cantia ? » (onboarding › création de
--    l'entreprise). Answer kept on the company, set once by its owner.
alter table public.organizations
  add column if not exists acquisition_source text,
  add column if not exists acquisition_detail text,
  add column if not exists acquisition_answered_at timestamptz;

create or replace function public.set_acquisition_source(p_organization_id uuid, p_source text, p_detail text default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_source not in ('bouche_a_oreille', 'google', 'ia', 'reseaux_sociaux', 'fiduciaire', 'publicite', 'autre') then
    raise exception 'Réponse inconnue';
  end if;
  if not exists (
    select 1 from public.organization_members m
    where m.organization_id = p_organization_id and m.user_id = auth.uid() and m.role = 'owner'
  ) then
    raise exception 'Accès refusé';
  end if;
  update public.organizations
  set acquisition_source = p_source,
      acquisition_detail = nullif(left(trim(coalesce(p_detail, '')), 200), ''),
      acquisition_answered_at = now()
  where id = p_organization_id and acquisition_source is null;
end;
$$;

revoke all on function public.set_acquisition_source(uuid, text, text) from public;
grant execute on function public.set_acquisition_source(uuid, text, text) to authenticated;

-- 2. The signup reminder (send-signup-reminder-email) goes out after 2 days
--    instead of 3.
create or replace function public.send_incomplete_signup_reminders()
returns void
language plpgsql security definer set search_path = public, vault as $$
declare
  v_org record;
  v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'dispatch_secret';

  for v_org in
    select id from public.organizations
    where plan_id is null
      and plan_selected = false
      and created_at < now() - interval '2 days'
      and signup_reminder_email_sent_at is null
  loop
    perform net.http_post(
      url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/send-signup-reminder-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Dispatch-Secret', coalesce(v_secret, '')
      ),
      body := jsonb_build_object('organization_id', v_org.id)
    );
  end loop;
end;
$$;

revoke all on function public.send_incomplete_signup_reminders() from public;
revoke execute on function public.send_incomplete_signup_reminders() from anon, authenticated;
