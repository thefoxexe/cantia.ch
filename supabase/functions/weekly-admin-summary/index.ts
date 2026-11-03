import { createClient } from 'npm:@supabase/supabase-js@2';

// Résumé du lundi pour Bastien : inscriptions, essais, abonnements,
// d'où viennent les gens (réponse « Comment avez-vous connu Cantia ? » et
// visites du site), sur les 7 derniers jours comparés aux 7 d'avant.
// Invoked by pg_cron (weekly-admin-summary, Monday morning) with the shared
// dispatch secret. The recipient is the WEEKLY_REPORT_EMAIL secret, never
// written in the code.
const DISPATCH_SECRET = Deno.env.get('DISPATCH_SECRET');
const DAY = 24 * 60 * 60 * 1000;

const SOURCE_LABEL: Record<string, string> = {
  bouche_a_oreille: 'Bouche-à-oreille',
  google: 'Recherche Google',
  ia: 'ChatGPT / IA',
  reseaux_sociaux: 'Réseaux sociaux',
  fiduciaire: 'Fiduciaire',
  publicite: 'Publicité',
  autre: 'Autre',
};

const PLAN_LABEL: Record<string, string> = { solo: 'Essentiel', equipe: 'Équipe', pro: 'Entreprise' };

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function trafficSource(referrer: string | null): string {
  const r = (referrer ?? '').toLowerCase();
  if (!r) return 'Direct / inconnu';
  if (/^https?:\/\/(www\.)?google\./.test(r)) return 'Google (recherche)';
  if (/bing\.|duckduckgo|ecosia|qwant|yahoo/.test(r)) return 'Autres moteurs';
  if (r.includes('instagram')) return 'Instagram';
  if (r.includes('linkedin') || r.includes('lnkd')) return 'LinkedIn';
  if (r.includes('facebook') || r.includes('fb.')) return 'Facebook';
  if (/chatgpt|openai|perplexity|claude|gemini/.test(r)) return 'ChatGPT / IA';
  if (r.includes('cantia.ch')) return 'cantia.ch';
  return 'Autres sites';
}

function delta(now: number, before: number): string {
  if (now === before) return '=';
  return now > before ? `+${now - before}` : `−${before - now}`;
}

