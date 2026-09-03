import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'travailleur-temporaire-interimaire-batiment-regles',
  question: 'Temporärarbeiter im Baugewerbe einsetzen: Welche Regeln gelten und welche Fallstricke gibt es?',
  title: 'Temporärarbeiter im Baugewerbe: Was Sie vor dem Einsatz wissen müssen',
  description:
    'Temporärarbeit ermöglicht es, eine Aktivitätsspitze schnell aufzufangen, setzt aber ein bewilligungspflichtiges Personalverleihunternehmen voraus, sowie Koordinationsregeln mit dem GAV der Baustelle.',
  excerpt:
    'Ein Temporärarbeiter kostet pro Stunde mehr als ein fester Mitarbeiter, erspart aber die Bindung einer Rekrutierung. Man muss die Regeln kennen, damit daraus ein echter Gewinn wird, kein verstecktes Risiko.',
  category: 'RH & salaires',
  keywords: ['temporärarbeit baugewerbe schweiz', 'personalverleih bau', 'temporärarbeiter baustelle', 'temporärfirma bau', 'befristete arbeitskräfte schweiz'],
  publishedAt: '2026-07-01',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Temporärarbeiter zur Bewältigung einer Aktivitätsspitze ist im Baugewerbe üblich. Rechtlich läuft das jedoch zwingend über ein Personalverleihunternehmen, das einer kantonalen und eidgenössischen Bewilligung bedarf, und nicht über eine informelle Vereinbarung zwischen zwei Unternehmen.',
    },
    { type: 'h2', text: 'Was Temporärarbeit von einem einfachen Personalverleih unter Firmen unterscheidet' },
    {
      type: 'list',
      items: [
        'Ein Personalverleihunternehmen benötigt eine offizielle Bewilligung, um Personal zu vermitteln (ein informeller Personalverleih zwischen zwei Baufirmen hat diesen rechtlichen Status nicht)',
        'Der Arbeitsvertrag bindet den Temporärarbeiter an die Verleihfirma, nicht an das Unternehmen, das ihn auf der Baustelle einsetzt: Die Verleihfirma bleibt für Lohn und Sozialabgaben verantwortlich',
        'Das Einsatzunternehmen muss dennoch dieselben Arbeitssicherheitsregeln beachten wie für seine eigenen Mitarbeitenden',
      ],
    },
    { type: 'h2', text: 'Die Koordination mit dem GAV der Baustelle' },
    {
      type: 'p',
      text: 'Ein auf einer Baustelle eingesetzter Temporärarbeiter untersteht weiterhin den Bedingungen des für die Branche geltenden Gesamtarbeitsvertrags, genauso wie ein Festangestellter, was die Verleihfirma zwingt, dies beim ausbezahlten Lohn zu berücksichtigen – und die höheren Stundenkosten für das Einsatzunternehmen teilweise erklärt.',
    },
    {
      type: 'callout',
      title: 'Der angezeigte Stundenansatz enthält bereits die Lohnnebenkosten: ein direkter Vergleich mit dem Lohn eines Festangestellten ist irreführend',
      text: 'Der von einer Verleihfirma verrechnete Tarif deckt den Lohn, die Sozialabgaben und ihre eigene Marge ab. Der sinnvolle Vergleich erfolgt mit den vollen Stundenkosten eines Festangestellten, nicht nur mit dessen Bruttolohn.',
    },
    { type: 'h2', text: 'Wann Temporärarbeit wirklich Sinn ergibt' },
    {
      type: 'list',
      items: [
        'Eine punktuelle und zeitlich begrenzte Aktivitätsspitze auf ein oder zwei bestimmten Baustellen',
        'Ein schneller Ersatz bei unvorhergesehener Abwesenheit, ohne Zeit für eine eigene Rekrutierung',
        'Ein Test des Aktivitätsvolumens, bevor über eine dauerhafte Einstellung entschieden wird',
      ],
    },
    {
      type: 'cta',
      title: 'Die Stunden einer temporären Verstärkung wie die des Stammteams verfolgen',
      text: 'Das Modul Stunden & Löhne von Cantia erfasst die Tätigkeit jeder Person auf einer Baustelle, temporäre Verstärkung inklusive, ohne doppeltes Parallelsystem.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Kann man Personal zwischen zwei Baufirmen verleihen, ohne über eine Agentur zu gehen?',
      answer:
        'Ein echter Personalverleih erfordert ein bewilligtes Personalverleihunternehmen. Eine informelle Vereinbarung ohne diesen rechtlichen Status ist nicht konform.',
    },
    {
      question: 'Untersteht ein Temporärarbeiter dem GAV der Baustelle, auf der er arbeitet?',
      answer:
        'Ja, die Bedingungen des für die Branche geltenden Gesamtarbeitsvertrags gelten für ihn genauso wie für einen Festangestellten, was die Verleihfirma in ihrem Lohn berücksichtigen muss.',
    },
    {
      question: 'Warum kostet ein Temporärarbeiter pro Stunde mehr als ein Festangestellter?',
      answer:
        'Der verrechnete Tarif enthält bereits Lohn, Sozialabgaben und die Marge der Agentur, weshalb der Vergleich mit den vollen Stundenkosten eines Mitarbeitenden sinnvoll ist, nicht nur mit dessen Bruttolohn.',
    },
  ],
  relatedSlugs: [
    'sous-effectif-chantier-recruter-ou-sous-traiter',
    'salaire-minimum-cct-construction-suisse',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
