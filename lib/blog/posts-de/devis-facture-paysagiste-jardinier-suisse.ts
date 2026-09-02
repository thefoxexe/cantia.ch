import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-paysagiste-jardinier-suisse',
  question: 'Wie sollte ein Gartenbauer eine Offerte zwischen einmaliger Gestaltung und wiederkehrendem Unterhalt kalkulieren?',
  title: 'Gartenbauer: Einmalige Gestaltung und wiederkehrenden Unterhalt sauber trennen',
  description:
    'Eine Gartengestaltung und ein Gartenunterhaltsvertrag folgen zwei gegensätzlichen Verrechnungslogiken – die eine projektbezogen, die andere wiederkehrend. So strukturieren Sie beide sauber.',
  excerpt:
    'Ein Gartenbauer verkauft demselben Kunden oft zwei sehr unterschiedliche Dinge: eine einmalige Gestaltung, die einmal verrechnet wird, und einen wiederkehrenden Unterhalt, der das ganze Jahr über verrechnet wird. Wer beides in einer Offerte vermischt, kalkuliert am Ende beides falsch.',
  category: 'Métiers du bâtiment',
  keywords: ['Offerte Gartenbauer', 'Verrechnung Gärtner Schweiz', 'Vertrag Gartenunterhalt Preis', 'Offerte Gartengestaltung', 'wiederkehrende Verrechnung Gartenbau'],
  publishedAt: '2026-09-10',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Die Gestaltung eines Gartens (Erdarbeiten, Bepflanzung, Plattenbelag, automatische Bewässerung) wird wie jede einmalige Baustelle kalkuliert: eine Offerte, eine Ausführung, eine Rechnung. Der anschliessende Unterhalt (Rasenmähen, Schneiden, Jäten) folgt einem völlig anderen Rhythmus, meist monatlich oder saisonal, und verdient einen separaten Vertrag statt einer bei jedem Einsatz neu erstellten Offerte.',
    },
    { type: 'h2', text: 'Einmalige Gestaltung: Posten für Posten kalkulieren' },
    {
      type: 'list',
      items: [
        'Erdarbeiten und Erdabtransport, oft der variabelste Posten je nach Zugänglichkeit des Grundstücks',
        'Pflanzenlieferung, getrennt von der Pflanzzeit, da die Preise je nach Saison stark schwanken',
        'Gartenbau-Maurerarbeiten (Mauern, Plattenbeläge, Einfassungen) pro m² oder pauschal',
        'Automatische Bewässerung und Aussenbeleuchtung, oft an Subunternehmer vergeben, aber in die Gesamtbaustellenverfolgung einzubinden',
      ],
    },
    { type: 'h2', text: 'Wiederkehrender Unterhalt: ein Vertrag, keine wiederholte Offerte' },
    {
      type: 'p',
      text: 'Bei jedem Unterhaltseinsatz eine neue Offerte zu erstellen, ist für alle Beteiligten administrative Zeitverschwendung. Ein Jahres- oder Saisonvertrag mit definierter Einsatzfrequenz und regelmässiger Verrechnung (monatlich oder pro Einsatz) vereinfacht die Verwaltung und sichert ein stabileres wiederkehrendes Einkommen als eine Abfolge von Einzelaufträgen.',
    },
    {
      type: 'stat',
      value: '4-8',
      label: 'typische Jahreseinsätze bei einem Standard-Gartenunterhaltsvertrag für Privatkunden in der Schweiz, ohne aussergewöhnliche Einsätze',
    },
    {
      type: 'callout',
      title: 'Die Saisonalität beeinflusst die Liquidität direkt',
      text: 'Ein Gartenbauer, dessen Aktivität sich auf Frühling und Sommer konzentriert, muss die ruhigeren Monate vorausplanen. Ein über das ganze Jahr unterzeichneter Unterhaltsvertrag glättet einen Teil dieser Saisonalität, im Gegensatz zu einmaligen Baustellen, die im Winter ausbleiben.',
    },
    {
      type: 'cta',
      title: 'Halten Sie Ihre einmaligen Baustellen und Unterhaltsverträge sauber getrennt',
      text: 'Cantia erlaubt es, jede Baustelle unabhängig zu verfolgen (Offerten, Rechnungen und Rentabilität), um Ihre Gestaltungsprojekte klar von Ihren wiederkehrenden Unterhaltsverträgen zu unterscheiden.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Muss man bei jedem Gartenunterhaltseinsatz eine neue Offerte erstellen?',
      answer:
        'Nein: Ein Jahres- oder Saisonvertrag mit definierter Einsatzfrequenz erspart es, bei jedem Einsatz eine neue Offerte zu erstellen, und vereinfacht die wiederkehrende Verrechnung.',
    },
    {
      question: 'Wie kalkuliert man die Pflanzenlieferung in einer Gestaltungsofferte?',
      answer:
        'Getrennt von der Pflanzzeit, da der Pflanzenpreis je nach Saison und Verfügbarkeit stark schwankt. Wer beides in einer Pauschale vermischt, erschwert jede spätere Anpassung.',
    },
    {
      question: 'Wie geht man mit der Saisonalität der Tätigkeit eines Gartenbauers übers Jahr um?',
      answer:
        'Indem man sich über Jahresverträge zum Unterhalt einen wiederkehrenden Einkommensanteil sichert, der die typischerweise ruhigeren Herbst- und Wintermonate teilweise glättet.',
    },
  ],
  relatedSlugs: [
    'previsionnel-tresorerie-entreprise-batiment',
    'facturation-heures-regie-batiment-comment-faire',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
  relatedTradeSlug: 'paysagiste',
};
