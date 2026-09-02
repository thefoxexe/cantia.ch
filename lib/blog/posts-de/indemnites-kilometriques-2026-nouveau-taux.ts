import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'indemnites-kilometriques-2026-nouveau-taux',
  question: 'Welchen Kilometeransatz muss man 2026 bei seinen Angestellten anwenden?',
  title: 'Kilometerentschädigung 2026: der Ansatz, der sich soeben geändert hat',
  description:
    'Per 1. Januar 2026 erhöht die Eidgenössische Steuerverwaltung den Pauschalansatz von CHF 0.70 auf CHF 0.75/km und führt eine neue Deklarationspflicht auf dem Lohnausweis ein.',
  excerpt:
    'CHF 0.70 pro Kilometer, das war einmal. Die neue Wegleitung zum Lohnausweis setzt seit dem 1. Januar 2026 CHF 0.75 fest. Sie fügt zudem ein Kreuzchenfeld hinzu, das noch kaum jemand kennt.',
  category: 'RH & salaires',
  keywords: ['kilometerentschädigung', 'berufsauslagen', 'lohnausweis', 'privatfahrzeug', 'estv'],
  publishedAt: '2026-03-30',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'CHF 0.70 pro Kilometer: die Zahl, die praktisch alle Schweizer Unternehmen im Kopf hatten, um einen Mitarbeitenden für die Nutzung seines Privatfahrzeugs zu entschädigen. Seit dem 1. Januar 2026 ist das nicht mehr der richtige Wert: Die Eidgenössische Steuerverwaltung hat ihn in ihrer aktualisierten Wegleitung zum Lohnausweis auf CHF 0.75/km angehoben.',
    },
    { type: 'h2', text: 'Was dieser Ansatz tatsächlich abdeckt' },
    {
      type: 'p',
      text: 'Es handelt sich um einen Pauschalansatz, der sämtliche mit der geschäftlichen Nutzung eines Privatfahrzeugs verbundenen Kosten abdecken soll (Treibstoff, Abnutzung, Versicherung, Abschreibung), ohne dass der Mitarbeitende jeden einzelnen Posten separat belegen muss. Ein Unternehmen bleibt frei, per Vertrag oder interner Regelung einen anderen Ansatz festzulegen, doch CHF 0.75/km dient der Steuerverwaltung als Standardreferenz.',
    },
    {
      type: 'callout',
      title: 'Die Neuerung, die mehr zählt als der Betrag selbst',
      text: 'Eine Pauschalentschädigung für die Nutzung eines Privatfahrzeugs muss neu ausdrücklich auf dem Lohnausweis vermerkt werden, mit einem Kreuz bei Buchstabe F (eine Deklarationspflicht, die es in dieser Form bisher nicht gab). Das Kreuz nicht zu setzen löscht die Entschädigung nicht, setzt aber einer Korrektur bei einer Steuerkontrolle aus.',
    },
    { type: 'h2', text: 'Was das konkret für ein Bauunternehmen ändert' },
    {
      type: 'list',
      items: [
        'Kilometerentschädigungen, die nach dem 1. Januar 2026 ausbezahlt werden, müssen den neuen Referenzansatz verwenden, um mit der ESTV-Wegleitung übereinzustimmen',
        'Der Lohnausweis zum Jahresende muss das neue Kreuzchen für jeden Mitarbeitenden abbilden, der eine solche Entschädigung erhält',
        'Ein vertraglich anders festgelegter Ansatz bleibt möglich. Eine deutliche Abweichung vom Referenzansatz kann bei einer Kontrolle jedoch Aufmerksamkeit erregen',
      ],
    },
    {
      type: 'p',
      text: 'Für ein Team, das sich häufig von Baustelle zu Baustelle bewegt, ist der Unterschied zwischen CHF 0.70 und CHF 0.75 pro Kilometer übers Jahr gerechnet nicht kosmetisch: Bei 15’000 gefahrenen Kilometern sind das CHF 750 mehr auszuzahlen — oder ohne Anpassung CHF 750 unter dem Referenzansatz.',
    },
    {
      type: 'cta',
      title: 'Der Kilometeransatz, pro Organisation konfigurierbar',
      text: 'Mit Cantia lässt sich ein unternehmenseigener Kilometeransatz festlegen, der automatisch auf die Spesenabrechnungen des Teams angewendet wird.',
      buttonLabel: 'Personal & Löhne entdecken',
    },
  ],
  faq: [
    {
      question: 'Wie hoch ist der neue Kilometeransatz in der Schweiz 2026?',
      answer:
        'CHF 0.75 pro Kilometer seit dem 1. Januar 2026, gegenüber zuvor CHF 0.70, gemäss der aktualisierten Wegleitung der Eidgenössischen Steuerverwaltung zum Lohnausweis.',
    },
    {
      question: 'Muss ein Unternehmen diesen Ansatz zwingend anwenden?',
      answer:
        'Nein, es bleibt frei, per Vertrag oder interner Regelung einen anderen Ansatz festzulegen: CHF 0.75/km dient der Steuerverwaltung als Standardreferenz, nicht als zwingende gesetzliche Untergrenze.',
    },
    {
      question: 'Was muss neu auf dem Lohnausweis vermerkt werden?',
      answer:
        'Ein Kreuz bei Buchstabe F, das ausdrücklich anzeigt, dass dem Mitarbeitenden während des Jahres eine Pauschalentschädigung für die geschäftliche Nutzung eines Privatfahrzeugs ausbezahlt wurde.',
    },
  ],
  relatedSlugs: [
    'heures-supplementaires-batiment-majoration-25',
    'salaire-minimum-cct-construction-suisse',
    'calculer-heures-travail-ouvrier-minutes-decimales',
  ],
};
