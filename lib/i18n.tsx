import { useTranslation } from './translations';

// nav/footer/pricing are shared with components/MarketingChrome.tsx (the
// nav/footer used by every other marketing page) and components/PricingSection.tsx
// (reused as-is on the homepage below) — never rename or remove a field
// those two files read. Every other section below is homepage-only content,
// reshaped in September 2026 to match the "Cantia_Landing" reference package
// (crème/terracotta Swiss-craft design, DM Sans, six-case story carousel):
// only app/index.tsx reads them, so they're free to change shape.
interface StoryCase {
  id: string;
  tab: string;
  context: string;
  question: string;
  responseTitle: string;
  responseText: string;
  steps: string[];
  linkLabel: string;
  linkSlug: string;
  concreteLabel: string;
  concreteText: string;
}

interface CatalogItem {
  title: string;
  text: string;
}

interface CatalogGroup {
  title: string;
  subtitle: string;
  items: CatalogItem[];
  linkLabel: string;
  linkSlug: string;
}

interface TeamRole {
  number: string;
  title: string;
  text: string;
  tags: string[];
}

interface VoiceExample {
  text: string;
  result: string;
}

interface Dict {
  landingNav: {
    features: string;
    pricing: string;
    help: string;
    contact: string;
    login: string;
    signup: string;
    mobileApp: string;
  };
  hero: {
    kicker: string;
    // Rendered as "{titlePrefix}\n{titleHighlight} {crossedText}" with the
    // hand-drawn red strike over crossedText only.
    titlePrefix: string;
    titleHighlight: string;
    crossedText: string;
    lede: string;
    cta: string;
    secondaryCta: string;
    facts: string[];
    trustCount: string;
    // The drawing title block ("cartouche") under the hero.
    cartouche: { label: string; value: string }[];
  };
  trust: {
    locationLabel: string;
    title: string;
    text: string;
    cards: { label: string; title: string; text: string }[];
    contactCta: string;
  };
  profession: {
    eyebrow: string;
    title: string;
    text: string;
    links: { label: string; slug: string }[];
    allLink: string;
    personalTitle: string;
    items: { title: string; text: string }[];
  };
  stories: {
    title: string;
    subtitle: string;
    cases: StoryCase[];
    exploreLabel: string;
    hint: string;
    respondLabel: string;
    prevLabel: string;
    nextLabel: string;
    pauseLabel: string;
    playLabel: string;
  };
  catalog: {
    title: string;
    subtitle: string;
    groups: CatalogGroup[];
    planNote: string;
    comparePlans: string;
    columns: { ref: string; usage: string; content: string };
  };
  team: {
    eyebrow: string;
    titlePrefix: string;
    titleEm: string;
    text: string;
    roles: TeamRole[];
    permTitle: string;
    permText: string;
    permNote: string;
    permLink: string;
  };
  automation: {
    eyebrow: string;
    title: string;
    text: string;
    tag: string;
    commandTitle: string;
    commandText: string;
    link: string;
    tryLabel: string;
    choices: { site: string; quote: string; invoice: string };
    examples: { site: VoiceExample; quote: VoiceExample; invoice: VoiceExample };
    resultLabel: string;
    resultNote: string;
    note: string;
    animateLabel: string;
    animatingLabel: string;
  };
  terrain: {
    eyebrow: string;
    title: string;
    text: string;
    points: { label: string; text: string }[];
    installCta: string;
    installNote: string;
  };
  tailored: {
    eyebrow: string;
    title: string;
    text: string;
    cta: string;
    steps: { num: string; title: string; text: string }[];
    link: string;
  };
  bexio: { eyebrow: string; title: string; text: string; link: string };
  fiduciary: { badge: string; title: string; text: string; link: string };
  products: { eyebrow: string; title: string; items: { name: string; tag: string; text: string; cta: string }[] };
  docCustomization: {
    eyebrow: string;
    title: string;
    text: string;
    points: { title: string; text: string }[];
    link: string;
  };
  // Real exports from the app's own PDF generators (sample data), shown
  // annotated — see components/landing/DocumentShowcase.tsx.
  documents: {
    eyebrow: string;
    title: string;
    intro: string;
    hint: string;
    docs: {
      id: 'facture' | 'devis' | 'rapport' | 'salaire';
      tab: string;
      alt: string;
      points: { title: string; text: string }[];
      link: string;
      linkSlug: string;
    }[];
  };
  faq: { eyebrow: string; title: string; link: string; items: { q: string; a: string }[] };
  closing: { eyebrow: string; titlePrefix: string; titleEm: string; text: string; cta: string; contact: string };
  pricing: {
    title: string;
    subtitle: string;
    monthly: string;
    yearly: string;
    yearlySavings: string;
    billedYearly: string;
    storageSuffix: string;
    memberSingular: string;
    memberPlural: string;
    unlimited: string;
    badge: string;
    paidCta: string;
  };
  footer: {
    blurb: string;
    platformTitle: string;
    platformDevis: string;
    platformFactures: string;
    platformChantiers: string;
    platformRh: string;
    platformRentabilite: string;
    discoverTitle: string;
    discoverFeatures: string;
    discoverPricing: string;
    discoverMetier: string;
    discoverIntegrations: string;
    discoverSurMesure: string;
    resourcesTitle: string;
    resourcesHelp: string;
    resourcesMobile: string;
    resourcesBlog: string;
    resourcesContact: string;
    resourcesLogin: string;
    legalLink: string;
    statusLink: string;
    partnersLink: string;
    fiduciaryLink: string;
    productsTitle: string;
    productsApp: string;
    privacyLink: string;
    cgvLink: string;
    copyright: string;
  };
}

