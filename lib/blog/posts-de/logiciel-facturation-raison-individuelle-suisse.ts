import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-facturation-raison-individuelle-suisse',
  question: 'Lohnt sich eine Fakturierungssoftware auch für eine Einzelfirma in der Schweiz?',
  title: 'Fakturierungssoftware für die Einzelfirma: Was sich gegenüber AG oder GmbH ändert',
  description:
    'Eine Einzelfirma hat nicht dieselben Pflichten wie eine Kapitalgesellschaft. Eine Fakturierungssoftware bleibt trotzdem ebenso nützlich, allerdings aus anderen Gründen.',
  excerpt:
    'Viele denken, eine Fakturierungssoftware sei nur für «richtige Firmen» gedacht. Bei einer Einzelfirma macht sie oft den grössten Unterschied, weil kein administratives Team im Hintergrund steht.',
  category: 'Comparatifs & outils',
  keywords: ['Fakturierungssoftware Einzelfirma', 'Rechnungsstellung Selbstständige Schweiz', 'Einzelfirma Verwaltungstools', 'Rechnungssoftware Einzelunternehmen', 'administrative Verwaltung Selbstständige Schweiz'],
  publishedAt: '2026-07-10',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Eine Einzelfirma hat keine so umfangreichen Buchhaltungspflichten wie eine AG, was manchmal den Eindruck erweckt, eine Fakturierungssoftware sei ein überflüssiger Luxus. In der Praxis ist es gerade das Fehlen eines administrativen Teams, das den Nutzen eines solchen Tools ausmacht (niemand sonst fängt einen Fehler oder eine vergessene Rechnung auf).',
    },
    { type: 'h2', text: 'Was eine Software einer Einzelfirma konkret bringt' },
    {
      type: 'list',
      items: [
        'Konforme Dokumente, ohne alle obligatorischen gesetzlichen Angaben auswendig kennen zu müssen',
        'Eine Übersicht über unbezahlte Rechnungen, während der Inhaber allein niemanden hat, der an seiner Stelle mahnt',
        'Eine auf einen Blick sichtbare Liquidität, wichtig zur Vorausplanung der AHV/IV-Akontozahlungen als Selbstständiger',
        'Eine sofortige Zeitersparnis, wenn jede administrative Stunde eine dem Kunden nicht verrechnete Stunde ist',
      ],
    },
    {
      type: 'stat',
      value: '3-5h',
      label: 'durchschnittlicher Zeitaufwand pro Woche für Administratives bei einem Selbstständigen in Einzelfirma ohne dediziertes Tool',
    },
    { type: 'h2', text: 'Einfachheit zählt mehr als buchhalterische Komplexität' },
    {
      type: 'p',
      text: 'Eine Einzelfirma braucht in der Regel kein vollständiges Buchhaltungstool, sondern ein einfaches Werkzeug, das Offerten, Rechnungen und Zahlungsübersicht abdeckt. Der Rest kann bei Bedarf einem Treuhänder überlassen werden.',
    },
    {
      type: 'callout',
      title: 'Ein einfacher Status bedeutet nicht weniger Pflichten auf der Rechnung',
      text: 'Die obligatorischen Angaben auf einer Schweizer Rechnung (UID-Nummer bei MWST-Pflicht, Nummerierung, MWST-Satz) gelten unabhängig vom Rechtsstatus: Eine Software, die diese automatisch verwaltet, verhindert ein Vergessen.',
    },
    {
      type: 'cta',
      title: 'Einfach in der Anwendung, auch im Alleingang',
      text: 'Cantia ist für Selbstständige in Einzelfirma konzipiert, die alles allein steuern (Offerten, Rechnungen und Liquidität), ohne unnötige buchhalterische Komplexität.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Braucht eine Einzelfirma wirklich eine Fakturierungssoftware?',
      answer:
        'Ja, oft sogar mehr als ein Unternehmen mit administrativem Team. Ohne jemanden, der offene Rechnungen mahnt oder die Konformität der Dokumente prüft, schliesst ein dediziertes Tool diese Lücke.',
    },
    {
      question: 'Ändern sich die obligatorischen Rechnungsangaben je nach Rechtsform?',
      answer:
        'Nein, die grundlegenden gesetzlichen Angaben (Nummerierung, MWST falls anwendbar) gelten unabhängig vom Rechtsstatus, ob Einzelfirma, GmbH oder AG.',
    },
    {
      question: 'Braucht eine Einzelfirma eine vollständige Buchhaltungssoftware?',
      answer:
        'Nicht zwingend: Ein einfaches Tool für Offerten, Rechnungen und Liquiditätsübersicht genügt oft, der Rest kann bei Bedarf an einen Treuhänder ausgelagert werden.',
    },
  ],
  relatedSlugs: [
    'logiciel-gestion-societe-individuelle-suisse',
    'avs-ai-independant-batiment',
    'gerer-entreprise-sans-comptable-debut',
  ],
};
