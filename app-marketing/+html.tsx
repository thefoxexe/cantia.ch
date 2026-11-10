import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';
import { FontHead } from '../components/site/FontHead';

// Root HTML document for the marketing-only static export. Unlike
// app/+html.tsx (ignored under web.output "single"), this one is actually
// honored — web.output is "static" for this build (see app.config.js) — so
// the font <link> tags load with the page instead of needing a postbuild
// patch, and Expo Router's static prerendering fills <body> with real,
// crawlable HTML per route instead of an empty shell.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <FontHead />
        {/* Matches lib/theme.ts colors.bg — without this, the raw white
            html/body shows through for an instant during the mobile
            overscroll bounce at the top of the page, which reads as a
            stray gap under the (deliberately transparent) marketing navbar.
            The background-color alone already fixes that flash; this used
            to also set overscroll-behavior-y: none to mute the bounce
            itself on Chrome/Android, but that has the side effect of
            disabling that browser's native pull-to-refresh gesture on a
            public content site where visitors expect it to work — not
            worth trading away just to mute a bounce the background fix
            already makes invisible. */}
        <style>{'html, body { background-color: #f6f4ef; }'}</style>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
