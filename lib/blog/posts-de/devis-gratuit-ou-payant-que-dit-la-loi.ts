import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-gratuit-ou-payant-que-dit-la-loi',
  question: 'Muss eine Offerte in der Schweiz kostenlos sein, oder darf man sie in Rechnung stellen?',
  title: 'Offerte gratis oder kostenpflichtig: Was das Schweizer Gesetz wirklich vorschreibt (nichts)',
  description:
    'Kein Schweizer Gesetz verpflichtet einen Handwerker, eine Offerte kostenlos zu erstellen. Es ist schlicht die Marktpraxis, die daraus die Norm gemacht hat. So erkennen Sie, wann eine kostenpflichtige Offerte gerechtfertigt ist und wie Sie das kommunizieren, ohne den Kunden zu verlieren.',
  excerpt:
    'Eine Offerte bedeutet Stunden der Kalkulation, manchmal sogar eine Anfahrt. Trotzdem verrechnet sie fast niemand. Das ist keine gesetzliche Pflicht, sondern ein Brauch. Diese Nuance ändert alles bei einer komplexen Kalkulation.',
  category: 'Devis & facturation',
  keywords: ['offerte gratis oder kostenpflichtig', 'offerte verrechnen', 'gesetz offerte schweiz', 'kostenvoranschlag bau', 'komplexe offertkalkulation'],
  publishedAt: '2026-08-12',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Keine Bestimmung des Obligationenrechts schreibt die Unentgeltlichkeit einer Offerte vor. Die Vorstellung, eine Offerte «müsse» kostenlos sein, stammt aus der Marktpraxis, nicht aus dem Gesetz. Ein Kunde kann erwarten, für eine einfache Standardkalkulation nichts zu bezahlen, doch rechtlich steht nichts im Weg, eine Offerte zu verrechnen, sofern dies klar kommuniziert wird, bevor man sich darauf einlässt.',
    },
    { type: 'h2', text: 'Wann eine kostenpflichtige Offerte gerechtfertigt ist' },
    {
      type: 'list',
      items: [
        'Eine Kalkulation, die mehrere Stunden technischer Abklärung oder eine Anfahrt zu einer komplexen Baustelle erfordert',
        'Eine Machbarkeitsstudie oder ein Vorprojekt, das über einen einfachen Richtpreis hinausgeht',
        'Eine Ausschreibung, bei der mehrere Unternehmen ein detailliertes Dossier ohne Zuschlagsgarantie erstellen',
        'Ein Kunde, der mehrere Versionen oder Varianten derselben Offerte verlangt',
      ],
    },
    {
      type: 'callout',
      title: 'Die verrechnete Offerte wird häufig vom Endpreis abgezogen',
      text: 'Eine gängige und gut akzeptierte Praxis: einen symbolischen Betrag für die Studie in Rechnung stellen, der vom Gesamtpreis abgezogen wird, falls die Baustelle schliesslich vergeben wird — das sichert die investierte Zeit ab, ohne einen ernsthaften Kunden zu verschrecken.',
    },
    { type: 'h2', text: 'Der eigentliche Punkt: vorher informieren, nicht nachher' },
    {
      type: 'p',
      text: 'Das einzige wirkliche Risiko ist nicht rechtlicher, sondern kommerzieller Natur: eine Offerte zu verrechnen, ohne dies vorher angekündigt zu haben, schafft einen vermeidbaren Streitfall. Umgekehrt filtert eine explizite Angabe («Studie mit CHF X verrechnet, abzugsfähig vom Endbetrag bei Auftragsannahme») unseriöse Anfragen auf natürliche Weise heraus und bleibt gleichzeitig transparent gegenüber einem interessierten Kunden.',
    },
    {
      type: 'cta',
      title: 'Eine klare Offerte, von der ersten Zeile an',
      text: 'Mit Cantia können Sie direkt auf der Offerte einen Vermerk zu den Bedingungen hinzufügen: So lässt sich eine allfällige Verrechnung der Studie ohne zusätzlichen administrativen Aufwand präzisieren.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Verpflichtet das Schweizer Gesetz zu kostenlosen Offerten?',
      answer:
        'Nein, kein Gesetz schreibt dies vor. Die Unentgeltlichkeit ist ein Marktbrauch, keine gesetzliche Pflicht. Eine Offerte kann durchaus verrechnet werden, wenn dies vorher klar mitgeteilt wird.',
    },
    {
      question: 'Kann man den Preis einer verrechneten Offerte vom Endbetrag der Arbeiten abziehen?',
      answer:
        'Ja, das ist eine gängige und von Kunden gut akzeptierte Praxis: Der Studienbetrag wird von der Endrechnung abgezogen, wenn die Baustelle dem Unternehmen zugeschlagen wird.',
    },
    {
      question: 'Muss der Kunde informiert werden, bevor man eine Offerte verrechnet?',
      answer:
        'Ja, in der Praxis ist das unerlässlich: Eine Offerte zu verrechnen, ohne dies vorher angekündigt zu haben, schafft einen vermeidbaren kommerziellen Streitfall, auch wenn nichts dies gesetzlich verbietet.',
    },
  ],
  relatedSlugs: [
    'rediger-devis-qui-inspire-confiance-client',
    'validite-devis-signe-prix-qui-bouge',
    'devis-oral-valeur-legale-suisse',
  ],
};
