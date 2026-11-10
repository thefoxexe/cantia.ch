import { Platform, type TextStyle } from 'react-native';

// Marketing identity, November 2026 ("papier, cuivre, vert sobre"): the
// public sites of Cantia, Cantia Accounting and Cantia Partners share these
// values. Reference: the design hand-off's maquette/dist/assets/theme.css.
export const site = {
  bg: '#f6f4ef',
  white: '#fffefa',
  ink: '#252921',
  muted: '#74786e',
  copper: '#a65d36',
  rust: '#8d4b2b',
  clay: '#e9d7c5',
  line: '#dfe0d7',
  green: '#68755a',
  lime: '#dfe4c8',
  stage: '#e3d3c0',
  stageBorder: '#dcc8b1',
  dark: '#293128',
  maxWidth: 1320,
};

// DM Sans for everything, DM Serif Display italic for the accent half of a
// headline. Loaded as <link> tags on web (app/+html.tsx, scripts/inject-seo-meta.mjs);
// native keeps the system font.
export const sans = (Platform.OS === 'web'
  ? { fontFamily: "'DM Sans', 'DM Sans Fallback', Arial, sans-serif" }
  : {}) as TextStyle;

export const serif = (Platform.OS === 'web'
  ? { fontFamily: "'DM Serif Display', 'DM Serif Fallback', Georgia, serif", fontStyle: 'italic', fontWeight: '400' }
  : { fontStyle: 'italic' }) as TextStyle;

// Side padding of the 1320 px content column, per viewport width.
export function gutter(width: number): number {
  if (width <= 370) return 18;
  if (width <= 760) return 22;
  if (width <= 1100) return 32;
  return 54;
}

export const bp = { phone: 760, tablet: 1100 };
