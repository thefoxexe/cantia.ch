import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'retenue-de-garantie-chantier-consignation',
  question: 'Was ist der Garantierückbehalt auf einer Baustelle, und kann ein Bauherr ihn erzwingen?',
  title: 'Garantierückbehalt auf der Baustelle: was er abdeckt, und wie weit er gehen darf',
  description:
    'Ein Bauherr behält manchmal 5 bis 10 % des Schlussbetrags «zur Sicherheit» ein: eine Praxis, die nicht automatisch gilt und verhandelt werden muss, nicht widerspruchslos hingenommen werden sollte.',
  excerpt:
    'Einen Teil der Zahlung als Absicherung gegen künftige Mängel einzubehalten, ist weder verboten noch ein selbstverständliches Recht. Es ist eine Klausel, die verhandelt wird, mit klaren Grenzen.',
  category: 'Juridique & normes',
  keywords: ['garantierückbehalt baustelle', 'sicherheitsleistung bauwerk', 'bankgarantie baustelle', 'zahlungsrückbehalt bauarbeiten', 'schlusszahlung einbehalten'],
  publishedAt: '2026-06-22',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Der Garantierückbehalt bedeutet, dass ein Bauherr den Schlusssaldo einer Baustelle nicht sofort vollständig auszahlt, sondern einen Teil (oft 5 bis 10 %) als Sicherheit gegen nach der Abnahme entdeckte Mängel zurückhält. Das ist keine automatische gesetzliche Regel, sondern eine Vertragsklausel, die ausdrücklich verhandelt und akzeptiert werden muss.',
    },
    { type: 'h2', text: 'Was festgelegt sein muss, damit ein Rückbehalt gültig ist' },
    {
      type: 'list',
      items: [
        'Der genaue einbehaltene Prozentsatz, im Voraus im Vertrag oder in der Offerte festgelegt',
        'Die Dauer des Rückbehalts, die in der Regel der anfänglichen Garantiefrist entspricht (vor dem Übergang zu den vollen 2 oder 5 Jahren)',
        'Die Freigabebedingungen: zu welchem Datum, auf welcher Grundlage wird der Rückbehalt an den Unternehmer zurückerstattet',
        'Eine allfällige, im Voraus akzeptierte Alternative: Bankgarantie auf erstes Verlangen statt Bareinbehalt',
      ],
    },
    { type: 'h2', text: 'Eine oft günstigere Alternative: die Bankgarantie' },
    {
      type: 'p',
      text: 'Statt einen Teil der Baustelle über Monate unbezahlt zu lassen, kann ein Unternehmen eine Bankgarantie auf erstes Verlangen anbieten (eine Verpflichtung der Bank, den Betrag im Fall eines nachgewiesenen Mangels auszuzahlen, ohne dass der Unternehmer auf seine eigene Liquidität zurückgreifen muss). Das vermeidet die direkte Bindung von liquiden Mitteln und bietet dem Kunden gleichzeitig dieselbe Sicherheit.',
    },
    {
      type: 'callout',
      title: 'Ein nicht schriftlich geregelter Garantierückbehalt wird zum wiederkehrenden Streitpunkt',
      text: 'Ohne klares Freigabedatum verwandelt sich der einbehaltene Saldo beim Kunden oft in ein «Vergessen». Der Rückbehalt sollte deshalb immer mit einem präzisen, schriftlich festgehaltenen Termin verbunden sein.',
    },
    {
      type: 'cta',
      title: 'Übersicht über einbehaltene Salden, Baustelle für Baustelle',
      text: 'Cantia behält eine klare Übersicht darüber, was auf jeder Rechnung noch offen ist, damit ein Garantierückbehalt nach Ablauf der Frist nie in Vergessenheit gerät.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Kann ein Bauherr einen Garantierückbehalt ohne vorherige Einigung durchsetzen?',
      answer:
        'Nein, der Garantierückbehalt ist eine Vertragsklausel, die ausdrücklich verhandelt und akzeptiert werden muss. Er gilt im Schweizer Recht nicht automatisch.',
    },
    {
      question: 'Welcher Prozentsatz wird auf einer Baustelle in der Regel einbehalten?',
      answer:
        'Zwischen 5 und 10 % des Schlussbetrags, je nachdem, was im Vertrag ausgehandelt wurde, da es keinen fixen gesetzlichen Satz gibt.',
    },
    {
      question: 'Gibt es eine Alternative zum Bareinbehalt?',
      answer:
        'Ja, eine Bankgarantie auf erstes Verlangen bietet dem Kunden dieselbe Sicherheit, ohne die Liquidität des Unternehmens direkt zu binden.',
    },
  ],
  relatedSlugs: [
    'facturer-acompte-suisse-securiser-solde',
    'garantie-travaux-construction-2-ou-5-ans',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
