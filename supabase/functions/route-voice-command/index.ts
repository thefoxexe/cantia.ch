import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';
const MAX_LIST_ITEMS = 300;

interface ListItem {
  id: string;
  name?: string;
  label?: string;
}

interface RoutedCommand {
  action: 'payroll_entry' | 'expense' | 'create_devis' | 'create_facture' | 'question' | 'unknown';
  projectId: string | null;
  workTypeId: string | null;
  startTime: string | null;
  endTime: string | null;
  hours: number | null;
  label: string | null;
  amount: number | null;
  clientName: string | null;
  note: string;
  summary: string;
}

const ACTION_LABELS: Record<string, string> = {
  payroll_entry: '"payroll_entry" (heures travaillées)',
  expense: '"expense" (dépense/achat matériel)',
  create_devis: '"create_devis" (créer un nouveau devis)',
  create_facture: '"create_facture" (créer une nouvelle facture)',
  question: '"question" (question générale ou demande de résumé, pas une action à enregistrer)',
};

function buildSystemPrompt(allowedActions: string[], locale: string): string {
  const actionsList = allowedActions.map((a) => ACTION_LABELS[a] ?? `"${a}"`).join(' ou ');
  const lang = locale === 'de' ? 'allemand' : 'français';

  return `Tu aides des artisans et entreprises du bâtiment en Suisse à comprendre une commande dictée à l'oral (assistant vocal global de l'app, pas lié à un écran précis) et à la transformer en une action structurée.
On te donne le texte dicté (souvent informel, parfois mal transcrit, en français ou en allemand suisse), la date du jour, la liste des chantiers de cette entreprise (id + nom) et la liste des types de travail (id + libellé).

Actions possibles pour cette organisation : ${actionsList || 'aucune'}.
- "payroll_entry" : la personne rapporte des heures travaillées sur un chantier (ex. "chantier villa, de 7h à 15h, coffrage", "j'ai fait 6 heures aujourd'hui sur le chantier Dubois").
- "expense" : la personne rapporte un achat ou une dépense de matériel pour un chantier (ex. "chantier villa, achat de vis chez Bauhaus, 45 francs", "j'ai payé 120 francs de carrelage pour le chantier Dubois").
- "create_devis" : la personne veut créer un nouveau devis, généralement en dictant le nom du client et les prestations/quantités (ex. "crée un devis pour Marc Dupont, 20 mètres carrés de carrelage à 85 francs le mètre carré", "fais-moi une offre pour Madame Keller").
- "create_facture" : comme "create_devis" mais pour une facture directe, sans devis préalable (ex. "fais une facture pour l'entreprise Rossi, 10 heures de maçonnerie à 75 francs").
- "question" : la personne pose une question générale sur son entreprise ou l'application, ou demande un résumé/état des lieux (ex. "quelles factures sont en retard ?", "fais-moi un résumé de mes tâches", "quelle est l'adresse de mon entreprise ?", "qu'est-ce que je dois faire aujourd'hui ?"). Ne cherche jamais à répondre toi-même à la question ici — classe-la seulement comme "question", la réponse sera générée séparément avec les vraies données de l'entreprise.
- "unknown" : le texte ne décrit clairement aucune des actions ci-dessus, ou est incompréhensible.

Règles strictes :
- Choisis l'action la plus probable parmi celles listées ci-dessus, ou "unknown" si aucune ne correspond clairement.
- Identifie le chantier mentionné et fais correspondre EXACTEMENT son id parmi la liste fournie (fuzzy match accepté — nom approximatif, incomplet ou mal transcrit). N'invente jamais un id absent de la liste. Si aucun chantier ne correspond clairement, mets "projectId": null (ne mets PAS action à "unknown" pour cette seule raison — l'utilisateur pourra choisir le chantier lui-même avant de confirmer).
- Pour "payroll_entry" : identifie le type de travail (id de la liste, ou null si aucun ne correspond). Si une heure de début ET de fin sont mentionnées, extrais-les au format 24h "HH:MM" dans startTime/endTime et laisse hours à null. Si seulement une durée est mentionnée, mets le nombre décimal dans hours (ex. 7.5) et laisse startTime/endTime à null. Résume ce qui a été fait en quelques mots dans "note" (chaîne vide si rien de précis).
- Pour "expense" : "label" = fournisseur + résumé très court de l'achat (ex. "Bauhaus — vis"), "amount" = montant total en nombre décimal (ex. 45 ou 84.50). Ne convertis jamais de devise.
- Pour "create_devis" et "create_facture" : "clientName" = le nom du client tel que dicté (personne ou entreprise), nettoyé et correctement capitalisé, ou null si aucun nom n'est mentionné. Ne cherche PAS à extraire les lignes/prestations ici — laisse "label" et "amount" à null, elles seront traitées séparément à partir du même texte dicté.
- Pour "question" : laisse tous les champs structurés (projectId, workTypeId, hours, label, amount, clientName, etc.) à null — seul "summary" compte, et il doit reformuler la question posée, pas y répondre.
- Laisse à null tout champ non pertinent pour l'action choisie.
- Rédige "summary" : une phrase courte et naturelle en ${lang}. Pour les actions qui enregistrent quelque chose (payroll_entry, expense, create_devis, create_facture), c'est ce qui sera affiché à l'utilisateur pour confirmation avant tout enregistrement. Si action="unknown", explique brièvement pourquoi en une phrase (ex. "Je n'ai pas compris s'il s'agit d'heures ou d'une dépense.").
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balises markdown, au format exact :
{"action": "payroll_entry" | "expense" | "create_devis" | "create_facture" | "question" | "unknown", "projectId": string | null, "workTypeId": string | null, "startTime": string | null, "endTime": string | null, "hours": number | null, "label": string | null, "amount": number | null, "clientName": string | null, "note": string, "summary": string}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { transcript, organization_id, projects, work_types, allowed_actions, locale, today } = await req.json();
    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return json({ error: 'transcript requis' }, 400);
    }
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);

    const allowedActions: string[] = Array.isArray(allowed_actions)
      ? allowed_actions.filter((a) => Object.prototype.hasOwnProperty.call(ACTION_LABELS, a))
      : [];
    if (allowedActions.length === 0) return json({ error: 'Aucune action disponible' }, 400);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Génération IA non configurée (clé Anthropic manquante)' }, 500);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

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
    const resolvedLocale = locale === 'de' ? 'de' : 'fr';

    const userPrompt = [
      `Date du jour : ${typeof today === 'string' && today ? today : new Date().toISOString().slice(0, 10)}`,
      '',
      'Chantiers de cette entreprise :',
      projectsText,
      '',
      'Types de travail de cette entreprise :',
      workTypesText,
      '',
      'Texte dicté à transformer en action :',
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
        system: buildSystemPrompt(allowedActions, resolvedLocale),
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

    const command = parseCommand(raw, projectList, workTypeList, allowedActions);
    if (!command) return json({ error: "La réponse IA n'a pas pu être interprétée" }, 502);

    return json({ command });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

// Claude is instructed to answer with bare JSON, but strips fences
// defensively in case it wraps the object in a ```json block anyway, and
// falls back to the first {...} substring if there's stray prose around it.
function parseCommand(raw: string, projects: ListItem[], workTypes: ListItem[], allowedActions: string[]): RoutedCommand | null {
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

  const rawAction = obj.action;
  const validActions = new Set(['payroll_entry', 'expense', 'create_devis', 'create_facture', 'question']);
  const action: RoutedCommand['action'] =
    typeof rawAction === 'string' && validActions.has(rawAction) && allowedActions.includes(rawAction)
      ? (rawAction as RoutedCommand['action'])
      : 'unknown';

  const projectId = typeof obj.projectId === 'string' && projectIds.has(obj.projectId) ? obj.projectId : null;
  const workTypeId = typeof obj.workTypeId === 'string' && workTypeIds.has(obj.workTypeId) ? obj.workTypeId : null;
  const timeRe = /^\d{2}:\d{2}$/;
  const startTimeRaw = typeof obj.startTime === 'string' && timeRe.test(obj.startTime) ? obj.startTime : null;
  const endTimeRaw = typeof obj.endTime === 'string' && timeRe.test(obj.endTime) ? obj.endTime : null;
  const hasRange = !!(startTimeRaw && endTimeRaw);
  const hoursRaw = obj.hours;
  const hours = !hasRange && typeof hoursRaw === 'number' && Number.isFinite(hoursRaw) && hoursRaw > 0 && hoursRaw <= 24 ? hoursRaw : null;
  const note = typeof obj.note === 'string' ? obj.note.trim() : '';

  const label = typeof obj.label === 'string' ? obj.label.trim() : null;
  const amountRaw = obj.amount;
  const amount = typeof amountRaw === 'number' && Number.isFinite(amountRaw) && amountRaw > 0 ? Math.round(amountRaw * 100) / 100 : null;
  const clientName = typeof obj.clientName === 'string' && obj.clientName.trim() ? obj.clientName.trim() : null;

  const summary = typeof obj.summary === 'string' && obj.summary.trim() ? obj.summary.trim() : '';

  return {
    action,
    projectId,
    workTypeId,
    startTime: hasRange ? startTimeRaw : null,
    endTime: hasRange ? endTimeRaw : null,
    hours,
    label,
    amount,
    clientName,
    note,
    summary,
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
