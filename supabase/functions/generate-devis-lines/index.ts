import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';
const MAX_CATALOG_ITEMS = 150;

const SYSTEM_PROMPT = `Tu aides des artisans et entreprises du bâtiment en Suisse romande à transformer une description de devis dictée à l'oral en lignes structurées.
On te donne le texte dicté (souvent informel, parfois mal transcrit) et le catalogue de prix habituels de cette entreprise (les articles qu'elle a déjà facturés par le passé, avec leur prix).

Règles strictes :
- Découpe le texte en positions distinctes : une ligne par élément ou prestation mentionné. Ne fusionne jamais deux prestations différentes dans une même ligne.
- Pour chaque position, déduis la quantité mentionnée (écrite en toutes lettres ou en chiffres) ; si aucune quantité n'est mentionnée, utilise 1.
- Compare chaque position au catalogue fourni. Si un article du catalogue correspond clairement à la même prestation (même si le texte dicté est mal orthographié ou approximatif, ex. "tu es au PVC" pour "tuyau PVC"), reprends EXACTEMENT sa description, son unité et son prix unitaire tels que fournis dans le catalogue, et mets "matched": true.
- Si aucun article du catalogue ne correspond clairement, rédige une description propre et professionnelle basée sur ce qui a été dit, choisis une unité plausible (pce, m², m³, ml, h, kg), mets "unitPrice": null (l'artisan devra saisir le prix lui-même) et "matched": false.
- N'invente jamais de prix : un prix ne peut venir que du catalogue fourni.
- Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour, sans balises markdown, au format exact :
[{"description": string, "quantity": number, "unit": string, "unitPrice": number | null, "matched": boolean}]`;

interface CatalogInput {
  description: string;
  unit: string;
  unitPrice: number;
}

interface DevisLine {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number | null;
  matched: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { transcript, catalog } = await req.json();
    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return json({ error: 'transcript requis' }, 400);
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Génération IA non configurée (clé Anthropic manquante)' }, 500);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // No DB access is needed beyond confirming the caller is a real,
    // authenticated user — the catalog itself is passed in by the client
    // (it already read it, RLS-checked, from its own organization) rather
    // than re-derived here.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);

    const catalogItems: CatalogInput[] = Array.isArray(catalog) ? catalog.slice(0, MAX_CATALOG_ITEMS) : [];
    const catalogText = catalogItems.length
      ? catalogItems.map((c) => `- ${c.description} — CHF ${Number(c.unitPrice).toFixed(2)}/${c.unit}`).join('\n')
      : "(catalogue vide, aucun article n'a encore été facturé par cette entreprise)";

    const userPrompt = [
      'Catalogue de prix habituels de cette entreprise :',
      catalogText,
      '',
      'Texte dicté à transformer en lignes de devis :',
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
        max_tokens: 2000,
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

    const lines = parseLines(raw);
    if (!lines) return json({ error: "La réponse IA n'a pas pu être interprétée" }, 502);
    if (lines.length === 0) return json({ error: "Aucune position n'a été comprise dans la dictée" }, 422);

    return json({ lines });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

// Claude is instructed to answer with bare JSON, but strips fences
// defensively in case it wraps the array in a ```json block anyway, and
// falls back to the first [...] substring if there's stray prose around it.
function parseLines(raw: string): DevisLine[] | null {
  let text = raw.trim();
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) text = fenced[1].trim();
  if (!text.startsWith('[')) {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1 || end < start) return null;
    text = text.slice(start, end + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const lines: DevisLine[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    const description = typeof (item as any).description === 'string' ? (item as any).description.trim() : '';
    if (!description) continue;
    const quantityRaw = Number((item as any).quantity);
    const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1;
    const unit = typeof (item as any).unit === 'string' && (item as any).unit.trim() ? (item as any).unit.trim() : 'pce';
    const unitPriceRaw = (item as any).unitPrice;
    const unitPrice = typeof unitPriceRaw === 'number' && Number.isFinite(unitPriceRaw) ? unitPriceRaw : null;
    const matched = unitPrice != null && (item as any).matched === true;
    lines.push({ description, quantity, unit, unitPrice, matched });
  }
  return lines;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
