import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-charpente-bois-facturation-suisse',
  question: 'Wie sollte ein Zimmermann eine Offerte zwischen Massholz und Werkstattmontage kalkulieren?',
  title: 'Holzbau-Offerte: Materialkosten, Vorfertigung und Montage richtig kalkulieren',
  description:
    'Zwischen schwankendem Holzpreis, Vorfertigungszeit in der Werkstatt und Montage auf der Baustelle addiert eine Zimmerei-Offerte drei sehr unterschiedliche Posten. So strukturieren Sie sie richtig.',
  excerpt:
    'Ein Dachstuhl entsteht in drei Etappen: Holzeinkauf, Vorfertigung in der Werkstatt, dann Montage auf der Baustelle. Eine Offerte, die diese nicht trennt, riskiert, die Holzpreisinflation aus der eigenen Marge zu bezahlen.',
  category: 'Métiers du bâtiment',
  keywords: ['Offerte Holzbau Zimmerei', 'Verrechnung Zimmermann Schweiz', 'Holzpreis Bau', 'Offerte Werkstatt Zimmerei', 'Montage Dachstuhl Baustelle'],
  publishedAt: '2026-09-04',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Eine Holzbau-Offerte durchläuft drei Etappen mit unterschiedlichem Rhythmus: den Holzeinkauf, dessen Preis sich zwischen Unterzeichnung und tatsächlicher Bestellung verändern kann; die Vorfertigung in der Werkstatt, planbar und messbar; und die Montage auf der Baustelle, die von Wetter und Zugänglichkeit abhängt. Wer das als starres Pauschalpaket behandelt, trägt allein Schwankungen, die nichts mit der geleisteten Arbeit zu tun haben.',
    },
    { type: 'h2', text: 'Drei Posten, drei Preislogiken' },
    {
      type: 'list',
      items: [
        'Holz und Beschläge: idealerweise mit einer Preisanpassungsklausel kalkuliert, wenn zwischen Offerte und Bestellung mehr als ein paar Wochen liegen',
        'Vorfertigung in der Werkstatt: pauschal oder nach Stunden, planbar, da unabhängig von Baustellenrisiken',
        'Montage und Aufrichten vor Ort: in Regie oder pauschal mit Wetterklausel, da die tatsächliche Dauer stark von den Bedingungen des Tages abhängt',
      ],
    },
    {
      type: 'stat',
      value: '2 bis 3 Wo.',
      label: 'typische Frist zwischen Erstellung einer Holzbau-Offerte und tatsächlichem Bestellstart, ausreichend Zeit, damit sich die Preise bewegen',
    },
    { type: 'h2', text: 'Das Aufrichten ist kein einfacher Arbeitsposten' },
    {
      type: 'p',
      text: 'Die Montage eines Dachstuhls erfordert oft einen tageweise gemieteten Kran oder Autokran, ein komplettes gleichzeitig eingesetztes Team und eine starke Wetterabhängigkeit. Ein zu starker Wind, der das Aufrichten verschiebt, verursacht reale Kosten (Miete, blockiertes Team), die man besser vertraglich vorausgesehen hat, statt sie mitten in der Verhandlung mit dem Kunden zu entdecken.',
    },
    {
      type: 'callout',
      title: 'Eine Preisanpassungsklausel beim Holz schützt beide Seiten',
      text: 'Angesichts der Volatilität der Baupreise für Holz vermeidet eine klare Anpassungsklausel (indexiert auf ein Bestelldatum, nicht auf die Unterzeichnung der Offerte), dass der Zimmermann seine Marge verliert und der Kunde eine unerwartete böse Überraschung erlebt.',
    },
    {
      type: 'cta',
      title: 'Trennen Sie Material, Vorfertigung und Montage auf jeder Offerte',
      text: 'Cantia erlaubt es, eine Offerte in klare Posten mit eigenen Mengen und Preisen zu strukturieren, damit jeder Teil einer Zimmerei-Baustelle unabhängig lesbar und anpassbar bleibt.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Wie schützt man sich vor Holzpreisschwankungen zwischen Offerte und Bestellung?',
      answer:
        'Indem man beim Posten Holz eine Preisanpassungsklausel einbaut, indexiert auf das tatsächliche Bestelldatum statt auf das Datum der Offertunterzeichnung, insbesondere wenn mehr als ein paar Wochen dazwischenliegen.',
    },
    {
      question: 'Sollte man das Aufrichten eines Dachstuhls separat von der Montage verrechnen?',
      answer:
        'Das wird empfohlen, wenn eigens ein Kran oder Autokran gemietet wird, da diese Kosten für den Tag fix sind, unabhängig von der tatsächlichen Montagezeit, und direkt dem Wetterrisiko ausgesetzt.',
    },
    {
      question: 'Wie geht man mit einer wetterbedingten Verschiebung einer Zimmerei-Baustelle um?',
      answer:
        'Idealerweise über eine bereits in der Offerte vorgesehene Klausel, die festlegt, wer die Kosten einer Verschiebung (Gerätemiete, mobilisiertes Team) trägt, statt dies erst danach unter Druck zu verhandeln.',
    },
  ],
  relatedSlugs: [
    'retard-chantier-meteo-obligations-contractuelles',
    'avenant-chantier-plus-value-moins-value',
    'devis-facture-facadier-isolation-suisse',
  ],
};
