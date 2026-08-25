-- bastien@cantia.ch now exists (created after the earlier seed migrations
-- ran, which only found bastienryser20004@gmail.com at the time). Add it
-- as a platform admin too — both addresses stay valid super-admins.
insert into public.platform_admins (user_id)
select id from auth.users where email = 'bastien@cantia.ch'
on conflict (user_id) do nothing;
