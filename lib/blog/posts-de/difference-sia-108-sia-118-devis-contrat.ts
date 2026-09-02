import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'difference-sia-108-sia-118-devis-contrat',
  question: 'Was ist der Unterschied zwischen der SIA-Norm 108 und der SIA-Norm 118, und welche gilt für meine Offerte?',
  title: 'SIA 108 vs. SIA 118: zwei oft verwechselte Normen, zwei sehr unterschiedliche Rollen',
  description:
    'Die SIA-Norm 118 regelt die Beziehung zwischen Bauherr und Unternehmer, die SIA-Norm 108 diejenige mit Beauftragten (Architekten, Ingenieuren). Wer sie verwechselt, riskiert die falschen Regeln anzuwenden.',
  excerpt:
    'Die beiden Normen tragen benachbarte Nummern und stammen vom selben Herausgeber. Doch die eine betrifft Bauarbeiten, die andere geistige Dienstleistungen. Die Verwechslung ist häufig und teuer.',
  category: 'Juridique & normes',
  keywords: ['SIA 108 gegen SIA 118', 'SIA-Norm bauwesen', 'unterschied SIA 108 SIA 118', 'SIA-Norm offerte', 'werkvertrag SIA'],
  publishedAt: '2026-06-17',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Die SIA-Norm 118 und die SIA-Norm 108 sind zwei unterschiedliche Vertragsnormen des Schweizerischen Ingenieur- und Architektenvereins, die aufgrund ihrer benachbarten Nummern oft verwechselt werden. Sie regeln nicht dieselbe Beziehung, und die irrtümliche Anwendung der einen anstelle der anderen kann zentrale Punkte wie die Gewährleistung oder die Haftung verfälschen.',
    },
    { type: 'h2', text: 'Was jede Norm abdeckt' },
    {
      type: 'table',
      headers: ['Norm', 'Erfasste Beziehung', 'Typisches Beispiel'],
      rows: [
        ['SIA 118', 'Bauherr ↔ Unternehmer (Werkvertrag)', 'Ein Maurer oder Elektriker, der Arbeiten ausführt'],
        ['SIA 108', 'Bauherr ↔ Beauftragter (Auftragsvertrag)', 'Ein Architekt oder Ingenieur, der ein Projekt entwirft/leitet'],
      ],
    },
    {
      type: 'p',
      text: 'Die SIA-Norm 118 gilt für einen Werkvertrag (Art. 363 OR ff.): Der Unternehmer schuldet ein Ergebnis (das fertiggestellte Werk). Die SIA-Norm 108 gilt hingegen für einen Auftragsvertrag (Art. 394 OR ff.), bei dem der Beauftragte Mittel und Sorgfalt schuldet, kein garantiertes Ergebnis. Diese Unterscheidung verändert grundlegend das anwendbare Haftungsregime.',
    },
    { type: 'h2', text: 'Wie bei der SIA 118 gilt auch die SIA 108 nicht automatisch' },
    {
      type: 'list',
      items: [
        'Weder die SIA 108 noch die SIA 118 gelten standardmässig: Sie müssen im Vertrag oder in der Offerte ausdrücklich erwähnt werden',
        'Fehlt diese Erwähnung, regelt allein das Obligationenrecht die Beziehung, mit teils weniger detaillierten Regeln',
        'Ein Handwerker, der Arbeiten ausführt (keine Planung), muss sich auf die SIA 118 beziehen, niemals auf die SIA 108',
      ],
    },
    {
      type: 'callout',
      title: 'Für einen Bauhandwerker ist fast immer die SIA 118 massgebend',
      text: 'Die SIA 108 betrifft Planungs- und Projektleitungsberufe. Ein Unternehmer, der Arbeiten ausführt, unterliegt dem Regime des Werkvertrags, also der SIA 118, sofern diese angewendet wird.',
    },
    {
      type: 'cta',
      title: 'Vermerken Sie die richtige Norm auf jeder Offerte',
      text: 'Cantia ermöglicht es, individuelle Bedingungen hinzuzufügen, einschliesslich eines ausdrücklichen Verweises auf die SIA 118, direkt auf Ihren Offerten und Verträgen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Welche SIA-Norm gilt für einen Handwerker, der Arbeiten ausführt?',
      answer:
        'Es ist die SIA 118, welche den Werkvertrag zwischen Bauherr und Unternehmer regelt. Die SIA 108 betrifft dagegen Beauftragte wie Architekten und Ingenieure.',
    },
    {
      question: 'Gelten die SIA-Normen automatisch auf einer Baustelle?',
      answer:
        'Nein, weder die SIA 108 noch die SIA 118 gelten standardmässig. Sie müssen ausdrücklich im Vertrag oder in der Offerte erwähnt werden, um Gültigkeit zu haben.',
    },
    {
      question: 'Was ist der wichtigste Unterschied im Regime zwischen den beiden Normen?',
      answer:
        'Die SIA 118 beruht auf einer Erfolgspflicht (das fertiggestellte Werk), die SIA 108 auf einer Sorgfalts- und Bemühungspflicht, ohne Erfolgsgarantie.',
    },
  ],
  relatedSlugs: [
    'norme-sia-118-devis-obligatoire',
    'contrat-entreprise-vs-mandat-artisan',
    'garantie-travaux-construction-2-ou-5-ans',
  ],
};
