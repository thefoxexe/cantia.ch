import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'qr-facture-obligatoire-2026',
  question: 'Ist die QR-Rechnung 2026 in der Schweiz obligatorisch?',
  title: 'QR-Rechnung obligatorisch in der Schweiz: was 2026 gilt',
  description:
    'Der ES/BESR gibt es seit 2022 nicht mehr, die QR-Rechnung ist der einzige Standard. Und seit Ende 2025 bedroht eine neue Formatänderung nicht konforme QR-Rechnungen.',
  excerpt:
    'Nur weil Ihre QR-Rechnungen heute noch gescannt werden können, heisst das nicht, dass sie im Oktober 2026 noch funktionieren. Ein Formatdetail hat die Lage gerade verändert.',
  category: 'Devis & facturation',
  keywords: ['qr-rechnung pflicht', 'einzahlungsschein orange ende', 'qr-iban referenz', 'rechnungsstellung schweiz 2026', 'qr-code rechnung norm'],
  publishedAt: '2026-01-19',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Wer 2026 noch mit einem orangen oder roten Einzahlungsschein fakturiert, erlebt eine böse Überraschung: Die Bank des Kunden akzeptiert das schlicht nicht mehr. Diese Belege sind seit dem 30. September 2022 Geschichte. Die eigentlich wichtige Frage für dieses Jahr liegt aber woanders: in einer viel diskreteren Formatänderung, die bei den meisten Unternehmen unter dem Radar geblieben ist.',
    },
    { type: 'h2', text: 'Was die QR-Rechnung ist' },
    {
      type: 'p',
      text: 'Ein strukturierter Zahlteil (Betrag, IBAN oder QR-IBAN, Referenz, Zahlungspflichtiger) plus ein QR-Code, der von jeder Schweizer Banking-App gelesen wird. Der Kunde scannt, Betrag und Angaben füllen sich automatisch: kein Tippfehler bei der Referenz mehr, kein Einzahlungsschein, der im Ordner verschwindet.',
    },
    {
      type: 'stat',
      value: '30.09.2022',
      label: 'Datum, ab dem ES/BESR (orange und rosa Einzahlungsscheine) von Schweizer Banken nicht mehr akzeptiert werden',
    },
    { type: 'h2', text: 'Die eigentliche Falle 2026: unstrukturierte Adressen' },
    {
      type: 'p',
      text: 'Die Version 2.3 der QR-Rechnungs-Spezifikationen, seit November 2025 in Kraft, verlangt, dass nur strukturierte Adressen (Typ «S»: Strasse, Hausnummer, PLZ und Ort in getrennten Feldern) im QR-Code zulässig sind. Adressen im Freitext-Format (Typ «K») werden ab dem 30. September 2026 von den Banken zurückgewiesen.',
    },
    {
      type: 'callout',
      title: 'Warum das niemand kommen sieht',
      text: 'Eine Software, die weiterhin QR-Rechnungen mit unstrukturierter Adresse erzeugt, produziert heute noch perfekt funktionierende Dokumente. Das Problem zeigt sich nicht im Test, sondern erst an dem Tag, an dem eine Bank zu verweigern beginnt – oft ohne klare Fehlermeldung auf der Nutzerseite.',
    },
    { type: 'h2', text: 'Was eine QR-Rechnung enthalten muss' },
    {
      type: 'list',
      items: [
        'IBAN oder QR-IBAN des Zahlungsempfängers (dedizierte Nummer für die strukturierte QR-Referenz)',
        'Betrag und Währung, oder leeres Feld, wenn der Betrag dem Zahlungspflichtigen überlassen wird',
        'Zahlungsreferenz (27-stellige QRR, oder ISO-11649/SCOR-Referenz)',
        'Angaben zum Zahlungsempfänger und gegebenenfalls zum Zahlungspflichtigen (in strukturierter Adresse seit 2025-2026)',
        'Der QR-Code selbst, gemäss Norm dimensioniert und positioniert, inklusive Ruhezone',
      ],
    },
    { type: 'h2', text: 'Der eigentliche Gewinn ist nicht die Konformität, sondern der automatische Zahlungsabgleich' },
    {
      type: 'p',
      text: 'Die strukturierte Referenz erlaubt es, eine eingegangene Zahlung ohne Raten der zugehörigen Rechnung zuzuordnen, ohne mittwochabends eine Liste von Überweisungen Zeile für Zeile durchzugehen. Das ist das Argument, das am meisten zählt, sobald die Konformität erreicht ist.',
    },
    {
      type: 'cta',
      title: 'Konform heute, konform im September 2026',
      text: 'Cantia erzeugt QR-Rechnungen von Anfang an mit strukturierter Adresse und gleicht jede eingegangene Zahlung automatisch anhand der Referenznummer ab.',
      buttonLabel: 'Modul Rechnungsstellung ansehen',
    },
  ],
  faq: [
    {
      question: 'Kann man 2026 noch einen orangen Einzahlungsschein verwenden?',
      answer:
        'Nein. ES (orange) und BESR (rosa) werden seit dem 30. September 2022 von Schweizer Banken weder ausgestellt noch akzeptiert. Jede Rechnung muss inzwischen einen QR-Rechnungsteil enthalten.',
    },
    {
      question: 'Was ändert sich mit der Version 2.3 der QR-Rechnungs-Norm?',
      answer:
        'Seit November 2025 sind im QR-Code nur strukturierte Adressen zulässig (Strasse, Hausnummer, PLZ, Ort in getrennten Feldern). Adressen im Freitext werden ab dem 30. September 2026 von den Banken zurückgewiesen.',
    },
    {
      question: 'Was ist der Unterschied zwischen IBAN und QR-IBAN?',
      answer:
        'Der QR-IBAN ist eine dedizierte Nummer, erkennbar an einem spezifischen Finanzinstitut-Identifikator, die ausschliesslich für QR-Rechnungen mit strukturierter QR-Referenz (QRR) verwendet wird. Ein Standard-IBAN kann ebenfalls auf einer QR-Rechnung verwendet werden, dann aber mit einer Referenz vom Typ SCOR oder ohne Referenz.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'duree-conservation-devis-factures-suisse',
    'calculer-prix-devis-renovation-suisse',
  ],
};
