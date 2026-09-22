import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'creer-entreprise-batiment-suisse-guide-complet',
  question: 'Comment créer une entreprise du bâtiment en Suisse, étape par étape ?',
  title: 'Créer une entreprise du bâtiment en Suisse : le guide complet',
  description:
    'Le parcours complet pour créer une entreprise du bâtiment en Suisse : statut juridique, immatriculation, budget réel, premiers outils, premiers clients et premier employé.',
  excerpt:
    'Statut juridique, immatriculation, budget réel, premiers outils, premiers clients, premier employé : le fil conducteur qui relie toutes les décisions de la première année, avec un lien vers chaque sujet en détail.',
  category: 'Juridique & normes',
  keywords: [
    'créer entreprise bâtiment suisse',
    'lancer entreprise construction suisse guide',
    'ouvrir entreprise artisan suisse étapes',
    'devenir indépendant bâtiment suisse',
    'guide création entreprise construction',
  ],
  publishedAt: '2026-09-18',
  readMinutes: 9,
  blocks: [
    {
      type: 'p',
      text: 'Créer une entreprise du bâtiment en Suisse tient en une poignée de décisions structurantes : quel statut juridique, comment s’immatriculer, combien ça coûte vraiment, avec quels outils démarrer, comment trouver les premiers clients, et à quel moment embaucher. Chacune mérite un vrai article de fond. Celui-ci sert de fil conducteur entre tous, dans l’ordre où ces questions se posent réellement sur le terrain.',
    },
    {
      type: 'callout',
      title: 'Un point commun à toute la trajectoire',
      text: 'Quel que soit le statut choisi, le budget de départ ou le rythme d’embauche, la façon de chiffrer un devis, facturer un client et suivre un chantier reste la même dès le premier jour. C’est le seul choix qui vaut la peine d’être fait correctement une fois pour toutes.',
    },
    { type: 'h2', text: '1. Choisir un statut juridique' },
    {
      type: 'p',
      text: 'Raison individuelle, Sàrl ou SA : la question se pose avant même le premier devis. Le bon choix dépend presque toujours d’un seul critère, le risque financier réel du métier exercé, bien plus que de l’ambition affichée pour l’entreprise.',
    },
    {
      type: 'linklist',
      title: 'À lire sur le statut juridique et les démarches',
      items: [
        { label: 'Raison individuelle, Sàrl ou SA : quel statut pour une entreprise du bâtiment', slug: 'raison-individuelle-sarl-sa-quel-statut-batiment' },
        { label: 'Comment immatriculer son entreprise au registre du commerce', slug: 'immatriculer-entreprise-construction-registre-commerce' },
        { label: 'AVS/AI pour un indépendant du bâtiment : comment ça marche', slug: 'avs-ai-independant-batiment' },
        { label: 'LPP pour un indépendant du bâtiment : obligatoire ou pas ?', slug: 'lpp-deuxieme-pilier-independant-batiment' },
        { label: 'Assurance RC professionnelle dans le bâtiment : obligatoire ?', slug: 'assurance-rc-professionnelle-batiment-obligatoire' },
      ],
    },
    { type: 'h2', text: '2. Budgéter le démarrage, au-delà des frais d’inscription' },
    {
      type: 'p',
      text: 'L’inscription elle-même coûte presque rien pour une raison individuelle. Le budget réel inclut aussi les assurances, l’outillage et surtout une réserve de trésorerie pour couvrir le délai, souvent deux à trois mois, entre le premier chantier signé et le premier encaissement réel.',
    },
    {
      type: 'linklist',
      title: 'À lire sur le budget et la trésorerie',
      items: [
        { label: 'Combien coûte réellement la création d’une entreprise de construction', slug: 'cout-creation-entreprise-construction-suisse' },
        { label: 'Prévisionnel de trésorerie pour une entreprise du bâtiment', slug: 'previsionnel-tresorerie-entreprise-batiment' },
        { label: 'Pourquoi des entreprises du bâtiment en pleine activité font faillite', slug: 'pourquoi-entreprises-batiment-font-faillite-suisse' },
      ],
    },
    { type: 'h2', text: '3. S’équiper des premiers outils, sans se disperser' },
    {
      type: 'p',
      text: 'Très peu d’outils sont vraiment indispensables dès le premier jour : un moyen de chiffrer et facturer conforme aux règles suisses (TVA, QR-facture), et un moyen simple de documenter les chantiers. Le reste — planning multi-équipe, module RH, rentabilité fine — peut s’activer progressivement, au rythme réel de la croissance.',
    },
    {
      type: 'linklist',
      title: 'À lire sur les premiers outils',
      items: [
        { label: 'Démarrer son entreprise du bâtiment : les outils réellement indispensables', slug: 'demarrer-entreprise-batiment-outils-indispensables' },
        { label: 'Quel logiciel choisir en démarrant son entreprise de construction', slug: 'quel-logiciel-choisir-demarrer-entreprise-construction' },
        { label: 'Checklist logiciels pour l’ouverture d’une société de construction', slug: 'checklist-logiciels-ouverture-societe-construction' },
        { label: 'QR-facture : comment ça marche et pourquoi c’est obligatoire', slug: 'qr-facture-obligatoire-2026' },
        { label: 'Lancer son entreprise du bâtiment en Suisse : par où commencer', slug: 'lancer-entreprise-batiment-suisse-par-ou-commencer' },
      ],
    },
    { type: 'h2', text: '4. Trouver et facturer les premiers clients' },
    {
      type: 'p',
      text: 'Les premiers clients viennent rarement d’une grande stratégie marketing : bouche-à-oreille, avis en ligne, vitesse de réponse à une demande de devis. Ce qui change tout, c’est la rapidité et le professionnalisme de cette toute première interaction.',
    },
    {
      type: 'linklist',
      title: 'À lire sur les premiers clients',
      items: [
        { label: 'Comment trouver ses premiers clients en tant qu’artisan du bâtiment', slug: 'trouver-clients-artisan-batiment-suisse' },
        { label: 'Faut-il un site internet quand on est artisan indépendant', slug: 'site-internet-artisan-batiment-utile' },
        { label: 'Vitesse de réponse à un devis et taux de conversion', slug: 'vitesse-reponse-devis-taux-conversion-batiment' },
        { label: 'Comment facturer ses premiers clients en début d’activité', slug: 'comment-facturer-premiers-clients-debut-activite' },
      ],
    },
    { type: 'h2', text: '5. Embaucher le premier employé' },
    {
      type: 'p',
      text: 'Dès la première embauche, les obligations changent : convention collective du bâtiment, assurance accidents obligatoire, salaire minimum sectoriel. Ce sont des règles précises, pas des zones grises, et mieux vaut les connaître avant de signer un premier contrat de travail plutôt qu’après.',
    },
    {
      type: 'linklist',
      title: 'À lire sur la première embauche',
      items: [
        { label: 'Salaire minimum et CCT dans la construction en Suisse', slug: 'salaire-minimum-cct-construction-suisse' },
        { label: 'Accident de travail sur chantier : obligations employeur et SUVA', slug: 'accident-travail-chantier-obligations-employeur-suva' },
        { label: 'Apprenti dans le bâtiment : salaire et obligations employeur', slug: 'apprenti-batiment-salaire-obligations-employeur' },
      ],
    },
    { type: 'h2', text: '6. Ne pas refaire les erreurs les plus fréquentes' },
    {
      type: 'p',
      text: 'Aucune de ces erreurs n’est spectaculaire prise isolément. C’est leur accumulation silencieuse, chantier après chantier, qui transforme une entreprise occupée en entreprise qui ne s’enrichit jamais vraiment.',
    },
    {
      type: 'linklist',
      title: 'À lire pour la suite',
      items: [
        { label: 'Les 10 erreurs à éviter la première année d’une entreprise du bâtiment', slug: 'dix-erreurs-premiere-annee-entreprise-batiment' },
        { label: 'Rentabilité : un chantier complet peut-il être en perte', slug: 'chantier-complet-peut-etre-en-perte-taux-horaire' },
      ],
    },
    {
      type: 'stat',
      value: '+40 entreprises',
      label: 'du bâtiment gèrent déjà leurs devis, factures et chantiers sur Cantia en Suisse',
    },
    {
      type: 'cta',
      title: 'Un seul outil pour tout ce parcours, dès le premier devis',
      text: 'Devis et factures conformes, QR-facture automatique, suivi de chantier et catalogue de prix : Cantia couvre l’essentiel dès le premier jour, et le reste s’active au fur et à mesure que l’entreprise grandit.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Par quelle étape commencer pour créer une entreprise du bâtiment en Suisse ?',
      answer:
        'Par le choix du statut juridique (raison individuelle, Sàrl ou SA), qui conditionne les démarches d’immatriculation suivantes et le niveau de risque financier personnel accepté.',
    },
    {
      question: 'Faut-il tout mettre en place avant le premier chantier ?',
      answer:
        'Non : le statut juridique, l’assurance RC professionnelle et un outil de devis/factures conforme sont indispensables dès le début, mais le reste (RH, planning multi-équipe, rentabilité fine) peut s’activer progressivement.',
    },
    {
      question: 'Combien de temps prend réellement la création d’une entreprise du bâtiment en Suisse ?',
      answer:
        'Une raison individuelle peut démarrer en quelques jours. Une Sàrl prend généralement une à trois semaines entre le rendez-vous notarial et l’inscription effective au registre du commerce.',
    },
  ],
  relatedSlugs: [
    'raison-individuelle-sarl-sa-quel-statut-batiment',
    'cout-creation-entreprise-construction-suisse',
    'demarrer-entreprise-batiment-outils-indispensables',
    'dix-erreurs-premiere-annee-entreprise-batiment',
  ],
};
