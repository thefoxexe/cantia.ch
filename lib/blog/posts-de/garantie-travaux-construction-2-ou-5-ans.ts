import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'garantie-travaux-construction-2-ou-5-ans',
  question: 'Garantie auf Bauarbeiten in der Schweiz: 2 Jahre oder 5 Jahre?',
  title: 'Garantie auf Bauarbeiten in der Schweiz: 2 Jahre, 5 Jahre oder 10',
  description:
    'Die gesetzliche Garantie für ein unbewegliches Werk beträgt 5 Jahre, nicht 2. Und eine 2026 in Kraft getretene Rechtsänderung verkürzt die Frist zur Meldung eines Mangels auf 60 Tage.',
  excerpt:
    'Viele Handwerker nennen reflexartig «2 Jahre» Garantie. Für alles, was fest mit dem Bauwerk verbunden ist, sagt das Schweizer Recht 5 Jahre, und eine neue 60-Tage-Frist hat die Lage 2026 gerade eben verändert.',
  category: 'Juridique & normes',
  keywords: ['garantie bauwerk', 'verjährungsfrist', 'art 371 or', 'mängelrüge', 'versteckter mangel'],
  publishedAt: '2026-03-05',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: '«Zwei Jahre Garantie» ist die Zahl, die im Baugewerbe jeder wiederholt. Das ist jedoch falsch für den Grossteil dessen, was ein am Boden befestigtes Werk betrifft. Art. 371 Abs. 2 des Obligationenrechts (OR) setzt die Frist bei fünf Jahren für ein unbewegliches Werk fest, nicht zwei.',
    },
    { type: 'h2', text: 'Drei Fristen, nicht nur eine' },
    {
      type: 'table',
      headers: ['Art des Werks', 'Garantiefrist', 'Rechtsgrundlage'],
      rows: [
        ['Bewegliches Objekt (nicht am Gebäude befestigt)', '2 Jahre', 'Art. 371 Abs. 1 OR (Verweis auf Art. 210)'],
        ['Unbewegliches oder am Gebäude befestigtes Werk', '5 Jahre', 'Art. 371 Abs. 2 OR'],
        ['Absichtlich verschwiegener Mangel', '10 Jahre', 'Art. 371 Abs. 2 OR'],
      ],
    },
    {
      type: 'p',
      text: 'Die Trennlinie hängt an einem Wort: «befestigt». Ein eingebautes Fenster, ein gegossener Estrich, eine integrierte Elektroinstallation fallen unter die 5-Jahres-Regelung für unbewegliche Werke. Geliefertes, aber nicht in die Struktur integriertes Mobiliar bleibt unter der 2-Jahres-Regelung für bewegliche Objekte – eine Unterscheidung, die die meisten Unternehmen in ihren eigenen Offerten nie korrekt anwenden.',
    },
    {
      type: 'callout',
      title: 'Die Änderung, die man für 2026 kennen muss: 60 Tage, um einen Mangel zu melden',
      text: 'Eine 2026 in Kraft getretene Reform des Garantierechts setzt nun eine Frist von 60 Tagen fest, um dem Unternehmer einen Mangel nach dessen Entdeckung zu melden (ein präziserer Rahmen als die frühere, vagere Pflicht, ihn «sofort» zu melden). Ein Kunde, der zu lange wartet, um einen sichtbaren Mangel zu melden, riskiert nun den Verlust seines Rechts auf Nachbesserung, selbst innerhalb der 5-jährigen Verjährungsfrist.',
    },
    { type: 'h2', text: 'Was das konkret auf einer Baustelle verändert' },
    {
      type: 'list',
      items: [
        'Die Garantiefrist läuft ab der Abnahme des Werks, nicht ab dem Ende der Arbeiten oder dem Rechnungsdatum',
        'Ein vier Jahre nach der Abnahme entdeckter versteckter Mangel bleibt durch die 5 Jahre gedeckt (sofern er innerhalb von 60 Tagen nach seiner Entdeckung gemeldet wird)',
        'Ein absichtliches Verschweigen eines bekannten Mangels verlängert die Frist auf 10 Jahre – ein echtes Risiko für ein Unternehmen, das bei einem am Ende der Baustelle sichtbaren Problem «beide Augen zudrückt»',
      ],
    },
    {
      type: 'p',
      text: 'Für das Unternehmen hat das eine doppelte praktische Konsequenz: den Zustand des Werks bei der Abnahme präzise zu dokumentieren (Protokoll, datierte Fotos) schützt ebenso vor einer Jahre später unbegründet erhobenen Reklamation wie vor dem Vorwurf der Verschweigung.',
    },
    {
      type: 'cta',
      title: 'Eine Spur jeder Baustelle, Foto für Foto',
      text: 'Die Baustellenrapporte von Cantia versehen jedes Foto mit Zeitstempel und Geolokalisierung: ein präziser Nachweis des Baustellenzustands bei jeder Etappe, nützlich noch lange nach Baustellenende.',
      buttonLabel: 'Baustellenrapporte entdecken',
    },
  ],
  faq: [
    {
      question: 'Beträgt die Garantie auf Bauarbeiten in der Schweiz 2 Jahre oder 5 Jahre?',
      answer:
        '5 Jahre für jedes unbewegliche oder am Gebäude befestigte Werk (Art. 371 Abs. 2 OR). Die 2-Jahres-Frist gilt nur für bewegliche Objekte, die nicht in die Struktur integriert sind.',
    },
    {
      question: 'Ab wann läuft die 5-jährige Garantiefrist?',
      answer:
        'Ab der Abnahme des Werks durch den Kunden, nicht ab dem Rechnungsdatum oder dem tatsächlichen Ende der Arbeiten.',
    },
    {
      question: 'Welche neue Frist gilt 2026 für die Meldung eines Mangels?',
      answer:
        'Die 2026 in Kraft getretene Reform des Garantierechts setzt eine Frist von 60 Tagen für die Meldung eines Mangels an den Unternehmer nach dessen Entdeckung fest und ersetzt damit die frühere, vagere Anforderung einer «sofortigen» Meldung.',
    },
  ],
  relatedSlugs: [
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'norme-sia-118-devis-obligatoire',
    'duree-conservation-devis-factures-suisse',
  ],
};
