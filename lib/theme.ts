// The public site's palette (lib/siteTheme.ts, "papier, cuivre, vert
// sobre"), applied to the signed-in app since November 2026 so both read as
// one product. Every screen reads these tokens rather than hardcoded hex, so
// this file alone recolors the entire app.
export const colors = {
  bg: '#F6F4EF',
  surface: '#FFFEFA',
  surfaceAlt: '#EFEDE6',
  border: '#DFE0D7',
  text: '#252921',
  textMuted: '#74786E',
  primary: '#A65D36',
  primaryDark: '#8D4B2B',
  primarySoft: '#F1E4D6',
  accent: '#B8703F',
  accentSoft: '#F3E8DC',
  danger: '#AB3327',
  dangerSoft: '#F5E1DE',
  success: '#4E6B45',
  successSoft: '#E6EBDA',
  warning: '#9C6510',
  warningSoft: '#F3E8D6',
  // Same curated muted family as ROLE_COLORS (compte/equipe.tsx) — used for
  // blog category accents beyond the original five.
  slate: '#3F5D7D',
  slateSoft: '#E2E8ED',
  plum: '#6B4E8E',
  plumSoft: '#EAE3F0',
  moss: '#5C7A5C',
  mossSoft: '#E3E9E1',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Crisp corners, matching the brand identity (September 2026, see
// lib/marketingTheme.ts): controls and cards read as drawn objects, not
// bubbles. pill stays for true pills (badges, toggles, avatars).
export const radius = {
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
  pill: 999,
};

export const fontSize = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 34,
};

export const breakpoints = {
  tablet: 640,
  desktop: 960,
};
