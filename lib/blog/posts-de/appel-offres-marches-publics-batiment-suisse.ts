import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'appel-offres-marches-publics-batiment-suisse',
  question: 'Wie beteiligt man sich an einer öffentlichen Ausschreibung im Bauwesen in der Schweiz?',
  title: 'Öffentliche Aufträge im Bauwesen: Was Sie vor einer Offerteingabe wissen müssen',
  description:
    'Ab CHF 2 Millionen für Bauarbeiten muss ein öffentlicher Auftrag gemäss den IVöB-Schwellenwerten auf SIMAP publiziert werden. Darunter bleibt das freihändige Verfahren möglich.',
  excerpt:
    'CHF 2 Millionen: der Schwellenwert, ab dem ein Bauauftrag über eine formelle öffentliche Ausschreibung statt über eine einfache Direktverhandlung vergeben werden muss.',
  category: 'Juridique & normes',
  keywords: ['öffentliche Beschaffung Bau', 'IVöB Schwellenwerte', 'SIMAP Ausschreibung', 'öffentliche Ausschreibung Bauwesen', 'Offerte öffentlicher Auftrag Schweiz'],
  publishedAt: '2026-05-21',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Ein öffentliches Gemeinwesen (Gemeinde, Kanton), das eine Baustelle ausschreibt, kann oberhalb eines bestimmten Betrags nicht einfach das bevorzugte Unternehmen anrufen: Es muss einem geregelten Ausschreibungsverfahren folgen. Diese Schwellenwerte zu kennen, hilft einem Bauunternehmen, zu wissen, wo es nach Chancen suchen und was es bei einer Offerteingabe erwarten muss.',
    },
    { type: 'h2', text: 'Der Schwellenwert, der das formelle Verfahren auslöst' },
    {
      type: 'p',
      text: 'Für Bauarbeiten liegt der Publikationsschwellenwert auf SIMAP (der Schweizer Plattform für öffentliche Beschaffungen) bei rund CHF 2 Millionen, festgelegt durch die Interkantonale Vereinbarung über das öffentliche Beschaffungswesen (IVöB), mit periodisch revidierten Werten. Unterhalb dieses Schwellenwerts kann ein Gemeinwesen auf leichtere Verfahren zurückgreifen, bis hin zur freihändigen Vergabe für die kleineren Beträge.',
    },
    {
      type: 'callout',
      title: 'Fehlender Schwellenwert bedeutet nicht fehlende Chance',
      text: 'Die Mehrheit der öffentlichen Baustellen, insbesondere kommunale, bleibt unter dem SIMAP-Publikationsschwellenwert, ohne deshalb für kleine Unternehmen verschlossen zu sein. Viele Gemeinwesen führen Listen von Lieferanten oder lokalen Unternehmen, die für diese freihändigen Aufträge direkt konsultiert werden, ausserhalb jeder formellen Publikation.',
    },
    { type: 'h2', text: 'Die wichtigsten Etappen eines formellen Verfahrens' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Publikation der Ausschreibung auf SIMAP, mit Pflichtenheft und Zuschlagskriterien',
        'Frist für die Angebotseinreichung, in der Regel mehrere Wochen, um Zeit für die Kalkulation zu lassen',
        'Bewertung nach gewichteten Kriterien, wobei der Preis fast nie das einzige Element ist: Qualität und Fristen zählen ebenfalls',
        'Zuschlagsentscheid, publiziert und begründet, mit einer möglichen Beschwerdefrist für unterlegene Bewerber',
      ],
    },
    { type: 'h2', text: 'Was beim ersten Mal Zeit kostet' },
    {
      type: 'p',
      text: 'Auf eine öffentliche Ausschreibung zu antworten erfordert eine andere Sorgfalt als eine gewöhnliche Offerte: ein präzises Pflichtenheft einhalten, nach einer vorgegebenen Struktur kalkulieren und oft zusätzlich zum Preis selbst Nachweise liefern (Versicherungen, aktuelle Sozialversicherungsanschlüsse, keine Verurteilung wegen Schwarzarbeit). Die erste Eingabe braucht Zeit; die folgenden gehen deutlich schneller, sobald das Musterdossier einmal erstellt ist.',
    },
    {
      type: 'cta',
      title: 'Eine klare Historie zur Unterstützung einer Offerteingabe',
      text: 'Cantia bewahrt die vollständige Historie der ausgeführten Baustellen auf, nützlich für den Nachweis der in einem öffentlichen Ausschreibungsdossier geforderten Referenzen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ab welchem Betrag muss ein Bauauftrag auf SIMAP publiziert werden?',
      answer:
        'Ab rund CHF 2 Millionen gemäss den durch die Interkantonale Vereinbarung über das öffentliche Beschaffungswesen (IVöB) festgelegten und periodisch revidierten Schwellenwerten.',
    },
    {
      question: 'Sind kleine öffentliche Baustellen für kleine Unternehmen zugänglich?',
      answer:
        'Ja, die Mehrheit der öffentlichen Aufträge, insbesondere kommunale, bleibt unter dem formellen Publikationsschwellenwert und läuft über freihändige Verfahren, häufig mit lokalen Unternehmen.',
    },
    {
      question: 'Ist der Preis das einzige Zuschlagskriterium bei einem öffentlichen Auftrag?',
      answer:
        'Nein, die Kriterien sind in der Regel gewichtet und umfassen auch Qualität, Fristen und Referenzen des Unternehmens, nicht nur den angebotenen Betrag.',
    },
  ],
  relatedSlugs: [
    'travail-au-noir-batiment-suisse-risques-controles',
    'assurance-rc-professionnelle-batiment-obligatoire',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
