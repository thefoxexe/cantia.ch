import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'licenciement-ouvrier-batiment-delai-conge-cct',
  question: 'Welche Kündigungsfrist gilt für die Kündigung eines Bauarbeiters in der Schweiz?',
  title: 'Kündigung im Bauwesen: die Kündigungsfristen gemäss GAV und Obligationenrecht',
  description:
    'Die Kündigungsfrist eines Bauarbeiters hängt von seiner Dienstdauer und dem anwendbaren GAV ab. Ein Fehler setzt den Arbeitgeber dem Risiko aus, die Differenz entschädigen zu müssen. So berechnen Sie sie korrekt.',
  excerpt:
    'Eine falsch berechnete Kündigungsfrist ist nicht nur ein administrativer Fehler: Es ist eine Lohnforderung, die der Arbeiter geltend machen kann, manchmal Monate nach seinem Austritt.',
  category: 'RH & salaires',
  keywords: ['kündigung bauwesen', 'kündigungsfrist gav', 'dienstalter mitarbeiter', 'auflösung arbeitsvertrag', 'baubranche schweiz'],
  publishedAt: '2026-08-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Die für einen Bauarbeiter geltende Kündigungsfrist ist nicht fix: Sie hängt sowohl von seiner Dienstdauer im Unternehmen als auch vom anwendbaren Gesamtarbeitsvertrag (GAV) ab, der günstigere Regelungen vorsehen kann als das dispositive Recht des Obligationenrechts. Sich ausschliesslich auf Art. 335c OR zu beziehen, ohne den branchenspezifischen GAV zu prüfen, ist der häufigste Fehler.',
    },
    { type: 'h2', text: 'Die gesetzlichen Standardfristen (Art. 335c OR)' },
    {
      type: 'table',
      headers: ['Dienstalter', 'Kündigungsfrist'],
      rows: [
        ['Während der Probezeit', '7 Tage (sofern nicht anders vereinbart)'],
        ['1. Dienstjahr', '1 Monat auf das Ende eines Monats'],
        ['2. bis 9. Dienstjahr', '2 Monate auf das Ende eines Monats'],
        ['Ab dem 10. Dienstjahr', '3 Monate auf das Ende eines Monats'],
      ],
    },
    {
      type: 'callout',
      title: 'Der branchenspezifische GAV kann andere Fristen vorschreiben',
      text: 'Der Landesmantelvertrag für das Bauhauptgewerbe (und seine kantonalen Varianten) sieht teilweise besondere Bestimmungen zu Fristen, Schutzperioden oder der Form der Kündigung vor: Er geht dem dispositiven gesetzlichen Regime vor, wenn er für den Arbeitnehmer günstiger ist.',
    },
    { type: 'h2', text: 'Die Zeiträume, in denen nicht gekündigt werden darf' },
    {
      type: 'list',
      items: [
        'Während einer Arbeitsunfähigkeit infolge Krankheit oder Unfall (befristeter Schutz, Dauer je nach Dienstalter unterschiedlich)',
        'Während des Schweizer Militärdiensts oder einer ähnlichen gesetzlichen Pflicht',
        'Während der Schwangerschaft und der 16 Wochen nach der Niederkunft',
        'Eine während einer Schutzperiode ausgesprochene Kündigung ist nichtig, sie muss nach Ende der Schutzperiode erneut ausgesprochen werden',
      ],
    },
    {
      type: 'cta',
      title: 'Ein Team im Blick, Baustelle für Baustelle',
      text: 'Das Personal-Modul von Cantia zentralisiert das Eintrittsdatum jedes Mitarbeitenden und dessen Verlauf, was nützlich ist, um das genaue Dienstalter bei der Berechnung einer Kündigungsfrist zu prüfen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Welche gesetzliche Kündigungsfrist gilt für einen Mitarbeitenden mit 3 Jahren Dienstalter?',
      answer:
        'Zwei Monate auf das Ende eines Monats gemäss Art. 335c OR, sofern der anwendbare GAV der Baubranche keine günstigere Regelung vorsieht.',
    },
    {
      question: 'Kann man einem Mitarbeitenden in Krankheitsabwesenheit kündigen?',
      answer:
        'Nein, eine während einer Schutzperiode (Krankheit, Unfall, Militärdienst, Mutterschaft) ausgesprochene Kündigung ist nichtig. Sie muss nach Ablauf der Schutzperiode erneut ausgesprochen werden.',
    },
    {
      question: 'Kann der GAV eine längere Frist vorsehen als das Obligationenrecht?',
      answer:
        'Ja, und in diesem Fall geht er dem dispositiven gesetzlichen Regime vor: Man sollte stets den anwendbaren GAV prüfen, statt sich ausschliesslich auf Art. 335c OR zu verlassen.',
    },
  ],
  relatedSlugs: [
    'salaire-minimum-cct-construction-suisse',
    'accident-travail-chantier-obligations-employeur-suva',
    'vacances-non-prises-fin-annee-batiment-cct',
  ],
};
