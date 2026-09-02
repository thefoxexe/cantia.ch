import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-entreprise-sur-mobile-artisan',
  question: 'Kann man ein Handwerksunternehmen wirklich vollständig vom Smartphone aus führen?',
  title: 'Das Unternehmen vom Smartphone aus führen: wie weit das wirklich geht',
  description:
    'Offerten, Rechnungen, Baustellenfotos, Teamstunden: was heute wirklich gut auf dem Mobiltelefon funktioniert – und was auf einem grösseren Bildschirm angenehmer bleibt.',
  excerpt:
    'Das Versprechen "alles vom Handy aus erledigen" stimmt für den Grossteil des Handwerkeralltags. Es stimmt nicht für absolut alles, und es lohnt sich zu wissen, wo genau die Grenze liegt.',
  category: 'Comparatifs & outils',
  keywords: ['Unternehmen mobil verwalten', 'Handwerksbetrieb vom Smartphone führen', 'App Geschäftsverwaltung Bau', 'alles auf dem Handy erledigen KMU', 'mobile Software Handwerker Schweiz'],
  publishedAt: '2026-07-20',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Das Versprechen "alles vom Handy aus erledigen" taucht in fast jeder Werbung für Verwaltungssoftware auf. Für den Alltag eines Handwerkers stimmt es grundsätzlich, allerdings mit Nuancen, die man besser kennt, bevor man sich vollständig darauf verlässt.',
    },
    { type: 'h2', text: 'Was auf dem Mobiltelefon sehr gut funktioniert' },
    {
      type: 'list',
      items: [
        'Eine Offerte oder Rechnung direkt von der Baustelle aus erstellen und versenden',
        'Geolokalisierte Fotos aufnehmen und organisieren',
        'Arbeitszeit erfassen oder die Planung einsehen',
        'Den Status offener Zahlungen auf einen Blick prüfen',
      ],
    },
    { type: 'h2', text: 'Was auf dem Computer angenehmer bleibt' },
    {
      type: 'list',
      items: [
        'Beim ersten Mal einen detaillierten Preiskatalog aufbauen',
        'Die Rentabilität mehrerer paralleler Baustellen eingehend analysieren',
        'Rollen und Berechtigungen eines wachsenden Teams konfigurieren',
      ],
    },
    {
      type: 'stat',
      value: '90 %',
      label: 'Anteil der täglichen Aufgaben eines Handwerkers (Offerte, Rechnung, Foto, Stundenerfassung), die sich mit einer guten Verwaltungssoftware vollständig auf dem Mobiltelefon erledigen lassen',
    },
    {
      type: 'callout',
      title: 'Die richtige App ergänzt das Mobiltelefon, statt es vollständig zu ersetzen',
      text: 'Ein Tool, das sowohl auf dem Computer als auch auf dem Mobiltelefon gleich gut funktioniert, erlaubt es, schnelle Aufgaben vor Ort und ruhigere Konfigurationsaufgaben im Büro zu erledigen – ohne auf der einen oder anderen Seite blockiert zu sein.',
    },
    {
      type: 'cta',
      title: 'Der Alltag auf dem Handy, die Konfiguration am Computer',
      text: 'Ein einziges Cantia-Konto genügt, egal ob vom Handy auf der Baustelle oder vom Computer aus für die anspruchsvolleren Aufgaben.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Kann man wirklich eine vollständige Offerte vom Handy aus erstellen?',
      answer:
        'Ja, mit einem gut für Mobilgeräte konzipierten Tool (inklusive Preiskatalog, damit auf dem kleinen Bildschirm nicht alles von Hand eingetippt werden muss).',
    },
    {
      question: 'Welche Aufgaben bleiben auf dem Computer einfacher als auf dem Handy?',
      answer:
        'Der anfängliche Aufbau eines detaillierten Preiskatalogs oder die vertiefte Analyse mehrerer Baustellen bleiben in der Regel auf einem grösseren Bildschirm angenehmer.',
    },
    {
      question: 'Kann ein Handwerker mit einem guten mobilen Tool ganz auf den Computer verzichten?',
      answer:
        'Für den Alltag durchaus. Ein gelegentlicher Zugang zu einem Computer bleibt für aufwendigere Konfigurationsaufgaben aber trotzdem nützlich.',
    },
  ],
  relatedSlugs: [
    'application-gestion-freelance-batiment',
    'application-hors-ligne-chantier-pourquoi-important',
    'outil-facturation-en-ligne-pme-suisse',
  ],
};
