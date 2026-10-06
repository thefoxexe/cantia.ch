import { createClient } from 'npm:@supabase/supabase-js@2';

// OCR fallback for scanned soumissions (PDF pages without a text layer).
// The model only TRANSCRIBES what is printed, line by line, into a strict
// schema (forced tool call); it never interprets, totals or completes
// anything. The browser turns the rows back into a layout and runs the same
// rules-based parser as for native PDFs (lib/tenders/ocr.ts), so the import
// review, questions and checks are identical. One call = one AI use.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';
const MAX_PAGES_PER_CALL = 4;
const MAX_BASE64_LENGTH = 4_500_000;

const SYSTEM_PROMPT = `Tu transcris des pages scannées de soumissions de construction suisses (bordereaux CAN/NPK, descriptifs, devis quantitatifs), en français, allemand ou italien.

Règles absolues :
- Transcris EXACTEMENT ce qui est imprimé. N'invente rien, ne corrige rien, ne complète rien, ne calcule rien.
- Une ligne imprimée = une entrée "rows", dans l'ordre de lecture (haut → bas).
- Ignore les en-têtes et pieds de page répétés (nom du projet, date, numéro de page) SAUF l'en-tête de chapitre CAN (ex. "CAN Construction : 241 Constructions en béton coulé sur place F/04(V´11)") que tu rends avec kind = "chapter_header".
- "number" : la numérotation en début de ligne telle qu'imprimée ("241", "121", ".111", "121.112"), sans le "R".
- "reserved" : true si la ligne porte la lettre R de position de réserve devant le numéro.
- "zone" : code de ventilation tel qu'imprimé sans les deux-points (":PG" → "PG", ":Total" → "Total").
- "quantity", "unit_price", "amount" : le texte exact imprimé (ex. "8'000", "0,30", "7'200.00"). Vide si le champ est vide ou en pointillés.
- "unit" : l'unité exacte imprimée (m2, m3, m, p, up, kg, gl…). Vide si absente.
- Si un caractère est illisible, laisse le champ vide plutôt que de deviner.
- Les lignes "A reporter", "Report", "Total …" sont transcrites avec kind = "total".`;

const TOOL = {
  name: 'record_rows',
  description: 'Enregistre les lignes transcrites de chaque page.',
  input_schema: {
    type: 'object',
    properties: {
      pages: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            rows: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  kind: { type: 'string', enum: ['line', 'chapter_header', 'total'] },
                  reserved: { type: 'boolean' },
                  number: { type: 'string' },
                  text: { type: 'string' },
                  zone: { type: 'string' },
                  quantity: { type: 'string' },
                  unit: { type: 'string' },
                  unit_price: { type: 'string' },
                  amount: { type: 'string' },
                },
                required: ['kind', 'text'],
              },
            },
          },
          required: ['page', 'rows'],
        },
      },
    },
    required: ['pages'],
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { organization_id, pages } = await req.json();
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);
    if (!Array.isArray(pages) || pages.length === 0 || pages.length > MAX_PAGES_PER_CALL) return json({ error: `1 à ${MAX_PAGES_PER_CALL} pages par appel` }, 400);
    for (const p of pages) {
      if (!Number.isInteger(p?.page) || typeof p?.image_base64 !== 'string' || p.image_base64.length > MAX_BASE64_LENGTH) return json({ error: 'Page invalide' }, 400);
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Lecture IA non configurée (clé Anthropic manquante)' }, 500);

    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);

    // Same plan gate as the module, then the monthly AI quota.
    const { data: hasTenders } = await userClient.rpc('org_has_tenders', { org_id: organization_id });
    if (hasTenders !== true) return json({ error: 'Module non disponible sur ce plan' }, 403);
    const { data: allowed, error: quotaError } = await userClient.rpc('check_and_log_ai_usage', { p_organization_id: organization_id });
    if (quotaError) return json({ error: 'Accès refusé' }, 403);
    if (!allowed) return json({ error: "Quota d'utilisations IA mensuel atteint sur votre plan." }, 403);

    const content: unknown[] = [];
    for (const p of pages) {
      content.push({ type: 'text', text: `Page ${p.page} :` });
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: p.image_base64 } });
    }
    content.push({ type: 'text', text: 'Transcris ces pages avec l’outil record_rows.' });

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'record_rows' },
        messages: [{ role: 'user', content }],
      }),
    });
    if (!aiRes.ok) {
      console.error('Anthropic error', aiRes.status, await aiRes.text());
      return json({ error: 'Lecture des pages impossible, réessayez dans un instant' }, 502);
    }
    const ai = await aiRes.json();
    const call = (ai?.content ?? []).find((b: { type: string }) => b.type === 'tool_use');
    const out = validate(call?.input);
    if (!out) return json({ error: 'Réponse de lecture invalide' }, 502);
    return json({ pages: out, model: ai?.model ?? ANTHROPIC_MODEL });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

// Strict validation before anything reaches the client: unknown keys are
// dropped, every field is a bounded string.
function validate(input: unknown) {
  if (!input || typeof input !== 'object' || !Array.isArray((input as { pages?: unknown }).pages)) return null;
  const str = (v: unknown, max = 400) => (typeof v === 'string' ? v.slice(0, max) : '');
  return ((input as { pages: unknown[] }).pages)
    .filter((p): p is { page: number; rows: unknown[] } => !!p && typeof p === 'object' && Number.isInteger((p as { page?: unknown }).page) && Array.isArray((p as { rows?: unknown }).rows))
    .map((p) => ({
      page: p.page,
      rows: p.rows.slice(0, 400).flatMap((r) => {
        if (!r || typeof r !== 'object') return [];
        const o = r as Record<string, unknown>;
        const kind = o.kind === 'chapter_header' || o.kind === 'total' ? o.kind : 'line';
        return [{ kind, reserved: o.reserved === true, number: str(o.number, 30), text: str(o.text), zone: str(o.zone, 40), quantity: str(o.quantity, 30), unit: str(o.unit, 20), unit_price: str(o.unit_price, 30), amount: str(o.amount, 30) }];
      }),
    }));
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
