// Planning de chantier — "Proposer avec l'IA": from a free description
// ("villa de 180 m² à Bulle", "pont routier de 40 m en béton"), Claude
// proposes phases, tasks and milestones with durations in working days and
// "after" links. The app turns the answer into a template
// (lib/schedule/ai.ts) that the user previews before anything is written.
// Reserved to companies whose plan includes the planning de chantier
// (org_has_site_schedule), and counted in the plan's AI quota.
import Anthropic from 'npm:@anthropic-ai/sdk@1.4.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL = 'claude-opus-5-5';
const MAX_REQUEST_CHARS = 2000;

const LANGUAGE: Record<string, string> = {
  fr: 'français (Suisse romande)',
  de: 'allemand de Suisse (pas de « ß », « Offerte » plutôt que « Angebot »)',
  it: 'italien (Tessin)',
};

const SYSTEM_PROMPT = `Tu prépares des plannings de chantier types pour des entreprises du bâtiment et du génie civil en Suisse.
On te décrit un ouvrage ou un chantier. Tu proposes un planning de départ, que l'entreprise va ensuite ajuster : des phases, et dans chaque phase des tâches (avec une durée en jours ouvrés) et des jalons (durée 0).

Contenu attendu :
- Le déroulement réel d'un chantier en Suisse, dans l'ordre : préparation (et si c'est pertinent pour la demande : projet, demande de permis de construire, mise à l'enquête publique, appel d'offres et adjudication), installation de chantier, gros œuvre, enveloppe, second œuvre, aménagements extérieurs, réception. Pour un ouvrage de génie civil (pont, route, mur, réseau), adapte les phases : piquetage, déviations et signalisation, fondations, appuis, tablier, étanchéité et revêtement, équipements, essais, mise en service.
- Les jalons clés, par exemple : permis de construire délivré, début des travaux, hors d'eau, hors d'air, mise en service, réception de l'ouvrage.
- Le vocabulaire des corps de métier en Suisse (ex. maçonnerie, charpente, ferblanterie-couverture, sanitaire, chauffage-ventilation, électricité, plâtrerie-peinture, chape, carrelage, menuiserie ; génie civil, coffrage-ferraillage, étanchéité, revêtements).
- Les durées sont des ordres de grandeur réalistes pour la taille décrite, en jours ouvrés. Tiens compte des temps de séchage et de cure (béton, chape) et des délais administratifs habituels (mise à l'enquête : en général 20 à 30 jours selon le canton) en les représentant comme des tâches.
- Ne crée pas de tâche pour les jours fériés, les vacances de la construction ou les week-ends : le calendrier de l'application les retire déjà des jours ouvrés.
- Les dépendances "after" : une tâche commence après la fin de celles qu'elle liste. Ne mets que les dépendances réelles, pour que les tâches qui peuvent avancer en parallèle le fassent. Une tâche sans dépendance commence au début du chantier.
- Entre 12 et 60 lignes au total, selon la taille de l'ouvrage. Chaque "id" est court et unique (t1, t2, … ; j1, j2, … pour les jalons).

Honnêteté :
- Dans "assumptions", écris en quelques phrases courtes les hypothèses que tu as prises (taille, mode constructif, équipe, saison) et ce que l'entreprise doit vérifier. Ne présente jamais une durée comme garantie.
- Ne cite ni norme, ni article de loi, ni chiffre que tu n'es pas sûr d'avoir juste. Les phases SIA peuvent être nommées sans numéro si tu as un doute.
- Si la demande ne décrit pas un chantier ou un ouvrage, renvoie "phases": [] et explique dans "summary" ce qu'il faudrait préciser.`;

// Structured output: the answer always parses and matches this shape.
const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'summary', 'assumptions', 'phases'],
  properties: {
    title: { type: 'string', description: 'Nom court du planning, ex. « Villa individuelle 180 m² »' },
    summary: { type: 'string', description: 'Une ou deux phrases sur le planning proposé' },
    assumptions: { type: 'array', items: { type: 'string' } },
    phases: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'items'],
        properties: {
          name: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'kind', 'name', 'trade', 'workdays', 'after'],
              properties: {
                id: { type: 'string' },
                kind: { type: 'string', enum: ['task', 'milestone'] },
                name: { type: 'string' },
                trade: { type: 'string', description: 'Corps de métier, ou chaîne vide' },
                workdays: { type: 'integer', description: 'Durée en jours ouvrés, 0 pour un jalon' },
                after: { type: 'array', items: { type: 'string' }, description: 'ids des lignes qui doivent être finies avant' },
              },
            },
          },
        },
      },
    },
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { request, organization_id, locale, canton, start_date } = await req.json();
    const text = typeof request === 'string' ? request.trim().slice(0, MAX_REQUEST_CHARS) : '';
    if (!text) return json({ error: 'Décrivez le chantier ou l’ouvrage' }, 400);
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Génération IA non configurée (clé Anthropic manquante)' }, 500);

    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);

    // Same rule as the planning itself (RLS on site_schedules): checked
    // before the quota so a refused call costs nothing.
    const { data: hasPlanning } = await userClient.rpc('org_has_site_schedule', { org_id: organization_id });
    if (hasPlanning !== true) return json({ error: 'Le planning de chantier n’est pas inclus dans votre formule.' }, 403);

    const { data: allowed, error: quotaError } = await userClient.rpc('check_and_log_ai_usage', { p_organization_id: organization_id });
    if (quotaError) return json({ error: 'Accès refusé' }, 403);
    if (!allowed) return json({ error: "Quota d'utilisations IA mensuel atteint sur votre plan. Passez à un plan supérieur pour continuer." }, 403);

    const { data: org } = await userClient.from('organizations').select('trade').eq('id', organization_id).maybeSingle();
    const lang = LANGUAGE[locale as string] ?? LANGUAGE.fr;
    const context = [
      `Langue de toutes les valeurs texte (noms, corps de métier, résumé, hypothèses) : ${lang}.`,
      org?.trade ? `Corps de métier principal de l'entreprise : ${org.trade}.` : null,
      typeof canton === 'string' && canton ? `Canton du chantier : ${canton}.` : null,
      typeof start_date === 'string' && start_date ? `Début prévu du chantier : ${start_date} (tiens compte de la saison pour les travaux sensibles au gel).` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const client = new Anthropic({ apiKey });
    const message = await client.beta.messages
      .stream({
        model: MODEL,
        max_tokens: 32000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: PLAN_SCHEMA } },
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `${context}\n\nChantier à planifier :\n${text}` }],
      })
      .finalMessage();

    if (message.stop_reason === 'refusal') return json({ error: 'La demande n’a pas pu être traitée. Reformulez-la.' }, 422);
    if (message.stop_reason === 'max_tokens') return json({ error: 'Le planning proposé est trop long. Décrivez un ouvrage plus précis.' }, 422);

    const raw = message.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();
    let plan: unknown;
    try {
      plan = JSON.parse(raw);
    } catch {
      return json({ error: "La réponse IA n'a pas pu être interprétée" }, 502);
    }
    return json({ plan });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'Trop de demandes en ce moment, réessayez dans une minute.' }, 429);
    if (err instanceof Anthropic.APIError) {
      console.error('Anthropic error', err.status, err.message);
      return json({ error: 'Échec de la génération IA, réessayez dans un instant' }, 502);
    }
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
