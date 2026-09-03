import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'whatsapp-gestion-equipe-chantier-limites',
  question: 'Warum stösst WhatsApp bei der Führung eines Baustellenteams ab mehr als ein paar Personen an seine Grenzen?',
  title: 'WhatsApp zur Führung eines Baustellenteams: Warum es ab 5 Personen an Grenzen stösst',
  description:
    'WhatsApp funktioniert für zwei oder drei Personen sehr gut. Darüber hinaus geht die Information im Nachrichtenverlauf unter: Hier warum, und was danach übernimmt.',
  excerpt:
    'WhatsApp ist ein hervorragendes Gesprächstool. Es ist kein Führungstool. Und der Unterschied wird brutal deutlich, sobald das Team fünf Personen überschreitet.',
  category: 'Comparatifs & outils',
  keywords: ['whatsapp baustelle', 'teamführung baugewerbe', 'kommunikation baustelle', 'baustellen-tool schweiz', 'organisation bauunternehmen'],
  publishedAt: '2026-04-13',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine WhatsApp-Gruppe für das Team funktioniert am Anfang bemerkenswert gut (schnell, vertraut, jeder hat sie bereits installiert). Dann wächst das Team, die Baustellen vervielfachen sich, und dasselbe Tool, das zu genügen schien, wird zum Hauptreibungspunkt der Organisation.',
    },
    { type: 'h2', text: 'Was WhatsApp sehr gut kann' },
    {
      type: 'p',
      text: 'Ein schnelles Foto senden, eine dringende Frage stellen, eine Verspätung ankündigen: Für diese Art von punktuellem Austausch schlägt nichts WhatsApp an Schnelligkeit. Das Problem zeigt sich nie bei einer einzelnen Nachricht. Es zeigt sich bei der Anhäufung.',
    },
    { type: 'h2', text: 'Wo es konkret an Grenzen stösst' },
    {
      type: 'list',
      items: [
        'Eine wichtige Information, die an einem Dienstag gesendet wird, geht bis Donnerstag in fünfzig Nachrichten unter, sodass niemand sie wiederfindet, ohne den gesamten Verlauf zu durchsuchen',
        'Keine strukturelle Verknüpfung zwischen einer Nachricht und der betreffenden Baustelle: unmöglich, «alles, was diese eine Baustelle betrifft» zu filtern',
        'Ein in der Gruppe gesendetes Foto ist weder geolokalisiert noch auf verwertbare Weise mit Zeitstempel versehen, für einen Rapport oder einen späteren Streitfall',
        'Der Plan, wer wohin geht, bleibt im Kopf desjenigen, der ihn festgelegt hat, statt für das ganze Team gleichzeitig sichtbar zu sein',
        'Keine saubere Spur für Fakturierung, Rentabilität oder Kundenhistorie: Alles bleibt in einer Konversation, nicht in einem System',
      ],
    },
    {
      type: 'callout',
      title: 'Die Schwelle ist nicht magisch, aber sie existiert',
      text: 'Es gibt keine strikte Regel bei fünf Personen, aber das Muster wiederholt sich: Jenseits eines kleinen Teams und ein oder zwei Baustellen übersteigt das Nachrichtenvolumen das, was eine lineare Konversation ohne Informationsverlust aufnehmen kann. Das deutlichste Symptom: Jemand fragt erneut nach einer bereits gegebenen Information, einfach weil sie im Fluss verschwunden ist.',
    },
    { type: 'h2', text: 'Was übernimmt, ohne alles auf einmal zu ändern' },
    {
      type: 'p',
      text: 'Der sanfteste Übergang stellt nicht «WhatsApp» gegen «eine Software». Er behält WhatsApp für punktuelle Dringlichkeiten bei und verlagert alles, was wiederauffindbar bleiben muss (Planung, Baustellenfotos, Entscheidungen, Kundennachverfolgung), in ein nach Baustelle strukturiertes Tool. Die schnelle Nachricht bleibt schnell; was auf Dauer erhalten bleiben muss, hört auf, vom Durchscrollen einer Konversation abzuhängen.',
    },
    {
      type: 'cta',
      title: 'Ein Nachrichtenfeed pro Baustelle, nicht eine einzige grosse Gruppe',
      text: 'Cantia organisiert Austausch, Fotos und Notizen nach Baustelle (Monate später wiederauffindbar), ohne eine ganze Konversation durchscrollen zu müssen, um die gesuchte Information wiederzufinden.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Reicht WhatsApp für die Führung eines kleinen Baustellenteams aus?',
      answer:
        'Für zwei oder drei Personen und eine Baustelle auf einmal, ja: Die Grenze zeigt sich, wenn Team und Anzahl Baustellen wachsen und die Information im Nachrichtenvolumen untergeht.',
    },
    {
      question: 'Was ist das Hauptproblem von WhatsApp bei der Führung mehrerer Baustellen?',
      answer:
        'Das Fehlen von Struktur: keine Verknüpfung zwischen einer Nachricht und der betreffenden Baustelle, was es unmöglich macht, die Information später wiederzufinden oder zu filtern.',
    },
    {
      question: 'Muss man WhatsApp komplett aufgeben für ein Baustellenverwaltungstool?',
      answer:
        'Nicht zwingend. WhatsApp bleibt effizient für punktuelle Dringlichkeiten, aber der wirksamste Übergang verlagert vor allem das, was wiederauffindbar bleiben muss (Planung, Fotos, Historie), in ein nach Baustelle strukturiertes Tool.',
    },
  ],
  relatedSlugs: [
    'gerer-plusieurs-chantiers-en-parallele-methode',
    'bexio-vs-cantia-logiciel-batiment',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
