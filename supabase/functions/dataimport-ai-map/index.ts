import { createClient } from 'npm:@supabase/supabase-js@2';

// Figures out which CSV column(s) feed each Cantia import field — the
// naive keyword-matching guess (lib/api/dataImport.ts's old guessMapping)
// falls over the moment a real export splits a name across prenom_contact/
// nom_contact columns, or only fills raison_sociale for entreprise rows.
// This sends just the headers + a few sample rows (never the whole file)
// to Claude and gets back a small declarative mapping — evaluated
// deterministically in the client for every row, so the AI is consulted
// once per import, not once per row.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_MODEL = 'claude-sonnet-5';

type ImportKind = 'clients' | 'chantiers' | 'devis' | 'factures' | 'expenses';

const FIELD_SPECS: Record<ImportKind, { key: string; description: string }[]> = {
  clients: [
    {
      key: 'name',
      description:
        "Nom complet à afficher pour ce client. Si une colonne de raison sociale / nom d'entreprise existe et est non vide sur une ligne donnée, privilégie-la en premier ; sinon combine prénom + nom (dans cet ordre, séparés par un espace).",
    },
    { key: 'email', description: 'Adresse e-mail du client.' },
    { key: 'phone', description: 'Numéro de téléphone du client.' },
    {
      key: 'address',
      description:
        "Adresse postale complète sur une seule ligne lisible. Si rue, NPA (code postal) et localité sont dans des colonnes séparées, combine-les proprement, par exemple « {rue}, {npa} {localité} ».",
    },
  ],
  chantiers: [
    { key: 'name', description: 'Nom ou intitulé du chantier / projet.' },
    { key: 'clientName', description: 'Nom du client associé à ce chantier.' },
    { key: 'address', description: 'Adresse du chantier, combinée si rue/NPA/localité sont séparés.' },
  ],
  devis: [
    { key: 'clientName', description: 'Nom du client destinataire du devis (personne ou raison sociale).' },
    { key: 'amount', description: 'Montant total du devis, de préférence hors TVA.' },
    { key: 'number', description: "Numéro du devis dans l'ancien logiciel, si présent." },
    { key: 'date', description: "Date de création ou d'émission du devis." },
    { key: 'status', description: 'Statut du devis (brouillon, envoyé, accepté, refusé…).' },
  ],
  factures: [
    { key: 'clientName', description: 'Nom du client destinataire de la facture (personne ou raison sociale).' },
    { key: 'amount', description: 'Montant total de la facture, de préférence hors TVA.' },
    { key: 'number', description: "Numéro de la facture dans l'ancien logiciel, si présent." },
    { key: 'date', description: "Date de création ou d'émission de la facture." },
    { key: 'status', description: 'Statut de la facture (brouillon, envoyée, payée, annulée…).' },
  ],
  expenses: [
    { key: 'label', description: 'Libellé ou description de la dépense.' },
    { key: 'amount', description: 'Montant de la dépense.' },
    { key: 'category', description: 'Catégorie de la dépense, si présente.' },
    { key: 'date', description: 'Date de la dépense.' },
  ],
};

