import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'meilleur-logiciel-pas-cher-petit-artisan',
  question: 'Was ist die beste günstige Software für einen kleinen, alleine arbeitenden Handwerker?',
  title: 'Die beste günstige Software für einen Solo-Handwerker',
  description:
    'Für einen alleine arbeitenden Handwerker darf «günstig» niemals «ohne die wesentlichen Funktionen» bedeuten. So unterscheiden Sie einen gut durchdachten Sparplan von einem einfach beschnittenen.',
  excerpt:
    'Ein Solo-Handwerker braucht kein Werkzeug für zwanzig Angestellte. Aber er braucht trotzdem ein vollständiges Werkzeug — nur eben passend dimensioniert für eine einzige Person.',
  category: 'Comparatifs & outils',
  keywords: ['beste günstige Software Handwerker', 'Software Solo-Handwerker', 'erschwingliches Werkzeug kleiner Betrieb', 'günstige Software Bau', 'Fakturierung Handwerker selbständig günstig'],
  publishedAt: '2026-07-13',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Ein alleine arbeitender Handwerker sucht naturgemäss einen günstigen Plan, was logisch ist, da das Tätigkeitsvolumen anfangs bescheiden bleibt. Die Falle besteht darin, einen Plan «günstig, weil auf eine Person zugeschnitten» mit einem Plan «günstig, weil ihm wesentliche Funktionen fehlen» zu verwechseln.',
    },
    { type: 'h2', text: 'Was auch auf einem Solo-Plan niemals fehlen darf' },
    {
      type: 'list',
      items: [
        'Die MWST- und QR-Rechnungskonformität (nicht verhandelbar, unabhängig von der Grösse des Unternehmens)',
        'Die Statusverfolgung von Offerten und Rechnungen, damit nichts durchrutscht',
        'Der vollständige mobile Zugriff, nicht nur eine eingeschränkte Ansicht auf dem Telefon',
        'Die Möglichkeit, das Konto am Tag der ersten Anstellung zu erweitern, ohne von vorne zu beginnen',
      ],
    },
    {
      type: 'stat',
      value: '1',
      label: 'Nutzer reicht in der Regel, um die Bedürfnisse eines Solo-Handwerkers abzudecken: Ein für eine Person dimensionierter Plan kostet logischerweise weniger als ein Team-Plan',
    },
    { type: 'h2', text: 'Ein gut durchdachter Solo-Plan bleibt ein vollständiges Werkzeug' },
    {
      type: 'p',
      text: 'Der Preisunterschied zwischen einem Solo- und einem Team-Plan ergibt sich aus der Nutzerzahl und bestimmten fortgeschrittenen Modulen (Personal & Löhne, Planung mit mehreren Personen), nicht aus den Grundfunktionen wie Offerten, Rechnungen und Baustellenverfolgung, die auch beim erschwinglichsten Plan vollständig bleiben müssen.',
    },
    {
      type: 'callout',
      title: 'Den Preis pro tatsächlich genutzter Funktion vergleichen, nicht nur den angezeigten Preis',
      text: 'Ein Plan für CHF 20, dem die QR-Rechnung fehlt, kostet in Wirklichkeit mehr als ein Plan für CHF 40, der sie enthält — sobald man die verlorene Zeit für die Korrektur nicht konformer Rechnungen einrechnet.',
    },
    {
      type: 'cta',
      title: 'Ein Plan für den Solo-Handwerker, ohne Kompromisse beim Wesentlichen',
      text: 'Cantia bietet einen erschwinglichen und vollständigen Plan für einen alleine arbeitenden Handwerker. Testen Sie ihn 14 Tage kostenlos, ohne Code einzugeben.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ist ein günstiger «Solo»-Plan zwangsläufig unvollständig?',
      answer:
        'Nicht unbedingt, denn ein guter Solo-Plan bleibt bei den wesentlichen Funktionen vollständig (Offerten, Rechnungen, MWST, QR-Rechnung); der reduzierte Preis ergibt sich vor allem aus der begrenzten Nutzerzahl.',
    },
    {
      question: 'Kann man einen Solo-Plan am Tag der ersten Anstellung erweitern?',
      answer:
        'Mit einem gut konzipierten Werkzeug ja: Der Wechsel zu einem Team-Plan erfolgt ohne Verlust des Verlaufs und ohne das Werkzeug komplett wechseln zu müssen.',
    },
    {
      question: 'Wie vergleicht man den Preis von zwei Softwarelösungen für Solo-Handwerker wirklich?',
      answer:
        'Indem man vergleicht, was jeder Preis konkret enthält (QR-Rechnung, Statusverfolgung, vollständiger mobiler Zugriff) — nicht nur die oben auf der Preisseite angezeigte Zahl.',
    },
  ],
  relatedSlugs: [
    'combien-coute-logiciel-facturation-pas-cher',
    'meilleur-rapport-qualite-prix-logiciel-pme-batiment',
    'logiciel-simple-debuter-independant-batiment',
  ],
};
