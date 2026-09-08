import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';
const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
// Anthropic's own per-image cap is 5MB of base64 — checked here too so a
// huge photo fails fast with a clear message instead of a vague 400/413
// from the API.
const MAX_BASE64_LENGTH = 5_000_000;

const SYSTEM_PROMPT = `Tu aides des artisans et entreprises du bâtiment en Suisse à transformer une photo de ticket de caisse ou de facture fournisseur en une dépense de chantier structurée.
Regarde l'image fournie et identifie :
- Le nom du fournisseur/magasin, suivi d'un résumé très court de ce qui a été acheté si c'est lisible (ex. "Bauhaus — visserie et outillage", "Migros — petit matériel").
- Le montant TOTAL payé (TTC), tel qu'imprimé sur le ticket, en nombre décimal (ex. 84.50). Ne convertis jamais de devise — si ce n'est pas en CHF, indique quand même le nombre tel qu'imprimé.

Si l'image n'est pas un ticket de caisse ou une facture, ou si le montant total n'est pas clairement lisible, réponds avec {"label": "", "amount": 0}.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balises markdown, au format exact :
{"label": string, "amount": number}`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { organization_id, image_base64, media_type } = await req.json();
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);
    if (!image_base64 || typeof image_base64 !== 'string') return json({ error: 'image_base64 requis' }, 400);
    if (image_base64.length > MAX_BASE64_LENGTH) return json({ error: 'Photo trop volumineuse' }, 400);
    const mediaType = typeof media_type === 'string' && ALLOWED_MEDIA_TYPES.has(media_type) ? media_type : 'image/jpeg';

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

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: image_base64 } },
              { type: 'text', text: 'Lis ce ticket de caisse / cette facture et extrais le fournisseur et le montant total.' },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('Anthropic error', aiRes.status, errText);
      return json({ error: 'Échec de la lecture du ticket, réessayez dans un instant' }, 502);
    }

    const aiData = await aiRes.json();
    const raw = ((aiData?.content ?? []) as Array<{ type: string; text?: string }>)
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
      .trim();

    const receipt = parseReceipt(raw);
    if (!receipt) return json({ error: "La réponse IA n'a pas pu être interprétée" }, 502);
    if (!receipt.label && !receipt.amount) return json({ error: "Le ticket n'a pas pu être lu — réessayez avec une photo plus nette" }, 422);

    return json({ receipt });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function parseReceipt(raw: string): { label: string; amount: number } | null {
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

  const label = typeof obj.label === 'string' ? obj.label.trim() : '';
  const amountRaw = obj.amount;
  const amount = typeof amountRaw === 'number' && Number.isFinite(amountRaw) && amountRaw > 0 ? Math.round(amountRaw * 100) / 100 : 0;

  return { label, amount };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
