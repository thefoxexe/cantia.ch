import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'apprenti-batiment-salaire-obligations-employeur',
  question: 'Welchen Lohn zahlt man einem Lernenden im Bauwesen, und welche Pflichten hat das ausbildende Unternehmen?',
  title: 'Lernende im Bauwesen: Lohn, Betreuung und Pflichten des ausbildenden Unternehmens',
  description:
    'Einen Lernenden im Bauwesen auszubilden bedeutet einen progressiven, durch den GAV festgelegten Lohn, eine echte pädagogische Betreuung und Pflichten gegenüber dem Kanton: Das sollte ein kleines Unternehmen vorausplanen.',
  excerpt:
    'Einen Lernenden aufzunehmen ist nicht einfach «ein Paar Hände mehr». Es ist ein geregeltes Engagement, mit einem präzisen Lohn pro Ausbildungsjahr und einer vom Unternehmen erwarteten echten pädagogischen Begleitung.',
  category: 'RH & salaires',
  keywords: ['Lohn Lernender Bauwesen', 'Berufsbildung Bau', 'GAV Lernende', 'Lehrbetrieb Bau', 'Lehrvertrag Bauwesen'],
  publishedAt: '2026-08-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Einen Lernenden im Bauwesen auszubilden entspricht oft einem echten Bedürfnis (Nachwuchs, geringere anfängliche Lohnkosten), bringt aber konkrete Pflichten mit sich, die viele kleine Unternehmen erst unterwegs entdecken: einen progressiven, durch den GAV des jeweiligen Berufs festgelegten Lohn, eine dokumentierte pädagogische Betreuung und eine regelmässige Abstimmung mit der Berufsschule.',
    },
    { type: 'h2', text: 'Ein Lohn, der mit jedem Ausbildungsjahr steigt' },
    {
      type: 'p',
      text: 'Der Lehrlingslohn wird durch den Gesamtarbeitsvertrag des betreffenden Berufs (Maurerei, Zimmerei, Gipserei-Malerei usw.) festgelegt, mit einer Skala, die mit jedem Ausbildungsjahr steigt. Es handelt sich nie um einen von Fall zu Fall verhandelbaren Betrag, weshalb die Prüfung des für den genauen Beruf geltenden GAV einen häufigen Skalenfehler vermeidet.',
    },
    {
      type: 'list',
      items: [
        'Der Lohn steigt mit jedem Ausbildungsjahr, in der Regel auf jährlicher und nicht strikt monatlicher Basis',
        'Ein branchenspezifischer GAV kann von einem Bauberuf zum anderen unterschiedliche Beträge vorsehen',
        'Verpflegungs- und Fahrtentschädigungen folgen im Allgemeinen denselben Regeln wie für ausgebildete Mitarbeiter',
        'Ein anteiliger 13. Monatslohn gilt meist auch für den Lernenden, sofern der GAV nichts anderes vorsieht',
      ],
    },
    {
      type: 'callout',
      title: 'Das ausbildende Unternehmen braucht eine kantonale Bewilligung',
      text: 'Die Ausbildung eines Lernenden erfordert eine Ausbildungsbewilligung der zuständigen kantonalen Behörde, die prüft, ob das Unternehmen über die nötige Betreuung und Ausstattung verfügt. Das ist nicht automatisch allein durch die Ausübung eines anerkannten Berufs gegeben.',
    },
    { type: 'h2', text: 'Die pädagogische Betreuung ist nicht optional' },
    {
      type: 'p',
      text: 'Über den Lohn hinaus verpflichtet sich das Unternehmen, einem Bildungsplan zu folgen, einen verantwortlichen Ausbildner zu bestimmen und mit der Berufsschule sowie teilweise den überbetrieblichen Kursen zusammenzuarbeiten. Ein Ausbildungsheft oder ein Fortschrittsjournal, auch informell geführt, hilft zu dokumentieren, dass der Lernende den erwarteten Kompetenzen in jeder Etappe tatsächlich ausgesetzt war.',
    },
    {
      type: 'cta',
      title: 'Ein Baustellenjournal, das auch der Ausbildung dient',
      text: 'Der Baustellen-Feed von Cantia ermöglicht es, die von jedem Teammitglied ausgeführten Aufgaben zu dokumentieren, Lernende eingeschlossen, was eine konkrete Grundlage für die Ausbildungsverfolgung bildet.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ist der Lohn eines Lernenden im Bauwesen verhandelbar?',
      answer:
        'Nein, er folgt einer durch den Gesamtarbeitsvertrag des betreffenden Berufs festgelegten Skala, die je nach Ausbildungsjahr steigt, und ist zwischen Unternehmen und Lernendem nicht frei verhandelbar.',
    },
    {
      question: 'Braucht es eine Bewilligung, um einen Lernenden auszubilden?',
      answer:
        'Ja, das Unternehmen muss eine Ausbildungsbewilligung der zuständigen kantonalen Behörde erhalten, die die verfügbare Betreuung und Ausstattung prüft.',
    },
    {
      question: 'Hat ein Lernender Anspruch auf einen anteiligen 13. Monatslohn?',
      answer:
        'In der Regel ja, nach denselben Regeln wie für ausgebildete Mitarbeiter, sofern der geltende Gesamtarbeitsvertrag nichts ausdrücklich anderes vorsieht.',
    },
  ],
  relatedSlugs: [
    'calculer-13e-salaire-prorata-employe',
    'salaire-minimum-cct-construction-suisse',
    'licenciement-ouvrier-batiment-delai-conge-cct',
  ],
};
