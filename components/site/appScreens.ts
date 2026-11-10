import type { ImageSourcePropType } from 'react-native';
import type { SiteLocale } from '../../lib/site/copy';

// Real screens of the app, one per feature, as they look with the sample
// company (Atelier Martin SA): rendered at 1440×900 from the app itself with
// sample data in place of the database, in each language. Shown in the
// laptop (components/site/Laptop). Never swap them for mock-ups.
export type ScreenKind = 'devis' | 'facturation' | 'rapports-chantier' | 'planning' | 'rentabilite' | 'rh-salaires' | 'travaux-supplementaires' | 'soumissions' | 'tresorerie' | 'chantier';

export const APP_SCREENS: Record<SiteLocale, Record<ScreenKind, ImageSourcePropType>> = {
  fr: {
    'devis': require('../../assets/marketing/screens/devis.jpg'),
    'facturation': require('../../assets/marketing/screens/facturation.jpg'),
    'rapports-chantier': require('../../assets/marketing/screens/rapports-chantier.jpg'),
    'planning': require('../../assets/marketing/screens/planning.jpg'),
    'rentabilite': require('../../assets/marketing/screens/rentabilite.jpg'),
    'rh-salaires': require('../../assets/marketing/screens/rh-salaires.jpg'),
    'travaux-supplementaires': require('../../assets/marketing/screens/travaux-supplementaires.jpg'),
    'soumissions': require('../../assets/marketing/screens/soumissions.jpg'),
    'tresorerie': require('../../assets/marketing/screens/tresorerie.jpg'),
    'chantier': require('../../assets/marketing/screens/chantier.jpg'),
  },
  de: {
    'devis': require('../../assets/marketing/screens/devis-de.jpg'),
    'facturation': require('../../assets/marketing/screens/facturation-de.jpg'),
    'rapports-chantier': require('../../assets/marketing/screens/rapports-chantier-de.jpg'),
    'planning': require('../../assets/marketing/screens/planning-de.jpg'),
    'rentabilite': require('../../assets/marketing/screens/rentabilite-de.jpg'),
    'rh-salaires': require('../../assets/marketing/screens/rh-salaires-de.jpg'),
    'travaux-supplementaires': require('../../assets/marketing/screens/travaux-supplementaires-de.jpg'),
    'soumissions': require('../../assets/marketing/screens/soumissions-de.jpg'),
    'tresorerie': require('../../assets/marketing/screens/tresorerie-de.jpg'),
    'chantier': require('../../assets/marketing/screens/chantier-de.jpg'),
  },
  it: {
    'devis': require('../../assets/marketing/screens/devis-it.jpg'),
    'facturation': require('../../assets/marketing/screens/facturation-it.jpg'),
    'rapports-chantier': require('../../assets/marketing/screens/rapports-chantier-it.jpg'),
    'planning': require('../../assets/marketing/screens/planning-it.jpg'),
    'rentabilite': require('../../assets/marketing/screens/rentabilite-it.jpg'),
    'rh-salaires': require('../../assets/marketing/screens/rh-salaires-it.jpg'),
    'travaux-supplementaires': require('../../assets/marketing/screens/travaux-supplementaires-it.jpg'),
    'soumissions': require('../../assets/marketing/screens/soumissions-it.jpg'),
    'tresorerie': require('../../assets/marketing/screens/tresorerie-it.jpg'),
    'chantier': require('../../assets/marketing/screens/chantier-it.jpg'),
  },
};

// Recording of the voice assistant (open, dictate, quote proposed), per language.
export const VOICE_RECORDING: Record<SiteLocale, string> = { fr: '/videos/assistant-desktop', de: '/videos/assistant-desktop-de', it: '/videos/assistant-desktop-it' };
