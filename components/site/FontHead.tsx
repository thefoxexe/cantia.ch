import { FONT_ASYNC_SCRIPT, FONT_CSS, FONT_PRELOADS, SITE_SCOPE_CSS } from '../../lib/site/fontFaces';

// <head> part of every +html.tsx: the brand fonts from cantia.ch itself
// (preloaded), then the secondary Google fonts without blocking the page.
export function FontHead() {
  return (
    <>
      {FONT_PRELOADS.map((href) => (
        <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
      ))}
      <style dangerouslySetInnerHTML={{ __html: FONT_CSS + SITE_SCOPE_CSS }} />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <script dangerouslySetInnerHTML={{ __html: FONT_ASYNC_SCRIPT }} />
    </>
  );
}
