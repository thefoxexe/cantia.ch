import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-13e-salaire-prorata-employe',
  question: 'Wie berechnet man den 13. Monatslohn anteilig für einen im Jahresverlauf eingetretenen Mitarbeiter?',
  title: 'Den 13. Monatslohn anteilig im Jahresverlauf berechnen',
  description:
    'Ein im April eingestellter Mitarbeiter hat im Dezember keinen Anspruch auf einen vollen 13. Monatslohn. Die anteilige Berechnung erfolgt auf Basis der tatsächlich gearbeiteten Monate, inklusive Prämien und Absenzen.',
  excerpt:
    'Ein am 1. April eingestellter Arbeiter erhält im Dezember keinen vollen 13. Monatslohn. Man muss aber genau wissen, auf welchen Monaten die Berechnung beruht und was sie reduziert.',
  category: 'RH & salaires',
  keywords: ['13. Monatslohn', 'pro rata Berechnung', 'Lohnberechnung', 'Eintritt im Jahresverlauf', 'Austritt Mitarbeiter'],
  publishedAt: '2026-04-02',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Arbeiter, eingestellt am 1. April, gekündigt oder ausgetreten am 30. September: Wie viel steht ihm als 13. Monatslohn zu? Die Antwort liegt in einer einfachen Formel, doch die häufigsten Fehler entstehen dadurch, was man in die Berechnung einbezieht (oder nicht).',
    },
    { type: 'h2', text: 'Die Grundformel' },
    {
      type: 'p',
      text: 'Der anteilige 13. Monatslohn wird wie folgt berechnet: (Anzahl gearbeiteter Monate im Jahr ÷ 12) × Betrag des vollen 13. Monatslohns. Ein Mitarbeiter, der 6 volle Monate im Jahr gearbeitet hat, hat Anspruch auf die Hälfte eines 13. Monatslohns, nicht auf einen anders berechneten, willkürlichen Monatslohn.',
    },
    {
      type: 'table',
      headers: ['Situation', 'Gearbeitete Monate', 'Anteil des 13. Monatslohns'],
      rows: [
        ['Mitarbeiter das ganze Jahr angestellt', '12', '12/12 = 100 %'],
        ['Eintritt am 1. April', '9', '9/12 = 75 %'],
        ['Austritt am 30. September', '9', '9/12 = 75 %'],
        ['Vertrag über 3 Monate (Zeitarbeit/Saison)', '3', '3/12 = 25 %'],
      ],
    },
    {
      type: 'callout',
      title: 'Das Detail, das die Berechnung verfälscht: unvollständige Monate',
      text: 'Ein Mitarbeiter, der am 15. eines Monats eintritt, hat grundsätzlich keinen Anspruch auf einen vollen Monat in der Berechnung: Die meisten Verträge und Gepflogenheiten sehen eine zu den tatsächlich gearbeiteten Tagen jenes Monats proportionale Regel vor, statt systematisch auf den vollen Monat aufzurunden. Der Arbeitsvertrag oder der anwendbare GAV präzisiert in der Regel die genaue anzuwendende Methode.',
    },
    { type: 'h2', text: 'Was den 13. Monatslohn reduzieren kann' },
    {
      type: 'list',
      items: [
        'Eine längere unbezahlte Absenz (z. B. unbezahlter Urlaub) reduziert in der Regel den anteiligen Anspruch für den betreffenden Zeitraum',
        'Ein längerer Krankheits- oder Unfallausfall kann je nach Vertrag und anwendbaren Erwerbsausfallversicherungen unterschiedlich behandelt werden',
        'Ein Wechsel des Beschäftigungsgrads im Jahresverlauf (Übergang zu Teilzeit) muss für den betreffenden Zeitraum anteilig berücksichtigt werden',
      ],
    },
    { type: 'h2', text: 'Das eigentliche Risiko: es beim Austritt zu vergessen' },
    {
      type: 'p',
      text: 'Der beim Austritt im Jahresverlauf geschuldete anteilige 13. Monatslohn wird in der Schlussabrechnung regelmässig vergessen, besonders wenn der Austritt hastig abgewickelt wird. Es handelt sich um eine Forderung des Mitarbeiters, keine freiwillige Geste. Ihn zu vergessen setzt das Unternehmen also einer Forderung aus, oft lange nach dem effektiven Austritt.',
    },
    {
      type: 'cta',
      title: 'Die Löhne des Teams, sauber berechnet',
      text: 'Das Modul HR & Löhne von Cantia berechnet den Nettolohn anhand der für jeden Mitarbeiter konfigurierten Stunden und Sätze – eine zuverlässigere Grundlage als eine bei jedem Austritt von Hand neu erstellte Berechnung.',
      buttonLabel: 'HR & Löhne entdecken',
    },
  ],
  faq: [
    {
      question: 'Wie berechnet man einen 13. Monatslohn für einen im Jahresverlauf eingetretenen Mitarbeiter?',
      answer:
        'Indem man den vollen 13. Monatslohn mit der Anzahl tatsächlich gearbeiteter Monate geteilt durch 12 multipliziert: Ein Mitarbeiter, der 9 von 12 Monaten anwesend war, hat Anspruch auf 75 % eines vollen 13. Monatslohns.',
    },
    {
      question: 'Hat ein im Jahresverlauf ausgeschiedener Mitarbeiter Anspruch auf einen anteiligen 13. Monatslohn?',
      answer:
        'Ja, es handelt sich um eine Forderung, die ihm bei seinem Austritt zusteht, berechnet auf Basis der tatsächlich gearbeiteten Monate. Sie muss in der Lohnschlussabrechnung erscheinen.',
    },
    {
      question: 'Reduziert eine Krankheitsabsenz den anteiligen 13. Monatslohn?',
      answer:
        'Das hängt vom Arbeitsvertrag und dem anwendbaren Gesamtarbeitsvertrag ab. Eine längere unbezahlte Absenz reduziert in der Regel den Anteil, doch die genaue Behandlung variiert je nach Fall.',
    },
  ],
  relatedSlugs: [
    'salaire-minimum-cct-construction-suisse',
    'heures-supplementaires-batiment-majoration-25',
    'avs-ai-independant-batiment',
  ],
};
