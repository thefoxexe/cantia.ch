import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'numerotation-facture-obligations-legales-suisse',
  question: 'Braucht es eine durchgehende Rechnungsnummerierung in der Schweiz, und was riskiert man, wenn man sie nicht einhält?',
  title: 'Rechnungsnummerierung in der Schweiz: Warum die Kontinuität kein Detail ist',
  description:
    'Eine übersprungene, wiederverwendete oder unsortierte Rechnungsnummer fällt bei einer Steuerkontrolle sofort auf, denn die zahlenmässige Kontinuität ist einer der ersten geprüften Punkte.',
  excerpt:
    'Zwei Rechnungen mit derselben Nummer, oder eine Serie, die ohne Erklärung von 042 auf 057 springt: genau die Art von Detail, die eine ESTV-Kontrolle in Sekunden erkennt.',
  category: 'Devis & facturation',
  keywords: ['Rechnungsnummerierung Schweiz', 'Kontinuität Rechnungsnummern', 'Fakturierungspflichten ESTV', 'fehlende Rechnung Steuerkontrolle', 'Rechnungsserie'],
  publishedAt: '2026-06-15',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Die Rechnungsnummerierung ist nicht nur eine Frage der Ordnung: Sie ist einer der ersten Punkte, die bei einer Kontrolle der Eidgenössischen Steuerverwaltung (ESTV) geprüft werden. Eine durchgehende, chronologische Serie beweist, dass keine Rechnung ausgestellt und dann verschwiegen wurde; eine lückenhafte oder unsortierte Serie wirft sofort eine Frage auf.',
    },
    { type: 'h2', text: 'Die einzuhaltenden Grundregeln' },
    {
      type: 'list',
      items: [
        'Jede Rechnung muss eine eindeutige Nummer tragen, die nie wiederverwendet wird — auch nicht nach einer Stornierung',
        'Die Serie muss chronologisch bleiben: Eine neuere Nummer darf nie einem früheren Datum als eine vorangehende Nummer entsprechen',
        'Eine stornierte Rechnung muss in der Serie sichtbar bleiben (mit der zugehörigen Gutschrift), nicht einfach aus dem System gelöscht werden',
        'Ein einheitliches Format (zum Beispiel 2026-001, 2026-002…) erleichtert Nachverfolgung und Kontrolle, ohne eine strikte Formvorschrift zu sein',
      ],
    },
    {
      type: 'callout',
      title: 'Eine «Lücke» in der Nummerierung ist nicht automatisch Betrug, sofern man sie erklären kann',
      text: 'Eine vor dem Versand stornierte Rechnung kann zum Beispiel legitim eine ungenutzte Nummer hinterlassen. Entscheidend ist, den Grund nachweisen zu können — mit einer Gutschrift oder einem zugehörigen Beleg.',
    },
    { type: 'h2', text: 'Das konkrete Risiko einer schlecht verwalteten Nummerierung' },
    {
      type: 'p',
      text: 'Mehrere getrennt verwaltete Rechnungsserien (zum Beispiel ein manuelles Heft parallel zu einer Software) sind der häufigste Fehler bei kleinen Unternehmen. Jedes System erzeugt seine eigene Nummerierung, was zu Duplikaten oder unerklärlichen Lücken führt, sobald alles für die Jahresbuchhaltung zusammengeführt werden muss.',
    },
    {
      type: 'cta',
      title: 'Eine durchgehende Nummerierung, automatisch verwaltet',
      text: 'Cantia vergibt jeder Rechnung eine eindeutige, chronologische Nummer, ohne je eine Nummer wiederzuverwenden oder ein Duplikat zwischen mehreren Quellen zu erzeugen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ist die durchgehende Rechnungsnummerierung in der Schweiz obligatorisch?',
      answer:
        'Sie ist nicht als strikte Formvorschrift gesetzlich festgelegt, aber die ESTV erwartet eine chronologische und nachvollziehbare Serie. Eine Steuerkontrolle prüft diese Kontinuität systematisch.',
    },
    {
      question: 'Kann man die Nummer einer stornierten Rechnung wiederverwenden?',
      answer:
        'Nein: Eine stornierte Rechnung muss mit einer zugehörigen Gutschrift in der Serie identifizierbar bleiben, niemals durch Wiederverwendung ihrer Nummer ersetzt werden.',
    },
    {
      question: 'Was riskiert ein Unternehmen mit einer unsortierten Nummerierung?',
      answer:
        'Eine Steuerkontrolle kann Unstimmigkeiten als Hinweis auf verschwiegenen Umsatz deuten, selbst ohne tatsächlichen Betrug — sodass die Beweislast dann beim Unternehmen liegt.',
    },
  ],
  relatedSlugs: [
    'note-de-credit-facture-rectificative-suisse',
    'duree-conservation-devis-factures-suisse',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
