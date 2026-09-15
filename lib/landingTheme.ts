// Typography for the redesigned homepage only (app/index.tsx and
// components/landing/*) — the September 2026 "Cantia_Landing" reference
// package specified DM Sans precisely, distinct from marketingFonts
// (Fraunces + Instrument Sans), which every other marketing page
// (/solutions/*, trade pages, MarketingChrome) keeps using. Loaded as a real
// <link> tag in app/+html.tsx (web-only, native never renders this page —
// see the Platform.OS check in app/index.tsx).
export const landingFonts = {
  body: 'DM Sans',
};
