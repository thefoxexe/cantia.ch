import { Platform, type TextStyle } from 'react-native';

// Brand typography. Since November 2026 the signed-in app, Accounting and
// Partners use the same DM Sans as the public site: displayType (headings,
// big figures) is DM Sans slightly tightened, monoType (references, small
// technical labels, figures) is DM Sans with tabular figures. The names stay
// so the many screens that spread them need no change. marketingFonts below
// is kept for the few legacy landing components that still name Archivo. Loaded as real <link> tags by scripts/inject-seo-meta.mjs
// (FONT_LINKS) — app/+html.tsx is never rendered with web.output "single".
export const marketingFonts = {
  display: 'Archivo',
  body: 'Archivo',
  mono: 'Martian Mono',
};

// RN Web passes unknown style keys straight through to CSS, so fontStretch
// selects the condensed cut of the variable Archivo font on web, and the
// fallback stack keeps a sans / monospace face if the web font does not load.
// The fonts are only loaded on web (app/+html.tsx), so native app screens
// that share these styles (e.g. PageHeader) keep the system font there.
export const displayType = (Platform.OS === 'web'
  ? { fontFamily: "'DM Sans', 'DM Sans Fallback', Arial, sans-serif", letterSpacing: -0.6 }
  : {}) as unknown as TextStyle;

export const monoType = (Platform.OS === 'web'
  ? { fontFamily: "'DM Sans', 'DM Sans Fallback', Arial, sans-serif", fontVariant: ['tabular-nums'] }
  : { fontVariant: ['tabular-nums'] }) as unknown as TextStyle;
