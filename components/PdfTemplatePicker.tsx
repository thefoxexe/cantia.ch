// Shared brand-kit constants — devis, factures and rapports all render
// through one unified PDF layout now (no more per-org "templates" to
// create/duplicate/manage), so this file only holds the bits still used to
// build the org's single brand kit editor (Compte → Profil entreprise) and
// the onboarding brand-color picker: hex validation, the preset swatches,
// and logo placement options (still relevant to reports, which keep a logo).
export type LogoPlacement = 'left' | 'center' | 'right';

export const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

export const BRAND_COLOR_PRESETS = [
  '#1F3D3A', // vert sapin (défaut)
  '#16324F', // bleu marine
  '#7A2E2E', // rouge brique
  '#2E4A2E', // vert forêt
  '#33475B', // bleu ardoise
  '#6B4226', // terre cuite
  '#263238', // anthracite
  '#8A5A00', // ambre
];

export const LOGO_PLACEMENTS: { id: LogoPlacement; label: string; icon: 'align-left' | 'align-center' | 'align-right' }[] = [
  { id: 'left', label: 'Gauche', icon: 'align-left' },
  { id: 'center', label: 'Centré', icon: 'align-center' },
  { id: 'right', label: 'Droite', icon: 'align-right' },
];
