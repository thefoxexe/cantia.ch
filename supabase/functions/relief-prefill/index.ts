import { createClient } from 'npm:@supabase/supabase-js@2';

// Cantia Maquette: reads the company's website (home page plus a few pages
// about its services and how it works) and proposes the onboarding answers
// (components/relief/ReliefOnboardingDom.tsx): what the company does, the
// kinds of projects it sells, the process of each with typical and minimum
// durations, how it quotes and invoices. Nothing is saved here: the owner
// reviews and edits every answer before the world is built
// (supabase/functions/relief-build).
//
// Owner or admin only, the paid "relief" module on, counted in the AI quota.
// Only public http(s) sites are fetched: no IP addresses, no local names, a
// few redirects at most, small pages only.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';
const MAX_BYTES = 600_000;
const MAX_TEXT = 26_000;

type Locale = 'fr' | 'de' | 'it';
const LANG: Record<Locale, string> = { fr: 'français', de: 'allemand', it: 'italien' };
const ROLES: Record<Locale, string[]> = {
  fr: ['Direction', 'Chef de projet', 'Chef de chantier', 'Équipe', 'Développeur', 'Designer', 'Atelier', 'Accueil', 'Comptabilité', 'Client'],
  de: ['Geschäftsleitung', 'Projektleitung', 'Bauführung', 'Team', 'Entwickler', 'Designer', 'Werkstatt', 'Empfang', 'Buchhaltung', 'Kunde'],
  it: ['Direzione', 'Capo progetto', 'Capo cantiere', 'Squadra', 'Sviluppatore', 'Designer', 'Officina', 'Accoglienza', 'Contabilità', 'Cliente'],
};

const SYSTEM_PROMPT = `Tu prépares la « Maquette » d'une entreprise suisse cliente de Cantia : une maquette 3D vivante où chaque projet en cours avance selon le process réel de l'entreprise. On te donne le texte de son site internet. Tu proposes les réponses du questionnaire, que le responsable relira et corrigera.

Tu réponds UNIQUEMENT par un objet JSON valide, sans texte autour :
{
  "activity": string,
  "template": "territoire" | "studio" | "atelier",
  "understood": string[],
  "kinds": [{ "name": string, "stages": [{ "label": string, "owner": string, "days": number, "minDays": number, "client": boolean }] }],
  "billing": "end" | "deposit" | "milestones" | "monthly",
  "quotes": boolean,
  "story": string
}

- activity : une ligne (max 120 caractères) qui dit ce que fait l'entreprise, pour qui, où.
- template : "territoire" si l'entreprise travaille chez ses clients sur des lieux physiques (construction, rénovation, nettoyage, paysagisme, installation…) ; "atelier" si les clients amènent l'objet chez elle (garage, menuiserie, réparation…) ; "studio" pour les services faits au bureau (agence web, informatique, design, conseil, fiduciaire, architecture…).
- understood : 3 à 5 points courts sur ce que tu as compris (prestations, clients, région, façon de travailler), uniquement d'après le site.
- kinds : 1 à 4 types de projets que l'entreprise vend VRAIMENT d'après le site (ex. agence web : « Site vitrine », « Boutique en ligne », « Application » ; entreprise générale : « Villa neuve », « Rénovation » ; garage : « Service », « Carrosserie »). Le premier est le plus courant.
- stages : 3 à 8 étapes propres à CE type de projet, dans l'ordre, 1 à 3 mots chacune, avec les mots du métier. Une agence web n'a pas de « chantier » ni de « gros œuvre » ; une entreprise de construction n'a pas de « recette » ni de « mise en ligne ». La dernière étape veut dire terminé / livré / remis.
- days : durée habituelle de l'étape en jours ouvrables pour une petite entreprise suisse ; minDays : le minimum réaliste (≤ days). Des chiffres entiers, réalistes, jamais 0 sauf pour une étape instantanée.
- owner : qui mène l'étape, parmi : {ROLES}.
- client : true si le client valide à la fin de cette étape (devis signé, maquette validée, réception…).
- billing : comment l'entreprise facture probablement (fin, acompte puis solde, par étape, chaque mois). quotes : true si elle fait un devis avant chaque projet.
- story : un court paragraphe (3 à 5 phrases) à la première personne du pluriel, comme si le responsable racontait comment un projet se passe chez eux, d'après le site. Rien d'inventé de précis (pas de chiffres d'affaires, pas de noms de clients).
- Écris dans la langue demandée. Si le site ne dit presque rien, propose un process typique du métier.`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const organizationId = typeof body?.organization_id === 'string' ? body.organization_id : '';
    const locale: Locale = body?.locale === 'de' || body?.locale === 'it' ? body.locale : 'fr';
    if (!organizationId) return json({ error: 'organization_id requis' }, 400);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'IA non configurée' }, 500);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);
    const { data: member } = await userClient.from('organization_members').select('role').eq('organization_id', organizationId).eq('user_id', user.id).maybeSingle();
    if (!member || !['owner', 'admin'].includes(String(member.role))) return json({ error: 'Réservé au propriétaire et aux administrateurs.' }, 403);

    const { data: grant } = await admin
      .from('organization_modules')
      .select('enabled, activated, modules!inner(key)')
      .eq('organization_id', organizationId)
      .eq('modules.key', 'relief')
      .eq('enabled', true)
      .eq('activated', true)
      .maybeSingle();
    if (!grant) return json({ error: 'Cantia Maquette n’est pas activée pour votre entreprise.' }, 403);

    const { data: org } = await admin.from('organizations').select('name, trade, website, locality').eq('id', organizationId).maybeSingle();
    const start = safeUrl(typeof body?.url === 'string' && body.url.trim() ? body.url : (org?.website ?? ''));
    if (!start) return json({ error: 'Adresse du site invalide. Exemple : www.mon-entreprise.ch' }, 400);

    const { data: allowed, error: quotaError } = await userClient.rpc('check_and_log_ai_usage', { p_organization_id: organizationId });
    if (quotaError) return json({ error: 'Accès refusé' }, 403);
    if (!allowed) return json({ error: "Quota d'utilisations IA mensuel atteint sur votre plan." }, 403);

    // Home page, then up to three pages about services, the company, the way of working.
    const home = await fetchPage(start);
    if (!home) return json({ error: 'Le site ne répond pas ou ne peut pas être lu.' }, 422);
    const extra = pickLinks(home.links, home.url).slice(0, 3);
    const more = (await Promise.all(extra.map((u) => fetchPage(u)))).filter(Boolean) as Page[];
    const pages = [home, ...more];
    let text = pages.map((p) => `### ${p.title || p.url}\n${p.text}`).join('\n\n');
    if (text.length > MAX_TEXT) text = text.slice(0, MAX_TEXT);
    if (text.replace(/\s/g, '').length < 80) return json({ error: 'Le site contient trop peu de texte à lire (site en images ou en JavaScript seulement).' }, 422);

    const userPrompt = [
      `Langue de réponse : ${LANG[locale]}.`,
      `Entreprise : ${org?.name ?? '—'}${org?.locality ? `, ${org.locality}` : ''}`,
      `Secteur déclaré dans Cantia : ${org?.trade ?? 'non précisé'}`,
      `Site : ${home.url}`,
      '',
      'Texte du site :',
      text,
    ].join('\n');
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 3000, system: SYSTEM_PROMPT.replace('{ROLES}', ROLES[locale].join(', ')), messages: [{ role: 'user', content: userPrompt }] }),
    });
    if (!aiRes.ok) {
      console.error('Anthropic error', aiRes.status, await aiRes.text());
      return json({ error: 'L’analyse du site a échoué, réessayez dans un moment.' }, 502);
    }
    const aiData = await aiRes.json();
    const raw = ((aiData?.content ?? []) as Array<{ type: string; text?: string }>).filter((b) => b.type === 'text' && b.text).map((b) => b.text).join('\n');
    const parsed = parseObject(raw);
    if (!parsed) return json({ error: 'L’analyse du site n’a rien donné de lisible, réessayez.' }, 502);

    return json({ ok: true, website: home.url, pages: pages.map((p) => ({ url: p.url, title: p.title })), ...clean(parsed) });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

