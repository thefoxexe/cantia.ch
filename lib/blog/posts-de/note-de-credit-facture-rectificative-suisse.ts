import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'note-de-credit-facture-rectificative-suisse',
  question: 'Wie korrigiert man eine bereits versendete Rechnung: Gutschrift oder berichtigte Rechnung?',
  title: 'Bereits versendete Rechnung, aber falsch: Gutschrift oder berichtigte Rechnung?',
  description:
    'Ein Fehler bei Betrag, MWST oder Leistung auf einer bereits versendeten Rechnung wird niemals durch Bearbeiten des ursprünglichen PDF korrigiert. Hier die richtige, mit der Schweizer Buchhaltung konforme Methode.',
  excerpt:
    'Eine korrigierte Version derselben Rechnungsnummer erneut zu versenden, erzeugt auf beiden Seiten ein buchhalterisches Duplikat. Die Gutschrift existiert genau dafür, um sauber zu korrigieren, ohne je die Geschichte umzuschreiben.',
  category: 'Devis & facturation',
  keywords: ['Gutschrift Rechnung', 'berichtigte Rechnung Schweiz', 'Rechnung korrigieren', 'Fehler bereits versendete Rechnung', 'Rechnung stornieren'],
  publishedAt: '2026-06-11',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Ein nach dem Versand einer Rechnung entdeckter Fehler (falscher Betrag, falsche MWST, falsch beschriebene Leistung) wird niemals korrigiert, indem man das ursprüngliche Dokument ändert und unter derselben Nummer erneut versendet. Einmal ausgestellt, bleibt eine Rechnung so wie sie ist in der Buchhaltung stehen; die Korrektur erfolgt über ein eigenständiges Dokument: die Gutschrift.',
    },
    { type: 'h2', text: 'Warum man niemals dieselbe Rechnungsnummer erneut ausstellt' },
    {
      type: 'list',
      items: [
        'Die Rechnungsnummerierung muss durchgehend und chronologisch bleiben, denn die Wiederverwendung oder Änderung einer bereits ausgestellten Nummer bricht diese Kontinuität — ein Punkt, der bei einer Steuerkontrolle geprüft wird',
        'Der Kunde hat die ursprüngliche Rechnung möglicherweise bereits in seiner eigenen Buchhaltung erfasst, und ein stilles Duplikat erzeugt dann eine später nur schwer nachvollziehbare Verwirrung',
        'Eine einmal versendete Rechnung ist ein endgültiger Buchhaltungsbeleg: Nur eine Gegenbuchung kann ihre Wirkung rechtmässig aufheben',
      ],
    },
    { type: 'h2', text: 'Die richtige Methode' },
    {
      type: 'list',
      items: [
        'Eine Gutschrift ausstellen, die ausdrücklich auf die Nummer der ursprünglichen Rechnung verweist, für den zu stornierenden Betrag (ganz oder teilweise)',
        'Anschliessend eine neue Rechnung mit neuer Nummer und den korrigierten Daten ausstellen',
        'Beide Dokumente (ursprüngliche Rechnung + Gutschrift + neue Rechnung) im Verlauf aufbewahren; sie bilden zusammen die vollständige buchhalterische Spur',
      ],
      ordered: true,
    },
    {
      type: 'callout',
      title: 'Ein kleiner Fehler rechtfertigt nicht immer eine vollständige Gutschrift',
      text: 'Bei einem blossen Tippfehler ohne Auswirkung auf Betrag oder MWST kann eine klärende E-Mail an den Kunden genügen. Die Gutschrift wird nötig, sobald sich der fakturierte Betrag selbst ändern muss.',
    },
    {
      type: 'cta',
      title: 'Gutschrift mit einem Klick erstellt',
      text: 'Cantia ermöglicht das Ausstellen einer Gutschrift, die direkt mit der ursprünglichen Rechnung verknüpft ist, mit automatischer und durchgehender Nummerierung.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Kann man eine bereits an einen Kunden versendete Rechnung einfach ändern?',
      answer:
        'Nein, eine ausgestellte Rechnung bleibt ein endgültiger Buchhaltungsbeleg. Jede Korrektur muss über eine Gutschrift, gefolgt von einer neuen Rechnung erfolgen — nie durch Änderung des ursprünglichen Dokuments.',
    },
    {
      question: 'Was genau ist eine Gutschrift?',
      answer:
        'Ein Dokument, das eine bereits ausgestellte Rechnung ganz oder teilweise storniert, mit ausdrücklichem Verweis auf ihre ursprüngliche Nummer, ohne die Kontinuität der Nummerierung zu brechen.',
    },
    {
      question: 'Braucht es für einen blossen Tippfehler auf einer Rechnung eine Gutschrift?',
      answer:
        'Nicht zwingend, wenn sich Betrag und MWST nicht ändern: eine schriftliche Klarstellung an den Kunden kann in diesem konkreten Fall genügen.',
    },
  ],
  relatedSlugs: [
    'numerotation-facture-obligations-legales-suisse',
    'mentions-obligatoires-facture-suisse-tva',
    'difference-devis-offre-facture-pro-forma',
  ],
};
