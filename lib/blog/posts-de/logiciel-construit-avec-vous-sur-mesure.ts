import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-construit-avec-vous-sur-mesure',
  question: 'Was ändert sich, wenn eine Software mit Ihnen statt für alle gebaut wird?',
  title: 'Eine Software, mit Ihnen gebaut, nicht nur an alle verkauft',
  description:
    'Ein Anbieter, der ein starres Produkt verkauft, und ein Anbieter, der mit seinen Kunden baut, bieten nicht dieselbe Erfahrung: Das ändert sich konkret für ein Bauunternehmen.',
  excerpt:
    'Die meisten Softwarelösungen werden einmal konzipiert, für einen imaginären Durchschnittskunden, und dann so an alle verkauft. Eine mit den Kunden gebaute Software folgt einer anderen Logik, näher an der Praxis.',
  category: 'Sur-mesure & automatisations',
  keywords: ['software mit ihnen gebaut', 'anbieter der kunden zuhört', 'kollaborative verwaltungssoftware bau', 'produkt das mit feedback wächst', 'cantia entwicklung mit kunden'],
  publishedAt: '2026-08-28',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Die meisten Verwaltungssoftwares werden einmal konzipiert, für ein anfangs imaginiertes «durchschnittliches» Kundenprofil, und dann so an eine ganze Branche verkauft. Es gibt einen anderen Ansatz: das Werkzeug direkt mit den Unternehmen zu bauen, die es nutzen, Funktion für Funktion, Rückmeldung für Rückmeldung.',
    },
    { type: 'h2', text: 'Was sich konkret ändert' },
    {
      type: 'list',
      items: [
        'Neue Funktionen entstehen oft aus einem realen, von einem Kunden gemeldeten Bedürfnis, nicht aus einer abstrakten internen Idee',
        'Ein Problem, das in der Praxis auftritt, kann direkt gemeldet werden, ohne über einen anonymen Kundendienst zu gehen',
        'Das Werkzeug entwickelt sich im Rhythmus der echten Bedürfnisse des Schweizer Bauwesens, nicht nach einer im Voraus fixierten Roadmap',
        'Eine Funktion, die einem bestimmten Unternehmen nützt, kommt danach oft allen anderen zugute',
      ],
    },
    {
      type: 'stat',
      value: '20+',
      label: 'Schweizer Bauunternehmen begleiten bereits die Entwicklung von Cantia, mit Rückmeldungen, die die nächsten Funktionen direkt mitgestalten',
    },
    { type: 'h2', text: 'Was das nicht bedeutet' },
    {
      type: 'p',
      text: 'Mit den Kunden zu bauen bedeutet nicht, für jeden eine völlig andere Version zu entwickeln: Der Standardkern bleibt für alle gemeinsam. Was sich ändert, ist die Fähigkeit, ihn tatsächlich anzupassen, statt ein starres Produkt aufzuzwingen, das nie weiterentwickelt wird.',
    },
    {
      type: 'callout',
      title: 'Eine Rückmeldung, selbst eine kleine, kann wirklich etwas bewegen',
      text: 'Eine Bemerkung zu einem Detail, das im Alltag hakt, hat oft mehr Einfluss auf die Weiterentwicklung des Werkzeugs, als man denkt, denn genau solches Feedback liegt direkt mehreren bereits in Cantia bestehenden Funktionen zugrunde.',
    },
    {
      type: 'cta',
      title: 'Ihre Meinung gestaltet das Werkzeug direkt mit',
      text: 'Bei Cantia zählt jede Rückmeldung wirklich für die Weiterentwicklung des Produkts. Testen Sie es kostenlos und sagen Sie uns, was besser zu Ihrer Arbeitsweise passen könnte.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Was unterscheidet eine «mit den Kunden gebaute» Software von einer klassischen Software?',
      answer:
        'Neue Funktionen entstehen oft aus realen, direkt von Kunden gemeldeten Bedürfnissen, statt aus einer allein intern entschiedenen Roadmap.',
    },
    {
      question: 'Entwickelt eine mit den Kunden gebaute Software für jeden eine andere Version?',
      answer:
        'Nein, der Standardkern bleibt für alle gemeinsam: Der Unterschied liegt in der Fähigkeit, ihn aufgrund von Rückmeldungen aus der Praxis tatsächlich anzupassen, statt starr zu bleiben.',
    },
    {
      question: 'Wie kann eine Kundenrückmeldung die Weiterentwicklung des Werkzeugs konkret beeinflussen?',
      answer:
        'Ein im Alltag auftretendes und direkt gemeldetes Problem kann zu einer neuen Funktion führen, die danach allen Nutzern des Werkzeugs zugutekommt.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'demander-fonctionnalite-sur-mesure-editeur-logiciel',
    'logiciel-standard-vs-solution-personnalisee-batiment',
  ],
};
