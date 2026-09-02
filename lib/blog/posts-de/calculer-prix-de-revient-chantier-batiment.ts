import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-de-revient-chantier-batiment',
  question: 'Wie berechnet man die wahren Selbstkosten einer Baustelle, jenseits des fakturierten Betrags?',
  title: 'Selbstkosten einer Baustelle: Die Methode, um zu wissen, was sie wirklich gekostet hat',
  description:
    'Der fakturierte Betrag ist nicht der Selbstkostenpreis. Ohne die Addition von realer Arbeitszeit, Material, Subunternehmerleistungen und Gemeinkosten lässt sich die Rentabilität einer Baustelle nicht bestimmen.',
  excerpt:
    'Eine «gut bezahlte» Baustelle kann trotzdem eine Verlustbaustelle sein, wenn ihre realen Kosten nie nachträglich berechnet wurden. Diese Bestandteile müssen addiert werden, um es wirklich zu wissen.',
  category: 'Chantier & rentabilité',
  keywords: ['selbstkosten baustelle', 'kostenberechnung bau schweiz', 'reale baukosten', 'rentabilität bauarbeiten', 'kostenaufschlüsselung baustelle'],
  publishedAt: '2026-07-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Der an einen Kunden fakturierte Betrag sagt an sich nichts über die Rentabilität einer Baustelle aus. Der Selbstkostenpreis (was die Baustelle das Unternehmen tatsächlich gekostet hat) ist eine eigenständige Grösse, für deren Ermittlung mehrere Bestandteile addiert werden müssen, die oft über verschiedene Quellen verstreut sind.',
    },
    { type: 'h2', text: 'Die Bestandteile des Selbstkostenpreises' },
    {
      type: 'list',
      items: [
        'Reale Arbeitszeit: die tatsächlich auf der Baustelle verbrachten Stunden, zu den realen Stundenkosten (inklusive Sozialabgaben), nicht zum theoretischen Offertsatz',
        'Material: die tatsächlich bezahlten Kosten, nicht der bei der Offertstellung geschätzte Katalogpreis',
        'Subunternehmerleistungen: alle für diese spezifische Baustelle erhaltenen Rechnungen von Subunternehmern',
        'Zugeteilte Gemeinkosten: ein auf die Baustelle verteilter Anteil der Fixkosten des Unternehmens (Fahrzeug, Versicherung, gemeinsam genutztes Material)',
      ],
    },
    {
      type: 'stat',
      value: 'Reale Marge',
      label: 'Fakturierter Preis − Selbstkostenpreis = das, was dem Unternehmen vor Steuern tatsächlich bleibt',
    },
    { type: 'h2', text: 'Warum diese Differenz fast immer unterschätzt wird' },
    {
      type: 'p',
      text: 'Eine Offerte legt im Voraus einen Preis fest, aufgrund von Annahmen (geschätzte Zeit, Materialpreise am Tag der Kalkulation). Die reale Baustelle weicht fast immer etwas ab, sei es durch einen unvorhergesehenen Umstand, eine zusätzliche Frist oder eine Lieferantenpreisänderung. Ohne systematischen Vergleich zwischen Offeriertem und Realität nach Abschluss der Baustelle bleibt diese Abweichung unsichtbar, Baustelle für Baustelle.',
    },
    {
      type: 'callout',
      title: 'Die Berechnung hat nur Wert, wenn sie pro Baustelle erfolgt, nicht global am Jahresende',
      text: 'Ein positiver Jahresumsatz kann mehrere strukturell defizitäre Baustellen verschleiern, die durch andere ausgeglichen werden. Nur eine Analyse pro Baustelle zeigt, welche die Tätigkeit tatsächlich nach unten ziehen.',
    },
    {
      type: 'cta',
      title: 'Der Selbstkostenpreis automatisch berechnet',
      text: 'Das Rentabilitätsmodul von Cantia stellt das Offerierte den tatsächlich für jede Baustelle aufgewendeten Stunden und Kosten gegenüber, ohne die Berechnung von Hand rekonstruieren zu müssen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ist der fakturierte Betrag dasselbe wie der Selbstkostenpreis einer Baustelle?',
      answer:
        'Nein, der Selbstkostenpreis addiert die realen Kosten der Arbeitszeit, des Materials, der Subunternehmerleistungen und der Gemeinkosten: Er kann sich stark vom dem Kunden fakturierten Betrag unterscheiden.',
    },
    {
      question: 'Warum den Selbstkostenpreis pro Baustelle statt global berechnen?',
      answer:
        'Weil ein positiver Jahresumsatz individuell defizitäre Baustellen verschleiern kann, die durch andere ausgeglichen werden. Nur eine detaillierte Analyse zeigt, wo das Unternehmen tatsächlich Geld verliert.',
    },
    {
      question: 'Welcher Bestandteil wird beim Selbstkostenpreis am häufigsten unterschätzt?',
      answer:
        'Die reale Arbeitszeit, berechnet zu den vollen Stundenkosten inklusive Abgaben. Sie liegt fast immer höher als der theoretische Stundensatz, der bei der ursprünglichen Kalkulation verwendet wurde.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-horaire-reel-ouvrier-batiment',
    'suivre-rentabilite-chantier-sans-excel',
    'chantier-complet-peut-etre-en-perte-taux-horaire',
  ],
  relatedTradeSlug: 'macon',
};
