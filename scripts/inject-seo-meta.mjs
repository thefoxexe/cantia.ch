// web.output is "single" (a plain client-rendered SPA export), so Expo
// Router's app/+html.tsx convention — the normal place for per-project
// <head> customization — is silently ignored; it only applies under
// web.output "static". Switching the whole app to "static" pre-rendering
// just to get SEO tags is a much bigger, riskier change than this file
// warrants, so instead this runs once after `expo export` and patches the
// meta tags straight into the already-built dist/index.html. Static text
// injection like this is also what actually matters here: social-media
// link-preview crawlers (Facebook/Twitter/LinkedIn/WhatsApp/Slack) read the
// raw HTML and do not execute JavaScript, so client-side-injected <meta>
// tags would never be seen by them — only build-time-injected ones work.
//
// `single` mode means `expo export` only ever produces one dist/index.html
// for every route — every public page (solutions/*, /telechargement, legal
// pages) was shipping that exact same file, same <title>, same
// <link rel="canonical" href="https://cantia.ch/">. That canonical tag is
// the actual bug: it told search engines every one of those pages is a
// duplicate of the homepage, which is a direct signal to drop them from the
// index rather than rank them. The asset paths in the exported HTML are
// absolute (`/_expo/...`, verified against a real `expo export` output), so
// a copy of index.html works unmodified from any nested directory — Expo
// Router hydrates client-side off `window.location.pathname` regardless of
// which physical file served it. So: clone index.html once per public
// route below and patch each clone's own title/description/canonical/JSON-LD.
// Netlify (see netlify.toml) serves a matching static file before falling
// back to its SPA catch-all redirect, so dist/solutions/devis/index.html
// answers GET /solutions/devis directly.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const distIndex = path.join(distDir, 'index.html');

const SITE = 'https://cantia.ch';
const OG_IMAGE = `${SITE}/og-image.jpg`;

const HOME = {
  path: '',
  title: 'Cantia — Gestion de chantier pour artisans et entreprises du bâtiment (Suisse)',
  description:
    "Rapports de chantier, devis, photos géolocalisées, documents et levés cadastraux suisses — tout au même endroit. Le logiciel de gestion de chantier pensé pour le bâtiment en Suisse.",
};

// One entry per public marketing route — copied from each page's own
// title/subtitle (or lead paragraph) so the tags actually match what a
// visitor (and a crawler) finds on that page.
const ROUTES = [
  HOME,
  {
    path: 'solutions/devis',
    title: 'Devis en ligne pour artisans suisses | Cantia',
    description:
      "Dictez vos lignes de devis à voix haute sur le chantier. Cantia les transforme en positions chiffrées avec vos prix habituels, PDF prêt à envoyer.",
  },
  {
    path: 'solutions/facturation',
    title: 'Facturation & QR-facture suisse | Cantia',
    description:
      "Chaque facture Cantia intègre automatiquement le QR-bill suisse conforme — IBAN, référence structurée et montant déjà encodés, prêt à scanner.",
  },
  {
    path: 'solutions/rapports-chantier',
    title: 'Rapports de chantier | Cantia',
    description:
      "Notes vocales, photos géolocalisées et messages d'équipe : Cantia en tire un rapport rédigé et structuré, prêt à envoyer.",
  },
  {
    path: 'solutions/dictee-vocale',
    title: 'Dictée vocale pour le bâtiment | Cantia',
    description:
      "Devis, rapports, messages d'équipe : un bouton dicter remplace la saisie au clavier, partout dans Cantia.",
  },
  {
    path: 'solutions/planning',
    title: "Planning d'équipe chantier | Cantia",
    description:
      "Un vrai calendrier d'équipe : chaque membre, chaque chantier, chaque jour. Fini les plannings sur papier ou WhatsApp.",
  },
  {
    path: 'solutions/leves-metre',
    title: 'Levés & métré sur cadastre suisse | Cantia',
    description:
      "Placez vos points sur le cadastre et l'orthophoto officiels suisses, puis passez au métré pour chiffrer les quantités.",
  },
  {
    path: 'telechargement',
    title: 'Télécharger Cantia | App mobile & web',
    description:
      "Cantia fonctionne comme une application web installable, sur ordinateur comme sur téléphone. Applications natives iOS et Android bientôt disponibles.",
  },
  {
    path: 'mentions-legales',
    title: 'Mentions légales | Cantia',
    description: "Mentions légales de Cantia, logiciel de gestion de chantier pour le bâtiment suisse.",
  },
  {
    path: 'confidentialite',
    title: 'Politique de confidentialité | Cantia',
    description:
      "Politique de confidentialité de Cantia : données collectées, hébergement en Suisse, droits des utilisateurs.",
  },
];

function jsonLdFor(url, description) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'Cantia',
        url: `${SITE}/`,
        logo: OG_IMAGE,
        email: 'info@cantia.ch',
        areaServed: { '@type': 'Country', name: 'Switzerland' },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Cantia',
        operatingSystem: 'Android, iOS, Web',
        applicationCategory: 'BusinessApplication',
        description,
        url,
        image: OG_IMAGE,
        publisher: { '@id': `${SITE}/#organization` },
        offers: { '@type': 'AggregateOffer', priceCurrency: 'CHF', lowPrice: '0', offerCount: '3' },
      },
    ],
  };
}

function patch(baseHtml, { path: routePath, title, description }) {
  const canonicalUrl = routePath ? `${SITE}/${routePath}` : `${SITE}/`;
  const metaTags = `
    <meta name="google-site-verification" content="ICyYP8Ky3MHHG3HsDL3rbEYb6Vy_2yy95uHmnLI74Sw" />
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#1F3D3A" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cantia" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="fr_CH" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <script type="application/ld+json">${JSON.stringify(jsonLdFor(canonicalUrl, description))}</script>`;

  let html = baseHtml.replace('<html lang="en">', '<html lang="fr">');
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>${metaTags}`);
  return html;
}

const baseHtml = readFileSync(distIndex, 'utf8');

for (const route of ROUTES) {
  const html = patch(baseHtml, route);
  if (!route.path) {
    writeFileSync(distIndex, html);
    continue;
  }
  const dir = path.join(distDir, route.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), html);
}

console.log(`SEO meta tags injected: dist/index.html + ${ROUTES.length - 1} route(s).`);
