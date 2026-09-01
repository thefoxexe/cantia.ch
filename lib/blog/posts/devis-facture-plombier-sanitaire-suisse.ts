import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-plombier-sanitaire-suisse',
  question: 'Comment un plombier-sanitaire doit-il chiffrer un devis et gérer les urgences non prévues ?',
  title: 'Plombier-sanitaire : chiffrer juste entre devis planifié et urgence non prévue',
  description:
    'Entre un devis de salle de bain complète et un dépannage de fuite un dimanche soir, le plombier-sanitaire jongle avec deux logiques de facturation opposées. Comment structurer les deux sans y perdre.',
  excerpt:
    'Un devis de rénovation sanitaire se prépare tranquillement. Un dépannage se facture dans l’urgence, souvent sans avoir eu le temps d’écrire quoi que ce soit avant d’intervenir. Les deux logiques doivent pourtant vivre dans le même outil.',
  category: 'Métiers du bâtiment',
  keywords: ['devis plombier sanitaire', 'facturation plomberie Suisse', 'tarif dépannage plombier', 'logiciel gestion plomberie', 'devis salle de bain rénovation'],
  publishedAt: '2026-09-01',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La plomberie-sanitaire couvre deux réalités très différentes : le chantier planifié (rénovation de salle de bain, remplacement de chauffe-eau, raccordement neuf) qui se chiffre au calme avant intervention, et le dépannage (fuite, canalisation bouchée, panne de chauffage) qui se facture après coup, souvent en dehors des heures normales. Confondre les deux dans un seul barème finit toujours par pénaliser l’un des deux cas.',
    },
    { type: 'h2', text: 'Le devis planifié : détailler pour éviter la contestation' },
    {
      type: 'list',
      items: [
        'Dépose de l’installation existante et évacuation (souvent oubliée, pourtant chronophage)',
        'Fourniture du matériel sanitaire (sanitaires, robinetterie, tuyauterie), séparée de la pose',
        'Raccordements et étanchéité, avec un forfait clair par point d’eau',
        'Mise en service et tests de fonctionnement avant réception',
      ],
    },
    { type: 'h2', text: 'Le dépannage : un tarif clair annoncé avant d’intervenir' },
    {
      type: 'p',
      text: 'Sur une urgence, le client accepte rarement de négocier un prix pendant que l’eau continue de couler. La meilleure protection, pour le plombier comme pour le client, reste un tarif de dépannage annoncé clairement à l’avance (déplacement, tarif horaire, majoration soir/week-end si applicable), pour que la facture envoyée après coup ne soit jamais une surprise.',
    },
    {
      type: 'stat',
      value: '2x',
      label: 'majoration courante appliquée sur les interventions de dépannage en soirée, week-end ou jour férié par rapport au tarif standard en journée',
    },
    {
      type: 'callout',
      title: 'Un dépannage non facturé sur le moment doit l’être vite après',
      text: 'Une intervention d’urgence réalisée sans facture immédiate se facture d’autant mieux qu’elle est envoyée rapidement : le client se souvient encore clairement de l’intervention, et l’acceptation du prix est plus naturelle que des semaines plus tard.',
    },
    {
      type: 'cta',
      title: 'Une facture envoyée depuis le chantier, dépannage compris',
      text: 'Avec Cantia, une intervention de dépannage devient une facture en quelques minutes depuis le téléphone, sans besoin de revenir au bureau ni de laisser traîner une urgence facturée trois semaines plus tard.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment différencier le tarif d’un devis planifié et d’un dépannage en plomberie ?',
      answer:
        'En appliquant deux logiques distinctes : un devis détaillé poste par poste pour les chantiers planifiés, et un tarif de dépannage annoncé clairement avant intervention (déplacement, taux horaire, majoration éventuelle) pour les urgences.',
    },
    {
      question: 'Peut-on facturer un dépannage plus cher le soir ou le week-end ?',
      answer:
        'Oui, c’est une pratique courante et légitime dans le secteur, à condition que la majoration soit annoncée avant l’intervention plutôt que découverte sur la facture.',
    },
    {
      question: 'Faut-il séparer la fourniture du matériel sanitaire et la pose sur le devis ?',
      answer:
        'C’est recommandé : cela permet au client de comprendre la répartition du prix et facilite les ajustements si le matériel choisi change en cours de projet.',
    },
  ],
  relatedSlugs: [
    'facturer-acompte-suisse-securiser-solde',
    'relancer-client-facture-impayee-sans-perdre-client',
    'application-hors-ligne-chantier-pourquoi-important',
  ],
  relatedTradeSlug: 'plombier',
};
