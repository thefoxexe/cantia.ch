import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-plombier-sanitaire-suisse',
  question: 'Wie sollte ein Sanitärinstallateur eine Offerte kalkulieren und ungeplante Notfälle abrechnen?',
  title: 'Sanitärinstallateur: richtig kalkulieren zwischen geplanter Offerte und ungeplantem Notfall',
  description:
    'Zwischen der Offerte für ein komplettes Badezimmer und der Reparatur eines Lecks an einem Sonntagabend jongliert der Sanitärinstallateur mit zwei gegensätzlichen Abrechnungslogiken. Wie man beide im selben Werkzeug strukturiert, ohne dabei zu verlieren.',
  excerpt:
    'Eine Offerte für eine Badsanierung wird in Ruhe vorbereitet. Ein Notfalleinsatz wird unter Zeitdruck abgerechnet, oft ohne vor dem Einsatz Zeit gehabt zu haben, überhaupt etwas aufzuschreiben. Beide Logiken müssen dennoch im selben Werkzeug nebeneinander bestehen.',
  category: 'Métiers du bâtiment',
  keywords: ['Offerte Sanitärinstallateur', 'Abrechnung Sanitär Schweiz', 'Tarif Notfalleinsatz Installateur', 'Software Sanitärverwaltung', 'Offerte Badsanierung'],
  publishedAt: '2026-09-01',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Die Sanitärinstallation deckt zwei sehr unterschiedliche Realitäten ab: die geplante Baustelle (Badsanierung, Ersatz eines Boilers, Neuanschluss), die in Ruhe vor dem Einsatz kalkuliert wird, und der Notfalleinsatz (Leck, verstopfte Leitung, Heizungsausfall), der im Nachhinein abgerechnet wird, oft ausserhalb der üblichen Arbeitszeiten. Beide in einem einzigen Tarif zu vermischen, benachteiligt am Ende immer einen der beiden Fälle.',
    },
    { type: 'h2', text: 'Die geplante Offerte: detaillieren, um Beanstandungen zu vermeiden' },
    {
      type: 'list',
      items: [
        'Rückbau der bestehenden Installation und Entsorgung (oft vergessen, dabei zeitaufwendig)',
        'Lieferung des Sanitärmaterials (Sanitärgegenstände, Armaturen, Rohrleitungen), getrennt von der Montage',
        'Anschlüsse und Abdichtung, mit einer klaren Pauschale pro Wasserstelle',
        'Inbetriebnahme und Funktionstests vor der Abnahme',
      ],
    },
    { type: 'h2', text: 'Der Notfalleinsatz: ein klarer Tarif, vor dem Einsatz kommuniziert' },
    {
      type: 'p',
      text: 'Bei einem Notfall akzeptiert der Kunde selten, über einen Preis zu verhandeln, während das Wasser weiterläuft. Der beste Schutz, sowohl für den Installateur als auch für den Kunden, bleibt ein vorab klar kommunizierter Notfalltarif (Anfahrt, Stundensatz, allfälliger Zuschlag für Abend/Wochenende), damit die im Nachhinein versendete Rechnung nie eine Überraschung darstellt.',
    },
    {
      type: 'stat',
      value: '2x',
      label: 'üblicher Zuschlag, der bei Notfalleinsätzen am Abend, am Wochenende oder an Feiertagen im Vergleich zum Standardtarif tagsüber angewendet wird',
    },
    {
      type: 'callout',
      title: 'Ein nicht sofort verrechneter Notfalleinsatz sollte schnell danach in Rechnung gestellt werden',
      text: 'Ein Notfalleinsatz ohne sofortige Rechnung lässt sich umso besser verrechnen, je schneller die Rechnung versendet wird: Der Kunde erinnert sich noch klar an den Einsatz, und die Akzeptanz des Preises fällt natürlicher aus als Wochen später.',
    },
    {
      type: 'cta',
      title: 'Eine Rechnung direkt von der Baustelle aus, auch für Notfälle',
      text: 'Mit Cantia wird ein Notfalleinsatz in wenigen Minuten vom Telefon aus zur Rechnung, ohne zurück ins Büro zu müssen oder einen Notfall wochenlang unfakturiert liegenzulassen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Wie unterscheidet man den Tarif einer geplanten Offerte von einem Notfalleinsatz in der Sanitärinstallation?',
      answer:
        'Indem man zwei getrennte Logiken anwendet: eine detaillierte Offerte Posten für Posten für geplante Baustellen, und einen vorab klar kommunizierten Notfalltarif (Anfahrt, Stundensatz, allfälliger Zuschlag) für Notfälle.',
    },
    {
      question: 'Darf man einen Notfalleinsatz abends oder am Wochenende teurer verrechnen?',
      answer:
        'Ja, das ist eine übliche und legitime Praxis in der Branche, sofern der Zuschlag vor dem Einsatz kommuniziert wird, statt erst auf der Rechnung entdeckt zu werden.',
    },
    {
      question: 'Sollte man Lieferung des Sanitärmaterials und Montage auf der Offerte trennen?',
      answer:
        'Das wird empfohlen: So versteht der Kunde die Preisaufteilung, und Anpassungen fallen leichter, falls sich das gewählte Material während des Projekts ändert.',
    },
  ],
  relatedSlugs: [
    'facturer-acompte-suisse-securiser-solde',
    'relancer-client-facture-impayee-sans-perdre-client',
    'application-hors-ligne-chantier-pourquoi-important',
  ],
  relatedTradeSlug: 'plombier',
};
