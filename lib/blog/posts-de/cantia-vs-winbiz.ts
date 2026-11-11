import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cantia-vs-winbiz',
  question: 'Cantia oder Winbiz: Welche Software für einen Handwerksbetrieb im Bau?',
  title: 'Cantia vs. Winbiz: Vergleich für Handwerksbetriebe im Bau',
  description:
    'Winbiz ist eine etablierte Schweizer Software für Buchhaltung, Fakturierung und Verwaltung, ursprünglich für den festen Arbeitsplatz gedacht. Cantia ist mobil, für die Baustelle gemacht. Ein sachlicher Vergleich der beiden Ansätze.',
  excerpt:
    'Winbiz wird seit Langem von vielen Westschweizer KMU genutzt. Doch ein Handwerker, der seine Tage auf der Baustelle verbringt, hat andere Bedürfnisse als ein Büro-KMU.',
  category: 'Comparatifs & outils',
  keywords: ['Winbiz', 'Winbiz Alternative Bau', 'Winbiz vs Cantia', 'Handwerkersoftware Schweiz'],
  publishedAt: '2026-09-22',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Winbiz ist in der Westschweiz ein bekannter Name, seit Langem von vielen KMU für Buchhaltung, Fakturierung und kaufmännische Verwaltung genutzt. Es ist ein etabliertes Werkzeug, ursprünglich für die Arbeit an einem festen Arbeitsplatz im Büro gedacht. Für einen Handwerker, der vor allem vor Ort arbeitet, verändert diese Grundausrichtung im Alltag vieles.',
    },
    { type: 'h2', text: 'Was Winbiz gut macht' },
    {
      type: 'p',
      text: 'Vollständige Buchhaltung, Fakturierung, Lager und Einkauf: Winbiz deckt ein breites Spektrum an Verwaltungsbedürfnissen eines Schweizer KMU ab, mit einer über Jahre bewährten Zuverlässigkeit.',
    },
    { type: 'h2', text: 'Was für die mobile Arbeit auf der Baustelle fehlt' },
    {
      type: 'p',
      text: 'Winbiz wurde ursprünglich nicht für die mobile Nutzung auf der Baustelle gedacht: keine diktierte Offerte zwischen zwei Terminen, kein Baustellenrapport mit geolokalisierten Fotos, keine Rentabilität pro Baustelle, kein Kundenportal, um eine Offerte online zu unterschreiben. Das sind Bedürfnisse des Bauberufs vor Ort, nicht der allgemeinen Unternehmensverwaltung.',
    },
    {
      type: 'callout',
      title: 'Der Unterschied liegt vor allem dort, wo die Arbeit wirklich passiert',
      text: 'Winbiz wurde für die Büroarbeit konzipiert, was für die gesamte Verwaltung eines Unternehmens sinnvoll bleibt. Cantia geht davon aus, dass der Grossteil der Arbeit eines Handwerkers auf der Baustelle passiert, nicht hinter einem festen Bildschirm.',
    },
    { type: 'h2', text: 'Die Vergleichstabelle' },
    {
      type: 'table',
      headers: ['Kriterium', 'Winbiz', 'Cantia'],
      rows: [
        ['Schweizer Finanzbuchhaltung und Fakturierung', 'Ja', 'Ja, automatisch aus Rechnungen, Ausgaben und Löhnen erstellt'],
        ['Offerte direkt auf der Baustelle erstellt', 'Nein', 'Ja'],
        ['Preiskatalog für die Baugewerbe', 'Nein', 'Ja'],
        ['Baustellenrapport mit Fotos', 'Nein', 'Ja'],
        ['Rentabilität pro Baustelle (Offerte vs. Ist)', 'Nein', 'Ja'],
        ['Mobile App für die Arbeit vor Ort', 'Eingeschränkt', 'Ja'],
      ],
    },
    {
      type: 'p',
      text: 'Ein Unternehmen, das seine Buchhaltung bereits mit Winbiz führt, muss es nicht zwingend aufgeben: Oft geht es darum, die Büroverwaltung durch ein Werkzeug für das Geschehen auf der Baustelle zu ergänzen, statt ein einziges Tool beide Welten abdecken zu lassen.',
    },
    {
      type: 'cta',
      title: 'Ein Werkzeug für die Baustelle, nicht fürs Büro',
      text: 'Cantia begleitet den Handwerker dort, wo die Arbeit passiert: diktierte Offerte auf der Baustelle, konforme QR-Rechnungen, Fotorapporte, Planung und Rentabilität pro Baustelle.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Eignet sich Winbiz für ein Bauunternehmen?',
      answer:
        'Winbiz deckt Buchhaltung und allgemeine Fakturierung gut ab, wurde aber nicht speziell für den Bau oder für die mobile Nutzung auf der Baustelle entwickelt, anders als ein Werkzeug wie Cantia.',
    },
    {
      question: 'Kann man Winbiz ganz durch Cantia ersetzen?',
      answer:
        'Cantia führt eine doppelte Buchhaltung, die automatisch aus Rechnungen, Zahlungen, Ausgaben und Löhnen entsteht, mit MWST-Abrechnung und einem Assistenten für den Jahresabschluss. Wer Winbiz für die Buchhaltung behalten möchte, kann es behalten und Cantia für die Steuerung der Baustellen nutzen.',
    },
    {
      question: 'Funktioniert Winbiz gut auf der Baustelle, mobil?',
      answer:
        'Winbiz ist historisch eher auf den festen Arbeitsplatz ausgerichtet. Um eine Offerte zu erstellen oder eine Baustelle direkt vor Ort zu dokumentieren, ist ein von Anfang an mobil gedachtes Werkzeug wie Cantia meist besser geeignet.',
    },
  ],
  relatedSlugs: ['cantia-vs-klara', 'cantia-vs-cresus-facturation', 'application-devis-mobile-artisan'],
};
