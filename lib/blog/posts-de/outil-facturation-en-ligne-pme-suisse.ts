import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'outil-facturation-en-ligne-pme-suisse',
  question: 'Welche Vorteile bietet eine Online-Fakturierungssoftware für ein Schweizer KMU?',
  title: 'Online-Fakturierungssoftware: Was das konkret für ein KMU verändert',
  description:
    'Zwischen einer auf einem einzigen Computer installierten Software und einem überall zugänglichen Online-Werkzeug geht der Unterschied über blosse Bequemlichkeit hinaus: Das gewinnt ein Schweizer KMU wirklich dadurch.',
  excerpt:
    'Eine auf einem einzigen Arbeitsplatz installierte Software scheint auszureichen — bis der Tag kommt, an dem man von einer Baustelle, einem anderen Büro oder gleichzeitig mit einer Kollegin fakturieren muss.',
  category: 'Comparatifs & outils',
  keywords: ['Online Fakturierungssoftware KMU', 'Cloud Rechnungssoftware Schweiz', 'Fakturierung überall zugänglich', 'Vorteile Online Software KMU', 'Web Fakturierung vs installierte Software'],
  publishedAt: '2026-07-17',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Eine «Online»-Fakturierungssoftware (Cloud) steht einer lokal auf einem einzigen Computer installierten Software gegenüber. Dieser Unterschied wirkt technisch, hat aber sehr konkrete Folgen für den Alltag eines Bau-KMU.',
    },
    { type: 'h2', text: 'Was «online» konkret bringt' },
    {
      type: 'list',
      items: [
        'Zugriff von jedem Gerät aus (Baustelle, Büro, zu Hause), ohne von einem einzigen Arbeitsplatz abhängig zu sein',
        'Mehrere Personen können gleichzeitig arbeiten, ohne sich in derselben Datei gegenseitig zu stören',
        'Die Sicherungen erfolgen automatisch, unabhängig von einer Festplatte, die ausfallen könnte',
        'Die Updates (neue MWST-Normen, QR-Rechnung) treffen automatisch ein, ohne manuellen Aufwand',
      ],
    },
    {
      type: 'stat',
      value: '0',
      label: 'manuelle Installation oder Aktualisierung nötig bei einem Online-Werkzeug, da alles automatisch auf Seiten des Anbieters erfolgt',
    },
    { type: 'h2', text: 'Das eigentliche Risiko einer lokal installierten Software' },
    {
      type: 'p',
      text: 'Eine auf einem einzigen Computer installierte Software schafft einen einzigen Ausfallpunkt: Ein Defekt, ein Diebstahl oder einfach die Abwesenheit der Person mit Zugriff, und das ganze Unternehmen kann nicht mehr fakturieren. Ein Online-Werkzeug eliminiert dieses Risiko durch seine Bauart.',
    },
    {
      type: 'callout',
      title: 'Die Datensicherheit bleibt eine echte Frage, die man stellen sollte',
      text: 'Bevor man sich für ein Online-Werkzeug entscheidet, sollte man prüfen, dass es die Daten in der Schweiz oder in der EU hostet und transparent über seine Sicherheitspraktiken ist, statt es einfach anzunehmen.',
    },
    {
      type: 'cta',
      title: 'Überall zugänglich, in der Schweiz gehostet',
      text: 'Cantia funktioniert online, zugänglich von jedem Gerät aus, mit in der Schweiz gehosteten Daten. Testen Sie 14 Tage kostenlos, ohne Code einzugeben.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Was ist der Hauptvorteil eines Online-Fakturierungswerkzeugs gegenüber einer installierten Software?',
      answer:
        'Der Zugriff von jedem Gerät aus, ohne von einem einzigen Computer abhängig zu sein — besonders wichtig für ein Unternehmen, das auf mehreren Baustellen gleichzeitig arbeitet.',
    },
    {
      question: 'Ist ein Online-Werkzeug genauso sicher wie eine lokal installierte Software?',
      answer:
        'In der Praxis meist sicherer dank automatischer Sicherungen, sofern man prüft, dass der Anbieter die Daten in der Schweiz oder der EU hostet und gute Sicherheitspraktiken anwendet.',
    },
    {
      question: 'Muss man etwas installieren, um ein Online-Fakturierungswerkzeug zu nutzen?',
      answer:
        'Nein, ein einfacher Browser oder eine mobile App genügen. Es ist keine Installation oder manuelle Aktualisierung nötig.',
    },
  ],
  relatedSlugs: [
    'application-hors-ligne-chantier-pourquoi-important',
    'logiciel-gestion-evolutif-grandit-avec-entreprise',
    'gestion-entreprise-sur-mobile-artisan',
  ],
};
