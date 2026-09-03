import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'suivre-rentabilite-chantier-sans-excel',
  question: 'Wie verfolgt man die Rentabilität einer Baustelle, ohne Excel zu benutzen?',
  title: 'Die Rentabilität einer Baustelle verfolgen, ohne Excel-Tabelle',
  description:
    'Eine Excel-Tabelle zur Baustellenverfolgung bricht zusammen, sobald sich eine Formel ändert oder ein Mitarbeitender eine Zeile vergisst. Hier eine zuverlässigere Methode, um in Echtzeit zu wissen, ob eine Baustelle rentabel ist.',
  excerpt:
    'Die Excel-Datei zur Baustellenverfolgung hält selten länger als ein paar Monate durch. Das Problem ist nicht die Disziplin des Teams: Es ist das Format selbst.',
  category: 'Chantier & rentabilité',
  keywords: ['rentabilität baustelle', 'excel baustellenverfolgung', 'offeriert vs real', 'kostenverfolgung bau', 'marge baustelle'],
  publishedAt: '2026-02-05',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Fast jedes Bauunternehmen hat irgendwann eine Excel-Datei zur Baustellenverfolgung geführt. Und fast alle haben sie schliesslich aufgegeben: nicht aus mangelnder Disziplin, sondern weil die Tabelle aus strukturellen Gründen zusammenbricht, die Disziplin allein nie löst.',
    },
    { type: 'h2', text: 'Warum es in der Praxis bricht' },
    {
      type: 'list',
      items: [
        'Eine versehentlich geänderte Formel in einer Zeile verbreitet sich unbemerkt weiter, ohne dass es jemand bemerkt, bevor die Endsumme sichtbar falsch ist',
        'Die Datei liegt auf einem Rechner oder geteilten Laufwerk: Zwei Personen, die gleichzeitig bearbeiten, überschreiben gegenseitig ihre Arbeit',
        'Stunden, Lieferantenrechnungen und Material werden nachträglich erfasst, oft erst am Ende der Baustelle (zu spät, um auf eine Überschreitung zu reagieren)',
        'Keine automatische Verknüpfung zwischen der ursprünglichen Offerte und den tatsächlichen Kosten: Alles wird manuell neu erfasst, mit dem entsprechenden Fehlerrisiko',
      ],
    },
    { type: 'h2', text: 'Was «Rentabilität» wirklich bedeutet' },
    {
      type: 'p',
      text: 'Es ist nicht nur «wie viel habe ich fakturiert». Es ist der Vergleich zwischen dem, was offeriert wurde, und dem, was die Baustelle tatsächlich gekostet hat: Arbeitsstunden zu den realen Stundenkosten, tatsächlich gekauftes Material, verrechnete Subunternehmerleistungen. Ohne diesen präzisen Abgleich kann eine Baustelle auf dem Papier rentabel erscheinen, obwohl sie dreimal so viele Stunden verschlungen hat wie geplant. Niemand entdeckt das vor dem Abschluss.',
    },
    {
      type: 'callout',
      title: 'Das nützliche Signal kommt zur Halbzeit der Baustelle, nicht am Ende',
      text: 'Eine Rentabilität, die erst beim Abschluss berechnet wird, kommt zu spät, um noch etwas zu korrigieren. Der eigentliche Nutzen liegt darin, zur Halbzeit zu sehen, dass die Stunden das Budget bereits übersteigen, sodass man anpassen kann, bevor die Marge vollständig verschwunden ist.',
    },
    { type: 'h2', text: 'Eine Methode, die auf Dauer trägt' },
    {
      type: 'list',
      items: [
        'Jede akzeptierte Offerte wird zur «Budget»-Referenz der Baustelle (geplante Stunden und Material, Verkaufspreis)',
        'Jede geleistete Arbeitsstunde und jeder Materialeinkauf werden direkt und laufend auf der Baustelle erfasst (nicht am Monatsende rekonstruiert)',
        'Die mit der Baustelle verknüpften Subunternehmer-Rechnungen addieren sich automatisch zu den realen Kosten',
        'Der Saldo (verkauft minus reale Kosten) bleibt durchgehend sichtbar, nicht nur beim Abschluss',
      ],
    },
    {
      type: 'p',
      text: 'Diese Berechnung wird genau an dem Tag zuverlässig, an dem sie keine manuelle Neuerfassung mehr erfordert. Jede Erfassung fliesst in dieselbe Baustelle ein, ohne einen Synchronisationsschritt zwischen mehreren Dateien, die sich am Ende immer entkoppeln.',
    },
    {
      type: 'cta',
      title: 'Die Rentabilität, die sich von selbst aktualisiert',
      text: 'Das Modul Rentabilität von Cantia vergleicht automatisch das Offerierte mit dem Realen, Baustelle für Baustelle, ausgehend von den Stunden und Ausgaben, die bereits an anderer Stelle in der App erfasst sind.',
      buttonLabel: 'Rentabilität pro Baustelle entdecken',
    },
  ],
  faq: [
    {
      question: 'Wie berechnet man die reale Rentabilität einer Baustelle?',
      answer:
        'Indem man den dem Kunden verkauften Betrag (akzeptierte Offerte) mit den realen Kosten der Baustelle vergleicht: geleistete Stunden zu den realen Stundenkosten des Unternehmens, tatsächlich gekauftes Material und mit der Baustelle verknüpfte Subunternehmer-Rechnungen.',
    },
    {
      question: 'Warum wird eine Excel-Baustellenverfolgung oft aufgegeben?',
      answer:
        'Weil sie auf nachträglicher manueller Erfassung beruht, anfällig für Formelfehler ist, sich schlecht in Echtzeit im Team teilen lässt und keine automatische Verknüpfung zur ursprünglichen Offerte oder zu den Rechnungen hat.',
    },
    {
      question: 'Zu welchem Zeitpunkt der Baustelle sollte man die Rentabilität verfolgen?',
      answer:
        'Idealerweise durchgehend, ab Baubeginn. Eine Verfolgung erst beim Baustellenabschluss kommt zu spät, um eine Überschreitung bei Stunden oder Materialbudget noch während der Ausführung zu korrigieren.',
    },
  ],
  relatedSlugs: [
    'bexio-vs-cantia-logiciel-batiment',
    'calculer-prix-devis-renovation-suisse',
    'calculer-heures-travail-ouvrier-minutes-decimales',
  ],
};
