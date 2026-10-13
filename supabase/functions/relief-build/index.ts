import { createClient } from 'npm:@supabase/supabase-js@2';

// Builds a company's Cantia Relief: the owner dictates what the business
// does and how a job goes from start to finish; Claude turns that, plus the
// company's own records (sector, vocabulary, projects), into a world plan
// (lib/relief/types.ts ReliefSpec) stored in relief_worlds.spec. Runs in the
// background: the call answers at once, then the requester gets a
// notification and an e-mail (Cantia <noreply@cantia.ch>) when it's ready.
//
// Owner or admin only, and only when the paid "relief" module is granted and
// switched on for the organization.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';
const APP_URL = 'https://app.cantia.ch';

type Locale = 'fr' | 'de' | 'it';
type Template = 'territoire' | 'studio' | 'atelier';

const STYLES: Record<Template, string[]> = {
  territoire: ['villa', 'immeuble', 'halle', 'chalet'],
  studio: ['tour', 'bloc', 'pavillon'],
  atelier: ['vehicule', 'meuble', 'machine', 'colis'],
};
const ACCENTS = ['terracotta', 'sapin', 'lac', 'ardoise', 'prune'];
const DEFAULT_STAGES: Record<Template, Record<Locale, string[]>> = {
  territoire: {
    fr: ['Préparation', 'Gros œuvre', 'Second œuvre', 'Finitions', 'Réception'],
    de: ['Vorbereitung', 'Rohbau', 'Ausbau', 'Fertigstellung', 'Abnahme'],
    it: ['Preparazione', 'Rustico', 'Finiture interne', 'Finiture', 'Collaudo'],
  },
  studio: {
    fr: ['Brief', 'Conception', 'Production', 'Validation', 'Livré'],
    de: ['Briefing', 'Konzept', 'Umsetzung', 'Abnahme', 'Geliefert'],
    it: ['Brief', 'Concezione', 'Produzione', 'Validazione', 'Consegnato'],
  },
  atelier: {
    fr: ['Réception', 'Diagnostic', 'Travaux', 'Contrôle', 'Prêt'],
    de: ['Annahme', 'Diagnose', 'Arbeiten', 'Kontrolle', 'Bereit'],
    it: ['Accettazione', 'Diagnosi', 'Lavori', 'Controllo', 'Pronto'],
  },
};
const PLACE: Record<Template, Record<Locale, string>> = {
  territoire: { fr: 'Dépôt', de: 'Werkhof', it: 'Deposito' },
  studio: { fr: 'Bureau', de: 'Büro', it: 'Ufficio' },
  atelier: { fr: 'Atelier', de: 'Werkstatt', it: 'Officina' },
};

const SYSTEM_PROMPT = `Tu conçois le « Relief » d'une entreprise suisse cliente de Cantia : une maquette 3D vivante de l'entreprise, où chaque projet en cours est un élément, et où l'on voit l'avancement selon les étapes de son process.

Tu réponds UNIQUEMENT par un objet JSON valide, sans texte autour, de cette forme :
{
  "template": "territoire" | "studio" | "atelier",
  "title": string,
  "tagline": string,
  "understood": string[],
  "vocabulary": { "item": string, "items": string, "place": string },
  "stages": string[],
  "accent": "terracotta" | "sapin" | "lac" | "ardoise" | "prune",
  "decor": { "mountains": boolean, "water": "lac" | "riviere" | "aucune", "greenery": "sobre" | "verdoyant" },
  "styles": { "<id du projet>": string },
  "examples": [{ "name": string, "client": string, "style": string, "stage": number }]
}

Choix du modèle (template) :
- "territoire" : l'entreprise travaille chez ses clients, sur des lieux physiques répartis dans la région (construction, rénovation, nettoyage, paysagisme, déménagement, installation, sanitaire, électricité…). Les projets sont des sites reliés par des routes au dépôt.
- "atelier" : les clients amènent l'objet dans l'atelier de l'entreprise (garage, carrosserie, menuiserie, réparation, couture, petite production). Chaque projet est un poste de l'atelier.
- "studio" : services intellectuels ou numériques faits au bureau (agence web, informatique, marketing, design, conseil, architecture, fiduciaire, formation). Chaque projet est un bâtiment du quartier, avec un étage par étape.

Styles possibles par modèle (choisis d'après le nom du projet) :
- territoire : "villa" (maison individuelle), "immeuble" (plusieurs étages, logements, bureaux), "halle" (industriel, commercial, grand volume, extérieur), "chalet" (montagne, bois, rénovation de chalet)
- studio : "tour" (gros projet ou de longue durée), "bloc" (projet standard), "pavillon" (petit projet, maintenance, mission courte)
- atelier : "vehicule", "meuble", "machine", "colis" (selon ce qui est traité)

Règles :
- Écris dans la langue demandée, avec les mots de l'entreprise (ceux de la dictée), en phrases simples.
- title : court, par ex. « Le Relief de <nom de l'entreprise> ».
- tagline : une phrase qui dit ce que fait l'entreprise, telle que tu l'as comprise.
- understood : 3 à 5 points courts : ce que tu as compris de l'activité, du process et de l'équipe.
- vocabulary.item / items : comment l'entreprise appelle un projet (singulier / pluriel), en minuscules. vocabulary.place : sa base (dépôt, atelier, bureau…).
- stages : 3 à 6 étapes du process dans l'ordre, 1 à 3 mots chacune ; la dernière veut dire « terminé / livré ».
- accent : la couleur qui va le mieux au métier.
- decor : montagnes si l'entreprise est dans une région alpine ou si rien ne s'y oppose ; eau selon la région ; verdure selon le métier.
- styles : un style pour CHAQUE projet listé, uniquement parmi les styles du modèle choisi.
- examples : exactement 4 projets fictifs typiques de ce métier, avec des noms de projets et de clients inventés (jamais de vraies entreprises connues), des étapes variées (indice de 0 au nombre d'étapes moins 1), styles du modèle choisi.`;

