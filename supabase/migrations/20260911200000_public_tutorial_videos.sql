-- The admin Tutoriels page (app/(admin)/tutoriels) lets you set a YouTube
-- link and flip "Intégré sur le site" on, but the public /aide/videos page
-- never actually read from tutorial_chapters at all — it rendered a
-- completely separate hardcoded list (lib/tutorialVideos.ts) where every
-- youtubeId was null. Two disconnected systems; nothing published in the
-- admin panel could ever have shown up on the site. This wires them
-- together and adds the one thing tutorial_chapters was missing to do
-- it: talking_points is the internal recording script, not copy meant for
-- a visitor, so a real public-facing blurb needs its own field.
alter table public.tutorial_chapters add column public_description text;

create or replace function public.admin_upsert_tutorial_chapter(
  chapter_id uuid default null,
  p_order_index integer default 0,
  p_feature_area text default '',
  p_title text default '',
  p_talking_points text default '',
  p_status text default 'a_faire',
  p_youtube_url text default null,
  p_site_embed_done boolean default false,
  p_notes text default null,
  p_public_description text default null
)
returns public.tutorial_chapters
language plpgsql security definer set search_path = public as $$
declare
  result public.tutorial_chapters;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  if chapter_id is null then
    insert into public.tutorial_chapters
      (order_index, feature_area, title, talking_points, status, youtube_url, site_embed_done, notes, public_description)
    values
      (p_order_index, p_feature_area, p_title, p_talking_points, p_status, p_youtube_url, p_site_embed_done, p_notes, p_public_description)
    returning * into result;
  else
    update public.tutorial_chapters set
      order_index = p_order_index,
      feature_area = p_feature_area,
      title = p_title,
      talking_points = p_talking_points,
      status = p_status,
      youtube_url = p_youtube_url,
      site_embed_done = p_site_embed_done,
      notes = p_notes,
      public_description = p_public_description,
      updated_at = now()
    where id = chapter_id
    returning * into result;
  end if;

  return result;
end;
$$;

revoke all on function public.admin_upsert_tutorial_chapter(uuid, integer, text, text, text, text, text, boolean, text, text) from public;
revoke execute on function public.admin_upsert_tutorial_chapter(uuid, integer, text, text, text, text, text, boolean, text, text) from anon;
grant execute on function public.admin_upsert_tutorial_chapter(uuid, integer, text, text, text, text, text, boolean, text, text) to authenticated;

-- Genuinely public — no auth required, same trust level as the marketing
-- site's own plan pricing reads. Only ever exposes the fields a visitor
-- should see (never talking_points/notes, the internal production script),
-- and only for a chapter the admin has explicitly marked embedded.
create or replace function public.public_list_tutorial_videos()
returns table(id uuid, title text, public_description text, youtube_url text, order_index integer)
language sql stable security definer set search_path = public
as $$
  select id, title, public_description, youtube_url, order_index
  from public.tutorial_chapters
  where site_embed_done = true and youtube_url is not null
  order by order_index;
$$;

grant execute on function public.public_list_tutorial_videos() to anon, authenticated;

notify pgrst, 'reload schema';
