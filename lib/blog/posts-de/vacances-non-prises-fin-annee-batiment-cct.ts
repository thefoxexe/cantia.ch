import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'vacances-non-prises-fin-annee-batiment-cct',
  question: 'Was macht man mit nicht bezogenen Ferientagen eines Bau-Mitarbeitenden am Jahresende?',
  title: 'Nicht bezogene Ferien am Jahresende im Baugewerbe: Übertragen, auszahlen oder verfallen lassen?',
  description:
    'Ein Saldo nicht bezogener Ferien wirft für Bauunternehmen eine echte Frage zu Liquidität und Arbeitsrecht auf: Hier die Regeln, die man kennen muss, bevor man entscheidet.',
  excerpt:
    'Ein Ferienguthaben, das sich Jahr für Jahr anhäuft, ist nie belanglos: Entweder stellt es eine Schuld gegenüber dem Mitarbeitenden dar, oder es offenbart ein Organisationsproblem, das sich wiederholen wird.',
  category: 'RH & salaires',
  keywords: ['nicht bezogene ferien', 'ferienguthaben mitarbeiter', 'arbeitsrecht baugewerbe schweiz', 'gav bau ferien', 'personalverwaltung baustelle'],
  publishedAt: '2026-07-31',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Der Grundsatz des Schweizer Rechts ist klar: Ferien müssen effektiv bezogen werden und dürfen grundsätzlich nicht durch eine Geldleistung ersetzt werden, solange das Arbeitsverhältnis andauert (Art. 329d OR). Ein Arbeitgeber, der nicht bezogene Ferien systematisch «auszahlt», statt sie beziehen zu lassen, geht ein rechtliches Risiko ein, auch wenn diese Praxis in manchen Kleinbetrieben verbreitet bleibt.',
    },
    { type: 'h2', text: 'Warum die Geldkompensation riskant ist' },
    {
      type: 'p',
      text: 'Die Barauszahlung von Ferien während laufendem Vertrag ist nur in sehr begrenzten Fällen zulässig, typischerweise bei einer kurzfristigen oder unregelmässigen Anstellung, bei der eine effektive Erholung nicht praktikabel ist. Für einen fest angestellten Mitarbeitenden im Baugewerbe ist das grundsätzlich nicht die Regel, und eine spätere Kontrolle kann solche Zahlungen umqualifizieren und trotzdem verlangen, dass die Tage tatsächlich bezogen oder kompensiert werden.',
    },
    {
      type: 'list',
      items: [
        'Die Übertragung von einem Jahr aufs andere ist möglich, sofern sie in einem vernünftigen Rahmen bleibt und sich nicht unbegrenzt anhäuft',
        'Der Arbeitgeber hat das Recht, den Zeitpunkt der Ferien festzulegen, unter Berücksichtigung der Wünsche des Mitarbeitenden, soweit mit dem Betrieb vereinbar',
        'Am Ende des Arbeitsverhältnisses muss der nicht bezogene Saldo ausbezahlt werden, diesmal in Geld',
        'Ein branchenspezifischer GAV kann ergänzende Regeln zur Übertragung oder Planung festlegen',
      ],
    },
    {
      type: 'callout',
      title: 'Die eigentliche operative Herausforderung: Ferien vor Jahresende planen',
      text: 'Ein Saldo, der im Dezember explodiert, spiegelt oft eine mangelnde Übersicht über die Baustellenplanung wider. Der Arbeitgeber zögert, Personal freizustellen, aus Angst, laufende Arbeiten zu verzögern.',
    },
    {
      type: 'cta',
      title: 'Eine Teamplanung, die Abwesenheiten vorausschaut',
      text: 'Das Modul Planung von Cantia gibt einen klaren Überblick über die laufenden Baustellen und das verfügbare Team. So planen Sie Ferien, ohne mitten in der Saison Personal zu verlieren.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Kann man nicht bezogene Ferien auszahlen, statt sie beziehen zu lassen?',
      answer:
        'Ausser in Sonderfällen wie einer kurzfristigen Anstellung lautet die Antwort nein, solange das Arbeitsverhältnis andauert. Die Geldauszahlung wird erst am Ende des Vertrags zur Regel.',
    },
    {
      question: 'Kann ein Mitarbeitender seine Ferien auf das folgende Jahr übertragen?',
      answer:
        'Ja, in vernünftigem Umfang, aber ein Saldo, der sich Jahr für Jahr unbegrenzt anhäuft, entspricht nicht dem Sinn des Gesetzes, das eine regelmässige, effektive Erholung will.',
    },
    {
      question: 'Wer entscheidet über den Zeitpunkt der Ferien: der Arbeitgeber oder der Mitarbeitende?',
      answer:
        'Der Arbeitgeber legt den Zeitpunkt fest, unter Berücksichtigung der Wünsche des Mitarbeitenden, soweit mit den Bedürfnissen des Betriebs vereinbar. Es ist kein einseitiges Recht der einen oder anderen Seite.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'calculer-13e-salaire-prorata-employe',
    'gerer-plusieurs-chantiers-en-parallele-methode',
  ],
};
