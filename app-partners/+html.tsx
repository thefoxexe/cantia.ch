import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';
import { FontHead } from '../components/site/FontHead';

// Root HTML document of partners.cantia.ch. Same brand fonts as cantia.ch
// (lib/marketingTheme.ts); no ad tag here.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#f6f4ef" />
        <meta property="og:site_name" content="Cantia Partners" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/pwa-icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <FontHead />
        <style>{'html, body { background-color: #f6f4ef; font-family: "DM Sans", "DM Sans Fallback", Arial, sans-serif; }'}</style>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
