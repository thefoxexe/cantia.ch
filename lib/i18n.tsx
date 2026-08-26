interface FeatureItem {
  title: string;
  text: string;
  detail: string[];
}

interface Dict {
  nav: { services: string; pricing: string; download: string; help: string; login: string; cta: string };
  hero: { kicker: string; headlinePrefix: string; headlineHighlight: string; subheadline: string; cta1: string; cta2: string };
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
    freeCta: string;
    paidCta: string;
  };
  swiss: { title: string; text: string };
  devices: { title: string; text: string; benefits: { title: string; text: string }[] };
  mobile: { title: string; text: string; comingSoon: string; appStore: string; googlePlay: string };
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
  nav: { services: 'Services', pricing: 'Tarifs', download: 'Télécharger', help: 'Documentation', login: 'Se connecter', cta: 'Essayer gratuitement' },
  hero: {
    kicker: 'L’application métier du bâtiment suisse',
    headlinePrefix: 'Le logiciel de gestion de chantier',
    headlineHighlight: 'pensé pour les entreprises du bâtiment en Suisse',
    subheadline:
      'Devis, factures, planning, rapports, heures et rentabilité réunis dans une seule application accessible partout.',
    cta1: 'Essayer gratuitement',
    cta2: 'Découvrir Cantia',
  },
  spotlight: {
    title: 'Ça, aucun autre éditeur suisse ne le fait',
    subtitle: 'Trois automatisations qui vous font gagner du temps dès le premier devis.',
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
        title: 'Le devis le plus rapide gagne le chantier',
        text: 'Le temps de le rédiger le soir sur un coin de table, le client a déjà signé ailleurs.',
      },
      {
        title: 'Personne ne sait qui est où, ni sur quoi',
        text: 'Le planning vit dans la tête du patron ou sur un tableau blanc — deux équipes se croisent, un chantier attend.',
      },
      {
        title: 'Des factures parties, jamais relancées',
        text: 'Personne ne sait qui doit quoi ni depuis quand. L’argent dort chez vos clients, pas dans votre trésorerie.',
      },
      {
        title: 'Le chantier n’arrive jamais intact au bureau',
        text: 'Notes sur un carnet, photos sur trois téléphones — le rapport du soir recolle les morceaux, avec des trous.',
      },
    ],
  },
  services: {
    title: 'Tout ce qu’il faut, du chantier au bureau',
    subtitle: 'Dix outils, une seule application — cliquez sur un service pour voir précisément ce qu’il fait.',
    items: [
      {
        title: 'Rapports de chantier automatiques',
        text: 'Vos notes et photos de chantier, géolocalisées automatiquement, deviennent un rapport PDF prêt à envoyer avec votre logo et votre signature.',
        detail: [
          'Photos automatiquement horodatées et géolocalisées',
          'PDF généré en un clic, avec votre logo et votre signature',
          'Historique complet consultable à tout moment, par chantier',
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
        title: 'Devis en quelques minutes',
        text: 'Dictez vos lignes de devis à la voix et laissez l’IA les chiffrer avec votre catalogue, avec suivi du statut jusqu’à la facture.',
        detail: [
          'PDF sobre et personnalisable à votre couleur de marque',
          'Calcul automatique de la TVA et des totaux',
          'Suivi de statut : brouillon, envoyé, accepté, refusé',
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
          'Réservé aux plans payants (dès Indépendant)',
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
    title: 'Un plan pour chaque taille d’équipe',
    subtitle: '14 jours d’essai gratuit sur toutes les fonctionnalités, sans carte bancaire.',
    monthly: 'Facturation mensuelle',
    yearly: 'Facturation annuelle',
    yearlySavings: '-20%',
    billedYearly: 'Facturé {amount}/an',
    storageSuffix: 'Go de stockage',
    memberSingular: 'membre',
    memberPlural: 'membres',
    unlimited: 'Rapports & devis illimités',
    badge: 'Le plus choisi',
    freeCta: 'Commencer gratuitement',
    paidCta: 'Choisir ce plan',
  },
  swiss: {
    title: 'Pensé en Suisse, pas juste traduit pour la Suisse',
    text: 'Pas une application américaine retouchée à la dernière minute. Cantia a été construit ici, pour les PME et les indépendants du bâtiment suisse — depuis le premier jour.',
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
    title: 'Bientôt sur mobile',
    text: 'Les applications natives App Store et Google Play arrivent prochainement, pour une expérience encore plus rapide sur téléphone.',
    comingSoon: 'Bientôt disponible',
    appStore: 'App Store',
    googlePlay: 'Google Play',
  },
  finalCta: {
    title: 'Essayez Cantia sur votre prochain chantier',
    subtitle: 'Créez votre compte en deux minutes. Le premier devis sera prêt avant d’avoir quitté le chantier.',
    button: 'Essayer gratuitement',
    trust: ['14 jours d’essai gratuit', 'Sans carte bancaire', 'Hébergé en Suisse'],
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

const PLAN_NAMES: Record<string, string> = {
  free: 'Gratuit',
  solo: 'Indépendant',
  equipe: 'Équipe',
  pro: 'Entreprise',
};

export function planName(planId: string, fallbackName: string): string {
  return PLAN_NAMES[planId] ?? fallbackName;
}
