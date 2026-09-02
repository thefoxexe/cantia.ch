import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'automatiser-taches-repetitives-entreprise-sans-developpeur',
  question: 'Kann man die wiederkehrenden Aufgaben seines Unternehmens automatisieren, ohne Entwickler zu sein?',
  title: 'Automatisieren ohne zu programmieren: was für ein Bauunternehmen möglich ist',
  description:
    'Automatisierung ist nicht mehr Unternehmen mit eigener IT-Abteilung vorbehalten. Was heute in einem kleinen Bauunternehmen automatisiert werden kann, ohne eine einzige Zeile Code zu schreiben.',
  excerpt:
    'Automatisierung lässt oft an komplizierte Skripte oder teure Software denken. Für ein kleines Bauunternehmen kann es aber schlicht bedeuten, dass eine Mahnung von allein zum richtigen Zeitpunkt losgeht.',
  category: 'Sur-mesure & automatisations',
  keywords: ['aufgaben automatisieren ohne entwickler', 'automatisierung kmu baubranche', 'automatisieren ohne programmieren', 'zeit sparen automatisierung verwaltung', 'administrative automatisierung handwerk'],
  publishedAt: '2026-08-16',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Automatisierung lässt oft an komplexe Werkzeuge denken, die nur grossen Unternehmen mit eigener IT-Abteilung vorbehalten sind. Für ein kleines Bauunternehmen ist nützliche Automatisierung meist viel einfacher: wiederkehrende Aufgaben, die ohne manuellen Eingriff ausgelöst werden.',
    },
    { type: 'h2', text: 'Konkrete Beispiele bereits zugänglicher Automatisierung' },
    {
      type: 'list',
      items: [
        'Eine Mahnung für eine unbezahlte Rechnung, die nach einer definierten Frist automatisch verschickt wird',
        'Eine Benachrichtigung, wenn eine Offerte sich ihrem Ablaufdatum nähert, um den Kunden rechtzeitig zu erinnern',
        'Die automatische Berechnung der Rentabilität einer Baustelle, sobald Stunden und Ausgaben erfasst sind',
        'Ein Baustellenrapport, der automatisch aus bereits vor Ort aufgenommenen Fotos und Notizen erstellt wird',
      ],
    },
    {
      type: 'stat',
      value: '3–6h',
      label: 'wöchentliche Zeitersparnis im Durchschnitt durch die Automatisierung wiederkehrender administrativer Aufgaben in einem kleinen Bauunternehmen',
    },
    { type: 'h2', text: 'Der Unterschied zwischen Standard- und massgeschneiderter Automatisierung' },
    {
      type: 'p',
      text: 'Manche Automatisierungen existieren bereits standardmässig in einem guten Verwaltungstool (Mahnungen, Benachrichtigungen). Andere sind spezifisch für die Arbeitsweise eines bestimmten Unternehmens: Diese können massgeschneidert entwickelt werden, ohne dass das Unternehmen dafür einen Entwickler einstellen muss.',
    },
    {
      type: 'callout',
      title: 'Automatisieren heisst nicht, die Kontrolle zu verlieren',
      text: 'Eine gute Automatisierung bleibt immer sichtbar und anpassbar. Eine automatische Mahnung kann manuell abgebrochen werden, wenn die Situation es erfordert: Sie ersetzt nicht die Beurteilung durch das Unternehmen.',
    },
    {
      type: 'cta',
      title: 'Bereits fertige Automatisierungen — und weitere massgeschneidert möglich',
      text: 'Cantia automatisiert bereits grundlegende Mahnungen und Benachrichtigungen. Bei Bedarf können auch Automatisierungen entwickelt werden, die genau auf Ihre Arbeitsweise zugeschnitten sind.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Braucht es technische Kenntnisse, um Aufgaben im eigenen Bauunternehmen zu automatisieren?',
      answer:
        'Nein, denn zahlreiche Automatisierungen (Mahnungen, Benachrichtigungen, Berechnungen) existieren bereits standardmässig in einem guten Verwaltungstool, ohne dass Programmierkenntnisse nötig sind.',
    },
    {
      question: 'Welche Aufgaben sollten in einem kleinen Bauunternehmen zuerst automatisiert werden?',
      answer:
        'Mahnungen für unbezahlte Rechnungen, Benachrichtigungen für ablaufende Offerten und die automatische Berechnung der Rentabilität einer Baustelle gehören zu den nützlichsten Automatisierungen im Alltag.',
    },
    {
      question: 'Nimmt eine Automatisierung dem Unternehmen die Kontrolle über seine Entscheidungen?',
      answer:
        'Nein, eine gute Automatisierung bleibt immer sichtbar und manuell anpassbar. Sie beschleunigt wiederkehrende Aufgaben, ohne die menschliche Beurteilung wichtiger Entscheidungen zu ersetzen.',
    },
  ],
  relatedSlugs: [
    'automatiser-rappels-relances-entreprise',
    'automatiser-suivi-administratif-entreprise-artisanale',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
