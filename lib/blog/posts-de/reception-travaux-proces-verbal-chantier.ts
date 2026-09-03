import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'reception-travaux-proces-verbal-chantier',
  question: 'Braucht es ein Abnahmeprotokoll, und warum ist es das wichtigste Dokument der Baustelle?',
  title: 'Bauabnahme: warum das Protokoll den Kunden ebenso schützt wie den Unternehmer',
  description:
    'Die Bauabnahme löst die Garantiefrist aus, überträgt die Gefahr und legt die festgestellten Mängel fest. Ohne schriftliches Protokoll wird dieser entscheidende Moment unmöglich zu beweisen.',
  excerpt:
    'Viele Baustellen enden ohne jedes formelle Dokument: nur übergebene Schlüssel und eine letzte bezahlte Anzahlung. Genau das ist der Moment, in dem ein Streitfall mangels Beweis unmöglich zu klären wird.',
  category: 'Juridique & normes',
  keywords: ['bauabnahme protokoll', 'abnahmeprotokoll baustelle', 'baugarantie schweiz', 'baustellenmängel', 'bauende dokumentation'],
  publishedAt: '2026-08-21',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Die Bauabnahme ist der rechtliche Moment, in dem der Bauherr das Werk so annimmt, wie es geliefert wird. Das ist keine untergeordnete Formalität: Es ist das Ereignis, das die Garantiefrist auslöst, die Gefahr vom Unternehmer auf den Kunden überträgt und die Liste der zu diesem genauen Zeitpunkt festgestellten Mängel festhält. Alles, was bei der Abnahme nicht gemeldet wird, lässt sich danach nur schwerer geltend machen.',
    },
    { type: 'h2', text: 'Was das Abnahmeprotokoll enthalten muss' },
    {
      type: 'list',
      items: [
        'Das genaue Datum der Abnahme, Ausgangspunkt der Garantiefrist',
        'Die präzise Liste der an diesem Tag festgestellten Mängel mit ihrer Lage',
        'Die Unterschrift beider Parteien (ohne sie beweist das Dokument im Streitfall nichts)',
        'Die ausdrückliche Erwähnung einer vorbehaltlosen Abnahme, falls kein Mangel festgestellt wird',
      ],
    },
    { type: 'h2', text: 'Was ohne schriftliches Protokoll passiert' },
    {
      type: 'p',
      text: 'Ohne formelles Dokument kann die Abnahme als stillschweigend gelten, was etwa der Fall ist, wenn der Kunde das Werk vorbehaltlos nutzt. Das Problem ist nicht rechtlicher, sondern praktischer Natur: Ohne schriftliches Datum lässt sich weder genau beweisen, wann die Garantiefrist zu laufen begann, noch welche Mängel zu diesem Zeitpunkt bereits bestanden, statt erst danach durch normalen Gebrauch entstanden zu sein.',
    },
    {
      type: 'callout',
      title: 'Ein Kunde, der die Unterschrift verweigert, verhindert die Abnahme nicht',
      text: 'Auch ein vom Unternehmer einseitig erstelltes und dem Kunden lediglich mitgeteiltes Protokoll ist einer völlig fehlenden schriftlichen Spur der Abnahme klar vorzuziehen.',
    },
    {
      type: 'p',
      text: 'Ein bei der Schlüsselübergabe an den Kunden versendeter Baustellenabschlussbericht mit zeitgestempelten Fotos spielt in der Praxis dieselbe schützende Rolle wie ein formelles Protokoll: Er legt ein Datum fest, dokumentiert den Zustand des Werks und liefert eine faktische Grundlage bei einer späteren Beanstandung.',
    },
    {
      type: 'cta',
      title: 'Ein Baustellenabschlussbericht in wenigen Minuten',
      text: 'Cantia erstellt einen PDF-Bericht mit geolokalisierten, zeitgestempelten Fotos, der direkt von der Baustelle aus an den Kunden gesendet werden kann. Ideal, um jede Bauabnahme sauber zu dokumentieren.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Muss die Bauabnahme zwingend schriftlich erfolgen?',
      answer:
        'Das Gesetz schreibt keine strikte Form vor, aber ohne schriftliches und datiertes Dokument wird es im Streitfall sehr schwierig, den genauen Zeitpunkt der Abnahme und die festgestellten Mängel zu beweisen.',
    },
    {
      question: 'Was passiert, wenn der Kunde die Unterschrift des Protokolls verweigert?',
      answer:
        'Auch einseitig erstellt und dem Kunden lediglich mitgeteilt, bleibt das Dokument ein deutlich stärkerer Beweis als das völlige Fehlen einer schriftlichen Spur.',
    },
    {
      question: 'Welche Hauptwirkung hat die Abnahme auf die Garantien?',
      answer:
        'Sie löst den Beginn der Garantiefrist aus (in der Regel 2 oder 5 Jahre je nach Mangelart) und legt die Liste der zu diesem Zeitpunkt bereits bekannten Mängel fest.',
    },
  ],
  relatedSlugs: [
    'garantie-travaux-construction-2-ou-5-ans',
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'photos-chantier-preuve-juridique-litige',
  ],
};
