import { createClient } from 'npm:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk';

// Super Admin › E-mails: Claude writes the campaign e-mail (subject,
// preheader, HTML in Cantia's colours) from a short brief, revises it on
// request, and translates it to German or Italian. Two modes, one call each,
// so a long generation never runs into the function's time limit:
//   generate  { brief, tone, kind, audience, ctaUrl, ctaLabel, previousHtml?, revision? }
//   translate { lang, subject, preheader, html }
// Platform admins only. Product facts come from cantia.ch/llms.txt so the
// e-mail only claims what the site says.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL = 'claude-opus-5-5';
const LOGO = 'https://krijilwxhdlzflvnvrtl.supabase.co/storage/v1/object/public/brand/email/logo-on-dark-v1.png';

const BRAND = `Cantia est un logiciel suisse de gestion pour les PME (bâtiment d'abord, mais aussi services) : devis, factures QR, chantiers, rapports, planning, soumissions, salaires, compta. Ton : direct, concret, chaleureux, jamais « marketing américain ». On vouvoie. Pas d'emoji dans le sujet, au plus un ou deux dans le corps si le ton s'y prête.

Charte graphique (à respecter exactement) :
- Fond extérieur #F7F1E6 (crème), carte de contenu #FFFFFF, bordures #E6D8C2, rayon 16px.
- Texte #231A12, texte secondaire #6E6153.
- Couleur principale (boutons, liens, accents) #A95C30, foncée #7C3B21, fond doux #F5DECB, accent #D97B41.
- Bandeau d'en-tête sombre #16120E avec le logo : <img src="${LOGO}" width="170" height="32" alt="Cantia" style="display:block;border:0;height:32px;width:170px;">
- Police : -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif. Titres en gras 800, interlignage généreux.
- Boutons : fond #A95C30, texte blanc, gras, rayon 10px, padding 14px 24px, en <a> dans une <table> (bulletproof button).

Règles techniques d'e-mail (Gmail, Outlook, Apple Mail, téléphone) :
- Document HTML complet, mise en page en <table role="presentation">, largeur 600px max centrée, 100% sur téléphone.
- Tout le CSS en attributs style="" inline ; un seul bloc <style> autorisé pour une media query mobile.
- Pas de JavaScript, pas de formulaire, pas de CSS externe, pas d'image en data:, pas de police web obligatoire, pas de background-image.
- Préheader : un <div> caché (display:none;max-height:0;overflow:hidden) tout en haut du <body> avec le texte du préheader.
- Pied de page : petit texte #6E6153 « Vous recevez cet e-mail en tant que client de Cantia. » + lien « Gérer mes e-mails » vers https://app.cantia.ch/compte/notifications + lien cantia.ch. Les réponses arrivent à info@cantia.ch.

Personnalisation (remplacée à l'envoi pour chaque destinataire) : {{prenom}}, {{nom}}, {{entreprise}}, {{plan}}. Toujours avec une valeur de secours après une barre verticale quand l'info peut manquer, par exemple « Bonjour {{prenom|à vous}}, » ou « chez {{entreprise|vous}} ». N'invente aucune autre variable.

Vérité : n'utilise que les faits du brief et de la fiche produit ci-dessous. N'invente aucun chiffre, témoignage, client, prix, réduction, promotion, date ou fonction. Pas de pourcentage de réduction sauf s'il est dans le brief. Si une info manque, reste général plutôt que d'inventer.`;

const GENERATE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['subject', 'preheader', 'html', 'notes'],
  properties: {
    subject: { type: 'string', description: 'Objet, 35 à 60 caractères.' },
    preheader: { type: 'string', description: 'Texte d’aperçu, 50 à 100 caractères, complète l’objet.' },
    html: { type: 'string', description: 'Document HTML complet de l’e-mail.' },
    notes: { type: 'string', description: 'Une ou deux phrases pour l’admin : choix faits, points à vérifier.' },
  },
};

const TRANSLATE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['subject', 'preheader', 'html'],
  properties: {
    subject: { type: 'string' },
    preheader: { type: 'string' },
    html: { type: 'string' },
  },
};

const TONES: Record<string, string> = {
  chaleureux: 'chaleureux et proche, comme un artisan qui parle à un autre artisan',
  pro: 'professionnel et sobre',
  direct: 'très direct et court, droit au but',
  enthousiaste: 'enthousiaste mais crédible, sans superlatifs creux',
};

const KINDS: Record<string, string> = {
  nouveaute: 'annonce d’une nouveauté ou d’une fonction',
  newsletter: 'newsletter avec 2 ou 3 sujets courts',
  relance: 'relance d’un client inactif ou d’un essai non converti, pour l’aider à reprendre',
  conseil: 'conseil pratique utile au métier, Cantia en appui discret',
  annonce: 'annonce importante (changement, maintenance, tarifs)',
  bienvenue: 'message de bienvenue et premiers pas',
};

const LANG_NAMES: Record<string, string> = { de: 'allemand de Suisse (Hochdeutsch, ss au lieu de ß, vouvoiement « Sie »)', it: 'italien de Suisse (« voi » ou forme de politesse « Lei » de façon cohérente)' };

let factsCache: { text: string; at: number } | null = null;
async function productFacts(): Promise<string> {
  if (factsCache && Date.now() - factsCache.at < 60 * 60 * 1000) return factsCache.text;
  try {
    const res = await fetch('https://cantia.ch/llms.txt', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const text = (await res.text()).slice(0, 20000);
      factsCache = { text, at: Date.now() };
      return text;
    }
  } catch (err) {
    console.error('llms.txt fetch failed', err);
  }
  return '(Fiche produit indisponible : reste factuel et général.)';
}

