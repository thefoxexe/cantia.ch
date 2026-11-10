import type { ImageSourcePropType } from 'react-native';
import type { SiteLocale } from '../../lib/site/copy';

// Real documents produced by Cantia's own renderers (supabase/functions/
// _shared/pdf-document-renderers.ts, generate-report-pdf, lib/schedule/pdf.ts)
// with sample data: Atelier Martin SA, Villa des Vignes, M. et Mme Dubois.
// One set per language, in the language of the page. The PDFs themselves are
// served from public/exemples. Never swap these for mock-ups or screenshots
// carrying the old logo. The app screens (app-*.jpg) are the real Cantia
// interface, rendered locally with sample data in place of the database.

export type ExportDoc = { source: ImageSourcePropType; ratio: number; pdf: string };
export type Shot = { source: ImageSourcePropType; ratio: number };
type Set = { app: { dash: Shot; dashMobile: Shot; tres: Shot; tresMobile: Shot; bexio: Shot }; devis: ExportDoc; devisFull: ExportDoc; facture: ExportDoc; slip: ExportDoc; rapport: ExportDoc; planning: ExportDoc };

export const EXPORTS: Record<SiteLocale, Set> = {
  fr: {
    app: {
      bexio: { source: require('../../assets/marketing/site/app-bexio.jpg'), ratio: 1470 / 1920 },
      dash: { source: require('../../assets/marketing/site/app-tableau-de-bord.jpg'), ratio: 1000 / 1600 },
      dashMobile: { source: require('../../assets/marketing/site/app-tableau-de-bord-mobile.jpg'), ratio: 1688 / 780 },
      tres: { source: require('../../assets/marketing/site/app-tresorerie.jpg'), ratio: 1000 / 1600 },
      tresMobile: { source: require('../../assets/marketing/site/app-tresorerie-mobile.jpg'), ratio: 1688 / 780 },
    },
    devis: { source: require('../../assets/marketing/site/devis-signe.jpg'), ratio: 1221 / 1200, pdf: '/exemples/devis-signe-cantia.pdf' },
    // The whole signed quote, full A4 page.
    devisFull: { source: require('../../assets/marketing/site/devis-complet.jpg'), ratio: 1697 / 1200, pdf: '/exemples/devis-signe-cantia.pdf' },
    facture: { source: require('../../assets/marketing/site/facture-qr.jpg'), ratio: 1696 / 1200, pdf: '/exemples/facture-qr-cantia.pdf' },
    slip: { source: require('../../assets/marketing/site/facture-qr-section.jpg'), ratio: 713 / 1400, pdf: '/exemples/facture-qr-cantia.pdf' },
    rapport: { source: require('../../assets/marketing/site/rapport-chantier.jpg'), ratio: 1247 / 1200, pdf: '/exemples/rapport-chantier-cantia.pdf' },
    planning: { source: require('../../assets/marketing/site/planning-chantier.jpg'), ratio: 501 / 2000, pdf: '/exemples/planning-chantier-cantia.pdf' },
  },
  de: {
    app: {
      bexio: { source: require('../../assets/marketing/site/app-bexio-de.jpg'), ratio: 1470 / 1920 },
      dash: { source: require('../../assets/marketing/site/app-tableau-de-bord-de.jpg'), ratio: 1000 / 1600 },
      dashMobile: { source: require('../../assets/marketing/site/app-tableau-de-bord-mobile-de.jpg'), ratio: 1688 / 780 },
      tres: { source: require('../../assets/marketing/site/app-tresorerie-de.jpg'), ratio: 1000 / 1600 },
      tresMobile: { source: require('../../assets/marketing/site/app-tresorerie-mobile-de.jpg'), ratio: 1688 / 780 },
    },
    devis: { source: require('../../assets/marketing/site/devis-signe-de.jpg'), ratio: 1187 / 1200, pdf: '/exemples/devis-signe-cantia-de.pdf' },
    // The whole signed quote, full A4 page.
    devisFull: { source: require('../../assets/marketing/site/devis-complet-de.jpg'), ratio: 1697 / 1200, pdf: '/exemples/devis-signe-cantia-de.pdf' },
    facture: { source: require('../../assets/marketing/site/facture-qr-de.jpg'), ratio: 1696 / 1200, pdf: '/exemples/facture-qr-cantia-de.pdf' },
    slip: { source: require('../../assets/marketing/site/facture-qr-section-de.jpg'), ratio: 701 / 1400, pdf: '/exemples/facture-qr-cantia-de.pdf' },
    rapport: { source: require('../../assets/marketing/site/rapport-chantier-de.jpg'), ratio: 1247 / 1200, pdf: '/exemples/rapport-chantier-cantia-de.pdf' },
    planning: { source: require('../../assets/marketing/site/planning-chantier-de.jpg'), ratio: 501 / 2000, pdf: '/exemples/planning-chantier-cantia-de.pdf' },
  },
  it: {
    app: {
      bexio: { source: require('../../assets/marketing/site/app-bexio-it.jpg'), ratio: 1470 / 1920 },
      dash: { source: require('../../assets/marketing/site/app-tableau-de-bord-it.jpg'), ratio: 1000 / 1600 },
      dashMobile: { source: require('../../assets/marketing/site/app-tableau-de-bord-mobile-it.jpg'), ratio: 1688 / 780 },
      tres: { source: require('../../assets/marketing/site/app-tresorerie-it.jpg'), ratio: 1000 / 1600 },
      tresMobile: { source: require('../../assets/marketing/site/app-tresorerie-mobile-it.jpg'), ratio: 1688 / 780 },
    },
    devis: { source: require('../../assets/marketing/site/devis-signe-it.jpg'), ratio: 1187 / 1200, pdf: '/exemples/devis-signe-cantia-it.pdf' },
    // The whole signed quote, full A4 page.
    devisFull: { source: require('../../assets/marketing/site/devis-complet-it.jpg'), ratio: 1697 / 1200, pdf: '/exemples/devis-signe-cantia-it.pdf' },
    facture: { source: require('../../assets/marketing/site/facture-qr-it.jpg'), ratio: 1696 / 1200, pdf: '/exemples/facture-qr-cantia-it.pdf' },
    slip: { source: require('../../assets/marketing/site/facture-qr-section-it.jpg'), ratio: 701 / 1400, pdf: '/exemples/facture-qr-cantia-it.pdf' },
    rapport: { source: require('../../assets/marketing/site/rapport-chantier-it.jpg'), ratio: 1247 / 1200, pdf: '/exemples/rapport-chantier-cantia-it.pdf' },
    planning: { source: require('../../assets/marketing/site/planning-chantier-it.jpg'), ratio: 501 / 2000, pdf: '/exemples/planning-chantier-cantia-it.pdf' },
  },
};
