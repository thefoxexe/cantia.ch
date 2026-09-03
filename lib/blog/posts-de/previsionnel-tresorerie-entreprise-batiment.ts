import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'previsionnel-tresorerie-entreprise-batiment',
  question: 'Wie erstellt man eine einfache Liquiditätsplanung für ein Bauunternehmen?',
  title: 'Liquiditätsplanung für ein Bauunternehmen: die Methode ohne Wasserkopf',
  description:
    'Man braucht keinen komplexen Finanzplan, um einen Liquiditätsengpass vorherzusehen: Eine Planung auf 30-60-90 Tage, basierend auf offenen Rechnungen und bekannten Kosten, genügt, um Probleme kommen zu sehen.',
  excerpt:
    'Die Liquidität bricht fast nie ohne Vorzeichen ein. Das Problem ist, dass dieses Vorzeichen ohne Planung unsichtbar bleibt, bis der Tag kommt, an dem das Konto bereits im Minus ist.',
  category: 'Chantier & rentabilité',
  keywords: ['Liquiditätsplanung Bau', 'Liquidität Bauunternehmen', 'Cashflow-Verwaltung Handwerker', 'einfache Liquiditätsprognose', 'Liquiditätsproblem vorausschauen'],
  publishedAt: '2026-07-05',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine Liquiditätsplanung muss keine komplexe Finanzübung sein, die grossen Unternehmen vorbehalten ist. Für ein KMU im Bauwesen genügt eine einfache Planung auf 30, 60 und 90 Tage, basierend auf bereits verfügbaren Daten (ausgestellte Rechnungen, bekannte wiederkehrende Kosten), völlig, um einen Engpass vorherzusehen, bevor er zum Problem wird.',
    },
    { type: 'h2', text: 'Die zu sammelnden Daten' },
    {
      type: 'list',
      items: [
        'Die bereits ausgestellten Rechnungen und deren voraussichtliche Zahlungsfälligkeit',
        'Die auf laufenden Baustellen erwarteten Anzahlungen',
        'Die wiederkehrenden fixen Kosten (Löhne, Miete, Versicherungen, Fahrzeugleasing)',
        'Die bereits eingegangenen, aber noch nicht bezahlten punktuellen Ausgaben (Lieferanten, Subunternehmer)',
      ],
    },
    { type: 'h2', text: 'Die Methode mit drei Zeithorizonten' },
    {
      type: 'table',
      headers: ['Zeithorizont', 'Was er zeigt'],
      rows: [
        ['30 Tage', 'Das unmittelbare Risiko: ein bereits jetzt sichtbarer Liquiditätsengpass'],
        ['60 Tage', 'Der Trend (reicht die laufende Tätigkeit aus, um die Fixkosten zu decken?)'],
        ['90 Tage', 'Der Handlungsspielraum, um über eine Investition oder eine Anstellung zu entscheiden'],
      ],
    },
    {
      type: 'callout',
      title: 'Die Planung hat nur Wert, wenn sie regelmässig aktualisiert wird',
      text: 'Eine am Tag ihrer Erstellung eingefrorene Planung verliert innerhalb weniger Wochen jeden Nutzen. Jede neu ausgestellte Rechnung oder jede erhaltene Zahlung muss sie aktualisieren, damit sie zuverlässig bleibt.',
    },
    {
      type: 'p',
      text: 'Der eigentliche Nutzen einer Liquiditätsplanung liegt nicht darin, die Zukunft präzise vorherzusagen, sondern einen Engpass mehrere Wochen im Voraus zu erkennen: früh genug, um eine überfällige Rechnung zu mahnen, einen nicht dringenden Kauf zu verschieben oder eine Frist mit einem Lieferanten auszuhandeln, statt das Problem erst an dem Tag zu entdecken, an dem das Konto bereits negativ ist.',
    },
    {
      type: 'cta',
      title: 'Eine automatische Liquiditätsprognose',
      text: 'Das Cantia-Modul Liquidität projiziert Ihren künftigen Kontostand aus offenen Rechnungen und wiederkehrenden Ausgaben, in Echtzeit aktualisiert.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Muss eine Liquiditätsplanung komplex sein, um nützlich zu sein?',
      answer:
        'Nein, eine einfache Planung auf 30-60-90 Tage, basierend auf offenen Rechnungen und bekannten Kosten, genügt für ein KMU im Bauwesen völlig.',
    },
    {
      question: 'Wie oft sollte eine Liquiditätsplanung aktualisiert werden?',
      answer:
        'Idealerweise bei jeder neu ausgestellten Rechnung oder jeder erhaltenen Zahlung. Eine eingefrorene Planung verliert rasch ihre Zuverlässigkeit.',
    },
    {
      question: 'Was ist der Hauptnutzen einer Liquiditätsplanung?',
      answer:
        'Einen Engpass mehrere Wochen im Voraus zu erkennen, früh genug, um zu handeln (Mahnung, Aufschub eines Kaufs, Verhandlung mit dem Lieferanten), statt ihn erst zu entdecken, wenn das Konto bereits negativ ist.',
    },
  ],
  relatedSlugs: [
    'pourquoi-entreprises-batiment-font-faillite-suisse',
    'calculer-prix-de-revient-chantier-batiment',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
