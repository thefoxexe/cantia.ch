import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'entretien-annuel-employe-batiment-comment-faire',
  question: 'Comment mener un entretien annuel avec un employé du bâtiment ?',
  title: 'Comment mener un entretien annuel avec un employé du bâtiment',
  description:
    'Rare dans un secteur rythmé par les chantiers plutôt que par un calendrier RH, l’entretien annuel reste pourtant un vrai outil de fidélisation. Voici une structure simple pour le rendre utile.',
  excerpt:
    'Dans le bâtiment, le rythme est dicté par les chantiers, pas par un calendrier RH. C’est justement pour ça qu’un vrai temps d’échange annuel a de la valeur.',
  category: 'RH & salaires',
  keywords: ['entretien annuel employé bâtiment', 'entretien évaluation construction', 'management RH bâtiment'],
  publishedAt: '2026-10-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'L’entretien annuel reste rare dans le bâtiment, un secteur où le rythme est dicté par l’avancement des chantiers plutôt que par un calendrier RH structuré. C’est précisément ce qui en fait un outil utile : prendre le temps, une fois par an, de sortir du quotidien opérationnel pour faire un vrai point avec un employé change souvent la relation de travail plus qu’on ne l’imagine.',
    },
    { type: 'h2', text: 'Une structure simple suffit' },
    {
      type: 'p',
      text: 'Pas besoin d’un formulaire compliqué ni d’une grille d’évaluation lourde pour qu’un entretien annuel soit utile. Une structure simple, appliquée avec régularité, suffit largement dans la plupart des petites entreprises du bâtiment.',
    },
    {
      type: 'list',
      items: [
        'Un bilan de l’année écoulée : chantiers marquants, réussites concrètes, difficultés rencontrées',
        'Un échange sur ce qui a bien fonctionné et ce qui pourrait être amélioré, dans les deux sens',
        'Une discussion sur les objectifs ou l’évolution souhaitée par l’employé, même à moyen terme',
        'Un moment pour aborder ce qui ne trouve jamais naturellement sa place sur un chantier : charge de travail, ambiance, perspectives',
      ],
    },
    {
      type: 'callout',
      title: 'Ce n’est pas seulement un entretien descendant',
      text: 'Un entretien annuel qui ne sert qu’à évaluer l’employé rate une partie de son intérêt. Demander explicitement ce qui pourrait être amélioré du côté de l’entreprise — organisation, communication, matériel — transforme souvent l’échange en vrai dialogue plutôt qu’en simple bilan de performance.',
    },
    { type: 'h2', text: 'Un vrai levier de fidélisation' },
    {
      type: 'p',
      text: 'Dans un secteur marqué par la pénurie de main-d’œuvre qualifiée, un employé qui se sent entendu au-delà du salaire a statistiquement moins de raisons d’aller voir ailleurs. L’entretien annuel n’est pas une garantie de rétention à lui seul, mais il envoie un signal clair : l’entreprise prend le temps de s’intéresser à sa trajectoire, pas uniquement à sa production du jour.',
    },
    {
      type: 'cta',
      title: 'Préparer un entretien annuel avec des faits, pas des impressions',
      text: 'Avoir sous la main l’historique réel des chantiers d’un employé — tâches réalisées, régularité, évolution — rend un entretien annuel bien plus concret qu’une discussion générale. Cantia garde cet historique accessible chantier après chantier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'L’entretien annuel est-il obligatoire dans le bâtiment en Suisse ?',
      answer:
        'Non, il ne s’agit pas d’une obligation légale générale, mais d’une bonne pratique de gestion d’équipe qui reste peu répandue dans un secteur où le rythme est dicté par les chantiers plutôt que par un calendrier RH formel.',
    },
    {
      question: 'Combien de temps faut-il prévoir pour un entretien annuel efficace ?',
      answer:
        'Trente à quarante-cinq minutes suffisent généralement pour couvrir un vrai bilan sans que l’exercice devienne trop lourd, à condition que la discussion reste concrète et centrée sur des faits plutôt que sur des généralités.',
    },
    {
      question: 'L’entretien annuel aide-t-il vraiment à fidéliser les employés ?',
      answer:
        'Il y contribue, en particulier dans un secteur en pénurie de main-d’œuvre qualifiée, car il montre à l’employé que son parcours est pris en compte au-delà de la seule exécution des tâches quotidiennes sur les chantiers.',
    },
  ],
  relatedSlugs: [
    'fideliser-ouvriers-qualifies-penurie-batiment-suisse',
    'motiver-equipe-chantier-batiment-quotidien',
    'prime-fin-annee-ou-13e-salaire-difference',
  ],
};
