import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'demarrer-entreprise-batiment-outils-indispensables',
  question: 'Welche Werkzeuge sind wirklich unverzichtbar, um ein Bauunternehmen zu gründen?',
  title: 'Das eigene Bauunternehmen gründen: die wirklich unverzichtbaren Werkzeuge',
  description:
    'Zwischen dem, was unverzichtbar ist, und dem, was warten kann: die Liste der Werkzeuge, die ein Bauunternehmen ab dem ersten Tag braucht, ohne Überflüssiges.',
  excerpt:
    'Beim Start ist die Versuchung gross, sich sofort mit allem auszustatten. In Wirklichkeit sind nur sehr wenige Werkzeuge ab dem ersten Tag wirklich unverzichtbar, der Rest kann warten.',
  category: 'Comparatifs & outils',
  keywords: ['unverzichtbare Werkzeuge Unternehmensgründung Bau', 'Checkliste Gründung Handwerker', 'was braucht es für Baufirma', 'Grundausstattung neues Bauunternehmen', 'wesentliche Werkzeuge Handwerker Schweiz'],
  publishedAt: '2026-07-31',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Die Gründung eines Bauunternehmens bringt eine lange Liste von Entscheidungen mit sich (Rechtsform, Versicherungen, Fahrzeug, Werkzeugausstattung), und es ist leicht, sich auch bei den digitalen Werkzeugen zu verzetteln. In Wirklichkeit sind nur sehr wenige davon ab dem ersten Tag wirklich unverzichtbar.',
    },
    { type: 'h2', text: 'Das absolut Nötigste ab dem ersten Tag' },
    {
      type: 'list',
      items: [
        'Ein Werkzeug zur Erstellung konformer Offerten und Rechnungen (das Herzstück jeder Tätigkeit, ab dem ersten Kunden)',
        'Eine Betriebshaftpflichtversicherung, in den meisten Fällen rechtlich nicht verhandelbar',
        'Ein einfaches Mittel zur Dokumentation der Baustellen (Fotos), zum Schutz bei einem künftigen Streit',
      ],
    },
    { type: 'h2', text: 'Was ein paar Monate warten kann' },
    {
      type: 'list',
      items: [
        'Ein vollständiges HR-Modul (nutzlos, solange kein Mitarbeiter beschäftigt wird)',
        'Ein Planungstool für mehrere Teams (relevant erst, sobald mehrere Baustellen parallel laufen)',
        'Eine detaillierte Rentabilitätsanalyse pro Baustelle (nützlich, sobald das Volumen es rechtfertigt, nicht davor)',
      ],
    },
    {
      type: 'stat',
      value: '2-3',
      label: 'digitale Werkzeuge genügen in der Regel, um den tatsächlichen Bedarf eines Bauunternehmens in den ersten Monaten seiner Tätigkeit abzudecken',
    },
    {
      type: 'callout',
      title: 'Ein einfaches, gut genutztes Werkzeug ist besser als ein komplettes, schlecht ausgeschöpftes Paket',
      text: 'Sich von Anfang an mit allem auszustatten, ohne die Zeit zu haben, jedes Modul zu lernen, führt oft zu einem unterausgeschöpften Werkzeug. Eine schrittweise Auswahl bleibt wirksamer.',
    },
    {
      type: 'cta',
      title: 'Einfach beginnen, den Rest später aktivieren',
      text: 'Cantia erlaubt einen Start mit Offerten, Rechnungen und Baustellen, um dann Personal & Löhne, Planung oder Liquidität nach und nach zu aktivieren, während das Unternehmen wächst.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Welche digitalen Werkzeuge sind wirklich unverzichtbar für die Gründung eines Bauunternehmens?',
      answer:
        'Vor allem ein konformes Offerten-/Rechnungstool und ein einfaches Mittel, um Baustellen mit Fotos zu dokumentieren: der Rest kann schrittweise aktiviert werden.',
    },
    {
      question: 'Braucht es ein HR-Modul bereits bei der Unternehmensgründung?',
      answer:
        'Nein, ein HR-Modul ist erst ab der ersten Anstellung nützlich, es also vor dem tatsächlichen Bedarf einzurichten ist unnötig.',
    },
    {
      question: 'Ist es besser, sich schrittweise statt auf einmal auszustatten?',
      answer:
        'In der Regel ja: Ein einfaches, von Anfang an gut beherrschtes Werkzeug ist wirksamer als ein komplettes Paket, dessen Funktionen mangels Zeit zum Lernen grösstenteils ungenutzt bleiben.',
    },
  ],
  relatedSlugs: [
    'checklist-logiciels-ouverture-societe-construction',
    'quel-logiciel-choisir-demarrer-entreprise-construction',
    'lancer-entreprise-batiment-suisse-par-ou-commencer',
  ],
};
