import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'duree-conservation-devis-factures-suisse',
  question: 'Wie lange müssen Offerten und Rechnungen in der Schweiz aufbewahrt werden?',
  title: 'Wie lange müssen Offerten und Rechnungen in der Schweiz aufbewahrt werden?',
  description:
    'Das Obligationenrecht (Art. 958f) schreibt eine Aufbewahrungsfrist von 10 Jahren für Buchhaltungsunterlagen vor, Rechnungen eingeschlossen — eine Frist, die ab dem Ende des Geschäftsjahres läuft, nicht ab dem Datum des Dokuments.',
  excerpt:
    'Eine Rechnung vom März 2026 muss bis Ende 2036 zugänglich bleiben, nicht bis März 2036. Ein Berechnungsdetail bei der Frist, das die meisten Unternehmen übersehen.',
  category: 'Juridique & normes',
  keywords: ['aufbewahrung dokumente', 'archivierung rechnungen', 'gesetzliche frist', 'obligationenrecht', 'buchhaltung schweiz'],
  publishedAt: '2026-02-16',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Darf man Offerten und Rechnungen einer vor fünf Jahren abgeschlossenen Baustelle entsorgen? Der Schweizer Grundsatz ist einfach, doch die genaue Berechnung der Frist überrascht fast jeden: Nie zählt das Datum des Dokuments, sondern das Ende des Geschäftsjahres, in das es fällt.',
    },
    { type: 'h2', text: 'Die Regel: 10 Jahre, ab Ende des Geschäftsjahres' },
    {
      type: 'p',
      text: 'Art. 958f OR schreibt vor, Geschäftsbücher, Belege (einschliesslich ausgestellter und erhaltener Rechnungen), Geschäfts- und Revisionsberichte zehn Jahre lang aufzubewahren. Die Frist beginnt nicht am Datum auf dem Dokument, sondern am Ende des Geschäftsjahres, auf das es sich bezieht.',
    },
    {
      type: 'callout',
      title: 'Das Beispiel, das die Berechnung verständlich macht',
      text: 'Eine Rechnung vom 15. März 2026, für ein Unternehmen mit Geschäftsjahresabschluss am 31. Dezember, muss bis zum 31. Dezember 2036 zugänglich bleiben, nicht bis zum 15. März 2036. Neun Monate mehr, als die meisten Leute instinktiv berechnen.',
    },
    { type: 'h2', text: 'Welche Dokumente betroffen sind' },
    {
      type: 'list',
      items: [
        'An Kunden ausgestellte Rechnungen sowie von Lieferanten/Subunternehmern erhaltene Rechnungen',
        'Angenommene Offerten, die als Vertragsgrundlage dienen (der Baustellenbuchhaltung zugeordnet)',
        'Geschäftsbücher und Belege im weiten Sinne',
        'Geschäfts- und Revisionsberichte, sofern vorhanden',
      ],
    },
    { type: 'h2', text: 'Papier oder digital: was das Gesetz tatsächlich akzeptiert' },
    {
      type: 'p',
      text: 'Das Gesetz schreibt keinen bestimmten Datenträger vor: Papier, elektronische Form oder jede gleichwertige Form sind zulässig, sofern der Bezug zu den betreffenden Geschäftsvorfällen gewährleistet bleibt und die Zugänglichkeit während der gesamten gesetzlichen Frist sichergestellt ist. In der Praxis wird eine gut gesicherte digitale Aufbewahrung breit akzeptiert und lässt sich unendlich schneller wiederfinden als ein an einem Nachmittag der Steuerkontrolle durchsuchter Stapel Papierordner.',
    },
    { type: 'h2', text: 'Warum das über die Pflicht hinaus wichtig ist' },
    {
      type: 'p',
      text: 'Eine Offerte oder Rechnung einer mehrere Jahre alten Baustelle schnell wiederzufinden, dient weit über die gesetzliche Konformität hinaus: ein wieder auftauchender Gewährleistungsstreit, eine Steuerkontrolle, oder einfach ein Kunde, der eine Kopie eines alten Dokuments erneut anfordert. Eine nach Baustelle geordnete, durchsuchbare Ablage erspart es, Jahre später eine Festplatte oder ein E-Mail-Postfach zu durchsuchen, oft im ungünstigsten Moment dafür.',
    },
    {
      type: 'cta',
      title: 'Jede Offerte und Rechnung, mit einem Klick auffindbar',
      text: 'Cantia bewahrt automatisch jede erstellte Offerte und Rechnung auf, geordnet nach Baustelle und Kunde, ohne zeitliche Begrenzung und ohne manuelle Ablage, die Sie selbst pflegen müssen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Wie lange muss ein Schweizer Unternehmen seine Rechnungen aufbewahren?',
      answer:
        'Zehn Jahre, gemäss Art. 958f OR, anwendbar auf Buchhaltungsunterlagen, zu denen ausgestellte und erhaltene Rechnungen gehören.',
    },
    {
      question: 'Läuft die 10-Jahres-Frist ab dem Rechnungsdatum?',
      answer:
        'Nein. Sie läuft ab dem Ende des Geschäftsjahres, in das die Rechnung fällt, nicht ab ihrem eigenen Ausstellungsdatum.',
    },
    {
      question: 'Kann man seine Rechnungen ausschliesslich in digitaler Form aufbewahren?',
      answer:
        'Ja, das Gesetz akzeptiert die elektronische Aufbewahrung, sofern der Bezug zu den betreffenden Geschäftsvorfällen gewährleistet bleibt und die Zugänglichkeit während der gesamten gesetzlichen Frist sichergestellt ist.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'norme-sia-118-devis-obligatoire',
    'qr-facture-obligatoire-2026',
  ],
};
