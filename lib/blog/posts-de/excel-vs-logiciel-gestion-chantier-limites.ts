import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'excel-vs-logiciel-gestion-chantier-limites',
  question: 'Reicht Excel, um ein Bauunternehmen zu führen, oder braucht es eine echte Software?',
  title: 'Excel für die Baustellenverwaltung: Wie weit es trägt, und wo es zusammenbricht',
  description:
    'Excel funktioniert im kleinen Massstab gut, bis der Tag kommt, an dem ein zweiter Mitarbeiter es gleichzeitig bearbeitet oder eine vergessene Offerte am Ende mehr kostet als das Tool, das sie ersetzen sollte.',
  excerpt:
    'Viele Bauunternehmen starten mit einer über Jahre zusammengebastelten Excel-Datei. Das ist am Anfang keine schlechte Wahl, aber eine Wahl, die schlecht altert, oft ohne dass man es merkt.',
  category: 'Comparatifs & outils',
  keywords: ['excel baustellenverwaltung', 'software statt excel baugewerbe', 'grenzen tabellenkalkulation bau', 'digitalisierung kmu baugewerbe', 'offerte rechnung tool'],
  publishedAt: '2026-07-19',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Excel bleibt ein enorm leistungsfähiges Werkzeug für das, was es gut kann: rechnen, sortieren, eine Formel in Sekunden anpassen. Das Problem ist nie Excel an sich. Es ist eher der Moment, in dem eine ursprünglich für einfache Zwecke gedachte Baustellen-Übersichtsdatei plötzlich Aufgaben übernehmen muss, für die sie nie konzipiert wurde.',
    },
    { type: 'h2', text: 'Wo Excel sehr gut funktioniert' },
    {
      type: 'list',
      items: [
        'Eine punktuelle Aufmass- oder Materialmengenberechnung',
        'Ein einfaches Budget für eine isolierte Baustelle',
        'Eine Kontakt- oder Lieferantenliste ohne Bedarf an gemeinsamer Echtzeit-Aktualisierung',
      ],
    },
    { type: 'h2', text: 'Wo es beim Wachstum zusammenbricht' },
    {
      type: 'list',
      items: [
        'Zwei Personen bearbeiten dieselbe Datei parallel, mit dem realen Risiko, die Arbeit des anderen ohne jede Warnung zu überschreiben',
        'Keine zuverlässige Spur, wer was wann geändert hat, was einen Streitfall mit einem Kunden schwer präzise zu dokumentieren macht',
        'Eine mündlich zugesagte, aber nie formalisierte Offerte, verloren in einem vergessenen Tabellenblatt',
        'Eine Datei, die über die Jahre wächst, langsam wird, und bei der eine einzige defekte Formel still und leise eine ganze Tabelle verfälscht',
        'Keine automatische Verknüpfung zwischen einer Offerte, der daraus entstehenden Rechnung und der tatsächlich eingegangenen Zahlung, sodass der ganze Abgleich von Hand erfolgt',
      ],
    },
    {
      type: 'callout',
      title: 'Die eigentlichen Kosten von Excel stecken nicht in der Datei, sondern in den Fehlern, die sie nicht zeigt',
      text: 'Eine Übersichtstabelle, die «aktuell aussieht», kann durchaus eine nie fakturierte Offerte oder eine nie gemahnte Rechnung verbergen: Excel meldet nie aktiv, was vergessen wurde, im Gegensatz zu einem dafür konzipierten Tool.',
    },
    {
      type: 'cta',
      title: 'Derselbe Bedarf, ohne die blinden Flecken einer Tabelle',
      text: 'Cantia verknüpft Offerten, QR-Rechnungen und Zahlungen automatisch pro Kunde und pro Baustelle – etwas, das Excel niemals von allein leistet, selbst gut organisiert.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Reicht Excel für ein kleines Bauunternehmen aus?',
      answer:
        'Für einen punktuellen Einsatz (Aufmass, isoliertes Budget) ja. Doch sobald mehrere Personen an derselben Übersicht arbeiten oder das Volumen an Offerten und Rechnungen steigt, werden die Grenzen schnell zum Problem.',
    },
    {
      question: 'Was ist das grösste Risiko von Excel bei der Baustellenverwaltung?',
      answer:
        'Das Fehlen einer zuverlässigen Änderungsspur, kombiniert mit der fehlenden automatischen Verknüpfung zwischen Offerte, Rechnung und Zahlung. Das Ergebnis: Versäumnisse werden von der Datei nie aktiv gemeldet.',
    },
    {
      question: 'Ab wann sollte man an eine echte Verwaltungssoftware denken?',
      answer:
        'Sobald mehrere Baustellen parallel laufen oder mehrere Personen gleichzeitig auf dieselben Informationen zugreifen müssen, wird eine Tabelle eher zum Reibungspunkt als zur Zeitersparnis.',
    },
  ],
  relatedSlugs: [
    'logiciel-gestion-chantier-independant-seul',
    'combien-coute-logiciel-gestion-chantier-roi',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
