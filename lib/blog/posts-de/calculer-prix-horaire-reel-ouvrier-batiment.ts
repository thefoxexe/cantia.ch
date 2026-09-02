import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-horaire-reel-ouvrier-batiment',
  question: 'Wie berechnet man die wahren Stundenkosten eines Bauarbeiters, jenseits seines Bruttolohns?',
  title: 'Die wahren Stundenkosten eines Bauarbeiters: weit mehr als sein Bruttolohn',
  description:
    'Eine Offerte, die allein auf dem Bruttolohn eines Arbeiters basiert, unterschätzt systematisch die wahren Stundenkosten: Sozialabgaben, bezahlte Absenzen und nicht fakturierbare Zeit müssen mitgerechnet werden.',
  excerpt:
    'Viele Unternehmen kalkulieren ihre Offerten mit einem ungefähren, aus jahrelanger Praxis übernommenen Stundensatz, ohne je neu zu berechnen, was ein Arbeiter tatsächlich kostet, wenn man alle Abgaben einbezieht.',
  category: 'Chantier & rentabilité',
  keywords: ['stundenkosten bauarbeiter berechnen', 'stundensatz bau berechnung', 'sozialabgaben baubranche', 'rentabilität baustelle', 'offerte kalkulation bau'],
  publishedAt: '2026-07-28',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Eine Offerte, die allein auf dem Bruttolohn eines Arbeiters basiert, unterschätzt fast immer die wahren Stundenkosten des Unternehmens. Zwischen den Arbeitgeber-Sozialabgaben, den bezahlten Absenzen und der tatsächlich fakturierbaren Arbeitszeit im Jahr übersteigt die Differenz zwischen dem ausgewiesenen Lohn und den tatsächlich vom Unternehmen getragenen Kosten oft 40 %.',
    },
    { type: 'h2', text: 'Die Bestandteile der wahren Stundenkosten' },
    {
      type: 'list',
      items: [
        'Jahresbruttolohn, einschliesslich 13. Monatslohn',
        'Arbeitgeber-Sozialabgaben (AHV/IV/EO, BVG, UVG, Familienzulagen), in der Regel 15 bis 20 % des Bruttolohns',
        'Bezahlte Ferien und Feiertage, die die Zahl der tatsächlich geleisteten Stunden reduzieren, nicht aber die jährliche Lohnsumme',
        'Nicht fakturierbare Zeit: interne Fahrten, Materialpflege, Weiterbildung, bezahlte Schlechtwettertage',
      ],
    },
    {
      type: 'stat',
      value: '~1750 h',
      label: 'durchschnittlich tatsächlich fakturierbare Stunden pro Jahr und Arbeiter, nach Abzug von Ferien, Absenzen und nicht produktiver Zeit von einem theoretischen Vollzeitpensum',
    },
    { type: 'h2', text: 'Die Grundformel' },
    {
      type: 'p',
      text: 'Wahre Stundenkosten = (Jahresbruttolohn + Arbeitgeber-Sozialabgaben) ÷ tatsächlich fakturierbare Jahresstunden. Die klassische Falle besteht darin, die Jahreskosten durch die theoretisch vertraglichen Stunden zu teilen (zum Beispiel 2080 Stunden für ein Vollzeitpensum), ohne Absenzen und nicht produktive Zeit abzuziehen; dieser Fehler unterschätzt systematisch den tatsächlichen Stundensatz.',
    },
    {
      type: 'callout',
      title: 'Ein unterbewerteter Stundensatz frisst die Marge auf jeder Baustelle auf, ohne dass es je auffällt',
      text: 'Oft merkt ein Unternehmen erst beim Vergleich zwischen Devisiertem und tatsächlich aufgewendeten Kosten, Baustelle für Baustelle, dass sein Referenz-Stundensatz seit Jahren zu tief angesetzt war.',
    },
    {
      type: 'cta',
      title: 'Devisiertes und tatsächliches vergleichen, Baustelle für Baustelle',
      text: 'Das Rentabilitätsmodul von Cantia stellt automatisch das Devisierte den tatsächlich aufgewendeten Stunden und Kosten jeder Baustelle gegenüber. So sehen Sie am besten, ob Ihr Stundensatz realistisch ist.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Müssen die Sozialabgaben in die Berechnung der Stundenkosten einbezogen werden?',
      answer:
        'Ja, sie machen in der Regel 15 bis 20 % des Bruttolohns aus und müssen zwingend einbezogen werden, sonst werden die tatsächlichen Stundenkosten stark unterschätzt.',
    },
    {
      question: 'Wie viele Stunden arbeitet ein Arbeiter tatsächlich pro Jahr, ohne Absenzen?',
      answer:
        'Im Schnitt rund 1750 fakturierbare Stunden, nach Abzug von Ferien, Feiertagen und nicht produktiver Zeit von einem theoretischen Vollzeitpensum von rund 2080 Stunden.',
    },
    {
      question: 'Warum ist der Referenz-Stundensatz eines Unternehmens oft zu tief?',
      answer:
        'Weil er aus einer alten, nie neu berechneten Praxis übernommen wurde, statt aus einer expliziten Berechnung, die Sozialabgaben und tatsächlich fakturierbare Stunden einbezieht.',
    },
  ],
  relatedSlugs: [
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
  ],
};
