import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'apprenti-batiment-salaire-obligations-employeur',
  question: 'Quel salaire verser à un apprenti du bâtiment, et quelles obligations pour l’entreprise formatrice ?',
  title: 'Apprenti dans le bâtiment : salaire, encadrement et obligations de l’entreprise formatrice',
  description:
    'Former un apprenti dans le bâtiment implique un salaire progressif fixé par la CCT, un encadrement pédagogique réel et des obligations vis-à-vis du canton : voici ce qu’une petite entreprise doit anticiper.',
  excerpt:
    'Prendre un apprenti n’est pas juste « une paire de bras en plus ». C’est un engagement encadré, avec un salaire précis par année de formation et un vrai suivi pédagogique attendu de l’entreprise.',
  category: 'RH & salaires',
  keywords: ['apprenti bâtiment salaire', 'formation professionnelle construction', 'CCT apprenti', 'entreprise formatrice', 'contrat apprentissage'],
  publishedAt: '2026-08-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Former un apprenti dans le bâtiment répond souvent à un vrai besoin (relève, coût salarial initial plus bas) mais implique des obligations concrètes que beaucoup de petites entreprises découvrent en cours de route : un salaire progressif fixé par la CCT du métier, un encadrement pédagogique documenté, et un suivi régulier avec l’école professionnelle.',
    },
    { type: 'h2', text: 'Un salaire qui progresse chaque année de formation' },
    {
      type: 'p',
      text: 'Le salaire d’apprentissage est fixé par la convention collective du métier concerné (maçonnerie, charpente, plâtrerie-peinture, etc.), avec une grille qui augmente à chaque année de formation. Il ne s’agit jamais d’un montant négociable au cas par cas, donc vérifier la CCT applicable au métier précis évite une erreur de grille fréquente.',
    },
    {
      type: 'list',
      items: [
        'Le salaire progresse chaque année de formation, généralement sur une base annuelle et non mensuelle stricte',
        'Une CCT sectorielle peut prévoir des montants différents d’un métier du bâtiment à l’autre',
        'Les indemnités de repas et de déplacement suivent en général les mêmes règles que pour les employés qualifiés',
        'Un 13e salaire prorata s’applique le plus souvent aussi à l’apprenti, sauf disposition contraire de la CCT',
      ],
    },
    {
      type: 'callout',
      title: 'L’entreprise formatrice doit être autorisée par le canton',
      text: 'Former un apprenti nécessite une autorisation de former délivrée par l’autorité cantonale compétente, qui vérifie que l’entreprise dispose de l’encadrement et de l’équipement nécessaires. Ce n’est pas automatique du simple fait d’avoir un métier reconnu.',
    },
    { type: 'h2', text: 'Le suivi pédagogique n’est pas optionnel' },
    {
      type: 'p',
      text: 'Au-delà du salaire, l’entreprise s’engage à suivre un plan de formation, à désigner un formateur responsable, et à collaborer avec l’école professionnelle et parfois les cours interentreprises. Un carnet de formation ou un journal de progression, même informel, aide à documenter que l’apprenti a bien été exposé aux compétences attendues à chaque étape.',
    },
    {
      type: 'cta',
      title: 'Un journal de chantier qui sert aussi à former',
      text: 'Le fil d’actualité par chantier de Cantia permet de documenter les tâches réalisées par chaque membre de l’équipe, apprentis compris, ce qui constitue une base concrète pour un suivi de formation.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le salaire d’un apprenti du bâtiment est-il négociable ?',
      answer:
        'Non, il suit une grille fixée par la convention collective du métier concerné, progressive selon l’année de formation, et n’est pas librement négociable entre l’entreprise et l’apprenti.',
    },
    {
      question: 'Faut-il une autorisation pour former un apprenti ?',
      answer:
        'Oui, l’entreprise doit obtenir une autorisation de former délivrée par l’autorité cantonale compétente, qui vérifie l’encadrement et l’équipement disponibles.',
    },
    {
      question: 'Un apprenti a-t-il droit à un 13e salaire prorata ?',
      answer:
        'En général oui, selon les mêmes règles que pour les employés qualifiés, sauf disposition contraire explicite de la convention collective applicable.',
    },
  ],
  relatedSlugs: [
    'calculer-13e-salaire-prorata-employe',
    'salaire-minimum-cct-construction-suisse',
    'licenciement-ouvrier-batiment-delai-conge-cct',
  ],
};
