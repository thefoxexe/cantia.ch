import type { AppLocale } from './translations';

const TITLES: Record<string, Record<AppLocale, string>> = {
  home: {
    fr: 'Logiciel de gestion de chantier en Suisse | Cantia',
    de: 'Software für Baustellenverwaltung in der Schweiz | Cantia',
    it: 'Software di gestione cantieri in Svizzera | Cantia',
  },
  contact: {
    fr: 'Contact | Cantia',
    de: 'Kontakt | Cantia',
    it: 'Contatto | Cantia',
  },
  mentionsLegales: {
    fr: 'Mentions légales | Cantia',
    de: 'Impressum | Cantia',
    it: 'Note legali | Cantia',
  },
  confidentialite: {
    fr: 'Politique de confidentialité | Cantia',
    de: 'Datenschutzerklärung | Cantia',
    it: 'Informativa sulla privacy | Cantia',
  },
  conditionsGenerales: {
    fr: 'Conditions générales | Cantia',
    de: 'AGB | Cantia',
    it: 'Condizioni generali | Cantia',
  },
  aide: {
    fr: "Centre d'aide | Cantia",
    de: 'Hilfe-Center | Cantia',
    it: 'Centro assistenza | Cantia',
  },
  metiers: {
    fr: 'Cantia pour votre métier | Logiciel de gestion par métier',
    de: 'Cantia für Ihr Gewerbe | Verwaltungssoftware nach Beruf',
    it: 'Cantia per il Suo mestiere | Software di gestione per mestiere',
  },
  surMesure: {
    fr: 'Développement sur mesure | Cantia',
    de: 'Massgeschneiderte Entwicklung | Cantia',
    it: 'Sviluppo su misura | Cantia',
  },
  telechargement: {
    fr: "Ajouter Cantia à l'écran d'accueil | App web mobile",
    de: 'Cantia-Verknüpfung zum Startbildschirm hinzufügen | Web-App',
    it: 'Aggiungere Cantia alla schermata Home | App web mobile',
  },
  integrations: {
    fr: 'Intégrations | Cantia',
    de: 'Integrationen | Cantia',
    it: 'Integrazioni | Cantia',
  },
  tarifs: {
    fr: 'Tarifs | Cantia',
    de: 'Preise | Cantia',
    it: 'Prezzi | Cantia',
  },
};

export type MarketingPageKey = keyof typeof TITLES;

export function marketingPageTitle(page: MarketingPageKey, locale: AppLocale): string {
  return TITLES[page][locale];
}
