import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'heures-supplementaires-batiment-majoration-25',
  question: 'Wie funktionieren Überstunden im Bauwesen in der Schweiz?',
  title: 'Überstunden am Bau: was sich mit dem GAV 2026 geändert hat',
  description:
    'Der neue Gesamtarbeitsvertrag der Bauwirtschaft ändert die Überstundenberechnung: bis zu 100 Stunden übertragbar, 25 %-Zuschlag darüber hinaus, und eine neue Wochenschwelle von 50 Stunden inklusive Arbeitsweg.',
  excerpt:
    'Der GAV Bauhauptgewerbe 2026 ändert eine Regel, die fast noch niemand verinnerlicht hat: Die Fahrzeit zählt neu bei der Berechnung der Überstunden mit.',
  category: 'RH & salaires',
  keywords: ['überstunden', '25 prozent zuschlag', 'gav bauhauptgewerbe', 'arbeitsweg zeit', 'überstunden ausgleich'],
  publishedAt: '2026-03-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Der neue Landesmantelvertrag für das Bauhauptgewerbe, gültig für die Periode 2026-2031, ändert eine Regel, die sich direkt auf die Lohnabrechnung jedes Bauarbeiters auswirkt: Die Überstundenberechnung berücksichtigt neu ausdrücklich die Fahrzeit, nicht nur die effektive Arbeitszeit auf der Baustelle.',
    },
    { type: 'h2', text: 'Die neue Regel: 50 Stunden, Arbeitsweg inbegriffen' },
    {
      type: 'p',
      text: 'Alle Arbeits- und Wegzeiten, die zusammengerechnet 50 Stunden pro Woche übersteigen, gelten neu als Überstunden. Sie werden im Folgemonat mit dem um 25 % erhöhten Grundlohn entschädigt. Eine entfernte Baustelle, die jeden Tag eine zusätzliche Fahrstunde bedeutet, kann eine «normale» Woche mit 45 effektiven Arbeitsstunden allein wegen des Arbeitswegs in die Überstundenregelung kippen lassen.',
    },
    {
      type: 'callout',
      title: 'Der Saldoübertrag, auf 100 Stunden begrenzt',
      text: 'Stunden, die diesen Wochendeckel von 50h nicht übersteigen, können von einem Jahr aufs nächste übertragen werden, bis zu einem Maximum von 100 Stunden. Über diesem Total hinaus müssen die überschüssigen Stunden mit dem 25 %-Zuschlag ausbezahlt werden: Ein unbegrenztes Aufhäufen in einem Zeitkonto ist nicht möglich.',
    },
    { type: 'h2', text: 'Was das für die tägliche Personalverwaltung bedeutet' },
    {
      type: 'list',
      items: [
        'Die Fahrzeit zu einer entfernten Baustelle muss separat von der Arbeitszeit erfasst werden, um beides korrekt addieren zu können',
        'Ein Überstundenkonto, das 100h übertragene Stunden übersteigt, muss eine Auszahlung auslösen, nicht nur eine Notiz für später',
        'Der 25 %-Zuschlag gilt auf dem Grundlohn (ein Berechnungsdetail, das auf einer von Hand erstellten Abrechnung leicht übersehen wird)',
      ],
    },
    { type: 'h2', text: 'Überstunden und Mehrstunden auseinanderhalten' },
    {
      type: 'p',
      text: 'Die «Überstunden» im Sinne des GAV (über die normale Arbeitszeit und die 50h-Schwelle hinaus) dürfen nicht mit den «Mehrstunden» eines Teilzeitangestellten verwechselt werden, der unterhalb der normalen Vollzeitdauer bleibt. Die beiden Ausgleichsregelungen sind nicht identisch, und ihre Verwechslung ist eine klassische Fehlerquelle bei der Lohnabrechnung.',
    },
    {
      type: 'cta',
      title: 'Die Stundenberechnung, ohne zwischen zwei Tabellen zu jonglieren',
      text: 'Das Modul Personal & Löhne von Cantia erfasst die Stunden pro Baustelle und pro Mitarbeitendem laufend — die zuverlässigste Grundlage, um eine Überschreitung zu erkennen, bevor sie sich über Monate anhäuft.',
      buttonLabel: 'Personal & Löhne entdecken',
    },
  ],
  faq: [
    {
      question: 'Zählt die Fahrzeit bei der Berechnung der Überstunden mit?',
      answer:
        'Ja, seit dem GAV Bauhauptgewerbe 2026-2031: Alle Arbeits- und Wegzeiten, die zusammengerechnet 50h pro Woche übersteigen, gelten als Überstunden.',
    },
    {
      question: 'Wie viele Überstunden können auf das folgende Jahr übertragen werden?',
      answer:
        'Bis zu 100 Stunden. Über diesem Deckel müssen die überschüssigen Stunden im Folgemonat mit einem 25 %-Zuschlag auf dem Grundlohn ausbezahlt werden.',
    },
    {
      question: 'Sind Überstunden und Mehrstunden dasselbe?',
      answer:
        'Nein, denn Mehrstunden betreffen einen Teilzeitangestellten, der unterhalb der normalen Vollzeitdauer bleibt, mit einer Ausgleichsregelung, die sich von jener der eigentlichen Überstunden unterscheidet.',
    },
  ],
  relatedSlugs: [
    'salaire-minimum-cct-construction-suisse',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'indemnites-kilometriques-2026-nouveau-taux',
  ],
};
