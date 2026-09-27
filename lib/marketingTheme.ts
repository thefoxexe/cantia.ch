import { Platform, type TextStyle } from 'react-native';

// Brand typography, September 2026 identity ("plan d'exécution"): a single
// family, Archivo, used condensed and heavy for headings and at normal width
// for text, plus Martian Mono for the small technical labels (references,
// cotes, figures). Loaded as real <link> tags by scripts/inject-seo-meta.mjs
// (FONT_LINKS) — app/+html.tsx is never rendered with web.output "single".
export const marketingFonts = {
  display: 'Archivo',
  body: 'Archivo',
  mono: 'Martian Mono',
};

// RN Web passes unknown style keys straight through to CSS, so fontStretch
// selects the condensed cut of the variable Archivo font on web. The fonts
// are only loaded on web (app/+html.tsx), so native app screens that share
// these styles (e.g. PageHeader) keep the system font there.
export const displayType = (Platform.OS === 'web'
  ? { fontFamily: marketingFonts.display, fontStretch: '66%' }
  : {}) as unknown as TextStyle;

export const monoType = (Platform.OS === 'web'
  ? { fontFamily: marketingFonts.mono, fontStretch: '85%' }
  : {}) as unknown as TextStyle;
