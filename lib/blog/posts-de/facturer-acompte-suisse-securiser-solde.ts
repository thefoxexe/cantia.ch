import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'facturer-acompte-suisse-securiser-solde',
  question: 'Wie stellt man in der Schweiz eine Anzahlung in Rechnung, ohne am Ende dem Restbetrag hinterherzurennen?',
  title: 'Eine Anzahlung fakturieren, ohne am Ende dem Restbetrag hinterherzurennen',
  description:
    'Eine schlecht strukturierte Anzahlung schützt das Unternehmen selten. So verteilen Sie die Zahlungen auf einer Baustelle, um nie mehr vorzuschiessen, als bereits gedeckt ist.',
  excerpt:
    'Eine Anzahlung von 30 % zu Beginn vermittelt ein falsches Sicherheitsgefühl, wenn der Rest nur in zwei Etappen aufgeteilt wird. Das Geld, das fehlt, ist fast immer jenes aus der Mitte.',
  category: 'Devis & facturation',
  keywords: ['anzahlung baustelle', 'zahlungsplan bauprojekt', 'rechnung baustelle', 'zahlung absichern', 'schlussrechnung'],
  publishedAt: '2026-02-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Eine Baustelle über CHF 25’000 mit einer Anzahlung von 30 % zu Beginn wirkt umsichtig. Das ist sie nicht, wenn der ganze Rest auf eine einzige Schlussrechnung fällt: Zwischen Anzahlung und Restbetrag hat das Unternehmen bereits Material, Stunden und teilweise einen Subunternehmer bezahlt, und zwar aus eigenen Mitteln, während es auf eine Überweisung wartet, die sich hinziehen kann.',
    },
    { type: 'h2', text: 'Das eigentliche Problem ist nicht die Anzahlung, sondern die Mitte der Baustelle' },
    {
      type: 'p',
      text: 'Eine Anzahlung zu Beginn schützt die Entscheidung, mit den Arbeiten zu starten. Sie schützt nichts von dem, was danach eingegangen wird. Bei einer mehrwöchigen Baustelle liegt der finanzielle Kipppunkt weder am Anfang noch am Ende. Er liegt genau in dem Moment, in dem Material gekauft und Stunden fakturiert werden, noch bevor der Kunde seit der Anzahlung auch nur einen Rappen zurückgesehen hat.',
    },
    {
      type: 'list',
      items: [
        'Eine Anzahlung bei Unterschrift (meist 20 bis 30 %), die mindestens das bereits eingesetzte spezifische Material deckt',
        'Eine oder mehrere Zwischenrechnungen, die sich an sichtbaren Baustellenetappen orientieren (Ende Rohbau, Einbau der Schreinerarbeiten usw.) und nicht an willkürlichen Daten',
        'Ein begrenzter Restbetrag, idealerweise unter 20 bis 30 % der Gesamtsumme, fällig bei Abnahme',
      ],
    },
    {
      type: 'callout',
      title: 'Die einfache Regel, die die Falle vermeidet',
      text: 'Zu keinem Zeitpunkt der Baustelle sollte das Unternehmen mehr vorgeschossen haben, als bereits fakturiert und eingegangen ist. Wenn ein grösserer Materialposten vor der nächsten Zahlungsfrist fällig wird, ist der Zahlungsplan schlecht aufgeteilt – nicht der Kunde handelt in schlechter Absicht.',
    },
    { type: 'h2', text: 'Was eine Anzahlung wirklich durchsetzbar macht' },
    {
      type: 'p',
      text: 'Der Zahlungsplan muss auf der unterschriebenen Offerte stehen, nicht erst mündlich verhandelt werden, sobald die Baustelle läuft. Eine mündliche Zusage wie «ich zahle nach und nach» schützt rechtlich nichts und verwandelt sich regelmässig in ein beidseitig gutgläubiges Missverständnis.',
    },
    {
      type: 'cta',
      title: 'Anzahlungsrechnungen, die automatisch verrechnet werden',
      text: 'Cantia ermöglicht es, einen Prozentsatz der Offerte als Anzahlung zu fakturieren und zieht diesen Betrag ohne erneute Erfassung von der Schlussrechnung ab, wobei der Zahlungsplan von der ersten bis zur letzten Zahlung sichtbar bleibt.',
      buttonLabel: 'Modul Fakturierung ansehen',
    },
  ],
  faq: [
    {
      question: 'Welchen Prozentsatz an Anzahlung sollte man bei einer Baustelle in der Schweiz verlangen?',
      answer:
        'Es gibt keine feste gesetzliche Regel: 20 bis 30 % bei Unterschrift sind üblich, doch entscheidend ist, dass der gesamte Zahlungsplan die in jeder Etappe entstehenden Ausgaben deckt, nicht nur den Start.',
    },
    {
      question: 'Ist eine Anzahlung rückerstattbar, wenn der Kunde die Baustelle absagt?',
      answer:
        'Das hängt von den auf der unterschriebenen Offerte festgehaltenen Bedingungen ab. Fehlt eine klare Klausel, wird ein Streitfall dazu von Fall zu Fall gelöst – ein Grund, immer eine ausdrückliche Annullationsklausel zu formulieren.',
    },
    {
      question: 'Kann man auf derselben Baustelle mehrere Zwischenanzahlungen fakturieren?',
      answer:
        'Ja, und das ist bei mehrwöchigen Baustellen empfehlenswert: Zwischenrechnungen an sichtbaren Etappen zu orientieren, verhindert, dass zu viel Liquidität vor dem nächsten Zahlungseingang vorgeschossen wird.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'relancer-client-facture-impayee-sans-perdre-client',
    'calculer-prix-devis-renovation-suisse',
  ],
};
