import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'fixer-prix-artisan-sans-brader-concurrence-suisse',
  question: 'Wie soll ein Handwerker seine Preise festlegen, ohne sie gegenüber einer günstigeren Konkurrenz zu verramschen?',
  title: 'Preise festlegen, ohne sie zu verramschen, selbst bei günstigerer Konkurrenz',
  description:
    'Die Preise systematisch zu senken, um wettbewerbsfähig zu bleiben, schwächt das Unternehmen am Ende immer. Wie man einen vertretbaren Preis aufbaut und ihn gegenüber einem Kunden begründet, der Offerten vergleicht.',
  excerpt:
    'Ein Handwerker, der seine Preise systematisch an die günstigste vom Kunden erhaltene Offerte anpasst, arbeitet am Ende immer mehr, um weniger zu verdienen. Und das ist fast nie auf Dauer tragbar.',
  category: 'Croissance & acquisition',
  keywords: ['preise festlegen handwerker bau', 'preiskonkurrenz bauwesen schweiz', 'offerten nicht verramschen', 'preis gegenüber kunde begründen', 'preisstrategie bauunternehmen'],
  publishedAt: '2026-09-11',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Angesichts einer günstigeren Konkurrenzofferte ist die instinktive Reaktion oft, sich anzupassen, um den Kunden nicht zu verlieren. Das ist eine Strategie, die langfristig selten funktioniert, denn ein Preis, der auf einer echten Berechnung von Selbstkosten und Marge beruht, kann nicht endlos sinken, ohne am Ende – selbst ohne es sofort zu merken – mit Verlust zu arbeiten.',
    },
    { type: 'h2', text: 'Ein vertretbarer Preis geht immer von den tatsächlichen Kosten aus' },
    {
      type: 'list',
      items: [
        'Der tatsächliche Stundensatz des Teams (Lohn, Sozialabgaben, Versicherungen, unproduktive Zeit), nicht nur der ausbezahlte Nettolohn',
        'Die Materialkosten inklusive Marge für Bruch und Handling',
        'Die Fixkosten des Unternehmens (Fahrzeug, Haftpflichtversicherung, Software, Werkstatt), verteilt auf die fakturierbare Tätigkeit',
        'Eine echte Gewinnmarge, nicht nur genug, um die Kosten zu decken',
      ],
    },
    {
      type: 'stat',
      value: '10-15 %',
      label: 'nettogewinnmarge, die ein gesundes Bauunternehmen nach Deckung aller tatsächlichen Kosten in der Regel anstrebt',
    },
    { type: 'h2', text: 'Einen Preis begründen statt ihn zu verteidigen' },
    {
      type: 'p',
      text: 'Gegenüber einem vergleichenden Kunden funktioniert es besser, konkret zu erklären, was der Preis abdeckt (Qualität der gewählten Materialien, Garantie, Versicherung, Ausführungsfrist), als den Preis nur zu verteidigen. Ein Kunde, der versteht, warum ein Preis so ist, akzeptiert es oft, für die Sicherheit mehr zu bezahlen, insbesondere bei einer grösseren Baustelle wie einer Renovation.',
    },
    {
      type: 'callout',
      title: 'Eine günstigere Offerte verbirgt manchmal fehlende Positionen',
      text: 'Es ist hilfreich, ohne einen Berufskollegen schlechtzumachen, dem Kunden zu helfen, zu vergleichen, was jede Offerte tatsächlich abdeckt (Entsorgung, Garantie, Versicherung), statt nur die Endsumme zu betrachten, die oft irreführend ist, wenn die verglichenen Leistungen nicht gleichwertig sind.',
    },
    {
      type: 'cta',
      title: 'Die eigenen Selbstkosten kennen, bevor man einen Preis festlegt',
      text: 'Cantia berechnet die tatsächliche Rentabilität jeder Baustelle (offeriert vs. real), um Preise festzulegen, die die Kosten des Unternehmens wirklich decken – nicht nur das, was auf den ersten Blick vernünftig erscheint.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Sollte man sich an die günstigste Offerte eines Konkurrenten anpassen?',
      answer:
        'In der Regel nicht. Ein Preis, der auf einer echten Berechnung von Selbstkosten und Marge beruht, kann sich nicht endlos an ein günstigeres Angebot anpassen, ohne am Ende mit Verlust zu arbeiten.',
    },
    {
      question: 'Wie begründet man einen höheren Preis als eine Konkurrenzofferte?',
      answer:
        'Indem man konkret erklärt, was der Preis abdeckt (Materialqualität, Garantie, Versicherung, Frist), statt die Summe einfach ohne Kontext zu verteidigen.',
    },
    {
      question: 'Welche Gewinnmarge sollte ein Bauunternehmen anstreben?',
      answer:
        'In der Regel zwischen 10 und 15 % netto nach Deckung aller tatsächlichen Kosten (Arbeitskraft, Material, Fixkosten): Ein Preis, der keine Marge generiert, ist auf Dauer nicht tragbar.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-de-revient-chantier-batiment',
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'calculer-prix-horaire-reel-ouvrier-batiment',
  ],
};
