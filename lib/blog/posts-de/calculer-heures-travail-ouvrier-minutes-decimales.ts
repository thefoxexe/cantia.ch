import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-heures-travail-ouvrier-minutes-decimales',
  question: 'Wie berechnet man Arbeitsstunden wie "4h45" richtig, ohne sich bei der Dezimalzahl zu vertun?',
  title: 'Arbeitsstunden berechnen: Warum 4h45 nicht 4,45 ist',
  description:
    'Ein Arbeiter, der von 8 bis 12.45 Uhr gearbeitet hat, hat 4h45 geleistet, und nicht 4,45 Dezimalstunden (was 4h27 entsprechen würde). Warum diese Verwechslung auf der Lohnabrechnung teuer wird.',
  excerpt:
    '4h45 Arbeit sind nicht 4,45 Stunden. Es ist der häufigste HR-Erfassungsfehler im Bauwesen: wohl derjenige, der die meisten Lohnabrechnungen verfälscht, ohne dass es jemand bemerkt.',
  category: 'RH & salaires',
  keywords: ['arbeitsstunden berechnen', 'stundenerfassung bauwesen', 'stundenlohn berechnen', 'hr baugewerbe', 'lohnabrechnung fehler'],
  publishedAt: '2026-02-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Arbeiter beginnt um 8.00 Uhr, endet um 12.45 Uhr. Wie viele Stunden hat er gearbeitet? «4h45» ist die richtige, intuitive Antwort. Das Problem beginnt, sobald man sie in eine Tabelle oder eine Lohnsoftware eintippen muss: 4h45 ist in Dezimalschreibweise nicht 4,45, und diese Verwechslung erzeugt falsche Lohnabrechnungen, ohne dass irgendein Alarmsignal ausgelöst wird.',
    },
    { type: 'h2', text: 'Die Falle des Trennzeichens' },
    {
      type: 'p',
      text: '45 Minuten entsprechen 45/60 einer Stunde, also 0,75 Dezimalstunden. 4h45 Arbeit entsprechen somit 4,75 Dezimalstunden, nicht 4,45. Der Fehler entsteht durch eine sehr natürliche Verwechslung: Man schreibt «4.45» in Gedanken an die auf einer Uhr angezeigten Minuten, ohne mental in Hundertstelstunden umzurechnen.',
    },
    {
      type: 'table',
      headers: ['Was man schreibt (Minuten)', 'Was das bedeutet', 'Korrektes Dezimaläquivalent'],
      rows: [
        ['4.15', '4h15', '4.25'],
        ['4.30', '4h30', '4.50'],
        ['4.45', '4h45', '4.75'],
        ['7.50', '7h50', '7.83'],
      ],
    },
    {
      type: 'callout',
      title: 'Warum das wirklich Geld kostet',
      text: 'Auf einer monatlichen Lohnabrechnung mit Dutzenden von Einträgen lässt eine misslungene Umrechnung pro Zeile die Gesamtsumme um mehrere Stunden abweichen, ohne dass ein einzelner Fehler auffällt. Der ausgezahlte Lohn ist am Ende falsch (zu hoch oder zu niedrig), und niemand weiss, warum die Zahlen nicht mehr stimmen.',
    },
    { type: 'h2', text: 'Zwei zuverlässige Wege, eine Dauer zu notieren' },
    {
      type: 'list',
      items: [
        'Immer in expliziten Stunden und Minuten notieren: «4h45», nie eine zweideutige Zahl allein',
        'Falls ein Dezimalfeld wirklich nötig ist, die Minuten systematisch in Sechzigstel umrechnen, bevor man die Zahl eintippt (45 Min. = 0,75, niemals 0,45)',
        'Am zuverlässigsten bleibt es, die Start- und Endzeit einzugeben («8.00 Uhr» bis «12.45 Uhr») und die Summe automatisch berechnen zu lassen, was den menschlichen Fehler vollständig eliminiert',
      ],
    },
    { type: 'h2', text: 'Was das für ein HR-Tool im Bauwesen bedeutet' },
    {
      type: 'p',
      text: 'Ein gutes Tool zur Stundenerfassung muss so akzeptieren, wie Menschen eine Dauer natürlich schreiben («4.45» um 4h45 zu sagen), statt eine reine Dezimaleingabe zu erzwingen, die keiner realen Gewohnheit auf der Baustelle entspricht. Es ist ein winziges Ergonomiedetail, das Monat für Monat Dutzende kleiner Lohnfehler verhindert.',
    },
    {
      type: 'cta',
      title: 'Die Stunden werden so erfasst, wie man sie denkt',
      text: 'Im Modul HR & Löhne von Cantia wird «4.45» im Feld Stunden als 4h45 verstanden (nie als Dezimalbruch), genau wie die Felder für Tagesbeginn und -ende.',
      buttonLabel: 'HR & Löhne entdecken',
    },
  ],
  faq: [
    {
      question: 'Wie rechnet man 4h45 Arbeit in Dezimalstunden um?',
      answer:
        '45 Minuten entsprechen 45/60 = 0,75 Stunden. 4h45 Arbeit entsprechen somit 4,75 Dezimalstunden, und nicht 4,45, was in Wirklichkeit 4h27 entsprechen würde.',
    },
    {
      question: 'Warum entstehen so viele Lohnfehler bei der Stundenerfassung?',
      answer:
        'Weil die natürliche Art, eine Dauer zu schreiben ("4h45", eingetippt als "4.45"), optisch wie eine Dezimalzahl aussieht, während die Ziffern nach dem Trennzeichen Minuten (Basis 60) und keine Hundertstel (Basis 100) darstellen.',
    },
    {
      question: 'Was ist die sicherste Methode, um Baustellenstunden zu notieren?',
      answer:
        'Direkt die Start- und Endzeit eingeben statt eine von Hand berechnete Gesamtdauer: Die Summe wird dann automatisch berechnet, ohne Verwechslungsrisiko zwischen Minuten und Dezimalzahlen.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
