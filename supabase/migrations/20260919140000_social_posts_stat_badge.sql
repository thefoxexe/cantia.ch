alter table public.social_posts
  add column stat_value text,
  add column stat_label text,
  add column badge text;

create or replace function public.admin_upsert_social_post(
  post_id uuid default null,
  p_order_index integer default 0,
  p_topic text default '',
  p_headline text default '',
  p_subheadline text default '',
  p_instagram_caption text default '',
  p_linkedin_caption text default '',
  p_status text default 'idee',
  p_notes text default null,
  p_scene text default 'essai',
  p_stat_value text default null,
  p_stat_label text default null,
  p_badge text default null
)
returns public.social_posts
language plpgsql security definer set search_path = public as $$
declare
  result public.social_posts;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  if post_id is null then
    insert into public.social_posts
      (order_index, topic, headline, subheadline, instagram_caption, linkedin_caption, status, notes, scene, stat_value, stat_label, badge)
    values
      (p_order_index, p_topic, p_headline, p_subheadline, p_instagram_caption, p_linkedin_caption, p_status, p_notes, p_scene, p_stat_value, p_stat_label, p_badge)
    returning * into result;
  else
    update public.social_posts set
      order_index = p_order_index,
      topic = p_topic,
      headline = p_headline,
      subheadline = p_subheadline,
      instagram_caption = p_instagram_caption,
      linkedin_caption = p_linkedin_caption,
      status = p_status,
      notes = p_notes,
      scene = p_scene,
      stat_value = p_stat_value,
      stat_label = p_stat_label,
      badge = p_badge,
      updated_at = now()
    where id = post_id
    returning * into result;
  end if;

  return result;
end;
$$;

revoke all on function public.admin_upsert_social_post(uuid, integer, text, text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.admin_upsert_social_post(uuid, integer, text, text, text, text, text, text, text, text, text, text, text) to authenticated;

drop function if exists public.admin_upsert_social_post(uuid, integer, text, text, text, text, text, text, text, text);
