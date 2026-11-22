// Which screens of the app a member may open, from the permissions of their
// role (Compte › Équipe). The menu already hides what a role does not allow;
// this also closes the screens themselves, reached by a link on the
// dashboard, a notification, the browser history or a typed URL.
// /devis keeps its own guard (app/(app)/devis/_layout.tsx) and the RH
// screens check canManagePayroll themselves.

export type RouteAccess = {
  canViewFinances: boolean;
  canManageDevis: boolean;
  permissions: { metre: boolean; planning: boolean; documents: boolean; subcontractors: boolean };
};

type Rule = { test: RegExp; allowed: (a: RouteAccess) => boolean };

const RULES: Rule[] = [
  { test: /^\/(tresorerie|depenses|compta)(\/|$)/, allowed: (a) => a.canViewFinances },
  { test: /^\/chantiers\/[^/]+\/profitability(\/|$)/, allowed: (a) => a.canViewFinances },
  { test: /^\/(soumissions|metres)(\/|$)/, allowed: (a) => a.permissions.metre },
  { test: /^\/chantiers\/[^/]+\/(metre|metres)(\/|$)/, allowed: (a) => a.permissions.metre },
  { test: /^\/planning(\/|$)/, allowed: (a) => a.permissions.planning },
  { test: /^\/chantiers\/[^/]+\/documents(\/|$)/, allowed: (a) => a.permissions.documents },
  { test: /^\/sous-traitants(\/|$)/, allowed: (a) => a.permissions.subcontractors },
  { test: /^\/chantiers\/[^/]+\/subcontractors(\/|$)/, allowed: (a) => a.permissions.subcontractors },
  { test: /^\/chantiers\/[^/]+\/(travaux-supplementaires|situations)(\/|$)/, allowed: (a) => a.canManageDevis },
];

export function canOpenRoute(pathname: string, access: RouteAccess): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  for (const rule of RULES) if (rule.test.test(path)) return rule.allowed(access);
  return true;
}
