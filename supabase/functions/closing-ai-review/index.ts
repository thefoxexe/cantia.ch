import { createClient } from 'npm:@supabase/supabase-js@2';

// AI review of a year-end closing (app/(app)/compta/bouclement.tsx): reads
// the trial balance summary and the closing inputs the client sends, and
// returns a short list of points to check before the books are locked —
// unusual balances, missing provisions, questions for the fiduciary. Same
// auth and monthly AI quota as answer-assistant-question. Advisory only: it
// never writes anything.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// Only numbers and short labels reach the prompt, capped in size.
function sanitize(raw: unknown): unknown {
  const seen = { n: 0 };
  const walk = (v: unknown, depth: number): unknown => {
    if (seen.n++ > 600 || depth > 4) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? Math.round(v * 100) / 100 : null;
    if (typeof v === 'string') return v.slice(0, 120);
    if (typeof v === 'boolean' || v == null) return v ?? null;
    if (Array.isArray(v)) return v.slice(0, 120).map((x) => walk(x, depth + 1));
    if (typeof v === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(v as Record<string, unknown>).slice(0, 60)) out[k.slice(0, 40)] = walk(x, depth + 1);
      return out;
    }
    return null;
  };
  return walk(raw, 0);
}

function systemPrompt(locale: string): string {
  const lang = locale === 'de' ? 'German (Swiss usage)' : locale === 'it' ? 'Italian (Swiss usage)' : 'French (Swiss usage)';
  return [
    'You are a Swiss chartered accountant reviewing the year-end closing of a small construction company (PME du bâtiment) before its books are locked.',
    'You receive the trial balance of the year (account code, label, balances), the result, the automatic checks, and the closing entries the owner prepared (ducroire, depreciation, accruals, work in progress, tax provision).',
    'Write at most 7 short bullet points, most important first. Each point names the account or figure concerned and says concretely what to check or do.',
    'Look for: accounts with an unusual sign, receivables or work in progress that look high or low compared with turnover, missing accruals (insurance, rent, December invoices, holidays not taken), depreciation that is missing or above the AFC rates, a tax provision that does not match the result, VAT periods not declared, and anything the fiduciary should be asked.',
    'Do not invent figures that are not in the data. If everything looks consistent, say so in one sentence.',
    'Never give a definitive legal or tax opinion: these are points to check with the fiduciary.',
    `Answer in ${lang}, plain text, each point on its own line starting with "• ".`,
  ].join('\n');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { organization_id, summary, locale } = await req.json();
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);
    if (!summary || typeof summary !== 'object') return json({ error: 'summary requis' }, 400);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Analyse IA non configurée (clé Anthropic manquante)' }, 500);

    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);

    // Only people who may see this company's accounting.
    const { data: canView, error: permError } = await userClient.rpc('can_view_org_accounting', { org_id: organization_id });
    if (permError || !canView) return json({ error: 'Accès refusé' }, 403);

    const { data: allowed, error: quotaError } = await userClient.rpc('check_and_log_ai_usage', { p_organization_id: organization_id });
    if (quotaError) return json({ error: 'Accès refusé' }, 403);
    if (!allowed) return json({ error: "Quota d'utilisations IA mensuel atteint sur votre plan." }, 403);

    const loc = locale === 'de' ? 'de' : locale === 'it' ? 'it' : 'fr';
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 900,
        system: systemPrompt(loc),
        messages: [{ role: 'user', content: `Données du bouclement (JSON) :\n${JSON.stringify(sanitize(summary))}` }],
      }),
    });
    if (!aiRes.ok) {
      console.error('Anthropic error', aiRes.status, await aiRes.text());
      return json({ error: 'Échec de l’analyse IA, réessayez dans un instant' }, 502);
    }
    const aiData = await aiRes.json();
    const review = ((aiData?.content ?? []) as Array<{ type: string; text?: string }>)
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (!review) return json({ error: 'Réponse IA vide' }, 502);
    return json({ review });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
