// The production build (web.output: "single") is a pure client-rendered SPA
// — /tarifs's actual price figures come from a Supabase query fired inside
// PricingSection's useEffect, so they only exist once JavaScript has run in
// a real browser. Any tool that just fetches the raw HTML (most AI browsing
// tools, simple bots, some SEO crawlers) sees an empty shell and no prices
// at all. This script runs after inject-seo-meta.mjs and adds a real,
// accurate <noscript> fallback with the current plans — invisible to any
// browser that runs JS (i.e. every real visitor, who gets the live,
// interactive PricingSection instead), read by everything else.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('inject-static-content: EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY not set — skipping (no noscript pricing fallback this build).');
  process.exit(0);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function formatChf(value) {
  const n = Number(value);
  if (n === 0) return 'Gratuit';
  // ".-" is the Swiss convention for a whole-franc amount only (e.g.
  // "CHF 39.-") — an amount with cents (e.g. the yearly total) is written
  // plainly instead ("CHF 374.40"), never "CHF 374.40.-".
  return n % 1 === 0 ? `CHF ${n.toLocaleString('fr-CH')}.-` : `CHF ${n.toLocaleString('fr-CH', { minimumFractionDigits: 2 })}`;
}

async function fetchPlans() {
  const url = `${SUPABASE_URL}/rest/v1/plans?is_contact_only=eq.false&price_chf_monthly=gt.0&order=price_chf_monthly.asc&select=name,price_chf_monthly,price_chf_yearly,max_members,storage_quota_mb,has_planning,has_profitability,has_payroll,has_treasury,has_bexio_integration`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase plans fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function planFeatures(plan) {
  const features = [];
  if (plan.has_planning) features.push('planning d’équipe');
  if (plan.has_profitability) features.push('rentabilité par chantier');
  if (plan.has_payroll) features.push('paie suisse');
  if (plan.has_treasury) features.push('trésorerie');
  if (plan.has_bexio_integration) features.push('intégration Bexio');
  return features;
}

function buildNoscriptBlock(plans) {
  const items = plans
    .map((p) => {
      const monthly = formatChf(p.price_chf_monthly);
      const yearly = p.price_chf_yearly ? ` (${formatChf(p.price_chf_yearly)}/an si payé annuellement)` : '';
      const users = p.max_members >= 9999 ? 'utilisateurs illimités' : `jusqu’à ${p.max_members} utilisateur${p.max_members > 1 ? 's' : ''}`;
      const storage = p.storage_quota_mb >= 1024 ? `${Math.round(p.storage_quota_mb / 1024)} Go de stockage` : `${p.storage_quota_mb} Mo de stockage`;
      const features = planFeatures(p);
      const featuresLine = features.length ? ` Inclut ${features.join(', ')}.` : '';
      return `      <li><strong>${escapeHtml(p.name)}</strong> — ${monthly}/mois${yearly}, ${users}, ${storage}.${featuresLine}</li>`;
    })
    .join('\n');

  return `
  <noscript data-cantia-fallback="tarifs">
    <section>
      <h1>Tarifs Cantia — logiciel de gestion de chantier</h1>
      <p>Cantia est un logiciel suisse de gestion pour entreprises du bâtiment (devis, factures, chantiers, équipes). Voici les tarifs actuels, sans engagement, avec 14 jours d’essai gratuit :</p>
      <ul>
${items}
      </ul>
      <p>Cette page fonctionne pleinement avec JavaScript activé — ce texte est une version de secours pour les outils qui ne l’exécutent pas.</p>
    </section>
  </noscript>`;
}

async function main() {
  const plans = await fetchPlans();
  if (!plans.length) {
    console.warn('inject-static-content: no plans returned — skipping.');
    return;
  }
  const block = buildNoscriptBlock(plans);

  const tarifsPath = path.join(distDir, 'tarifs', 'index.html');
  const html = readFileSync(tarifsPath, 'utf8');
  if (html.includes('data-cantia-fallback="tarifs"')) {
    console.warn('inject-static-content: dist/tarifs/index.html already has our fallback block — skipping to avoid double-injecting.');
    return;
  }
  // Expo's own template already ships a generic "enable JavaScript" <noscript>
  // right before the root div — insert ours right after that one instead of
  // right after <body>, so there's exactly one clear place all the no-JS
  // fallback content lives together.
  if (!html.includes('<div id="root">')) {
    throw new Error('inject-static-content: expected <div id="root"> in dist/tarifs/index.html — Expo\'s web template may have changed, update this script\'s insertion point.');
  }
  writeFileSync(tarifsPath, html.replace('<div id="root">', `${block}\n    <div id="root">`));
  console.log(`Static pricing fallback injected: dist/tarifs/index.html (${plans.length} plans).`);
}

main().catch((err) => {
  console.error('inject-static-content failed:', err);
  process.exit(1);
});
