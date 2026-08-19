import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'sous-traitant-batiment-suisse-contrat-facturation',
  question: 'Comment gérer un sous-traitant sur un chantier suisse (contrat, responsabilité, facturation) ?',
  title: 'Sous-traitant bâtiment en Suisse : contrat, responsabilité et facturation',
  description:
    'Faire appel à un sous-traitant engage l’entrepreneur principal sur plusieurs plans : responsabilité envers le client, vérification des assurances, et suivi précis des factures reçues par chantier.',
  excerpt:
    'L’entrepreneur principal reste responsable envers le client même quand le travail est sous-traité. Voici les points à verrouiller avant de faire intervenir un sous-traitant.',
  category: 'Chantier & rentabilité',
  keywords: ['sous-traitant', 'sous-traitance bâtiment', 'responsabilité', 'contrat entreprise', 'facture sous-traitant'],
  publishedAt: '2026-02-12',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Faire appel à un sous-traitant est une pratique courante dans le bâtiment suisse — un chantier de rénovation combine souvent plusieurs corps de métier qu’une seule entreprise ne couvre pas. Mais sous-traiter ne veut pas dire se décharger de toute responsabilité envers le client.',
    },
    { type: 'h2', text: 'La responsabilité reste chez l’entrepreneur principal' },
    {
      type: 'p',
      text: 'Vis-à-vis du client, l’entrepreneur principal reste responsable du résultat de l’ouvrage, même si une partie du travail a été confiée à un sous-traitant. Le client n’a en principe pas de lien contractuel direct avec le sous-traitant — c’est un contrat séparé entre l’entrepreneur principal et lui. En cas de malfaçon du sous-traitant, c’est d’abord l’entrepreneur principal qui répond envers le client, avant de pouvoir éventuellement se retourner contre son sous-traitant.',
    },
    {
      type: 'callout',
      title: 'Vérifier les assurances avant de sous-traiter',
      text: 'Avant d’engager un sous-traitant, vérifier qu’il dispose d’une couverture responsabilité civile professionnelle en cours de validité, et qu’il est correctement affilié aux assurances sociales pour son personnel (LAA notamment). Une lacune ici retombe potentiellement sur l’entrepreneur principal.',
    },
    { type: 'h2', text: 'Ce qu’un contrat de sous-traitance devrait préciser' },
    {
      type: 'list',
      items: [
        'Le périmètre exact des travaux confiés, avec les limites claires vis-à-vis des autres corps de métier du chantier',
        'Le prix convenu et les modalités de paiement (acompte, échéancier, délai après réception)',
        'Les délais d’exécution, coordonnés avec le planning global du chantier',
        'Les garanties applicables et leur durée, en cohérence avec ce que l’entrepreneur principal a lui-même promis au client final',
        'La référence explicite à la norme SIA 118 si elle s’applique au contrat principal — pour éviter un décalage entre les deux niveaux de contrat',
      ],
    },
    { type: 'h2', text: 'Le suivi financier : le vrai point de friction au quotidien' },
    {
      type: 'p',
      text: 'Au-delà du juridique, la difficulté pratique la plus fréquente est le suivi : combien a-t-on déjà facturé à ce sous-traitant, combien reste-t-il dû, et ce sous-traitant intervient-il sur plusieurs chantiers en parallèle ? Sans un suivi centralisé par chantier, il devient facile de perdre la trace d’une facture reçue, ou de la lier au mauvais chantier lors de la clôture de la rentabilité.',
    },
    {
      type: 'p',
      text: 'Ce suivi est aussi la donnée qui alimente directement le calcul de rentabilité d’un chantier : une facture de sous-traitant non enregistrée fausse silencieusement la marge réelle affichée.',
    },
    {
      type: 'cta',
      title: 'Un répertoire de sous-traitants, lié à vos chantiers',
      text: 'Cantia centralise vos sous-traitants, leurs affectations par chantier et les factures reçues — directement rattachées au calcul de rentabilité du chantier concerné.',
      buttonLabel: 'Découvrir le module Sous-traitants',
    },
  ],
  faq: [
    {
      question: 'Qui est responsable envers le client en cas de malfaçon d’un sous-traitant ?',
      answer:
        'L’entrepreneur principal reste responsable envers le client final, le sous-traitant n’ayant en principe pas de lien contractuel direct avec ce dernier. L’entrepreneur principal peut ensuite se retourner contre son sous-traitant sur la base de leur propre contrat.',
    },
    {
      question: 'Faut-il vérifier les assurances d’un sous-traitant avant de l’engager ?',
      answer:
        'Oui — notamment sa responsabilité civile professionnelle et son affiliation aux assurances sociales (LAA) pour son personnel, car une lacune peut avoir des conséquences pour l’entrepreneur principal.',
    },
    {
      question: 'Le contrat de sous-traitance doit-il reprendre la norme SIA 118 du contrat principal ?',
      answer:
        'C’est recommandé lorsque le contrat principal y fait lui-même référence, afin d’éviter un décalage de garanties ou de délais entre les deux niveaux de contrat.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'suivre-rentabilite-chantier-sans-excel',
    'norme-sia-118-devis-obligatoire',
  ],
};
