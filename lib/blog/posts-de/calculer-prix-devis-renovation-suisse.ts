import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-devis-renovation-suisse',
  question: 'Wie berechnet man den Preis einer Renovationsofferte in der Schweiz?',
  title: 'Wie man den Preis einer Renovationsofferte in der Schweiz berechnet',
  description:
    'Konkrete Methode zur Kalkulation einer Renovationsofferte in der Schweiz (reale Stundenkosten, Material, Marge, MWST 8,1 %), mit einem vollständigen Zahlenbeispiel.',
  excerpt:
    'Der von einem Konkurrenten abgeschriebene Stundensatz ist die Hauptursache für Baustellen, die «laufen», ohne je jemanden zu bereichern. So berechnet man ihn wirklich.',
  category: 'Devis & facturation',
  keywords: ['offerte erstellen', 'preiskalkulation renovation', 'stundenkosten berechnen', 'marge bauwesen', 'mwst offerte', 'kalkulation bauarbeiten'],
  publishedAt: '2026-01-12',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Eine Offerte, die die Konkurrenz um zehn Franken pro Stunde unterbietet, ist fast nie eine clevere Offerte. Es ist oft eine Offerte, die nie richtig berechnet wurde. Der von einem Konkurrenten abgeschriebene oder an einem Montagmorgen aus dem Bauch heraus festgelegte Stundensatz ist der Hauptgrund, warum eine «laufende» Baustelle am Ende nie jemanden bereichert.',
    },
    { type: 'h2', text: '1. Die realen Stundenkosten haben nichts mit dem Nettolohn zu tun' },
    {
      type: 'p',
      text: 'Ein Mitarbeiter, der CHF 32/h brutto verdient, kostet das Unternehmen nicht CHF 32/h. Man muss die Arbeitgeber-Sozialabgaben hinzurechnen (AHV/IV/EO, ALV, BVG, UVG: rechnen Sie mit 15 bis 20 % des Bruttolohns je nach Kasse und Branche), den anteiligen 13. Monatslohn und die Ferien sowie Ausrüstung und Arbeitskleidung, und vor allem die Zeit, die nie fakturiert wird: Fahrten, Offerten, Koordination, Administratives. In einer realen Woche macht diese Leerzeit oft fast einen ganzen Tag von fünf aus. Ergebnis: Ein Unternehmen, das CHF 32/h brutto zahlt, trägt reale Stundenkosten nahe CHF 55 bis 65/h, alles eingerechnet. Und genau diese Zahl gehört in die Offerte, nicht der Lohn.',
    },
    {
      type: 'callout',
      title: 'Der 30-Sekunden-Test',
      text: 'Nehmen Sie Ihren fakturierten Stundensatz, ziehen Sie 20 % Abgaben ab, dann noch die nicht fakturierbare Zeit der Woche (oft ein gutes Drittel der realen Zeit). Wenn das, was übrig bleibt, Ihre Struktur nicht bequem deckt, verlieren Sie nicht jeden Tag Geld. Aber ein einziger schlechter Monat reicht, um die Jahresmarge auszulöschen.',
    },
    { type: 'h2', text: '2. Das Material: zum bezahlten Preis kalkulieren, nie zum erträumten Preis' },
    {
      type: 'p',
      text: 'Ein im Januar gesehener Lieferantenpreis ist für niemanden im Juni garantiert. Bei einer Renovationsbaustelle, die sich über mehrere Monate erstreckt, gibt es nur zwei Optionen: eine feste Offerte des Lieferanten für die gesamte Dauer einholen, oder eine Sicherheitsmarge von 3 bis 8 % einrechnen (höher bei Holz, Metall und Dämmstoffen, deren Preise am stärksten schwanken).',
    },
    { type: 'h2', text: '3. Die Marge: Was eine ehrliche von einer selbstmörderischen Offerte trennt' },
    {
      type: 'list',
      items: [
        'Fixe Strukturkosten (Lokal, Fahrzeuge, Versicherungen, Buchhaltung): rechnen Sie mit 10 bis 15 %',
        'Angestrebter Nettogewinn: 5 bis 12 % je nach Berufsfeld',
        'Rückstellung für Unvorhergesehenes: 5 bis 10 %, und bei Renovationen ist das nie ein Luxus',
      ],
    },
    {
      type: 'p',
      text: 'Bei Renovationen ist das Unvorhergesehene nicht die Ausnahme, sondern die Norm: eine hinter einer Verkleidung entdeckte tragende Wand, eine nicht normgerechte Elektroinstallation, aufsteigende Feuchtigkeit aus einem seit zwanzig Jahren nicht geöffneten Kriechkeller. Eine Offerte, die dafür nichts zurückstellt, verwandelt sich systematisch in einen mühsam zu verhandelnden Nachtrag, sobald die Baustelle offen ist – genau in dem Moment, in dem sich das Kräfteverhältnis zugunsten des Kunden verschoben hat.',
    },
    { type: 'h2', text: '4. Die MWST, auf dem richtigen Betrag' },
    {
      type: 'p',
      text: 'Der Normalsatz in der Schweiz beträgt seit dem 1. Januar 2024 8,1 %, angewendet auf den Gesamtbetrag exkl. MWST (Arbeit + Material + Marge), und nicht zeilenweise mit Rundungen, die sich über eine lange Positionsliste hinweg verschieben. Das ist genau die Art von unsichtbarem Fehler, den eine schlecht konzipierte Tabelle erzeugt.',
    },
    { type: 'h2', text: '5. Ein stimmiges Beispiel: Einbau von Dreifachverglasung-Fenstern' },
    {
      type: 'table',
      headers: ['Posten', 'Detail', 'Betrag CHF'],
      rows: [
        ['Arbeitszeit', '16h × CHF 65/h (reale Kosten)', '1’040.00'],
        ['Material', '6 Fenster Dreifachverglasung + Einbau', '4’300.00'],
        ['Marge (Fixkosten + Gewinn)', '18 % auf Zwischensumme', '961.20'],
        ['Total exkl. MWST', '', '6’301.20'],
        ['MWST 8,1 %', '', '510.40'],
        ['Total inkl. MWST', '', '6’811.60'],
      ],
    },
    {
      type: 'cta',
      title: 'Die Berechnung erledigt sich von selbst, die Marge nicht',
      text: 'Bei Cantia werden MWST, Summen und der Preiskatalog bei jeder Zeile automatisch berechnet. Die einzige Zahl, die Sie selbst wählen, ist Ihre Marge.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Welche Marge sollte man auf eine Renovationsofferte in der Schweiz anwenden?',
      answer:
        'Im Allgemeinen zwischen 20 und 35 % insgesamt (Fixkosten + Gewinn + Rückstellung für Unvorhergesehenes), anzupassen je nach Berufsfeld und Unsicherheitsgrad der bestehenden Bausubstanz.',
    },
    {
      question: 'Sollte man Unvorhergesehenes in den Offertpreis einrechnen oder separat fakturieren?',
      answer:
        'Beide Ansätze existieren: entweder eine in den Festpreis integrierte Rückstellung, oder eine ausdrückliche Klausel, die eine zusätzliche Fakturierung per Zusatzofferte im Fall einer unvorhergesehenen Entdeckung vorsieht, sofern diese Klausel klar auf der ursprünglichen Offerte steht.',
    },
    {
      question: 'Wird die MWST auf den Netto- oder Bruttopreis der Offerte berechnet?',
      answer:
        'Immer auf den Betrag exklusive Steuer (netto). Der Normalsatz beträgt seit 2024 8,1 % für die meisten Bauleistungen.',
    },
  ],
  relatedSlugs: [
    'rediger-devis-qui-inspire-confiance-client',
    'norme-sia-118-devis-obligatoire',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
