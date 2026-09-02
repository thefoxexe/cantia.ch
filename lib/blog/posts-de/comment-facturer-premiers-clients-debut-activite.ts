import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'comment-facturer-premiers-clients-debut-activite',
  question: 'Wie stellt man seinen allerersten Kunden korrekt Rechnung, wenn man eine Tätigkeit startet?',
  title: 'Die ersten Kunden richtig fakturieren: die richtigen Reflexe ab dem ersten Dokument',
  description:
    'Die erste Rechnung gibt den Ton für alle folgenden vor. Die Punkte, die vor dem Versand geprüft werden sollten, um von Beginn der Tätigkeit an auf einer soliden Basis zu starten.',
  excerpt:
    'Die allererste versendete Rechnung zählt mehr, als man denkt. Oft entscheidet gerade sie, ob ein neuer Kunde schnell und ohne Verhandeln zahlt, oder die Sache in die Länge zieht.',
  category: 'Comparatifs & outils',
  keywords: ['erste Kunden fakturieren', 'erste Rechnung Selbstständiger', 'Rechnungsstellung starten Schweiz', 'korrekte Rechnung Einsteiger', 'Tipps erste Rechnungsstellung'],
  publishedAt: '2026-07-26',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Die erste an einen Kunden versendete Rechnung markiert oft einen symbolischen Meilenstein in einer neuen Tätigkeit, hat aber auch ein echtes praktisches Gewicht: Ein professionelles und korrektes Dokument von Beginn an schafft Vertrauen, ein unsauberes Dokument sät Zweifel.',
    },
    { type: 'h2', text: 'Was auf einer ersten Rechnung nie fehlen darf' },
    {
      type: 'list',
      items: [
        'Eine fortlaufende Rechnungsnummer, ohne Lücken, bereits ab dem ersten Dokument',
        'Der anwendbare MWST-Satz, oder ein klarer Hinweis auf Nicht-Steuerpflicht, falls zutreffend',
        'Korrekte Bankangaben, idealerweise mit einer Zahlungsreferenz für die QR-Rechnung',
        'Eine klar angegebene Zahlungsfrist, nicht nur stillschweigend vorausgesetzt',
      ],
    },
    {
      type: 'stat',
      value: '30 Tage',
      label: 'übliche Standard-Zahlungsfrist in der Schweiz für eine erste Rechnung, sofern keine andere Vereinbarung ausdrücklich erwähnt wird',
    },
    { type: 'h2', text: 'Schnell nach Abschluss der Arbeit fakturieren, nicht erst Wochen später' },
    {
      type: 'p',
      text: 'Ein Kunde erinnert sich unmittelbar nach Abschluss der Baustelle noch klar an die ausgeführte Arbeit und seine Zufriedenheit. Eine schnell versendete Rechnung wird deshalb deutlich seltener beanstandet als eine Rechnung, die drei Wochen später eintrifft, wenn die Erinnerung schon verblasst ist.',
    },
    {
      type: 'callout',
      title: 'Ein Tool, das automatisch die richtigen Regeln anwendet, verhindert Anfängerfehler',
      text: 'Nummerierung, MWST, Pflichtangaben: Eine Rechnungssoftware regelt das automatisch, was den klassischen Fehler beim allerersten «von Hand» erstellten Dokument vermeidet.',
    },
    {
      type: 'cta',
      title: 'Eine korrekte Rechnung schon beim ersten Versand',
      text: 'Cantia wendet automatisch Nummerierung, MWST und die Schweizer QR-Rechnung an: Selbst die allererste Rechnung ist damit tadellos.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Welche Angaben dürfen auf einer ersten Rechnung nie fehlen?',
      answer:
        'Eine fortlaufende Nummer, der anwendbare MWST-Satz (oder ein Hinweis auf Nicht-Steuerpflicht), korrekte Bankangaben und eine klare Zahlungsfrist.',
    },
    {
      question: 'Wie lange nach Abschluss der Baustelle sollte die Rechnung versendet werden?',
      answer:
        'So schnell wie möglich, denn ein Kunde erinnert sich unmittelbar danach noch klar an die ausgeführte Arbeit, was das Risiko einer Beanstandung im Vergleich zu einer erst Wochen später versendeten Rechnung senkt.',
    },
    {
      question: 'Hilft eine Rechnungssoftware, Anfängerfehler zu vermeiden?',
      answer:
        'Ja: Sie wendet automatisch Nummerierung, MWST und Pflichtangaben an, was die häufigen Lücken bei einer von Hand erstellten Rechnung vermeidet.',
    },
  ],
  relatedSlugs: [
    'mentions-obligatoires-facture-suisse-tva',
    'vitesse-reponse-devis-taux-conversion-batiment',
    'logiciel-facturation-raison-individuelle-suisse',
  ],
};
