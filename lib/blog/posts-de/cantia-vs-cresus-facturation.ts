import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cantia-vs-cresus-facturation',
  question: 'Cantia oder Crésus Facturation: Was ist der Unterschied für ein Bauunternehmen?',
  title: 'Cantia vs. Crésus Facturation: der Unterschied für den Bau',
  description:
    'Crésus Facturation ist eine beliebte und günstige Schweizer Software, ursprünglich für Windows gedacht. Cantia ist mobil, für die Baustelle gemacht. Ein ehrlicher Vergleich der beiden Ansätze.',
  excerpt:
    'Crésus Facturation wird seit Jahren von vielen Schweizer Selbständigen genutzt, aus guten Gründen. Bleibt die Frage, ob es abdeckt, was auf einer Baustelle wirklich passiert.',
  category: 'Comparatifs & outils',
  keywords: ['Crésus Facturation', 'Crésus Alternative Bau', 'Crésus vs Cantia', 'Fakturierungssoftware Schweiz Handwerker'],
  publishedAt: '2026-09-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Crésus Facturation gehört zu den bekanntesten und günstigsten Schweizer Programmen für Fakturierung und Buchhaltung, seit Langem von vielen Selbständigen genutzt, ursprünglich unter Windows. Seine Beliebtheit verdankt es der Einfachheit und dem zugänglichen Preis. Die Frage für ein Bauunternehmen ist, ob diese Einfachheit auch abdeckt, was auf einer Baustelle wirklich passiert.',
    },
    { type: 'h2', text: 'Was Crésus Facturation gut macht' },
    {
      type: 'p',
      text: 'Klare Fakturierung, grundlegende Buchhaltung, ein zugänglicher Preis für Selbständige oder kleine Betriebe: Crésus bleibt eine sinnvolle Wahl für einfache, allgemeine Fakturierungsbedürfnisse ohne besondere Anforderungen eines Berufs vor Ort.',
    },
    { type: 'h2', text: 'Was für die Baustellenführung fehlt' },
    {
      type: 'p',
      text: 'Crésus Facturation wurde nicht um die besonderen Bedürfnisse des Baus herum gebaut: kein Preiskatalog pro Gewerbe, keine Offerte direkt auf der Baustelle am Smartphone, keine Rentabilität pro Baustelle, kein Baustellenrapport mit Fotos. Diese Bedürfnisse gehen über den Umfang einer generalistischen Fakturierungssoftware hinaus.',
    },
    {
      type: 'callout',
      title: 'Eine Fakturierungssoftware ist kein Werkzeug zur Baustellenführung',
      text: 'Crésus Facturation macht gut, wofür es gedacht ist: einfach und günstig Rechnungen stellen. Cantia geht von der Baustelle aus, nicht von der Rechnung, und baut alles andere (Offerten, Planung, Rentabilität) um diese Realität herum.',
    },
    { type: 'h2', text: 'Die Vergleichstabelle' },
    {
      type: 'table',
      headers: ['Kriterium', 'Crésus Facturation', 'Cantia'],
      rows: [
        ['Einfache und günstige Fakturierung', 'Ja', 'Ja'],
        ['Preiskatalog für die Baugewerbe', 'Nein', 'Ja'],
        ['Offerte auf der Baustelle, am Smartphone', 'Nein', 'Ja'],
        ['Rentabilität pro Baustelle (Offerte vs. Ist)', 'Nein', 'Ja'],
        ['Baustellenrapport mit Fotos', 'Nein', 'Ja'],
        ['Mobile App für die Arbeit vor Ort', 'Eingeschränkt', 'Ja'],
      ],
    },
    {
      type: 'p',
      text: 'Für Selbständige mit sehr einfachen Fakturierungsbedürfnissen und ohne echte Baustellenführung bleibt Crésus Facturation eine vernünftige, günstige Wahl. Sobald die Rentabilität pro Baustelle oder die Mobilität vor Ort zentral werden, zeigt sich der Abstand zu einem Werkzeug für den Bau.',
    },
    {
      type: 'cta',
      title: 'Die Offerte auf der Baustelle, die Rechnung folgt automatisch',
      text: 'Mit Cantia entsteht die Offerte per Diktat direkt auf der Baustelle, die Schweizer QR-Rechnung folgt mit einem Klick, und die Rentabilität der Baustelle wird ohne erneutes Erfassen berechnet.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Reicht Crésus Facturation, um ein Bauunternehmen zu führen?',
      answer:
        'Für die reine Fakturierung oft ja. Crésus Facturation deckt aber weder die Baustellenführung noch die Rentabilität pro Projekt noch vor Ort erstellte Offerten ab, typische Bedürfnisse des Bauberufs.',
    },
    {
      question: 'Was ist der wichtigste Unterschied zwischen Crésus Facturation und Cantia?',
      answer:
        'Crésus Facturation ist eine generalistische, einfache und günstige Fakturierungssoftware. Cantia ist speziell für den Ablauf einer Baustelle gemacht, von der Offerte vor Ort bis zur Schlusszahlung.',
    },
    {
      question: 'Kann man Crésus und Cantia parallel nutzen?',
      answer:
        'Für eine Übergangszeit ist das möglich, doch die meisten Bauunternehmen, die ein Branchentool wie Cantia einführen, bündeln Offerten und Rechnungen schliesslich an einem Ort, um doppeltes Erfassen zu vermeiden.',
    },
  ],
  relatedSlugs: ['cantia-vs-winbiz', 'cantia-vs-klara', 'meilleur-logiciel-devis-facture-batiment-suisse-2026'],
};
