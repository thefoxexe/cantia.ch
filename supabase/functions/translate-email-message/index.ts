import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';

const TARGET_LABEL: Record<'fr' | 'de', string> = { fr: 'français', de: 'allemand (suisse)' };

// One-off translation of the message a member is about to send alongside a
// devis/facture/travaux supplémentaires — for the case a document's own
// resolved locale (see resolveDocLocale, supabase/functions/_shared/
// pdf-i18n.ts) doesn't match the language the message happens to be
// written in (e.g. the org's own saved default message is French, but this
// particular document is set to German). Deliberately scoped to just this
// text box, not a general-purpose translator: {{variable}} tokens must
// survive untouched since the send functions substitute them afterwards.
function buildSystemPrompt(target: 'fr' | 'de'): string {
  return [
    `Tu traduis un message d'accompagnement (devis, facture ou travaux supplémentaires) envoyé par une entreprise du bâtiment suisse à l'un de ses clients.`,
    `Traduis le texte fourni en ${TARGET_LABEL[target]}, dans un registre professionnel et chaleureux adapté à ce contexte.`,
    `Règles strictes :`,
    `- Conserve EXACTEMENT tel quel tout jeton du type {{nom}} (par exemple {{client}}, {{entreprise}}, {{chantier}}, {{numero}}, {{echeance}}) — ne les traduis jamais, ne change jamais leur orthographe.`,
    `- Conserve la structure du texte (sauts de ligne, paragraphes).`,
    `- Ne rajoute aucun commentaire, préambule ou explication.`,
    `- Réponds uniquement avec le texte traduit.`,
  ].join('\n');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { organization_id, text, target_locale } = await req.json();
    if (!organization_id || !text?.trim()) return json({ error: 'organization_id et text requis' }, 400);
    if (target_locale !== 'fr' && target_locale !== 'de') return json({ error: 'target_locale invalide' }, 400);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Traduction IA non configurée (clé Anthropic manquante)' }, 500);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // check_and_log_ai_usage is SECURITY DEFINER and itself verifies the
    // caller belongs to organization_id (is_org_member) before touching the
    // quota — no separate membership check needed here.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
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
        max_tokens: 1000,
        system: buildSystemPrompt(target_locale),
        messages: [{ role: 'user', content: text }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('Anthropic error', aiRes.status, errText);
      return json({ error: 'Échec de la traduction IA, réessayez dans un instant' }, 502);
    }

    const aiData = await aiRes.json();
    const translated = ((aiData?.content ?? []) as Array<{ type: string; text?: string }>)
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!translated) return json({ error: 'La réponse IA était vide' }, 502);

    return json({ text: translated });
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
