import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'norme-sia-118-devis-obligatoire',
  question: 'La norme SIA 118 est-elle obligatoire sur mon devis ?',
  title: 'La norme SIA 118 est-elle obligatoire sur un devis ?',
  description:
    'La norme SIA 118 n’est jamais automatique : elle ne s’applique que si le contrat ou le devis la mentionne explicitement. Explications et bonnes pratiques.',
  excerpt:
    'Contrairement à une idée reçue, la SIA 118 ne s’applique pas automatiquement à un chantier suisse — elle doit être expressément intégrée au contrat.',
  category: 'Juridique & normes',
  keywords: ['sia 118', 'norme', 'contrat', 'devis', 'obligation', 'construction'],
  publishedAt: '2026-01-15',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Beaucoup d’artisans suisses pensent que la norme SIA 118 s’applique automatiquement à tout chantier, comme le ferait une loi. Ce n’est pas le cas — et la confusion coûte parfois cher en cas de litige.',
    },
    { type: 'h2', text: 'Ce qu’est réellement la SIA 118' },
    {
      type: 'p',
      text: 'La SIA 118 ("Conditions générales pour l’exécution des travaux de construction") est une norme éditée par la Société suisse des ingénieurs et des architectes. C’est un contrat-type privé, pas une loi fédérale ni cantonale. Elle complète et précise le Code des obligations (CO) sur des points comme les délais de garantie, la réception de l’ouvrage, ou la gestion des défauts — mais uniquement là où les deux parties ont choisi de s’y référer.',
    },
    {
      type: 'callout',
      title: 'La règle à retenir',
      text: 'Sans incorporation explicite dans le devis ou le contrat ("les présentes conditions sont soumises à la norme SIA 118"), c’est le Code des obligations qui s’applique seul — avec des délais de garantie souvent différents (2 ans en principe pour un ouvrage immobilier selon l’art. 371 CO, contre des délais aménageables sous SIA 118).',
    },
    { type: 'h2', text: 'Pourquoi ça change concrètement les choses' },
    {
      type: 'list',
      items: [
        'Délais de garantie et de prescription différents entre CO seul et CO + SIA 118',
        'Procédure de réception d’ouvrage plus formalisée sous SIA 118 (procès-verbal de réception)',
        'Règles de résiliation et de paiement d’acomptes précisées par la norme',
        'En cas de litige, le juge n’appliquera la SIA 118 que si le contrat la mentionne noir sur blanc',
      ],
    },
    { type: 'h2', text: 'Faut-il l’appliquer sur ses devis en tant qu’artisan ?' },
    {
      type: 'p',
      text: 'Ça dépend surtout de la taille et de la nature des chantiers. Pour de petits travaux (dépannage, petite rénovation), le CO seul suffit généralement et reste plus simple à comprendre pour un client particulier. Pour des chantiers plus importants, en sous-traitance d’un maître d’œuvre, ou quand l’architecte du projet l’exige déjà, mentionner explicitement la SIA 118 sur le devis harmonise les conditions avec le reste du chantier.',
    },
    {
      type: 'p',
      text: 'Le point important : si vous décidez de l’appliquer, la mention doit être visible et non ambiguë sur le devis lui-même — pas seulement évoquée à l’oral ou glissée dans un document annexe que le client n’a pas lu.',
    },
    {
      type: 'cta',
      title: 'Des conditions claires sur chaque devis',
      text: 'Sur Cantia, les conditions générales et mentions contractuelles de votre entreprise (SIA 118 ou non) sont enregistrées une fois et réapparaissent automatiquement sur chaque devis PDF généré.',
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
        'Oui, dans la mesure où son intégration résulte d’un accord entre les parties — un client peut négocier son retrait ou son remplacement par les règles du CO seul avant de signer le devis.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'delai-paiement-facture-artisan-code-obligations',
    'duree-conservation-devis-factures-suisse',
  ],
};
