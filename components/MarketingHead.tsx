import Head from 'expo-router/head';

const DEFAULT_DESCRIPTION = 'Cantia — logiciel suisse de gestion pour entreprises du bâtiment : devis, factures, chantiers, RH et trésorerie en un seul endroit.';
const OG_IMAGE = 'https://cantia.ch/og-image.jpg';

// Every marketing page renders this once — the single injection point for
// social-share metadata. Previously only set <title>; og-image.jpg sat
// unused in public/ with nothing pointing to it, so a Cantia link shared on
// WhatsApp/LinkedIn/Facebook showed no preview card at all. description is
// optional per-page (falls back to the site-wide tagline) so existing
// callers keep working untouched while still getting real OG/Twitter tags.
export function MarketingHead({ title, description }: { title: string; description?: string }) {
  const desc = description ?? DEFAULT_DESCRIPTION;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Cantia" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Head>
  );
}
