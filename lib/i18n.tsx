interface FeatureItem {
  title: string;
  text: string;
  detail: string[];
}

interface Dict {
  nav: { services: string; pricing: string; download: string; help: string; login: string; cta: string };
  hero: { kicker: string; headlinePrefix: string; headlineHighlight: string; subheadline: string; cta1: string; cta2: string; trust: string };
  spotlight: {
    title: string;
    subtitle: string;
    voice: { label: string; listening: string; transcript: string; resultTitle: string; resultLines: string[]; caption: string };
    qrbill: { label: string; title: string; text: string; badge: string };
    catalog: { label: string; title: string; text: string; items: { name: string; match: number }[] };
  };
  pain: { title: string; items: { title: string; text: string }[] };
  services: { title: string; subtitle: string; items: FeatureItem[] };
  trades: { title: string; note: string; list: string[] };
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
  swiss: { title: string; text: string };
  devices: { title: string; text: string; benefits: { title: string; text: string }[] };
  mobile: { title: string; text: string; installCta: string; storeNote: string; comingSoon: string; appStore: string; googlePlay: string };
  finalCta: { title: string; subtitle: string; button: string; trust: string[] };
  footer: {
    blurb: string;
    product: string;
    account: string;
    legal: string;
    servicesLink: string;
    pricingLink: string;
    login: string;
    signup: string;
    legalLink: string;
    privacyLink: string;
    copyright: string;
  };
}

