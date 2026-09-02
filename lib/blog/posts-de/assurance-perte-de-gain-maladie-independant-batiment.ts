import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-perte-de-gain-maladie-independant-batiment',
  question: 'Ist ein Selbstständiger im Bauwesen bei Krankheit abgesichert?',
  title: 'Krankheitsausfall als Selbstständiger: Was NICHT gedeckt ist',
  description:
    'Die KVG-Grundversicherung zahlt die Behandlung, nie den entgangenen Verdienst. Ohne freiwillig abgeschlossene Krankentaggeldversicherung hat ein Selbstständiger bei Arbeitsausfall Anspruch auf keinerlei Ersatzeinkommen.',
  excerpt:
    'Ein Selbstständiger, der drei Wochen ans Bett gefesselt ist, erhält nichts, ausser er hat selbst eine Versicherung abgeschlossen, zu der ihn nichts verpflichtet. Die KVG-Grundversicherung deckt nur die Behandlung, nie den entgangenen Lohn.',
  category: 'Juridique & normes',
  keywords: ['Krankentaggeldversicherung Selbstständige', 'Erwerbsausfall Krankheit', 'KVG Grundversicherung', 'Taggeld Krankheit Bau', 'Krankenversicherung Selbstständigerwerbende'],
  publishedAt: '2026-05-04',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Angestellter erhält bei Krankheitsausfall in der Regel während einer gewissen Zeit weiterhin seinen Lohn, über den Arbeitgeber oder eine Kollektivversicherung. Ein Selbstständiger im Bauwesen erhält von sich aus gar nichts: drei Wochen Krankheitsausfall ohne spezifische Versicherung bedeuten drei Wochen ganz ohne Ersatzeinkommen.',
    },
    { type: 'h2', text: 'Der häufigste Irrtum: KVG bedeutet nicht garantiertes Einkommen' },
    {
      type: 'p',
      text: 'Die KVG-Grundversicherung (obligatorisch für jeden Schweizer Wohnsitz) deckt die medizinische Behandlung: Konsultationen, Spitalaufenthalt, Medikamente. Sie ersetzt nie ein entgangenes Einkommen. Krankentaggelder unterliegen einem völlig eigenständigen und freiwilligen Regime.',
    },
    {
      type: 'callout',
      title: 'Zwei Wege zur Absicherung, keiner davon obligatorisch',
      text: 'Eine Krankentaggeldversicherung (KTG) kann entweder als Privatversicherung nach VVG (Versicherungsvertragsgesetz) oder als freiwillige Taggeldversicherung im Rahmen des KVG selbst abgeschlossen werden. In beiden Fällen bleibt der Schritt freiwillig, nichts verpflichtet einen Selbstständigen rechtlich dazu.',
    },
    { type: 'h2', text: 'Was das in der Praxis bedeutet' },
    {
      type: 'list',
      items: [
        'Ohne KTG kann ein mehrwöchiger Krankheitsausfall die persönliche und geschäftliche Liquidität eines Selbstständigen ohne anderes Einkommen gefährden',
        'Die Karenzfrist (Wartezeit, bevor die Taggelder zu laufen beginnen) variiert je nach abgeschlossenem Vertrag, ein Punkt, der zu prüfen ist, bevor man eine Deckung als ausreichend betrachtet',
        'Je stärker die Tätigkeit physisch von der Anwesenheit des Selbstständigen auf der Baustelle abhängt (im Gegensatz zu einer Fernmanagement-Rolle), desto schwerer wiegt eine fehlende Deckung im Fall einer Arbeitsunfähigkeit',
      ],
    },
    { type: 'h2', text: 'Ein Puzzleteil eines grösseren Ganzen' },
    {
      type: 'p',
      text: 'Die Krankentaggeldversicherung reiht sich in eine Liste von Vorsorgeentscheidungen ein, die ein Selbstständiger mangels gesetzlicher Pflicht selbst treffen muss: obligatorische AHV/IV, freiwillige berufliche Vorsorge (BVG), in der Regel freiwillige Unfallversicherung ohne Angestellte, und nun die KTG. Keiner dieser Bausteine entsteht automatisch: Jeder erfordert einen freiwilligen Schritt, der in den ersten Jahren der Tätigkeit oft vernachlässigt wird, wenn die Priorität dem Umsatz statt der Vorsorge gilt.',
    },
    {
      type: 'cta',
      title: 'Klare Rentabilität, auch um solche Entscheidungen vorauszuplanen',
      text: 'Genau zu sehen, was jede Baustelle einbringt, hilft auch, eine freiwillige Vorsorge gelassen zu budgetieren, und das Rentabilitätsmodul von Cantia liefert genau diese laufende Übersicht.',
      buttonLabel: 'Rentabilität pro Baustelle entdecken',
    },
  ],
  faq: [
    {
      question: 'Deckt die KVG-Grundversicherung den Einkommensausfall bei Krankheit für einen Selbstständigen?',
      answer:
        'Nein, die KVG-Grundversicherung deckt nur die medizinische Behandlung. Ein Einkommensausfall wird nur durch eine freiwillig abgeschlossene Krankentaggeldversicherung gedeckt.',
    },
    {
      question: 'Ist ein Selbstständiger verpflichtet, eine Krankentaggeldversicherung abzuschliessen?',
      answer:
        'Nein, diese Versicherung bleibt in der Schweiz vollständig freiwillig, sei es als Privatversicherung (VVG) oder als freiwillige, ans KVG angebundene Versicherung.',
    },
    {
      question: 'Was passiert bei einem Selbstständigen ohne Deckung im Fall eines längeren Krankheitsausfalls?',
      answer:
        'Er erhält während seiner Arbeitsunfähigkeit kein Ersatzeinkommen, was rasch die persönliche und geschäftliche Liquidität belasten kann.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
