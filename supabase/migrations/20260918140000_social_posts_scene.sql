-- Adds the illustration scene picker to social_posts. The generator
-- (lib/socialIllustrations.ts) ships 7 isometric scenes matching the paid
-- ad creatives' visual language; each post picks the one that fits its
-- topic instead of a generic mountain-photo band.

alter table public.social_posts
  add column scene text not null default 'essai'
  check (scene in ('devis', 'chantier', 'facture', 'equipe', 'rentabilite', 'signature', 'essai'));

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
  p_scene text default 'essai'
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
      (order_index, topic, headline, subheadline, instagram_caption, linkedin_caption, status, notes, scene)
    values
      (p_order_index, p_topic, p_headline, p_subheadline, p_instagram_caption, p_linkedin_caption, p_status, p_notes, p_scene)
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
      updated_at = now()
    where id = post_id
    returning * into result;
  end if;

  return result;
end;
$$;

revoke all on function public.admin_upsert_social_post(uuid, integer, text, text, text, text, text, text, text, text) from public;
grant execute on function public.admin_upsert_social_post(uuid, integer, text, text, text, text, text, text, text, text) to authenticated;

-- The old 9-arg overload is gone now that p_scene was added — drop it so
-- PostgREST/clients can't resolve to a stale signature missing the column.
drop function if exists public.admin_upsert_social_post(uuid, integer, text, text, text, text, text, text, text);

-- Map the 8 existing seeded posts onto the scene that fits their topic.
update public.social_posts set scene = 'devis' where topic = $$Devis à la voix$$;
update public.social_posts set scene = 'facture' where topic = $$Facturation & QR-facture$$;
update public.social_posts set scene = 'chantier' where topic = $$Rapports de chantier$$;
update public.social_posts set scene = 'equipe' where topic = $$RH & salaires$$;
update public.social_posts set scene = 'rentabilite' where topic = $$Rentabilité par chantier$$;
update public.social_posts set scene = 'facture' where topic = $$Situations de chantier$$;
update public.social_posts set scene = 'signature' where topic = $$Signature électronique$$;
update public.social_posts set scene = 'essai' where topic = $$Marque / confiance$$;
