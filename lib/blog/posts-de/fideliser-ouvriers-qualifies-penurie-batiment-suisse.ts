import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'fideliser-ouvriers-qualifies-penurie-batiment-suisse',
  question: 'Wie kann ein Bauunternehmen seine qualifizierten Arbeiter angesichts des Fachkräftemangels binden?',
  title: 'Qualifizierte Arbeiter binden, wenn Fachkräfte knapp werden',
  description:
    'Einen qualifizierten Arbeiter zu rekrutieren, ist teuer und zeitaufwendig. Einen bereits ausgebildeten zu halten, kostet fast immer weniger. Die konkreten Hebel zur Mitarbeiterbindung in einem angespannten Sektor.',
  excerpt:
    'In einer Branche, in der sich jedes Unternehmen um dieselben qualifizierten Profile streitet, ist die Mitarbeiterbindung kein Nebenthema der Personalabteilung mehr: Sie ist zu einem echten Wettbewerbshebel geworden.',
  category: 'Croissance & acquisition',
  keywords: ['fachkräfte binden baugewerbe', 'fachkräftemangel bau schweiz', 'mitarbeiter halten bauunternehmen', 'rekrutierung baustelle schwierig', 'fluktuation qualifizierte arbeiter'],
  publishedAt: '2026-09-18',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Die Baubranche steht in mehreren Berufsgattungen in der Schweiz vor einem strukturellen Mangel an qualifizierten Fachkräften. In diesem Kontext kostet der Ersatz eines guten Arbeiters, der zur Konkurrenz wechselt, an Zeit und Geld oft mehr als die Anstrengungen, die nötig wären, um seinen Weggang zu verhindern.',
    },
    { type: 'h2', text: 'Was einen qualifizierten Arbeiter wirklich hält' },
    {
      type: 'list',
      items: [
        'Ein marktgerechter oder leicht überdurchschnittlicher Lohn (der GAV setzt eine Untergrenze, keine Obergrenze)',
        'Eine klare Organisation der Baustellen, ohne dauernde Improvisation, die das Team auf Dauer zermürbt',
        'Korrekt erfasste und bezahlte Stunden, einschliesslich Überstunden, ohne systematisches Verhandeln',
        'Eine konkrete Anerkennung guter Arbeit, nicht nur das Ausbleiben von Tadel',
      ],
    },
    {
      type: 'stat',
      value: '3-6 Monate',
      label: 'durchschnittliche Frist, die häufig nötig ist, um in bestimmten angespannten Berufsgattungen des Bauwesens eine qualifizierte Ersatzkraft zu rekrutieren und einzuarbeiten',
    },
    { type: 'h2', text: 'Transparenz bei den Stunden zählt mehr, als man denkt' },
    {
      type: 'p',
      text: 'Ein Arbeiter, der regelmässig seine Überstunden einfordern muss oder Fehler auf seiner Lohnabrechnung entdeckt, verliert viel schneller das Vertrauen, als er es zeigt. Ein klares System der Stundenerfassung mit einer transparenten und zugänglichen Abrechnung reduziert diese stillen Reibungspunkte, die am Ende dazu führen, dass eine gute Fachkraft das Unternehmen verlässt.',
    },
    {
      type: 'callout',
      title: 'Einen Lernenden auszubilden ist auch eine langfristige Bindungsstrategie',
      text: 'Ein intern ausgebildeter Lernender, der die Methoden und das Team des Unternehmens bereits kennt, kündigt statistisch seltener als ein extern rekrutiertes Profil. Ausbildung ist damit ebenso eine Bindungsinvestition wie eine Kompetenzinvestition.',
    },
    {
      type: 'cta',
      title: 'Transparente Stunden und Löhne, ohne Reibung',
      text: 'Cantia ermöglicht es jedem Mitarbeitenden, seine Stunden einfach von der Baustelle aus zu erfassen, mit einer klaren Abrechnung, um Missverständnisse bei Überstunden zu vermeiden, die das Vertrauen auf Dauer untergraben.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Warum ist die Mitarbeiterbindung im Baugewerbe zu einer strategischen Frage geworden?',
      answer:
        'Weil der Mangel an qualifizierten Fachkräften den Ersatz einer guten Fachkraft langwierig und teuer macht (oft mehrere Monate zwischen Weggang und voller Produktivität einer Ersatzkraft).',
    },
    {
      question: 'Ist der Lohn der wichtigste Faktor für die Bindung eines qualifizierten Arbeiters?',
      answer:
        'Es ist ein wichtiger Faktor, aber selten der einzige. Die Organisation der Baustellen, die Transparenz bei den Stunden und die Anerkennung der Arbeit spielen oft eine ebenso entscheidende Rolle.',
    },
    {
      question: 'Lohnt sich die Ausbildung eines Lernenden für ein kleines Bauunternehmen?',
      answer:
        'Auf Dauer meist ja: Ein intern ausgebildeter Lernender kennt die Methoden des Unternehmens bereits und weist oft eine geringere Kündigungsrate auf als ein extern rekrutiertes Profil.',
    },
  ],
  relatedSlugs: [
    'sous-effectif-chantier-recruter-ou-sous-traiter',
    'heures-supplementaires-batiment-majoration-25',
    'apprenti-batiment-salaire-obligations-employeur',
  ],
};
