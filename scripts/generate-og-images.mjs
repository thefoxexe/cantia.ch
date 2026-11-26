// One share image per public page (og:image / twitter:image), written to
// dist/og/<route>.png: the Cantia logo, the section of the site, the page
// title and the address, on the site's paper colour. Type only, in the
// site's own fonts (DM Sans, DM Serif Display, static copies in
// scripts/og/fonts/, OFL), so every link shared on LinkedIn, WhatsApp or
// Slack shows what the page is about instead of the same generic card.
//
// Run after inject-seo-meta.mjs (it points each page's og:image at
// ogImageUrl(path), scripts/seo-routes.mjs).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { ROUTES, isNoindex, localeAndBareOf, ogImageFile } from './seo-routes.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const font = (f) => readFileSync(path.join(root, 'scripts/og/fonts', f));
const FONTS = [
  { name: 'DM Sans', data: font('dm-sans-400.ttf'), weight: 400, style: 'normal' },
  { name: 'DM Sans', data: font('dm-sans-600.ttf'), weight: 600, style: 'normal' },
  { name: 'DM Serif Display', data: font('dm-serif-display-italic.ttf'), weight: 400, style: 'italic' },
];
const LOGO = `data:image/png;base64,${readFileSync(path.join(root, 'assets/brand/logo.png')).toString('base64')}`;
const LOGO_DARK = `data:image/png;base64,${readFileSync(path.join(root, 'assets/brand/logo-on-dark.png')).toString('base64')}`;

const INK = '#252921';
const MUTED = '#6f7366';
const COPPER = '#a65d36';
const PAPER = '#f6f4ef';
const LINE = '#e2dfd4';

const SECTIONS = {
  fr: { blog: 'Blog', aide: 'Centre d’aide', metiers: 'Métiers', solutions: 'Fonctionnalités', outils: 'Outil gratuit', tarifs: 'Tarifs', home: 'La suite de gestion suisse', other: 'Cantia' },
  de: { blog: 'Blog', aide: 'Hilfe-Center', metiers: 'Branchen', solutions: 'Funktionen', outils: 'Gratis-Tool', tarifs: 'Preise', home: 'Die Schweizer Verwaltungssoftware', other: 'Cantia' },
  it: { blog: 'Blog', aide: 'Centro assistenza', metiers: 'Mestieri', solutions: 'Funzionalità', outils: 'Strumento gratuito', tarifs: 'Prezzi', home: 'Il software gestionale svizzero', other: 'Cantia' },
};
const TRADES = new Set(['charpentier', 'macon', 'electricien', 'plombier', 'peintre', 'menuisier', 'entreprise-generale', 'paysagiste', 'couvreur', 'chauffagiste', 'carreleur', 'platrier', 'genie-civil', 'terrassier', 'entreprise-renovation', 'serrurier', 'ferblantier', 'facadier', 'etancheur', 'construction-bois', 'vitrier', 'parqueteur', 'echafaudeur', 'demolition']);

function sectionOf(bare) {
  const first = bare.split('/')[0];
  if (bare === '') return 'home';
  if (first === 'blog' || first === 'comparatifs') return 'blog';
  if (first === 'aide') return 'aide';
  if (first === 'metiers' || TRADES.has(first)) return 'metiers';
  if (first === 'solutions' || first === 'fonctionnalites') return 'solutions';
  if (first === 'outils' || first === 'calculateur-salaire') return 'outils';
  if (first === 'tarifs' || first === 'plans') return 'tarifs';
  return 'other';
}

const BRAND_SUFFIX = / \| (Cantia Hilfe-Center|Centro assistenza Cantia|Centre d'aide Cantia|Cantia)$/;

// November 2026: the logo big and centred. Snapchat, WhatsApp and iMessage
// often crop the preview to a square in the middle, so everything that
// matters sits in the central 630 × 630: the logo, then one short line.
const el = (type, style, children) => ({ type, props: { style, children } });
const img = (src, w, h) => ({ type: 'img', props: { src, width: w, height: h, style: { width: w, height: h } } });

const BF = {
  fr: { pct: '-54 %', life: 'à vie.', line: 'Black Friday · jusqu’à lundi minuit' },
  de: { pct: '-54 %', life: 'lebenslang.', line: 'Black Friday · bis Montag Mitternacht' },
  it: { pct: '-54 %', life: 'a vita.', line: 'Black Friday · fino a lunedì mezzanotte' },
};

// The Black Friday pages: night ground, flame orange.
function blackFridayCard(locale) {
  const c = BF[locale];
  return el('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0c09', backgroundImage: 'radial-gradient(circle at 50% 55%, rgba(255,91,31,0.32), rgba(255,91,31,0) 60%)', fontFamily: 'DM Sans' }, [
    img(LOGO_DARK, 420, 78),
    el('div', { display: 'flex', alignItems: 'baseline', marginTop: 34 }, [
      el('div', { display: 'flex', fontSize: 190, lineHeight: 1, letterSpacing: -8, color: '#ff5b1f', fontWeight: 600 }, c.pct),
      el('div', { display: 'flex', fontSize: 74, color: '#f4f3e9', fontFamily: 'DM Serif Display', fontStyle: 'italic', marginLeft: 22 }, c.life),
    ]),
    el('div', { display: 'flex', marginTop: 26, fontSize: 26, letterSpacing: 4, color: '#f4f3e9', fontWeight: 600, textTransform: 'uppercase', backgroundColor: '#ff5b1f', padding: '12px 28px', borderRadius: 999 }, c.line),
  ]);
}

function card(route) {
  const { locale, bare } = localeAndBareOf(route.path);
  if (bare === 'black-friday') return blackFridayCard(locale);
  const title = route.title.replace(BRAND_SUFFIX, '');
  const size = title.length > 60 ? 34 : title.length > 40 ? 40 : 46;
  return el('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: PAPER, fontFamily: 'DM Sans', borderBottom: `14px solid ${COPPER}` }, [
    img(LOGO, 620, 115),
    el('div', { display: 'flex', width: 90, height: 4, backgroundColor: COPPER, borderRadius: 2, marginTop: 46, marginBottom: 34 }, []),
    el('div', { display: 'flex', fontSize: size, lineHeight: 1.15, letterSpacing: -0.8, color: INK, fontWeight: 600, maxWidth: 960, textAlign: 'center', justifyContent: 'center' }, title),
  ]);
}

async function main() {
  let n = 0;
  for (const route of ROUTES) {
    if (isNoindex(route.path)) continue;
    const svg = await satori(card(route), { width: 1200, height: 630, fonts: FONTS });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    const target = path.join(root, 'dist', ogImageFile(route.path));
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, png);
    n++;
  }
  console.log(`Share images written: ${n} in dist/og/.`);
}

main().catch((err) => {
  console.error('generate-og-images failed:', err);
  process.exit(1);
});
