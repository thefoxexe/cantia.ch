import type { Feather } from '@expo/vector-icons';
import type { AdminAttention } from '../../lib/api/admin';

// Grouped by what you come to do: steer (home, journal), the customers,
// winning new ones, the two other spaces (fiduciaries, partners), writing
// to people, the product, and Cantia's own money. Each entry carries one
// line saying what is in it (phone menu, search), and may carry a counter of
// what waits for an action there (admin_attention).
export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  desc: string;
  short?: string;
  count?: (a: AdminAttention) => number;
  // A counter that calls for an action (copper) or only informs (grey).
  urgent?: boolean;
};
export const NAV_GROUPS: { title: string | null; items: NavItem[] }[] = [
  {
    title: null,
    items: [
      { href: '/(admin)', label: 'Accueil', icon: 'home', desc: 'Ce qui attend une action, les chiffres du moment et la dernière activité.' },
      { href: '/(admin)/logs', label: 'Journal', icon: 'activity', desc: 'Tout ce qui se passe : inscriptions, paiements, envois, actions admin.' },
    ],
  },
  {
    title: 'Clients',
    items: [
      { href: '/(admin)/organizations', label: 'Entreprises', icon: 'briefcase', desc: 'Toutes les entreprises inscrites, leur plan, leurs membres et leur activité.', count: (a) => a.signups_24h },
      { href: '/(admin)/subscriptions', label: 'Abonnements', icon: 'credit-card', desc: 'Qui paie, qui est en essai, les retards et les motifs de résiliation.', count: (a) => a.past_due, urgent: true },
    ],
  },
  {
    title: 'Croissance',
    items: [
      { href: '/(admin)/registre', label: 'Prospection', icon: 'send', desc: 'Les nouvelles entreprises du registre du commerce, les e-mails de bienvenue et les demandes de 3 mois.', count: (a) => a.outreach_drafts + a.outreach_failed + a.trial_requests, urgent: true },
      { href: '/(admin)/trafic', label: 'Trafic', icon: 'compass', desc: 'D’où viennent les visites et les inscriptions.' },
      { href: '/(admin)/blog-leads', label: 'Blog & leads', icon: 'download', desc: 'Les e-mails captés et ce que rapporte chaque article.' },
    ],
  },
  {
    title: 'Écosystème',
    items: [
      { href: '/(admin)/fiduciaires', label: 'Fiduciaires', icon: 'shield', desc: 'Cantia Accounting : les cabinets, leurs mandats et leur activité.', count: (a) => a.fiduciaries_suspicious, urgent: true },
      { href: '/(admin)/partners', label: 'Partenaires', icon: 'award', desc: 'Cantia Partners : les apporteurs, leurs clients et leurs commissions.', count: (a) => a.partner_payouts, urgent: true },
    ],
  },
  {
    title: 'Communication',
    items: [
      { href: '/(admin)/newsletter', label: 'E-mails', icon: 'mail', desc: 'Écrire à vos clients, fiduciaires, partenaires ou à n’importe quelle adresse.' },
      { href: '/(admin)/tutoriels', label: 'Tutoriels', icon: 'video', desc: 'Le plan de tournage des vidéos, chapitre par chapitre.' },
    ],
  },
  {
    title: 'Produit',
    items: [
      { href: '/(admin)/usage', label: 'Utilisation', icon: 'bar-chart-2', desc: 'Les fonctions vraiment utilisées, entreprise par entreprise.' },
      { href: '/(admin)/modules', label: 'Modules', icon: 'grid', desc: 'Ce que contient chaque plan, et les modules à assigner aux entreprises.' },
    ],
  },
  {
    title: 'Finances',
    items: [
      { href: '/(admin)/rentabilite', label: 'Rentabilité', icon: 'trending-up', desc: 'Encaissé, frais Stripe et dépenses de la plateforme.' },
      { href: '/(admin)/compta', label: 'Comptabilité', icon: 'book', desc: 'Les recettes, dépenses et justificatifs de Cantia.' },
    ],
  },
];
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
// The group each page belongs to, shown above its title (AdminPage eyebrow).
export const NAV_GROUP_OF: Record<string, string> = Object.fromEntries(
  NAV_GROUPS.flatMap((g) => g.items.map((i) => [i.href, g.title ?? 'Pilotage'])),
);
// Phone: the four pages opened most often sit in a bar at the bottom, the
// rest is one tap away under « Plus ».
export const TAB_HREFS = ['/(admin)', '/(admin)/organizations', '/(admin)/subscriptions', '/(admin)/registre'];
export const TAB_LABEL: Record<string, string> = { '/(admin)': 'Accueil', '/(admin)/subscriptions': 'Abonnés' };

export function activeHrefFor(pathname: string): string | null {
  let best: string | null = null;
  for (const item of NAV_ITEMS) {
    const compare = item.href.replace('/(admin)', '') || '/';
    const matches = compare === '/' ? pathname === '/' : pathname === compare || pathname.startsWith(`${compare}/`);
    if (matches && (!best || item.href.length > best.length)) best = item.href;
  }
  // Pages outside the menu (people) belong to the companies.
  if (!best && pathname.startsWith('/users')) best = '/(admin)/organizations';
  return best;
}