const LANG: Record<Locale, string> = { fr: 'français', de: 'allemand', it: 'italien' };

const MAIL: Record<Locale, { subject: string; heading: string; intro: string; cta: string; notifTitle: string; failTitle: string; failBody: string }> = {
  fr: {
    subject: 'Votre Cantia Relief est prêt',
    heading: 'Votre Relief est prêt',
    intro: 'Nous avons construit la maquette vivante de votre entreprise, d’après ce que vous nous avez dit. Vos projets, votre planning et vos tâches y apparaissent déjà.',
    cta: 'Ouvrir mon Relief',
    notifTitle: 'Votre Cantia Relief est prêt',
    failTitle: 'Votre Cantia Relief n’a pas pu être construit',
    failBody: 'Ouvrez Cantia Relief pour relancer la construction.',
  },
  de: {
    subject: 'Ihr Cantia Relief ist bereit',
    heading: 'Ihr Relief ist bereit',
    intro: 'Wir haben das lebendige Modell Ihres Unternehmens nach Ihren Angaben gebaut. Ihre Projekte, Ihre Planung und Ihre Aufgaben sind bereits darin.',
    cta: 'Mein Relief öffnen',
    notifTitle: 'Ihr Cantia Relief ist bereit',
    failTitle: 'Ihr Cantia Relief konnte nicht gebaut werden',
    failBody: 'Öffnen Sie Cantia Relief, um den Bau neu zu starten.',
  },
  it: {
    subject: 'Il suo Cantia Relief è pronto',
    heading: 'Il suo Relief è pronto',
    intro: 'Abbiamo costruito il plastico vivente della sua impresa, secondo quanto ci ha detto. I suoi progetti, la pianificazione e i compiti sono già presenti.',
    cta: 'Aprire il mio Relief',
    notifTitle: 'Il suo Cantia Relief è pronto',
    failTitle: 'Il suo Cantia Relief non ha potuto essere costruito',
    failBody: 'Apra Cantia Relief per rilanciare la costruzione.',
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const organizationId = typeof body?.organization_id === 'string' ? body.organization_id : '';
    const brief = typeof body?.brief === 'string' ? body.brief.trim().slice(0, 8000) : '';
    const answers = cleanAnswers(body?.answers);
    const locale: Locale = body?.locale === 'de' || body?.locale === 'it' ? body.locale : 'fr';
    if (!organizationId) return json({ error: 'organization_id requis' }, 400);
    if (brief.length < 20 && !answers) return json({ error: 'Décrivez votre entreprise en quelques phrases (au moins 20 caractères).' }, 400);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'IA non configurée (clé Anthropic manquante)' }, 500);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const admin = createClient(supabaseUrl, serviceKey);

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);

    const { data: member } = await userClient.from('organization_members').select('role').eq('organization_id', organizationId).eq('user_id', user.id).maybeSingle();
    if (!member || !['owner', 'admin'].includes(String(member.role))) {
      return json({ error: 'Seuls le propriétaire et les administrateurs peuvent construire le Relief.' }, 403);
    }

    const { data: grant } = await admin
      .from('organization_modules')
      .select('enabled, activated, modules!inner(key)')
      .eq('organization_id', organizationId)
      .eq('modules.key', 'relief')
      .eq('enabled', true)
      .eq('activated', true)
      .maybeSingle();
    if (!grant) return json({ error: 'Cantia Relief n’est pas activé pour votre entreprise.' }, 403);

    const { data: allowed, error: quotaError } = await userClient.rpc('check_and_log_ai_usage', { p_organization_id: organizationId });
    if (quotaError) return json({ error: 'Accès refusé' }, 403);
    if (!allowed) return json({ error: "Quota d'utilisations IA mensuel atteint sur votre plan." }, 403);

    const { data: world, error: upsertError } = await admin
      .from('relief_worlds')
      .upsert({ organization_id: organizationId, status: 'building', brief: brief || '—', answers, error: null, requested_by: user.id, ready_at: null }, { onConflict: 'organization_id' })
      .select('id')
      .single();
    if (upsertError || !world) return json({ error: upsertError?.message ?? 'Enregistrement impossible' }, 500);

    const job = build({ admin, apiKey, organizationId, worldId: world.id, brief, answers, locale, userId: user.id, userEmail: user.email ?? null });
    const runtime = (globalThis as unknown as { EdgeRuntime?: { waitUntil(p: Promise<unknown>): void } }).EdgeRuntime;
    if (runtime?.waitUntil) runtime.waitUntil(job);
    else await job;

    return json({ ok: true, status: 'building', world_id: world.id }, 202);
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

