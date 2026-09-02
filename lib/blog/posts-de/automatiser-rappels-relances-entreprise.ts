import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'automatiser-rappels-relances-entreprise',
  question: 'Wie automatisiert man den Versand von Zahlungserinnerungen und Mahnungen für sein Bauunternehmen?',
  title: 'Mahnungen automatisieren: nie mehr eine offene Rechnung vergessen',
  description:
    'Einen Kunden wegen einer unbezahlten Rechnung oder einer ausstehenden Offerte zu mahnen, ist oft die erste administrative Aufgabe, die vergessen geht. Wie man das automatisiert, ohne den persönlichen Ton zu verlieren.',
  excerpt:
    'Die Kundenmahnung ist oft die administrative Aufgabe, die am leichtesten vergessen geht — nicht aus Nachlässigkeit, sondern weil sie im Gegensatz zu einem Baustellentermin nie ein festes Datum im Kalender hat.',
  category: 'Sur-mesure & automatisations',
  keywords: ['mahnwesen automatisieren bauunternehmen', 'automatische zahlungserinnerung rechnung', 'offerte automatisch nachfassen', 'zahlungserinnerung schweiz baubranche', 'kundenmahnung nicht vergessen'],
  publishedAt: '2026-08-21',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Im Gegensatz zu einem Baustellentermin hat eine Mahnung für eine unbezahlte Rechnung kein festes Datum im Kalender. Sie hängt von einer verstrichenen Frist ab, die im Tagesgeschäft leicht aus dem Blick gerät. Das Ergebnis: offene Rechnungen, die sich hinziehen — nicht aus bösem Willen, sondern schlicht aus Vergesslichkeit.',
    },
    { type: 'h2', text: 'Was eine automatisierte Mahnung konkret ermöglicht' },
    {
      type: 'list',
      items: [
        'Eine Erinnerung, die automatisch X Tage nach Fälligkeit einer Rechnung verschickt wird, ohne dass man daran denken muss',
        'Ein unterschiedlicher Ton je nach Anzahl bereits versendeter Mahnungen (zuerst höflich, danach bestimmter)',
        'Eine intern sichtbare Meldung für das Unternehmen, auch wenn die Mahnung selbst automatisch verschickt wird',
        'Die Möglichkeit, eine automatische Mahnung bei einer besonderen Vereinbarung mit dem Kunden zu pausieren',
      ],
    },
    {
      type: 'stat',
      value: '15–20 %',
      label: 'Anteil überfälliger Rechnungen, die in der Regel in den Tagen nach einer gut getimten automatischen Mahnung ohne manuellen Eingriff beglichen werden',
    },
    { type: 'h2', text: 'Automatisieren bedeutet nicht, die Kontrolle über die Kundenbeziehung zu verlieren' },
    {
      type: 'p',
      text: 'Eine gute automatisierte Mahnung bleibt immer im Einzelfall anpassbar: Bei einem treuen Kunden, der nur einen Tag im Rückstand ist, behält das Unternehmen die Hand, um den Ton anzupassen oder den Versand zu verschieben, statt eine starre Automatisierung hinzunehmen.',
    },
    {
      type: 'callout',
      title: 'Regelmässigkeit zählt mehr als ein aggressiver Ton',
      text: 'Eine automatische Mahnung, die systematisch zum richtigen Zeitpunkt verschickt wird, ist oft wirksamer als eine einmalige, sehr nachdrückliche Mahnung, die erst lange nach Ablauf der Frist versendet wird.',
    },
    {
      type: 'cta',
      title: 'Mahnungen, die von allein losgehen — zum richtigen Zeitpunkt',
      text: 'Cantia kann Ihre Mahnungen für unbezahlte Rechnungen automatisieren, mit der Möglichkeit, den Ton anzupassen oder sie im Einzelfall zu pausieren.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Warum werden Mahnungen für unbezahlte Rechnungen oft vergessen?',
      answer:
        'Sie haben im Gegensatz zu einem Baustellentermin kein festes Datum im Kalender, da sie von einer verstrichenen Frist abhängen, die leichter aus dem Blick gerät.',
    },
    {
      question: 'Ersetzt eine automatische Mahnung die manuelle Nachverfolgung vollständig?',
      answer:
        'Nein, die Automatisierung ersetzt die manuelle Nachverfolgung nicht vollständig: Eine gute Mahnung bleibt im Einzelfall anpassbar, insbesondere bei einem treuen Kunden, bei dem eine Anpassung von Ton oder Frist gerechtfertigt ist.',
    },
    {
      question: 'Welche konkrete Wirkung hat eine gut getimte automatische Mahnung?',
      answer:
        'In der Regel werden 15 bis 20 % der überfälligen Rechnungen in den Tagen nach einer zum richtigen Zeitpunkt versendeten automatischen Mahnung beglichen, ohne manuellen Eingriff.',
    },
  ],
  relatedSlugs: [
    'relancer-client-facture-impayee-sans-perdre-client',
    'automatiser-taches-repetitives-entreprise-sans-developpeur',
    'poursuite-facture-impayee-procedure-suisse',
  ],
};
