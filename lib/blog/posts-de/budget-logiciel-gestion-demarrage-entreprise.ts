import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'budget-logiciel-gestion-demarrage-entreprise',
  question: 'Welches Budget sollte man für Verwaltungssoftware bei der Gründung eines Bauunternehmens einplanen?',
  title: 'Welches Softwarebudget bei der Unternehmensgründung einplanen',
  description:
    'Zwischen Verwaltungssoftware, Buchhaltung und ergänzenden Tools: Wie viel sollte ein neu gegründetes Bauunternehmen wirklich für seine digitalen Werkzeuge einplanen.',
  excerpt:
    'Das Softwarebudget eines startenden Unternehmens wird beim Businessplan oft unterschätzt. Es zeigt sich dann Posten für Posten in den ersten Monaten der Tätigkeit.',
  category: 'Comparatifs & outils',
  keywords: ['softwarebudget unternehmensgründung', 'kosten digitale tools baugewerbe kmu', 'businessplan verwaltungssoftware', 'it-budget unternehmensgründung planen', 'software ausgaben gründung'],
  publishedAt: '2026-07-22',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Ein Businessplan zur Gründung eines Bauunternehmens listet oft Werkzeuge, Fahrzeug und Versicherungen detailliert auf, vergisst aber manchmal den Softwareposten, der dennoch jeden Monat wiederkehrt. Ein realistisches Budget verhindert die böse Überraschung beim ersten Kontoauszug.',
    },
    { type: 'h2', text: 'Die einzuplanenden Softwareposten' },
    {
      type: 'list',
      items: [
        'Ein Verwaltungstool (Offerten, Rechnungen, Baustelle): in der Regel zwischen CHF 30 und 90 pro Monat, je nach Bedarf',
        'Ein Zugang zu einer Treuhandstelle oder Buchhaltung, punktuell oder regelmässig je nach Aktivitätsvolumen',
        'Eine Berufshaftpflichtversicherung, unerlässlich und in der «Software»-Rechnung oft vernachlässigt',
        'Allfällige ergänzende Tools (Website, soziale Netzwerke), sofern die Kundengewinnung davon abhängt',
      ],
    },
    {
      type: 'stat',
      value: '1-2 %',
      label: 'Anteil am Umsatz, den digitale Werkzeuge bei einem kleinen Bauunternehmen nach der Stabilisierung der Tätigkeit üblicherweise ausmachen',
    },
    { type: 'h2', text: 'Ein einziges Tool ist oft günstiger als mehrere separate Tools' },
    {
      type: 'p',
      text: 'Ein Offert-Tool, eine kostenpflichtige Stundentabelle und eine separate Baustellen-App zusammenzurechnen übersteigt oft den Preis eines gleichwertigen Alles-in-einem-Tools (ganz zu schweigen von der verlorenen Zeit, sie miteinander kommunizieren zu lassen).',
    },
    {
      type: 'callout',
      title: 'Ein Softwarebudget schon im Businessplan einzuplanen verhindert eine übereilte Wahl',
      text: 'Sein Verwaltungstool unter Druck zu wählen, wenn die ersten Kunden bereits auf Offerten warten, führt oft zu einer Standardwahl statt zu einer durchdachten Entscheidung.',
    },
    {
      type: 'cta',
      title: 'Ein klarer Preis, schon im Businessplan einzuplanen',
      text: 'Cantia bietet einfache und vorhersehbare Tarife mit 14 Tagen kostenloser Testphase ab der Kontoerstellung, um es zu testen, bevor man es definitiv ins Budget aufnimmt.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Welchen Anteil des Umsatzes machen digitale Werkzeuge in der Regel aus?',
      answer:
        'Rund 1 bis 2 % für ein kleines Bauunternehmen nach der Stabilisierung der Tätigkeit – ein Posten, der in ersten Businessplänen oft unterschätzt wird.',
    },
    {
      question: 'Muss die Verwaltungssoftware im Businessplan der Unternehmensgründung enthalten sein?',
      answer:
        'Ja: Es handelt sich um eine wiederkehrende monatliche Ausgabe, die eine eigene Budgetzeile verdient, genau wie die Werkzeugausrüstung oder die Berufshaftpflichtversicherung.',
    },
    {
      question: 'Ist ein Alles-in-einem-Tool wirklich günstiger als mehrere separate Tools?',
      answer:
        'Oft ja, sobald man die Preise jedes einzelnen Tools zusammenzählt (ganz zu schweigen von der verlorenen Zeit, um Systeme, die nicht miteinander kommunizieren, zu verbinden).',
    },
  ],
  relatedSlugs: [
    'combien-coute-logiciel-facturation-pas-cher',
    'checklist-logiciels-ouverture-societe-construction',
    'demarrer-entreprise-batiment-outils-indispensables',
  ],
};
