import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'estimer-chantier-a-distance-devis-photo',
  question: 'Kann man eine Baustelle seriös aus der Ferne einschätzen, ohne vor Ort zu sein?',
  title: 'Eine Baustelle aus der Ferne einschätzen: Wie weit das vernünftig ist',
  description:
    'Eine Fahrt zu jeder Preisanfrage kostet Zeit, die kaum ein Handwerker verrechnet. Manche Ferneinschätzungen sind zuverlässig, andere ein riskantes Spiel.',
  excerpt:
    'Jeder Termin, der nicht zu einer Baustelle wird, ist Zeit, die dem nächsten Kunden geschenkt wird. Zu wissen, wann man aus der Ferne einschätzt und wann man das ablehnt, lässt sich berechnen.',
  category: 'Chantier & rentabilité',
  keywords: ['offerte aus der ferne', 'einschätzung per foto', 'baustellenbesichtigung', 'kosten vor-ort-termin', 'produktivität handwerker'],
  publishedAt: '2026-05-25',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine einstündige Fahrt zur Einschätzung einer Baustelle führt nur in jedem zweiten Fall tatsächlich zu einem Auftrag. Diese nicht verrechnete Stunde belastet die Rentabilität der Woche direkt. Die Frage lautet nicht «muss man immer vor Ort fahren», sondern «bei welcher Art von Anfrage ist der Termin vor Ort wirklich notwendig».',
    },
    { type: 'h2', text: 'Was sich vernünftig anhand von Fotos einschätzen lässt' },
    {
      type: 'list',
      items: [
        'Ein identischer Ersatz (Fenster, Tür, Sanitärobjekt), dessen Masse der Kunde selbst abmessen kann',
        'Eine standardisierte Leistung mit einem Preis pro Quadratmeter oder pro Einheit, der dem Unternehmen bereits bekannt ist',
        'Eine erste indikative Einschätzung, ausdrücklich als solche gekennzeichnet, damit der Kunde entscheiden kann, ob er den Prozess weiterverfolgt',
      ],
    },
    {
      type: 'callout',
      title: 'Was sich ohne Besichtigung niemals seriös einschätzen lässt',
      text: 'Alles, was den bestehenden baulichen Zustand betrifft (vermuteter tragender Wand, Feuchtigkeit, alte Elektroinstallation), lässt sich nicht anhand von Fotos beurteilen, weil das Risiko einer vagen oder unrealistischen Offerte die durch den ausbleibenden Termin ersparte Zeit bei Weitem übersteigt. Eine Offerte, die auf einer falschen Annahme beruht, kostet durch Nachtragsofferten und verlorenes Vertrauen viel mehr als eine einstündige Besichtigung.',
    },
    { type: 'h2', text: 'Die Methode, die das Risiko auf beiden Seiten begrenzt' },
    {
      type: 'p',
      text: 'Eine Ferneinschätzung klar als indikativ (nicht als Festpreis) darzustellen, schützt das Unternehmen vor einer Verpflichtung auf Basis unvollständiger Informationen und gibt dem Kunden gleichzeitig eine schnelle Grundlage, um weiterzukommen. Die feste Offerte bleibt einer Bestätigung vor Ort vorbehalten, bevor die Arbeiten tatsächlich beginnen, insbesondere bei allem, was Renovationen betrifft.',
    },
    { type: 'h2', text: 'Was das für die Organisation der Woche verändert' },
    {
      type: 'p',
      text: 'Anfragen, die sich tatsächlich aus der Ferne einschätzen lassen, von solchen zu trennen, die einen Termin vor Ort erfordern, gibt Fahrzeit für die Baustellen frei, die sie wirklich brauchen, und erhält gleichzeitig die Zuverlässigkeit der genannten Preise. Diese Auswahl erfolgt bereits beim ersten Kontakt, nicht im Nachhinein.',
    },
    {
      type: 'cta',
      title: 'Eine bezifferte Offerte aus einem einfachen Foto, per Diktat',
      text: 'Mit Cantia wird eine indikative Einschätzung in wenigen Minuten zu einer bezifferten Offerte, ausgehend von Fotos und einer per Sprache diktierten Beschreibung, ohne zwingend einen ersten Termin vor Ort zu benötigen.',
      buttonLabel: 'Sprachdiktat entdecken',
    },
  ],
  faq: [
    {
      question: 'Kann man eine feste Offerte allein anhand von Fotos erstellen?',
      answer:
        'Das ist riskant bei allem, was den bestehenden baulichen Zustand betrifft. Besser ist es dann, eine indikative Einschätzung zu präsentieren und die feste Offerte an eine Besichtigung vor Ort zu knüpfen.',
    },
    {
      question: 'Welche Arbeiten eignen sich am besten für eine Ferneinschätzung?',
      answer:
        'Identische Ersatzarbeiten mit vom Kunden selbst messbaren Massen, oder standardisierte Leistungen mit einem dem Unternehmen bereits bekannten Preis.',
    },
    {
      question: 'Wie begrenzt man das Risiko einer Ferneinschätzung, die sich als falsch erweist?',
      answer:
        'Indem man sie klar als indikativ und unverbindlich darstellt und die feste Offerte einer Bestätigung vor Ort vorbehält.',
    },
  ],
  relatedSlugs: [
    'rediger-devis-qui-inspire-confiance-client',
    'calculer-prix-devis-renovation-suisse',
    'logiciel-gestion-chantier-independant-seul',
  ],
};
