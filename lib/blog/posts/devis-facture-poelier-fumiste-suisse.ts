import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-poelier-fumiste-suisse',
  question: 'Comment établir devis et factures en tant que poêlier-fumiste en Suisse ?',
  title: 'Devis et facturation pour un poêlier-fumiste en Suisse',
  description:
    'Comment chiffrer un devis et facturer en tant que poêlier-fumiste en Suisse : matériel, main-d’œuvre, contrôle du ramoneur officiel, saisonnalité d’automne.',
  excerpt:
    'Poêle, cheminée, conduit de fumée : un métier de niche où le devis engage la sécurité du client, et où la saison compresse l’essentiel de l’activité sur quelques mois.',
  category: 'Métiers du bâtiment',
  keywords: [
    'devis poêlier fumiste suisse',
    'facturation poêle à bois',
    'installation cheminée prix',
    'conduit de fumée devis',
  ],
  publishedAt: '2026-10-02',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le poêlier-fumiste occupe un métier de niche, à la croisée de la maçonnerie et du chauffage, où chaque installation touche directement à la sécurité incendie du bâtiment. Le devis doit refléter cette exigence, et pas seulement le prix du poêle choisi en showroom.',
    },
    { type: 'h2', text: 'Trois postes à chiffrer séparément' },
    {
      type: 'list',
      items: [
        'Le matériel : poêle, insert ou cheminée, souvent choisi par le client sur catalogue, avec des écarts de prix importants selon la marque et la puissance',
        'La main-d’œuvre d’installation : pose du conduit de fumée, raccordement, protections incendie autour de l’appareil',
        'Le contrôle obligatoire après installation, effectué par le ramoneur officiel du secteur, dont le résultat conditionne la mise en service',
      ],
    },
    { type: 'h2', text: 'Le contrôle du ramoneur n’est pas une option à oublier' },
    {
      type: 'p',
      text: 'Une installation de poêle ou de cheminée doit être contrôlée par le ramoneur officiel compétent pour le secteur avant ou après la mise en service, selon les pratiques cantonales. Ce contrôle n’est pas du ressort du poêlier-fumiste, mais son devis doit prévoir cette étape dans le planning et informer le client qu’elle conditionne l’usage légal de l’installation. L’oublier crée des tensions en fin de chantier, quand le client veut allumer son poêle avant que le contrôle ait eu lieu.',
    },
    { type: 'h2', text: 'Une activité concentrée sur l’automne' },
    {
      type: 'p',
      text: 'La demande explose dès les premiers frimas, quand les clients réalisent que leur poêle actuel ne suffira pas pour l’hiver. Un poêlier-fumiste qui ne pilote pas son carnet de commandes en amont se retrouve avec des délais d’installation qui dépassent le début de la saison de chauffe, ce qui est la principale source de mécontentement client dans ce métier.',
    },
    {
      type: 'callout',
      title: 'Un devis signé en été évite la queue d’automne',
      text: 'Proposer une réduction ou une priorité de planning pour les devis signés avant fin août permet de lisser la charge de travail et d’éviter de livrer des poêles en plein hiver, quand le matériel est aussi plus difficile à approvisionner.',
    },
    {
      type: 'cta',
      title: 'Planifiez la haute saison sans la subir',
      text: 'Cantia centralise vos devis, votre planning de pose et vos factures, pour garder une vue claire sur votre charge de travail avant que l’automne n’arrive.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Qui contrôle une installation de poêle ou de cheminée après la pose ?',
      answer:
        'Le ramoneur officiel attribué au secteur, selon les règles cantonales. Ce contrôle est distinct de l’installation elle-même et doit être planifié avec le client dès le devis.',
    },
    {
      question: 'Pourquoi les prix des poêles varient-ils autant d’un devis à l’autre ?',
      answer:
        'Le matériel est le poste le plus variable : puissance, matériaux, marque et finitions changent fortement le prix d’achat, indépendamment du coût de la pose qui reste plus stable.',
    },
    {
      question: 'Comment gérer le pic de demande à l’automne ?',
      answer:
        'En incitant les clients à signer leur devis en amont, idéalement avant l’été, pour lisser le planning de pose et sécuriser l’approvisionnement du matériel avant la période de forte demande.',
    },
  ],
  relatedSlugs: [
    'devis-facture-ramoneur-suisse',
    'devis-facture-chauffagiste-cvc-suisse',
    'checklist-ouverture-chantier-artisan',
    'previsionnel-tresorerie-entreprise-batiment',
  ],
};
