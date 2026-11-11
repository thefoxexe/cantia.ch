import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'bexio-vs-cantia-logiciel-batiment',
  question: 'Bexio oder Cantia: Welche Software für ein Bauunternehmen wählen?',
  title: 'Bexio vs. Cantia: Welche Software für ein Bauunternehmen?',
  description:
    'Bexio ist eine generalistische Schweizer Buchhaltungslösung. Cantia ist speziell für die Baustelle konzipiert: Offerte per Diktat, Rentabilität pro Projekt, Fotorapporte, native QR-Rechnung.',
  excerpt:
    'Bexio wurde nie für eine Baustelle konzipiert. Es ist ein hervorragendes Buchhaltungstool für ein beliebiges Schweizer KMU, aber kein Werkzeug fürs Bau-Terrain.',
  category: 'Comparatifs & outils',
  keywords: ['bexio alternative', 'baubranche software vergleich', 'offerte rechnung software', 'baustellen software schweiz', 'bexio vs cantia'],
  publishedAt: '2026-09-02',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Bexio hat sich als eine der meistgenutzten Buchhaltungs- und Fakturierungssoftwares für Schweizer KMU etabliert, branchenübergreifend. Die eigentliche Frage, wenn man es ein Jahr lang im Bauwesen einsetzt, lautet nicht «ist es gut?», sondern eher «wurde es für das entwickelt, was ich wirklich tue, oder nur für das, was jedes beliebige KMU tut?».',
    },
    { type: 'h2', text: 'Was Bexio gut macht' },
    {
      type: 'p',
      text: 'Doppelte Buchhaltung, MWST-Abrechnungen, Bankanbindungen, eine Lagerverwaltung, die auf den Handel ausgerichtet ist. Für ein Unternehmen, dessen Kerntätigkeit nicht die Baustelle selbst ist, ist das eine solide, bewährte und weitgehend ausreichende Wahl.',
    },
    { type: 'h2', text: 'Was fehlt, wenn die eigentliche Arbeit auf der Baustelle stattfindet' },
    {
      type: 'list',
      items: [
        'Keine Rentabilität pro Baustelle: Bexio sieht nur die globale Buchhaltung des Unternehmens, nie was eine bestimmte Baustelle tatsächlich gekostet hat im Vergleich zu dem, was sie eingebracht hat',
        'Kein Baustellenrapport mit geolokalisierten Fotos: ein tägliches Bedürfnis, um den Fortschritt, einen Mangel oder einen Vorbehalt zu dokumentieren',
        'Kein Diktieren per Sprachsteuerung, um eine Offerte aus dem Lieferwagen heraus zu erstellen, zwischen zwei Terminen, ohne alles abends im Büro nochmals abzutippen',
        'Keine Team-Planung, die in die Baustellen und Offerten integriert ist',
        'Kein Kundenportal, um eine Offerte online einzusehen und zu unterschreiben, ohne PDF-Austausch per E-Mail',
      ],
    },
    {
      type: 'callout',
      title: 'Es ist keine Qualitätsfrage, sondern eine Frage des angepeilten Berufsfelds',
      text: 'Bexio wurde für die Buchhaltung eines KMU im weiten Sinne konzipiert: ein Coiffeursalon, eine Anwaltskanzlei, ein Bauunternehmen sind dort alle im gleichen Rahmen untergebracht. Cantia wurde ausschliesslich für den Ablauf einer Schweizer Baustelle konzipiert, vom ersten Kundentermin bis zur Schlusszahlung.',
    },
    { type: 'h2', text: 'Die Tabelle, die den Ausschlag gibt' },
    {
      type: 'table',
      headers: ['Bedürfnis', 'Bexio', 'Cantia'],
      rows: [
        ['Offerten & Rechnungen mit QR-Rechnung', 'Ja', 'Ja, mit Berufs-Preiskatalog'],
        ['Offerte per Sprachsteuerung auf der Baustelle', 'Nein', 'Ja'],
        ['Rentabilität pro Baustelle (offeriert vs. real)', 'Nein', 'Ja'],
        ['Geolokalisierter Foto-Baustellenrapport', 'Nein', 'Ja'],
        ['Teamplanung pro Baustelle', 'Nein', 'Ja'],
        ['Kundenportal (Online-Unterschrift der Offerte)', 'Nein', 'Ja'],
        ['Beleg fotografieren → Ausgabe automatisch erfasst', 'Ja (allgemeine Buchhaltung)', 'Ja, direkt in der Rentabilität der betroffenen Baustelle'],
        ['Allgemeine doppelte Buchhaltung', 'Ja', 'Ja, automatisch aus Rechnungen, Ausgaben und Löhnen erstellt'],
      ],
    },
    {
      type: 'p',
      text: 'In der Praxis gibt es zwei Fälle. Ein Unternehmen, das bereits mit Bexio arbeitet, behält dort oft seine Buchhaltung und nutzt Cantia für alles rund um die Baustelle, beide synchronisiert. Ein Unternehmen, das neu startet, kann alles in Cantia erledigen: Jede Rechnung, Zahlung, Ausgabe und jeder Lohn erzeugt eine Buchung, mit MWST-Abrechnung und Jahresabschluss, und die Treuhand greift über Cantia Accounting darauf zu.',
    },
    {
      type: 'callout',
      title: 'Beide, ohne Doppelerfassung',
      text: 'Cantia verbindet sich neu nativ mit Bexio (ab dem Abo Team): Kunden werden in beide Richtungen synchronisiert, Rechnungen mit einem Klick an Bexio übermittelt, Zahlungsstatus alle 15 Minuten aktualisiert. Alle Details dazu in unserem eigenen Artikel zur Integration.',
    },
    {
      type: 'cta',
      title: 'Für die Baustelle konzipiert, bis zur Buchhaltung',
      text: 'Cantia deckt den gesamten Weg einer Schweizer Baustelle ab: Offerte, QR-Fakturierung, Rapporte, Planung, Rentabilität und HR, sowohl aus dem Lieferwagen als auch vom Büro aus.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Kann Cantia Bexio vollständig ersetzen?',
      answer:
        'Ja, das ist möglich. Cantia führt eine doppelte Buchhaltung, die automatisch aus Rechnungen, Zahlungen, Ausgaben und Löhnen entsteht, mit MWST-Abrechnung und einem Assistenten für den Jahresabschluss. Wer Bexio für die Buchhaltung behalten möchte, kann beide verbinden: Kunden, Artikel, Rechnungen und Zahlungen werden synchronisiert.',
    },
    {
      question: 'Bietet Bexio ein Baustellen- oder Rentabilitätsmodul pro Projekt an?',
      answer:
        'Nein: Bexio ist ein generalistisches ERP für Schweizer KMU, ohne dedizierte Funktion für die Baustellenverfolgung, die Rentabilität pro Projekt oder geolokalisierte Fotorapporte.',
    },
    {
      question: 'Kann man Cantia und Bexio parallel verwenden?',
      answer:
        'Ja, das ist eine häufige Kombination. Und seit Kurzem ist das keine Doppelerfassung mehr: Cantia verbindet sich nativ mit Bexio, um Kunden, Rechnungen und Zahlungsstatus automatisch zu synchronisieren.',
    },
  ],
  relatedSlugs: [
    'integration-bexio-cantia-synchronisation-automatique',
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
  ],
};