function clip(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Non authentifié' }, 401);
    const { data: isAdmin } = await userClient.rpc('is_platform_admin');
    if (!isAdmin) return json({ error: 'Accès refusé : réservé aux administrateurs de la plateforme.' }, 403);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Clé Claude (ANTHROPIC_API_KEY) non configurée.' }, 500);
    const client = new Anthropic({ apiKey });

    const body = await req.json();
    const mode = body.mode === 'translate' ? 'translate' : 'generate';
    const facts = await productFacts();
    const system = `${BRAND}\n\nFiche produit officielle (cantia.ch/llms.txt) :\n${facts}`;

    let userPrompt: string;
    let schema: Record<string, unknown>;
    if (mode === 'translate') {
      const lang = body.lang === 'it' ? 'it' : body.lang === 'de' ? 'de' : null;
      if (!lang) return json({ error: 'Langue inconnue.' }, 400);
      const html = clip(body.html, 120000);
      if (!html) return json({ error: 'Rien à traduire.' }, 400);
      schema = TRANSLATE_SCHEMA;
      userPrompt = `Traduis cet e-mail en ${LANG_NAMES[lang]}. Garde exactement la même structure HTML, les mêmes styles, liens et images ; ne traduis que les textes visibles, le texte alternatif et le préheader caché. Adapte naturellement (pas mot à mot). Noms des plans : Essentiel = ${lang === 'de' ? 'Basis' : 'Essenziale'}, Équipe = Team, Entreprise = Entreprise. Garde les variables {{prenom}}, {{nom}}, {{entreprise}}, {{plan}} telles quelles, mais traduis leur valeur de secours après la barre. Le lien « Gérer mes e-mails » devient ${lang === 'de' ? '« E-Mails verwalten »' : '« Gestisci le e-mail »'}.

Objet : ${clip(body.subject, 300)}
Préheader : ${clip(body.preheader, 300)}

HTML :
${html}`;
    } else {
      const brief = clip(body.brief, 4000);
      if (!brief && !clip(body.revision, 2000)) return json({ error: 'Décrivez ce que doit dire l’e-mail.' }, 400);
      schema = GENERATE_SCHEMA;
      const previous = clip(body.previousHtml, 120000);
      const lines = [
        `Type d’e-mail : ${KINDS[body.kind] ?? KINDS.nouveaute}.`,
        `Ton : ${TONES[body.tone] ?? TONES.chaleureux}.`,
        body.audience ? `Destinataires : ${clip(body.audience, 500)}. Adresse-toi à eux avec leurs mots et leurs situations de travail.` : 'Destinataires : clients de Cantia.',
        clip(body.ctaUrl, 500)
          ? `Bouton principal : « ${clip(body.ctaLabel, 80) || 'Ouvrir Cantia'} » vers ${clip(body.ctaUrl, 500)}.`
          : 'Bouton principal vers https://app.cantia.ch avec un libellé adapté.',
        'Langue : français de Suisse.',
        `Brief : ${brief}`,
      ];
      userPrompt = previous
        ? `Voici l’e-mail actuel. Modifie-le selon la demande, garde tout le reste.\n\nDemande : ${clip(body.revision, 2000) || 'améliore-le'}\n\nContexte d’origine :\n${lines.join('\n')}\n\nObjet actuel : ${clip(body.subject, 300)}\nPréheader actuel : ${clip(body.preheader, 300)}\n\nHTML actuel :\n${previous}`
        : `Écris l’e-mail.\n${lines.join('\n')}\n\nCourt et lisible sur téléphone : un titre fort, 2 à 4 paragraphes brefs ou une liste, un bouton principal, une signature « L’équipe Cantia ».`;
    }

    // Streaming keeps a long HTML generation clear of HTTP timeouts;
    // fallbacks re-run a declined request on another model server-side.
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 32000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      cache_control: { type: 'ephemeral' },
      output_config: { effort: mode === 'translate' ? 'low' : 'medium', format: { type: 'json_schema', schema } },
      system,
      messages: [{ role: 'user', content: userPrompt }],
    } as any);
    const message: any = await stream.finalMessage();

    if (message.stop_reason === 'refusal') return json({ error: 'Claude a refusé cette demande. Reformulez le brief.' }, 422);
    if (message.stop_reason === 'max_tokens') return json({ error: 'E-mail trop long : raccourcissez le brief.' }, 422);
    const text = (message.content ?? [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');
    let out: any;
    try {
      out = JSON.parse(text);
    } catch {
      return json({ error: 'Réponse illisible, réessayez.' }, 502);
    }
    if (!out?.html || !out?.subject) return json({ error: 'Réponse incomplète, réessayez.' }, 502);
    return json({
      subject: String(out.subject),
      preheader: String(out.preheader ?? ''),
      html: String(out.html),
      notes: out.notes ? String(out.notes) : null,
      usage: message.usage ? { input: message.usage.input_tokens, output: message.usage.output_tokens } : null,
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'Claude est saturé, réessayez dans une minute.' }, 429);
    if (err instanceof Anthropic.AuthenticationError) return json({ error: 'Clé Claude invalide.' }, 500);
    if (err instanceof Anthropic.APIError) {
      console.error('Anthropic error', err.status, err.message);
      return json({ error: `Erreur Claude (${err.status ?? '?'}) : ${err.message}` }, 502);
    }
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
