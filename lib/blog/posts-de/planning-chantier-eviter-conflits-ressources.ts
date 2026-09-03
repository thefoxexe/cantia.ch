import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'planning-chantier-eviter-conflits-ressources',
  question: 'Wie vermeidet man, dass dasselbe Team oder dieselbe Maschine gleichzeitig auf zwei Baustellen eingeplant wird?',
  title: 'Planungskonflikte zwischen Baustellen: Wie ein kleines Unternehmen sie wirklich vermeidet',
  description:
    'Ein Arbeiter oder eine Maschine, die am selben Tag doppelt für zwei verschiedene Baustellen eingeplant werden: ein Klassiker, wenn die Planung in mehreren Köpfen oder mehreren getrennten Dateien lebt.',
  excerpt:
    'Fast nie ist es ein Problem des mangelnden guten Willens: Es ist ein Problem der Übersicht. Niemand sieht die gesamte Planung an einem Ort, also kann auch niemand den Konflikt erkennen, bevor er vor Ort eskaliert.',
  category: 'Chantier & rentabilité',
  keywords: ['planungskonflikt baustelle', 'teamplanung bauunternehmen', 'ressourcenplanung mehrere baustellen', 'organisation bauunternehmen', 'gemeinsame baustellenplanung'],
  publishedAt: '2026-07-13',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Sobald ein Unternehmen mehr als zwei oder drei Baustellen parallel betreut, wird das Risiko einer Doppeleinplanung real: ein Arbeiter, der auf einer Baustelle angekündigt ist, obwohl er bereits woanders eingeplant ist, ein Betonmischer oder ein Gerüst, das am selben Tag doppelt reserviert ist. Das Problem ist fast nie mangelnde individuelle Organisation, sondern eher eine fehlende gemeinsame Übersicht über alle Verpflichtungen.',
    },
    { type: 'h2', text: 'Warum das selbst in gut organisierten Teams passiert' },
    {
      type: 'list',
      items: [
        'Die Planung existiert, aber an mehreren verschiedenen Orten: ein Papierkalender im Büro, eine Datei auf dem Computer des Chefs, verstreute WhatsApp-Nachrichten mit den Teamleitern',
        'Eine Änderung in letzter Minute (Verzögerung auf einer Baustelle, unvorhergesehene Abwesenheit) wird nie automatisch auf die anderen betroffenen Baustellen übertragen',
        'Niemand hat gleichzeitig einen Gesamtüberblick über die für die ganze Woche eingesetzten Personen und Geräte',
      ],
    },
    {
      type: 'callout',
      title: 'Die wahren Kosten eines Planungskonflikts sind nicht nur die Verzögerung',
      text: 'Ein in letzter Minute von einer Baustelle zur anderen verlegtes Team verursacht auch eine verlorene Fahrt, einen mit einer nicht angekündigten Verschiebung unzufriedenen Kunden, und oft eine Improvisation, die mehr kostet, als sie an Zeit einsparen soll.',
    },
    { type: 'h2', text: 'Was konkret funktioniert' },
    {
      type: 'list',
      items: [
        'Eine einzige, für das ganze Team sichtbare Planung, statt einer Informationsquelle pro Person',
        'Eine Ansicht pro Person und pro Maschine, nicht nur pro Baustelle, um einen Konflikt zu erkennen, bevor er vor Ort zum Problem wird',
        'Eine Echtzeit-Aktualisierung, zugänglich von der Baustelle aus und nicht nur vom Büro',
      ],
    },
    {
      type: 'cta',
      title: 'Eine Planung, die das ganze Team in Echtzeit sieht',
      text: 'Das Planungsmodul von Cantia zentralisiert Team- und Baustelleneinsätze an einem einzigen, vom Terrain aus zugänglichen Ort. Schluss mit Doppelreservierungen, die zu spät entdeckt werden.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Warum kommt es selbst in organisierten Teams zu Planungskonflikten?',
      answer:
        'Weil die Planung oft an mehreren getrennten Orten existiert (Papierkalender, private Datei, Nachrichten) ohne gemeinsame Übersicht, statt an mangelnder individueller Organisation zu liegen.',
    },
    {
      question: 'Was kostet ein Planungskonflikt zwischen zwei Baustellen wirklich?',
      answer:
        'Über die direkte Verzögerung hinaus entsteht oft eine verlorene Fahrt, ein wegen einer nicht angekündigten Verschiebung unzufriedener Kunde, und eine Last-Minute-Improvisation, die teurer ist als die ursprünglich eingesparte Zeit.',
    },
    {
      question: 'Reicht eine zentralisierte Planung aus, um alle Konflikte zu vermeiden?',
      answer:
        'Sie reduziert das Risiko stark, indem sie einen gemeinsamen Echtzeitüberblick bietet, muss aber bei jeder Änderung aktualisiert werden, um wirklich zuverlässig zu bleiben.',
    },
  ],
  relatedSlugs: [
    'gerer-plusieurs-chantiers-en-parallele-methode',
    'whatsapp-gestion-equipe-chantier-limites',
    'retard-chantier-meteo-obligations-contractuelles',
  ],
};