// deno-lint-ignore no-explicit-any
async function build(p: { admin: any; apiKey: string; organizationId: string; worldId: string; brief: string; answers: Answers | null; locale: Locale; userId: string; userEmail: string | null }) {
  const { admin, organizationId, locale } = p;
  try {
    const [{ data: org }, { data: projects }, { count: memberCount }] = await Promise.all([
      admin.from('organizations').select('name, trade, trade_specialties, work_term').eq('id', organizationId).maybeSingle(),
      admin.from('projects').select('id, name, client_name, status, address').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(80),
      admin.from('organization_members').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    ]);

    const projectLines = (projects ?? []).map(
      (x: { id: string; name: string; client_name: string | null; status: string; address: string | null }) =>
        `- id ${x.id} : « ${x.name} »${x.client_name ? `, client ${x.client_name}` : ''}${x.address ? `, ${x.address}` : ''} (${x.status === 'completed' ? 'terminé' : 'en cours'})`,
    );
    const userPrompt = [
      `Langue de réponse : ${LANG[locale]}.`,
      `Entreprise : ${org?.name ?? '—'}`,
      `Secteur déclaré dans Cantia : ${org?.trade ?? 'non précisé'}${org?.trade_specialties?.length ? ` (${org.trade_specialties.join(', ')})` : ''}`,
      `Mot utilisé pour un projet dans Cantia : ${org?.work_term ?? 'projet'}`,
      `Nombre de personnes dans l'équipe : ${memberCount ?? 1}`,
      '',
      projectLines.length ? `Projets enregistrés (${projectLines.length}) :\n${projectLines.join('\n')}` : 'Aucun projet enregistré pour l’instant.',
      '',
      ...(p.answers ? answersPrompt(p.answers) : []),
      'Ce que le responsable a dicté ou écrit sur son entreprise et son process :',
      p.brief,
    ].join('\n');

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': p.apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 4000, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: userPrompt }] }),
    });
    if (!aiRes.ok) {
      console.error('Anthropic error', aiRes.status, await aiRes.text());
      throw new Error('ai_failed');
    }
    const aiData = await aiRes.json();
    const raw = ((aiData?.content ?? []) as Array<{ type: string; text?: string }>)
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n');
    const parsed = parseObject(raw);
    if (!parsed) throw new Error('ai_unreadable');

    const spec = sanitize(parsed, {
      locale,
      orgName: org?.name ?? 'Cantia',
      workTerm: org?.work_term ?? 'projet',
      projectIds: (projects ?? []).map((x: { id: string }) => x.id),
      answers: p.answers,
    });

    await admin.from('relief_worlds').update({ status: 'ready', spec, error: null, ready_at: new Date().toISOString() }).eq('id', p.worldId);
    await notify(admin, p, 'relief_ready', MAIL[locale].notifTitle, spec.tagline);
    await sendReadyEmail(p, spec.title, spec.tagline);
  } catch (err) {
    console.error('relief build failed', err);
    const message = err instanceof Error ? err.message : String(err);
    await admin.from('relief_worlds').update({ status: 'failed', error: message }).eq('id', p.worldId);
    await notify(admin, p, 'relief_failed', MAIL[locale].failTitle, MAIL[locale].failBody);
  }
}

