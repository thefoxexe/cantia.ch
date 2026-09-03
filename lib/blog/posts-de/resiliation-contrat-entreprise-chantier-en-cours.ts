import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'resiliation-contrat-entreprise-chantier-en-cours',
  question: 'Kann ein Kunde einen laufenden Werkvertrag kündigen, und zu welchem Preis?',
  title: 'Kündigung eines Werkvertrags während laufender Baustelle: was Art. 377 OR vorsieht',
  description:
    'Ein Bauherr kann einen Werkvertrag jederzeit kündigen, selbst mitten in der Baustelle, doch Art. 377 OR verpflichtet ihn, Sie vollständig zu entschädigen. So funktioniert es.',
  excerpt:
    'Ein Kunde kann eine Baustelle von einem Tag auf den anderen stoppen, ohne dass Sie einen Fehler gemacht haben. Das Gesetz verhindert das nicht, schützt Sie aber finanziell – sofern Sie richtig kalkulieren können.',
  category: 'Juridique & normes',
  keywords: ['werkvertrag kündigung baustelle', 'art 377 or', 'baustelle abgebrochen', 'entschädigung unternehmer', 'werkvertrag recht schweiz'],
  publishedAt: '2026-08-27',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Das ist eine Situation, die viele Handwerker aus der Fassung bringt: Ein Kunde kündigt an, die Baustelle abzubrechen, ohne konkrete Beanstandung an der ausgeführten Arbeit. Erste, oft falsche Reaktion: zu denken, ein unterzeichneter Vertrag könne nicht einseitig aufgelöst werden. Im Schweizer Recht geht das durchaus, und es ist sogar ausdrücklich gesetzlich vorgesehen.',
    },
    { type: 'h2', text: 'Art. 377 OR: eine jederzeit mögliche Kündigung' },
    {
      type: 'p',
      text: 'Artikel 377 des Obligationenrechts erlaubt es dem Bauherrn, den Vertrag jederzeit zu kündigen, solange das Werk nicht vollendet ist, ohne einen Grund oder ein Verschulden des Unternehmers nachweisen zu müssen. Dieses Recht besteht gerade deshalb, weil die Gegenleistung klar ist: Der Kunde, der davon Gebrauch macht, muss den Unternehmer für den gesamten durch den Abbruch verursachten Schaden entschädigen.',
    },
    {
      type: 'callout',
      title: 'Die Entschädigung beschränkt sich nicht auf die bereits geleistete Arbeit',
      text: 'Art. 377 OR sieht die Rückerstattung der getätigten Auslagen, die Vergütung der bereits ausgeführten Arbeit und den entgangenen Gewinn vor, den der Unternehmer bei Fertigstellung der Baustelle erzielt hätte, abzüglich dessen, was er durch das Nichtfertigstellen erspart hat.',
    },
    { type: 'h2', text: 'Was man beweisen können muss, um korrekt entschädigt zu werden' },
    {
      type: 'list',
      items: [
        'Die genaue Aufstellung der Stunden und Materialien, die auf genau dieser Baustelle bereits eingesetzt wurden, keine globale Schätzung',
        'Die angenommene ursprüngliche Offerte, die als Grundlage für die Berechnung des entgangenen Gewinns auf dem nicht ausgeführten Teil dient',
        'Die bereits getätigten (und nicht mehr stornierbaren) Materialbestellungen zum Zeitpunkt des Abbruchs',
        'Das genaue Datum der Kündigungsmitteilung, Ausgangspunkt der Berechnung',
      ],
    },
    {
      type: 'p',
      text: 'Genau hier entscheiden sich die meisten Streitfälle: Ohne klaren Verlauf dessen, was chantier für chantier fakturiert, kalkuliert oder ausgeführt wurde, verhandelt der Unternehmer seine eigene Entschädigung im Blindflug, und der Kunde hat allen Grund, sie kleinzurechnen. Eine nach Positionen detaillierte Offerte mit Nachverfolgung dessen, was davon tatsächlich fakturiert wurde, verwandelt eine unklare Verhandlung in eine überprüfbare Rechnung.',
    },
    {
      type: 'cta',
      title: 'Ein klarer Verlauf, Baustelle für Baustelle',
      text: 'Cantia verknüpft jede Offerte, Rechnung und Anzahlung mit der zugehörigen Baustelle. So lässt sich in wenigen Klicks rekonstruieren, was eingesetzt und fakturiert wurde, falls ein Kunde eine laufende Baustelle abbricht.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Kann ein Kunde einen Werkvertrag ohne Grund kündigen?',
      answer:
        'Ja, Art. 377 OR erlaubt dies jederzeit, solange das Werk nicht vollendet ist, ohne dass ein Verschulden des Unternehmers nachgewiesen werden muss.',
    },
    {
      question: 'Was muss ein Kunde zahlen, der eine laufende Baustelle kündigt?',
      answer:
        'Die bereits ausgeführte Arbeit, die getätigten Auslagen und den entgangenen Gewinn auf dem nicht ausgeführten Teil, abzüglich der Ersparnisse des Unternehmers durch die Nichtfertigstellung.',
    },
    {
      question: 'Braucht es einen schriftlichen Grund, damit die Kündigung gültig ist?',
      answer:
        'Nein, das Gesetz verlangt keine Begründung, aber eine klare, datierte Mitteilung legt den Ausgangspunkt für die Berechnung der Entschädigung fest.',
    },
  ],
  relatedSlugs: [
    'client-refuse-payer-solde-final-que-faire',
    'validite-devis-signe-prix-qui-bouge',
    'defaut-construction-decouvert-apres-reception-qui-paie',
  ],
};
