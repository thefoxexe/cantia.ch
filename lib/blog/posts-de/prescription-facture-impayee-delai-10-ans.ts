import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'prescription-facture-impayee-delai-10-ans',
  question: 'Nach welcher Zeitspanne wird eine unbezahlte Rechnung in der Schweiz rechtlich uneinbringlich?',
  title: 'Verjährung einer unbezahlten Rechnung in der Schweiz: die Frist, die man nie verstreichen lassen darf',
  description:
    'Obwohl unterbrechende Handlungen existieren, verjährt eine vertragliche Forderung in der Schweiz grundsätzlich nach 10 Jahren, und sie zu ignorieren kann das Recht auf Zahlung endgültig kosten.',
  excerpt:
    'Zehn Jahre wirken lang – zumindest bis eine in einem Dossier vergessene alte Rechnung sich genau in dem Moment, in dem das Unternehmen sie am dringendsten braucht, als völlig uneinbringlich erweist.',
  category: 'Devis & facturation',
  keywords: ['verjährung unbezahlte rechnung', 'verjährungsfrist forderung schweiz', 'alte unbezahlte rechnung', 'unterbrechung der verjährung', 'forderung bau frist'],
  publishedAt: '2026-06-12',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine aus einem Vertrag entstandene Forderung (wie eine unbezahlte Rechnung für Bauarbeiten) verjährt nach Schweizer Recht grundsätzlich nach 10 Jahren, gemäss der allgemeinen Regelung von Art. 127 OR. Ist diese Frist ohne Handlung verstrichen, kann der Schuldner die Zahlung rechtmässig unter Berufung auf die Verjährung verweigern: Die Forderung besteht moralisch weiterhin, wird aber rechtlich nicht mehr durchsetzbar.',
    },
    { type: 'h2', text: 'Was die Frist unterbricht (und sie neu beginnen lässt)' },
    {
      type: 'list',
      items: [
        'Eine beim Betreibungsamt eingeleitete Betreibung',
        'Eine vom Schuldner unterzeichnete Schuldanerkennung, auch eine teilweise',
        'Eine gerichtliche Handlung (Vorladung, Klageeinreichung)',
        'Eine blosse Mahnung oder eine gütliche Erinnerung hingegen unterbricht die Verjährung NICHT; nur eine formelle Handlung tut dies',
      ],
    },
    {
      type: 'callout',
      title: 'Eine blosse E-Mail-Mahnung reicht nie aus, um die Frist hinauszuschieben',
      text: 'Das ist der häufigste Fehler: zu glauben, eine regelmässige Mahnung «halte die Forderung am Leben». Nur eine Betreibung, eine unterschriebene Schuldanerkennung oder eine gerichtliche Handlung unterbrechen die Verjährung tatsächlich.',
    },
    { type: 'h2', text: 'Warum diese Frist nie auf die leichte Schulter genommen werden darf' },
    {
      type: 'p',
      text: 'Zehn Jahre erscheinen als ferner Zeithorizont. Trotzdem kann sich eine alte, in den Archiven eines kleinen Unternehmens vergessene Forderung genau in dem Moment als völlig uneinbringlich erweisen, in dem sie nützlich wäre. Eine zentralisierte Nachverfolgung jeder Rechnung mit Ausstellungsdatum und Zahlungsstatus ist der einzige zuverlässige Weg, eine sich der Verjährung nähernde Forderung zu erkennen, bevor es zu spät zum Handeln ist.',
    },
    {
      type: 'cta',
      title: 'Keine unbezahlte Rechnung, die in einer Schublade vergessen wird',
      text: 'Cantia bewahrt eine vollständige Historie jeder Rechnung und ihres Zahlungsstatus. So erkennen Sie eine alte Forderung, bevor sie uneinbringlich wird.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Nach welcher Zeit verjährt eine Forderung in der Schweiz?',
      answer:
        'Grundsätzlich nach 10 Jahren für eine vertragliche Forderung gemäss der allgemeinen Regelung von Art. 127 OR, vorbehältlich besonderer Fristen für bestimmte Vertragsarten.',
    },
    {
      question: 'Unterbricht eine gütliche Mahnung die Verjährung?',
      answer:
        'Nein. Nur eine Betreibung, eine vom Schuldner unterschriebene Schuldanerkennung oder eine gerichtliche Klage unterbrechen die Verjährungsfrist tatsächlich.',
    },
    {
      question: 'Was passiert, wenn eine Forderung verjährt ist?',
      answer:
        'Der Schuldner kann die Zahlung vor Gericht rechtmässig unter Berufung auf die Verjährung verweigern: Die Forderung wird rechtlich nicht mehr durchsetzbar, auch wenn sie moralisch weiter geschuldet bleibt.',
    },
  ],
  relatedSlugs: [
    'poursuite-facture-impayee-procedure-suisse',
    'relancer-client-facture-impayee-sans-perdre-client',
    'delai-paiement-facture-artisan-code-obligations',
  ],
};
