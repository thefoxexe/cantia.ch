import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'facturation-heures-regie-batiment-comment-faire',
  question: 'Wie fakturiert man im Bauwesen korrekt nach Aufwand (Regie)?',
  title: 'Regie-Arbeit im Bauwesen fakturieren: Was auf der Rechnung stehen muss, um nicht angefochten zu werden',
  description:
    'Eine nach Aufwand statt zum Festpreis fakturierte Arbeit ist stärker der Anfechtung durch den Kunden ausgesetzt, sofern die Details zu Stunden, Personen und Aufgaben nicht wirklich nachvollziehbar sind.',
  excerpt:
    'Ohne Festpreis-Offerte als Grundlage beruht eine Regie-Rechnung ganz auf dem Vertrauen des Kunden in die angegebene Stundenzahl. Dieses Vertrauen entsteht durch Detail, nicht durch eine runde Summe.',
  category: 'Devis & facturation',
  keywords: ['regierechnung baugewerbe', 'rechnung nach aufwand', 'arbeiten im regiebetrieb', 'anfechtung regierechnung', 'stundenerfassung baustelle'],
  publishedAt: '2026-07-07',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Die Fakturierung nach Regie, das heisst nach tatsächlich aufgewendeter Zeit statt zu einem im Voraus vereinbarten Festpreis, ist üblich bei Arbeiten, die im Voraus schwer zu beziffern sind: Reparaturen, während der Baustelle entdeckte Unvorhergesehenheiten, kleinere Einsätze. Das Problem liegt nie im Prinzip, sondern im Nachweis: Ohne ausreichendes Detail kann ein Kunde die fakturierte Stundenzahl anfechten, ohne dass es eine objektive Grundlage zur Klärung gibt.',
    },
    { type: 'h2', text: 'Was eine Regie-Rechnung detailliert aufzeigen muss' },
    {
      type: 'list',
      items: [
        'Das Datum jedes einzelnen Einsatzes, nicht nur einen globalen Zeitraum',
        'Die Anzahl Stunden pro Person, nicht eine zusammengefasste Summe ohne Detail',
        'Die genaue Art der an jedem Tag ausgeführten Arbeit, nicht eine wiederholte generische Beschreibung',
        'Den angewendeten Stundensatz, kohärent mit dem, was dem Kunden vor Arbeitsbeginn mitgeteilt wurde',
      ],
    },
    {
      type: 'callout',
      title: 'Den Kunden vor Beginn über das Regie-Prinzip zu informieren bleibt der beste Schutz',
      text: 'Selbst ohne Festpreis-Offerte vermeidet eine vorherige schriftliche Vereinbarung über Stundensatz und Prinzip der Aufwandsverrechnung den grössten Teil der Anfechtungen. Unklarheit entsteht fast immer durch anfängliches Schweigen, nicht durch eine tatsächliche Uneinigkeit über den Tarif.',
    },
    { type: 'h2', text: 'Die Stundenerfassung ist Ihr bester Nachweis' },
    {
      type: 'p',
      text: 'Ein zeitgestempeltes Stundenblatt, das laufend erfasst statt am Monatsende aus dem Gedächtnis rekonstruiert wird, verwandelt eine anfechtbare Regie-Rechnung in ein schwer widerlegbares Dokument. Es schützt das Unternehmen auch, falls ein Kunde Wochen später verlangt, eine bereits versandte Rechnung zu belegen.',
    },
    {
      type: 'cta',
      title: 'Erfasste Stunden, fakturiert ohne Detailverlust',
      text: 'Das Modul Personal & Löhne von Cantia verknüpft die Stundenerfassung pro Baustelle direkt mit der Fakturierung, sodass das Detail pro Tag und pro Person bei Rückfragen des Kunden stets verfügbar bleibt.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Muss eine Regie-Rechnung die Stunden Tag für Tag detaillieren?',
      answer:
        'Ja, das ist dringend empfohlen, denn eine Gesamtsumme ohne Detail nach Datum und Person ist deutlich leichter anfechtbar als ein präzises Stundenblatt.',
    },
    {
      question: 'Braucht es eine schriftliche Vereinbarung vor der Fakturierung von Regie-Arbeiten?',
      answer:
        'Das ist keine strikte gesetzliche Pflicht, aber den Kunden vor Beginn über Prinzip und Stundensatz zu informieren, vermeidet den grössten Teil späterer Streitigkeiten.',
    },
    {
      question: 'Wie schützt man sich, wenn ein Kunde die fakturierte Stundenzahl anficht?',
      answer:
        'Durch ein zeitgestempeltes und nach Aufgabe detailliertes Stundenblatt, das laufend erfasst statt im Nachhinein aus dem Gedächtnis rekonstruiert wird.',
    },
  ],
  relatedSlugs: [
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'calculer-prix-horaire-reel-ouvrier-batiment',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
