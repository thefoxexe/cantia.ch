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
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const distIndex = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'index.html');

const title = 'Cantia — Gestion de chantier pour artisans et entreprises du bâtiment (Suisse)';
const description =
  "Rapports de chantier, devis, photos géolocalisées, documents et levés cadastraux suisses — tout au même endroit. Le logiciel de gestion de chantier pensé pour le bâtiment en Suisse.";
const ogImage = 'https://cantia.ch/og-image.jpg';

// Organization + SoftwareApplication JSON-LD: the structured-data
// equivalent of the meta tags above, read by search engines for rich
// results and by AI/LLM crawlers (alongside llms.txt) to understand what
// the product actually is without having to parse the rendered UI.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://cantia.ch/#organization',
      name: 'Cantia',
      url: 'https://cantia.ch/',
      logo: 'https://cantia.ch/og-image.jpg',
      email: 'info@cantia.ch',
      areaServed: { '@type': 'Country', name: 'Switzerland' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cantia',
      operatingSystem: 'Android, iOS, Web',
      applicationCategory: 'BusinessApplication',
      description,
      url: 'https://cantia.ch/',
      image: ogImage,
      publisher: { '@id': 'https://cantia.ch/#organization' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'CHF',
        lowPrice: '0',
        offerCount: '3',
      },
    },
  ],
};

const metaTags = `
    <meta name="google-site-verification" content="ICyYP8Ky3MHHG3HsDL3rbEYb6Vy_2yy95uHmnLI74Sw" />
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#1F3D3A" />
    <link rel="canonical" href="https://cantia.ch/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cantia" />
    <meta property="og:url" content="https://cantia.ch/" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="fr_CH" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

let html = readFileSync(distIndex, 'utf8');

html = html.replace('<html lang="en">', '<html lang="fr">');
html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>${metaTags}`);

writeFileSync(distIndex, html);
console.log('SEO meta tags injected into dist/index.html');
