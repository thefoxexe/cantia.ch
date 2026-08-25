-- bastienryser20004@gmail.com was an early/personal account seeded as a
-- platform admin alongside bastien@cantia.ch; only the cantia.ch account
-- should carry platform-admin rights going forward.
delete from public.platform_admins pa
using auth.users u
where pa.user_id = u.id and u.email = 'bastienryser20004@gmail.com';
