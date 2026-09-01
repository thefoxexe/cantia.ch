import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'sous-traitant-batiment-suisse-contrat-facturation',
  question: 'Comment gérer un sous-traitant sur un chantier suisse (contrat, responsabilité, facturation) ?',
  title: 'Sous-traitant bâtiment en Suisse : contrat, responsabilité et facturation',
  description:
    'Faire appel à un sous-traitant engage l’entrepreneur principal sur plusieurs plans : responsabilité envers le client, vérification des assurances, et suivi précis des factures reçues par chantier.',
  excerpt:
    'Sous-traiter ne déleste jamais l’entrepreneur principal de sa responsabilité envers le client. Le malentendu le plus répandu du bâtiment romand, et le plus coûteux.',
  category: 'Chantier & rentabilité',
  keywords: ['sous-traitant', 'sous-traitance bâtiment', 'responsabilité', 'contrat entreprise', 'facture sous-traitant'],
  publishedAt: '2026-02-12',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Faire appel à un sous-traitant est une pratique courante dans le bâtiment suisse : un chantier de rénovation combine presque toujours plusieurs corps de métier qu’une seule entreprise ne couvre pas. Ce que beaucoup découvrent trop tard : sous-traiter ne déleste jamais l’entrepreneur principal de sa responsabilité envers le client.',
    },
    { type: 'h2', text: 'La responsabilité ne se sous-traite pas' },
    {
      type: 'p',
      text: 'Vis-à-vis du client, l’entrepreneur principal reste responsable du résultat de l’ouvrage, même si une partie du travail a été confiée à un sous-traitant. Le client n’a en principe aucun lien contractuel direct avec le sous-traitant. Il s’agit d’un contrat séparé entre l’entrepreneur principal et lui. En cas de malfaçon du sous-traitant, c’est d’abord l’entrepreneur principal qui répond envers le client, avant de pouvoir éventuellement se retourner contre son sous-traitant.',
    },
    {
      type: 'callout',
      title: 'Vérifier les assurances avant de signer, pas après un sinistre',
      text: 'Avant d’engager un sous-traitant, vérifier qu’il dispose d’une responsabilité civile professionnelle en cours de validité, et qu’il est correctement affilié aux assurances sociales pour son personnel. Une lacune ici retombe potentiellement sur l’entrepreneur principal, et le pire moment pour le découvrir est en plein sinistre.',
    },
    { type: 'h2', text: 'Ce qu’un contrat de sous-traitance devrait verrouiller' },
    {
      type: 'list',
      items: [
        'Le périmètre exact des travaux confiés, avec des limites claires vis-à-vis des autres corps de métier du chantier',
        'Le prix convenu et les modalités de paiement (acompte, échéancier, délai après réception)',
        'Les délais d’exécution, coordonnés avec le planning global du chantier',
        'Les garanties applicables et leur durée, en cohérence avec ce que l’entrepreneur principal a lui-même promis au client final',
        'La référence explicite à la norme SIA 118 si elle s’applique au contrat principal, afin d’éviter un décalage entre les deux niveaux de contrat',
      ],
    },
    { type: 'h2', text: 'Le vrai point de friction : pas le juridique, le suivi financier' },
    {
      type: 'p',
      text: 'Au-delà du contrat, la difficulté la plus fréquente au quotidien est bien plus terre à terre : combien a-t-on déjà facturé à ce sous-traitant, combien reste-t-il dû, intervient-il sur plusieurs chantiers en même temps ? Sans suivi centralisé par chantier, une facture reçue se perd facilement, ou se rattache au mauvais chantier au moment de calculer la rentabilité, sans que personne ne s’en rende compte avant la clôture.',
    },
    {
      type: 'p',
      text: 'C’est exactement la donnée qui alimente le calcul de rentabilité d’un chantier : une facture de sous-traitant mal enregistrée fausse silencieusement la marge affichée, dans un sens ou dans l’autre.',
    },
    {
      type: 'cta',
      title: 'Un répertoire de sous-traitants, lié à vos chantiers',
      text: 'Cantia centralise vos sous-traitants, leurs affectations par chantier et les factures reçues, directement rattachées au calcul de rentabilité du chantier concerné.',
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
        'Oui : il faut vérifier notamment sa responsabilité civile professionnelle et son affiliation aux assurances sociales (LAA) pour son personnel, car une lacune peut avoir des conséquences pour l’entrepreneur principal.',
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
