-- bastien@cantia.ch (used as the example address in the Super Admin spec)
-- doesn't exist as an auth.users row in this project — the actual account
-- used to sign in is bastienryser20004@gmail.com. Seed the real one so
-- access to /admin actually works; the cantia.ch seed in the previous
-- migration stays in place as a no-op today and activates on its own the
-- day that address signs up (e.g. after a domain migration).
insert into public.platform_admins (user_id)
select id from auth.users where email = 'bastienryser20004@gmail.com'
on conflict (user_id) do nothing;
