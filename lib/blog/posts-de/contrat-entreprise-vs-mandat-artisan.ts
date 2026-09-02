import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'contrat-entreprise-vs-mandat-artisan',
  question: 'Werkvertrag oder Auftrag: Was ist der Unterschied für einen Handwerker?',
  title: 'Werkvertrag vs. Auftrag: was sich für einen Handwerker wirklich ändert',
  description:
    'Ein Handwerker, der Bodenplatten verlegt, steht unter Werkvertrag (Erfolgspflicht). Ein beratender Architekt steht oft unter Auftrag (Sorgfaltspflicht). Der Unterschied wiegt im Streitfall schwer.',
  excerpt:
    'Zwei Rechtsregime, ein riesiger Unterschied: Das eine verpflichtet auf ein Ergebnis, das andere auf eingesetzte Mittel. Die meisten Handwerker wissen nicht, in welchem sie arbeiten.',
  category: 'Juridique & normes',
  keywords: ['Werkvertrag Schweiz', 'Auftrag Schweiz Recht', 'Erfolgspflicht Handwerker', 'Sorgfaltspflicht Architekt', 'Obligationenrecht Bau'],
  publishedAt: '2026-03-19',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Handwerker, der Bodenplatten verlegt, verspricht ein Ergebnis: einen verlegten, ebenen, mängelfreien Boden. Ein Architekt, der ein Projekt berät, verspricht sorgfältig eingesetzte Mittel, kein garantiertes Ergebnis. Diese grundlegende rechtliche Unterscheidung verändert radikal, was einem im Streitfall vorgeworfen werden kann.',
    },
    { type: 'h2', text: 'Werkvertrag: Erfolgspflicht' },
    {
      type: 'p',
      text: 'Geregelt in Art. 363 ff. OR, verpflichtet der Werkvertrag den Unternehmer auf die Lieferung eines Werks, das dem Vereinbarten entspricht, unabhängig von den unterwegs aufgetretenen Schwierigkeiten. Es ist das Standardregime für nahezu alle handwerklichen Berufe im Bauwesen: Maurer, Elektriker, Schreiner, Maler, Gipser. Wird das Ergebnis nicht erreicht, greift die gesetzliche Gewährleistung (siehe das Regime von 2 bis 5 Jahren je nach Art des Werks), ohne dass sich der Unternehmer mit «ich habe mein Bestes gegeben» verteidigen kann.',
    },
    { type: 'h2', text: 'Auftrag: Sorgfaltspflicht' },
    {
      type: 'p',
      text: 'Geregelt in Art. 394 ff. OR, verpflichtet der Auftrag nur dazu, die von einer Fachperson erwarteten Mittel und die erwartete Sorgfalt einzusetzen, ohne ein bestimmtes Ergebnis zu garantieren. Das ist typischerweise das Regime eines Architekten in der Beratungsphase, eines Ingenieurbüros für eine Studie, oder einer Bauleitung für die Projektsteuerung. Ein Architekt kann von seiner Haftung befreit werden, wenn er nachweist, mit der erforderlichen Sorgfalt gehandelt zu haben, selbst wenn das Endergebnis enttäuscht.',
    },
    {
      type: 'callout',
      title: 'Warum das im Streitfall alles verändert',
      text: 'Beim Werkvertrag zählt nur eine Frage: Wurde das versprochene Ergebnis geliefert? Beim Auftrag lautet die Frage: Waren die eingesetzten Mittel angemessen und sorgfältig? Die Beweislast und der Verteidigungsansatz unterscheiden sich völlig. Ein Handwerker, der glaubt, unter Auftrag zu stehen, obwohl er unter Werkvertrag steht, riskiert deshalb, sich mit den falschen Argumenten zu verteidigen.',
    },
    { type: 'h2', text: 'Ein und dieselbe Baustelle kann beides mischen' },
    {
      type: 'p',
      text: 'Ein Architekt, der plant und überwacht (Auftrag), zieht Unternehmen bei, die ausführen (Werkvertrag): Beide Regime bestehen dann im selben Projekt nebeneinander, jedes auf den passenden Akteur angewendet. Die häufigste Verwechslung: Ein Handwerker, der zusätzlich zu seiner gewohnten Ausführung Beratungs- oder Koordinationsaufgaben übernimmt, rutscht manchmal, ohne es zu merken, für diesen Teil seiner Leistung in ein Auftragsregime.',
    },
    {
      type: 'cta',
      title: 'Eine Offerte, die präzisiert, was versprochen wird',
      text: 'Cantia erlaubt es, jede Leistung genau auf der Offerte zu detaillieren. Der beste Schutz bleibt immer, schwarz auf weiss festzuhalten, was geliefert wird, unabhängig vom anwendbaren Vertragsregime.',
      buttonLabel: 'Offerten-Modul entdecken',
    },
  ],
  faq: [
    {
      question: 'Arbeitet ein Handwerker im Bauwesen unter Werkvertrag oder unter Auftrag?',
      answer:
        'Fast immer unter Werkvertrag (Art. 363 ff. OR), der auf ein Ergebnis verpflichtet; ein Architekt in der Beratungsphase steht dagegen meist unter Auftrag.',
    },
    {
      question: 'Was ist der wichtigste praktische Unterschied zwischen den beiden Regimen?',
      answer:
        'Der Werkvertrag verpflichtet auf ein garantiertes Ergebnis; der Auftrag verpflichtet nur auf die eingesetzten Mittel und die aufgewendete Sorgfalt, ohne das Endergebnis zu garantieren.',
    },
    {
      question: 'Kann ein und dieselbe Baustelle beide Vertragsarten kombinieren?',
      answer:
        'Ja, häufig sogar: ein Architekt unter Auftrag für die Planung und Begleitung, Unternehmen unter Werkvertrag für die Ausführung. Jeder Akteur untersteht so dem für seine Aufgabe passenden Regime.',
    },
  ],
  relatedSlugs: [
    'norme-sia-118-devis-obligatoire',
    'garantie-travaux-construction-2-ou-5-ans',
    'permis-construire-renovation-quand-necessaire',
  ],
};