// ------------------------------------------------------------ fetching

type Page = { url: string; title: string; text: string; links: { href: string; label: string }[] };

/** A public http(s) address, or null (IPs, local names and odd ports are refused). */
function safeUrl(input: string): URL | null {
  let s = input.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if (u.username || u.password) return null;
  if (u.port && u.port !== '80' && u.port !== '443') return null;
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (!host.includes('.') || host.length > 253) return null;
  // No IP literals at all (v4 or v6): a company site has a name.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':') || host.startsWith('[')) return null;
  if (/(^|\.)(localhost|local|localdomain|internal|intranet|lan|home|corp|arpa|test|invalid|example)$/.test(host)) return null;
  if (/(^|\.)(supabase\.co|supabase\.in|metadata\.google\.internal)$/.test(host)) return null;
  u.hash = '';
  return u;
}

async function fetchPage(start: URL): Promise<Page | null> {
  let url = start;
  for (let hop = 0; hop < 4; hop++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    let res: Response;
    try {
      res = await fetch(url.toString(), {
        redirect: 'manual',
        signal: ctrl.signal,
        headers: { 'user-agent': 'CantiaBot/1.0 (+https://cantia.ch)', accept: 'text/html,application/xhtml+xml', 'accept-language': 'fr-CH,de-CH;q=0.8,it-CH;q=0.7,en;q=0.5' },
      });
    } catch {
      clearTimeout(timer);
      return null;
    }
    if (res.status >= 300 && res.status < 400) {
      clearTimeout(timer);
      const loc = res.headers.get('location');
      await res.body?.cancel();
      const next = loc ? safeUrl(new URL(loc, url).toString()) : null;
      if (!next) return null;
      url = next;
      continue;
    }
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) {
      clearTimeout(timer);
      await res.body?.cancel();
      return null;
    }
    const html = await readCapped(res, MAX_BYTES).finally(() => clearTimeout(timer));
    return parseHtml(html, url);
  }
  return null;
}

