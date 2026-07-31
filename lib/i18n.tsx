import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'fr' | 'en' | 'de';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
];

interface FeatureItem {
  title: string;
  text: string;
  detail: string[];
}

interface Dict {
  nav: { services: string; pricing: string; login: string; cta: string };
  hero: { kicker: string; headline: string; subheadline: string; cta1: string; cta2: string };
  showcase: {
    title: string;
    subtitle: string;
    feedCaption: string;
    reportCaption: string;
    devisNewCaption: string;
    devisCaption: string;
  };
  pain: { title: string; items: { title: string; text: string }[] };
  services: { title: string; subtitle: string; items: FeatureItem[] };
  trades: { title: string; note: string; list: string[] };
  pricing: {
    title: string;
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
  nav: { services: 'Services', pricing: 'Tarifs', login: 'Se connecter', cta: 'Essayer gratuitement' },
  hero: {
    kicker: 'Pour les entreprises du bâtiment en Suisse',
    headline: 'Moins de temps sur l’administratif, plus de temps sur le chantier',
    subheadline:
      'Cantia regroupe vos rapports de chantier, vos devis et vos documents en un seul endroit. Vous saisissez une fois, sur le terrain, et tout est mis en forme automatiquement.',
    cta1: 'Créer mon compte gratuitement',
    cta2: 'Se connecter',
  },
  showcase: {
    title: 'Cantia, concrètement',
    subtitle: 'Du fil de chantier au document fini, sans ressaisie.',
    feedCaption: 'Notes, photos et messages vocaux géolocalisés — toute l’équipe voit tout en temps réel.',
    reportCaption: 'L’IA transforme le fil de la journée en rapport prêt à envoyer, automatiquement.',
    devisNewCaption: 'Décrivez vos postes, Cantia calcule les sous-totaux au fur et à mesure.',
    devisCaption: 'Un devis professionnel, TVA et conditions incluses, généré en quelques minutes.',
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
    subtitle: 'Touchez un service pour voir en détail ce qu’il fait vraiment.',
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
        text: 'Transformez vos notes de rendez-vous en devis chiffré en quelques minutes, avec suivi du statut et plusieurs modèles de PDF au choix.',
        detail: [
          '4 modèles de PDF au choix : classique, moderne, minimal, structuré',
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
    text: 'L’application web fonctionne dès aujourd’hui sur ordinateur, tablette et téléphone. Les applications natives arrivent prochainement, avec la connexion à un récepteur RTK pour les levés de précision.',
    comingSoon: 'Bientôt disponible',
    appStore: 'App Store',
    googlePlay: 'Google Play',
  },
  finalCta: {
    title: 'Essayez Cantia sur votre prochain chantier',
    button: 'Créer mon compte gratuitement',
  },
  footer: {
    blurb: 'La plateforme de gestion de chantier pour le bâtiment suisse. Rapports, documents, devis, levés et métré, tous au même endroit.',
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

const en: Dict = {
  nav: { services: 'Services', pricing: 'Pricing', login: 'Log in', cta: 'Try it free' },
  hero: {
    kicker: 'For Swiss construction businesses',
    headline: 'Less time on paperwork, more time on site',
    subheadline:
      'Cantia brings your site reports, quotes and documents together in one place. You capture everything once, on site, and it’s formatted automatically.',
    cta1: 'Create my free account',
    cta2: 'Log in',
  },
  showcase: {
    title: 'Cantia, up close',
    subtitle: 'From the site feed to the finished document, without retyping anything.',
    feedCaption: 'Notes, photos and geolocated voice messages — the whole team sees everything in real time.',
    reportCaption: 'AI turns the day’s feed into a ready-to-send report, automatically.',
    devisNewCaption: 'Describe your line items, Cantia calculates the subtotals as you go.',
    devisCaption: 'A professional quote, VAT and terms included, generated in a few minutes.',
  },
  pain: {
    title: 'Construction loses time on paperwork',
    items: [
      {
        title: 'Paper notes that get lost',
        text: 'Information written down on site gets lost, or arrives incomplete back at the office.',
      },
      {
        title: 'Reports written late in the evening',
        text: 'Rebuilding a clean report from scattered photos takes a surprising amount of time.',
      },
      {
        title: 'Documents you can never find',
        text: 'Your plans, tenders and photos end up scattered across the binder, your inbox and your phone.',
      },
    ],
  },
  services: {
    title: 'Everything you need, from site to office',
    subtitle: 'Tap a service to see exactly what it does.',
    items: [
      {
        title: 'Automatic site reports',
        text: 'Your notes and photos from site, geolocated automatically, become a ready-to-send PDF report with your logo and signature.',
        detail: [
          'Photos automatically timestamped and geolocated',
          'PDF generated in one tap, with your logo and signature',
          'Full history available anytime, per site',
        ],
      },
      {
        title: 'Documents, organised by folder',
        text: 'Every site gets its own digital binder, with folders and subfolders for your plans and tenders.',
        detail: [
          'Unlimited folders and subfolders, per site',
          'Any file type: plans, PDFs, photos, contracts',
          'Find a document again in seconds',
        ],
      },
      {
        title: 'A smart photo gallery',
        text: 'All the photos from a site end up in one place. Filter them by date and see where each one was taken on the map.',
        detail: [
          'All site photos grouped automatically',
          'Filter by date: last 7 days, last 30 days, or everything',
          'Open a photo’s location directly on the map',
        ],
      },
      {
        title: 'Quotes in minutes',
        text: 'Turn your meeting notes into a priced quote in minutes, with status tracking and several PDF templates to choose from.',
        detail: [
          '4 PDF templates: classic, modern, minimal, structured',
          'VAT and totals calculated automatically',
          'Status tracking: draft, sent, accepted, refused',
        ],
      },
      {
        title: 'Documents that look like you',
        text: 'Pick your brand color, your logo placement, and create several templates for your quote and report PDFs.',
        detail: [
          'Customizable brand color and logo placement',
          'Several templates per document type, pick one at creation',
          'Paid plans only (from Independent)',
        ],
      },
      {
        title: 'Item-by-item quantities',
        text: 'Break your quantities down item by item, with totals calculated automatically, then turn it all into a quote in one tap.',
        detail: [
          'Item table with reference, quantity and unit',
          'Automatic totals per unit (m², m³, running metre…)',
          'One-tap transfer into a pre-filled quote',
        ],
      },
      {
        title: 'Survey points & Swiss cadastre',
        text: 'Place your site survey points directly on Switzerland’s official cadastre and aerial imagery, then export them as DXF, CSV, XML or GPX.',
        detail: [
          'Interactive map with the official Swiss cadastre and aerial imagery',
          'Add points by GPS position or straight from the map',
          'Export to DXF, LandXML, CSV or GPX — paid plans only',
        ],
      },
      {
        title: 'Built for your team',
        text: 'Cantia grows with you, from a solo tradesperson to a company with several teammates and different roles.',
        detail: [
          'Owner, admin and member roles',
          'Add teammates depending on your plan',
          'Company settings centralised: VAT, logo, terms',
        ],
      },
    ],
  },
  trades: {
    title: 'Built for your trade',
    note: 'Every account adapts to your trade, with report templates, a VAT rate and a quote layout already set up.',
    list: ['Civil engineering', 'Masonry', 'Locksmithing', 'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Tiling'],
  },
  pricing: {
    title: 'A plan for every team size',
    storageSuffix: 'GB storage',
    memberSingular: 'member',
    memberPlural: 'members',
    unlimited: 'Unlimited reports & quotes',
    surveyFeature: 'Survey points & Swiss cadastre',
    badge: 'Most popular',
    freeCta: 'Start for free',
    paidCta: 'Choose this plan',
  },
  swiss: {
    title: 'Built for the Swiss market',
    text: 'Amounts are shown in Swiss francs, Swiss VAT is included by default, and you get access to the official cadastre and aerial imagery. Cantia was built from day one for Swiss SMEs and independent tradespeople.',
  },
  mobile: {
    title: 'Coming soon on mobile',
    text: 'The web app already works today on computer, tablet and phone. Native apps are coming soon, with support for connecting an RTK receiver for precision surveying.',
    comingSoon: 'Coming soon',
    appStore: 'App Store',
    googlePlay: 'Google Play',
  },
  finalCta: {
    title: 'Try Cantia on your next site',
    button: 'Create my free account',
  },
  footer: {
    blurb: 'The site management platform for Swiss construction. Reports, documents, quotes, surveys and quantities, all in one place.',
    product: 'Product',
    account: 'Account',
    legal: 'Legal',
    servicesLink: 'Services',
    pricingLink: 'Pricing',
    login: 'Log in',
    signup: 'Create an account',
    legalLink: 'Legal notice',
    privacyLink: 'Privacy',
    copyright: '© {year} Cantia. Built for Swiss construction.',
  },
};

const de: Dict = {
  nav: { services: 'Leistungen', pricing: 'Preise', login: 'Anmelden', cta: 'Kostenlos testen' },
  hero: {
    kicker: 'Für Bauunternehmen in der Schweiz',
    headline: 'Weniger Zeit für Administration, mehr Zeit auf der Baustelle',
    subheadline:
      'Cantia bündelt Ihre Baustellenrapporte, Offerten und Dokumente an einem Ort. Sie erfassen alles einmal, direkt vor Ort, und es wird automatisch aufbereitet.',
    cta1: 'Kostenloses Konto erstellen',
    cta2: 'Anmelden',
  },
  showcase: {
    title: 'Cantia im Detail',
    subtitle: 'Vom Baustellen-Feed bis zum fertigen Dokument, ohne alles neu abzutippen.',
    feedCaption: 'Notizen, Fotos und georeferenzierte Sprachnachrichten — das ganze Team sieht alles in Echtzeit.',
    reportCaption: 'Die KI macht aus dem Tages-Feed automatisch einen versandfertigen Rapport.',
    devisNewCaption: 'Beschreiben Sie Ihre Posten, Cantia berechnet die Zwischensummen laufend.',
    devisCaption: 'Eine professionelle Offerte, MWST und Bedingungen inklusive, in wenigen Minuten erstellt.',
  },
  pain: {
    title: 'Der Bau verliert Zeit mit Administration',
    items: [
      {
        title: 'Papiernotizen gehen verloren',
        text: 'Notizen von der Baustelle gehen verloren oder kommen unvollständig im Büro an.',
      },
      {
        title: 'Rapporte, abends und verspätet erstellt',
        text: 'Am Abend aus verstreuten Fotos einen sauberen Rapport zusammenzustellen, kostet erstaunlich viel Zeit.',
      },
      {
        title: 'Dokumente, die man nicht wiederfindet',
        text: 'Pläne, Offerten und Fotos verteilen sich auf den Ordner, die E-Mails und das Handy.',
      },
    ],
  },
  services: {
    title: 'Alles, was Sie brauchen, von der Baustelle bis ins Büro',
    subtitle: 'Tippen Sie auf eine Leistung, um genau zu sehen, was sie kann.',
    items: [
      {
        title: 'Automatische Baustellenrapporte',
        text: 'Ihre Notizen und Fotos von der Baustelle, automatisch georeferenziert, werden zu einem versandfertigen PDF-Rapport mit Ihrem Logo und Ihrer Unterschrift.',
        detail: [
          'Fotos automatisch mit Zeitstempel und Standort versehen',
          'PDF mit einem Klick erstellt, mit Logo und Unterschrift',
          'Vollständige Historie jederzeit pro Baustelle abrufbar',
        ],
      },
      {
        title: 'Dokumente in Ordnerstruktur',
        text: 'Jede Baustelle hat ihren eigenen digitalen Ordner, mit Unterordnern für Pläne und Offerten.',
        detail: [
          'Unbegrenzt viele Ordner und Unterordner pro Baustelle',
          'Jeder Dateityp: Pläne, PDFs, Fotos, Verträge',
          'Ein Dokument in Sekunden wiederfinden',
        ],
      },
      {
        title: 'Intelligente Fotogalerie',
        text: 'Alle Fotos einer Baustelle landen am selben Ort. Filtern Sie nach Datum und sehen Sie den Standort jedes Fotos auf der Karte.',
        detail: [
          'Alle Baustellenfotos automatisch gruppiert',
          'Filter nach Datum: 7 Tage, 30 Tage oder die gesamte Historie',
          'Standort direkt auf der Karte öffnen',
        ],
      },
      {
        title: 'Offerten in wenigen Minuten',
        text: 'Verwandeln Sie Besprechungsnotizen in wenigen Minuten in eine kalkulierte Offerte, mit Statusverfolgung und mehreren PDF-Vorlagen zur Auswahl.',
        detail: [
          '4 PDF-Vorlagen: klassisch, modern, minimal, strukturiert',
          'MwSt. und Summen automatisch berechnet',
          'Statusverfolgung: Entwurf, versendet, angenommen, abgelehnt',
        ],
      },
      {
        title: 'Dokumente in Ihrem Look',
        text: 'Wählen Sie Ihre Markenfarbe und Logoplatzierung und erstellen Sie mehrere Vorlagen für Ihre Offerten- und Rapport-PDFs.',
        detail: [
          'Anpassbare Markenfarbe und Logoplatzierung',
          'Mehrere Vorlagen pro Dokumenttyp, wählbar bei der Erstellung',
          'Nur für kostenpflichtige Pläne (ab Selbstständig)',
        ],
      },
      {
        title: 'Aufmass, Position für Position',
        text: 'Erfassen Sie Ihre Mengen Position für Position, mit automatisch berechneten Summen, und wandeln Sie alles mit einem Klick in eine Offerte um.',
        detail: [
          'Positionstabelle mit Referenz, Menge und Einheit',
          'Automatische Summen pro Einheit (m², m³, lfm…)',
          'Übertragung in eine vorausgefüllte Offerte mit einem Klick',
        ],
      },
      {
        title: 'Vermessung & Schweizer Kataster',
        text: 'Platzieren Sie Ihre Vermessungspunkte direkt auf dem offiziellen Schweizer Kataster und Orthofoto und exportieren Sie sie als DXF, CSV, XML oder GPX.',
        detail: [
          'Interaktive Karte mit offiziellem Schweizer Kataster und Orthofoto',
          'Punkte per GPS-Position oder direkt auf der Karte hinzufügen',
          'Export als DXF, LandXML, CSV oder GPX — nur mit kostenpflichtigem Plan',
        ],
      },
      {
        title: 'Gemacht für Ihr Team',
        text: 'Cantia wächst mit Ihnen mit, vom selbstständigen Handwerker bis zum Unternehmen mit mehreren Mitarbeitenden und unterschiedlichen Rollen.',
        detail: [
          'Rollen: Inhaber, Administrator, Mitglied',
          'Teammitglieder je nach Plan hinzufügen',
          'Firmeneinstellungen zentral: MwSt., Logo, Bedingungen',
        ],
      },
    ],
  },
  trades: {
    title: 'Gemacht für Ihr Gewerk',
    note: 'Jedes Konto passt sich Ihrem Gewerk an, mit vorkonfigurierten Rapportvorlagen, MwSt.-Satz und Offertenlayout.',
    list: ['Tiefbau', 'Maurerei', 'Schlosserei', 'Elektro', 'Sanitär', 'Schreinerei', 'Malerei', 'Plattenlegerei'],
  },
  pricing: {
    title: 'Ein Plan für jede Teamgrösse',
    storageSuffix: 'GB Speicherplatz',
    memberSingular: 'Mitglied',
    memberPlural: 'Mitglieder',
    unlimited: 'Unbegrenzt Rapporte & Offerten',
    surveyFeature: 'Vermessung & Schweizer Kataster',
    badge: 'Am beliebtesten',
    freeCta: 'Kostenlos starten',
    paidCta: 'Diesen Plan wählen',
  },
  swiss: {
    title: 'Gemacht für den Schweizer Markt',
    text: 'Beträge in Schweizer Franken, Schweizer MwSt. standardmässig inbegriffen, Zugang zum offiziellen Kataster und Orthofoto. Cantia wurde von Anfang an für Schweizer KMU und selbstständige Handwerker entwickelt.',
  },
  mobile: {
    title: 'Bald auf dem Handy',
    text: 'Die Web-App funktioniert schon heute auf Computer, Tablet und Smartphone. Native Apps folgen in Kürze, mit Anbindung an einen RTK-Empfänger für präzise Vermessungen.',
    comingSoon: 'Bald verfügbar',
    appStore: 'App Store',
    googlePlay: 'Google Play',
  },
  finalCta: {
    title: 'Testen Sie Cantia auf Ihrer nächsten Baustelle',
    button: 'Kostenloses Konto erstellen',
  },
  footer: {
    blurb: 'Die Plattform für Baustellenverwaltung im Schweizer Bauwesen. Rapporte, Dokumente, Offerten, Vermessung und Aufmass, alles an einem Ort.',
    product: 'Produkt',
    account: 'Konto',
    legal: 'Rechtliches',
    servicesLink: 'Leistungen',
    pricingLink: 'Preise',
    login: 'Anmelden',
    signup: 'Konto erstellen',
    legalLink: 'Impressum',
    privacyLink: 'Datenschutz',
    copyright: '© {year} Cantia. Gemacht für das Schweizer Bauwesen.',
  },
};

const DICTS: Record<Lang, Dict> = { fr, en, de };

const PLAN_NAMES: Record<string, Record<Lang, string>> = {
  free: { fr: 'Gratuit', en: 'Free', de: 'Gratis' },
  solo: { fr: 'Indépendant', en: 'Independent', de: 'Selbstständig' },
  equipe: { fr: 'Équipe', en: 'Team', de: 'Team' },
  pro: { fr: 'Entreprise', en: 'Business', de: 'Unternehmen' },
};

export function planLabel(planId: string, fallbackName: string, lang: Lang): string {
  return PLAN_NAMES[planId]?.[lang] ?? fallbackName;
}

const STORAGE_KEY = 'opus:lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'fr' || stored === 'en' || stored === 'de') setLangState(stored);
    });
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: DICTS[lang] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
