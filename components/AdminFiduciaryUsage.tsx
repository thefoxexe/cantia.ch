import type { FirmUsage } from '../lib/accounting/api';
import { UsagePanel } from './AdminUsagePanel';

export { freshnessColor, relativeTime } from './AdminUsagePanel';

// Super Admin › Fiduciaires: what a firm uses on accounting.cantia.ch.
// Internal tool: French only.

const FEATURE_LABEL: Record<string, string> = {
  clients_cantia: 'Mandants Cantia',
  clients_external: 'Mandants hors Cantia',
  invitations: 'Invitations de clients',
  requests: 'Demandes de documents',
  files_received: 'Fichiers reçus des clients',
  shared_documents: 'Documents envoyés par les clients',
  approvals: 'Validations et signatures',
  proposals: 'Écritures proposées',
  time: 'Saisie du temps',
  work: 'Travaux par mandat',
  templates: 'Modèles de processus',
  deadlines: 'Échéances suivies',
  notes: 'Notes internes',
  ledger_entries: 'Écritures (compta hors Cantia)',
  ledger_accounts: 'Plan comptable (hors Cantia)',
  vat_returns: 'Décomptes TVA',
  closings: 'Bouclements annuels',
  team: 'Équipe',
  branding: 'Logo et couleur du cabinet',
  directory: 'Visible dans l’annuaire',
};

const SPACE: Record<string, string> = {
  overview: 'Accueil',
  clients: 'Mandants',
  work: 'Travaux',
  requests: 'Demandes',
  deadlines: 'Échéances',
  approvals: 'Validations',
  time: 'Temps',
  documents: 'Documents',
  team: 'Équipe',
  partner: 'Partenariat',
  settings: 'Réglages',
};

const CLIENT: Record<string, string> = {
  overview: 'Aperçu',
  work: 'Travaux',
  requests: 'Demandes',
  deadlines: 'Échéances',
  approvals: 'Validations',
  time: 'Temps',
  invoices: 'Factures',
  payments: 'Paiements',
  customers: 'Clients du mandant',
  accounting: 'Comptabilité',
  proposals: 'Écritures proposées',
  documents: 'Documents',
  quotes: 'Devis',
  hours: 'Heures',
  payroll: 'Salaires',
  integrations: 'Intégrations',
  notes: 'Notes',
  ledger: 'Comptabilité',
  settings: 'Réglages',
};

const LEDGER: Record<string, string> = {
  journal: 'Journal',
  accounts: 'Plan comptable',
  reports: 'États financiers',
  vat: 'TVA',
  closing: 'Bouclement',
  kpis: 'Indicateurs',
  import: 'Import',
  settings: 'Réglages',
};

const EXPORT: Record<string, string> = {
  banana: 'Banana',
  abacus: 'Abacus',
  winbiz: 'Winbiz',
  'banana-balances': 'Banana (soldes)',
  'abacus-balances': 'Abacus (soldes)',
  'winbiz-balances': 'Winbiz (soldes)',
  'ledger-account': 'Grand livre d’un compte (CSV)',
  balance: 'Balance (CSV)',
  'balance-csv': 'Balance (CSV)',
  'entries-csv': 'Écritures (CSV)',
  'vat-xml': 'TVA eCH-0217 (XML)',
  'vat-csv': 'Décompte TVA (CSV)',
  'annual-accounts': 'Comptes annuels',
  'time-csv': 'Temps (CSV)',
};

const ACTION: Record<string, string> = {
  firm_created: 'Cabinet créé',
  client_invited: 'Client invité',
  new_client_joined: 'Nouveau client inscrit par invitation',
  external_client_created: 'Mandant hors Cantia créé',
  external_client_updated: 'Mandant hors Cantia modifié',
  external_client_new_link: 'Nouveau lien de dépôt généré',
  request_created: 'Demande de documents envoyée',
  request_answered: 'Demande répondue par le client',
  request_done: 'Demande terminée',
  request_open: 'Demande rouverte',
  request_cancelled: 'Demande annulée',
  request_remind: 'Relance envoyée',
};

export function areaLabel(area: string): string {
  const [kind, rest = ''] = area.split(':');
  if (kind === 'space') return `Espace › ${SPACE[rest] ?? rest}`;
  if (kind === 'client') return `Mandant Cantia › ${CLIENT[rest] ?? rest}`;
  if (kind === 'external') return `Mandant hors Cantia › ${CLIENT[rest] ?? rest}`;
  if (kind === 'ledger') return `Compta hors Cantia › ${LEDGER[rest] ?? rest}`;
  if (kind === 'export') return `Export › ${EXPORT[rest] ?? rest}`;
  if (area === 'clients:portfolio') return 'Mandants › Vue portefeuille';
  if (area === 'document:open') return 'Document ouvert';
  return area;
}

function actionLabel(key: string): string {
  return ACTION[key] ?? key.replace(/_/g, ' ');
}

const ROLE: Record<string, string> = { OWNER: 'Propriétaire', ADMIN: 'Admin', MEMBER: 'Collaborateur' };

export function FiduciaryUsagePanel({ usage }: { usage: FirmUsage }) {
  return (
    <UsagePanel
      usage={usage}
      labels={{
        feature: (key) => FEATURE_LABEL[key] ?? key,
        area: areaLabel,
        action: (key) => actionLabel(key),
        role: (role) => ROLE[role] ?? role,
        flags: ['branding', 'directory'],
        unknownActor: 'client',
      }}
    />
  );
}