const fr: Dict = {
  nav: { services: 'Services', pricing: 'Tarifs', download: 'Télécharger', help: 'Documentation', login: 'Se connecter', cta: 'Essayer Cantia' },
  hero: {
    kicker: 'Conçu pour le bâtiment suisse 🇨🇭',
    headlinePrefix: 'Gérez vos chantiers.',
    headlineHighlight: 'Pas votre administratif.',
    subheadline:
      'Cantia est le logiciel de gestion conçu pour les entreprises du bâtiment suisse. Devis, factures, planning, rapports et rentabilité réunis au même endroit, au bureau comme sur le chantier.',
    cta1: 'Démarrer mon essai de 14 jours',
    cta2: 'Découvrir Cantia',
    trust: '14 jours d’essai · Aucun code nécessaire · Hébergé en Suisse',
  },
  spotlight: {
    title: 'Des automatisations pensées pour le quotidien du bâtiment',
    subtitle: 'De la dictée du devis au QR-facture, Cantia automatise les tâches qui vous font perdre du temps entre le chantier et le bureau.',
    voice: {
      label: 'Dictée vocale',
      listening: 'Écoute en cours…',
      transcript: 'Façade nord, 12 mètres carrés de crépi à refaire, plus fourniture et pose de 3 fenêtres PVC…',
      resultTitle: 'Devis généré automatiquement',
      resultLines: ['Crépi façade nord — 12 m²', 'Fenêtre PVC (fourniture + pose) — 3 pce', 'Total calculé avec TVA'],
      caption: 'Parlez, Cantia rédige. Votre devis est prêt avant même d’avoir quitté le chantier.',
    },
    qrbill: {
      label: 'QR-facture suisse',
      title: 'Payable en un scan',
      text: 'Chaque facture inclut le bulletin de versement QR suisse, scannable depuis n’importe quelle appli bancaire.',
      badge: 'Conforme norme SIX',
    },
    catalog: {
      label: 'Catalogue intelligent',
      title: 'Vos prix, mémorisés',
      text: 'Chaque devis enrichit votre catalogue. La prochaine fois, Cantia reconnaît vos prestations et propose déjà le bon prix.',
      items: [
        { name: 'Fenêtre PVC double vitrage', match: 96 },
        { name: 'Pose et étanchéité périphérique', match: 91 },
        { name: 'Volet roulant alu sur mesure', match: 88 },
      ],
    },
  },
  pain: {
    title: 'L’administratif ne vous coûte pas que du temps. Il vous coûte de l’argent.',
    items: [
      {
        title: 'Vos devis attendent le soir. Vos clients, eux, n’attendent pas.',
        text: 'Après une journée de chantier, il reste encore les offres à rédiger. Cantia permet de préparer un devis directement depuis le terrain et de réutiliser vos prestations habituelles.',
      },
      {
        title: 'Photos, notes et décisions finissent partout sauf au bon endroit.',
        text: 'WhatsApp, galerie du téléphone, papier, mails : Cantia rassemble l’historique directement dans le chantier concerné.',
      },
      {
        title: 'Un chantier peut perdre de l’argent bien avant que vous le remarquiez.',
        text: 'Comparez les heures, dépenses et montants facturés pendant le chantier pour détecter les écarts avant la fin des travaux.',
      },
    ],
  },
  services: {
    title: 'Cantia relie le terrain et le bureau dans le même outil',
    subtitle: 'Le premier tiers de la page montre le résultat, le reste prouve l’étendue du produit. Cliquez sur un service pour voir précisément ce qu’il fait.',
    items: [
      {
        title: 'Du rendez-vous au devis sans refaire le travail le soir',
        text: 'Dictez vos lignes de devis à la voix depuis le chantier et laissez l’IA les chiffrer avec votre catalogue, TVA et totaux calculés, prêt à envoyer.',
        detail: [
          'Dictée vocale, catalogue de prestations réutilisables et prix mémorisés',
          'Calcul automatique de la TVA et des totaux, PDF à votre couleur de marque',
          'Envoi au client puis transformation en facture en un clic, sans ressaisie',
        ],
      },
      {
        title: 'Tout ce qui s’est passé sur le chantier reste avec le chantier',
        text: 'Vos notes et photos, géolocalisées automatiquement, deviennent un rapport PDF prêt à envoyer avec votre logo et votre signature.',
        detail: [
          'Photos automatiquement horodatées et géolocalisées',
          'Remarques, documents et historique classés par chantier',
          'PDF généré en un clic, consultable à tout moment',
        ],
      },
      {
        title: 'Toute l’équipe sait où elle doit être',
        text: 'Un planning central par employé et par chantier, pour ne plus avoir à appeler le patron afin de savoir où aller demain.',
        detail: [
          'Vue par membre et par jour, consultable par toute l’équipe',
          'Chaque affectation liée à un chantier précis',
          'Plusieurs chantiers en parallèle sans conflit de ressources',
        ],
      },
      {
        title: 'Le chantier est terminé. La facture ne devrait pas attendre.',
        text: 'Transformez un devis accepté en facture QR-suisse en un clic, avec suivi du statut jusqu’au paiement.',
        detail: [
          'Facture générée depuis le devis, sans ressaisie',
          'QR-facture conforme, payable en un scan',
          'Statut de paiement suivi en direct, relances facilitées',
        ],
      },
      {
        title: 'Sachez ce que chaque chantier vous rapporte réellement',
        text: 'Comparez en direct heures, dépenses, montant devisé et montant facturé pour repérer une marge qui s’effrite avant la fin des travaux.',
        detail: [
          'Comparaison devisé vs coût réel (matériel et main d’œuvre)',
          'Alerte visuelle dès qu’un chantier s’écarte de sa marge prévue',
          'Vue chantier par chantier, pas seulement en fin de mois',
        ],
      },
      {
        title: 'Documents en arborescence',
        text: 'Chaque chantier a son propre classeur numérique, avec des dossiers et sous-dossiers pour vos plans et soumissions.',
        detail: [
          'Dossiers et sous-dossiers illimités, par chantier',
          'Tout type de fichier : plans, PDF, photos, contrats',
          'Retrouvez un document en quelques secondes',
        ],
      },
      {
        title: 'Galerie photos intelligente',
        text: 'Toutes les photos d’un chantier se retrouvent au même endroit. Filtrez-les par date et repérez où elles ont été prises sur la carte.',
        detail: [
          'Toutes les photos d’un chantier regroupées automatiquement',
          'Filtres par date : 7 jours, 30 jours ou tout l’historique',
          'Ouverture directe de la localisation sur la carte',
        ],
      },
      {
        title: 'Un espace client sécurisé',
        text: 'Chaque devis et chaque facture est accessible via un lien unique et privé : votre client consulte, signe et suit le paiement sans jamais créer de compte.',
        detail: [
          'Signature électronique horodatée, conservée en preuve',
          'Statut de paiement visible en direct, avant même votre relance',
          'Historique complet des devis et factures, classé par chantier',
        ],
      },
      {
        title: 'Documents à votre image',
        text: 'Choisissez la couleur de votre marque, le placement de votre logo, et créez plusieurs modèles pour vos devis et rapports PDF.',
        detail: [
          'Couleur de marque et placement du logo personnalisables',
          'Plusieurs modèles par type de document, à choisir à la création',
          'Disponible dès le plan Essentiel',
        ],
      },
      {
        title: 'Métré poste par poste',
        text: 'Détaillez vos quantités poste par poste, avec des totaux calculés automatiquement, puis transformez le tout en devis en un clic.',
        detail: [
          'Tableau de postes avec référence, quantité et unité',
          'Totaux automatiques par unité (m², m³, ml…)',
          'Transfert en un clic vers un devis pré-rempli',
        ],
      },
      {
        title: 'Pensé pour l’équipe',
        text: 'Créez des rôles sur mesure et décidez précisément qui voit quoi — devis, factures, planning — sans tout donner à tout le monde.',
        detail: [
          'Rôles personnalisables avec accès à cocher par domaine',
          'Finance, Métré, Planning et Documents gérés séparément',
          'Ajout de collaborateurs selon votre plan',
        ],
      },
      {
        title: 'Coordination des sous-traitants',
        text: 'Ajoutez les entreprises sous-traitées sur chaque chantier, suivez leurs interventions et gardez leurs attestations d’assurance à portée de main.',
        detail: [
          'Répertoire de sous-traitants réutilisable d’un chantier à l’autre',
          'Statut d’intervention et dates de passage par chantier',
          'Attestation d’assurance RC stockée et datée, plus d’oubli',
        ],
      },
    ],
  },
  trades: {
    title: 'Pensé pour votre métier',
    note: 'Chaque compte s’adapte à votre métier, avec des modèles de rapports, un taux de TVA et une mise en page de devis déjà configurés.',
    list: ['Génie civil', 'Maçonnerie', 'Serrurerie', 'Électricité', 'Plomberie', 'Menuiserie', 'Peinture', 'Carrelage'],
  },
  pricing: {
    title: 'Choisissez la formule adaptée à votre entreprise',
    subtitle: 'Tous les nouveaux comptes commencent par 14 jours d’essai complet, sans code promotionnel.',
    monthly: 'Facturation mensuelle',
    yearly: 'Facturation annuelle',
    yearlySavings: '-20%',
    billedYearly: 'Facturé {amount}/an',
    storageSuffix: 'Go de stockage',
    memberSingular: 'membre',
    memberPlural: 'membres',
    unlimited: 'Rapports & devis illimités',
    badge: 'Le plus choisi',
    paidCta: 'Démarrer l’essai de 14 jours',
  },
  swiss: {
    title: 'Pensé en Suisse, pas juste traduit pour la Suisse',
    text: 'Cantia a été développé pour le fonctionnement des entreprises du bâtiment suisse : CHF, TVA suisse, QR-facture et données hébergées en Suisse.',
  },
  devices: {
    title: 'Gérez vos chantiers, où que vous soyez',
    text: 'Au bureau, sur le chantier ou en déplacement, retrouvez Cantia sur ordinateur, tablette et smartphone.',
    benefits: [
      { title: 'Au bureau', text: 'Préparez devis, factures et analyses.' },
      { title: 'Sur le chantier', text: 'Ajoutez rapports, photos et heures.' },
      { title: 'En déplacement', text: 'Accédez à vos informations depuis votre téléphone.' },
    ],
  },
  mobile: {
    title: 'Cantia vous suit aussi sur le terrain',
    text: "Ouvrez Cantia depuis votre téléphone ou votre tablette et ajoutez-le à votre écran d'accueil pour y accéder rapidement, en plein écran, comme à vos autres applications, dès aujourd'hui et sans passer par un store.",
    installCta: 'Comment l’installer',
    storeNote: 'Les versions officielles arrivent aussi :',
    comingSoon: 'En développement',
    appStore: 'App Store',
    googlePlay: 'Google Play',
  },
  finalCta: {
    title: 'Essayez Cantia sur votre prochain chantier',
    subtitle: 'Créez votre compte et découvrez pendant 14 jours comment Cantia rassemble vos devis, chantiers, rapports et factures au même endroit.',
    button: 'Démarrer mes 14 jours d’essai',
    trust: ['14 jours d’essai · Aucun code nécessaire', 'Résiliable à tout moment', 'Hébergé en Suisse'],
  },
  footer: {
    blurb: 'L’application de gestion de chantier pour le bâtiment suisse. Rapports, documents, devis, factures et métré, tous au même endroit.',
    product: 'Produit',
    account: 'Compte',
    legal: 'Légal',
    servicesLink: 'Services',
    pricingLink: 'Tarifs',
    login: 'Se connecter',
    signup: 'Créer un compte',
    legalLink: 'Mentions légales',
    privacyLink: 'Confidentialité',
    copyright: '© {year} Cantia. Conçu pour le bâtiment suisse.',
  },
};


export const t: Dict = fr;
