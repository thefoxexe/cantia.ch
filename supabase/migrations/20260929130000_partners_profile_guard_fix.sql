-- The guard on partner_profiles was security definer, so it also reverted
-- the masked IBAN written by set_partner_payout_account() itself. As a
-- security invoker trigger, current_user is the caller's role: the guard
-- applies to direct API writes (authenticated) and lets the validated,
-- audited security definer RPCs through.
create or replace function public.partner_profiles_guard()
returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') and not public.has_platform_permission('partners.admin') then
    new.status := old.status;
    new.payouts_frozen := old.payouts_frozen;
    new.user_id := old.user_id;
    new.iban_masked := old.iban_masked;
    new.payout_account_holder := old.payout_account_holder;
  end if;
  return new;
end;
$$;