const fr: Dict = {
  landingNav: {
    features: 'Fonctionnalités',
    pricing: 'Tarifs',
    help: 'Aide',
    contact: 'Contact',
    login: 'Connexion',
    signup: 'Inscription',
    mobileApp: 'Application mobile',
  },
  hero: {
    kicker: 'Logiciel de chantier pour les entreprises du bâtiment suisse',
    titlePrefix: 'Gérez vos chantiers,',
    titleHighlight: 'pas votre',
    crossedText: 'administratif.',
    lede: 'Devis, factures QR, rapports de chantier, planning et salaires dans un seul outil. Votre équipe renseigne le terrain depuis son téléphone, vous retrouvez tout au bureau.',
    cta: 'Essayer 14 jours',
    secondaryCta: 'Voir les tarifs',
    facts: ['Dès CHF 39.– par mois', '14 jours d’essai, sans engagement', 'Données hébergées à Zurich'],
    trustCount: '+{{count}} entreprises du bâtiment nous font déjà confiance',
    cartouche: [
      { label: 'Objet', value: 'Logiciel de gestion de chantier' },
      { label: 'Pour', value: 'Entreprises de 1 à 25 personnes' },
      { label: 'Langues', value: 'Français, Deutsch, Italiano' },
      { label: 'Hébergement', value: 'Zurich, Suisse' },
    ],
  },
  trust: {
    locationLabel: 'Conçu et hébergé en Suisse',
    title: 'Suisse, du serveur à la facture QR.',
    text: 'Vos données restent en Suisse, vos factures suivent les règles suisses, et quand vous appelez, quelqu’un vous répond.',
    cards: [
      { label: 'Facturation suisse', title: 'Des factures QR conformes, en francs suisses', text: 'QR-factures, TVA et acomptes : les outils pour facturer vos clients en Suisse.' },
      { label: 'Votre façon de travailler', title: 'Vos prestations et vos prix, pas les nôtres', text: 'Retrouvez vos prestations habituelles et envoyez des documents à votre image.' },
      { label: 'Un contact direct', title: 'Un contact direct, par téléphone ou e-mail', text: 'Contactez-nous par téléphone ou par e-mail pour vos questions et vos besoins.' },
    ],
    contactCta: 'Contacter Cantia',
  },
  profession: {
    eyebrow: 'Votre métier a ses habitudes',
    title: 'Adapté à votre corps de métier',
    text: 'Un charpentier ne prépare pas ses chantiers comme un peintre. Cantia s’adapte à votre corps de métier, avec des modèles et des documents que vous pouvez personnaliser.',
    links: [
      { label: 'Charpente', slug: 'charpentier' },
      { label: 'Maçonnerie', slug: 'macon' },
      { label: 'Peinture', slug: 'peintre' },
      { label: 'Électricité', slug: 'electricien' },
      { label: 'Menuiserie', slug: 'menuisier' },
      { label: 'Génie civil', slug: 'genie-civil' },
    ],
    allLink: 'Découvrir tous les métiers',
    personalTitle: 'Réglé comme vous travaillez',
    items: [
      { title: 'Vos prestations', text: 'Votre catalogue, vos prix et vos trames de devis suivent votre façon de chiffrer.' },
      { title: 'Votre identité', text: 'Votre logo et vos couleurs accompagnent les documents envoyés aux clients.' },
      { title: 'Votre organisation', text: 'Vous adaptez les accès aux responsabilités de chaque membre de l’équipe.' },
    ],
  },
  stories: {
    title: 'Six situations que vous connaissez',
    subtitle: 'Les imprévus font partie du métier. L’administratif ne devrait pas les compliquer.',
    exploreLabel: 'Explorer toutes les fonctionnalités',
    hint: 'Cliquez sur une situation ou utilisez les flèches pour passer à la suivante.',
    respondLabel: 'Cantia répond',
    prevLabel: 'Situation précédente',
    nextLabel: 'Situation suivante',
    pauseLabel: 'Mettre en pause',
    playLabel: 'Lire',
    cases: [
      {
        id: 'devis',
        tab: 'Devis',
        context: 'Devis & offres',
        question: 'Encore des devis\naprès le chantier ?',
        responseTitle: 'Le devis avance pendant la visite.',
        responseText: 'Dictez ou saisissez vos prestations. Cantia reprend votre catalogue pour préparer une offre que vous vérifiez avant de l’envoyer.',
        steps: ['Dicter ou saisir', 'Ajuster', 'Envoyer'],
        linkLabel: 'Découvrir les devis',
        linkSlug: 'devis',
        concreteLabel: 'Sur le terrain',
        concreteText: '« 12 m² de parquet en chêne, avec préparation du support et pose. »',
      },
      {
        id: 'chantier',
        tab: 'Chantiers',
        context: 'Suivi de chantier',
        question: 'Où est le plan ?\nEt la dernière photo ?',
        responseTitle: 'Plans, photos et messages restent dans le chantier.',
        responseText: 'Plans, messages et photos restent liés au projet. Vos notes du terrain peuvent ensuite alimenter un rapport à relire et partager.',
        steps: ['Documenter', 'Rassembler', 'Partager'],
        linkLabel: 'Découvrir le suivi et les rapports',
        linkSlug: 'rapports-chantier',
        concreteLabel: 'Sur le terrain',
        concreteText: '« Le support est humide derrière la cloison. J’ajoute les photos au chantier. »',
      },
      {
        id: 'extras',
        tab: 'Suppléments',
        context: 'Travaux supplémentaires',
        question: '« Tant que\nvous y êtes… »',
        responseTitle: 'Le supplément est signé avant d’être réalisé.',
        responseText: 'Chiffrez le supplément et faites-le signer en ligne. Après acceptation, Cantia génère une facture dédiée.',
        steps: ['Chiffrer', 'Faire signer', 'Facturer'],
        linkLabel: 'Découvrir les travaux supplémentaires',
        linkSlug: 'travaux-supplementaires',
        concreteLabel: 'Sur le terrain',
        concreteText: '« Vous pourriez aussi repeindre la porte du garage ? »',
      },
      {
        id: 'equipe',
        tab: 'Équipes',
        context: 'Équipes, heures & salaires',
        question: 'Qui a fait quoi,\net combien d’heures ?',
        responseTitle: 'Chacun saisit ses heures, le bureau les retrouve.',
        responseText: 'Les employés saisissent leurs heures et frais par chantier. Les personnes autorisées retrouvent les données pour le suivi et les salaires.',
        steps: ['Planifier', 'Saisir', 'Exploiter'],
        linkLabel: 'Découvrir les heures et les salaires',
        linkSlug: 'rh-salaires',
        concreteLabel: 'Sur le terrain',
        concreteText: '« 4 h à la Villa des Vignes, 3 h à la Résidence du Parc et 18 km de déplacement. »',
      },
      {
        id: 'paiements',
        tab: 'Factures',
        context: 'Facturation & encaissements',
        question: 'Facturé,\nmais encaissé ?',
        responseTitle: 'Chaque versement est rattaché à sa facture.',
        responseText: 'Créez une QR-facture, demandez un acompte et enregistrez les paiements. Le solde restant suit les versements reçus.',
        steps: ['Facturer', 'Enregistrer le paiement', 'Suivre le solde'],
        linkLabel: 'Découvrir la facturation',
        linkSlug: 'facturation',
        concreteLabel: 'Sur le terrain',
        concreteText: '« Sur cette facture de CHF 6’000, le client a déjà versé CHF 2’000. »',
      },
      {
        id: 'pilotage',
        tab: 'Rentabilité',
        context: 'Rentabilité & trésorerie',
        question: 'Beaucoup de travail,\nmais quelle marge ?',
        responseTitle: 'Voyez ce que chaque chantier vous rapporte.',
        responseText: 'Comparez le devis aux dépenses et au coût de main-d’œuvre. Anticipez aussi les encaissements et les charges avec la trésorerie à 90 jours.',
        steps: ['Rassembler les coûts', 'Comparer', 'Décider'],
        linkLabel: 'Découvrir la rentabilité',
        linkSlug: 'rentabilite',
        concreteLabel: 'Sur le terrain',
        concreteText: '« On a passé plus d’heures que prévu. Qu’est-ce que ça change pour ce chantier ? »',
      },
    ],
  },
  catalog: {
    title: 'Toutes les fonctions, classées par usage',
    subtitle: 'Chaque ligne renvoie à sa page détaillée.',
    columns: { ref: 'Page', usage: 'Usage', content: 'Ce qui est inclus' },
    planNote: 'Les modules et les droits disponibles dépendent de votre formule.',
    comparePlans: 'Comparer les offres',
    groups: [
      {
        title: 'Préparer une offre',
        subtitle: 'Du premier contact au devis accepté.',
        linkLabel: 'Explorer cet usage',
        linkSlug: 'devis',
        items: [
          { title: 'Clients', text: 'Retrouvez les coordonnées du client et réutilisez-les dans vos documents.' },
          { title: 'Catalogue de prestations', text: 'Mémorisez descriptions, prix et unités ; repérez les écarts de prix.' },
          { title: 'Trames de devis', text: 'Repartez de vos prestations habituelles et adaptez les quantités.' },
          { title: 'Métrés', text: 'Détaillez les quantités nécessaires au chiffrage.' },
          { title: 'Devis et signature', text: 'Préparez le PDF, partagez-le et suivez son statut jusqu’à l’acceptation.' },
        ],
      },
      {
        title: 'Facturer et suivre les paiements',
        subtitle: 'De l’acompte au solde du chantier.',
        linkLabel: 'Explorer cet usage',
        linkSlug: 'facturation',
        items: [
          { title: 'Conversion du devis', text: 'Reprenez les lignes acceptées dans la facture, sans les retaper.' },
          { title: 'QR-factures suisses', text: 'Générez le bulletin QR avec votre IBAN et la référence de paiement.' },
          { title: 'Acomptes', text: 'Facturez une partie du devis et retrouvez la déduction sur la facture finale.' },
          { title: 'Versements et échéances', text: 'Enregistrez les paiements partiels, consultez les soldes et rapprochez les références.' },
          { title: 'Travaux supplémentaires', text: 'Chiffrez un extra, faites-le signer et retrouvez sa facture après acceptation.' },
        ],
      },
      {
        title: 'Documenter le chantier',
        subtitle: 'Ce que l’équipe voit, dit et réalise.',
        linkLabel: 'Explorer cet usage',
        linkSlug: 'rapports-chantier',
        items: [
          { title: 'Fil d’équipe', text: 'Échangez des messages et des notes vocales dans le chantier.' },
          { title: 'Plans et documents', text: 'Rangez les fichiers dans des dossiers et sous-dossiers.' },
          { title: 'Photos et localisation', text: 'Conservez les photos, leur horodatage et leur position géographique.' },
          { title: 'Rapports', text: 'Rassemblez notes et photos dans un rapport à relire, signer et exporter.' },
          { title: 'Sous-traitants', text: 'Retrouvez les entreprises intervenantes et leurs documents dans le projet.' },
        ],
      },
      {
        title: 'Travailler en équipe',
        subtitle: 'Le terrain et le bureau, avec les bons accès.',
        linkLabel: 'Explorer cet usage',
        linkSlug: 'rh-salaires',
        items: [
          { title: 'Planning partagé', text: 'Affectez les membres aux chantiers et consultez la semaine depuis le téléphone.' },
          { title: 'Heures et exports', text: 'Saisissez les heures par jour et chantier ; exportez les feuilles en CSV.' },
          { title: 'Frais professionnels', text: 'Suivez les déplacements et les autres frais liés aux employés.' },
          { title: 'Profils et salaires', text: 'Renseignez salaire fixe ou taux horaire et cotisations pour les calculs brut/net.' },
          { title: 'Rôles et permissions', text: 'Définissez les modules accessibles ; limitez l’accès aux informations sensibles.' },
        ],
      },
      {
        title: 'Piloter les coûts',
        subtitle: 'Les données du chantier au service des décisions.',
        linkLabel: 'Explorer cet usage',
        linkSlug: 'tresorerie',
        items: [
          { title: 'Dépenses', text: 'Retrouvez les achats des chantiers et les dépenses générales.' },
          { title: 'Saisie par photo ou voix', text: 'Préparez une dépense à partir d’un justificatif ou d’une dictée, puis vérifiez-la.' },
          { title: 'Rentabilité', text: 'Comparez le devis accepté aux coûts du matériel et de la main-d’œuvre.' },
          { title: 'Trésorerie à 90 jours', text: 'Projetez les encaissements et décaissements depuis votre solde renseigné manuellement.' },
          { title: 'Charges récurrentes', text: 'Suivez abonnements, loyers et autres échéances, avec rappels.' },
        ],
      },
      {
        title: 'Adapter Cantia à votre entreprise',
        subtitle: 'Votre métier, vos documents, votre organisation.',
        linkLabel: 'Parler de votre besoin',
        linkSlug: 'sur-mesure',
        items: [
          { title: 'Dictée et assistant', text: 'Dictez les messages et documents ou interrogez les données de votre entreprise.' },
          { title: 'Documents personnalisés', text: 'Appliquez le logo, les couleurs et l’identité de votre entreprise.' },
          { title: 'Ordinateur et mobile', text: 'Retrouvez Cantia au bureau et sur le terrain.' },
          { title: 'Bexio, si vous en avez besoin', text: 'Connectez vos données Bexio ou utilisez Cantia indépendamment.' },
          { title: 'Modules privés sur mesure', text: 'Faites étudier un module réservé à votre entreprise selon votre besoin.' },
        ],
      },
    ],
  },
  team: {
    eyebrow: 'Du bureau au terrain',
    titlePrefix: 'Le patron, le bureau et le terrain',
    titleEm: 'dans le même outil.',
    text: 'Le patron pilote, le bureau organise et les employés font remonter ce qui se passe sur le chantier. Chacun retrouve les outils qui lui sont utiles, avec les accès que vous lui donnez.',
    roles: [
      { number: 'Direction', title: 'Gardez la vue d’ensemble.', text: 'Chantiers, devis, factures et rentabilité : les informations se rejoignent pour vous aider à décider.', tags: ['Piloter', 'Décider'] },
      { number: 'Bureau', title: 'Faites avancer les dossiers.', text: 'Secrétariat ou administration : donnez accès aux documents, au planning et aux modules nécessaires au quotidien.', tags: ['Organiser', 'Préparer'] },
      { number: 'Terrain', title: 'Partagez ce qui se passe.', text: 'Les employés saisissent leurs heures par chantier, échangent dans le fil du projet et ajoutent leurs rapports depuis leur téléphone.', tags: ['Pointer', 'Échanger', 'Documenter'] },
    ],
    permTitle: 'Chacun voit ce dont il a besoin, et rien de plus.',
    permText: 'Créez vos rôles et choisissez les modules accessibles. Un employé peut remplir ses heures et suivre son chantier sans accéder à la facturation.',
    permNote: 'Exemples d’organisation. Rôles personnalisés et modules disponibles selon votre plan. RH dès le plan Équipe.',
    permLink: 'Découvrir le travail en équipe',
  },
  automation: {
    eyebrow: 'Au clavier ou à la voix',
    title: 'Dictez sur le chantier, relisez au bureau.',
    text: 'Vous saisissez ou vous dictez, Cantia prépare le brouillon, vous validez.',
    tag: 'À VOTRE FAÇON',
    commandTitle: 'Un rapport, un devis ou une facture, préparé à partir de ce que vous dites.',
    commandText: 'Travaillez à la main avec vos prestations, vos quantités et vos documents. Ou dictez ce dont vous avez besoin : Cantia vous aide à préparer la suite.\n\nVous relisez, vous ajustez, vous validez.',
    link: 'Découvrir la dictée et l’assistant',
    tryLabel: 'Essayez un exemple de dictée',
    choices: { site: 'Chantier', quote: 'Devis', invoice: 'Facture' },
    examples: {
      site: { text: '« Prépare un rapport pour la Villa des Vignes : pose du parquet terminée dans le séjour. »', result: 'Un rapport rattaché au bon chantier.' },
      quote: { text: '« Prépare un devis pour la fourniture et la pose de 12 m² de parquet en chêne. »', result: 'Une offre préparée avec votre catalogue.' },
      invoice: { text: '« Prépare la facture à partir du devis accepté pour la Villa des Vignes. »', result: 'Une facture préparée à partir du devis.' },
    },
    resultLabel: 'CANTIA VOUS AIDE À PRÉPARER',
    resultNote: 'Un brouillon à relire et à valider.',
    note: 'Exemples illustratifs · Cette animation n’enregistre aucun son.',
    animateLabel: 'Animer',
    animatingLabel: 'Animation',
  },
  terrain: {
    eyebrow: 'Cantia sur tous vos écrans',
    title: 'Le chantier sur le téléphone, le bureau sur l’ordinateur.',
    text: 'Un détail à photographier, un plan à consulter, des heures à saisir : ajoutez l’information là où le travail se fait. Retrouvez-la ensuite au bureau, dans le même chantier.',
    points: [
      { label: 'Ordinateur', text: 'Devis, factures et pilotage' },
      { label: 'Tablette', text: 'Plans, rapports et suivi de chantier' },
      { label: 'Téléphone', text: 'Photos, heures et informations terrain' },
    ],
    installCta: 'Accéder à Cantia',
    installNote: 'Application 100% web, sans rien à télécharger — ajoutable à l’écran d’accueil comme raccourci.\nVersions App Store et Google Play en développement.',
  },
  tailored: {
    eyebrow: 'Quand votre entreprise a un besoin bien à elle',
    title: 'Un besoin que personne ne couvre ? On peut le développer.',
    text: 'Un processus particulier, un suivi métier ou un besoin que les modules existants ne couvrent pas ? Nous pouvons étudier un développement sur mesure pour votre entreprise.',
    cta: 'Parlons de votre besoin',
    steps: [
      { num: '01', title: 'On part de votre quotidien.', text: 'Expliquez-nous ce que vous faites, ce qui manque et ce que vous souhaitez simplifier.' },
      { num: '02', title: 'On définit une réponse adaptée.', text: 'Le fonctionnement, le périmètre et les conditions du développement sont définis ensemble.' },
      { num: '03', title: 'Un module réservé à votre entreprise.', text: 'Un module privé peut être intégré à votre espace Cantia et réservé à vos collaborateurs autorisés.' },
    ],
    link: 'En savoir plus sur le sur-mesure',
  },
  bexio: {
    eyebrow: 'Une connexion, si vous en avez besoin',
    title: 'Vous utilisez Bexio ? Cantia s’y connecte.',
    text: 'Vous utilisez déjà Bexio ? Connectez vos données clients, factures et paiements pour découvrir Cantia dans la continuité de votre organisation. Sans Bexio, vous pouvez utiliser Cantia de façon autonome.',
    link: 'Voir l’intégration',
  },
  fiduciary: {
    badge: 'fiduciaire',
    title: 'Votre fiduciaire travaille avec vous, directement dans Cantia.',
    text: 'Donnez-lui un accès en lecture seule à vos factures, paiements et à votre comptabilité : plus besoin d’envoyer vos pièces par e-mail. Vous choisissez ce qu’elle voit. Pour les fiduciaires, c’est gratuit.',
    link: 'Espace fiduciaires',
  },
  products: {
    eyebrow: 'Produits',
    title: 'Un écosystème pour tout le bâtiment.',
    items: [
      { name: 'Cantia', tag: 'Pour les entreprises', text: 'Devis, factures QR, chantiers, rapports, heures et salaires. Le logiciel de gestion des entreprises du bâtiment.', cta: 'Essayer gratuitement' },
      { name: 'Cantia Fiduciaires', tag: 'Gratuit pour les fiduciaires', text: 'Toutes les données comptables de vos mandants, les demandes de pièces et les échéances TVA au même endroit.', cta: 'Découvrir l’espace' },
      { name: 'Cantia Partners', tag: 'Programme partenaire', text: 'Recommandez Cantia et recevez 25 % des paiements de chaque entreprise amenée, pendant 12 mois.', cta: 'Devenir partenaire' },
    ],
  },
  docCustomization: {
    eyebrow: 'Vos documents, à votre image',
    title: 'Des devis et des factures à vos couleurs, avec le QR suisse',
    text: 'Chaque devis et chaque facture généré par Cantia reprend la couleur et le logo de votre entreprise — et chaque facture inclut le bulletin de versement QR suisse, prêt à être scanné.',
    points: [
      { title: 'Couleur de marque', text: 'Choisissez votre couleur dans Compte > Apparence : elle habille automatiquement l’en-tête, le tableau et les totaux.' },
      { title: 'Votre logo', text: 'Ajoutez votre logo et choisissez sa position — à gauche, au centre ou à droite de l’en-tête.' },
      { title: 'QR-facture suisse', text: 'Chaque facture inclut le bulletin de versement QR, directement sur le document, prêt à être scanné.' },
    ],
    link: 'Découvrir la facturation',
  },
  documents: {
    eyebrow: 'Exports réels',
    title: 'Les documents que vos clients et vos employés reçoivent',
    intro: 'Générés par Cantia avec des données d’exemple : même mise en page, mêmes calculs que vos propres documents.',
    hint: 'Choisissez un document pour voir ce qu’il contient.',
    docs: [
      {
        id: 'facture', tab: 'Facture QR', alt: 'Facture avec bulletin QR suisse générée par Cantia',
        points: [
          { title: 'Couleur de votre entreprise', text: 'L’en-tête du tableau, les totaux et les encadrés prennent la couleur choisie dans Compte > Apparence.' },
          { title: 'Votre logo et vos coordonnées', text: 'Nom, adresse, IDE et contacts en tête de chaque document, logo à gauche, au centre ou à droite.' },
          { title: 'Bulletin QR suisse', text: 'Le bulletin de versement QR est imprimé sur la facture, avec votre IBAN et la référence de paiement.' },
        ],
        link: 'Découvrir la facturation', linkSlug: 'facturation',
      },
      {
        id: 'devis', tab: 'Devis signé', alt: 'Devis signé électroniquement par le client, généré par Cantia',
        points: [
          { title: 'Référence et validité', text: 'Numérotation automatique, date du devis et date de validité dans un encadré lisible.' },
          { title: 'Vos prestations, vos prix', text: 'Les lignes viennent de votre catalogue ; quantités, unités, TVA et total sont calculés pour vous.' },
          { title: 'Signature électronique du client', text: 'Le client signe en ligne ; sa signature, son nom, la date et l’heure sont intégrés au PDF.' },
        ],
        link: 'Découvrir les devis', linkSlug: 'devis',
      },
      {
        id: 'rapport', tab: 'Rapport de chantier', alt: 'Rapport de chantier avec photos généré par Cantia',
        points: [
          { title: 'L’essentiel en deux lignes', text: 'Le résumé est rédigé à partir des notes, photos et dictées de la journée. Vous relisez avant d’envoyer.' },
          { title: 'Chaque constat avec sa photo', text: 'Les photos du chantier sont placées à côté du point qu’elles documentent.' },
          { title: 'Les points d’attention ressortent', text: 'Un imprévu ou un supplément à facturer est encadré pour que personne ne le manque.' },
          { title: 'La suite', text: 'Les prochaines étapes terminent le rapport : bétonnage, livraison, décoffrage.' },
        ],
        link: 'Découvrir les rapports de chantier', linkSlug: 'rapports-chantier',
      },
      {
        id: 'salaire', tab: 'Fiche de salaire', alt: 'Décompte de salaire suisse généré par Cantia',
        points: [
          { title: 'Heures reprises du pointage', text: 'Les heures saisies par l’employé sur ses chantiers donnent le salaire du mois, sans ressaisie.' },
          { title: 'Déductions suisses', text: 'AVS/AI/APG, chômage, AANP, LPP et IJM, avec vos propres taux.' },
          { title: 'Net à verser', text: 'Le salaire net et l’IBAN de l’employé, prêts pour le paiement.' },
        ],
        link: 'Découvrir les heures et les salaires', linkSlug: 'rh-salaires',
      },
    ],
  },
  faq: {
    eyebrow: 'Avant de vous lancer',
    title: 'Questions fréquentes',
    link: 'Consulter le centre d’aide',
    items: [
      { q: 'À qui s’adresse Cantia ?', a: 'Aux indépendants et entreprises du bâtiment suisse : maçonnerie, charpente, peinture, électricité, génie civil et autres métiers de la construction.' },
      { q: 'Est-ce que Cantia fonctionne sans Bexio ?', a: 'Oui. Vous pouvez gérer votre activité dans Cantia seul. L’intégration Bexio permet de retrouver vos données dans les deux outils si vous utilisez déjà Bexio.' },
      { q: 'Comment utiliser Cantia sur téléphone ?', a: 'Ouvrez Cantia dans votre navigateur et ajoutez-le à votre écran d’accueil. Les versions App Store et Google Play sont en développement.' },
      { q: 'Que comprend l’essai de 14 jours ?', a: 'Les nouveaux comptes disposent de 14 jours d’essai, sans code promotionnel. Choisissez votre formule lors de l’inscription et consultez ses conditions avant de confirmer.' },
      { q: 'Puis-je donner un accès à mon équipe ?', a: 'Oui. Selon votre formule, vous pouvez inviter jusqu’à 3, 10 ou 25 membres et définir leurs rôles. Pour une équipe plus grande, contactez Cantia.' },
    ],
  },
  closing: {
    eyebrow: 'Prêt à essayer ?',
    titlePrefix: 'Commencez par votre',
    titleEm: 'prochain chantier.',
    text: 'Créez un devis, ouvrez un chantier, invitez votre équipe. Vous avez 14 jours pour juger, sans engagement.',
    cta: 'Essayer 14 jours',
    contact: 'Parler à l’équipe Cantia',
  },
  pricing: {
    title: 'Un prix selon la taille de votre équipe',
    subtitle: 'Toutes les formules commencent par 14 jours d’essai complet, sans code promotionnel.',
    monthly: 'Facturation mensuelle',
    yearly: 'Facturation annuelle',
    yearlySavings: '-20%',
    billedYearly: 'Facturé {amount}/an',
    storageSuffix: 'Go de stockage',
    memberSingular: 'membre',
    memberPlural: 'membres',
    unlimited: 'Rapports & devis illimités',
    badge: 'Le plus choisi',
    paidCta: 'Essayer 14 jours',
  },
  footer: {
    blurb: 'La plateforme de gestion du bâtiment suisse.',
    platformTitle: 'La plateforme',
    platformDevis: 'Devis & offres',
    platformFactures: 'Factures & paiements',
    platformChantiers: 'Chantiers & rapports',
    platformRh: 'RH & salaires',
    platformRentabilite: 'Rentabilité',
    discoverTitle: 'Découvrir Cantia',
    discoverFeatures: 'Toutes les fonctionnalités',
    discoverPricing: 'Tarifs',
    discoverMetier: 'Votre métier',
    discoverIntegrations: 'Intégrations',
    discoverSurMesure: 'Sur mesure',
    resourcesTitle: 'Ressources',
    resourcesHelp: 'Centre d’aide',
    resourcesMobile: 'Application mobile',
    resourcesBlog: 'Blog',
    resourcesContact: 'Contact',
    resourcesLogin: 'Connexion',
    legalLink: 'Mentions légales',
    statusLink: 'Statut du service',
    partnersLink: 'Programme partenaire',
    fiduciaryLink: 'Pour les fiduciaires',
    productsTitle: 'Produits',
    productsApp: 'Cantia pour les entreprises',
    privacyLink: 'Confidentialité',
    cgvLink: 'Conditions générales',
    copyright: '© {year} Cantia. Conçu pour le bâtiment suisse.',
  },
};

