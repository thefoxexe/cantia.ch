import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-remplir-soumission-excel-papier',
  question: 'Papier, Excel oder Software: Wie füllt man Leistungsverzeichnisse aus?',
  title: 'Papier, Excel oder Software: Leistungsverzeichnisse richtig ausfüllen im Jahr 2026',
  description:
    'Konkreter Vergleich der drei Arten, in einem Schweizer Bau-KMU auf Leistungsverzeichnisse zu antworten: Zeitaufwand, Fehlerrisiko, Wiederverwendung der Preise und eingereichtes Dokument.',
  excerpt:
    'Grosse Unternehmen haben Kalkulationsprogramme für mehrere tausend Franken. Kleine füllen von Hand aus. Jetzt gibt es einen Mittelweg.',
  category: 'Comparatifs & outils',
  keywords: ['Software Leistungsverzeichnis', 'LV in Excel ausfüllen', 'Offertsoftware Bau Schweiz', 'LV PDF', 'Kalkulationswerkzeug Submission'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'In einem Bau-KMU kommen Leistungsverzeichnisse per E-Mail als PDF, zu jeder Jahreszeit. Je nach Grösse des Unternehmens füllt man sie von Hand, in Excel oder in einer spezialisierten Kalkulationssoftware aus. Jede Methode hat ihre Logik; so vergleichen Sie sie ehrlich.',
    },
    { type: 'h2', text: 'Der Vergleich' },
    {
      type: 'table',
      headers: ['', 'Papier', 'Excel', 'Kalkulationssoftware', 'PDF-Import (Cantia, Beta)'],
      rows: [
        ['Erfassen der Positionen', 'Keines', 'Alles abtippen', 'Import strukturierter Dateien', 'Aus dem erhaltenen PDF übernommen'],
        ['Berechnungen und Überträge', 'Von Hand', 'Automatisch', 'Automatisch', 'Automatisch'],
        ['Wiederverwendung der Preise', 'Gedächtnis', 'Kopieren und Einfügen', 'Preisbibliothek', 'Katalog und Historie vorgeschlagen'],
        ['Eingereichtes Dokument', 'Gescanntes PDF', 'Separate Tabelle oder Abschrift', 'Exportiertes Formular', 'Ausgefülltes Original-PDF'],
        ['Kosten und Einarbeitung', 'Keine', 'Gering', 'Hoch, Schulung', '1 zum Testen mit Basis, dann ab Team'],
      ],
    },
    { type: 'h2', text: 'Wann Papier genügt' },
    {
      type: 'p',
      text: 'Für ein zweiseitiges Leistungsverzeichnis pro Jahr ist Papier vertretbar. Sobald die Dokumente mehr als etwa zehn Seiten haben oder Sie jeden Monat antworten, werden Rechenzeit und das Risiko von Übertragsfehlern teuer.',
    },
    { type: 'h2', text: 'Die Grenzen von Excel' },
    {
      type: 'p',
      text: 'Excel rechnet richtig, aber zuerst muss jede Position abgetippt werden, mit dem Risiko, eine zu überspringen oder die Einheit zu verwechseln. Und am Ende erwartet der Architekt oft sein eigenes ausgefülltes Dokument, nicht Ihre Tabelle.',
    },
    { type: 'h2', text: 'Kalkulationsprogramme' },
    {
      type: 'p',
      text: 'Die spezialisierten Programme auf dem Schweizer Markt verarbeiten strukturierte Leistungsverzeichnis-Dateien und vollständige Preisbibliotheken. Sie sind leistungsfähig, aber oft für Unternehmen gedacht, die eine eigene Person für die Kalkulation haben, mit den entsprechenden Kosten und der nötigen Schulung.',
    },
    { type: 'h2', text: 'Der Mittelweg: vom erhaltenen PDF ausgehen' },
    {
      type: 'p',
      text: 'Die Funktion «Leistungsverzeichnis ausfüllen» von Cantia, in der Beta, geht von dem Dokument aus, das Sie tatsächlich erhalten: dem PDF. Positionen, Einheiten und Mengen werden übernommen, auch aus einem Scan, mit einer Prüfansicht. Sie geben Ihre Preise über die Tastatur ein, Ihre üblichen Preise werden vorgeschlagen, und das Original-PDF kommt mit Einheitspreisen, Beträgen, Überträgen und Totalen ausgefüllt zurück. 1 zum Testen im Plan Basis, 3 pro Monat im Plan Team, unbegrenzt im Plan Entreprise.',
    },
    {
      type: 'callout',
      title: 'Was die Funktion nicht macht',
      text: 'Sie verfasst keine leeren Leistungsverzeichnisse und ersetzt keine vollständige Kalkulationssoftware für ein grosses Unternehmen. Sie dient dazu, schnell und sauber auf die Leistungsverzeichnisse zu antworten, die Sie erhalten.',
    },
    {
      type: 'cta',
      title: 'Testen Sie es mit Ihrem nächsten Leistungsverzeichnis',
      text: '14 Tage Testphase, unverbindlich: Importieren Sie das erhaltene PDF und sehen Sie das Ergebnis.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Braucht man in der Schweiz eine spezielle Software, um auf Leistungsverzeichnisse zu antworten?',
      answer: 'Nein. Viele kleine Unternehmen füllen sie von Hand oder in Excel aus. Ein Werkzeug spart vor allem Zeit und beseitigt Rechen- und Übertragsfehler.',
    },
    {
      question: 'Liest Cantia CRBX- oder SIA-451-Dateien?',
      answer: 'Noch nicht: Der Import betrifft heute Leistungsverzeichnisse als PDF, mit oder ohne NPK. Das ist das Format, das die meisten kleinen Unternehmen erhalten.',
    },
    {
      question: 'Wie viele Leistungsverzeichnisse kann man mit Cantia ausfüllen?',
      answer: 'Eines zum Testen im Plan Basis, 3 pro Monat im Plan Team, unbegrenzt im Plan Entreprise.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'bexio-vs-cantia-logiciel-batiment', 'temps-repondre-soumission-rentable'],
};
