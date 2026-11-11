import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cantia-vs-klara',
  question: 'Cantia oder Klara: Welche Software für ein Schweizer Bauunternehmen?',
  title: 'Cantia vs. Klara: Welche Software für ein Schweizer Bauunternehmen',
  description:
    'Klara ist eine solide Schweizer Lösung für Buchhaltung und Fakturierung von Selbständigen und kleinen Unternehmen. Cantia ist speziell für die Baustelle gemacht. Ein ehrlicher Vergleich der beiden Ansätze.',
  excerpt:
    'Klara ist ein gutes Buchhaltungstool für ein beliebiges Schweizer Kleinunternehmen. Die Frage für ein Bauunternehmen ist, ob «beliebig» reicht.',
  category: 'Comparatifs & outils',
  keywords: ['Klara', 'Klara Alternative Bau', 'Klara vs Cantia', 'Bausoftware Schweiz'],
  publishedAt: '2026-09-22',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Klara hat sich unter den Schweizer Tools für Buchhaltung und Fakturierung von Selbständigen und kleinen Unternehmen einen festen Platz geschaffen, branchenübergreifend. Es ist ein generalistisches Werkzeug, das viele Berufe abdecken soll statt eines bestimmten. Die Frage im Bau lautet, was diese generalistische Ausrichtung im Baustellenalltag auslässt.',
    },
    { type: 'h2', text: 'Was Klara gut macht' },
    {
      type: 'p',
      text: 'Konforme Fakturierung, Zahlungsüberwachung, einige administrative Automatisierungen und eine bewusst einfache Oberfläche: Klara bleibt eine vernünftige Wahl für einen kleinen Betrieb, dessen Kerntätigkeit nicht die tägliche Steuerung einer Baustelle ist.',
    },
    { type: 'h2', text: 'Was für die Arbeit auf der Baustelle fehlt' },
    {
      type: 'p',
      text: 'Klara wurde nicht speziell für den Bau entwickelt: keine Rentabilität pro Baustelle, kein Preiskatalog für die Baugewerbe, keine Offerte direkt vor Ort mit Fotos, keine Teamplanung, die an die laufenden Baustellen gebunden ist. Das sind keine Mängel von Klara an sich, sondern Bedürfnisse ausserhalb seines Umfangs.',
    },
    {
      type: 'callout',
      title: 'Ein gutes Generalisten-Tool bleibt ein Generalisten-Tool',
      text: 'Klara macht gut, wofür es gebaut wurde: Buchhaltung und Fakturierung eines Schweizer Kleinunternehmens, egal aus welcher Branche. Cantia geht von der Baustelle selbst aus und baut alles andere (Offerten, Rechnungen, Personal, Planung) um diese Realität herum.',
    },
    { type: 'h2', text: 'Die Vergleichstabelle' },
    {
      type: 'table',
      headers: ['Kriterium', 'Klara', 'Cantia'],
      rows: [
        ['Schweizer Fakturierung (QR-Rechnung)', 'Ja', 'Ja'],
        ['Preiskatalog für die Baugewerbe', 'Nein', 'Ja'],
        ['Offerte vor Ort, direkt auf der Baustelle', 'Nein', 'Ja'],
        ['Rentabilität pro Baustelle', 'Nein', 'Ja'],
        ['Baustellenrapport mit Fotos', 'Nein', 'Ja'],
        ['Teamplanung pro Baustelle', 'Nein', 'Ja'],
        ['Schweizer Finanzbuchhaltung', 'Ja', 'Ja, automatisch aus Rechnungen, Ausgaben und Löhnen erstellt'],
      ],
    },
    {
      type: 'p',
      text: 'Das schliesst sich nicht zwingend aus: Manche Unternehmen behalten ein Buchhaltungstool für den Jahresabschluss und nutzen ein Branchentool für alles, was die Baustelle selbst betrifft, ohne dass das eine das andere ersetzt.',
    },
    {
      type: 'cta',
      title: 'Für die Baustelle gemacht, von der Offerte bis zur Zahlung',
      text: 'Cantia deckt den ganzen Ablauf einer Schweizer Baustelle ab: diktierte Offerte, konforme QR-Rechnungen, Fotorapporte, Planung und Rentabilität, ohne zu vergessen, dass die eigentliche Arbeit vor Ort passiert.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Eignet sich Klara für ein Bauunternehmen?',
      answer:
        'Klara kann für Fakturierung und Finanzbuchhaltung genügen, wurde aber nicht speziell für den Bau entwickelt: keine Rentabilität pro Baustelle, kein Branchen-Preiskatalog, kein Baustellenrapport mit Fotos.',
    },
    {
      question: 'Was ist der wichtigste Unterschied zwischen Klara und Cantia?',
      answer:
        'Klara ist ein generalistisches Tool für Buchhaltung und Fakturierung von Schweizer Kleinunternehmen aller Branchen. Cantia ist speziell für den Ablauf einer Baustelle gemacht, von der ersten Offerte bis zur Schlusszahlung.',
    },
    {
      question: 'Kann man Klara und Cantia zusammen nutzen?',
      answer:
        'Ja, aber heute gibt es keine direkte Verbindung zwischen beiden. Cantia führt auch eine eigene doppelte Buchhaltung, automatisch aus Rechnungen, Ausgaben und Löhnen erstellt, mit MWST-Abrechnung: Viele Unternehmen brauchen deshalb nur ein einziges Tool.',
    },
  ],
  relatedSlugs: ['bexio-vs-cantia-logiciel-batiment', 'cantia-vs-winbiz', 'meilleur-logiciel-devis-facture-batiment-suisse-2026'],
};
