import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'lpp-deuxieme-pilier-independant-batiment',
  question: 'Muss ein Selbstständiger im Bauwesen Beiträge an die 2. Säule (BVG) leisten?',
  title: 'BVG für einen Selbstständigen im Bauwesen: obligatorisch oder nicht?',
  description:
    'Die 2. Säule (BVG) ist für einen Schweizer Selbstständigen nicht obligatorisch, mit Ausnahme bestimmter Bauberufe, die an die Suva gebunden sind. Der vollständige Überblick.',
  excerpt:
    'Das BVG ist für einen Selbstständigen fakultativ. Ausser dass die Suva bei bestimmten Bauberufen anders entscheiden kann, ohne dass Sie jemand vorwarnt.',
  category: 'Juridique & normes',
  keywords: ['bvg', '2. säule', 'selbstständig', 'suva', 'uvg', 'vorsorge'],
  publishedAt: '2026-01-29',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Viele Handwerker, die sich selbstständig machen, gehen davon aus, dass alle Schweizer Sozialversicherungen nach demselben obligatorischen Prinzip funktionieren wie die AHV. Falsch für die 2. Säule. Doch die Antwort wird ernsthaft komplizierter, sobald man in bestimmte, von der Suva erfasste Bauberufe eintaucht.',
    },
    { type: 'h2', text: 'Die allgemeine Regel: fakultativ, Punkt' },
    {
      type: 'p',
      text: 'Für einen Angestellten wird das BVG ab einer bestimmten Lohnschwelle (dem «koordinierten Lohn») obligatorisch. Für einen Selbstständigen bleibt es fakultativ: eine freiwillige Anschliessung an eine Vorsorgeeinrichtung oder die Auffangeinrichtung ist möglich, aber es besteht keine gesetzliche Pflicht.',
    },
    {
      type: 'callout',
      title: 'Warum sich trotzdem freiwillig anschliessen',
      text: 'Ohne 2. Säule zählt ein Selbstständiger für die Altersvorsorge nur auf die AHV und sein privates Sparguthaben. Freiwillige BVG-Beiträge sind zudem steuerlich abzugsfähig, was sie sowohl zu einem Vorsorge- als auch zu einem Steueroptimierungsinstrument macht, das je nach genauer Situation mit einer Fachperson zu beurteilen ist.',
    },
    { type: 'h2', text: 'Die Ausnahme, die alle in die Falle tappen lässt: die UVG/Suva' },
    {
      type: 'p',
      text: 'Was die Sache verkompliziert, ist nicht das BVG direkt, sondern das UVG (Unfallversicherung). Für Angestellte ist es obligatorisch und wird von der Suva in zahlreichen als risikoreich geltenden Bauberufen verwaltet, darunter Rohbau, Bedachung, Gerüstbau und Tiefbau. Für einen Selbstständigen ohne Angestellte bleibt das UVG grundsätzlich fakultativ, ausser bei bestimmten Berufen, bei denen die Suva eine Anschlusspflicht selbst für den Selbstständigen vorschreibt, gestützt auf eine reglementarische Liste, die kaum jemand vor der ersten unterschriebenen Baustelle konsultiert.',
    },
    {
      type: 'list',
      items: [
        'BVG (2. Säule Altersvorsorge): fakultativ für jeden Selbstständigen, ohne berufsbezogene Ausnahme',
        'UVG (Unfall): fakultativ für den Selbstständigen ohne Personal, obligatorisch für dessen Angestellte ab dem ersten Engagierten',
        'Bestimmte Risikoberufe im Bauwesen können auch für den Selbstständigen selbst unter eine obligatorische Suva-Anschlusspflicht fallen (im Einzelfall zu prüfen)',
      ],
    },
    { type: 'h2', text: 'Der eigentliche Wendepunkt: die erste Anstellung' },
    {
      type: 'p',
      text: 'Ein Selbstständiger, der seine erste Mitarbeiterin einstellt, wird im Sinne der Sozialversicherungen zum Arbeitgeber: UVG obligatorisch für diese Mitarbeiterin, BVG obligatorisch, sobald ihr Lohn die jährlich festgelegte Eintrittsschwelle übersteigt. Das ist der am meisten unterschätzte administrative Moment der ersten Anstellung: Die Anzahl der Formulare verdoppelt sich, ohne dass man es kommen sieht.',
    },
    {
      type: 'cta',
      title: 'Die Löhne des Teams, am selben Ort wie die Baustelle',
      text: 'Das Modul Personal & Löhne von Cantia zentralisiert Stunden, Löhne und Lohnnebenkosten Ihres Teams, ohne am Monatsende zwischen drei verschiedenen Tools jonglieren zu müssen.',
      buttonLabel: 'Personal & Löhne entdecken',
    },
  ],
  faq: [
    {
      question: 'Muss ein Selbstständiger im Bauwesen zwingend Beiträge an die 2. Säule leisten?',
      answer:
        'Nein, in der Regel bleibt das BVG für jeden Selbstständigen in der Schweiz fakultativ. Er kann sich freiwillig anschliessen, ist dazu aber gesetzlich nicht verpflichtet.',
    },
    {
      question: 'Kann die Suva einem Selbstständigen ohne Angestellte eine Versicherung vorschreiben?',
      answer:
        'In bestimmten als risikoreich geltenden Bauberufen kann die Anschliessung an die UVG/Suva auch für den Selbstständigen selbst obligatorisch sein, da dies von der genauen ausgeübten Tätigkeit abhängt und bei der Suva zu prüfen ist.',
    },
    {
      question: 'Was geschieht mit der BVG-Pflicht, sobald man eine erste Angestellte beschäftigt?',
      answer:
        'Ab der ersten Angestellten muss der Arbeitgeber sie obligatorisch beim UVG anschliessen, und beim BVG, sobald ihr Jahreslohn die jährlich vom Bund festgelegte Eintrittsschwelle übersteigt.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
