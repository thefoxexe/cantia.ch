# app-marketing/

A second, standalone Expo Router route tree used **only** to build a
real, crawlable static export of the cantia.ch marketing site — the
normal `app/` directory (and its `dist/` "single" CSR export) keeps
shipping app.cantia.ch exactly as before, untouched.

## Why this exists

`app/` is one Expo Router build serving both cantia.ch and
app.cantia.ch, split at runtime by hostname (`lib/appHost.ts`), using
`web.output: "single"` — a plain client-rendered SPA. That's fine for
the authenticated app, but it means cantia.ch ships an empty
`<body>` until JavaScript runs, which most crawlers that don't execute
JS (including many LLM ingestion bots) never see past.

Switching the *whole* app to `web.output: "static"` was considered and
rejected: it would try to prerender every authenticated route
(`app/(app)/**`) too, in a Node process with no `window` — those pages
depend on browser-only APIs (Supabase auth storage, etc.) and have no
reason to be crawlable anyway (they're already `noindex`'d).

Instead, this directory is a **separate, minimal route root** — every
file here just re-exports the real page component from `app/` (e.g.
`app-marketing/solutions/devis.tsx` is `export { default } from
'../../app/solutions/devis'`), so the content has one source of truth.
It only contains the public marketing pages: the landing page,
`/solutions/*`, `/telechargement`, and the two legal pages. Nothing
here imports `AuthProvider` or anything session-related.

## How the build differs from the normal one

Driven by `MARKETING_BUILD=1` (see `scripts/build-marketing.mjs` and
`package.json`'s `build:marketing` script), which `app.config.js`
reads to:

1. Point Expo Router's root at `app-marketing/` instead of `app/`
   (`extra.router.root` — the actual lever `@expo/cli` reads; the
   `EXPO_ROUTER_APP_ROOT` env var alone does **not** do this in the
   installed Expo/expo-router version).
2. Switch `web.output` to `"static"`, so `expo export` prerenders real
   HTML per route instead of one empty shell.

Any other build (`npm run web`, EAS builds, the plain `expo export`
used for app.cantia.ch) leaves `MARKETING_BUILD` unset and gets
exactly the same `app/`-rooted, `"single"`-output build as always.

Output goes to `dist-marketing/` (gitignored), deployed as a **separate
Netlify site** pointed at this same repo, configured directly in that
site's UI (Netlify only ever reads a file literally named
`netlify.toml`, so a same-repo second config file under a different
name isn't picked up — no toml file is used for this site):
- Base directory: leave empty (must stay the repo root — that's where
  `package.json` and the rest of the app live).
- Build command: `npm run build:marketing`
- Publish directory: `dist-marketing`

The existing `netlify.toml` at the repo root is untouched and keeps
driving the original site (app.cantia.ch, and cantia.ch until its
domain is moved to this new site).
