import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'temps-repondre-soumission-rentable',
  question: 'Wie viel Zeit soll man in eine Submission stecken, und wann sagt man nein?',
  title: 'Was eine Submission Ihr Unternehmen kostet, und wann Sie besser nicht offerieren',
  description:
    'Kalkulationsstunden, Erfolgsquote, echte Kosten eines gewonnenen Auftrags: eine einfache Rechnung, um zu entscheiden, auf welche Leistungsverzeichnisse Sie antworten und wie Sie dabei Zeit sparen.',
  excerpt:
    'Wenn Sie eine von fünf Submissionen gewinnen und jede einen Abend kostet, hat Sie jeder gewonnene Auftrag fünf Abende gekostet. Die Rechnung lohnt sich.',
  category: 'Croissance & acquisition',
  keywords: ['Zeit Kalkulation Submission', 'Erfolgsquote Offerten', 'Submission rentabel', 'Kosten einer Offerte Bau'],
  publishedAt: '2026-10-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Auf eine Submission zu antworten ist unbezahlte Arbeit: Unterlagen lesen, manchmal den Ort besichtigen, kalkulieren, kontrollieren, einreichen. Man macht es, weil man Baustellen braucht. Aber nur wenige Unternehmen rechnen aus, was sie ein gewonnener Auftrag wirklich kostet.',
    },
    { type: 'h2', text: 'Die Rechnung' },
    {
      type: 'table',
      headers: ['Grösse', 'Beispiel'],
      rows: [
        ['Stunden pro Leistungsverzeichnis (Lesen, Kalkulation, Kontrolle)', '6 h'],
        ['Stundensatz der kalkulierenden Person', 'CHF 90.–'],
        ['Kosten pro Leistungsverzeichnis', 'CHF 540.–'],
        ['Erfolgsquote', '1 von 5'],
        ['Kalkulationskosten pro gewonnenem Auftrag', 'CHF 2’700.–'],
      ],
    },
    {
      type: 'p',
      text: 'Diese CHF 2’700.– müssen durch die Marge der gewonnenen Baustelle gedeckt werden. Bei einem kleinen Auftrag können sie sie ganz aufzehren.',
    },
    { type: 'h2', text: 'Wann Sie nicht antworten sollten' },
    {
      type: 'list',
      items: [
        'Die Baustelle übersteigt Ihre Kapazität zu den vorgesehenen Terminen: Sie können die Frist nicht einhalten.',
        'Die besonderen Bestimmungen (Konventionalstrafen, Garantien, Zahlungsfristen) sind für Ihre Liquidität nicht tragbar.',
        'Sie haben keine realistische Chance: zu weit weg, falsches Gewerk, Bauherrschaft, die immer denselben wählt.',
        'Die Unterlagen kommen zu spät, um seriös kalkuliert zu werden: Ein hingeschludertes Angebot ist schlimmer als keines.',
      ],
    },
    {
      type: 'callout',
      title: 'Höflich absagen hält die Tür offen',
      text: 'Eine kurze Nachricht an den Architekten («in diesem Zeitraum keine Kapazität, berücksichtigen Sie uns gern beim nächsten Mal») ist besser als Schweigen oder ein absichtlich teures Angebot.',
    },
    { type: 'h2', text: 'Die Zeit pro Leistungsverzeichnis senken' },
    {
      type: 'list',
      items: [
        'Einen Preiskatalog nach Positionsnummer führen und nach jeder Baustelle aktualisieren.',
        'Positionen nicht mehr abtippen: vom erhaltenen Dokument ausgehen.',
        'Beträge, Überträge und Totale berechnen lassen, statt sie von Hand nachzuprüfen.',
        'Eine Vorlage für das Begleitschreiben und die Liste der üblichen Beilagen bereithalten.',
      ],
    },
    {
      type: 'p',
      text: 'Das ist das Prinzip der Funktion «Leistungsverzeichnis ausfüllen» von Cantia, in der Beta: Das erhaltene PDF wird importiert, Ihre Preise werden vorgeschlagen, Sie passen an, und das Original-PDF kommt ausgefüllt zurück. 1 zum Testen im Plan Basis, 3 pro Monat im Plan Team, unbegrenzt im Plan Entreprise.',
    },
    {
      type: 'cta',
      title: 'Weniger Zeit für Ihre Leistungsverzeichnisse',
      text: 'Erhaltenes PDF importieren, über die Tastatur kalkulieren, ausgefülltes Dokument zurücksenden.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Was ist eine gute Erfolgsquote bei Submissionen?',
      answer: 'Sie hängt von Gewerk, Region und Art des Auftrags ab. Wichtig ist, die eigene Quote zu kennen und über die Zeit zu verfolgen, um zu wissen, wo Sie gewinnen.',
    },
    {
      question: 'Kann man die Kalkulation einer Submission in Rechnung stellen?',
      answer: 'In der Regel nicht, die Antwort auf eine Submission ist kostenlos. Eine zusätzlich verlangte Studie oder Planung kann Gegenstand einer separaten Vereinbarung sein, die vorher zu treffen ist.',
    },
    {
      question: 'Wie erfährt man, warum man eine Submission verloren hat?',
      answer: 'Fragen Sie nach dem Ergebnis und wenn möglich nach Ihrem Rang. Bei einem öffentlichen Auftrag wird der Zuschlag eröffnet und kann begründet werden; bei einem privaten genügt oft ein Anruf beim Architekten.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'calculer-prix-unitaire-soumission', 'chantier-complet-peut-etre-en-perte-taux-horaire'],
};
