import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Customizes the root HTML document for web builds only (native ignores this
// file entirely). Its only job here is loading the marketing-site typefaces
// as real `<link>` tags so they arrive with the page instead of a runtime
// fetch, and font-display: swap keeps first paint from blocking on the font
// request. The app's own screens don't reference any of these families, so
// this has no visual effect outside app/index.tsx, app/solutions/*,
// app/telechargement.tsx and MarketingChrome.
// - Archivo (variable width, condensed for headings) + Martian Mono: the
//   brand typography of every marketing page — see lib/marketingTheme.ts.
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
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Martian+Mono:wdth,wght@75..112.5,100..800&display=swap"
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

        {/* Google Ads base tag — loaded site-wide (same build serves both
            cantia.ch and app.cantia.ch) so cross-domain conversion linking
            works: a click landing on cantia.ch needs this tag present to
            decorate outbound links to app.cantia.ch with the click id,
            otherwise the signup conversion on app.cantia.ch can't be
            attributed back to the ad. The actual conversion event fires
            only on the verify-email screen after signup, not here. */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18465996566" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18465996566');`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
