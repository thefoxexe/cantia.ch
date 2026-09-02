import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'difference-devis-offre-facture-pro-forma',
  question: 'Was ist der Unterschied zwischen einer Offerte, einem Angebot und einer Proforma-Rechnung?',
  title: 'Offerte, Angebot, Proforma-Rechnung: drei Begriffe, drei unterschiedliche Verwendungen',
  description:
    'Die drei Begriffe werden im Schweizer Bauwesen oft synonym verwendet, obwohl sie nicht dieselbe Verbindlichkeit haben. Eine kurze Klärung, um sie nicht mehr zu verwechseln.',
  excerpt:
    '«Angebot», «Offerte», «Proforma-Rechnung»: drei Dokumente, die oft wie Synonyme verwendet werden, obwohl sie weder denselben Wert noch dieselbe Verwendung haben.',
  category: 'Devis & facturation',
  keywords: ['offerte', 'angebot', 'proforma rechnung', 'begriffe bauwesen', 'geschäftsdokument unterschied'],
  publishedAt: '2026-05-11',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Im üblichen Sprachgebrauch des Bauwesens werden «Offerte» und «Angebot» oft synonym verwendet. In den meisten Fällen ist das kein Problem. Verwirrend wird es, sobald eine «Proforma-Rechnung» ins Spiel kommt, denn dieses Dokument spielt eine ganz andere Rolle.',
    },
    { type: 'h2', text: 'Offerte und Angebot: in der Praxis des Bauwesens dasselbe' },
    {
      type: 'p',
      text: 'Rechtlich beschreiben beide Begriffe einen Vertragsvorschlag (ein Angebot im Sinne des Obligationenrechts, das der Kunde annimmt oder ablehnt). «Offerte» ist der übliche Begriff im Bauwesen (mit detaillierten kalkulierten Positionen); «Angebot» ist ein allgemeinerer Begriff, der in anderen Branchen für dasselbe verwendet wird. Kein Unterschied im Rechtswert zwischen beiden in diesem Kontext.',
    },
    {
      type: 'callout',
      title: 'Die Proforma-Rechnung ist keine Rechnung und verpflichtet zu nichts',
      text: 'Eine Proforma-Rechnung ist ein informatives Dokument, das einen geschätzten Betrag ausweist, häufig für administrative Zwecke verwendet (Finanzierungsdossier, Zoll). Sie stellt jedoch weder eine rechtliche Forderung noch eine vertragliche Annahme dar. Im Gegensatz zu einer angenommenen Offerte verpflichtet sie keine der beiden Parteien.',
    },
    { type: 'h2', text: 'Warum die Unterscheidung wichtig ist' },
    {
      type: 'list',
      items: [
        'Eine vom Kunden angenommene Offerte begründet einen Werkvertrag: Beide Parteien sind verpflichtet',
        'Eine Proforma-Rechnung begründet keine Zahlungspflicht (sie informiert, ohne zu verpflichten)',
        'Eine echte Rechnung (ausgestellt nach Ausführung oder als Anzahlung) begründet dagegen eine fällige Forderung mit Zahlungsfrist',
      ],
    },
    {
      type: 'p',
      text: 'Das konkrete Risiko einer Verwechslung: eine «Proforma-Rechnung» versenden in der Annahme, damit eine Kundenverpflichtung abgesichert zu haben, obwohl tatsächlich keine vertragliche Annahme stattgefunden hat. Der Kunde kann dann ohne rechtliche Konsequenz zurücktreten, im Gegensatz zu einer ordnungsgemäss angenommenen Offerte.',
    },
    {
      type: 'cta',
      title: 'Offerten, Rechnungen, Anzahlungen: jede an ihrem Platz',
      text: 'Cantia unterscheidet klar jeden Dokumentstatus (Entwurf, versendete Offerte, angenommen, fakturiert), damit ein Vorschlag nie mit einer tatsächlichen Verpflichtung verwechselt wird.',
      buttonLabel: 'Offerten-Modul entdecken',
    },
  ],
  faq: [
    {
      question: 'Sind eine Offerte und ein Angebot im Bauwesen dasselbe?',
      answer:
        'Ja, in der Praxis: Beide Begriffe bezeichnen einen Vertragsvorschlag, wobei «Offerte» der im Bauwesen übliche Begriff ist.',
    },
    {
      question: 'Verpflichtet eine Proforma-Rechnung den Kunden zur Zahlung?',
      answer:
        'Nein. Es handelt sich um ein rein informatives Dokument mit einem geschätzten Betrag, ohne Forderungswert oder vertragliche Annahme.',
    },
    {
      question: 'Was ist der Unterschied zwischen einer angenommenen Offerte und einer echten Rechnung?',
      answer:
        'Die angenommene Offerte begründet den Werkvertrag; die Rechnung begründet eine fällige Forderung mit Zahlungsfrist, in der Regel ausgestellt nach Ausführung oder als Anzahlung.',
    },
  ],
  relatedSlugs: [
    'devis-oral-valeur-legale-suisse',
    'validite-devis-signe-prix-qui-bouge',
    'facturer-acompte-suisse-securiser-solde',
  ],
};