const de: Dict = {
  landingNav: {
    features: 'Funktionen',
    pricing: 'Preise',
    help: 'Hilfe',
    contact: 'Kontakt',
    login: 'Anmelden',
    signup: 'Registrieren',
    mobileApp: 'Mobile App',
  },
  hero: {
    kicker: 'Baustellensoftware für Schweizer Bauunternehmen',
    titlePrefix: 'Verwalten Sie Ihre Baustellen,',
    titleHighlight: 'nicht Ihre',
    crossedText: 'Administration.',
    lede: 'Offerten, QR-Rechnungen, Baustellenrapporte, Planung und Löhne in einem einzigen Werkzeug. Ihr Team erfasst vor Ort per Telefon, Sie finden alles im Büro wieder.',
    cta: '14 Tage testen',
    secondaryCta: 'Preise ansehen',
    facts: ['Ab CHF 39.– pro Monat', '14 Tage Testphase, ohne Verpflichtung', 'Daten in Zürich gehostet'],
    trustCount: '+{{count}} Bauunternehmen vertrauen uns bereits',
    cartouche: [
      { label: 'Gegenstand', value: 'Software für Baustellenverwaltung' },
      { label: 'Für', value: 'Unternehmen mit 1 bis 25 Personen' },
      { label: 'Sprachen', value: 'Français, Deutsch, Italiano' },
      { label: 'Hosting', value: 'Zürich, Schweiz' },
    ],
  },
  trust: {
    locationLabel: 'Entwickelt und gehostet in der Schweiz',
    title: 'Schweizerisch, vom Server bis zur QR-Rechnung.',
    text: 'Ihre Daten bleiben in der Schweiz, Ihre Rechnungen folgen den Schweizer Regeln, und wenn Sie anrufen, antwortet jemand.',
    cards: [
      { label: 'Schweizer Rechnungsstellung', title: 'Konforme QR-Rechnungen in Schweizer Franken', text: 'QR-Rechnungen, MWST und Anzahlungen: die Werkzeuge, um Ihre Kunden in der Schweiz zu fakturieren.' },
      { label: 'Ihre Arbeitsweise', title: 'Ihre Leistungen und Ihre Preise, nicht unsere', text: 'Finden Sie Ihre gewohnten Leistungen wieder und versenden Sie Dokumente in Ihrem Stil.' },
      { label: 'Ein direkter Kontakt', title: 'Direkter Kontakt, per Telefon oder E-Mail', text: 'Kontaktieren Sie uns telefonisch oder per E-Mail für Ihre Fragen und Anliegen.' },
    ],
    contactCta: 'Cantia kontaktieren',
  },
  profession: {
    eyebrow: 'Ihr Beruf hat seine Gewohnheiten',
    title: 'Auf Ihr Gewerbe abgestimmt',
    text: 'Ein Zimmermann bereitet seine Baustellen nicht wie ein Maler vor. Cantia passt sich Ihrem Gewerbe an, mit Vorlagen und Dokumenten, die Sie personalisieren können.',
    links: [
      { label: 'Zimmerei', slug: 'charpentier' },
      { label: 'Maurerarbeiten', slug: 'macon' },
      { label: 'Malerarbeiten', slug: 'peintre' },
      { label: 'Elektrik', slug: 'electricien' },
      { label: 'Schreinerei', slug: 'menuisier' },
      { label: 'Tiefbau', slug: 'genie-civil' },
    ],
    allLink: 'Alle Berufe entdecken',
    personalTitle: 'Eingestellt, wie Sie arbeiten',
    items: [
      { title: 'Ihre Leistungen', text: 'Ihr Katalog, Ihre Preise und Ihre Offertvorlagen folgen Ihrer Art zu kalkulieren.' },
      { title: 'Ihre Identität', text: 'Ihr Logo und Ihre Farben begleiten die an Kunden versendeten Dokumente.' },
      { title: 'Ihre Organisation', text: 'Sie passen die Zugriffe an die Verantwortlichkeiten jedes Teammitglieds an.' },
    ],
  },
  stories: {
    title: 'Sechs Situationen, die Sie kennen',
    subtitle: 'Unvorhergesehenes gehört zum Beruf. Die Administration sollte es nicht noch komplizierter machen.',
    exploreLabel: 'Alle Funktionen entdecken',
    hint: 'Klicken Sie auf eine Situation oder wechseln Sie mit den Pfeilen zur nächsten.',
    respondLabel: 'Cantia antwortet',
    prevLabel: 'Vorherige Situation',
    nextLabel: 'Nächste Situation',
    pauseLabel: 'Pausieren',
    playLabel: 'Abspielen',
    cases: [
      {
        id: 'devis',
        tab: 'Offerten',
        context: 'Offerten & Angebote',
        question: 'Offerten noch am Abend\nnach der Baustelle?',
        responseTitle: 'Die Offerte entsteht während der Besichtigung.',
        responseText: 'Diktieren oder erfassen Sie Ihre Leistungen. Cantia greift auf Ihren Katalog zurück, um ein Angebot vorzubereiten, das Sie vor dem Versand prüfen.',
        steps: ['Diktieren oder erfassen', 'Anpassen', 'Versenden'],
        linkLabel: 'Offerten entdecken',
        linkSlug: 'devis',
        concreteLabel: 'Vor Ort',
        concreteText: '„12 m² Eichenparkett, mit Vorbereitung des Untergrunds und Verlegung.“',
      },
      {
        id: 'chantier',
        tab: 'Baustellen',
        context: 'Baustellenverfolgung',
        question: 'Wo ist der Plan?\nUnd das letzte Foto?',
        responseTitle: 'Pläne, Fotos und Nachrichten bleiben in der Baustelle.',
        responseText: 'Pläne, Nachrichten und Fotos bleiben mit dem Projekt verknüpft. Ihre Notizen vor Ort können anschliessend einen Rapport speisen, der überprüft und geteilt wird.',
        steps: ['Dokumentieren', 'Sammeln', 'Teilen'],
        linkLabel: 'Verfolgung und Rapporte entdecken',
        linkSlug: 'rapports-chantier',
        concreteLabel: 'Vor Ort',
        concreteText: '„Der Untergrund ist feucht hinter der Trennwand. Ich füge die Fotos zur Baustelle hinzu.“',
      },
      {
        id: 'extras',
        tab: 'Zusatzarbeiten',
        context: 'Zusätzliche Arbeiten',
        question: '„Wo Sie schon\ndabei sind…“',
        responseTitle: 'Der Zusatz wird unterschrieben, bevor er ausgeführt wird.',
        responseText: 'Kalkulieren Sie den Zusatz und lassen Sie ihn online unterschreiben. Nach der Annahme erstellt Cantia eine eigene Rechnung.',
        steps: ['Kalkulieren', 'Unterschreiben lassen', 'Fakturieren'],
        linkLabel: 'Zusatzarbeiten entdecken',
        linkSlug: 'travaux-supplementaires',
        concreteLabel: 'Vor Ort',
        concreteText: '„Könnten Sie auch noch die Garagentür streichen?“',
      },
      {
        id: 'equipe',
        tab: 'Teams',
        context: 'Teams, Stunden & Löhne',
        question: 'Wer hat was gemacht,\nund wie viele Stunden?',
        responseTitle: 'Jeder erfasst seine Stunden, das Büro findet sie wieder.',
        responseText: 'Die Mitarbeitenden erfassen ihre Stunden und Spesen pro Baustelle. Berechtigte Personen finden die Daten für die Nachverfolgung und die Löhne.',
        steps: ['Planen', 'Erfassen', 'Auswerten'],
        linkLabel: 'Stunden und Löhne entdecken',
        linkSlug: 'rh-salaires',
        concreteLabel: 'Vor Ort',
        concreteText: '„4 Std. bei der Villa des Vignes, 3 Std. bei der Résidence du Parc und 18 km Fahrt.“',
      },
      {
        id: 'paiements',
        tab: 'Rechnungen',
        context: 'Rechnungsstellung & Inkasso',
        question: 'Fakturiert.\nAber auch bezahlt?',
        responseTitle: 'Jede Zahlung ist ihrer Rechnung zugeordnet.',
        responseText: 'Erstellen Sie eine QR-Rechnung, verlangen Sie eine Anzahlung und erfassen Sie die Zahlungen. Der verbleibende Saldo folgt den eingegangenen Zahlungen.',
        steps: ['Fakturieren', 'Zahlung erfassen', 'Saldo verfolgen'],
        linkLabel: 'Rechnungsstellung entdecken',
        linkSlug: 'facturation',
        concreteLabel: 'Vor Ort',
        concreteText: '„Auf dieser Rechnung über CHF 6’000 hat der Kunde bereits CHF 2’000 bezahlt.“',
      },
      {
        id: 'pilotage',
        tab: 'Rentabilität',
        context: 'Rentabilität & Liquidität',
        question: 'Gearbeitet, ja.\nAber mit Marge?',
        responseTitle: 'Sehen Sie, was jede Baustelle einbringt.',
        responseText: 'Vergleichen Sie die Offerte mit den Ausgaben und den Lohnkosten. Antizipieren Sie auch Zahlungseingänge und -ausgänge mit der Liquiditätsplanung über 90 Tage.',
        steps: ['Kosten sammeln', 'Vergleichen', 'Entscheiden'],
        linkLabel: 'Rentabilität entdecken',
        linkSlug: 'rentabilite',
        concreteLabel: 'Vor Ort',
        concreteText: '„Wir haben mehr Stunden gebraucht als geplant. Was bedeutet das für diese Baustelle?“',
      },
    ],
  },
  catalog: {
    title: 'Alle Funktionen, nach Anwendung geordnet',
    subtitle: 'Jede Zeile führt zur ausführlichen Seite.',
    columns: { ref: 'Seite', usage: 'Anwendung', content: 'Was enthalten ist' },
    planNote: 'Die verfügbaren Module und Rechte hängen von Ihrer Formel ab.',
    comparePlans: 'Angebote vergleichen',
    groups: [
      {
        title: 'Eine Offerte vorbereiten',
        subtitle: 'Vom ersten Kontakt bis zur angenommenen Offerte.',
        linkLabel: 'Diesen Bereich entdecken',
        linkSlug: 'devis',
        items: [
          { title: 'Kunden', text: 'Finden Sie die Kontaktdaten des Kunden und verwenden Sie sie in Ihren Dokumenten wieder.' },
          { title: 'Leistungskatalog', text: 'Speichern Sie Beschreibungen, Preise und Einheiten; erkennen Sie Preisabweichungen.' },
          { title: 'Offertvorlagen', text: 'Gehen Sie von Ihren gewohnten Leistungen aus und passen Sie die Mengen an.' },
          { title: 'Aufmasse', text: 'Detaillieren Sie die für die Kalkulation nötigen Mengen.' },
          { title: 'Offerte und Unterschrift', text: 'Bereiten Sie das PDF vor, teilen Sie es und verfolgen Sie den Status bis zur Annahme.' },
        ],
      },
      {
        title: 'Fakturieren und Zahlungen verfolgen',
        subtitle: 'Von der Anzahlung bis zum Baustellensaldo.',
        linkLabel: 'Diesen Bereich entdecken',
        linkSlug: 'facturation',
        items: [
          { title: 'Umwandlung der Offerte', text: 'Übernehmen Sie die angenommenen Positionen in die Rechnung, ohne sie neu einzutippen.' },
          { title: 'Schweizer QR-Rechnungen', text: 'Erstellen Sie den QR-Einzahlungsschein mit Ihrer IBAN und der Zahlungsreferenz.' },
          { title: 'Anzahlungen', text: 'Fakturieren Sie einen Teil der Offerte und finden Sie den Abzug auf der Schlussrechnung wieder.' },
          { title: 'Zahlungen und Fälligkeiten', text: 'Erfassen Sie Teilzahlungen, prüfen Sie Salden und gleichen Sie Referenzen ab.' },
          { title: 'Zusätzliche Arbeiten', text: 'Kalkulieren Sie ein Extra, lassen Sie es unterschreiben und finden Sie die Rechnung nach der Annahme wieder.' },
        ],
      },
      {
        title: 'Die Baustelle dokumentieren',
        subtitle: 'Was das Team sieht, sagt und ausführt.',
        linkLabel: 'Diesen Bereich entdecken',
        linkSlug: 'rapports-chantier',
        items: [
          { title: 'Team-Feed', text: 'Tauschen Sie Nachrichten und Sprachnotizen in der Baustelle aus.' },
          { title: 'Pläne und Dokumente', text: 'Ordnen Sie Dateien in Ordnern und Unterordnern.' },
          { title: 'Fotos und Standort', text: 'Bewahren Sie Fotos, ihren Zeitstempel und ihre geografische Position auf.' },
          { title: 'Rapporte', text: 'Fassen Sie Notizen und Fotos in einem Rapport zusammen, zum Prüfen, Unterschreiben und Exportieren.' },
          { title: 'Subunternehmer', text: 'Finden Sie die beteiligten Unternehmen und ihre Dokumente im Projekt wieder.' },
        ],
      },
      {
        title: 'Im Team arbeiten',
        subtitle: 'Baustelle und Büro, mit den richtigen Zugriffen.',
        linkLabel: 'Diesen Bereich entdecken',
        linkSlug: 'rh-salaires',
        items: [
          { title: 'Geteilte Planung', text: 'Weisen Sie Mitglieder Baustellen zu und sehen Sie die Woche vom Telefon aus ein.' },
          { title: 'Stunden und Exporte', text: 'Erfassen Sie Stunden pro Tag und Baustelle; exportieren Sie die Blätter als CSV.' },
          { title: 'Berufliche Spesen', text: 'Verfolgen Sie Fahrten und andere Spesen der Mitarbeitenden.' },
          { title: 'Profile und Löhne', text: 'Erfassen Sie Fixlohn oder Stundenansatz und Abzüge für die Brutto-/Nettoberechnung.' },
          { title: 'Rollen und Berechtigungen', text: 'Definieren Sie zugängliche Module; beschränken Sie den Zugriff auf sensible Informationen.' },
        ],
      },
      {
        title: 'Kosten steuern',
        subtitle: 'Die Baustellendaten im Dienst Ihrer Entscheidungen.',
        linkLabel: 'Diesen Bereich entdecken',
        linkSlug: 'tresorerie',
        items: [
          { title: 'Ausgaben', text: 'Finden Sie Baustelleneinkäufe und allgemeine Ausgaben wieder.' },
          { title: 'Erfassung per Foto oder Sprache', text: 'Bereiten Sie eine Ausgabe anhand eines Belegs oder eines Diktats vor und prüfen Sie sie.' },
          { title: 'Rentabilität', text: 'Vergleichen Sie die angenommene Offerte mit den Material- und Lohnkosten.' },
          { title: 'Liquidität über 90 Tage', text: 'Projizieren Sie Zahlungseingänge und -ausgänge ausgehend von Ihrem manuell erfassten Saldo.' },
          { title: 'Wiederkehrende Kosten', text: 'Verfolgen Sie Abonnements, Mieten und andere Fälligkeiten, mit Erinnerungen.' },
        ],
      },
      {
        title: 'Cantia an Ihr Unternehmen anpassen',
        subtitle: 'Ihr Beruf, Ihre Dokumente, Ihre Organisation.',
        linkLabel: 'Über Ihr Anliegen sprechen',
        linkSlug: 'sur-mesure',
        items: [
          { title: 'Diktat und Assistent', text: 'Diktieren Sie Nachrichten und Dokumente oder befragen Sie die Daten Ihres Unternehmens.' },
          { title: 'Personalisierte Dokumente', text: 'Wenden Sie Logo, Farben und Identität Ihres Unternehmens an.' },
          { title: 'Computer und Mobil', text: 'Finden Sie Cantia im Büro und vor Ort wieder.' },
          { title: 'Bexio, falls benötigt', text: 'Verbinden Sie Ihre Bexio-Daten oder nutzen Sie Cantia eigenständig.' },
          { title: 'Massgeschneiderte private Module', text: 'Lassen Sie ein Ihrem Unternehmen vorbehaltenes Modul nach Ihrem Bedarf prüfen.' },
        ],
      },
    ],
  },
  team: {
    eyebrow: 'Vom Büro bis zur Baustelle',
    titlePrefix: 'Chef, Büro und Baustelle',
    titleEm: 'im selben Werkzeug.',
    text: 'Die Geschäftsleitung steuert, das Büro organisiert und die Mitarbeitenden melden, was auf der Baustelle passiert. Jeder findet die für ihn nützlichen Werkzeuge, mit den Zugriffen, die Sie vergeben.',
    roles: [
      { number: 'Geschäftsleitung', title: 'Behalten Sie den Überblick.', text: 'Baustellen, Offerten, Rechnungen und Rentabilität: Die Informationen laufen zusammen, um Ihnen bei Entscheidungen zu helfen.', tags: ['Steuern', 'Entscheiden'] },
      { number: 'Büro', title: 'Bringen Sie die Dossiers voran.', text: 'Sekretariat oder Administration: Geben Sie Zugriff auf Dokumente, Planung und die im Alltag nötigen Module.', tags: ['Organisieren', 'Vorbereiten'] },
      { number: 'Baustelle', title: 'Teilen Sie, was passiert.', text: 'Die Mitarbeitenden erfassen ihre Stunden pro Baustelle, tauschen sich im Projekt-Feed aus und fügen ihre Rapporte vom Telefon aus hinzu.', tags: ['Erfassen', 'Austauschen', 'Dokumentieren'] },
    ],
    permTitle: 'Jeder sieht, was er braucht, und nicht mehr.',
    permText: 'Erstellen Sie Ihre Rollen und wählen Sie die zugänglichen Module. Ein Mitarbeitender kann seine Stunden erfassen und seine Baustelle verfolgen, ohne Zugriff auf die Rechnungsstellung zu haben.',
    permNote: 'Beispiele einer Organisation. Personalisierte Rollen und verfügbare Module je nach Plan. HR ab dem Plan Team.',
    permLink: 'Teamarbeit entdecken',
  },
  automation: {
    eyebrow: 'Per Tastatur oder per Sprache',
    title: 'Auf der Baustelle diktieren, im Büro prüfen.',
    text: 'Sie erfassen oder diktieren, Cantia bereitet den Entwurf vor, Sie bestätigen.',
    tag: 'NACH IHRER ART',
    commandTitle: 'Ein Rapport, eine Offerte oder eine Rechnung, vorbereitet aus dem, was Sie sagen.',
    commandText: 'Arbeiten Sie von Hand mit Ihren Leistungen, Mengen und Dokumenten. Oder diktieren Sie, was Sie brauchen: Cantia hilft Ihnen, den nächsten Schritt vorzubereiten.\n\nSie prüfen, passen an, bestätigen.',
    link: 'Diktat und Assistent entdecken',
    tryLabel: 'Probieren Sie ein Diktat-Beispiel',
    choices: { site: 'Baustelle', quote: 'Offerte', invoice: 'Rechnung' },
    examples: {
      site: { text: '„Bereite einen Rapport für die Villa des Vignes vor: Parkettverlegung im Wohnzimmer abgeschlossen.“', result: 'Ein Rapport, verknüpft mit der richtigen Baustelle.' },
      quote: { text: '„Bereite eine Offerte für Lieferung und Verlegung von 12 m² Eichenparkett vor.“', result: 'Ein mit Ihrem Katalog vorbereitetes Angebot.' },
      invoice: { text: '„Erstelle die Rechnung aus der angenommenen Offerte für die Villa des Vignes.“', result: 'Eine aus der Offerte vorbereitete Rechnung.' },
    },
    resultLabel: 'CANTIA HILFT IHNEN VORZUBEREITEN',
    resultNote: 'Ein Entwurf, zu prüfen und zu bestätigen.',
    note: 'Illustrative Beispiele · Diese Animation zeichnet keinen Ton auf.',
    animateLabel: 'Abspielen',
    animatingLabel: 'Animation',
  },
  terrain: {
    eyebrow: 'Cantia auf all Ihren Bildschirmen',
    title: 'Die Baustelle auf dem Telefon, das Büro auf dem Computer.',
    text: 'Ein Detail zu fotografieren, ein Plan zu konsultieren, Stunden zu erfassen: Fügen Sie die Information dort hinzu, wo die Arbeit stattfindet. Finden Sie sie anschliessend im Büro, in derselben Baustelle, wieder.',
    points: [
      { label: 'Computer', text: 'Offerten, Rechnungen und Steuerung' },
      { label: 'Tablet', text: 'Pläne, Rapporte und Baustellenverfolgung' },
      { label: 'Telefon', text: 'Fotos, Stunden und Informationen vor Ort' },
    ],
    installCta: 'Cantia öffnen',
    installNote: '100 % webbasierte Anwendung, nichts herunterzuladen — als Verknüpfung zum Startbildschirm hinzufügbar.\nApp-Store- und Google-Play-Versionen in Entwicklung.',
  },
  tailored: {
    eyebrow: 'Wenn Ihr Unternehmen ein ganz eigenes Bedürfnis hat',
    title: 'Ein Bedürfnis, das niemand abdeckt? Wir können es entwickeln.',
    text: 'Ein besonderer Prozess, eine fachliche Nachverfolgung oder ein Bedürfnis, das die bestehenden Module nicht abdecken? Wir können eine massgeschneiderte Entwicklung für Ihr Unternehmen prüfen.',
    cta: 'Sprechen wir über Ihr Anliegen',
    steps: [
      { num: '01', title: 'Wir gehen von Ihrem Alltag aus.', text: 'Erklären Sie uns, was Sie tun, was fehlt und was Sie vereinfachen möchten.' },
      { num: '02', title: 'Wir definieren eine passende Lösung.', text: 'Funktionsweise, Umfang und Bedingungen der Entwicklung werden gemeinsam festgelegt.' },
      { num: '03', title: 'Ein Ihrem Unternehmen vorbehaltenes Modul.', text: 'Ein privates Modul kann in Ihren Cantia-Bereich integriert und Ihren berechtigten Mitarbeitenden vorbehalten werden.' },
    ],
    link: 'Mehr über massgeschneiderte Lösungen erfahren',
  },
  bexio: {
    eyebrow: 'Eine Verbindung, falls Sie sie brauchen',
    title: 'Sie nutzen Bexio? Cantia verbindet sich damit.',
    text: 'Sie nutzen bereits Bexio? Verbinden Sie Ihre Kunden-, Rechnungs- und Zahlungsdaten, um Cantia im Einklang mit Ihrer Organisation zu entdecken. Ohne Bexio können Sie Cantia eigenständig nutzen.',
    link: 'Die Integration ansehen',
  },
  fiduciary: {
    badge: 'Treuhand',
    title: 'Ihre Treuhand arbeitet direkt in Cantia mit Ihnen.',
    text: 'Geben Sie ihr Lesezugriff auf Rechnungen, Zahlungen und Buchhaltung: Belege per E-Mail schicken ist vorbei. Sie wählen, was sie sieht. Für Treuhänder kostenlos.',
    link: 'Bereich für Treuhänder',
  },
  products: {
    eyebrow: 'Produkte',
    title: 'Ein Ökosystem für die ganze Baubranche.',
    items: [
      { name: 'Cantia', tag: 'Für Unternehmen', text: 'Offerten, QR-Rechnungen, Baustellen, Rapporte, Stunden und Löhne. Die Verwaltungssoftware für Bauunternehmen.', cta: 'Kostenlos testen' },
      { name: 'Cantia Treuhand', tag: 'Kostenlos für Treuhänder', text: 'Alle Buchhaltungsdaten Ihrer Mandanten, Belegeanfragen und MWST-Fristen an einem Ort.', cta: 'Bereich entdecken' },
      { name: 'Cantia Partners', tag: 'Partnerprogramm', text: 'Empfehlen Sie Cantia und erhalten Sie 25 % der Zahlungen jedes vermittelten Unternehmens während 12 Monaten.', cta: 'Partner werden' },
    ],
  },
  docCustomization: {
    eyebrow: 'Ihre Dokumente, in Ihrem Look',
    title: 'Offerten und Rechnungen in Ihren Farben, mit Schweizer QR',
    text: 'Jedes von Cantia erstellte Angebot und jede Rechnung übernimmt die Farbe und das Logo Ihres Unternehmens — und jede Rechnung enthält den Schweizer QR-Einzahlungsschein, bereit zum Scannen.',
    points: [
      { title: 'Markenfarbe', text: 'Wählen Sie Ihre Farbe unter Konto > Erscheinungsbild: Sie färbt automatisch Kopfzeile, Tabelle und Summen ein.' },
      { title: 'Ihr Logo', text: 'Fügen Sie Ihr Logo hinzu und wählen Sie seine Position — links, mittig oder rechts in der Kopfzeile.' },
      { title: 'Schweizer QR-Rechnung', text: 'Jede Rechnung enthält den QR-Einzahlungsschein direkt auf dem Dokument, bereit zum Scannen.' },
    ],
    link: 'Die Rechnungsstellung entdecken',
  },
  documents: {
    eyebrow: 'Echte Exporte',
    title: 'Die Dokumente, die Ihre Kunden und Mitarbeitenden erhalten',
    intro: 'Von Cantia mit Beispieldaten erstellt: dasselbe Layout, dieselben Berechnungen wie Ihre eigenen Dokumente.',
    hint: 'Wählen Sie ein Dokument, um zu sehen, was es enthält.',
    docs: [
      {
        id: 'facture', tab: 'QR-Rechnung', alt: 'Von Cantia erstellte Rechnung mit Schweizer QR-Einzahlungsschein',
        points: [
          { title: 'Die Farbe Ihres Unternehmens', text: 'Tabellenkopf, Summen und Rahmen übernehmen die Farbe aus Konto > Erscheinungsbild.' },
          { title: 'Ihr Logo und Ihre Angaben', text: 'Name, Adresse, UID und Kontakt oben auf jedem Dokument, Logo links, mittig oder rechts.' },
          { title: 'Schweizer QR-Einzahlungsschein', text: 'Der QR-Einzahlungsschein steht auf der Rechnung, mit Ihrer IBAN und der Zahlungsreferenz.' },
        ],
        link: 'Rechnungsstellung entdecken', linkSlug: 'facturation',
      },
      {
        id: 'devis', tab: 'Unterschriebene Offerte', alt: 'Vom Kunden elektronisch unterschriebene Offerte, erstellt mit Cantia',
        points: [
          { title: 'Referenz und Gültigkeit', text: 'Automatische Nummerierung, Datum und Gültigkeitsdatum in einem gut lesbaren Rahmen.' },
          { title: 'Ihre Leistungen, Ihre Preise', text: 'Die Positionen stammen aus Ihrem Katalog; Mengen, Einheiten, MWST und Total werden berechnet.' },
          { title: 'Elektronische Unterschrift des Kunden', text: 'Der Kunde unterschreibt online; Unterschrift, Name, Datum und Uhrzeit stehen im PDF.' },
        ],
        link: 'Offerten entdecken', linkSlug: 'devis',
      },
      {
        id: 'rapport', tab: 'Baustellenrapport', alt: 'Von Cantia erstellter Baustellenrapport mit Fotos',
        points: [
          { title: 'Das Wichtigste in zwei Zeilen', text: 'Die Zusammenfassung entsteht aus Notizen, Fotos und Diktaten des Tages. Sie prüfen vor dem Versand.' },
          { title: 'Jede Feststellung mit Foto', text: 'Die Baustellenfotos stehen neben dem Punkt, den sie dokumentieren.' },
          { title: 'Wichtige Punkte fallen auf', text: 'Ein Zwischenfall oder ein zu verrechnender Zusatz wird hervorgehoben, damit ihn niemand übersieht.' },
          { title: 'Nächste Schritte', text: 'Der Rapport endet mit den nächsten Schritten: Betonieren, Lieferung, Ausschalen.' },
        ],
        link: 'Baustellenrapporte entdecken', linkSlug: 'rapports-chantier',
      },
      {
        id: 'salaire', tab: 'Lohnabrechnung', alt: 'Von Cantia erstellte Schweizer Lohnabrechnung',
        points: [
          { title: 'Stunden aus der Zeiterfassung', text: 'Die auf den Baustellen erfassten Stunden ergeben den Monatslohn, ohne erneute Eingabe.' },
          { title: 'Schweizer Abzüge', text: 'AHV/IV/EO, ALV, NBU, BVG und KTG, mit Ihren eigenen Sätzen.' },
          { title: 'Auszuzahlender Nettolohn', text: 'Nettolohn und IBAN der Mitarbeiterin oder des Mitarbeiters, bereit für die Zahlung.' },
        ],
        link: 'Stunden und Löhne entdecken', linkSlug: 'rh-salaires',
      },
    ],
  },
  faq: {
    eyebrow: 'Bevor Sie starten',
    title: 'Häufige Fragen',
    link: 'Hilfe-Center besuchen',
    items: [
      { q: 'An wen richtet sich Cantia?', a: 'An Selbstständige und Unternehmen des Schweizer Baugewerbes: Maurerarbeiten, Zimmerei, Malerarbeiten, Elektrik, Tiefbau und andere Bauberufe.' },
      { q: 'Funktioniert Cantia auch ohne Bexio?', a: 'Ja. Sie können Ihre Tätigkeit allein in Cantia verwalten. Die Bexio-Integration erlaubt es, Ihre Daten in beiden Tools wiederzufinden, falls Sie Bexio bereits nutzen.' },
      { q: 'Wie nutzt man Cantia auf dem Telefon?', a: 'Öffnen Sie Cantia in Ihrem Browser und fügen Sie es zu Ihrem Startbildschirm hinzu. Die App-Store- und Google-Play-Versionen sind in Entwicklung.' },
      { q: 'Was umfasst die 14-tägige Testphase?', a: 'Neue Konten verfügen über 14 Tage Testphase, ohne Aktionscode. Wählen Sie Ihre Formel bei der Registrierung und prüfen Sie deren Bedingungen vor der Bestätigung.' },
      { q: 'Kann ich meinem Team Zugriff geben?', a: 'Ja. Je nach Formel können Sie bis zu 3, 10 oder 25 Mitglieder einladen und deren Rollen festlegen. Für ein grösseres Team kontaktieren Sie Cantia.' },
    ],
  },
  closing: {
    eyebrow: 'Bereit zum Testen?',
    titlePrefix: 'Beginnen Sie mit Ihrer',
    titleEm: 'nächsten Baustelle.',
    text: 'Erstellen Sie eine Offerte, eröffnen Sie eine Baustelle, laden Sie Ihr Team ein. Sie haben 14 Tage Zeit, ohne Verpflichtung.',
    cta: '14 Tage testen',
    contact: 'Mit dem Cantia-Team sprechen',
  },
  pricing: {
    title: 'Ein Preis nach der Grösse Ihres Teams',
    subtitle: 'Alle Formeln beginnen mit 14 Tagen vollständiger Testphase, ohne Aktionscode.',
    monthly: 'Monatliche Abrechnung',
    yearly: 'Jährliche Abrechnung',
    yearlySavings: '-20%',
    billedYearly: 'Jährlich {amount} verrechnet',
    storageSuffix: 'GB Speicherplatz',
    memberSingular: 'Mitglied',
    memberPlural: 'Mitglieder',
    unlimited: 'Unbegrenzte Rapporte & Offerten',
    badge: 'Meistgewählt',
    paidCta: '14 Tage testen',
  },
  footer: {
    blurb: 'Die Plattform für das Schweizer Baugewerbe.',
    platformTitle: 'Die Plattform',
    platformDevis: 'Offerten & Angebote',
    platformFactures: 'Rechnungen & Zahlungen',
    platformChantiers: 'Baustellen & Rapporte',
    platformRh: 'Personal & Lohn',
    platformRentabilite: 'Rentabilität',
    discoverTitle: 'Cantia entdecken',
    discoverFeatures: 'Alle Funktionen',
    discoverPricing: 'Preise',
    discoverMetier: 'Ihr Gewerbe',
    discoverIntegrations: 'Integrationen',
    discoverSurMesure: 'Massgeschneidert',
    resourcesTitle: 'Ressourcen',
    resourcesHelp: 'Hilfe-Center',
    resourcesMobile: 'Mobile App',
    resourcesBlog: 'Blog',
    resourcesContact: 'Kontakt',
    resourcesLogin: 'Anmelden',
    legalLink: 'Impressum',
    statusLink: 'Systemstatus',
    partnersLink: 'Partnerprogramm',
    fiduciaryLink: 'Für Treuhänder',
    productsTitle: 'Produkte',
    productsApp: 'Cantia für Unternehmen',
    privacyLink: 'Datenschutz',
    cgvLink: 'AGB',
    copyright: '© {year} Cantia. Entwickelt für das Schweizer Baugewerbe.',
  },
};

