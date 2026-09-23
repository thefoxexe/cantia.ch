// Shared brand-kit constants — devis, factures and rapports all render
// through one unified PDF layout now (no more per-org "templates" to
// create/duplicate/manage), so this file only holds the bits still used to
// build the org's single brand kit editor (Compte → Profil entreprise) and
// the onboarding brand-color picker: hex validation, the preset swatches,
// and logo placement options (still relevant to reports, which keep a logo).
export type LogoPlacement = 'left' | 'center' | 'right';

export const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

export const BRAND_COLOR_PRESETS = [
  '#1B4332', // vert sapin profond (défaut)
  '#1B3A5C', // bleu royal profond
  '#7D2E3B', // bordeaux
  '#3D5A80', // bleu ardoise
  '#4A4E69', // prune indigo
  '#6E4B2A', // noyer
  '#22333B', // anthracite
  '#9C6B1F', // bronze doré
];

export const LOGO_PLACEMENTS: { id: LogoPlacement; label: string; icon: 'align-left' | 'align-center' | 'align-right' }[] = [
  { id: 'left', label: 'Gauche', icon: 'align-left' },
  { id: 'center', label: 'Centré', icon: 'align-center' },
  { id: 'right', label: 'Droite', icon: 'align-right' },
];
