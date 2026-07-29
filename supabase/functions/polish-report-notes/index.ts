import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';

const SYSTEM_PROMPT = `Tu rédiges des rapports de chantier professionnels pour des artisans et entreprises du bâtiment en Suisse romande.
On te donne des notes brutes prises sur le terrain (souvent dictées à l'oral, informelles, avec des fautes) et parfois les légendes des photos jointes.
Réécris-les en un texte de rapport clair, professionnel et bien structuré en français, de façon neutre.
Règles strictes :
- N'invente jamais de fait, chiffre, date ou observation qui n'est pas dans les notes fournies.
- Corrige l'orthographe et la grammaire, reformule en phrases complètes et professionnelles.
- Organise le texte en paragraphes courts et logiques (par exemple par étape ou par zone du chantier si pertinent), sans titres markdown ni puces ni astérisques.
- Reste concis : privilégie la clarté à la longueur.
- Réponds uniquement avec le texte du rapport, sans préambule ni commentaire.`;

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

    const { data: photos } = await admin
      .from('report_photos')
      .select('caption')
      .eq('report_id', report_id)
      .order('sort_order', { ascending: true });

    const captionLines = (photos ?? []).map((p) => p.caption?.trim()).filter(Boolean) as string[];

    const project = report.projects as { name?: string; client_name?: string; address?: string } | null;
    const contextLines = [
      project?.name ? `Chantier : ${project.name}` : null,
      project?.client_name ? `Client : ${project.client_name}` : null,
      project?.address ? `Adresse : ${project.address}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const userPrompt = [
      contextLines ? `Contexte du chantier :\n${contextLines}\n` : '',
      'Notes brutes prises sur le terrain :',
      report.notes,
      captionLines.length ? `\nLégendes des photos jointes :\n${captionLines.map((c) => `- ${c}`).join('\n')}` : '',
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
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('Anthropic error', aiRes.status, errText);
      return json({ error: 'Échec de la rédaction IA, réessayez dans un instant' }, 502);
    }

    const aiData = await aiRes.json();
    const polished = ((aiData?.content ?? []) as Array<{ type: string; text?: string }>)
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!polished) return json({ error: 'La réponse IA était vide' }, 502);

    return json({ notes: polished });
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