function buildSystemPrompt(kind: ImportKind): string {
  const fields = FIELD_SPECS[kind];
  const fieldLines = fields.map((f) => `- "${f.key}": ${f.description}`).join('\n');
  return `Tu configures un import de données CSV vers un champ Cantia (logiciel suisse de gestion pour entreprises du bâtiment).
On te donne les en-têtes de colonnes d'un fichier CSV (index 0-based) et quelques lignes d'exemple. Détermine, pour chacun des champs cibles suivants, quelle(s) colonne(s) source utiliser :
${fieldLines}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans balises markdown, de cette forme exacte :
{
  "mapping": {
    "<clé de champ>": [
      { "type": "column", "index": <entier> },
      { "type": "template", "indices": [<entier>, ...], "template": "<gabarit>" }
    ]
  }
}

Règles :
- Chaque champ cible a une LISTE ORDONNÉE de sources essayées dans l'ordre ; la première source non vide sur une ligne donnée est utilisée. Utilise ça pour gérer les cas comme "raison sociale sinon prénom+nom".
- "type": "column" pointe directement vers une colonne (par son index).
- "type": "template" combine plusieurs colonnes : "indices" liste les colonnes utilisées (dans l'ordre), et "template" est un gabarit où {0} représente la première colonne de "indices", {1} la deuxième, etc. Exemple : indices [2,3], template "{0} {1}" pour prénom+nom ; indices [5,6,7], template "{0}, {1} {2}" pour rue, NPA, localité.
- N'invente aucun index de colonne : n'utilise que des index présents dans la liste des en-têtes fournie.
- Si aucune colonne pertinente n'existe pour un champ, mets une liste vide [].
- Un champ non explicitement obligatoire (amount/label/name le sont) peut aussi être une liste vide si rien ne correspond.
- Ne combine jamais deux colonnes sans rapport (ex : ne combine pas un e-mail avec une adresse).`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { kind, headers, sampleRows, organization_id } = await req.json();
    if (!kind || !FIELD_SPECS[kind as ImportKind]) return json({ error: 'kind invalide' }, 400);
    if (!Array.isArray(headers) || headers.length === 0) return json({ error: 'headers requis' }, 400);
    if (!organization_id) return json({ error: 'organization_id requis' }, 400);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Suggestion IA non configurée (clé Anthropic manquante)' }, 500);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // Bound to the caller's JWT: RLS enforces the caller belongs to the org
    // before spending any quota or calling Anthropic.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: allowed, error: quotaError } = await userClient.rpc('check_and_log_ai_usage', {
      p_organization_id: organization_id,
    });
    if (quotaError) return json({ error: 'Accès refusé' }, 403);
    if (!allowed) return json({ error: "Quota d'utilisations IA mensuel atteint sur votre plan. Passez à un plan supérieur pour continuer." }, 403);

    const safeHeaders = (headers as unknown[]).slice(0, 60).map((h) => String(h ?? '').slice(0, 120));
    const safeRows = (Array.isArray(sampleRows) ? sampleRows : [])
      .slice(0, 5)
      .map((row: unknown) => (Array.isArray(row) ? row.slice(0, 60).map((c) => String(c ?? '').slice(0, 200)) : []));

    const userPrompt = [
      `En-têtes (index: valeur) :\n${safeHeaders.map((h, i) => `${i}: ${h || '(vide)'}`).join('\n')}`,
      safeRows.length
        ? `\nLignes d'exemple :\n${safeRows.map((r, i) => `Ligne ${i + 1}: ${JSON.stringify(r)}`).join('\n')}`
        : '',
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
        max_tokens: 1200,
        system: buildSystemPrompt(kind as ImportKind),
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('Anthropic error', aiRes.status, errText);
      return json({ error: 'Échec de la suggestion IA, réessayez dans un instant' }, 502);
    }

    const aiData = await aiRes.json();
    const raw = ((aiData?.content ?? []) as Array<{ type: string; text?: string }>)
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
      .trim();

    const jsonText = raw
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('AI mapping response was not valid JSON:', raw);
      return json({ error: 'Réponse IA invalide' }, 502);
    }

    const validated = validateMapping(parsed, kind as ImportKind, safeHeaders.length);
    if (!validated) return json({ error: 'Réponse IA invalide' }, 502);

    return json({ mapping: validated });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

// Structural validation only — this is used for plain string substitution
// client-side (never eval'd, never rendered as HTML), but a malformed or
// out-of-range response must degrade to "field unmapped" rather than crash
// the import screen.
function validateMapping(input: unknown, kind: ImportKind, headerCount: number): Record<string, unknown[]> | null {
  if (!input || typeof input !== 'object') return null;
  const mapping = (input as Record<string, unknown>).mapping;
  if (!mapping || typeof mapping !== 'object') return null;

  const allowedKeys = new Set(FIELD_SPECS[kind].map((f) => f.key));
  const result: Record<string, unknown[]> = {};

  for (const [key, value] of Object.entries(mapping as Record<string, unknown>)) {
    if (!allowedKeys.has(key) || !Array.isArray(value)) continue;
    const sources: unknown[] = [];
    for (const item of value) {
      if (!item || typeof item !== 'object') continue;
      const type = (item as Record<string, unknown>).type;
      if (type === 'column') {
        const index = (item as Record<string, unknown>).index;
        if (typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < headerCount) {
          sources.push({ type: 'column', index });
        }
      } else if (type === 'template') {
        const indices = (item as Record<string, unknown>).indices;
        const template = (item as Record<string, unknown>).template;
        if (
          Array.isArray(indices) &&
          indices.length > 0 &&
          indices.length <= 8 &&
          indices.every((i) => typeof i === 'number' && Number.isInteger(i) && i >= 0 && i < headerCount) &&
          typeof template === 'string' &&
          template.length > 0 &&
          template.length <= 200
        ) {
          sources.push({ type: 'template', indices, template });
        }
      }
    }
    result[key] = sources;
  }

  return result;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