// deno-lint-ignore no-explicit-any
async function notify(admin: any, p: { organizationId: string; worldId: string; userId: string }, type: string, title: string, body: string) {
  await admin.from('notifications').delete().eq('user_id', p.userId).eq('source_id', p.worldId).in('type', ['relief_ready', 'relief_failed']);
  const { error } = await admin.from('notifications').insert({
    organization_id: p.organizationId,
    user_id: p.userId,
    type,
    title,
    body,
    link: '/relief',
    source_table: 'relief_worlds',
    source_id: p.worldId,
  });
  if (error) console.error('notification insert failed', error.message);
}

async function sendReadyEmail(p: { userEmail: string | null; locale: Locale }, title: string, tagline: string) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key || !p.userEmail) return;
  const m = MAIL[p.locale];
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const html = `
    <div style="background: #F7F1E6; padding: 40px 20px; font-family: ${font};">
      <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E6D8C2; overflow: hidden;">
        <div style="padding: 24px 32px; background: #16120E;" bgcolor="#16120E">
          <img src="https://krijilwxhdlzflvnvrtl.supabase.co/storage/v1/object/public/brand/email/logo-on-dark-v1.png" width="170" height="32" alt="Cantia" style="display: block; border: 0; height: 32px; width: 170px;" />
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: #A95C30;">Cantia Relief</p>
          <h1 style="margin: 0 0 16px; font-size: 22px; color: #231A12;">${escapeHtml(m.heading)}</h1>
          <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #4A3F35;">${escapeHtml(m.intro)}</p>
          <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #231A12;"><strong>${escapeHtml(title)}</strong><br/>${escapeHtml(tagline)}</p>
          <a href="${APP_URL}/relief" style="display: inline-block; background: #A95C30; color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 22px; border-radius: 8px;">${escapeHtml(m.cta)}</a>
        </div>
      </div>
      <p style="max-width: 480px; margin: 20px auto 0; text-align: center; font-size: 12px; color: #6E6151;"><a href="https://cantia.ch" style="color: #A95C30; text-decoration: none; font-weight: 600;">cantia.ch</a></p>
    </div>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Cantia <noreply@cantia.ch>', to: [p.userEmail], subject: m.subject, html }),
  });
  if (!res.ok) console.error('Resend error', res.status, await res.text());
}

function parseObject(raw: string): Record<string, unknown> | null {
  let text = raw.trim();
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) text = fenced[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    const v = JSON.parse(text.slice(start, end + 1));
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

type Answers = {
  activity: string;
  template: Template | 'auto';
  stages: { label: string; owner: string; days: number; client: boolean }[];
  team: { name: string; job: string }[];
  billing: 'end' | 'deposit' | 'milestones' | 'monthly';
  quotes: boolean;
  story: string;
};

// The onboarding answers, checked and clamped (stored in relief_worlds.answers).
function cleanAnswers(v: unknown): (Answers & { version: 1; team: { id: string; name: string; job: string }[] }) | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const text = (x: unknown, max: number) => (typeof x === 'string' ? x.trim().slice(0, max) : '');
  const stages = (Array.isArray(o.stages) ? o.stages : [])
    .slice(0, 8)
    .map((s) => {
      const x = (s ?? {}) as Record<string, unknown>;
      return { label: text(x.label, 32), owner: text(x.owner, 40), days: Math.max(0, Math.min(365, Math.round(Number(x.days) || 0))), client: x.client === true };
    })
    .filter((s) => s.label);
  const team = (Array.isArray(o.team) ? o.team : []).slice(0, 60).map((m) => {
    const x = (m ?? {}) as Record<string, unknown>;
    return { id: text(x.id, 64), name: text(x.name, 80), job: text(x.job, 60) };
  });
  const template = o.template === 'territoire' || o.template === 'studio' || o.template === 'atelier' ? o.template : 'auto';
  const billing = o.billing === 'deposit' || o.billing === 'milestones' || o.billing === 'monthly' ? o.billing : 'end';
  return { version: 1, activity: text(o.activity, 200), template, stages, team, billing, quotes: o.quotes !== false, story: text(o.story, 4000) };
}

const BILLING_FR: Record<Answers['billing'], string> = {
  end: 'une facture à la fin',
  deposit: 'un acompte au départ puis le solde',
  milestones: 'une facture à chaque étape clé',
  monthly: 'une facture chaque mois',
};

function answersPrompt(a: Answers): string[] {
  return [
    'Réponses structurées du responsable :',
    a.activity ? `- Activité : ${a.activity}` : '',
    a.template !== 'auto' ? `- Modèle choisi par le responsable : ${a.template} (à respecter)` : '- Modèle : à choisir',
    a.stages.length ? `- Process (à reprendre tel quel dans "stages", mêmes mots, même ordre) :\n${a.stages.map((s, i) => `  ${i + 1}. ${s.label}${s.owner ? `, responsable ${s.owner}` : ''}${s.days ? `, ~${s.days} jours` : ''}${s.client ? ', validation du client' : ''}`).join('\n')}` : '',
    a.team.some((m) => m.job) ? `- Équipe :\n${a.team.filter((m) => m.job).map((m) => `  ${m.name} : ${m.job}`).join('\n')}` : '',
    `- Devis : ${a.quotes ? 'toujours un devis avant de commencer' : 'pas systématique'} ; facturation : ${BILLING_FR[a.billing]}`,
    '',
  ].filter((l) => l !== '');
}

const str = (v: unknown, max: number, fallback: string) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : fallback);

// Never trust the model's output shape: every field is checked and clamped,
// with a sensible default, so the scene always gets a complete plan.
function sanitize(o: Record<string, unknown>, ctx: { locale: Locale; orgName: string; workTerm: string; projectIds: string[]; answers: Answers | null }) {
  const chosen = ctx.answers?.template && ctx.answers.template !== 'auto' ? ctx.answers.template : null;
  const template: Template = chosen ?? (o.template === 'studio' || o.template === 'atelier' || o.template === 'territoire' ? o.template : 'territoire');
  const styles = STYLES[template];
  const vocab = (o.vocabulary ?? {}) as Record<string, unknown>;
  let stages = Array.isArray(o.stages) ? o.stages.map((s) => str(s, 32, '')).filter(Boolean).slice(0, 6) : [];
  if (stages.length < 3) stages = DEFAULT_STAGES[template][ctx.locale];
  // The owner's own process wins over the AI's reading of it.
  const own = ctx.answers?.stages.filter((s) => s.label) ?? [];
  if (own.length >= 3) stages = own.map((s) => s.label);
  const decor = (o.decor ?? {}) as Record<string, unknown>;
  const rawStyles = (o.styles ?? {}) as Record<string, unknown>;
  const outStyles: Record<string, string> = {};
  ctx.projectIds.forEach((id, i) => {
    const s = rawStyles[id];
    outStyles[id] = typeof s === 'string' && styles.includes(s) ? s : styles[i % styles.length];
  });
  const examples = (Array.isArray(o.examples) ? o.examples : [])
    .slice(0, 5)
    .map((e, i) => {
      const x = (e ?? {}) as Record<string, unknown>;
      const stage = Math.round(Number(x.stage));
      return {
        name: str(x.name, 50, `${ctx.workTerm} ${i + 1}`),
        client: str(x.client, 50, ''),
        style: typeof x.style === 'string' && styles.includes(x.style) ? x.style : styles[i % styles.length],
        stage: Number.isFinite(stage) ? Math.min(stages.length - 1, Math.max(0, stage)) : i % stages.length,
      };
    });
  return {
    version: 1,
    template,
    title: str(o.title, 60, `Le Relief de ${ctx.orgName}`),
    tagline: str(o.tagline, 200, ''),
    understood: (Array.isArray(o.understood) ? o.understood : []).map((s) => str(s, 160, '')).filter(Boolean).slice(0, 6),
    vocabulary: {
      item: str(vocab.item, 30, ctx.workTerm).toLowerCase(),
      items: str(vocab.items, 30, `${ctx.workTerm}s`).toLowerCase(),
      place: str(vocab.place, 30, PLACE[template][ctx.locale]),
    },
    stages: stages.map((label, i) => {
      const a = own.length >= 3 ? own[i] : null;
      return a ? { label, ...(a.owner ? { owner: a.owner } : {}), ...(a.days ? { days: a.days } : {}), ...(a.client ? { client: true } : {}) } : { label };
    }),
    accent: typeof o.accent === 'string' && ACCENTS.includes(o.accent) ? o.accent : 'terracotta',
    decor: {
      mountains: decor.mountains !== false,
      water: decor.water === 'riviere' || decor.water === 'aucune' ? decor.water : 'lac',
      greenery: decor.greenery === 'verdoyant' ? 'verdoyant' : 'sobre',
    },
    styles: outStyles,
    examples,
  };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
