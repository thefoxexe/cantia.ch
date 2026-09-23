import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';

// Asks for a structured breakdown (title, summary, dated steps, flagged
// anomalies, next step) instead of one flowing paragraph — generate-
// report-pdf lays this out with photos next to the step/anomaly they
// illustrate and anomalies in their own highlighted block, which a single
// block of prose can't express. photo_indexes reference the position (0-
// based) of a photo in the SAME ORDER as the "Photos jointes" list below
// (report_photos ordered by sort_order) — never a caption, id or filename,
// since those aren't guaranteed unique or stable.
const SYSTEM_PROMPT = `Tu rédiges des rapports de chantier professionnels pour des artisans et entreprises du bâtiment en Suisse.
On te donne des notes brutes prises sur le terrain (souvent dictées à l'oral, informelles, avec des fautes) et la liste des photos jointes avec leur légende et leur position (index).
Tu dois répondre UNIQUEMENT avec un objet JSON valide, rien d'autre (pas de texte avant/après, pas de balises markdown), respectant exactement ce schéma :
{
  "title": string | null,
  "summary": string,
  "sections": [{ "label": string, "text": string, "photo_indexes": number[] }],
  "attention": [{ "text": string, "photo_indexes": number[] }],
  "next_steps": string | null
}
Règles strictes :
- Réponds TOUJOURS dans la même langue que les notes fournies (français, allemand suisse ou italien le plus souvent) — ne traduis jamais.
- N'invente jamais de fait, chiffre, date ou observation qui n'est pas dans les notes fournies.
- "title" : un titre court (6-10 mots) qui résume CE QUI S'EST PASSÉ ce jour-là (ex. "Pose des meubles bas et adaptation de l'arrivée d'eau"), jamais une simple date ni un titre générique type "Rapport de chantier". Mets null seulement si les notes sont trop maigres pour en tirer un titre spécifique.
- "summary" : une à deux phrases, l'essentiel de la journée en un coup d'œil.
- "sections" : découpe le travail réalisé en étapes ou zones logiques (2 à 5 sections en général) ; chaque "text" est un court paragraphe (2-4 phrases) en prose professionnelle. Ne mets JAMAIS de puces ni d'astérisques dans "text".
- "attention" : UNIQUEMENT les anomalies, imprévus, écarts au plan, points nécessitant validation ou vigilance — un tableau vide si rien de tel n'est mentionné dans les notes. Ne force jamais une entrée artificielle.
- "photo_indexes" : uniquement des index de la liste "Photos jointes" fournie, seulement quand une photo illustre clairement cette section/ce point précis d'après sa légende ou son contexte — sinon un tableau vide. Une même photo peut être référencée par au plus une section ou un point d'attention (jamais les deux, jamais deux fois).
- "next_steps" : une phrase courte sur la suite prévue si les notes la mentionnent, sinon null.
- Corrige l'orthographe et la grammaire partout, reformule en phrases complètes et professionnelles.
- Reste concis : privilégie la clarté à la longueur.`;

interface StructuredReport {
  title: string | null;
  summary: string;
  sections: { label: string; text: string; photo_indexes: number[] }[];
  attention: { text: string; photo_indexes: number[] }[];
  next_steps: string | null;
}

// Turns the structured object back into flat text — kept as reports.notes
// so anything that only ever reads plain text (search, the in-app notes
// textarea, older report renderings) still gets something sensible.
function flattenStructured(s: StructuredReport): string {
  const parts: string[] = [s.summary];
  for (const section of s.sections) parts.push(`${section.label} : ${section.text}`);
  for (const a of s.attention) parts.push(`Point d'attention : ${a.text}`);
  if (s.next_steps) parts.push(`Prochaine étape : ${s.next_steps}`);
  return parts.filter(Boolean).join('\n\n');
}

