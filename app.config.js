// Extends app.json (native builds and the normal app.cantia.ch/dev web build
// keep reading straight from there — untouched). Only changes anything for
// the separate marketing-only static export (see scripts/build-marketing.mjs,
// package.json's build:marketing script, and app-marketing/):
// MARKETING_BUILD=1 (a) points Expo Router's root at app-marketing/ instead
// of app/ — the actual lever for this is `extra.router.root`, read by
// getRouterDirectoryModuleIdWithManifest() in @expo/cli; the EXPO_ROUTER_*
// env vars alone do NOT change it — and (b) switches web.output to "static"
// so Expo Router prerenders real HTML per route for cantia.ch. Any other
// build (npm run web, EAS builds, the normal `expo export` used for
// app.cantia.ch) leaves MARKETING_BUILD unset and gets exactly the "single"
// CSR SPA output, rooted at app/, that app.cantia.ch has always shipped.
module.exports = ({ config }) => {
  if (process.env.MARKETING_BUILD !== '1') return config;
  return {
    ...config,
    web: {
      ...config.web,
      output: 'static',
    },
    extra: {
      ...config.extra,
      router: {
        ...config.extra?.router,
        root: './app-marketing',
      },
    },
  };
};