async function readCapped(res: Response, max: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < max) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    size += value.length;
  }
  await reader.cancel().catch(() => {});
  const all = new Uint8Array(Math.min(size, max));
  let o = 0;
  for (const c of chunks) {
    const part = c.subarray(0, Math.max(0, all.length - o));
    all.set(part, o);
    o += part.length;
    if (o >= all.length) break;
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(all);
}

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&rsquo;|&lsquo;/g, '’')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function parseHtml(html: string, url: URL): Page {
  const title = decodeEntities((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '').replace(/\s+/g, ' ').trim()).slice(0, 160);
  const metas = [...html.matchAll(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]*>/gi)]
    .map((m) => /content=["']([^"']*)["']/i.exec(m[0])?.[1] ?? '')
    .filter(Boolean)
    .map(decodeEntities);
  const links: Page['links'] = [];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    links.push({ href: m[1], label: decodeEntities(m[2].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 80) });
    if (links.length > 300) break;
  }
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/div|\/section|\/tr)[^>]*>/gi, '\n')
    .replace(/<h([1-3])[^>]*>/gi, '\n## ')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<[^>]+>/g, ' ');
  const lines = decodeEntities(body)
    .split('\n')
    .map((l) => l.replace(/[ \t ]+/g, ' ').trim())
    .filter((l) => l.length > 2);
  // Menus and footers repeat on every page: drop exact duplicates.
  const seen = new Set<string>();
  const text = [...metas, ...lines].filter((l) => (seen.has(l) ? false : (seen.add(l), true))).join('\n');
  return { url: url.toString(), title, text: text.slice(0, 12_000), links };
}

const KEYWORDS = [
  'service', 'prestation', 'offre', 'expertise', 'savoir-faire', 'competence', 'metier', 'realisation', 'projet', 'methode', 'process', 'demarche', 'approche', 'comment', 'a-propos', 'apropos', 'entreprise', 'qui-sommes', 'about', 'tarif', 'prix',
  'leistung', 'angebot', 'dienst', 'referenz', 'projekte', 'ablauf', 'vorgehen', 'ueber-uns', 'uber-uns', 'unternehmen', 'firma', 'preise',
  'servizi', 'offerta', 'progetti', 'chi-siamo', 'azienda', 'metodo', 'prezzi',
];

function pickLinks(links: Page['links'], base: string): URL[] {
  const root = new URL(base);
  const out = new Map<string, number>();
  for (const l of links) {
    let u: URL;
    try {
      u = new URL(l.href, root);
    } catch {
      continue;
    }
    if (u.hostname.replace(/^www\./, '') !== root.hostname.replace(/^www\./, '')) continue;
    if (/\.(pdf|jpe?g|png|gif|svg|webp|zip|docx?|xlsx?)$/i.test(u.pathname)) continue;
    u.hash = '';
    u.search = '';
    const key = u.toString();
    if (key === root.toString() || u.pathname === '/' ) continue;
    const hay = `${decodeURIComponent(u.pathname)} ${l.label}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const score = KEYWORDS.reduce((s, k) => s + (hay.includes(k) ? 1 : 0), 0) - u.pathname.split('/').filter(Boolean).length * 0.2;
    if (score > 0.5) out.set(key, Math.max(out.get(key) ?? 0, score));
  }
  return [...out.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => safeUrl(k))
    .filter(Boolean) as URL[];
}

// ------------------------------------------------------------ answer

function parseObject(raw: string): Record<string, unknown> | null {
  let text = raw.trim();
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) text = fenced[1].trim();
  const s = text.indexOf('{');
  const e = text.lastIndexOf('}');
  if (s === -1 || e <= s) return null;
  try {
    const v = JSON.parse(text.slice(s, e + 1));
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const int = (v: unknown, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));

// The model's proposal, checked and clamped to what the onboarding accepts.
function clean(o: Record<string, unknown>) {
  const kinds = (Array.isArray(o.kinds) ? o.kinds : [])
    .slice(0, 4)
    .map((k, i) => {
      const x = (k ?? {}) as Record<string, unknown>;
      const stages = (Array.isArray(x.stages) ? x.stages : [])
        .slice(0, 8)
        .map((st) => {
          const y = (st ?? {}) as Record<string, unknown>;
          const days = int(y.days, 0, 365);
          return { label: str(y.label, 32), owner: str(y.owner, 40), days, minDays: Math.min(days, int(y.minDays, 0, 365)), client: y.client === true };
        })
        .filter((st) => st.label);
      return { id: `w${i}`, name: str(x.name, 40) || `#${i + 1}`, stages };
    })
    .filter((k) => k.stages.length >= 3);
  return {
    activity: str(o.activity, 200),
    template: o.template === 'territoire' || o.template === 'studio' || o.template === 'atelier' ? o.template : 'auto',
    understood: (Array.isArray(o.understood) ? o.understood : []).map((s) => str(s, 160)).filter(Boolean).slice(0, 5),
    kinds,
    billing: o.billing === 'deposit' || o.billing === 'milestones' || o.billing === 'monthly' ? o.billing : 'end',
    quotes: o.quotes !== false,
    story: str(o.story, 1500),
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
