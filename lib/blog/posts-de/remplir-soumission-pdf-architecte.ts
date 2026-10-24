import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'remplir-soumission-pdf-architecte',
  question: 'Wie füllt man ein Leistungsverzeichnis im PDF vom Architekten aus, ohne alles abzutippen?',
  title: 'Ein Leistungsverzeichnis im PDF vom Architekten ausfüllen, ohne alles abzutippen',
  description:
    'Der Architekt schickt ein PDF mit 40 Seiten und erwartet Ihre Preise darin. Eine Methode, um schnell zu kalkulieren, Übertragsfehler zu vermeiden und das verlangte Dokument zurückzugeben.',
  excerpt:
    'Ausdrucken, Preise von Hand eintragen, mit dem Taschenrechner nachrechnen, einscannen: Viele Betriebe füllen ihre Leistungsverzeichnisse noch wie vor zwanzig Jahren aus. Es geht einfacher.',
  category: 'Devis & facturation',
  keywords: ['Leistungsverzeichnis ausfüllen', 'LV PDF ausfüllen', 'Submission Architekt', 'Offerte kalkulieren Bau Schweiz', 'Einheitspreis LV'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Freitag, 16 Uhr: Der Architekt schickt das Leistungsverzeichnis für die Baumeisterarbeiten, 38 Seiten im PDF, Eingabe in zehn Tagen. Sie wissen schon, wie das endet: ein Abend mit Ausdrucken, Preisen von Hand, Mengen mal Preis mit dem Taschenrechner, Seitentotalen, die Sie von Seite zu Seite übertragen, und am Schluss Einscannen. Und die Angst vor einem Übertragsfehler auf Seite 22.',
    },
    { type: 'h2', text: 'Was der Architekt wirklich erwartet' },
    {
      type: 'p',
      text: 'Ein Leistungsverzeichnis ist keine freie Offerte. Die Bauherrschaft will mehrere Unternehmen auf derselben Grundlage vergleichen: gleiche Positionen, gleiche Mengen, gleiche Reihenfolge. Ihre Aufgabe ist es, bei jeder Position den Einheitspreis einzusetzen, die Beträge zu berechnen und das Dokument in seiner ursprünglichen Form zurückzugeben. Wer das Angebot in die eigene Offertvorlage umschreibt, erschwert den Vergleich und riskiert bei einem öffentlichen Auftrag den Ausschluss.',
    },
    {
      type: 'list',
      items: [
        'Die Mengen sind die des Dokuments: Sie ändern sie nicht, ausser eine Position verlangt ausdrücklich eine Mengenangabe.',
        'Jede Position erhält einen Einheitspreis und einen Betrag (Menge × Preis).',
        'Die Seitentotale werden auf die nächste Seite übertragen und danach pro Kapitel zusammengefasst.',
        'Die Zusammenstellung am Schluss wendet Rabatt, Skonto und MWST in der vom Dokument vorgesehenen Reihenfolge an.',
        'Das Dokument wird datiert, unterschrieben und fristgerecht mit den verlangten Beilagen eingereicht.',
      ],
    },
    { type: 'h2', text: 'Die drei Methoden und ihre Grenzen' },
    {
      type: 'table',
      headers: ['Methode', 'Was gut funktioniert', 'Wo es hakt'],
      rows: [
        ['Papier und Kugelschreiber', 'Kein Werkzeug zu lernen', 'Rechnen und Übertragen von Hand, beim Scan schwer lesbar, Preise nicht wiederverwendbar'],
        ['In Excel abtippen', 'Die Berechnungen stimmen', 'Stundenlange Eingabe, Gefahr, eine Position zu überspringen, das Original-PDF bleibt leer'],
        ['PDF in ein Werkzeug importieren', 'Positionen übernommen, nur noch Preise eingeben, Original-PDF ausgefüllt', 'Eine Kontrolle bleibt nötig, vor allem bei Scans'],
      ],
    },
    { type: 'h2', text: 'Eine Methode in drei Schritten' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Das Leistungsverzeichnis vor dem Kalkulieren ganz lesen: besondere Bestimmungen, Fristen, auszufüllende Positionen, zugelassene Varianten.',
        'Position für Position kalkulieren, ausgehend von Ihren üblichen Preisen (Katalog, frühere Leistungsverzeichnisse), und an die Baustelle anpassen.',
        'Die Zusammenstellung prüfen: Anzahl ausgefüllter Positionen, Seitenüberträge, Rabatt, Skonto, MWST, Total. Dann das ausgefüllte Originaldokument einreichen.',
      ],
    },
    {
      type: 'callout',
      title: 'Die häufigste Falle',
      text: 'Eine Position ohne Preis. Beim Angebotsvergleich gilt sie entweder als gratis inbegriffen oder macht das Angebot unvollständig. Zählen Sie vor dem Versand die Positionen ohne Preis: Es müssen null sein, oder es gibt für jede eine schriftliche Erklärung.',
    },
    { type: 'h2', text: 'Was Cantia macht (Beta)' },
    {
      type: 'p',
      text: 'In Cantia importieren Sie das Leistungsverzeichnis als PDF, so wie Sie es erhalten haben, nach NPK oder nicht, auch gescannt. Kapitel, Positionen, Einheiten und Mengen werden übernommen; eine Prüfansicht zeigt Ihnen, was gelesen wurde. Danach geben Sie die Preise über die Tastatur ein, Ihre üblichen Preise werden vorgeschlagen, und Cantia schreibt Einheitspreise, Beträge, Überträge und Totale ins Original-PDF. Die Funktion ist in der Beta, ab dem Plan Team (3 Leistungsverzeichnisse pro Monat) und unbegrenzt im Plan Entreprise.',
    },
    {
      type: 'cta',
      title: 'Füllen Sie Ihr nächstes Leistungsverzeichnis mit Ihren Preisen aus',
      text: 'Erhaltenes PDF importieren, Preise einsetzen, ausgefülltes Originaldokument zurücksenden. 14 Tage Testphase, unverbindlich.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Darf man die Mengen eines Leistungsverzeichnisses ändern?',
      answer:
        'Grundsätzlich nicht: Die Mengen dienen dem Vergleich der Angebote. Wenn Ihnen eine Menge falsch erscheint, melden Sie es dem Architekten schriftlich oder fügen Sie eine Bemerkung hinzu, ohne die Zeile zu ändern. Einige Positionen verlangen hingegen eine Mengenangabe: Diese füllen Sie aus.',
    },
    {
      question: 'Muss das Leistungsverzeichnis im Originalformat zurückgegeben werden?',
      answer:
        'Meistens ja, das verlangen Architekt oder Vergabestelle. Eine separate Tabelle oder eine Offerte im eigenen Format erschwert den Vergleich und kann ein Angebot bei einem öffentlichen Auftrag nicht konform machen.',
    },
    {
      question: 'Erstellt Cantia leere Leistungsverzeichnisse?',
      answer: 'Nein. Die Funktion dient dazu, auf erhaltene Leistungsverzeichnisse zu antworten: PDF importieren, Preise einsetzen, ausgefülltes PDF zurückerhalten.',
    },
  ],
  relatedSlugs: ['repondre-appel-offres-public-batiment-etapes', 'erreurs-soumission-qui-coutent-le-marche', 'calculer-prix-unitaire-soumission'],
  relatedTradeSlug: 'macon',
};
