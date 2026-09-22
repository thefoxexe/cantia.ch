import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'directive-suva-echafaudage-chantier-obligation',
  question: 'Que faut-il respecter selon la directive SUVA pour un échafaudage de chantier ?',
  title: 'Échafaudages de chantier : ce que la directive SUVA impose vraiment',
  description:
    'Garde-corps, ancrages, contrôle avant mise en service, formation des utilisateurs : ce que la directive SUVA exige concrètement pour un échafaudage de chantier en Suisse.',
  excerpt:
    'Un échafaudage mal monté reste l’une des causes d’accident les plus fréquentes sur un chantier suisse. La SUVA a des exigences précises, et un contrôle qui tourne mal peut arrêter le chantier net.',
  category: 'Juridique & normes',
  keywords: [
    'directive suva échafaudage',
    'sécurité échafaudage chantier suisse',
    'contrôle échafaudage suva',
    'formation échafaudage obligatoire',
    'garde-corps échafaudage norme',
  ],
  publishedAt: '2026-09-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'L’échafaudage reste l’un des équipements les plus banalisés d’un chantier, et pourtant l’un des plus surveillés par la SUVA, parce que les chutes de hauteur figurent parmi les accidents les plus graves du secteur de la construction. La directive SUVA fixe des principes concrets, pas seulement des recommandations générales, et leur non-respect peut aller jusqu’à l’arrêt du chantier.',
    },
    { type: 'h2', text: 'Les principes de base que la directive impose' },
    {
      type: 'list',
      items: [
        'Des garde-corps sur chaque niveau de travail, avec une lisse supérieure, une lisse intermédiaire et une plinthe, pour empêcher aussi bien la chute d’une personne que celle d’un objet.',
        'Des ancrages suffisants et vérifiés à la structure du bâtiment, pour garantir la stabilité de l’échafaudage face au vent et aux charges d’utilisation.',
        'Un contrôle de l’échafaudage avant sa première mise en service, puis à intervalles réguliers pendant toute la durée du chantier, notamment après un épisode de vent fort ou une intervention sur la structure.',
        'Une signalétique claire indiquant si l’échafaudage est autorisé à l’usage ou non, visible par toute personne qui pourrait y accéder, y compris en dehors des heures de chantier.',
      ],
    },
    { type: 'h2', text: 'La formation, un point souvent négligé' },
    {
      type: 'p',
      text: 'La directive attend que les personnes qui montent, démontent ou modifient un échafaudage aient reçu une formation adaptée à ce type de travail, pas seulement une expérience générale de chantier. Ce n’est pas une simple formalité : le montage d’un échafaudage engage la sécurité de toutes les personnes qui l’utiliseront ensuite, souvent des corps de métier différents de celui qui l’a monté.',
    },
    { type: 'h2', text: 'Ce que risque un chantier en cas de manquement' },
    {
      type: 'p',
      text: 'Lors d’un contrôle, un inspecteur SUVA constatant un échafaudage non conforme (garde-corps manquant, ancrage insuffisant, absence de contrôle documenté) peut exiger une mise en conformité immédiate, voire suspendre l’utilisation de l’échafaudage jusqu’à correction. Au-delà de l’arrêt de chantier, c’est la responsabilité de l’entreprise qui a mis l’échafaudage à disposition qui peut être engagée en cas d’accident.',
    },
    {
      type: 'callout',
      title: 'Le contrôle après le montage compte autant que le montage lui-même',
      text: 'Un échafaudage correctement monté au départ peut devenir dangereux après quelques semaines de chantier : ancrages desserrés, éléments déplacés, garde-corps retirés temporairement puis oubliés. Un contrôle régulier documenté, pas seulement au montage, est ce que la directive SUVA attend réellement.',
    },
    {
      type: 'cta',
      title: 'La sécurité de chantier, suivie comme le reste du dossier',
      text: 'Cantia permet de garder une trace des contrôles et des vérifications réalisées sur un chantier, pour retrouver facilement qui a vérifié quoi et quand, y compris pour un point aussi sensible que l’échafaudage.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Qui est responsable si un échafaudage loué s’avère non conforme ?',
      answer:
        'La responsabilité se partage généralement entre le loueur, qui doit fournir un matériel conforme, et l’entreprise qui l’installe et l’utilise, qui doit vérifier sa conformité avant la mise en service. Le contrat de location précise en principe cette répartition.',
    },
    {
      question: 'Faut-il contrôler un échafaudage même s’il n’a pas été touché depuis le montage ?',
      answer:
        'Oui, un contrôle régulier reste recommandé même sans intervention apparente, notamment après un épisode de vent fort, car des éléments peuvent se desserrer sans signe visible immédiat.',
    },
    {
      question: 'La formation à l’échafaudage est-elle obligatoire pour toute l’équipe de chantier ?',
      answer:
        'Elle est surtout exigée pour les personnes qui montent, démontent ou modifient l’échafaudage. Les personnes qui l’utilisent simplement comme poste de travail doivent en revanche être informées des consignes de sécurité de base.',
    },
  ],
  relatedSlugs: [
    'accident-travail-chantier-obligations-employeur-suva',
    'assurance-chantier-tous-risques-ectr-obligatoire',
    'diagnostic-amiante-renovation-obligatoire-suisse',
  ],
};
