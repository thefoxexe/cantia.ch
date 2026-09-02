import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-menuisier-sur-mesure-facturation-suisse',
  question: 'Wie soll ein Schreiner-Innenausbauer eine Offerte für Möbel oder Einrichtungen nach Mass kalkulieren?',
  title: 'Schreiner-Innenausbauer: Massanfertigungen kalkulieren, ohne den Faden vom Prototyp bis zur Montage zu verlieren',
  description:
    'Eine massgefertigte Einrichtung durchläuft vier Etappen: Aufmass, Planung, Fertigung in der Werkstatt und Montage vor Ort — jede verdient ihre eigene Position in der Offerte.',
  excerpt:
    'Im Gegensatz zu einer standardisierten Montage beginnt jedes Schreinerprojekt nach Mass die Planung wieder bei null. Eine Offerte, die die Zeit des Planungsbüros nicht von der Werkstattzeit trennt, endet damit, sie zum gleichen Tarif wie die Montage zu verrechnen.',
  category: 'Métiers du bâtiment',
  keywords: ['offerte schreiner massanfertigung', 'rechnung einrichtung holz', 'preis möbel nach mass schweiz', 'offerte werkstatt schreinerei', 'planung einrichtung verrechnung'],
  publishedAt: '2026-09-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine Küche oder ein Bücherregal nach Mass wird nicht wie die Montage eines Standardelements kalkuliert. Die Planungszeit (Aufmass, Pläne, Materialwahl mit dem Kunden) ist oft ebenso lang wie die Fertigung selbst. Trotzdem bleibt sie fast immer am schlechtesten bewertet, weil sie dem Kunden bei der Preispräsentation schwer konkret aufgezeigt werden kann.',
    },
    { type: 'h2', text: 'Vier Etappen, vier Positionen in der Offerte' },
    {
      type: 'list',
      items: [
        'Aufmass und Machbarkeitsstudie: separat zu verrechnen, wenn das Projekt nicht zustande kommt, oder zu integrieren, wenn die Offerte unterzeichnet wird',
        'Planung und technische Pläne: Zeit des Planungsbüros, oft unterbewertet',
        'Fertigung in der Werkstatt: der am besten planbare Posten, kalkulierbar nach Zeit oder Stück',
        'Montage und Anpassungen vor Ort: immer länger als in der Werkstatt, da man sich mit dem Bestand arrangieren muss',
      ],
    },
    {
      type: 'stat',
      value: '20–25 %',
      label: 'typischer Anteil der Gesamtzeit eines Einrichtungsprojekts nach Mass, der auf Planung und Pläne entfällt — noch vor dem ersten Holzzuschnitt',
    },
    { type: 'h2', text: 'Die Studie verrechnen, wenn das Projekt nicht zustande kommt' },
    {
      type: 'p',
      text: 'Eine detaillierte Offerte mit individuellen Plänen stellt echte Arbeit dar: Sie systematisch kostenlos zu liefern, auch wenn der Kunde mehrere Handwerker vergleicht, ohne je zu unterschreiben, bedeutet, den Wettbewerbsvergleich der anderen mitzufinanzieren. Eine Studienpauschale zu verrechnen, abzugsfähig vom Endpreis bei Auftragsvergabe, schützt diese Zeit, ohne ernsthafte Kunden abzuschrecken.',
    },
    {
      type: 'callout',
      title: 'Die Montage vor Ort dauert fast immer länger als in der Werkstatt',
      text: 'Eine nicht perfekt rechtwinklige Wand, ein nicht ebener Boden: Diese Anpassungen in letzter Minute gehören zum Beruf, müssen aber in der Montagezeit eingeplant werden, statt die Marge des Projekts zu schmälern.',
    },
    {
      type: 'cta',
      title: 'Eine Offerte, die Studie, Fertigung und Montage unterscheidet',
      text: 'Cantia ermöglicht es, eine Offerte in klare Positionen zu gliedern, mit dem Katalog Ihrer wiederkehrenden Preise, damit Sie bei jedem neuen Massprojekt nicht wieder bei null anfangen müssen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Sollte man Aufmass und Pläne einer massgefertigten Einrichtung verrechnen?',
      answer:
        'Das ist empfehlenswert, mindestens als Studienpauschale, die vom Endpreis abgezogen wird, wenn die Offerte unterzeichnet wird, da dies eine reale Arbeitszeit schützt, die für den Kunden oft unsichtbar bleibt.',
    },
    {
      question: 'Wie kalkuliert man die Montagezeit einer massgefertigten Einrichtung?',
      answer:
        'Indem man systematisch eine Reserve gegenüber der theoretischen Werkstattzeit einplant, da Unregelmässigkeiten des bestehenden Baus (Wände, Böden) die tatsächliche Montage fast immer verlängern.',
    },
    {
      question: 'Sollte die Offerte für Schreinerarbeiten nach Mass eine Änderungsklausel enthalten?',
      answer:
        'Ja. Ein Kunde, der nach Validierung der Pläne seine Meinung zu einer Ausführung oder einer Massangabe ändert, muss einen kalkulierten Nachtrag auslösen, keine stillschweigende Änderung, die im Ausgangspreis untergeht.',
    },
  ],
  relatedSlugs: [
    'avenant-chantier-plus-value-moins-value',
    'devis-oral-valeur-legale-suisse',
    'validite-devis-signe-prix-qui-bouge',
  ],
  relatedTradeSlug: 'menuisier',
};
