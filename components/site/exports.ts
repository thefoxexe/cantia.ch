import type { ImageSourcePropType } from 'react-native';
import type { SiteLocale } from '../../lib/site/copy';

// Real documents produced by Cantia's own renderers (supabase/functions/
// _shared/pdf-document-renderers.ts, generate-report-pdf, lib/schedule/pdf.ts)
// with sample data: Atelier Martin SA, Villa des Vignes, M. et Mme Dubois.
// One set per language, in the language of the page. The PDFs themselves are
// served from public/exemples. Never swap these for mock-ups or screenshots
// carrying the old logo.

export type ExportDoc = { source: ImageSourcePropType; ratio: number; pdf: string };
type Set = { devis: ExportDoc; facture: ExportDoc; slip: ExportDoc; rapport: ExportDoc; planning: ExportDoc; signatureCrop: { x: number; y: number; w: number; h: number } };

export const EXPORTS: Record<SiteLocale, Set> = {
  fr: {
    devis: { source: require('../../assets/marketing/site/devis-signe.jpg'), ratio: 1221 / 1200, pdf: '/exemples/devis-signe-cantia.pdf' },
    facture: { source: require('../../assets/marketing/site/facture-qr.jpg'), ratio: 1696 / 1200, pdf: '/exemples/facture-qr-cantia.pdf' },
    slip: { source: require('../../assets/marketing/site/facture-qr-section.jpg'), ratio: 713 / 1400, pdf: '/exemples/facture-qr-cantia.pdf' },
    rapport: { source: require('../../assets/marketing/site/rapport-chantier.jpg'), ratio: 1247 / 1200, pdf: '/exemples/rapport-chantier-cantia.pdf' },
    planning: { source: require('../../assets/marketing/site/planning-chantier.jpg'), ratio: 501 / 2000, pdf: '/exemples/planning-chantier-cantia.pdf' },
    signatureCrop: { x: 800, y: 975, w: 360, h: 185 },
  },
  de: {
    devis: { source: require('../../assets/marketing/site/devis-signe-de.jpg'), ratio: 1187 / 1200, pdf: '/exemples/devis-signe-cantia-de.pdf' },
    facture: { source: require('../../assets/marketing/site/facture-qr-de.jpg'), ratio: 1696 / 1200, pdf: '/exemples/facture-qr-cantia-de.pdf' },
    slip: { source: require('../../assets/marketing/site/facture-qr-section-de.jpg'), ratio: 701 / 1400, pdf: '/exemples/facture-qr-cantia-de.pdf' },
    rapport: { source: require('../../assets/marketing/site/rapport-chantier-de.jpg'), ratio: 1247 / 1200, pdf: '/exemples/rapport-chantier-cantia-de.pdf' },
    planning: { source: require('../../assets/marketing/site/planning-chantier-de.jpg'), ratio: 501 / 2000, pdf: '/exemples/planning-chantier-cantia-de.pdf' },
    signatureCrop: { x: 800, y: 1001, w: 360, h: 185 },
  },
  it: {
    devis: { source: require('../../assets/marketing/site/devis-signe-it.jpg'), ratio: 1187 / 1200, pdf: '/exemples/devis-signe-cantia-it.pdf' },
    facture: { source: require('../../assets/marketing/site/facture-qr-it.jpg'), ratio: 1696 / 1200, pdf: '/exemples/facture-qr-cantia-it.pdf' },
    slip: { source: require('../../assets/marketing/site/facture-qr-section-it.jpg'), ratio: 701 / 1400, pdf: '/exemples/facture-qr-cantia-it.pdf' },
    rapport: { source: require('../../assets/marketing/site/rapport-chantier-it.jpg'), ratio: 1247 / 1200, pdf: '/exemples/rapport-chantier-cantia-it.pdf' },
    planning: { source: require('../../assets/marketing/site/planning-chantier-it.jpg'), ratio: 501 / 2000, pdf: '/exemples/planning-chantier-cantia-it.pdf' },
    signatureCrop: { x: 800, y: 975, w: 360, h: 185 },
  },
};
