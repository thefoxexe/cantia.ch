export type ModuleKey = 'documents' | 'photos' | 'devis' | 'survey' | 'metre';

export const TOGGLEABLE_MODULES: { key: ModuleKey; label: string; description: string }[] = [
  { key: 'documents', label: 'Documents', description: 'Classeur de dossiers et fichiers par chantier.' },
  { key: 'photos', label: 'Photos', description: 'Galerie photo filtrable par chantier.' },
  { key: 'devis', label: 'Devis', description: 'Création de devis et suivi de statut.' },
  { key: 'survey', label: 'Levés', description: 'Points de chantier, cadastre suisse, export (plans payants).' },
  { key: 'metre', label: 'Métré', description: 'Tableau de quantités poste par poste.' },
];

export function isModuleEnabled(enabledModules: string[] | undefined, key: ModuleKey): boolean {
  return (enabledModules ?? []).includes(key);
}
