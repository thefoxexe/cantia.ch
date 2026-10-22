import { UsagePanel, type UsageData } from './AdminUsagePanel';

// Super Admin › Entreprises: the "Utilisation" panel with the app's own
// screen names. Internal tool: French only.

const WORDS: Record<string, string> = {
  accueil: 'Accueil',
  chantiers: 'Chantiers',
  documents: 'Documents',
  feed: 'Fil d’activité',
  gantt: 'Planning de chantier',
  metre: 'Métré',
  metres: 'Soumissions',
  import: 'Import',
  photos: 'Photos',
  plans: 'Plans',
  profitability: 'Rentabilité',
  'rapport-new': 'Nouveau rapport',
  rapports: 'Rapports',
  reports: 'Rapports',
  settings: 'Réglages',
  situations: 'Situations',
  subcontractors: 'Sous-traitants',
  'travaux-supplementaires': 'Travaux supplémentaires',
  clients: 'Contacts',
  commercial: 'Commercial',
  compta: 'Comptabilité',
  bouclement: 'Bouclement',
  fiscalite: 'Fiscalité',
  tva: 'TVA',
  compte: 'Paramètres',
  apparence: 'Apparence',
  automatisations: 'Automatisations',
  danger: 'Zone sensible',
  devis: 'Devis',
  emails: 'Boîte mail',
  entreprise: 'Entreprise',
  'entreprise-danger': 'Entreprise (zone sensible)',
  equipe: 'Équipe',
  facturation: 'Abonnement',
  fiduciaire: 'Fiduciaire',
  integrations: 'Intégrations',
  modules: 'Modules',
  notifications: 'Notifications',
  profil: 'Profil',
  rh: 'RH',
  stockage: 'Stockage',
  depenses: 'Dépenses',
  factures: 'Factures',
  'import-releve': 'Import de relevé',
  paiements: 'Paiements',
  'regles-bancaires': 'Règles bancaires',
  inventaire: 'Inventaire',
  trames: 'Modèles de devis',
  reglages: 'Réglages',
  installer: 'Installer l’app',
  planning: 'Planning',
  absences: 'Absences',
  corrections: 'Corrections',
  declarations: 'Déclarations',
  'fiches-salaire': 'Fiches de salaire',
  'mes-fiches': 'Mes fiches',
  salaires: 'Salaires',
  employes: 'Employés',
  'sous-traitants': 'Sous-traitants',
  taches: 'Tâches',
  'transfer-ownership': 'Transfert de propriété',
  tresorerie: 'Trésorerie',
  new: 'Nouveau',
};

// "chantiers.id.gantt" → "Chantiers › Planning de chantier",
// "devis.id" → "Devis › Fiche".
export function orgAreaLabel(area: string): string {
  const parts = area.split('.');
  const out: string[] = [];
  parts.forEach((p, i) => {
    if (p === 'id') {
      if (i === parts.length - 1) out.push('Fiche');
      return;
    }
    out.push(WORDS[p] ?? p);
  });
  return out.join(' › ') || area;
}

const ROLE: Record<string, string> = { owner: 'Propriétaire', admin: 'Admin', member: 'Membre' };

export function OrgUsagePanel({ usage }: { usage: UsageData }) {
  return (
    <UsagePanel
      usage={usage}
      labels={{
        feature: (key) => key,
        area: orgAreaLabel,
        action: (key, label, count) => `${label ?? key} · ${count && count > 1 ? `${count} ajoutés` : 'ajout'}`,
        role: (role) => ROLE[role] ?? role,
        flags: ['logo', 'couleur'],
      }}
    />
  );
}
