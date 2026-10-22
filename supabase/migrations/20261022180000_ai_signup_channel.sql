-- Signups that come from an AI assistant (ChatGPT, Claude, Gemini,
-- Perplexity, Copilot, Mistral Le Chat) are named as such, whether the
-- assistant tagged its link (utm_source=chatgpt.com) or only sent a
-- referrer. Checked before Google search: gemini.google.com is not a search.

create or replace function public.ai_assistant_name(p text)
returns text
language sql
immutable
as $$
  select case
    when p is null then null
    when lower(p) ~ '(chatgpt|openai)' then 'ChatGPT'
    when lower(p) ~ '(claude|anthropic)' then 'Claude'
    when lower(p) ~ '(gemini|bard\.google)' then 'Gemini'
    when lower(p) ~ 'perplexity' then 'Perplexity'
    when lower(p) ~ 'copilot' then 'Copilot'
    when lower(p) ~ '(chat\.mistral|mistral\.ai)' then 'Mistral Le Chat'
    when lower(p) ~ '(you\.com|phind\.com|deepseek)' then 'Assistant IA'
  end;
$$;

create or replace function public.signup_channel(p_org uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  o public.organizations;
  v_partner text;
  v_firm text;
  v_host text;
  v_owner_email text;
  v_lead text;
  v_ai text;
begin
  select * into o from public.organizations where id = p_org;
  if not found then
    return null;
  end if;

  select coalesce(nullif(p.company_name, ''), nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), ra.code)
    into v_partner
    from public.referral_attributions ra
    left join public.partner_profiles p on p.id = ra.partner_id
   where ra.organization_id = p_org
   limit 1;
  if v_partner is not null then
    return jsonb_build_object('key', 'partner', 'label', 'Partenaire', 'detail', v_partner);
  end if;

  select f.name into v_firm
    from public.fiduciary_client_access a
    join public.fiduciary_firms f on f.id = a.firm_id
   where a.organization_id = p_org
     and a.source in ('NEW_CLIENT_INVITE', 'CLIENT_INVITE')
     and a.created_at < o.created_at + interval '1 day'
   order by a.created_at
   limit 1;
  if v_firm is not null then
    return jsonb_build_object('key', 'fiduciary', 'label', 'Invitation d’une fiduciaire', 'detail', v_firm);
  end if;

  if o.signup_gclid is not null then
    return jsonb_build_object('key', 'google_ads', 'label', 'Google Ads', 'detail', coalesce(o.signup_utm_campaign, o.signup_utm_source));
  end if;
  -- ChatGPT and others tag their links (utm_source=chatgpt.com).
  v_ai := public.ai_assistant_name(o.signup_utm_source);
  if v_ai is not null then
    return jsonb_build_object('key', 'ai', 'label', v_ai, 'detail', 'Assistant IA · ' || o.signup_utm_source);
  end if;
  if o.signup_utm_source is not null then
    return jsonb_build_object('key', 'campaign', 'label', 'Campagne', 'detail', concat_ws(' · ', o.signup_utm_source, o.signup_utm_medium, o.signup_utm_campaign));
  end if;

  -- The outside site of the first visit, else the one before the signup
  -- page (accounts.google.com is only the Google sign-in step).
  v_host := coalesce(
    case when public.url_host(o.signup_landing_referrer) !~ '(^|\.)cantia\.ch$' then public.url_host(o.signup_landing_referrer) end,
    case when public.url_host(o.signup_referrer) !~ '(^|\.)cantia\.ch$' and public.url_host(o.signup_referrer) <> 'accounts.google.com' then public.url_host(o.signup_referrer) end
  );
  v_ai := public.ai_assistant_name(v_host);
  if v_ai is not null then
    return jsonb_build_object('key', 'ai', 'label', v_ai, 'detail', 'Assistant IA · ' || v_host);
  end if;
  if v_host is not null then
    return jsonb_build_object(
      'key', case
        when v_host ~ '(^|\.)google\.' or v_host ~ '(^|\.)(bing\.com|duckduckgo\.com|search\.yahoo\.com|ecosia\.org|qwant\.com|search\.brave\.com)$' then 'search'
        when v_host ~ '(^|\.)(linkedin\.com|lnkd\.in|facebook\.com|fb\.com|instagram\.com|tiktok\.com|twitter\.com|x\.com|t\.co|youtube\.com|whatsapp\.com|reddit\.com)$' then 'social'
        when v_host ~ '(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$' then 'ai'
        else 'website' end,
      'label', case
        when v_host ~ '(^|\.)google\.' then 'Recherche Google'
        when v_host ~ '(^|\.)(bing\.com|duckduckgo\.com|search\.yahoo\.com|ecosia\.org|qwant\.com|search\.brave\.com)$' then 'Moteur de recherche'
        when v_host ~ '(^|\.)(linkedin\.com|lnkd\.in)$' then 'LinkedIn'
        when v_host ~ '(^|\.)(facebook\.com|fb\.com)$' then 'Facebook'
        when v_host ~ '(^|\.)instagram\.com$' then 'Instagram'
        when v_host ~ '(^|\.)tiktok\.com$' then 'TikTok'
        when v_host ~ '(^|\.)youtube\.com$' then 'YouTube'
        when v_host ~ '(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$' then 'Assistant IA'
        when v_host ~ '(^|\.)(twitter\.com|x\.com|t\.co|whatsapp\.com|reddit\.com)$' then 'Réseau social'
        else 'Autre site' end,
      'detail', v_host);
  end if;

  select u.email into v_owner_email
    from public.organization_members m
    join auth.users u on u.id = m.user_id
   where m.organization_id = p_org and m.role = 'owner'
   order by m.created_at
   limit 1;
  select bl.source_slug into v_lead
    from public.blog_leads bl
   where v_owner_email is not null and lower(bl.email) = lower(v_owner_email) and bl.created_at <= o.created_at + interval '1 hour'
   order by bl.created_at
   limit 1;
  if v_lead is not null then
    return jsonb_build_object('key', 'blog', 'label', 'Article du blog', 'detail', v_lead);
  end if;

  if o.signup_landing_path is not null then
    return jsonb_build_object('key', 'direct', 'label', 'Accès direct au site', 'detail', o.signup_landing_path);
  end if;
  if public.url_host(o.signup_referrer) ~ '(^|\.)cantia\.ch$' then
    return jsonb_build_object('key', 'site', 'label', 'Site cantia.ch', 'detail', null);
  end if;
  return jsonb_build_object('key', 'unknown', 'label', 'Inconnue', 'detail', null);
end;
$$;
revoke execute on function public.signup_channel(uuid) from public, anon, authenticated;
