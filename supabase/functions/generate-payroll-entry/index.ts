import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';
const MAX_LIST_ITEMS = 300;

const SYSTEM_PROMPT = `Tu aides des artisans et entreprises du bâtiment en Suisse à transformer une saisie d'heures dictée à l'oral en une entrée structurée.
On te donne le texte dicté (souvent informel, parfois mal transcrit, en français ou en allemand suisse), la date du jour, la liste des chantiers de cette entreprise (id + nom) et la liste des types de travail (id + libellé).

Règles strictes :
- Identifie le chantier mentionné et fais correspondre EXACTEMENT son id parmi la liste fournie (même si le nom dicté est approximatif, incomplet ou mal transcrit — ex. "route du lac" pour "Rénovation villa – Route du Lac 12"). N'invente jamais un id qui n'est pas dans la liste. Si aucun chantier ne correspond clairement, mets "projectId": null.
- Identifie le type de travail mentionné (ex. maçonnerie, électricité, finitions) et fais correspondre son id parmi la liste fournie. Si aucun type de travail n'est mentionné ou ne correspond, mets "workTypeId": null.
- Si une heure de début ET une heure de fin sont mentionnées (ex. "de 7h à 15h", "8h-16h30", "j'ai commencé à 7 et fini à midi"), extrais-les au format 24h "HH:MM" dans "startTime"/"endTime", et laisse "hours": null.
- Si seulement une durée est mentionnée (ex. "8 heures", "j'ai fait 7h30"), mets le nombre décimal correspondant dans "hours" (ex. 7.5) et laisse "startTime"/"endTime": null.
- Si ni des horaires ni une durée ne sont compris, mets "hours": null et "startTime"/"endTime": null.
- Résume en une remarque courte (quelques mots, jamais une phrase complète) ce qui a été fait, dans la même langue que la dictée. Chaîne vide si rien de précis n'a été dit au-delà du chantier et de l'heure.
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balises markdown, au format exact :
{"projectId": string | null, "workTypeId": string | null, "startTime": string | null, "endTime": string | null, "hours": number | null, "note": string}`;

interface ListItem {
  id: string;
  name?: string;
  label?: string;
}

interface ParsedEntry {
  projectId: string | null;
  workTypeId: string | null;
  startTime: string | null;
  endTime: string | null;
  hours: number | null;
  note: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { transcript, organization_id, projects, work_types, today } = await req.json();
    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return json({ error: 'transcript requis' }, 400);
    }
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Génération IA non configurée (clé Anthropic manquante)' }, 500);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // No DB access needed beyond confirming the caller is a real,
    // authenticated user — the project/work-type lists are passed in by the
    // client (already RLS-checked, from its own organization) rather than
    // re-derived here.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);

    const { data: allowed, error: quotaError } = await userClient.rpc('check_and_log_ai_usage', {
      p_organization_id: organization_id,
    });
    if (quotaError) return json({ error: 'Accès refusé' }, 403);
    if (!allowed) return json({ error: "Quota d'utilisations IA mensuel atteint sur votre plan. Passez à un plan supérieur pour continuer." }, 403);

    const projectList: ListItem[] = Array.isArray(projects) ? projects.slice(0, MAX_LIST_ITEMS) : [];
    const workTypeList: ListItem[] = Array.isArray(work_types) ? work_types.slice(0, MAX_LIST_ITEMS) : [];
    const projectsText = projectList.length
      ? projectList.map((p) => `- id="${p.id}" — ${p.name ?? ''}`).join('\n')
      : '(aucun chantier)';
    const workTypesText = workTypeList.length
      ? workTypeList.map((w) => `- id="${w.id}" — ${w.label ?? ''}`).join('\n')
      : '(aucun type de travail configuré)';

    const userPrompt = [
      `Date du jour : ${typeof today === 'string' && today ? today : new Date().toISOString().slice(0, 10)}`,
      '',
      'Chantiers de cette entreprise :',
      projectsText,
      '',
      'Types de travail de cette entreprise :',
      workTypesText,
      '',
      'Texte dicté à transformer en entrée d\'heures :',
      transcript,
    ].join('\n');

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('Anthropic error', aiRes.status, errText);
      return json({ error: 'Échec de la génération IA, réessayez dans un instant' }, 502);
    }

    const aiData = await aiRes.json();
    const raw = ((aiData?.content ?? []) as Array<{ type: string; text?: string }>)
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
      .trim();

    const entry = parseEntry(raw, projectList, workTypeList);
    if (!entry) return json({ error: "La réponse IA n'a pas pu être interprétée" }, 502);

    return json({ entry });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

// Claude is instructed to answer with bare JSON, but strips fences
// defensively in case it wraps the object in a ```json block anyway, and
// falls back to the first {...} substring if there's stray prose around it.
function parseEntry(raw: string, projects: ListItem[], workTypes: ListItem[]): ParsedEntry | null {
  let text = raw.trim();
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) text = fenced[1].trim();
  if (!text.startsWith('{')) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start) return null;
    text = text.slice(start, end + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;

  const projectIds = new Set(projects.map((p) => p.id));
  const workTypeIds = new Set(workTypes.map((w) => w.id));

  const projectId = typeof obj.projectId === 'string' && projectIds.has(obj.projectId) ? obj.projectId : null;
  const workTypeId = typeof obj.workTypeId === 'string' && workTypeIds.has(obj.workTypeId) ? obj.workTypeId : null;
  const timeRe = /^\d{2}:\d{2}$/;
  const startTime = typeof obj.startTime === 'string' && timeRe.test(obj.startTime) ? obj.startTime : null;
  const endTime = typeof obj.endTime === 'string' && timeRe.test(obj.endTime) ? obj.endTime : null;
  const hoursRaw = obj.hours;
  const hours = typeof hoursRaw === 'number' && Number.isFinite(hoursRaw) && hoursRaw > 0 && hoursRaw <= 24 ? hoursRaw : null;
  const note = typeof obj.note === 'string' ? obj.note.trim() : '';

  return { projectId, workTypeId, startTime: startTime && endTime ? startTime : null, endTime: startTime && endTime ? endTime : null, hours: startTime && endTime ? null : hours, note };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
