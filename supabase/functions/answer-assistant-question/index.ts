import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';
const MAX_LIST_ITEMS = 20;

interface AssistantTask {
  title: string;
  category: string;
}

interface AssistantOverdueFacture {
  clientName: string;
  amountChf: number;
  daysOverdue: number;
}

interface AssistantContext {
  orgName: string;
  orgTrade: string | null;
  orgAddress: string | null;
  orgPhone: string | null;
  orgEmail: string | null;
  planName: string | null;
  openTasks: AssistantTask[];
  openTasksCount: number;
  overdueFactures: AssistantOverdueFacture[];
  overdueCount: number;
  overdueTotalChf: number;
  upcomingRecurringExpensesCount: number | null;
}

// The global voice assistant's second stage for a "question" command: unlike
// route-voice-command (which only classifies and never sees real business
// data), this one is handed a context bundle the client already fetched
// itself (RLS-checked, from its own organization) and answers using ONLY
// that — it must never invent figures. Mirrors generate-devis-lines' split
// of "classify cheaply" vs "generate expensively" into two calls.
function buildSystemPrompt(locale: string): string {
  const lang = locale === 'de' ? 'allemand' : 'français';
  return `Tu es l'assistant intégré à Cantia, une application suisse de gestion pour les entreprises du bâtiment (devis, factures, chantiers, RH, trésorerie). Un artisan ou un responsable d'entreprise te pose une question à l'oral depuis n'importe quel écran de l'application.

On te donne un instantané de données réelles de son entreprise (tâches en cours, factures en retard, informations de l'entreprise). Réponds à sa question UNIQUEMENT à partir de ces données.

Règles strictes :
- Ne réponds jamais en inventant un chiffre, un nom ou une date qui n'est pas dans les données fournies.
- Si la question porte sur quelque chose que les données ne couvrent pas (ex. un chantier précis, un client précis, une fonctionnalité de l'app), dis-le clairement et brièvement plutôt que de deviner — tu peux orienter vers le bon endroit de l'application si tu le sais (ex. "Rentabilité par chantier", "Devis", "Planning"), mais sans détailler des données que tu n'as pas.
- Reste concis : 1 à 4 phrases, ton naturel et direct, comme si tu parlais à voix haute — pas de liste à puces, pas de markdown.
- Réponds dans la même langue que la question si elle est clairement identifiable, sinon en ${lang}.
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balises markdown, au format exact :
{"answer": string}`;
}

function formatContext(ctx: AssistantContext): string {
  const lines: string[] = [];
  lines.push(`Entreprise : ${ctx.orgName}${ctx.orgTrade ? ` (${ctx.orgTrade})` : ''}`);
  if (ctx.orgAddress) lines.push(`Adresse : ${ctx.orgAddress}`);
  if (ctx.orgPhone) lines.push(`Téléphone : ${ctx.orgPhone}`);
  if (ctx.orgEmail) lines.push(`E-mail : ${ctx.orgEmail}`);
  if (ctx.planName) lines.push(`Plan Cantia actuel : ${ctx.planName}`);

  lines.push('');
  lines.push(`Tâches en cours (${ctx.openTasksCount} au total, jusqu'à ${MAX_LIST_ITEMS} listées) :`);
  lines.push(
    ctx.openTasks.length ? ctx.openTasks.map((t) => `- ${t.title} [${t.category}]`).join('\n') : '(aucune tâche en cours)',
  );

  lines.push('');
  lines.push(
    `Factures en retard de paiement (${ctx.overdueCount} au total, CHF ${ctx.overdueTotalChf.toFixed(0)} en jeu, jusqu'à ${MAX_LIST_ITEMS} listées) :`,
  );
  lines.push(
    ctx.overdueFactures.length
      ? ctx.overdueFactures.map((f) => `- ${f.clientName} — CHF ${f.amountChf.toFixed(0)}, en retard de ${f.daysOverdue} jour(s)`).join('\n')
      : '(aucune facture en retard)',
  );

  if (ctx.upcomingRecurringExpensesCount !== null) {
    lines.push('');
    lines.push(`Dépenses récurrentes qui tombent dans les 7 prochains jours : ${ctx.upcomingRecurringExpensesCount}`);
  }

  return lines.join('\n');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { transcript, organization_id, context, locale } = await req.json();
    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return json({ error: 'transcript requis' }, 400);
    }
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);
    if (!context || typeof context !== 'object') return json({ error: 'context requis' }, 400);

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

    const ctx = sanitizeContext(context);
    const resolvedLocale = locale === 'de' ? 'de' : 'fr';

    const userPrompt = [formatContext(ctx), '', 'Question posée à voix haute :', transcript].join('\n');

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        system: buildSystemPrompt(resolvedLocale),
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

    const answer = parseAnswer(raw);
    if (!answer) return json({ error: "La réponse IA n'a pas pu être interprétée" }, 502);

    return json({ answer });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

// Trusts nothing from the client beyond shape — every field is re-typed and
// length-capped before it ever reaches the prompt.
function sanitizeContext(raw: unknown): AssistantContext {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 200) : null);
  const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

  const openTasks: AssistantTask[] = Array.isArray(obj.openTasks)
    ? obj.openTasks
        .slice(0, MAX_LIST_ITEMS)
        .map((t) => ({
          title: typeof (t as any)?.title === 'string' ? (t as any).title.slice(0, 200) : '',
          category: typeof (t as any)?.category === 'string' ? (t as any).category.slice(0, 40) : 'general',
        }))
        .filter((t) => t.title)
    : [];

  const overdueFactures: AssistantOverdueFacture[] = Array.isArray(obj.overdueFactures)
    ? obj.overdueFactures
        .slice(0, MAX_LIST_ITEMS)
        .map((f) => ({
          clientName: typeof (f as any)?.clientName === 'string' ? (f as any).clientName.slice(0, 200) : '',
          amountChf: num((f as any)?.amountChf),
          daysOverdue: Math.max(0, Math.round(num((f as any)?.daysOverdue))),
        }))
        .filter((f) => f.clientName)
    : [];

  return {
    orgName: str(obj.orgName) ?? 'Cette entreprise',
    orgTrade: str(obj.orgTrade),
    orgAddress: str(obj.orgAddress),
    orgPhone: str(obj.orgPhone),
    orgEmail: str(obj.orgEmail),
    planName: str(obj.planName),
    openTasks,
    openTasksCount: Math.max(openTasks.length, Math.round(num(obj.openTasksCount))),
    overdueFactures,
    overdueCount: Math.max(overdueFactures.length, Math.round(num(obj.overdueCount))),
    overdueTotalChf: num(obj.overdueTotalChf),
    upcomingRecurringExpensesCount: typeof obj.upcomingRecurringExpensesCount === 'number' ? Math.round(obj.upcomingRecurringExpensesCount) : null,
  };
}

// Claude is instructed to answer with bare JSON, but strips fences
// defensively in case it wraps the object in a ```json block anyway, and
// falls back to the first {...} substring if there's stray prose around it.
function parseAnswer(raw: string): string | null {
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
  const answer = (parsed as Record<string, unknown>).answer;
  return typeof answer === 'string' && answer.trim() ? answer.trim() : null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
