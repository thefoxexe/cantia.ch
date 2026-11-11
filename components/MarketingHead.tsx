import Head from 'expo-router/head';

const DEFAULT_DESCRIPTION = 'Cantia : logiciel suisse de gestion pour entreprises du bâtiment : devis, factures, chantiers, RH et trésorerie en un seul endroit.';
const OG_IMAGE = 'https://cantia.ch/og-image.jpg';

// Every marketing page renders this once — the single injection point for
// social-share metadata. Previously only set <title>; og-image.jpg sat
// unused in public/ with nothing pointing to it, so a Cantia link shared on
// WhatsApp/LinkedIn/Facebook showed no preview card at all. description is
// optional per-page (falls back to the site-wide tagline) so existing
// callers keep working untouched while still getting real OG/Twitter tags.
// The pre-rendered HTML (scripts/inject-seo-meta.mjs) already carries the
// curated title and description, sometimes shorter than the page headline so
// a search result shows them whole. Read once at load, before any Head
// update, and kept for that same URL so the app doesn't swap them back once
// it starts. Pages reached later by in-app navigation use their own props.
const STATIC_HEAD = (() => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
  if (!title) return null;
  return { path: window.location.pathname.replace(/\/+$/, ''), title, description: description ?? undefined };
})();

function staticHeadFor(): { title: string; description?: string } | null {
  if (!STATIC_HEAD || typeof window === 'undefined') return null;
  return window.location.pathname.replace(/\/+$/, '') === STATIC_HEAD.path ? STATIC_HEAD : null;
}

export function MarketingHead({ title: propTitle, description }: { title: string; description?: string }) {
  const pre = staticHeadFor();
  const title = pre?.title ?? propTitle;
  const desc = pre?.description ?? description ?? DEFAULT_DESCRIPTION;
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
