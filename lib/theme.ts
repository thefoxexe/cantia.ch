// Warm terracotta/cream palette — replaces the old dark-green identity
// wholesale. Every screen reads these tokens rather than hardcoded hex, so
// this file alone recolors the entire app; nothing else needed to change.
export const colors = {
  bg: '#F7F1E6',
  surface: '#FFFFFF',
  surfaceAlt: '#F1E6D5',
  border: '#E6D8C2',
  text: '#231A12',
  textMuted: '#6E6153',
  primary: '#BC5A31',
  primaryDark: '#7C3B21',
  primarySoft: '#F5DECB',
  accent: '#D97B41',
  accentSoft: '#F6E4D2',
  danger: '#AB3327',
  dangerSoft: '#F5E1DE',
  success: '#2E6B4F',
  successSoft: '#E2EEE6',
  warning: '#9C6510',
  warningSoft: '#F3E8D6',
  // Same curated muted family as ROLE_COLORS (compte/equipe.tsx) — used for
  // blog category accents beyond the original five.
  slate: '#3F5D7D',
  slateSoft: '#E2E8ED',
  plum: '#6B4E8E',
  plumSoft: '#EAE3F0',
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

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
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
