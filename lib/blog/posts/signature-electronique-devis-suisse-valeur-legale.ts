import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'signature-electronique-devis-suisse-valeur-legale',
  question: 'Une signature électronique sur un devis a-t-elle une valeur légale en Suisse ?',
  title: 'Signer un devis en ligne : ce que ça vaut vraiment devant la loi',
  description:
    'La signature électronique simple vaut acceptation contractuelle pour la quasi-totalité des devis du bâtiment. La signature qualifiée n’est nécessaire que dans des cas précis, rares en pratique.',
  excerpt:
    'Un client qui clique « J’accepte » sur un lien signe autant qu’avec un stylo — pour l’immense majorité des devis du bâtiment, la loi suisse ne demande rien de plus.',
  category: 'Devis & facturation',
  keywords: ['signature électronique', 'signature en ligne', 'valeur légale', 'devis signé', 'set curdig'],
  publishedAt: '2026-04-20',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un client reçoit un lien, clique « J’accepte », le chantier démarre — sans stylo, sans papier imprimé. Beaucoup d’artisans se demandent encore si ça « compte vraiment » aux yeux de la loi. La réponse est oui, dans l’immense majorité des cas.',
    },
    { type: 'h2', text: 'Trois niveaux de signature électronique, pas un seul' },
    {
      type: 'table',
      headers: ['Type', 'Ce que c’est', 'Cas d’usage typique'],
      rows: [
        ['Simple', 'Clic, case cochée, validation horodatée', 'Devis, factures, la plupart des contrats commerciaux'],
        ['Avancée', 'Identité du signataire vérifiée, liée de façon unique', 'Contrats à enjeu plus élevé'],
        ['Qualifiée (SES/SEQ au sens SCSE)', 'Certificat qualifié, équivalent à la signature manuscrite', 'Actes exigeant légalement la forme écrite qualifiée'],
      ],
    },
    {
      type: 'callout',
      title: 'Le point qui rassure la plupart des artisans',
      text: 'Puisque le contrat d’entreprise ne requiert aucune forme particulière (voir l’art. 11 CO), une signature électronique simple — un clic horodaté sur un portail — suffit à documenter l’acceptation d’un devis. La signature qualifiée n’est nécessaire que pour les rares actes où la loi exige spécifiquement une forme écrite qualifiée (par exemple certains actes immobiliers), ce qui ne concerne quasiment jamais un devis de travaux.',
    },
    { type: 'h2', text: 'Ce qui rend une signature électronique simple solide' },
    {
      type: 'list',
      items: [
        'Un horodatage précis de l’acceptation, conservé comme preuve',
        'L’identification claire du document accepté (version, montant, date) — pas juste un clic isolé sans contexte',
        'Idéalement, une trace de l’adresse email ou du compte ayant validé, pour rattacher l’acceptation à la bonne personne',
      ],
    },
    { type: 'h2', text: 'Pourquoi ça vaut mieux qu’un PDF imprimé-signé-scanné' },
    {
      type: 'p',
      text: 'Un PDF signé à la main puis scanné n’a en réalité pas plus de valeur juridique qu’un clic horodaté — les deux sont des preuves d’acceptation, ni plus ni moins solides l’une que l’autre pour un contrat sans forme requise. La vraie différence est pratique : le clic élimine l’étape d’impression, réduit la friction pour le client, et laisse une trace numérique plus facile à retrouver des années plus tard qu’un scan égaré dans une boîte mail.',
    },
    {
      type: 'cta',
      title: 'Signé en ligne, horodaté automatiquement',
      text: 'Le portail client Cantia permet au client de consulter et signer son devis directement en ligne — l’acceptation est horodatée et conservée avec le document.',
      buttonLabel: 'Voir le module Devis',
    },
  ],
  faq: [
    {
      question: 'Une signature électronique simple suffit-elle pour un devis de travaux ?',
      answer:
        'Oui, dans la quasi-totalité des cas — le contrat d’entreprise ne requiert aucune forme particulière, donc un clic horodaté suffit à documenter l’acceptation.',
    },
    {
      question: 'Quand faut-il une signature électronique qualifiée plutôt que simple ?',
      answer:
        'Uniquement pour les actes où la loi exige spécifiquement une forme écrite qualifiée — un cas rare qui ne concerne quasiment jamais un devis de travaux du bâtiment.',
    },
    {
      question: 'Un devis signé électroniquement vaut-il plus qu’un PDF imprimé et signé à la main ?',
      answer:
        'Les deux ont une valeur de preuve comparable pour un contrat sans forme requise — la signature électronique a surtout l’avantage pratique de réduire la friction et de laisser une trace numérique facilement retrouvable.',
    },
  ],
  relatedSlugs: [
    'devis-oral-valeur-legale-suisse',
    'rediger-devis-qui-inspire-confiance-client',
    'validite-devis-signe-prix-qui-bouge',
  ],
};