const it: Dict = {
  landingNav: {
    features: 'Funzionalità',
    pricing: 'Prezzi',
    help: 'Assistenza',
    contact: 'Contatto',
    login: 'Accedi',
    signup: 'Registrati',
    mobileApp: 'App mobile',
  },
  hero: {
    kicker: 'Software di cantiere per le imprese edili svizzere',
    titlePrefix: 'Gestisca i suoi cantieri,',
    titleHighlight: 'non la sua',
    crossedText: 'amministrazione.',
    lede: 'Preventivi, fatture QR, rapporti di cantiere, pianificazione e salari in un unico strumento. La squadra registra sul campo dal telefono, lei ritrova tutto in ufficio.',
    cta: 'Provi 14 giorni',
    secondaryCta: 'Vedere i prezzi',
    facts: ['Da CHF 39.– al mese', '14 giorni di prova, senza impegno', 'Dati ospitati a Zurigo'],
    trustCount: '+{{count}} imprese del settore edile si fidano già di noi',
    cartouche: [
      { label: 'Oggetto', value: 'Software di gestione del cantiere' },
      { label: 'Per', value: 'Imprese da 1 a 25 persone' },
      { label: 'Lingue', value: 'Français, Deutsch, Italiano' },
      { label: 'Hosting', value: 'Zurigo, Svizzera' },
    ],
  },
  trust: {
    locationLabel: 'Progettato e ospitato in Svizzera',
    title: 'Svizzero, dal server alla fattura QR.',
    text: 'I suoi dati restano in Svizzera, le sue fatture seguono le regole svizzere, e quando chiama qualcuno le risponde.',
    cards: [
      { label: 'Fatturazione svizzera', title: 'Fatture QR conformi, in franchi svizzeri', text: 'Fatture QR, IVA e acconti: gli strumenti per fatturare i suoi clienti in Svizzera.' },
      { label: 'Il suo modo di lavorare', title: 'Le sue prestazioni e i suoi prezzi, non i nostri', text: 'Ritrova le sue prestazioni abituali e invia documenti a sua immagine.' },
      { label: 'Un contatto diretto', title: 'Un contatto diretto, per telefono o e-mail', text: 'Ci contatti per telefono o e-mail per le sue domande e le sue esigenze.' },
    ],
    contactCta: 'Contattare Cantia',
  },
  profession: {
    eyebrow: 'Il suo mestiere ha le sue abitudini',
    title: 'Adattato al suo mestiere',
    text: 'Un carpentiere non prepara i suoi cantieri come un pittore. Cantia si adatta al suo mestiere, con modelli e documenti che può personalizzare.',
    links: [
      { label: 'Carpenteria', slug: 'charpentier' },
      { label: 'Muratura', slug: 'macon' },
      { label: 'Pittura', slug: 'peintre' },
      { label: 'Elettricità', slug: 'electricien' },
      { label: 'Falegnameria', slug: 'menuisier' },
      { label: 'Genio civile', slug: 'genie-civil' },
    ],
    allLink: 'Scopra tutti i mestieri',
    personalTitle: 'Regolato su come lavora lei',
    items: [
      { title: 'Le sue prestazioni', text: 'Il suo catalogo, i suoi prezzi e i suoi modelli di preventivo seguono il suo modo di calcolare.' },
      { title: 'La sua identità', text: 'Il suo logo e i suoi colori accompagnano i documenti inviati ai clienti.' },
      { title: 'La sua organizzazione', text: 'Adatta gli accessi alle responsabilità di ogni membro della squadra.' },
    ],
  },
  stories: {
    title: 'Sei situazioni che conosce',
    subtitle: 'Gli imprevisti fanno parte del mestiere. L’amministrazione non dovrebbe complicarli.',
    exploreLabel: 'Esplora tutte le funzionalità',
    hint: 'Clicchi su una situazione o usi le frecce per passare alla successiva.',
    respondLabel: 'Cantia risponde',
    prevLabel: 'Situazione precedente',
    nextLabel: 'Situazione successiva',
    pauseLabel: 'Metti in pausa',
    playLabel: 'Riproduci',
    cases: [
      {
        id: 'devis',
        tab: 'Preventivi',
        context: 'Preventivi & offerte',
        question: 'Ancora preventivi\ndopo il cantiere?',
        responseTitle: 'Il preventivo avanza durante il sopralluogo.',
        responseText: 'Detti o inserisca le sue prestazioni. Cantia riprende il suo catalogo per preparare un’offerta che lei verifica prima di inviarla.',
        steps: ['Dettare o inserire', 'Regolare', 'Inviare'],
        linkLabel: 'Scopra i preventivi',
        linkSlug: 'devis',
        concreteLabel: 'Sul cantiere',
        concreteText: '«12 m² di parquet in rovere, con preparazione del supporto e posa.»',
      },
      {
        id: 'chantier',
        tab: 'Cantieri',
        context: 'Monitoraggio del cantiere',
        question: 'Dov’è il piano?\nE l’ultima foto?',
        responseTitle: 'Piani, foto e messaggi restano nel cantiere.',
        responseText: 'Piani, messaggi e foto restano collegati al progetto. Le sue note sul campo possono poi alimentare un rapporto da rileggere e condividere.',
        steps: ['Documentare', 'Raccogliere', 'Condividere'],
        linkLabel: 'Scopra il monitoraggio e i rapporti',
        linkSlug: 'rapports-chantier',
        concreteLabel: 'Sul cantiere',
        concreteText: '«Il supporto è umido dietro la parete divisoria. Aggiungo le foto al cantiere.»',
      },
      {
        id: 'extras',
        tab: 'Supplementi',
        context: 'Lavori supplementari',
        question: '«Visto che\nc’è già…»',
        responseTitle: 'Il supplemento viene firmato prima di essere eseguito.',
        responseText: 'Calcoli il supplemento e lo faccia firmare online. Dopo l’accettazione, Cantia genera una fattura dedicata.',
        steps: ['Calcolare', 'Far firmare', 'Fatturare'],
        linkLabel: 'Scopra i lavori supplementari',
        linkSlug: 'travaux-supplementaires',
        concreteLabel: 'Sul cantiere',
        concreteText: '«Potrebbe anche riverniciare la porta del garage?»',
      },
      {
        id: 'equipe',
        tab: 'Squadre',
        context: 'Squadre, ore & salari',
        question: 'Chi ha fatto cosa,\ne quante ore?',
        responseTitle: 'Ognuno registra le sue ore, l’ufficio le ritrova.',
        responseText: 'I dipendenti registrano le loro ore e spese per cantiere. Le persone autorizzate ritrovano i dati per il monitoraggio e i salari.',
        steps: ['Pianificare', 'Registrare', 'Sfruttare'],
        linkLabel: 'Scopra ore e salari',
        linkSlug: 'rh-salaires',
        concreteLabel: 'Sul cantiere',
        concreteText: '«4 h alla Villa des Vignes, 3 h alla Résidence du Parc e 18 km di spostamento.»',
      },
      {
        id: 'paiements',
        tab: 'Fatture',
        context: 'Fatturazione & incassi',
        question: 'Fatturato.\nMa incassato?',
        responseTitle: 'Ogni versamento è collegato alla sua fattura.',
        responseText: 'Crei una fattura QR, richieda un acconto e registri i pagamenti. Il saldo restante segue i versamenti ricevuti.',
        steps: ['Fatturare', 'Registrare il pagamento', 'Seguire il saldo'],
        linkLabel: 'Scopra la fatturazione',
        linkSlug: 'facturation',
        concreteLabel: 'Sul cantiere',
        concreteText: '«Su questa fattura di CHF 6’000, il cliente ha già versato CHF 2’000.»',
      },
      {
        id: 'pilotage',
        tab: 'Redditività',
        context: 'Redditività & liquidità',
        question: 'Lavoro fatto, sì.\nMa margine?',
        responseTitle: 'Veda quanto le rende ogni cantiere.',
        responseText: 'Confronti il preventivo con le spese e il costo della manodopera. Anticipi anche incassi e uscite con la liquidità a 90 giorni.',
        steps: ['Raccogliere i costi', 'Confrontare', 'Decidere'],
        linkLabel: 'Scopra la redditività',
        linkSlug: 'rentabilite',
        concreteLabel: 'Sul cantiere',
        concreteText: '«Abbiamo impiegato più ore del previsto. Cosa cambia per questo cantiere?»',
      },
    ],
  },
  catalog: {
    title: 'Tutte le funzioni, ordinate per uso',
    subtitle: 'Ogni riga rimanda alla sua pagina dettagliata.',
    columns: { ref: 'Pagina', usage: 'Uso', content: 'Cosa è incluso' },
    planNote: 'I moduli e i diritti disponibili dipendono dalla sua formula.',
    comparePlans: 'Confronta le offerte',
    groups: [
      {
        title: 'Preparare un’offerta',
        subtitle: 'Dal primo contatto al preventivo accettato.',
        linkLabel: 'Esplora questo uso',
        linkSlug: 'devis',
        items: [
          { title: 'Clienti', text: 'Ritrovi i dati di contatto del cliente e li riutilizzi nei suoi documenti.' },
          { title: 'Catalogo di prestazioni', text: 'Memorizzi descrizioni, prezzi e unità; individui gli scostamenti di prezzo.' },
          { title: 'Modelli di preventivo', text: 'Riparta dalle sue prestazioni abituali e adatti le quantità.' },
          { title: 'Computi metrici', text: 'Dettagli le quantità necessarie per la quantificazione.' },
          { title: 'Preventivo e firma', text: 'Prepari il PDF, lo condivida e ne segua lo stato fino all’accettazione.' },
        ],
      },
      {
        title: 'Fatturare e seguire i pagamenti',
        subtitle: 'Dall’acconto al saldo del cantiere.',
        linkLabel: 'Esplora questo uso',
        linkSlug: 'facturation',
        items: [
          { title: 'Conversione del preventivo', text: 'Riprenda le voci accettate nella fattura, senza reinserirle.' },
          { title: 'Fatture QR svizzere', text: 'Generi la polizza QR con il suo IBAN e il riferimento di pagamento.' },
          { title: 'Acconti', text: 'Fatturi una parte del preventivo e ritrovi la deduzione sulla fattura finale.' },
          { title: 'Versamenti e scadenze', text: 'Registri i pagamenti parziali, consulti i saldi e riconcili i riferimenti.' },
          { title: 'Lavori supplementari', text: 'Calcoli un extra, lo faccia firmare e ritrovi la sua fattura dopo l’accettazione.' },
        ],
      },
      {
        title: 'Documentare il cantiere',
        subtitle: 'Ciò che la squadra vede, dice e realizza.',
        linkLabel: 'Esplora questo uso',
        linkSlug: 'rapports-chantier',
        items: [
          { title: 'Feed di squadra', text: 'Scambi messaggi e note vocali nel cantiere.' },
          { title: 'Piani e documenti', text: 'Ordini i file in cartelle e sottocartelle.' },
          { title: 'Foto e localizzazione', text: 'Conservi le foto, la loro data e ora e la loro posizione geografica.' },
          { title: 'Rapporti', text: 'Raccolga note e foto in un rapporto da rileggere, firmare ed esportare.' },
          { title: 'Subappaltatori', text: 'Ritrovi le imprese coinvolte e i loro documenti nel progetto.' },
        ],
      },
      {
        title: 'Lavorare in squadra',
        subtitle: 'Il cantiere e l’ufficio, con gli accessi giusti.',
        linkLabel: 'Esplora questo uso',
        linkSlug: 'rh-salaires',
        items: [
          { title: 'Pianificazione condivisa', text: 'Assegni i membri ai cantieri e consulti la settimana dal telefono.' },
          { title: 'Ore ed esportazioni', text: 'Registri le ore per giorno e cantiere; esporti i fogli in CSV.' },
          { title: 'Spese professionali', text: 'Segua gli spostamenti e le altre spese legate ai dipendenti.' },
          { title: 'Profili e salari', text: 'Inserisca salario fisso o tariffa oraria e contributi per i calcoli lordo/netto.' },
          { title: 'Ruoli e permessi', text: 'Definisca i moduli accessibili; limiti l’accesso alle informazioni sensibili.' },
        ],
      },
      {
        title: 'Gestire i costi',
        subtitle: 'I dati del cantiere al servizio delle decisioni.',
        linkLabel: 'Esplora questo uso',
        linkSlug: 'tresorerie',
        items: [
          { title: 'Spese', text: 'Ritrovi gli acquisti dei cantieri e le spese generali.' },
          { title: 'Inserimento per foto o voce', text: 'Prepari una spesa a partire da una ricevuta o da una dettatura, poi la verifichi.' },
          { title: 'Redditività', text: 'Confronti il preventivo accettato con i costi di materiale e manodopera.' },
          { title: 'Liquidità a 90 giorni', text: 'Proietti incassi e uscite a partire dal suo saldo inserito manualmente.' },
          { title: 'Costi ricorrenti', text: 'Segua abbonamenti, affitti e altre scadenze, con promemoria.' },
        ],
      },
      {
        title: 'Adattare Cantia alla sua impresa',
        subtitle: 'Il suo mestiere, i suoi documenti, la sua organizzazione.',
        linkLabel: 'Parliamo della sua esigenza',
        linkSlug: 'sur-mesure',
        items: [
          { title: 'Dettatura e assistente', text: 'Detti messaggi e documenti o interroghi i dati della sua impresa.' },
          { title: 'Documenti personalizzati', text: 'Applichi logo, colori e identità della sua impresa.' },
          { title: 'Computer e mobile', text: 'Ritrovi Cantia in ufficio e sul campo.' },
          { title: 'Bexio, se necessario', text: 'Colleghi i suoi dati Bexio oppure usi Cantia in autonomia.' },
          { title: 'Moduli privati su misura', text: 'Faccia studiare un modulo riservato alla sua impresa secondo la sua esigenza.' },
        ],
      },
    ],
  },
  team: {
    eyebrow: 'Dall’ufficio al cantiere',
    titlePrefix: 'Il titolare, l’ufficio e il cantiere',
    titleEm: 'nello stesso strumento.',
    text: 'Il titolare guida, l’ufficio organizza e i dipendenti fanno arrivare ciò che succede in cantiere. Ognuno ritrova gli strumenti che gli sono utili, con gli accessi che lei assegna.',
    roles: [
      { number: 'Direzione', title: 'Mantenga la visione d’insieme.', text: 'Cantieri, preventivi, fatture e redditività: le informazioni si uniscono per aiutarla a decidere.', tags: ['Guidare', 'Decidere'] },
      { number: 'Ufficio', title: 'Faccia avanzare le pratiche.', text: 'Segretariato o amministrazione: dia accesso ai documenti, alla pianificazione e ai moduli necessari ogni giorno.', tags: ['Organizzare', 'Preparare'] },
      { number: 'Cantiere', title: 'Condivida ciò che succede.', text: 'I dipendenti registrano le loro ore per cantiere, si scambiano messaggi nel feed del progetto e aggiungono i loro rapporti dal telefono.', tags: ['Timbrare', 'Scambiare', 'Documentare'] },
    ],
    permTitle: 'Ognuno vede ciò che gli serve, e niente di più.',
    permText: 'Crei i suoi ruoli e scelga i moduli accessibili. Un dipendente può compilare le sue ore e seguire il suo cantiere senza accedere alla fatturazione.',
    permNote: 'Esempi di organizzazione. Ruoli personalizzati e moduli disponibili secondo il suo piano. HR a partire dal piano Squadra.',
    permLink: 'Scopra il lavoro di squadra',
  },
  automation: {
    eyebrow: 'Con la tastiera o con la voce',
    title: 'Detti in cantiere, rilegga in ufficio.',
    text: 'Lei inserisce o detta, Cantia prepara la bozza, lei conferma.',
    tag: 'A MODO SUO',
    commandTitle: 'Un rapporto, un preventivo o una fattura, preparati da ciò che dice.',
    commandText: 'Lavori manualmente con le sue prestazioni, quantità e documenti. Oppure detti ciò di cui ha bisogno: Cantia la aiuta a preparare il passo successivo.\n\nLei rilegge, regola, convalida.',
    link: 'Scopra la dettatura e l’assistente',
    tryLabel: 'Provi un esempio di dettatura',
    choices: { site: 'Cantiere', quote: 'Preventivo', invoice: 'Fattura' },
    examples: {
      site: { text: '«Prepara un rapporto per la Villa des Vignes: posa del parquet terminata in soggiorno.»', result: 'Un rapporto collegato al cantiere giusto.' },
      quote: { text: '«Prepara un preventivo per la fornitura e posa di 12 m² di parquet in rovere.»', result: 'Un’offerta preparata con il suo catalogo.' },
      invoice: { text: '«Prepara la fattura a partire dal preventivo accettato per la Villa des Vignes.»', result: 'Una fattura preparata a partire dal preventivo.' },
    },
    resultLabel: 'CANTIA L’AIUTA A PREPARARE',
    resultNote: 'Una bozza da rileggere e convalidare.',
    note: 'Esempi illustrativi · Questa animazione non registra alcun suono.',
    animateLabel: 'Riproduci',
    animatingLabel: 'Animazione',
  },
  terrain: {
    eyebrow: 'Cantia su tutti i suoi schermi',
    title: 'Il cantiere sul telefono, l’ufficio sul computer.',
    text: 'Un dettaglio da fotografare, un piano da consultare, ore da registrare: aggiunga l’informazione dove il lavoro si svolge. La ritrovi poi in ufficio, nello stesso cantiere.',
    points: [
      { label: 'Computer', text: 'Preventivi, fatture e gestione' },
      { label: 'Tablet', text: 'Piani, rapporti e monitoraggio del cantiere' },
      { label: 'Telefono', text: 'Foto, ore e informazioni dal campo' },
    ],
    installCta: 'Accedi a Cantia',
    installNote: 'Applicazione 100% web, senza nulla da scaricare — aggiungibile alla schermata principale come collegamento.\nVersioni App Store e Google Play in sviluppo.',
  },
  tailored: {
    eyebrow: 'Quando la sua impresa ha un’esigenza tutta sua',
    title: 'Un’esigenza che nessuno copre? Possiamo svilupparla.',
    text: 'Un processo particolare, un monitoraggio di settore o un’esigenza che i moduli esistenti non coprono? Possiamo studiare uno sviluppo su misura per la sua impresa.',
    cta: 'Parliamo della sua esigenza',
    steps: [
      { num: '01', title: 'Partiamo dal suo quotidiano.', text: 'Ci spieghi cosa fa, cosa manca e cosa desidera semplificare.' },
      { num: '02', title: 'Definiamo una risposta adatta.', text: 'Funzionamento, perimetro e condizioni dello sviluppo vengono definiti insieme.' },
      { num: '03', title: 'Un modulo riservato alla sua impresa.', text: 'Un modulo privato può essere integrato nel suo spazio Cantia e riservato ai suoi collaboratori autorizzati.' },
    ],
    link: 'Scopra di più sul su misura',
  },
  bexio: {
    eyebrow: 'Una connessione, se ne ha bisogno',
    title: 'Usa Bexio? Cantia si collega.',
    text: 'Usa già Bexio? Colleghi i suoi dati di clienti, fatture e pagamenti per scoprire Cantia in continuità con la sua organizzazione. Senza Bexio, può usare Cantia in modo autonomo.',
    link: 'Veda l’integrazione',
  },
  fiduciary: {
    badge: 'fiduciario',
    title: 'Il suo fiduciario lavora con lei, direttamente in Cantia.',
    text: 'Gli dia un accesso in sola lettura a fatture, pagamenti e contabilità: niente più documenti inviati per e-mail. Sceglie lei cosa vede. Per i fiduciari è gratuito.',
    link: 'Spazio fiduciari',
  },
  products: {
    eyebrow: 'Prodotti',
    title: 'Un ecosistema per tutta l’edilizia.',
    items: [
      { name: 'Cantia', tag: 'Per le imprese', text: 'Preventivi, fatture QR, cantieri, rapporti, ore e salari. Il software di gestione delle imprese edili.', cta: 'Provare gratis' },
      { name: 'Cantia Fiduciari', tag: 'Gratuito per i fiduciari', text: 'Tutti i dati contabili dei suoi mandanti, le richieste di documenti e le scadenze IVA in un unico posto.', cta: 'Scoprire lo spazio' },
      { name: 'Cantia Partners', tag: 'Programma partner', text: 'Raccomandi Cantia e riceva il 25 % dei pagamenti di ogni impresa presentata, per 12 mesi.', cta: 'Diventare partner' },
    ],
  },
  docCustomization: {
    eyebrow: 'I suoi documenti, a sua immagine',
    title: 'Preventivi e fatture nei suoi colori, con il QR svizzero',
    text: 'Ogni preventivo e ogni fattura generati da Cantia riprendono il colore e il logo della sua impresa — e ogni fattura include la polizza di versamento QR svizzera, pronta per la scansione.',
    points: [
      { title: 'Colore del marchio', text: 'Scelga il suo colore in Account > Aspetto: colora automaticamente intestazione, tabella e totali.' },
      { title: 'Il suo logo', text: 'Aggiunga il suo logo e scelga la sua posizione — a sinistra, al centro o a destra dell’intestazione.' },
      { title: 'Fattura QR svizzera', text: 'Ogni fattura include la polizza di versamento QR direttamente sul documento, pronta per essere scansionata.' },
    ],
    link: 'Scopra la fatturazione',
  },
  documents: {
    eyebrow: 'Export reali',
    title: 'I documenti che ricevono i suoi clienti e i suoi dipendenti',
    intro: 'Generati da Cantia con dati di esempio: stessa impaginazione, stessi calcoli dei suoi documenti.',
    hint: 'Scelga un documento per vedere cosa contiene.',
    docs: [
      {
        id: 'facture', tab: 'Fattura QR', alt: 'Fattura con polizza QR svizzera generata da Cantia',
        points: [
          { title: 'Il colore della sua impresa', text: 'Intestazione della tabella, totali e riquadri prendono il colore scelto in Account > Aspetto.' },
          { title: 'Il suo logo e i suoi dati', text: 'Nome, indirizzo, IDI e contatti in testa a ogni documento, logo a sinistra, al centro o a destra.' },
          { title: 'Polizza QR svizzera', text: 'La polizza di versamento QR è stampata sulla fattura, con il suo IBAN e il riferimento di pagamento.' },
        ],
        link: 'Scoprire la fatturazione', linkSlug: 'facturation',
      },
      {
        id: 'devis', tab: 'Preventivo firmato', alt: 'Preventivo firmato elettronicamente dal cliente, generato da Cantia',
        points: [
          { title: 'Riferimento e validità', text: 'Numerazione automatica, data e scadenza del preventivo in un riquadro leggibile.' },
          { title: 'Le sue prestazioni, i suoi prezzi', text: 'Le righe vengono dal suo catalogo; quantità, unità, IVA e totale sono calcolati.' },
          { title: 'Firma elettronica del cliente', text: 'Il cliente firma online; firma, nome, data e ora sono integrati nel PDF.' },
        ],
        link: 'Scoprire i preventivi', linkSlug: 'devis',
      },
      {
        id: 'rapport', tab: 'Rapporto di cantiere', alt: 'Rapporto di cantiere con foto generato da Cantia',
        points: [
          { title: 'L’essenziale in due righe', text: 'Il riassunto nasce da note, foto e dettature della giornata. Lei rilegge prima di inviare.' },
          { title: 'Ogni constatazione con la sua foto', text: 'Le foto del cantiere sono accanto al punto che documentano.' },
          { title: 'I punti di attenzione risaltano', text: 'Un imprevisto o un supplemento da fatturare viene evidenziato perché nessuno lo perda.' },
          { title: 'Il seguito', text: 'Il rapporto termina con i prossimi passi: getto, consegna, disarmo.' },
        ],
        link: 'Scoprire i rapporti di cantiere', linkSlug: 'rapports-chantier',
      },
      {
        id: 'salaire', tab: 'Conteggio salariale', alt: 'Conteggio salariale svizzero generato da Cantia',
        points: [
          { title: 'Ore riprese dalla timbratura', text: 'Le ore registrate dal dipendente sui cantieri danno il salario del mese, senza reinserirle.' },
          { title: 'Deduzioni svizzere', text: 'AVS/AI/IPG, disoccupazione, AINP, LPP e IGM, con le sue aliquote.' },
          { title: 'Netto da versare', text: 'Salario netto e IBAN del dipendente, pronti per il pagamento.' },
        ],
        link: 'Scoprire ore e salari', linkSlug: 'rh-salaires',
      },
    ],
  },
  faq: {
    eyebrow: 'Prima di iniziare',
    title: 'Domande frequenti',
    link: 'Consulti il centro assistenza',
    items: [
      { q: 'A chi si rivolge Cantia?', a: 'A indipendenti e imprese dell’edilizia svizzera: muratura, carpenteria, pittura, elettricità, genio civile e altri mestieri delle costruzioni.' },
      { q: 'Cantia funziona anche senza Bexio?', a: 'Sì. Può gestire la sua attività in Cantia da solo. L’integrazione Bexio permette di ritrovare i suoi dati in entrambi gli strumenti se usa già Bexio.' },
      { q: 'Come si usa Cantia sul telefono?', a: 'Apra Cantia nel suo browser e lo aggiunga alla schermata principale. Le versioni App Store e Google Play sono in sviluppo.' },
      { q: 'Cosa comprende la prova di 14 giorni?', a: 'I nuovi account dispongono di 14 giorni di prova, senza codice promozionale. Scelga la sua formula al momento della registrazione e ne consulti le condizioni prima di confermare.' },
      { q: 'Posso dare accesso alla mia squadra?', a: 'Sì. Secondo la sua formula, può invitare fino a 3, 10 o 25 membri e definirne i ruoli. Per una squadra più grande, contatti Cantia.' },
    ],
  },
  closing: {
    eyebrow: 'Pronto a provare?',
    titlePrefix: 'Inizi dal suo',
    titleEm: 'prossimo cantiere.',
    text: 'Crei un preventivo, apra un cantiere, inviti la sua squadra. Ha 14 giorni per giudicare, senza impegno.',
    cta: 'Provi 14 giorni',
    contact: 'Parli con il team Cantia',
  },
  pricing: {
    title: 'Un prezzo in base alla sua squadra',
    subtitle: 'Tutte le formule iniziano con 14 giorni di prova completa, senza codice promozionale.',
    monthly: 'Fatturazione mensile',
    yearly: 'Fatturazione annuale',
    yearlySavings: '-20%',
    billedYearly: 'Fatturato {amount}/anno',
    storageSuffix: 'GB di spazio',
    memberSingular: 'membro',
    memberPlural: 'membri',
    unlimited: 'Rapporti & preventivi illimitati',
    badge: 'Il più scelto',
    paidCta: 'Provi 14 giorni',
  },
  footer: {
    blurb: 'La piattaforma per l’edilizia svizzera.',
    platformTitle: 'La piattaforma',
    platformDevis: 'Preventivi & offerte',
    platformFactures: 'Fatture & pagamenti',
    platformChantiers: 'Cantieri & rapporti',
    platformRh: 'Personale & salari',
    platformRentabilite: 'Redditività',
    discoverTitle: 'Scopri Cantia',
    discoverFeatures: 'Tutte le funzionalità',
    discoverPricing: 'Prezzi',
    discoverMetier: 'Il suo mestiere',
    discoverIntegrations: 'Integrazioni',
    discoverSurMesure: 'Su misura',
    resourcesTitle: 'Risorse',
    resourcesHelp: 'Centro assistenza',
    resourcesMobile: 'App mobile',
    resourcesBlog: 'Blog',
    resourcesContact: 'Contatto',
    resourcesLogin: 'Accedi',
    legalLink: 'Note legali',
    statusLink: 'Stato del servizio',
    partnersLink: 'Programma partner',
    fiduciaryLink: 'Per i fiduciari',
    productsTitle: 'Prodotti',
    productsApp: 'Cantia per le imprese',
    privacyLink: 'Privacy',
    cgvLink: 'Condizioni generali',
    copyright: '© {year} Cantia. Pensato per l’edilizia svizzera.',
  },
};

export function useMarketingDict(): Dict {
  const { i18n } = useTranslation();
  return i18n.language === 'de' ? de : i18n.language === 'it' ? it : fr;
}

export const t: Dict = fr;
