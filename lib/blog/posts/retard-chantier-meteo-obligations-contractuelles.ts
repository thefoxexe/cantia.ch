import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'retard-chantier-meteo-obligations-contractuelles',
  question: 'Un retard de chantier dû à la météo engage-t-il la responsabilité de l’entrepreneur ?',
  title: 'Retard de chantier causé par la météo : qui en porte la responsabilité ?',
  description:
    'Un délai contractuel dépassé à cause d’intempéries n’est pas automatiquement une faute de l’entrepreneur — mais encore faut-il pouvoir le prouver, jour par jour, et l’avoir communiqué à temps.',
  excerpt:
    'Le client attend son chantier terminé, la météo n’a pas coopéré — et sans preuve écrite, le retard risque de retomber intégralement sur l’entrepreneur, même quand il n’y est pour rien.',
  category: 'Chantier & rentabilité',
  keywords: ['retard chantier météo', 'intempéries construction', 'délai contractuel bâtiment', 'responsabilité entrepreneur', 'preuve retard chantier'],
  publishedAt: '2026-07-22',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un délai de chantier dépassé à cause d’intempéries prolongées ne constitue en principe pas une faute de l’entrepreneur, tant que le retard reste dans une mesure raisonnable au regard des conditions rencontrées. Mais cette protection n’est pas automatique : sans documentation précise, un client de mauvaise foi (ou simplement mécontent) peut contester que la météo ait réellement empêché le travail, faute de preuve.',
    },
    { type: 'h2', text: 'Ce qui compte juridiquement' },
    {
      type: 'list',
      items: [
        'La météo doit avoir concrètement empêché l’exécution des travaux, pas seulement rendu le chantier inconfortable',
        'Le retard doit avoir été communiqué au client dans un délai raisonnable, pas révélé après coup au moment de la livraison',
        'La durée du retard doit rester proportionnée aux jours réellement impactés, pas gonflée par d’autres causes internes à l’entreprise',
        'Un contrat qui prévoit explicitement une clause d’intempéries protège davantage qu’un silence total sur le sujet',
      ],
    },
    {
      type: 'callout',
      title: 'La preuve se construit au jour le jour, pas après coup',
      text: 'Un relevé météo officiel a posteriori ne suffit pas toujours à convaincre un client — une trace datée de ce qui s’est réellement passé sur le chantier ce jour-là (photos, notes, absence d’équipe constatée) est bien plus solide.',
    },
    { type: 'h2', text: 'Prévenir plutôt que justifier après coup' },
    {
      type: 'p',
      text: 'La meilleure protection reste de communiquer le retard au client dès qu’il devient prévisible, avec une nouvelle date estimée — plutôt que de laisser le silence s’installer jusqu’à ce que le client s’impatiente et découvre le décalage seul. Un message daté, même informel, vaut souvent plus qu’une justification détaillée présentée après coup.',
    },
    {
      type: 'cta',
      title: 'Un fil de chantier daté et documenté',
      text: 'Le fil d’actualité de Cantia horodate chaque photo et chaque message du chantier — de quoi reconstituer précisément un enchaînement de jours d’arrêt si un retard doit être justifié.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un entrepreneur est-il responsable d’un retard causé par la météo ?',
      answer:
        'En principe non, tant que le retard reste raisonnable au regard des conditions rencontrées et qu’il a été correctement communiqué au client — mais cela doit pouvoir être documenté.',
    },
    {
      question: 'Faut-il prévenir le client d’un retard dès qu’il devient probable ?',
      answer:
        'Oui, c’est la meilleure protection : communiquer tôt, avec une nouvelle date estimée, plutôt que de laisser le client découvrir le décalage seul au moment de la livraison.',
    },
    {
      question: 'Un relevé météo officiel suffit-il à justifier un retard de chantier ?',
      answer:
        'Il aide, mais une trace datée de ce qui s’est réellement passé sur le chantier (photos, notes d’équipe) est souvent plus convaincante qu’une donnée météo générale a posteriori.',
    },
  ],
  relatedSlugs: [
    'gerer-plusieurs-chantiers-en-parallele-methode',
    'photos-chantier-preuve-juridique-litige',
    'avenant-chantier-plus-value-moins-value',
  ],
};
