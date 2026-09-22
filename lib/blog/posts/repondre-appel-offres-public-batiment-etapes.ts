import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'repondre-appel-offres-public-batiment-etapes',
  question: 'Comment répondre à un appel d’offres public dans le bâtiment ?',
  title: 'Comment répondre à un appel d’offres public dans le bâtiment, étape par étape',
  description:
    'Où trouver les appels d’offres publics, comment monter un dossier complet et sur quels critères les collectivités suisses évaluent réellement les offres. Un guide concret pour se lancer.',
  excerpt:
    'Beaucoup de petites entreprises du bâtiment n’osent jamais répondre à un marché public, persuadées que ce n’est réservé qu’aux grosses structures. Ce n’est pas toujours vrai.',
  category: 'Croissance & acquisition',
  keywords: ['appel d’offres public bâtiment', 'marché public construction suisse', 'répondre appel offres artisan'],
  publishedAt: '2026-09-28',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Un appel d’offres public, ça fait peur de loin : formulaires officiels, jargon juridique, délais serrés. Vu de près, c’est surtout un dossier bien structuré à rendre dans les temps. Voici comment s’y prendre concrètement, sans y perdre trois semaines.',
    },
    { type: 'h2', text: 'Où trouver les appels d’offres' },
    {
      type: 'p',
      text: 'En Suisse, la plupart des marchés publics de construction transitent par des plateformes officielles, au niveau cantonal ou via la plateforme nationale simap.ch pour les marchés soumis aux accords intercantonaux ou internationaux. Certaines communes publient aussi directement leurs avis sur leur propre site ou dans la Feuille officielle. Le réflexe le plus rentable reste de configurer une alerte par mot-clé (son métier, sa région) plutôt que d’aller vérifier manuellement chaque semaine.',
    },
    { type: 'h2', text: 'Constituer un dossier complet' },
    {
      type: 'list',
      items: [
        'Le prix détaillé, poste par poste, cohérent avec le cahier des charges fourni — pas un prix global vague',
        'Des références de chantiers comparables, avec si possible des photos et un ou deux contacts vérifiables',
        'Les délais d’exécution proposés, réalistes par rapport à la capacité réelle de l’équipe',
        'Les attestations à jour : assurance RC professionnelle, affiliation AVS, parfois attestation de non-poursuite ou respect de la CCT du bâtiment',
        'Le formulaire d’offre officiel rempli exactement comme demandé, sans reformulation libre',
      ],
    },
    {
      type: 'callout',
      title: 'Un dossier incomplet est éliminé avant même d’être évalué sur le fond',
      text: 'La majorité des offres écartées le sont pour un motif purement administratif : une attestation manquante, un délai dépassé de quelques heures, un formulaire rempli à la main quand un format était imposé. La rigueur formelle compte souvent plus que l’audace du prix.',
    },
    { type: 'h2', text: 'Comment les offres sont réellement évaluées' },
    {
      type: 'p',
      text: 'Un marché public ne se décide presque jamais au prix le plus bas seul. Les collectivités suisses pondèrent généralement plusieurs critères : le prix, mais aussi les références, les délais, parfois la qualité technique de la méthode proposée ou des engagements environnementaux. Une petite entreprise avec de bonnes références locales et un prix honnête a souvent plus de chances qu’elle ne le pense face à une plus grosse structure au prix agressif mais aux références génériques.',
    },
    {
      type: 'stat',
      value: '20-40%',
      label: 'du poids de l’évaluation porte généralement sur des critères autres que le prix dans un marché public de construction en Suisse',
    },
    { type: 'h2', text: 'Pourquoi tant de petites entreprises n’osent jamais postuler' },
    {
      type: 'p',
      text: 'La peur du formalisme et le temps perçu comme disproportionné découragent beaucoup d’artisans, alors qu’un premier dossier bien préparé peut ensuite servir de modèle réutilisable pour les suivants. Le vrai coût n’est pas de répondre une fois, c’est de ne jamais essayer et de se priver d’un canal de chantiers réguliers, souvent moins dépendant du bouche-à-oreille.',
    },
    {
      type: 'cta',
      title: 'Un dossier de référence toujours prêt',
      text: 'Avec Cantia, chaque chantier terminé laisse une trace exploitable : photos avant/après, devis et factures archivés, historique client. De quoi constituer un dossier de références solide en quelques minutes le jour où un appel d’offres se présente.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Une petite entreprise a-t-elle vraiment une chance sur un appel d’offres public ?',
      answer:
        'Oui, dans la mesure où le prix n’est généralement pas le seul critère : les références, les délais et la qualité du dossier comptent aussi. Une petite structure bien préparée, avec de bonnes références locales, peut tout à fait l’emporter face à une entreprise plus grande.',
    },
    {
      question: 'Où surveiller les appels d’offres publics dans le bâtiment en Suisse ?',
      answer:
        'Principalement sur les plateformes cantonales dédiées aux marchés publics et sur simap.ch pour les marchés soumis aux accords intercantonaux, en complément des publications communales. Une alerte par mot-clé évite de devoir vérifier manuellement chaque semaine.',
    },
    {
      question: 'Que se passe-t-il si un document du dossier est manquant ?',
      answer:
        'Dans la plupart des cas, un dossier incomplet ou déposé après le délai est purement et simplement écarté avant même l’évaluation du prix ou des références. La rigueur administrative est donc au moins aussi importante que le contenu de l’offre elle-même.',
    },
  ],
  relatedSlugs: ['trouver-clients-artisan-batiment-suisse', 'portfolio-photos-avant-apres-chantier-vente', 'signature-electronique-devis-suisse-valeur-legale'],
};
