import Head from 'expo-router/head';

// Expo Router's own root layout renders an empty <Head><title></title></Head>
// via its vendored react-helmet-async whenever no page declares one — so the
// correct <title> baked into the static HTML at build time (see
// scripts/build-marketing.mjs / inject-seo-meta.mjs) gets silently wiped to
// "" the moment the page hydrates (confirmed: canonical, hreflang,
// description, og:title and the JSON-LD script all survive hydration fine —
// only <title> does not, because only <title> has an empty declaration
// competing with it). Every marketing page template renders this once with
// its own real title so react-helmet-async has something correct to render
// instead of nothing. Kept deliberately minimal (title only) since that's
// the one tag actually being cleared; canonical/hreflang/description need no
// client-side equivalent.
export function MarketingHead({ title }: { title: string }) {
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
}
