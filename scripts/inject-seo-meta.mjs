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

// Same `web.output: "single"` problem as the SEO tags above: app/+html.tsx's
// <link> tags for the marketing typefaces (Fraunces/Instrument Sans, see
// lib/marketingTheme.ts) never reach the exported HTML either — only visible
// via `expo start --web`, never on the actual cantia.ch build. Injected here
// for the same reason the meta tags are.
const FONT_LINKS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" />`;

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
    faq: [
      {
        q: 'Comment faire un devis rapidement en tant qu’artisan ?',
        a: "Dictez vos lignes à voix haute sur le chantier ou en voiture. Cantia les transforme en positions chiffrées avec vos prix habituels, et le PDF est prêt avant même d'avoir quitté le client.",
      },
      {
        q: 'Le devis est-il conforme aux usages suisses (TVA, mise en page) ?',
        a: "Oui : chaque devis reprend votre taux de TVA, vos coordonnées d'entreprise et peut être personnalisé à votre couleur de marque et votre logo.",
      },
      {
        q: 'Peut-on transformer un devis accepté en facture automatiquement ?',
        a: 'Oui, un devis accepté se convertit en facture — avec QR-bill suisse — en un clic, sans ressaisir les lignes.',
      },
      {
        q: 'Cantia est-il gratuit pour faire des devis ?',
        a: 'Oui, un quota de devis mensuel est disponible gratuitement, sans carte bancaire ni engagement.',
      },
    ],
  },
  {
    path: 'solutions/facturation',
    title: 'Facturation & QR-facture suisse | Cantia',
    description:
      "Chaque facture Cantia intègre automatiquement le QR-bill suisse conforme — IBAN, référence structurée et montant déjà encodés, prêt à scanner.",
    faq: [
      {
        q: 'Comment créer une facture avec QR-facture suisse ?',
        a: "Renseignez votre IBAN une fois dans les paramètres : chaque facture génère ensuite automatiquement le bulletin QR conforme à la norme SIX, IBAN et référence structurée déjà encodés.",
      },
      {
        q: 'Peut-on facturer un acompte avant la fin du chantier ?',
        a: "Oui, Cantia permet d'émettre une facture d'acompte pour un pourcentage du devis, puis déduit automatiquement ce montant de la facture finale.",
      },
      {
        q: 'Comment savoir si une facture a été payée ?',
        a: 'Recherchez et rapprochez un paiement directement par son numéro de référence QR — le statut passe à «payée» sans devoir vérifier votre compte bancaire manuellement.',
      },
      {
        q: 'Combien coûte la facturation avec QR-code via Cantia ?',
        a: 'La facturation avec QR-bill suisse est incluse dans tous les plans, y compris le plan gratuit.',
      },
    ],
  },
  {
    path: 'solutions/rapports-chantier',
    title: 'Rapports de chantier | Cantia',
    description:
      "Notes vocales, photos géolocalisées et messages d'équipe : Cantia en tire un rapport rédigé et structuré, prêt à envoyer.",
    faq: [
      {
        q: 'Comment rédiger un rapport de chantier rapidement ?',
        a: "Prenez vos photos et dictez vos notes sur le moment — Cantia assemble tout en un rapport PDF structuré et prêt à envoyer, sans devoir tout retaper le soir.",
      },
      {
        q: 'Les photos sont-elles géolocalisées automatiquement ?',
        a: 'Oui, chaque photo est horodatée et géolocalisée sans action supplémentaire de votre part.',
      },
      {
        q: 'Peut-on personnaliser le rapport avec son logo et sa signature ?',
        a: 'Oui, chaque rapport PDF reprend votre logo, votre couleur de marque et la signature de son rédacteur.',
      },
      {
        q: 'Le rapport de chantier remplace-t-il un carnet de chantier papier ?',
        a: 'Oui — notes, photos et suivi sont centralisés dans un document numérique consultable à tout moment, par chantier.',
      },
    ],
  },
  {
    path: 'solutions/dictee-vocale',
    title: 'Dictée vocale pour le bâtiment | Cantia',
    description:
      "Devis, rapports, messages d'équipe : un bouton dicter remplace la saisie au clavier, partout dans Cantia.",
    faq: [
      {
        q: 'La dictée vocale fonctionne-t-elle bien avec le vocabulaire du bâtiment ?',
        a: 'Oui, la reconnaissance est adaptée au vocabulaire technique du bâtiment — matériaux, unités, métiers — pas seulement à du langage courant.',
      },
      {
        q: 'Faut-il une connexion internet pour dicter ?',
        a: 'Oui, la dictée nécessite une connexion pour la transcription, mais les devis et rapports générés restent consultables une fois créés.',
      },
      {
        q: 'Où peut-on utiliser la dictée vocale dans Cantia ?',
        a: "Sur les devis, les rapports de chantier et les messages d'équipe du fil d'actualité — partout où vous écrivez.",
      },
      {
        q: 'La dictée vocale est-elle plus rapide que le clavier sur le terrain ?',
        a: 'Pour la plupart des artisans sur chantier, oui — parler va plus vite que taper sur un téléphone avec les mains sales ou des gants.',
      },
    ],
  },
  {
    path: 'solutions/planning',
    title: "Planning d'équipe chantier | Cantia",
    description:
      "Un vrai calendrier d'équipe : chaque membre, chaque chantier, chaque jour. Fini les plannings sur papier ou WhatsApp.",
    faq: [
      {
        q: "Comment organiser le planning d'une équipe de chantier ?",
        a: 'Cantia affiche un calendrier hebdomadaire partagé : chaque membre voit qui est sur quel chantier, chaque jour.',
      },
      {
        q: 'Le planning remplace-t-il un tableau Excel ou un groupe WhatsApp ?',
        a: "Oui, toute l'équipe consulte les mêmes informations en temps réel, sans fichier ni message à faire défiler.",
      },
      {
        q: 'Peut-on planifier plusieurs chantiers en parallèle ?',
        a: 'Oui, chaque affectation est liée à un chantier précis et reste visible sur toute la semaine, membre par membre.',
      },
      {
        q: 'Le planning est-il inclus dans le plan gratuit ?',
        a: 'Le planning est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
      },
    ],
  },
  {
    path: 'solutions/leves-metre',
    title: 'Levés & métré sur cadastre suisse | Cantia',
    description:
      "Placez vos points sur le cadastre et l'orthophoto officiels suisses, puis passez au métré pour chiffrer les quantités.",
    faq: [
      {
        q: 'Peut-on faire des levés directement sur le cadastre suisse ?',
        a: "Oui, Cantia affiche le cadastre et l'orthophoto officiels suisses, et vous placez vos points directement dessus.",
      },
      {
        q: 'Comment exporter les données de levés ?',
        a: "Au format DXF, LandXML, CSV ou GPX, pour les réutiliser dans d'autres logiciels ou les partager avec un bureau d'ingénieurs.",
      },
      {
        q: 'Le métré est-il relié directement au devis ?',
        a: 'Oui, chaque poste de métré peut être transformé en ligne de devis chiffrée en un clic.',
      },
      {
        q: 'Faut-il un récepteur GPS professionnel pour les levés ?',
        a: 'Non, un smartphone suffit pour la plupart des usages de terrain.',
      },
    ],
  },
  {
    path: 'solutions/rentabilite',
    title: 'Rentabilité par chantier | Cantia',
    description:
      "Comparez le devis accepté au coût réel — matériel et main d'œuvre — pour savoir si chaque chantier est rentable, en marge serrée ou en perte.",
    faq: [
      {
        q: 'Comment savoir si un chantier est rentable ?',
        a: "Cantia compare le devis accepté (revenu) au coût réel — matériel saisi et main d'œuvre issue du planning — et affiche la marge en CHF et en % en temps réel.",
      },
      {
        q: "D'où vient le calcul du coût de main d'œuvre ?",
        a: "Du planning d'équipe : les jours affectés à un chantier sont multipliés par le coût horaire de votre entreprise, sans pointage séparé.",
      },
      {
        q: 'Peut-on comparer plusieurs chantiers entre eux ?',
        a: 'Oui, chaque chantier affiche sa propre marge, ce qui permet de repérer rapidement les chantiers en perte.',
      },
      {
        q: 'La rentabilité par chantier est-elle incluse dans le plan gratuit ?',
        a: 'Elle est disponible à partir du plan Équipe, activable depuis les paramètres de votre organisation.',
      },
    ],
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

function jsonLdFor(url, description, faq) {
  const graph = [
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
  ];
  // Matches the visible FAQ section rendered on the same page
  // (components/SolutionPage.tsx) — Google requires structured data to
  // reflect content actually shown to visitors, not hidden-only markup.
  if (faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

function patch(baseHtml, { path: routePath, title, description, faq }) {
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
    <script type="application/ld+json">${JSON.stringify(jsonLdFor(canonicalUrl, description, faq))}</script>`;

  let html = baseHtml.replace('<html lang="en">', '<html lang="fr">');
  html = html.replace('<head>', `<head>${FONT_LINKS}`);
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
