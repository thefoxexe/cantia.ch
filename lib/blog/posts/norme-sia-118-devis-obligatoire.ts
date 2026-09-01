import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'norme-sia-118-devis-obligatoire',
  question: 'La norme SIA 118 est-elle obligatoire sur mon devis ?',
  title: 'La norme SIA 118 est-elle obligatoire sur un devis ?',
  description:
    'La norme SIA 118 n’est jamais automatique : elle ne s’applique que si le contrat ou le devis la mentionne explicitement. Explications et bonnes pratiques.',
  excerpt:
    'Un architecte a mentionné la SIA 118 en réunion et vous pensez qu’elle s’applique d’office à votre chantier. C’est faux, et ça coûte cher en cas de litige.',
  category: 'Juridique & normes',
  keywords: ['sia 118', 'norme', 'contrat', 'devis', 'obligation', 'construction'],
  publishedAt: '2026-01-15',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un architecte a évoqué la SIA 118 en réunion de chantier, et depuis vous croyez qu’elle s’applique automatiquement à tout ce que vous signez en Suisse. C’est faux. Il s’agit même de l’une des confusions juridiques les plus répandues du bâtiment romand, celle qui fait perdre des recours en garantie à des entrepreneurs pourtant dans leur bon droit.',
    },
    { type: 'h2', text: 'Ce qu’est réellement la SIA 118' },
    {
      type: 'p',
      text: 'La SIA 118 ("Conditions générales pour l’exécution des travaux de construction") est un contrat-type privé édité par la Société suisse des ingénieurs et des architectes, et non une loi. Elle complète et précise le Code des obligations sur des points comme les délais de garantie, la réception de l’ouvrage ou la gestion des défauts, mais uniquement là où les deux parties ont choisi d’y recourir.',
    },
    {
      type: 'callout',
      title: 'Ce que ça change le jour où ça tourne mal',
      text: 'Sans la phrase exacte « les présentes conditions sont soumises à la norme SIA 118 » quelque part sur le document signé, un juge appliquera le Code des obligations seul, même si tout le monde sur le chantier pensait être sous SIA 118. La différence se joue en années de garantie et en procédure de réception, pas en détail cosmétique.',
    },
    { type: 'h2', text: 'Ce que ça change concrètement' },
    {
      type: 'list',
      items: [
        'Délais de garantie et de prescription différents entre CO seul et CO + SIA 118',
        'Réception d’ouvrage plus formalisée sous SIA 118 (procès-verbal de réception)',
        'Règles de résiliation et d’acomptes précisées par la norme',
        'Un juge n’applique la SIA 118 que si le contrat la mentionne noir sur blanc ; il ne la déduit jamais du contexte',
      ],
    },
    { type: 'h2', text: 'Faut-il l’imposer sur ses propres devis ?' },
    {
      type: 'p',
      text: 'Pour du dépannage ou une petite rénovation chez un particulier, le CO seul suffit généralement et reste plus lisible pour un client non initié. Pour un chantier plus lourd, en sous-traitance d’un maître d’œuvre, ou quand l’architecte l’a déjà imposée au reste du chantier, mentionner la SIA 118 sur votre propre devis harmonise les conditions avec ce qui se joue autour de vous, et évite ainsi l’absurdité de deux régimes différents sur le même chantier.',
    },
    {
      type: 'p',
      text: 'Le point qui compte vraiment : si vous choisissez de l’appliquer, la mention doit être visible sur le devis lui-même, et non glissée dans un document annexe que personne ne relit avant de signer.',
    },
    {
      type: 'cta',
      title: 'Vos conditions, jamais oubliées',
      text: 'Vos mentions contractuelles (SIA 118 ou non) s’enregistrent une fois dans Cantia et réapparaissent automatiquement sur chaque devis PDF, si bien qu’il devient impossible de les oublier sur un envoi pressé.',
      buttonLabel: 'Découvrir le module Devis',
    },
  ],
  faq: [
    {
      question: 'La SIA 118 est-elle une loi suisse ?',
      answer:
        'Non. C’est une norme contractuelle privée éditée par la SIA (Société suisse des ingénieurs et des architectes), qui ne s’applique que si le contrat ou le devis y fait explicitement référence.',
    },
    {
      question: 'Que se passe-t-il si le devis ne mentionne pas la SIA 118 ?',
      answer:
        'Le contrat d’entreprise reste régi par le seul Code des obligations (art. 363 et suivants CO), avec ses propres règles de garantie et de réception, distinctes de celles de la norme.',
    },
    {
      question: 'Un particulier peut-il refuser l’application de la SIA 118 ?',
      answer:
        'Oui, dans la mesure où son intégration résulte d’un accord entre les parties : un client peut négocier son retrait ou son remplacement par les règles du CO seul avant de signer le devis.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'delai-paiement-facture-artisan-code-obligations',
    'duree-conservation-devis-factures-suisse',
  ],
};
