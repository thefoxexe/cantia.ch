// Secteur d'activité, then the trades inside it (several allowed). Cantia is
// for any small company (quotes, invoices, hours…); the building sector
// additionally gets the site tools: « Remplir une soumission » and the
// construction schedule (Gantt).
//
// organization.trade stores the sector's French label verbatim (no id
// column), organization.trade_specialties the trade keys below. Labels are
// translated through "sectors.<key>" and "specialties.<key>".

export interface Sector {
  key: string;
  label: string; // stored value
  specialties: string[];
}

export const SECTORS: Sector[] = [
  {
    key: 'construction',
    label: 'Construction & bâtiment',
    specialties: [
      'entrepriseGenerale', 'genieCivil', 'maconnerie', 'betonArme', 'terrassement', 'demolition', 'echafaudages',
      'charpente', 'ferblanterie', 'facades', 'isolation', 'menuiserie', 'platreriePeinture', 'carrelage', 'sols', 'chape',
      'agencement', 'vitrerie', 'electricite', 'sanitaire', 'chauffage', 'ventilation', 'serrurerie', 'domotique',
      'amenagements', 'jardinage', 'clotures', 'piscines', 'architecture', 'ingenierie', 'geometre', 'immobilier',
    ],
  },
  { key: 'informatique', label: 'Informatique & numérique', specialties: ['developpement', 'siteWeb', 'supportIt', 'cybersecurite', 'conseilIt', 'telecom'] },
  { key: 'finance', label: 'Finance, comptabilité & assurances', specialties: ['fiduciaire', 'comptabilite', 'assurance', 'conseilFinancier', 'gestionPatrimoine'] },
  { key: 'conseil', label: 'Conseil & services aux entreprises', specialties: ['conseilGestion', 'marketing', 'ressourcesHumaines', 'juridique', 'traduction', 'secretariat'] },
  { key: 'commerce', label: 'Commerce & vente', specialties: ['commerceDetail', 'commerceGros', 'eCommerce', 'importExport'] },
  { key: 'industrie', label: 'Industrie & fabrication', specialties: ['mecanique', 'constructionMetallique', 'electronique', 'imprimerie', 'alimentaire', 'plasturgie'] },
  { key: 'artisanat', label: 'Artisanat', specialties: ['ebenisterie', 'horlogerie', 'bijouterie', 'couture', 'cordonnerie', 'boulangerie'] },
  { key: 'transport', label: 'Transport & logistique', specialties: ['transportMarchandises', 'demenagement', 'taxi', 'coursier', 'logistique'] },
  { key: 'automobile', label: 'Automobile & mécanique', specialties: ['garage', 'carrosserie', 'pneus', 'motos'] },
  { key: 'sante', label: 'Santé & bien-être', specialties: ['physiotherapie', 'cabinetMedical', 'therapies', 'fitness', 'veterinaire'] },
  { key: 'beaute', label: 'Beauté & coiffure', specialties: ['coiffure', 'esthetique', 'onglerie', 'massage'] },
  { key: 'hotellerie', label: 'Hôtellerie, restauration & événementiel', specialties: ['restaurant', 'hotel', 'traiteur', 'evenementiel'] },
  { key: 'nettoyage', label: 'Nettoyage & facility management', specialties: ['nettoyageBatiments', 'conciergerie', 'entretienEspacesVerts', 'deneigement'] },
  { key: 'medias', label: 'Création, médias & audiovisuel', specialties: ['photographie', 'video', 'drone', 'graphisme', 'communication'] },
  { key: 'formation', label: 'Formation & enseignement', specialties: ['formationPro', 'coursPrives', 'autoEcole'] },
  { key: 'agriculture', label: 'Agriculture, viticulture & forêt', specialties: ['agriculture', 'viticulture', 'sylviculture'] },
  { key: 'autre', label: 'Autre', specialties: [] },
];

export const CONSTRUCTION_SECTOR = 'Construction & bâtiment';

// Values stored before the sector list (first trade-level list, then the
// building sub-sectors): all building, shown as « Construction & bâtiment ».
const LEGACY_BUILDING = [
  'Construction & gros œuvre', 'Second œuvre & finitions', 'Technique du bâtiment', 'Architecture & ingénierie', 'Paysagisme & extérieurs', 'Immobilier & gérance',
  'Génie civil', 'Maçonnerie', 'Serrurerie', 'Électricité', 'Plomberie / Sanitaire', 'Menuiserie / Charpente', 'Peinture', 'Carrelage', 'Chauffage / Ventilation', 'Paysagisme',
];

export function sectorOf(trade: string | null | undefined): Sector | null {
  if (!trade) return null;
  if (LEGACY_BUILDING.includes(trade)) return SECTORS[0];
  return SECTORS.find((s) => s.label === trade) ?? (trade === 'Services & conseil' ? SECTORS.find((s) => s.key === 'conseil')! : trade === 'Nettoyage & entretien' ? SECTORS.find((s) => s.key === 'nettoyage')! : trade === 'Artisanat & fabrication' ? SECTORS.find((s) => s.key === 'artisanat')! : null);
}

export function isBuildingTrade(trade: string | null | undefined): boolean {
  return sectorOf(trade)?.key === 'construction';
}

// The site tools (soumissions, construction schedule) are on, and
// compulsory, for every building company. Same rule in SQL:
// public.org_fills_soumissions().
export function fillsSoumissions(org: { trade: string | null } | null | undefined): boolean {
  return !!org && isBuildingTrade(org.trade);
}
