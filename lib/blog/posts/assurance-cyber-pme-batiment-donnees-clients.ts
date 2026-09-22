import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-cyber-pme-batiment-donnees-clients',
  question: 'Une PME du bâtiment a-t-elle besoin d’une assurance cyber ?',
  title: 'Assurance cyber pour une PME du bâtiment : pourquoi y penser',
  description:
    'Pourquoi une petite entreprise du bâtiment n’est pas à l’abri d’un incident numérique, ce que couvre en général une assurance cyber, et pourquoi les bonnes pratiques restent la première ligne de défense.',
  excerpt:
    'Un logiciel qui refuse de s’ouvrir un lundi matin, avec les devis et les factures en cours bloqués dedans : ce n’est pas un risque réservé aux grandes entreprises.',
  category: 'Juridique & normes',
  keywords: [
    'assurance cyber pme batiment',
    'cybersecurite entreprise construction suisse',
    'rancongiciel entreprise batiment',
  ],
  publishedAt: '2026-10-06',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'On imagine spontanément le risque cyber réservé aux grandes entreprises et aux banques. Dans le bâtiment, pourtant, une PME gère des données clients, des factures, des plans de chantier et parfois des accès bancaires, souvent depuis des ordinateurs et des téléphones peu protégés. La cible est moins glamour, mais tout aussi accessible.',
    },
    { type: 'h2', text: 'Pourquoi une petite entreprise du bâtiment n’est pas à l’abri' },
    {
      type: 'list',
      items: [
        'Les données clients, adresses, montants de devis, coordonnées bancaires, ont une valeur pour un attaquant, même en petit volume.',
        'Les plans, devis et factures stockés numériquement sont souvent le seul exemplaire existant du travail administratif de l’entreprise.',
        'Un rançongiciel qui bloque l’accès à ces fichiers peut arrêter net la facturation et le suivi de chantier, pas seulement l’informatique.',
        'Les petites structures ont rarement un service informatique dédié pour détecter et réagir rapidement à une intrusion.',
      ],
    },
    { type: 'h2', text: 'Ce qu’une assurance cyber couvre en général' },
    {
      type: 'p',
      text: 'Une assurance cyber pour PME couvre généralement les frais de remédiation après un incident : intervention d’un spécialiste pour restaurer l’accès aux données, frais liés à une éventuelle obligation de notification en cas de fuite de données personnelles, et parfois une indemnisation pour la perte d’exploitation liée directement à l’incident, le temps que l’activité redémarre normalement. Les conditions exactes varient fortement d’un assureur à l’autre, ce qui rend la comparaison des offres indispensable avant de choisir.',
    },
    {
      type: 'stat',
      value: '1er réflexe',
      label: 'avant toute assurance cyber : vérifier que les sauvegardes de l’entreprise sont automatiques, régulières et testées',
    },
    {
      type: 'callout',
      title: 'L’assurance ne remplace jamais les bonnes pratiques',
      text: 'Une entreprise sans sauvegarde régulière et sans mots de passe robustes reste vulnérable, assurance ou pas. L’assurance cyber paie les conséquences d’un incident, elle ne l’empêche pas de se produire. La première ligne de défense reste toujours l’hygiène numérique de base.',
    },
    {
      type: 'cta',
      title: 'Vos devis et factures, hébergés et sauvegardés sérieusement',
      text: 'Garder ses documents dans un outil professionnel plutôt que dans des fichiers dispersés sur un poste local réduit déjà une bonne partie du risque. Cantia héberge vos devis, factures et données de chantier de façon sécurisée.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Une entreprise de quelques employés est-elle vraiment une cible ?',
      answer:
        'Oui, les attaques automatisées ne ciblent pas la taille de l’entreprise mais les failles trouvées. Une petite structure avec des accès mal protégés est souvent plus facile à atteindre qu’une grande entreprise mieux équipée.',
    },
    {
      question: 'L’assurance cyber couvre-t-elle la rançon elle-même en cas de rançongiciel ?',
      answer:
        'Cela dépend entièrement du contrat et de l’assureur, et c’est un point à clarifier explicitement avant de signer. Certains contrats excluent le paiement de rançon, d’autres le couvrent sous conditions strictes.',
    },
    {
      question: 'Quelles bonnes pratiques réduisent le plus le risque au quotidien ?',
      answer:
        'Des sauvegardes automatiques régulières, des mots de passe différents et robustes par accès, et la méfiance envers les emails inattendus avec pièce jointe ou lien restent les mesures les plus efficaces, avant même de penser à une assurance.',
    },
  ],
  relatedSlugs: [
    'assurance-protection-juridique-entreprise-batiment',
    'assurance-perte-exploitation-chantier-arrete',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
