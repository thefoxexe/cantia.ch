import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Customizes the root HTML document for web builds only (native ignores this
// file entirely). Its only job here is loading the marketing-site typefaces
// as real `<link>` tags so they arrive with the page instead of a runtime
// fetch, and font-display: swap keeps first paint from blocking on the font
// request. The app's own screens don't reference any of these families, so
// this has no visual effect outside app/index.tsx, app/solutions/*,
// app/telechargement.tsx and MarketingChrome.
// - Fraunces + Instrument Sans: brand display/body pairing from the ad
//   videos, used by /solutions/*, trade pages, MarketingChrome.
// - DM Sans: the homepage only (app/index.tsx) — see lib/landingTheme.ts —
//   from the September 2026 "Cantia_Landing" reference package, which
//   specified this typeface precisely for the redesigned landing page.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
        />
        {/* Matches lib/theme.ts colors.bg — without this, the raw white
            html/body shows through for an instant during the mobile
            overscroll bounce at the top of the page, which reads as a
            stray gap under the (deliberately transparent) marketing navbar.
            Deliberately NOT setting overscroll-behavior-y: none here — that
            mutes the bounce on Chrome/Android, but that's the same mechanism
            the browser's native pull-to-refresh is built on, so it silently
            disabled pull-to-refresh everywhere on web as a side effect. The
            background-color match already fixes the visible flash on its
            own; losing pull-to-refresh (which every other site has) is the
            worse tradeoff. */}
        <style>{'html, body { background-color: #F7F1E6; }'}</style>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