Deno.serve(async (req: Request) => {
  if (!DISPATCH_SECRET || req.headers.get('x-dispatch-secret') !== DISPATCH_SECRET) {
    return json({ error: 'unauthorized' }, 401);
  }
  try {
    const to = Deno.env.get('WEEKLY_REPORT_EMAIL');
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!to || !apiKey) return json({ error: 'WEEKLY_REPORT_EMAIL ou RESEND_API_KEY manquant' }, 500);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const now = Date.now();
    const weekAgo = new Date(now - 7 * DAY).toISOString();
    const twoWeeksAgo = new Date(now - 14 * DAY).toISOString();

    const [{ data: orgs }, { data: events }, { data: subs }, { data: plans }, { data: views }] = await Promise.all([
      admin.from('organizations').select('id, name, created_at, plan_id, subscription_status, acquisition_source, acquisition_detail').gte('created_at', twoWeeksAgo),
      admin.from('organization_subscription_events').select('event_type, created_at').gte('created_at', twoWeeksAgo),
      admin.from('organizations').select('plan_id, subscription_status').not('stripe_subscription_id', 'is', null),
      admin.from('plans').select('id, price_chf_monthly'),
      admin.from('site_pageviews').select('visitor_id, referrer, created_at').gte('created_at', weekAgo).limit(50000),
    ]);

    const thisWeek = (orgs ?? []).filter((o) => o.created_at >= weekAgo);
    const lastWeek = (orgs ?? []).filter((o) => o.created_at < weekAgo);
    const count = (type: string, from: string, until?: string) =>
      (events ?? []).filter((e) => e.event_type === type && e.created_at >= from && (!until || e.created_at < until)).length;

    const price = new Map((plans ?? []).map((p) => [p.id, Number(p.price_chf_monthly ?? 0)]));
    const active = (subs ?? []).filter((s) => s.subscription_status === 'active');
    const trialing = (subs ?? []).filter((s) => s.subscription_status === 'trialing');
    const mrr = active.reduce((sum, s) => sum + (price.get(s.plan_id) ?? 0), 0);

    const answers = new Map<string, number>();
    for (const o of thisWeek) {
      const k = o.acquisition_source ? SOURCE_LABEL[o.acquisition_source] ?? o.acquisition_source : 'Pas de réponse';
      answers.set(k, (answers.get(k) ?? 0) + 1);
    }

    const visitors = new Map<string, Set<string>>();
    for (const v of views ?? []) {
      const k = trafficSource(v.referrer);
      if (!visitors.has(k)) visitors.set(k, new Set());
      visitors.get(k)!.add(String(v.visitor_id));
    }
    const traffic = [...visitors.entries()].map(([k, set]) => [k, set.size] as const).sort((a, b) => b[1] - a[1]);

    const rows = (pairs: (readonly [string, string | number])[]) =>
      pairs
        .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#555;">${escapeHtml(String(k))}</td><td style="padding:4px 0;font-weight:600;text-align:right;">${escapeHtml(String(v))}</td></tr>`)
        .join('');
    const table = (inner: string) => `<table style="border-collapse:collapse;font-size:14px;margin:0 0 18px;">${inner}</table>`;
    const h = (t: string) => `<p style="margin:18px 0 6px;font-weight:700;">${escapeHtml(t)}</p>`;

    const kpis: [string, string][] = [
      ['Nouvelles inscriptions', `${thisWeek.length} (${delta(thisWeek.length, lastWeek.length)} vs semaine d’avant)`],
      ['Essais démarrés', String(count('trial_started', weekAgo))],
      ['Paiements activés', String(count('activated', weekAgo))],
      ['Résiliations', String(count('canceled', weekAgo))],
    ];
    const stock: [string, string][] = [
      ['Abonnés payants', String(active.length)],
      ['En essai', String(trialing.length)],
      ['Revenu mensuel estimé', `CHF ${mrr.toFixed(0)}.– (prix mensuels, hors remises annuelles)`],
    ];
    const newOrgs = thisWeek
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((o) => {
        const status = o.subscription_status === 'active' ? `abonné ${PLAN_LABEL[o.plan_id] ?? o.plan_id ?? ''}` : o.subscription_status === 'trialing' ? `en essai ${PLAN_LABEL[o.plan_id] ?? ''}` : 'sans formule';
        const src = o.acquisition_source ? SOURCE_LABEL[o.acquisition_source] ?? o.acquisition_source : 'pas de réponse';
        const detail = o.acquisition_detail ? ` (${o.acquisition_detail})` : '';
        return `<li style="margin:0 0 4px;">${escapeHtml(o.name ?? 'Sans nom')} — ${escapeHtml(status)} — ${escapeHtml(src + detail)}</li>`;
      })
      .join('');

    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#222;max-width:600px;">
<p style="margin:0 0 14px;">Salut Bastien, voici ta semaine Cantia (7 derniers jours).</p>
${h('Cette semaine')}${table(rows(kpis))}
${h('En ce moment')}${table(rows(stock))}
${h('Comment ils ont connu Cantia (inscriptions de la semaine)')}${answers.size ? table(rows([...answers.entries()].sort((a, b) => b[1] - a[1]))) : '<p style="margin:0 0 18px;color:#555;">Aucune inscription.</p>'}
${h('Visiteurs du site par provenance')}${traffic.length ? table(rows(traffic)) : '<p style="margin:0 0 18px;color:#555;">Aucune visite enregistrée.</p>'}
${newOrgs ? `${h('Les nouvelles entreprises')}<ul style="margin:0 0 18px;padding-left:18px;font-size:14px;">${newOrgs}</ul>` : ''}
<p style="margin:18px 0 0;color:#777;font-size:12px;">« Direct / inconnu » compte aussi des robots : à lire avec prudence.</p>
</div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Cantia <info@cantia.ch>',
        to: [to],
        subject: `Ta semaine Cantia : ${thisWeek.length} inscription${thisWeek.length > 1 ? 's' : ''}, ${count('activated', weekAgo)} paiement${count('activated', weekAgo) > 1 ? 's' : ''}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error('Resend error', res.status, await res.text());
      return json({ error: 'Envoi refusé' }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
