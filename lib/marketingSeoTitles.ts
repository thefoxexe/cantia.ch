import type { AppLocale } from './translations';

// The document <title> for the marketing site's non-templated static pages
// (homepage + the handful of standalone pages that aren't driven by a
// shared data-backed template like TradePage/SolutionPage/BlogArticle,
// which derive their own title from their own content). Copied verbatim
// from scripts/seo-routes.mjs's ROUTES array — that file is the real source
// of truth (it also drives the static build's baked-in <title>), but it's a
// Node-only script outside the app bundle, so these few strings are
// duplicated here rather than threading a whole second data pipeline
// through the app for nine pages. Used by components/MarketingHead to
// replace the empty <title> Expo Router's head management otherwise leaves
// after hydration — see MarketingHead.tsx for why that's needed at all.
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
    fr: 'Télécharger Cantia | App mobile & web',
    de: 'Cantia herunterladen | Mobile & Web-App',
    it: 'Scaricare Cantia | App mobile & web',
  },
  integrations: {
    fr: 'Intégrations | Cantia',
    de: 'Integrationen | Cantia',
    it: 'Integrazioni | Cantia',
  },
};

export type MarketingPageKey = keyof typeof TITLES;

export function marketingPageTitle(page: MarketingPageKey, locale: AppLocale): string {
  return TITLES[page][locale];
}
