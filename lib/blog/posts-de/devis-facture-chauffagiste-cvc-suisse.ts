import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-chauffagiste-cvc-suisse',
  question: 'Wie sollte ein HLK-Installateur eine Heizungssanierung angesichts kantonaler Förderbeiträge kalkulieren?',
  title: 'HLK-Installateur: Heizungsersatz zwischen Preis, Lieferfrist und Förderbeitrag kalkulieren',
  description:
    'Der Ersatz einer Öl- oder Gasheizung durch eine Wärmepumpe erfordert eine technische Offerte, oft eine lange Lieferfrist und häufig einen kantonalen Förderbeitrag. So bringen Sie alles unter einen Hut, ohne den Kunden zu blockieren.',
  excerpt:
    'Eine Offerte für den Heizungsersatz ist fast nie ein einfacher Materialaustausch: Es ist ein technisches Projekt, eine Lieferfrist, die man vorausplanen muss, und oft ein Fördergesuch, das mit allem zusammenpassen muss.',
  category: 'Métiers du bâtiment',
  keywords: ['Offerte Heizungsinstallateur', 'Verrechnung HLK Installateur Schweiz', 'Heizungsersatz Preis', 'Wärmepumpe Offerte Förderung', 'Lieferfrist Heizung Offerte'],
  publishedAt: '2026-09-14',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Der Ersatz einer Öl- oder Gasheizung durch eine Wärmepumpe ist keine reine Frage der Ausrüstung. Oft geht es auch um die Anpassung des bestehenden Netzes, eine Lieferfrist, die in der Hochsaison mehrere Wochen überschreiten kann, und für viele Kunden um ein kantonales Fördergesuch, von dem ihre Entscheidung zur Unterzeichnung abhängt.',
    },
    { type: 'h2', text: 'Was eine Offerte für den Heizungsersatz abdecken muss' },
    {
      type: 'list',
      items: [
        'Demontage und Entsorgung der alten Anlage, inklusive gegebenenfalls des Öltanks',
        'Anpassung des bestehenden Netzes (Radiatoren, Regelung), oft nötig beim Wechsel zu einer Wärmepumpe',
        'Lieferung und Montage der neuen Anlage, mit klar angegebener Lieferfrist',
        'Inbetriebnahme, Einstellungen und Übergabe einer vollständigen technischen Dokumentation an den Kunden',
      ],
    },
    {
      type: 'stat',
      value: '6-12 Wo.',
      label: 'übliche Lieferfrist für eine Wärmepumpe bei starker Nachfrage, dem Kunden bereits in der Offerte explizit mitzuteilen',
    },
    { type: 'h2', text: 'Die Offerte ist meist Voraussetzung für die Förderung, nicht umgekehrt' },
    {
      type: 'p',
      text: 'Die meisten kantonalen Programme verlangen eine detaillierte Offerte vor jeglicher Bauverpflichtung, um ein Fördergesuch zu bewilligen: Ein Baustart vor der Zusage kann den Anspruch auf die Förderung streichen. Die Offerte muss deshalb präzise und datiert genug sein, um direkt als Belegdokument zu dienen, ohne dass der Kunde für sein Dossier eine weitere anfordern muss.',
    },
    {
      type: 'callout',
      title: 'Eine schlecht kommunizierte Lieferfrist kostet mehr als ein falsch kalkulierter Preis',
      text: 'Ein Kunde, der mitten im Winter ohne funktionierende Heizung von einer mehrmonatigen Lieferfrist erfährt, hat wenig Verständnis für technische Feinheiten. Die reale Frist bereits in der Offerte zu kommunizieren, vermeidet diese Art vermeidbarer Konflikte.',
    },
    {
      type: 'cta',
      title: 'Präzise Offerten, bereit als Beleg für ein Fördergesuch',
      text: 'Cantia erstellt detaillierte, datierte Offerten mit allen Mengen und Leistungen, die für ein kantonales Fördergesuch nötig sind, ohne zusätzliches Dokument.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Muss man den Förderentscheid abwarten, bevor man mit den Heizungsarbeiten beginnt?',
      answer:
        'In der Regel ja: Die meisten kantonalen Programme verlangen, dass die Offerte eingereicht und die Förderung bewilligt ist, bevor die Arbeiten beginnen, sonst droht der Verlust des Förderanspruchs.',
    },
    {
      question: 'Wie kommuniziert man dem Kunden eine lange Lieferfrist für eine Wärmepumpe?',
      answer:
        'Indem man sie explizit und schriftlich bereits in der Offerte angibt, besonders in der Hochsaison, wo Fristen zwei bis drei Monate überschreiten können, was jedes Missverständnis nach Unterzeichnung vermeidet.',
    },
    {
      question: 'Muss die Heizungsofferte die Anpassung des bestehenden Netzes enthalten?',
      answer:
        'Das wird empfohlen, insbesondere beim Wechsel zu einer Wärmepumpe, da bestehende Radiatoren und Regelung nicht immer ohne Anpassung kompatibel sind.',
    },
  ],
  relatedSlugs: [
    'devis-facture-facadier-isolation-suisse',
    'permis-construire-renovation-quand-necessaire',
    'validite-devis-signe-prix-qui-bouge',
  ],
};