// Validates the model's own JSON against the schema rather than trusting it
// blindly — a malformed/partial response (truncated by max_tokens, an odd
// model quirk) must fall back to null structured content, never a half-
// built object the PDF renderer would choke on or misrender.
function parseStructured(raw: string, photoCount: number): StructuredReport | null {
  let parsed: unknown;
  try {
    // The model is instructed to return bare JSON, but strip a ```json
    // fence defensively in case it wraps it anyway.
    const cleaned = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const p = parsed as Record<string, unknown>;

  const clampIndexes = (v: unknown): number[] =>
    Array.isArray(v) ? v.filter((n): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < photoCount) : [];

  if (typeof p.summary !== 'string' || !p.summary.trim()) return null;
  if (!Array.isArray(p.sections)) return null;

  const sections = p.sections
    .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
    .map((s) => ({
      label: typeof s.label === 'string' && s.label.trim() ? s.label.trim() : 'Travaux réalisés',
      text: typeof s.text === 'string' ? s.text.trim() : '',
      photo_indexes: clampIndexes(s.photo_indexes),
    }))
    .filter((s) => s.text.length > 0);
  if (sections.length === 0) return null;

  const attention = Array.isArray(p.attention)
    ? p.attention
        .filter((a): a is Record<string, unknown> => !!a && typeof a === 'object')
        .map((a) => ({ text: typeof a.text === 'string' ? a.text.trim() : '', photo_indexes: clampIndexes(a.photo_indexes) }))
        .filter((a) => a.text.length > 0)
    : [];

  return {
    title: typeof p.title === 'string' && p.title.trim() ? p.title.trim() : null,
    summary: p.summary.trim(),
    sections,
    attention,
    next_steps: typeof p.next_steps === 'string' && p.next_steps.trim() ? p.next_steps.trim() : null,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { report_id } = await req.json();
    if (!report_id) return json({ error: 'report_id requis' }, 400);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: "Rédaction IA non configurée (clé Anthropic manquante)" }, 500);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // Bound to the caller's JWT: RLS enforces the caller belongs to the org.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    // Service role: used only after the RLS-checked read above succeeds.
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: report, error: reportError } = await userClient
      .from('reports')
      .select('*, projects(name, client_name, address)')
      .eq('id', report_id)
      .single();

    if (reportError || !report) return json({ error: 'Rapport introuvable ou accès refusé' }, 404);
    if (!report.notes?.trim()) return json({ error: 'Ce rapport ne contient aucune note à rédiger' }, 400);

    const { data: allowed, error: quotaError } = await userClient.rpc('check_and_log_ai_usage', {
      p_organization_id: report.organization_id,
    });
    if (quotaError) return json({ error: 'Accès refusé' }, 403);
    if (!allowed) return json({ error: "Quota d'utilisations IA mensuel atteint sur votre plan. Passez à un plan supérieur pour continuer." }, 403);

    const { data: org } = await admin.from('organizations').select('trade').eq('id', report.organization_id).maybeSingle();
    const systemPrompt = org?.trade ? `${SYSTEM_PROMPT}\n\nCette entreprise a pour corps de métier principal : ${org.trade}. Utilise le vocabulaire technique et les tournures usuelles de ce métier en Suisse (romande, alémanique ou italophone selon la langue des notes) dans le texte rédigé.` : SYSTEM_PROMPT;

    const { data: photos } = await admin
      .from('report_photos')
      .select('caption')
      .eq('report_id', report_id)
      .order('sort_order', { ascending: true });
    const photoList = photos ?? [];

    const project = report.projects as { name?: string; client_name?: string; address?: string } | null;
    const contextLines = [
      project?.name ? `Chantier : ${project.name}` : null,
      project?.client_name ? `Client : ${project.client_name}` : null,
      project?.address ? `Adresse : ${project.address}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const photoLines = photoList.map((p, i) => `${i}. ${p.caption?.trim() || '(sans légende)'}`);

    const userPrompt = [
      contextLines ? `Contexte du chantier :\n${contextLines}\n` : '',
      'Notes brutes prises sur le terrain :',
      report.notes,
      photoLines.length ? `\nPhotos jointes (index. légende) :\n${photoLines.join('\n')}` : '\nAucune photo jointe.',
    ]
      .filter(Boolean)
      .join('\n');

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('Anthropic error', aiRes.status, errText);
      return json({ error: 'Échec de la rédaction IA, réessayez dans un instant' }, 502);
    }

    const aiData = await aiRes.json();
    const raw = ((aiData?.content ?? []) as Array<{ type: string; text?: string }>)
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!raw) return json({ error: 'La réponse IA était vide' }, 502);

    const structured = parseStructured(raw, photoList.length);
    if (!structured) {
      console.error('polish-report-notes: could not parse structured JSON from model output', raw.slice(0, 500));
      return json({ error: "La rédaction IA n'a pas pu être structurée, réessayez" }, 502);
    }

    return json({ title: structured.title, notes: flattenStructured(structured), structured });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
