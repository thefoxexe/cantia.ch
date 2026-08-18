import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Customizes the root HTML document for web builds only (native ignores this
// file entirely). Its only job here is loading the two marketing-site
// typefaces (Fraunces — already the brand's display face from the ad videos
// — paired with Instrument Sans for body copy) as real `<link>` tags so they
// arrive with the page instead of a runtime fetch, and font-display: swap
// keeps first paint from blocking on the font request. The app's own screens
// don't reference either family, so this has no visual effect outside
// app/index.tsx, app/solutions/*, app/telechargement.tsx and MarketingChrome.
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
        />
        {/* Matches lib/theme.ts colors.bg — without this, the raw white
            html/body shows through for an instant during the mobile
            overscroll bounce at the top of the page, which reads as a
            stray gap under the (deliberately transparent) marketing navbar.
            overscroll-behavior-y also mutes that bounce on browsers that
            support it (mainly Chrome/Android; Safari/iOS still bounces). */}
        <style>{'html, body { background-color: #F7F1E6; overscroll-behavior-y: none; }'}</style>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
