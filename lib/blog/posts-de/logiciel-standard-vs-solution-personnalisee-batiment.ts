import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-standard-vs-solution-personnalisee-batiment',
  question: 'Soll man für sein Bauunternehmen eine Standardsoftware oder eine 100% massgeschneiderte Lösung wählen?',
  title: 'Standardsoftware oder 100% massgeschneidert: die wahre Wahl ist nicht binär',
  description:
    'Zwischen einem starren Standardtool und einer teuren 100% individuellen Entwicklung gibt es einen dritten Weg: eine solide Standardbasis, ergänzt durch gezielte Massanfertigung.',
  excerpt:
    'Die Frage «Standard oder massgeschneidert» ist oft falsch gestellt: Die wirklich effizienteste Option für die meisten Unternehmen ist eine verlässliche Standardbasis, ergänzt um genau das Mass an Anpassung, das nötig ist.',
  category: 'Sur-mesure & automatisations',
  keywords: ['standardsoftware vs massanfertigung', 'individuelle lösung bauunternehmen', 'kosten massgeschneiderte entwicklung', 'wahl zwischen standard und individuell', 'verwaltungssoftware 100% individuell'],
  publishedAt: '2026-08-19',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Bei einem spezifischen Bedürfnis kann die Versuchung entstehen, ein vollständig massgeschneidertes Tool «from scratch» entwickeln zu lassen. Das ist selten die beste Wahl für ein KMU im Bauwesen. Kosten, Zeitaufwand und Wartung einer 100% individuellen Entwicklung übersteigen bei Weitem, was eine gut ergänzte Standardbasis bieten kann.',
    },
    { type: 'h2', text: 'Die drei Optionen, mit ihren tatsächlichen Kosten' },
    {
      type: 'list',
      items: [
        '100% Standardsoftware: schnell und erschwinglich, aber starr bei wirklich spezifischen Bedürfnissen',
        '100% individuelle Entwicklung: perfekt angepasst, aber teuer, langwierig in der Umsetzung und auf Dauer allein zu warten',
        'Standardbasis + gezielte Massanfertigung: das Beste aus beiden Welten, mit der vom Anbieter gepflegten Basis (Offerten, Rechnungen, MWST, Updates) und nur dem wirklich Spezifischen als separate Entwicklung',
      ],
    },
    {
      type: 'stat',
      value: '5-10x',
      label: 'in der Regel höhere Kosten einer 100% individuellen Softwareentwicklung im Vergleich zu einer Standardbasis, ergänzt durch einige gezielte Funktionen',
    },
    { type: 'h2', text: 'Das wahre Risiko der 100% Massanfertigung: die Wartung über die Zeit' },
    {
      type: 'p',
      text: 'Ein vollständig massgeschneidertes Tool muss auf unbestimmte Zeit vom Unternehmen selbst oder einem dedizierten Dienstleister gewartet werden. Regulatorische Entwicklungen (MWST, QR-Rechnung) erfolgen nie automatisch, wie es bei einem Anbieter der Fall ist, der eine Standardbasis für all seine Kunden pflegt.',
    },
    {
      type: 'callout',
      title: 'Gezielte Massanfertigung profitiert auch von den Updates der Standardbasis',
      text: 'Eine massgeschneiderte Funktion, die auf einer gut gepflegten Standardbasis aufbaut, profitiert weiterhin von den allgemeinen Updates (Konformität, Sicherheit), ohne zusätzlichen Aufwand für das Unternehmen.',
    },
    {
      type: 'cta',
      title: 'Eine solide Basis, ergänzt nach Ihren Bedürfnissen',
      text: 'Cantia kombiniert eine vollständige, gepflegte Standardbasis mit der Möglichkeit, massgeschneiderte Funktionen für das wirklich Spezifische Ihres Unternehmens zu entwickeln.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ist eine 100% individuelle Softwareentwicklung eine gute Wahl für ein KMU im Bauwesen?',
      answer:
        'Selten, wegen der Kosten, der Zeitdauer und vor allem der langfristigen Wartungslast, die das für ein kleines Unternehmen ohne eigene IT-Abteilung bedeutet.',
    },
    {
      question: 'Was ist die beste Option zwischen Standardsoftware und individueller Lösung?',
      answer:
        'In der Regel eine gut gepflegte Standardbasis, ergänzt durch gezielte massgeschneiderte Funktionen nur dort, wo es wirklich nötig ist (statt vollständig das eine oder das andere).',
    },
    {
      question: 'Profitiert ein massgeschneidertes Tool wie ein Standardtool von rechtlichen Updates?',
      answer:
        'Wenn die Massanfertigung auf einer gut gepflegten Standardbasis aufbaut, ja. Andernfalls muss das Unternehmen jede regulatorische Entwicklung selbst verwalten.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'creer-champ-processus-sur-mesure-logiciel-gestion',
    'logiciel-construit-avec-vous-sur-mesure',
  ],
};
