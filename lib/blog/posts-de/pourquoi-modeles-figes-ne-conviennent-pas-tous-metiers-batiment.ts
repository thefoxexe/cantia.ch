import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'pourquoi-modeles-figes-ne-conviennent-pas-tous-metiers-batiment',
  question: 'Warum passen starre Vorlagen von Verwaltungssoftware nicht zu allen Berufen im Bauwesen?',
  title: 'Warum eine starre Vorlage nicht für das gesamte Bauwesen gleichzeitig passen kann',
  description:
    'Das Bauwesen vereint sehr unterschiedliche Berufe. Warum ein einziges starres Modell für Offerten oder Baustellenverfolgung logischerweise nicht allen gleichzeitig gerecht werden kann.',
  excerpt:
    'Ein Maurer, ein Elektriker und ein Gartenbauer kalkulieren, verfolgen eine Baustelle und stellen Rechnungen nicht auf dieselbe Weise. Ein einziges, starres Modell kann daher nie allen dreien gleichzeitig perfekt gerecht werden.',
  category: 'Sur-mesure & automatisations',
  keywords: ['starre vorlage bausoftware', 'software angepasst an baugewerbe', 'warum generisches tool nicht reicht', 'vielfalt der baugewerbe software', 'individualisierung nach beruf bau'],
  publishedAt: '2026-08-24',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Der Begriff «Bauwesen» umfasst eine äusserst vielfältige Realität: Maurerarbeiten, Elektrik, Gartenbau, Zimmerei – jeder Beruf mit eigenen Masseinheiten, eigenen Baustellenabläufen, eigenen Rechnungsgewohnheiten. Ein starres, für «das Bauwesen» im Allgemeinen gedachtes Modell kann strukturell nicht für jeden Beruf perfekt passen.',
    },
    { type: 'h2', text: 'Konkrete Beispiele dieser Vielfalt' },
    {
      type: 'list',
      items: [
        'Ein Maurer kalkuliert in m³ Beton, ein Elektriker in Elektropunkten, ein Gartenbauer oft pauschal pro Leistung',
        'Ein Dachdecker dokumentiert seine Baustelle mit besonderer Aufmerksamkeit für das Wetter, ein Schreiner mit einer getrennt von der Montage erfassten Werkstattzeit',
        'Ein Heizungstechniker muss lange Lieferfristen einplanen, ein Schlosser hat vor allem mit punktuellen Notfällen zu tun',
      ],
    },
    {
      type: 'stat',
      value: '15+',
      label: 'unterschiedliche Berufsgruppen, die in der Regel unter dem generischen Begriff «Bauwesen» zusammengefasst werden, jede mit Verwaltungsbedürfnissen, die sich in konkreten Punkten unterscheiden',
    },
    { type: 'h2', text: 'Ein gutes Verwaltungstool muss sich dem Beruf anpassen, nicht umgekehrt' },
    {
      type: 'p',
      text: 'Statt jeden Beruf zu zwingen, sich an ein einziges Modell anzupassen, sollte ein für das Bauwesen gedachtes Verwaltungstool erlauben, das anzupassen, was für jeden Beruf wirklich zählt (verwendete Einheiten, Verfolgungsschritte, erstellte Dokumente), ohne die Gesamtkohärenz zu verlieren.',
    },
    {
      type: 'callout',
      title: 'Der gemeinsame Sockel bleibt gross, nur die Details ändern sich',
      text: 'Die meisten Bedürfnisse (Offerten, Rechnungen, MWST, Baustellenverfolgung) sind allen Berufen im Bauwesen gemeinsam. Bei den spezifischen Details macht die Individualisierung wirklich den Unterschied.',
    },
    {
      type: 'cta',
      title: 'Ein Tool, das sich Ihrem Beruf anpasst, nicht umgekehrt',
      text: 'Cantia deckt bereits die Besonderheiten zahlreicher Berufe im Bauwesen ab und kann für jene, die noch aus dem Standardrahmen fallen, massgeschneidert angepasst werden.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Warum passt eine generische «Bau»-Software nicht perfekt zu allen Berufen?',
      answer:
        'Weil das Bauwesen mehr als 15 verschiedene Berufsgruppen umfasst, jede mit eigenen Masseinheiten, Baustellenabläufen und Rechnungsgewohnheiten.',
    },
    {
      question: 'Was bleibt in einer Verwaltungssoftware zwischen allen Berufen im Bauwesen gemeinsam?',
      answer:
        'Die grosse Mehrheit der Grundbedürfnisse (Offerten, Rechnungen, MWST-Konformität, Baustellenverfolgung) bleibt gemeinsam, nur bestimmte spezifische Details unterscheiden sich von Beruf zu Beruf.',
    },
    {
      question: 'Muss sich eine Verwaltungssoftware dem Beruf anpassen oder der Beruf der Software?',
      answer:
        'Idealerweise passt sich das Tool dem Beruf an, denn eine gute Software sollte erlauben, das anzupassen, was wirklich zählt (Einheiten, Schritte, Dokumente), ohne das Unternehmen zu zwingen, seine Arbeitsweise zu ändern.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'logiciel-standard-vs-solution-personnalisee-batiment',
    'logiciel-devis-facture-maconnerie-suisse',
  ],
};
