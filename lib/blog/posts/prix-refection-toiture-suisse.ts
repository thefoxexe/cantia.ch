import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'prix-refection-toiture-suisse',
  question: 'Combien coûte la réfection d’une toiture en Suisse ?',
  title: 'Combien coûte la réfection d’une toiture en Suisse',
  description:
    'Fourchettes CHF/m² réalistes pour une réfection de toiture en Suisse selon le matériau (tuiles, ardoise, étanchéité plate), et pourquoi une visite sur place reste indispensable.',
  excerpt:
    'Un prix de toiture donné sans visite du chantier n’est qu’une estimation grossière : la charpente cachée sous la couverture peut à elle seule doubler la facture.',
  category: 'Devis & facturation',
  keywords: ['toiture', 'prix', 'réfection', 'm2', 'charpente', 'couverture'],
  publishedAt: '2026-09-25',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'La réfection d’une toiture est l’un des chantiers où l’écart entre un devis « à distance » et la facture finale peut être le plus important, simplement parce que l’état de la charpente n’est visible qu’une fois la couverture retirée.',
    },
    { type: 'h2', text: '1. Le prix varie fortement selon le matériau' },
    {
      type: 'p',
      text: 'Pour une toiture en tuiles (matériau le plus courant en Suisse), comptez généralement entre CHF 250 et 400 par m² pour une réfection complète de la couverture, hors charpente. Une toiture en ardoise coûte plus cher, souvent entre CHF 400 et 600 par m², en raison du matériau et du temps de pose. Une toiture plate avec étanchéité (bitume ou membrane synthétique) se situe généralement entre CHF 150 et 300 par m². Ces montants ne comprennent pas une intervention sur la charpente.',
    },
    { type: 'h2', text: '2. Le détail par poste' },
    {
      type: 'table',
      headers: ['Poste', 'Détail', 'Fourchette CHF/m²'],
      rows: [
        ['Couverture', 'Tuiles, fourniture et pose', '150 – 250'],
        ['Isolation toiture', 'Panneaux isolants sous couverture', '60 – 120'],
        ['Étanchéité / sous-toiture', 'Écran de sous-toiture, ventilation', '30 – 60'],
        ['Gouttières et zinguerie', 'Remplacement complet', '40 – 80 par mètre linéaire'],
        ['Charpente (si nécessaire)', 'Réparation ou remplacement partiel', 'très variable selon l’état'],
      ],
    },
    { type: 'h2', text: '3. Pourquoi une visite sur place est indispensable' },
    {
      type: 'p',
      text: 'Contrairement à d’autres travaux, l’état réel d’une charpente ne se voit pas de l’extérieur. Un devis fiable pour une réfection de toiture nécessite presque toujours une inspection sur place, parfois depuis les combles, pour vérifier l’état du bois, la présence d’humidité ou d’insectes xylophages. Un devis donné uniquement sur photos ou sur la surface au sol du bâtiment doit être considéré comme une estimation grossière, pas comme un prix ferme.',
    },
    {
      type: 'callout',
      title: 'La charpente, le vrai facteur d’incertitude',
      text: 'Deux toitures de même surface et même matériau peuvent avoir des coûts totalement différents selon l’état de la charpente. Mieux vaut prévoir dans le devis une clause explicite de complément si l’ouverture de la toiture révèle un état de charpente plus dégradé que prévu, plutôt que d’absorber le risque dans un prix ferme trop optimiste.',
    },
    {
      type: 'cta',
      title: 'Un devis de toiture prêt en sortant du chantier',
      text: 'Sur Cantia, saisissez vos relevés de mesures directement depuis le chantier et générez un devis détaillé par poste — couverture, isolation, zinguerie — avant même de reprendre la voiture.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quel est le prix moyen d’une réfection de toiture en tuiles en Suisse ?',
      answer:
        'Pour la couverture seule, comptez généralement entre CHF 250 et 400 par m². Ce montant n’inclut pas une éventuelle intervention sur la charpente, qui peut représenter un coût supplémentaire important selon son état.',
    },
    {
      question: 'Pourquoi les devis de toiture donnés par téléphone sont-ils peu fiables ?',
      answer:
        'Parce que l’état de la charpente, souvent le facteur de coût le plus variable, ne peut être évalué qu’en inspectant le bâtiment sur place, parfois depuis les combles. Un chiffre donné sans visite reste une estimation très grossière.',
    },
    {
      question: 'Faut-il prévoir une clause pour l’état de la charpente dans le devis ?',
      answer:
        'C’est fortement recommandé. Une clause précisant qu’un complément pourra être facturé si la charpente se révèle plus dégradée qu’anticipé protège l’entreprise sans surprendre le client, à condition de l’expliquer clairement avant signature.',
    },
  ],
  relatedSlugs: [
    'prix-isolation-facade-m2-suisse',
    'calculer-prix-devis-renovation-suisse',
    'calculer-prix-de-revient-chantier-batiment',
  ],
};
