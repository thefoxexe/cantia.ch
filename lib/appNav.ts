// The pages reached straight from the app's menu (sidebar on a computer,
// drawer on a phone): see buildSections in app/(app)/_layout.tsx. On these
// the header shows no back arrow, since the menu is the way around; every
// page below them (a chantier, a devis, a setting) keeps its back link.
export const APP_MENU_ROOTS = new Set([
  '/',
  '/emails',
  '/planning',
  '/chantiers',
  '/soumissions',
  '/clients',
  '/devis',
  '/devis/factures',
  '/devis/inventaire',
  '/rh',
  '/rh/salaires',
  '/tresorerie',
  '/depenses',
  '/compta',
  '/compte',
]);

export function isMenuRoot(pathname: string): boolean {
  return APP_MENU_ROOTS.has(pathname.replace(/\/+$/, '') || '/');
}
