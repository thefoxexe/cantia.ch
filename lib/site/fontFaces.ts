// The two brand typefaces (DM Sans, DM Serif Display), served from
// public/fonts/ instead of Google Fonts: no third-party round trip before the
// first glyph, and the main files are preloaded with the page.
//
// "DM Sans Fallback" / "DM Serif Fallback" are the local Arial / Times
// resized to the same width as the real fonts (measured in Chromium on
// French body text), so the moment the real font arrives the text barely
// moves. Every font stack lists them right after the real font
// (lib/siteTheme.ts).
//
// Archivo and Martian Mono (signed-in app, Accounting mockups) still come
// from Google, loaded without blocking the page: FONT_ASYNC_SCRIPT.

export const FONT_PRELOADS = ['/fonts/dm-sans-latin.woff2', '/fonts/dm-serif-display-latin-italic.woff2'];

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

function face(family: string, file: string, style: 'normal' | 'italic', weight: string, range: string) {
  return `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};font-display:swap;src:url(/fonts/${file}.woff2) format('woff2');unicode-range:${range}}`;
}

export const FONT_CSS = [
  face('DM Sans', 'dm-sans-latin', 'normal', '100 1000', LATIN),
  face('DM Sans', 'dm-sans-latin-ext', 'normal', '100 1000', LATIN_EXT),
  face('DM Sans', 'dm-sans-latin-italic', 'italic', '100 1000', LATIN),
  face('DM Sans', 'dm-sans-latin-ext-italic', 'italic', '100 1000', LATIN_EXT),
  face('DM Serif Display', 'dm-serif-display-latin', 'normal', '400', LATIN),
  face('DM Serif Display', 'dm-serif-display-latin-ext', 'normal', '400', LATIN_EXT),
  face('DM Serif Display', 'dm-serif-display-latin-italic', 'italic', '400', LATIN),
  face('DM Serif Display', 'dm-serif-display-latin-ext-italic', 'italic', '400', LATIN_EXT),
  "@font-face{font-family:'DM Sans Fallback';src:local('Arial'),local('ArialMT'),local('Liberation Sans'),local('Helvetica');size-adjust:102.5%;ascent-override:96.6%;descent-override:30.2%;line-gap-override:0%}",
  "@font-face{font-family:'DM Serif Fallback';font-style:italic;src:local('Times New Roman Italic'),local('TimesNewRomanPS-ItalicMT'),local('Liberation Serif Italic'),local('Times-Italic');size-adjust:104.3%;ascent-override:99.7%;descent-override:32.6%;line-gap-override:0%}",
  "@font-face{font-family:'DM Serif Fallback';font-style:normal;src:local('Times New Roman'),local('TimesNewRomanPSMT'),local('Liberation Serif'),local('Times-Roman');size-adjust:104.3%;ascent-override:99.7%;descent-override:32.6%;line-gap-override:0%}",
].join('');

// Site pages (marketing, logins, Accounting/Partners) mark <html data-site>
// (useSiteFontScope): there, any text or field that sets no font of its own
// (cookie banner, shared form fields, sign-in buttons…) uses DM Sans instead
// of the app's default. Text with an explicit font keeps it. The signed-in
// app never sets the attribute and keeps its own typography.
export const SITE_SCOPE_CSS =
  "html[data-site] [dir=auto]:not([class*='r-fontFamily']),html[data-site] input:not([class*='r-fontFamily']),html[data-site] textarea:not([class*='r-fontFamily']){font-family:'DM Sans','DM Sans Fallback',Arial,sans-serif}";

export const SECONDARY_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Martian+Mono:wdth,wght@75..112.5,100..800&family=Michroma&display=swap';

// Appends the Google stylesheet once the HTML is parsed, so it never holds
// back the first paint.
export const FONT_ASYNC_SCRIPT = `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href=${JSON.stringify(SECONDARY_FONTS_HREF)};document.head.appendChild(l);})();`;
