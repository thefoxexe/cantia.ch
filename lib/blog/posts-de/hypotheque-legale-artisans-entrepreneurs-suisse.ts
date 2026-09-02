import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'hypotheque-legale-artisans-entrepreneurs-suisse',
  question: 'Was ist das Bauhandwerkerpfandrecht, und wie verliert man es nicht?',
  title: 'Bauhandwerkerpfandrecht: Ihre Zahlungssicherheit — mit strikter Frist',
  description:
    'Das Bauhandwerkerpfandrecht (Art. 837 ZGB) sichert die Bezahlung Ihrer Arbeiten direkt auf der Liegenschaft ab. Es muss jedoch innert 4 Monaten im Grundbuch eingetragen werden. Nach Ablauf dieser Frist erlischt es.',
  excerpt:
    'Ein Kunde, der nicht zahlt, kann betrieben werden. Ist er aber zahlungsunfähig oder unauffindbar, bringt die Betreibung nichts ein. Das Bauhandwerkerpfandrecht behält dagegen einen direkten Zugriff auf das Gebäude, das Sie erstellt haben.',
  category: 'Juridique & normes',
  keywords: ['bauhandwerkerpfandrecht', 'art 837 zgb', 'zahlungssicherheit baustelle', 'grundbuch eintragung', 'unternehmer unbezahlt'],
  publishedAt: '2026-08-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein zahlungsunfähiger oder bösgläubiger Kunde, der Ihre Rechnung nicht begleicht, ist nicht nur ein Liquiditätsproblem: Es ist ein Risiko, das die ordentliche Betreibung nicht immer abdeckt, wenn er über keine beweglichen Vermögenswerte mehr verfügt. Das Bauhandwerkerpfandrecht, geregelt in Art. 837 ZGB, existiert genau für diesen Fall: Es gibt Ihnen ein Pfandrecht direkt auf der Liegenschaft, die Sie erbaut, umgebaut oder saniert haben.',
    },
    { type: 'h2', text: 'Ein starkes Recht, das aber schnell erlischt' },
    {
      type: 'p',
      text: 'Dieses Recht entsteht nicht automatisch und ist nicht dauerhaft: Es muss innert 4 Monaten nach Fertigstellung der Arbeiten im Grundbuch eingetragen werden. Nach Ablauf dieser Frist erlischt das Bauhandwerkerpfandrecht endgültig, selbst wenn die Forderung selbst weiterhin besteht. Das ist übrigens die häufigste Falle, denn viele Unternehmer entdecken diesen Mechanismus erst, wenn es bereits zu spät ist, ihn zu nutzen.',
    },
    {
      type: 'stat',
      value: '4 Monate',
      label: 'strikte Frist ab Ende der Arbeiten, um die Eintragung im Grundbuch zu beantragen',
    },
    { type: 'h2', text: 'Wer kann sich darauf berufen, und worauf' },
    {
      type: 'list',
      items: [
        'Jeder Handwerker oder Unternehmer, der Material und/oder Arbeit für den Bau oder die Renovation einer Liegenschaft geliefert hat',
        'Einschliesslich eines Subunternehmers, auch ohne direktes Vertragsverhältnis mit dem Eigentümer der Liegenschaft',
        'Die Sicherheit bezieht sich auf die betroffene Liegenschaft, unabhängig von der Finanzierungsstruktur oder der Anzahl beteiligter Firmen auf der Baustelle',
        'Eine blosse Vereinbarung oder ein Schuldanerkenntnis des Kunden ersetzt nie die Eintragung: Nur die Eintragung im Grundbuch begründet die Sicherheit',
      ],
    },
    {
      type: 'callout',
      title: 'Die Uhr beginnt mit dem tatsächlichen Ende der Arbeiten zu laufen, nicht mit dem Rechnungsdatum',
      text: 'Genau zu wissen, wann eine Baustelle beendet wurde (und dies beweisen zu können), entscheidet darüber, ob Sie noch innerhalb der 4-Monats-Frist sind oder diese bereits verstrichen ist.',
    },
    {
      type: 'cta',
      title: 'Eine Baustelle mit lückenlosen Daten, vom ersten bis zum letzten Tag',
      text: 'Cantia hält jede Baustelle von der Eröffnung bis zum Abschluss fest, wodurch sich das Ende der Arbeiten eindeutig belegen lässt, falls Sie schnell handeln müssen, um Ihr Bauhandwerkerpfandrecht zu sichern.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Was ist das Bauhandwerkerpfandrecht?',
      answer:
        'Ein Pfandrecht auf der erbauten oder renovierten Liegenschaft gemäss Art. 837 ZGB, das die Bezahlung der erbrachten Arbeiten sichert, selbst wenn der Kunde über keine anderen pfändbaren Vermögenswerte mehr verfügt.',
    },
    {
      question: 'Wie lange ist die Frist für die Eintragung?',
      answer:
        'Vier Monate ab Fertigstellung der Arbeiten. Nach Ablauf dieser Frist erlischt das Recht endgültig, auch wenn die Forderung weiterhin besteht.',
    },
    {
      question: 'Kann ein Subunternehmer ein Bauhandwerkerpfandrecht verlangen?',
      answer:
        'Ja, dieses Recht besteht unabhängig von einem direkten Vertragsverhältnis mit dem Eigentümer der Liegenschaft, sofern Material oder Arbeit für den Bau geliefert wurde.',
    },
  ],
  relatedSlugs: [
    'poursuite-facture-impayee-procedure-suisse',
    'relancer-client-facture-impayee-sans-perdre-client',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
