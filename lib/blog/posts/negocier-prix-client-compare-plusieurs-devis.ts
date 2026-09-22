import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'negocier-prix-client-compare-plusieurs-devis',
  question: 'Comment répondre à un client qui compare plusieurs devis sans baisser son prix ?',
  title: 'Comment répondre à un client qui compare trois devis sans baisser son prix',
  description:
    'Baisser systématiquement son prix face à la concurrence est rarement la bonne réponse. Comment défendre son devis avec des arguments concrets, et quand un ajustement reste légitime.',
  excerpt:
    'Un client qui annonce comparer plusieurs devis n’attend pas forcément le prix le plus bas. Il attend souvent d’être rassuré sur ce qu’il paie vraiment.',
  category: 'Croissance & acquisition',
  keywords: ['client compare plusieurs devis', 'négocier prix devis artisan', 'défendre son prix bâtiment'],
  publishedAt: '2026-09-29',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: '« J’ai deux autres devis, vous pouvez faire un effort ? » C’est l’une des phrases les plus fréquentes dans le bâtiment, et la première réaction, presque réflexe, est de baisser un peu le prix pour ne pas perdre le chantier. C’est pourtant rarement la meilleure réponse.',
    },
    { type: 'h2', text: 'Pourquoi baisser systématiquement le prix est une mauvaise stratégie' },
    {
      type: 'p',
      text: 'Chaque baisse de prix accordée sous pression grignote une marge déjà calculée au plus juste. Mais le vrai problème est ailleurs : céder immédiatement envoie au client le signal que le prix initial n’était pas sérieux, ce qui fragilise la confiance plutôt que de la renforcer. Un client qui obtient une baisse trop facilement se demande souvent, sans le dire, ce que l’entreprise a prévu de rogner ailleurs pour compenser.',
    },
    { type: 'h2', text: 'Comment défendre son prix sans s’excuser' },
    {
      type: 'list',
      items: [
        'Rappeler concrètement ce que le prix couvre : matériaux, garanties, assurance RC professionnelle, délai annoncé',
        'Mettre en avant des références vérifiables plutôt que des arguments abstraits sur la qualité',
        'Expliquer la méthode et le temps réellement nécessaire, notamment si un autre devis semble anormalement bas',
        'Rester factuel et calme : un prix qui se justifie n’a pas besoin d’être défendu avec insistance',
      ],
    },
    {
      type: 'callout',
      title: 'Un devis trop vite baissé perd en crédibilité, pas seulement en marge',
      text: 'Un client hésite rarement entre deux prix identiques. Il hésite entre la confiance qu’il accorde à chaque entreprise. Céder trop vite sur le prix abîme souvent cette confiance plus que le prix lui-même ne la construisait.',
    },
    { type: 'h2', text: 'Quand un ajustement reste légitime' },
    {
      type: 'p',
      text: 'Tous les ajustements ne sont pas une capitulation. Un volume de travail plus important, une simplification réelle du cahier des charges, un paiement anticipé ou un chantier qui s’enchaîne facilement avec un autre déjà prévu peuvent justifier un prix revu à la baisse, parce que les conditions réelles du travail ont changé, pas seulement la pression du client. La différence est simple : un ajustement se justifie par un changement concret, jamais par la seule envie de ne pas perdre le chantier.',
    },
    {
      type: 'stat',
      value: '3',
      label: 'devis en moyenne sont souvent comparés par un client avant de choisir une entreprise pour des travaux de rénovation',
    },
    {
      type: 'cta',
      title: 'Un devis qui se défend tout seul',
      text: 'Avec Cantia, chaque devis détaille clairement les postes, les matériaux et les garanties, avec un catalogue de prix cohérent d’un chantier à l’autre. Plus facile de justifier un prix quand il est présenté clairement.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il toujours refuser de baisser son prix face à la concurrence ?',
      answer:
        'Non, mais une baisse doit se justifier par un changement concret (volume, simplification du travail, conditions de paiement), pas uniquement par la peur de perdre le chantier face à un devis concurrent.',
    },
    {
      question: 'Comment réagir si un devis concurrent est anormalement bas ?',
      answer:
        'Expliquer factuellement ce que couvre son propre prix (matériaux, assurance, garanties, délai) permet souvent au client de comprendre pourquoi l’écart existe, sans avoir à critiquer directement le concurrent.',
    },
    {
      question: 'Un client qui compare plusieurs devis cherche-t-il forcément le moins cher ?',
      answer:
        'Pas toujours. Beaucoup de clients comparent surtout pour se rassurer sur le sérieux de l’entreprise choisie. Des références solides et un devis clair pèsent souvent autant que le prix dans la décision finale.',
    },
  ],
  relatedSlugs: ['relancer-client-devis-sans-reponse', 'meilleur-logiciel-devis-facture-batiment-suisse-2026', 'vitesse-reponse-devis-taux-conversion-batiment'],
};
