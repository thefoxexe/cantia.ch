import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cantia-adapte-metier-specifique-batiment',
  question: 'Kann sich Cantia an einen sehr spezifischen Beruf im Bauwesen anpassen, der nicht in die Standardschemen passt?',
  title: 'Ein Beruf zu speziell für eine Standardsoftware? Nicht unbedingt',
  description:
    'Manche Berufe im Bauwesen haben Bedürfnisse, die Standardwerkzeuge nie ganz abdecken. Wie eine massgeschneiderte Funktion diese Lücke schliessen kann.',
  excerpt:
    'Viele Handwerker in Nischenberufen denken irgendwann «keine Software ist für das gemacht, was ich tue». Das stimmt oft für starre Werkzeuge, aber viel weniger für ein Werkzeug, das mit Ihnen mitwachsen kann.',
  category: 'Sur-mesure & automatisations',
  keywords: ['software für spezifischen beruf bauwesen', 'massgeschneidertes werkzeug nischenberuf', 'branchensoftware individuell anpassen', 'cantia massgeschneiderte funktion', 'flexible software baubranche'],
  publishedAt: '2026-08-15',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Die meisten Verwaltungssoftwares sind darauf ausgelegt, die gemeinsamen Bedürfnisse des gesamten Bauwesens abzudecken: Offerten, Rechnungen, Baustellen. Ein Nischenberuf (Denkmalpflege, hochspezialisierte Installation, untypische Leistung) muss seine Bedürfnisse manchmal in Schemen zwängen, die nicht ganz passen.',
    },
    { type: 'h2', text: 'Was bei einem Nischenberuf typischerweise nicht passt' },
    {
      type: 'list',
      items: [
        'Ein für den Beruf typischer Wortschatz oder eigene Masseinheiten, die in generischen Werkzeugen fehlen',
        'Ein vom Standard abweichender Baustellenverfolgungsprozess (spezifische Etappen, besondere Freigaben)',
        'Zusätzliche, vom Beruf verlangte Dokumente oder Felder, ohne Entsprechung in einem Standardformular',
      ],
    },
    { type: 'h2', text: 'Der Unterschied zwischen einem starren und einem mitwachsenden Werkzeug' },
    {
      type: 'p',
      text: 'Ein starres Werkzeug bietet eine geschlossene Liste von Funktionen, die man nehmen oder lassen muss. Cantia bietet zusätzlich zu seinem Standardgrundgerüst die Möglichkeit, eine massgeschneiderte Funktion oder ein Feld für ein Unternehmen zu entwickeln, dessen Bedürfnisse aus dem üblichen Rahmen fallen. Das ist ein speziell für dieses Unternehmen konzipiertes Modul, kein zusammengebasteltes Behelfsmittel.',
    },
    {
      type: 'stat',
      value: '1',
      label: 'Gespräch genügt in der Regel, um zu beurteilen, ob ein spezifisches Berufsbedürfnis durch eine massgeschneiderte Funktion abgedeckt werden kann, statt von vornherein aufzugeben',
    },
    {
      type: 'callout',
      title: 'Massgeschneiderte Lösungen ersetzen nicht das Standardgrundgerüst, sie ergänzen es',
      text: 'Eine massgeschneidert entwickelte Funktion kommt zu bereits bestehenden Offerten, Rechnungen und der Baustellenverfolgung hinzu. Das Unternehmen fängt nicht bei null an: Es erweitert ein Werkzeug, das es bereits nutzt.',
    },
    {
      type: 'cta',
      title: 'Sprechen wir über Ihren Beruf',
      text: 'Wenn Ihre Tätigkeit Bedürfnisse hat, die Cantia noch nicht standardmässig abdeckt, kontaktieren Sie uns. Viele aktuelle Funktionen sind aus einer konkreten Anfrage eines Kunden entstanden.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Kann Cantia eine Funktion für einen sehr spezifischen Beruf im Bauwesen entwickeln?',
      answer:
        'Ja, zusätzlich zum Standardgrundgerüst (Offerten, Rechnungen, Baustellen) kann Cantia massgeschneiderte Module für Bedürfnisse entwickeln, die einem bestimmten Beruf eigen sind.',
    },
    {
      question: 'Muss man das Werkzeug komplett wechseln bei einem nicht standardmässigen Berufsbedürfnis?',
      answer:
        'Nicht zwingend: Eine massgeschneiderte Funktion kommt in der Regel zum bereits genutzten Grundgerüst hinzu, ohne bei einem anderen Werkzeug von null zu beginnen.',
    },
    {
      question: 'Wie erfährt man, ob das eigene spezifische Bedürfnis massgeschneidert abgedeckt werden kann?',
      answer:
        'Am einfachsten spricht man direkt darüber, denn zahlreiche aktuelle Funktionen von Cantia sind aus einer konkreten Anfrage eines Kunden in einer ähnlichen Situation entstanden.',
    },
  ],
  relatedSlugs: [
    'logiciel-standard-vs-solution-personnalisee-batiment',
    'demander-fonctionnalite-sur-mesure-editeur-logiciel',
    'logiciel-construit-avec-vous-sur-mesure',
  ],
};
