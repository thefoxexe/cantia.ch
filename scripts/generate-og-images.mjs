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

function card(route) {
  const { locale, bare } = localeAndBareOf(route.path);
  const title = route.title.replace(BRAND_SUFFIX, '');
  const size = title.length > 70 ? 54 : title.length > 48 ? 62 : 70;
  const section = SECTIONS[locale][sectionOf(bare)];
  const eyebrow = section.toLowerCase() === title.toLowerCase() ? 'Cantia' : section;
  const el = (type, style, children) => ({ type, props: { style, children } });
  return el('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', backgroundColor: PAPER, padding: '64px 80px 56px', fontFamily: 'DM Sans' }, [
    { type: 'img', props: { src: LOGO, width: 250, height: 46, style: { width: 250, height: 46 } } },
    el('div', { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }, [
      el('div', { display: 'flex', fontSize: 22, letterSpacing: 3.5, color: COPPER, fontWeight: 600, textTransform: 'uppercase', marginBottom: 22 }, eyebrow),
      el('div', { display: 'flex', fontSize: size, lineHeight: 1.08, letterSpacing: -1.6, color: INK, fontWeight: 600, maxWidth: 1000 }, title),
    ]),
    el('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid ${LINE}`, paddingTop: 26 }, [
      el('div', { display: 'flex', fontSize: 30, color: INK, fontFamily: 'DM Serif Display', fontStyle: 'italic' }, 'cantia.ch'),
      el('div', { display: 'flex', width: 72, height: 4, backgroundColor: COPPER, borderRadius: 2 }, []),
    ]),
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
