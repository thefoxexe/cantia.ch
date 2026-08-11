// Typography for the public marketing site only (home, /solutions/*,
// /telechargement, MarketingChrome) — deliberately not merged into
// lib/theme.ts, which the authenticated app screens also read, so this
// stays scoped to pages a logged-out visitor sees and never touches the
// product UI. Fraunces is already the brand's display face from the ad
// videos (Ads v3/v4); Instrument Sans is the body/UI pairing — both loaded
// as real <link> tags in app/+html.tsx (web-only, native ignores that file).
// Italics use the same family name with fontStyle: 'italic' — Google's
// stylesheet registers the italic weights under "Fraunces" too, so the
// browser resolves the right face without a separate family name.
export const marketingFonts = {
  display: 'Fraunces',
  body: 'Instrument Sans',
};
