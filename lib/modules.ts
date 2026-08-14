export type ModuleKey = 'documents' | 'photos' | 'devis' | 'survey' | 'metre' | 'planning' | 'profitability' | 'subcontractors';

export const TOGGLEABLE_MODULES: { key: ModuleKey; label: string; description: string }[] = [
  { key: 'documents', label: 'Documents', description: 'Classeur de dossiers et fichiers par chantier.' },
  { key: 'photos', label: 'Photos', description: 'Galerie photo filtrable par chantier.' },
  { key: 'devis', label: 'Devis', description: 'Création de devis et suivi de statut.' },
  { key: 'survey', label: 'Levés', description: 'Points de chantier, cadastre suisse, export (plans payants).' },
  { key: 'metre', label: 'Métré', description: 'Tableau de quantités poste par poste.' },
  { key: 'planning', label: 'Planning', description: "Qui va sur quel chantier, et quand." },
  {
    key: 'subcontractors',
    label: 'Sous-traitants',
    description: 'Entreprises sous-traitées par chantier : interventions, statut, attestations d’assurance.',
  },
  {
    key: 'profitability',
    label: 'Rentabilité',
    description: 'Compare le devis accepté au coût réel (matériel + main d’œuvre) pour savoir si un chantier est rentable.',
  },
];

export function isModuleEnabled(enabledModules: string[] | undefined, key: ModuleKey): boolean {
  return (enabledModules ?? []).includes(key);
}
