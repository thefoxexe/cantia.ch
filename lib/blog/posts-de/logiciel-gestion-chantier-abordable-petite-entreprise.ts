import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-gestion-chantier-abordable-petite-entreprise',
  question: 'Gibt es eine erschwingliche Software für die Baustellenverwaltung für ein kleines Unternehmen?',
  title: 'Eine erschwingliche Software für die Baustellenverwaltung gibt es wirklich',
  description:
    'Baustellendokumentation war lange grossen Unternehmen mit teuren Tools vorbehalten. Was sich geändert hat, und warum ein kleiner Betrieb heute leicht Zugang dazu erhält.',
  excerpt:
    'Lange grossen Bauunternehmen vorbehalten, ist die digitale Baustellendokumentation heute auch für kleine Betriebe zugänglich, oft schon zum Preis eines bescheidenen Monatsabonnements.',
  category: 'Comparatifs & outils',
  keywords: ['erschwingliche baustellensoftware', 'baustellendokumentation günstig', 'baustellen tool kleinunternehmen', 'baustellen app schweiz preiswert', 'baustellenverwaltung sparsam'],
  publishedAt: '2026-07-25',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Die digitale Baustellendokumentation (Fotos, Fortschritt, Dokumente) galt lange als Werkzeug für grosse Unternehmen, mit Kosten und Komplexität, die kleine Betriebe abschreckten. Dieses Bild entspricht nicht mehr dem heutigen Angebot.',
    },
    { type: 'h2', text: 'Was sich geändert hat' },
    {
      type: 'list',
      items: [
        'Die Baustellendokumentation ist heute oft in einem erschwinglichen Monatsabonnement enthalten, nicht als teures separates Modul verkauft',
        'Moderne mobile Apps machen das Fotografieren und Dokumentieren so einfach wie eine Textnachricht',
        'Cloud-Speicher hat die Kosten für die langfristige Aufbewahrung von Fotos und Dokumenten gesenkt',
      ],
    },
    {
      type: 'stat',
      value: 'CHF 30-60',
      label: 'typische Monatskosten für eine digitale Baustellendokumentation, enthalten in einem für Kleinunternehmen konzipierten Verwaltungstool, gegenüber mehreren hundert Franken für frühere dedizierte Lösungen',
    },
    { type: 'h2', text: 'Was eine erschwingliche Baustellendokumentation trotzdem abdecken muss' },
    {
      type: 'p',
      text: 'Der tiefe Preis darf nicht auf Kosten des Wesentlichen gehen: geolokalisierte und zeitgestempelte Fotos (bei Streitfällen nützlich), Organisation nach Baustelle und einfacher Zugriff vom Telefon aus. Ein Tool, das diese drei Punkte erfüllt, bleibt erschwinglich, ohne eingeschränkt zu sein.',
    },
    {
      type: 'callout',
      title: 'Die wahren Kosten fehlender Baustellendokumentation',
      text: 'Ohne regelmässige Dokumentation wird eine Kundenbeanstandung oder eine Meinungsverschiedenheit mit einem Subunternehmer viel schwerer zu klären. Die Kosten des fehlenden Tools übersteigen oft die Kosten des Tools selbst.',
    },
    {
      type: 'cta',
      title: 'Die Baustellendokumentation inklusive, keine teure Option',
      text: 'Cantia integriert die Baustellendokumentation (Fotos, Fortschritt, Dokumente) direkt in seine Pläne, ohne versteckte Mehrkosten.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ist die digitale Baustellendokumentation grossen Unternehmen vorbehalten?',
      answer:
        'Nein: Sie ist heute für kleine Betriebe zugänglich, oft in einem erschwinglichen Monatsabonnement enthalten statt als teures separates Modul verkauft.',
    },
    {
      question: 'Was kostet eine Baustellendokumentation typischerweise für ein kleines Unternehmen?',
      answer:
        'In der Regel zwischen CHF 30 und 60 pro Monat, integriert in ein umfassenderes Verwaltungstool statt als eigenständiger Dienst fakturiert.',
    },
    {
      question: 'Was muss eine Baustellendokumentation auch bei einem erschwinglichen Angebot abdecken?',
      answer:
        'Mindestens geolokalisierte und zeitgestempelte Fotos, eine klare Organisation nach Baustelle und ein einfacher Zugriff vom Telefon aus.',
    },
  ],
  relatedSlugs: [
    'photos-chantier-preuve-juridique-litige',
    'application-hors-ligne-chantier-pourquoi-important',
    'combien-coute-logiciel-gestion-chantier-roi',
  ],
};
