interface FeatureItem {
  title: string;
  text: string;
  detail: string[];
}

interface Dict {
  nav: { services: string; pricing: string; download: string; login: string; cta: string };
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
    monthly: string;
    yearly: string;
    yearlySavings: string;
    billedYearly: string;
    storageSuffix: string;
    memberSingular: string;
    memberPlural: string;
    unlimited: string;
    surveyFeature: string;
    badge: string;
    freeCta: string;
    paidCta: string;
  };
  swiss: { title: string; text: string };
  mobile: { title: string; text: string; comingSoon: string; appStore: string; googlePlay: string };
  finalCta: { title: string; button: string };
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
  nav: { services: 'Services', pricing: 'Tarifs', download: 'Télécharger', login: 'Se connecter', cta: 'Essayer gratuitement' },
  hero: {
    kicker: 'L’application métier du bâtiment suisse',
    headlinePrefix: 'L’application qui gère votre administratif,',
    headlineHighlight: 'pendant que vous gérez le chantier',
    subheadline:
      'Cantia est l’application tout-en-un des entreprises du bâtiment : rapports, devis, factures et documents générés automatiquement depuis le terrain. Une seule saisie, zéro ressaisie au bureau.',
    cta1: 'Créer mon compte gratuitement',
    cta2: 'Se connecter',
  },
  spotlight: {
    title: 'La technologie qui change tout',
    subtitle: 'Des automatisations que personne d’autre ne propose en Suisse.',
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
      text: 'Chaque facture inclut automatiquement le bulletin de versement QR suisse, prêt à être scanné depuis n’importe quelle appli bancaire.',
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
    title: 'Le bâtiment perd du temps sur l’administratif',
    items: [
      {
        title: 'Notes papier qui se perdent',
        text: 'Les informations notées sur le chantier se perdent ou arrivent incomplètes au bureau.',
      },
      {
        title: 'Rapports faits le soir, en retard',
        text: 'Reconstituer un rapport propre à partir de photos éparpillées prend un temps fou.',
      },
      {
        title: 'Documents introuvables',
        text: 'Vos plans, soumissions et photos sont éparpillés entre le classeur, les e-mails et le téléphone.',
      },
    ],
  },
  services: {
    title: 'Tout ce qu’il faut, du chantier au bureau',
    subtitle: 'Cliquez sur un service pour voir précisément ce qu’il fait.',
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
        title: 'Levés & cadastre suisse',
        text: 'Positionnez vos points de chantier directement sur le cadastre et l’orthophoto officiels de la Suisse, puis exportez-les en DXF, CSV, XML ou GPX.',
        detail: [
          'Carte interactive avec cadastre et orthophoto officiels suisses',
          'Ajout de points par position GPS ou directement sur la carte',
          'Export DXF, LandXML, CSV ou GPX — réservé aux plans payants',
        ],
      },
      {
        title: 'Pensé pour l’équipe',
        text: 'Cantia s’adapte à votre taille, de l’artisan indépendant à l’entreprise avec plusieurs collaborateurs et des rôles différents.',
        detail: [
          'Rôles propriétaire, administrateur et membre',
          'Ajout de collaborateurs selon votre plan',
          'Paramètres d’entreprise centralisés : TVA, logo, mentions',
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
    monthly: 'Facturation mensuelle',
    yearly: 'Facturation annuelle',
    yearlySavings: '-20%',
    billedYearly: 'Facturé {amount}/an',
    storageSuffix: 'Go de stockage',
    memberSingular: 'membre',
    memberPlural: 'membres',
    unlimited: 'Rapports & devis illimités',
    surveyFeature: 'Levés & cadastre suisse',
    badge: 'Le plus choisi',
    freeCta: 'Commencer gratuitement',
    paidCta: 'Choisir ce plan',
  },
  swiss: {
    title: 'Conçu pour le marché suisse',
    text: 'Les montants sont en francs suisses, la TVA suisse est intégrée par défaut, et vous avez accès au cadastre et à l’orthophoto officiels. Cantia a été pensé dès le départ pour les PME et les artisans indépendants du pays.',
  },
  mobile: {
    title: 'Bientôt sur mobile',
    text: 'L’application fonctionne dès aujourd’hui sur ordinateur, tablette et téléphone. Les applications natives App Store et Google Play arrivent prochainement.',
    comingSoon: 'Bientôt disponible',
    appStore: 'App Store',
    googlePlay: 'Google Play',
  },
  finalCta: {
    title: 'Essayez Cantia sur votre prochain chantier',
    button: 'Créer mon compte gratuitement',
  },
  footer: {
    blurb: 'L’application de gestion de chantier pour le bâtiment suisse. Rapports, documents, devis, factures, levés et métré, tous au même endroit.',
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
