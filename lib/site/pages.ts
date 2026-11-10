// Texts of the software pages of cantia.ch (November 2026 identity): one page
// per family (Signer, Organiser, Collaborer, Facturer, Piloter), the
// assistant page and the overview of every feature. Plan mentions follow the
// plans table: planning, HR, profitability, treasury and Bexio from Équipe
// (Team), sales follow-up with automatic reminders from Entreprise.

import type { SiteLocale } from './copy';

export type FamilyKey = 'signer' | 'organiser' | 'collaborer' | 'facturer' | 'piloter';
export const FAMILY_KEYS: FamilyKey[] = ['signer', 'organiser', 'collaborer', 'facturer', 'piloter'];

export type Tool = { title: string; text: string; badge?: string; more?: string };
export type Step = { title: string; text: string };
export type Faq = { q: string; a: string };

export interface FamilyContent {
  seoTitle: string;
  seoDescription: string;
  name: string;
  eyebrow: string;
  h1Plain: string;
  h1Accent: string;
  lead: string;
  tags: string[];
  toolsTitle: string;
  toolsNote: string;
  tools: Tool[];
  steps: Step[];
  faq: Faq[];
  related: FamilyKey[];
  intro: string; // one line for the overview page
}

export interface PageLabels {
  home: string;
  software: string;
  subnav: [string, string, string, string];
  tryCta: string;
  compare: string;
  more: string;
  toolsEyebrow: string;
  stepsEyebrow: string;
  stepsTitle: string;
  faqEyebrow: string;
  faqTitle: string;
  relatedEyebrow: string;
  relatedTitle: string;
  sample: string;
  realExport: string;
  openPdf: string;
  showcaseEyebrow: string;
  showcasePlain: string;
  showcaseAccent: string;
  showcaseText: string;
  showcaseNote: string;
  planningShowcase: { plain: string; accent: string; text: string };
  planning: { tag: string; week: string; title: string; sub: string; team: string; days: string[]; legend: string };
  treasury: { tag: string; horizon: string; amount: string; sub: string; lines: [string, string][]; total: [string, string]; caption: string };
  docAlt: { signer: string; organiser: string; collaborer: string; facturer: string };
  appAlt: string;
  treasuryAlt: string;
  appScreen: string;
}

export interface AssistantContent {
  seoTitle: string;
  seoDescription: string;
  name: string;
  eyebrow: string;
  h1Plain: string;
  h1Accent: string;
  lead: string;
  quotas: string;
  usesEyebrow: string;
  usesPlain: string;
  usesAccent: string;
  usesNote: string;
  uses: { title: string; text: string; link: string; slug: string }[];
  calloutStrong: string;
  callout: string;
}

export interface FeaturesContent {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  h1Plain: string;
  h1Accent: string;
  lead: string;
  all: string;
  search: string;
  searchLabel: string;
  explore: string;
  empty: string;
  calloutStrong: string;
  callout: string;
  calloutLink: string;
}

type Bundle = { labels: PageLabels; families: Record<FamilyKey, FamilyContent>; assistant: AssistantContent; features: FeaturesContent };

const fr: Bundle = {
  labels: {
    home: 'Accueil',
    software: 'Le logiciel',
    subnav: ['Ce que vous pouvez faire', 'Le parcours', 'Vos questions', 'Les formules'],
    tryCta: 'Essayer Cantia',
    compare: 'Comparer les formules',
    more: 'En savoir plus',
    toolsEyebrow: 'Les outils à votre disposition',
    stepsEyebrow: 'Dans votre quotidien',
    stepsTitle: 'Un parcours qui se suit.',
    faqEyebrow: 'Les réponses utiles',
    faqTitle: 'Avant de commencer.',
    relatedEyebrow: 'La suite du parcours',
    relatedTitle: 'Tout reste connecté.',
    sample: 'Données d’exemple',
    realExport: 'Un vrai export de Cantia',
    openPdf: 'Ouvrir le PDF',
    showcaseEyebrow: 'Un vrai export de Cantia',
    showcasePlain: 'Votre travail.',
    showcaseAccent: 'Votre facture.',
    showcaseText: 'Le document reprend les coordonnées, le logo et les couleurs de l’entreprise. Le bulletin QR accompagne la facture pour le paiement.',
    showcaseNote: 'PDF généré par Cantia avec des données d’exemple.',
    planningShowcase: { plain: 'Le planning du chantier.', accent: 'Prêt à partager.', text: 'Phases, tâches, corps de métier, entreprises intervenantes et avancement : le planning s’exporte en PDF A3, avec la date du jour et la légende, pour le client, l’architecte ou les sous-traitants.' },
    planning: {
      tag: 'PLANNING PARTAGÉ',
      week: '9–13 NOVEMBRE',
      title: 'La semaine de l’équipe.',
      sub: 'Affectations par projet · Données d’exemple',
      team: 'ÉQUIPE',
      days: ['LUN', 'MAR', 'MER', 'JEU', 'VEN'],
      legend: 'VV · VILLA DES VIGNES   AM · BUREAUX   EV · ÉVÉNEMENT',
    },
    treasury: {
      tag: 'TRÉSORERIE PRÉVISIONNELLE',
      horizon: '90 JOURS',
      amount: 'CHF 24’300.–',
      sub: 'Solde projeté dans 90 jours · Données d’exemple',
      lines: [
        ['Solde renseigné aujourd’hui', 'CHF 23’200.–'],
        ['Factures à encaisser', '+ CHF 18’450.–'],
        ['Salaires estimés', '− CHF 14’200.–'],
        ['Charges récurrentes', '− CHF 3’150.–'],
      ],
      total: ['Solde dans 90 jours', 'CHF 24’300.–'],
      caption: 'SOLDE SAISI MANUELLEMENT · AUCUNE CONNEXION BANCAIRE',
    },
    appAlt: 'Tableau de bord de Cantia sur téléphone : planning du jour, tâches et chantiers en cours',
    treasuryAlt: 'Écran Trésorerie de Cantia : solde, projection à 90 jours, entrées et sorties prévues',
    appScreen: 'Le vrai écran de Cantia',
    docAlt: {
      signer: 'Devis signé en ligne par le client, exporté depuis Cantia',
      organiser: 'Planning de chantier PDF exporté depuis Cantia',
      collaborer: 'Rapport de chantier PDF exporté depuis Cantia',
      facturer: 'Facture avec bulletin QR suisse, exportée depuis Cantia',
    },
  },
  families: {
    signer: {
      seoTitle: 'Signer : clients, devis et signature en ligne | Cantia',
      seoDescription: 'Clients, catalogue de prestations, devis à votre image et signature en ligne du client : Cantia relie la première demande au devis signé.',
      name: 'Signer',
      eyebrow: 'Signer avec Cantia',
      h1Plain: 'De la première demande\nau',
      h1Accent: 'devis signé.',
      lead: 'Vos clients, votre catalogue et vos offres dans la même continuité. Préparez un devis avec vos prestations, faites-le accepter et retrouvez la suite dans le projet.',
      tags: ['Dès Essentiel', 'Ordinateur & téléphone', 'Données en Suisse'],
      toolsTitle: 'Clients,\ndevis et signatures.',
      toolsNote: 'Dès Essentiel. Consultez les quotas et les modules inclus dans le comparatif des formules.',
      tools: [
        { title: 'Clients & contacts', text: 'Retrouvez les coordonnées et les informations utiles pour préparer vos offres.' },
        { title: 'Catalogue de prestations', text: 'Enregistrez vos prix, unités et prestations habituelles pour les reprendre dans vos devis.' },
        { title: 'Devis & modèles', text: 'Partez de vos trames, ajustez les quantités et préparez un document à votre image.', more: 'solutions/devis' },
        { title: 'Signature du client', text: 'Le client signe en ligne. La signature et sa date sont intégrées au document.' },
        { title: 'Soumissions', text: 'Préparez vos réponses aux soumissions avec une fonction actuellement en bêta. Les quotas dépendent du plan.', badge: 'Fonction en bêta', more: 'solutions/soumissions' },
        { title: 'Suivi commercial', text: 'Suivez les statuts de vos offres. Le suivi d’ouverture et les relances automatiques sont disponibles avec Entreprise.' },
      ],
      steps: [
        { title: 'Préparez l’offre', text: 'Choisissez le client, ajoutez les prestations de votre catalogue ou dictez vos lignes.' },
        { title: 'Vérifiez et envoyez', text: 'Ajustez prix et quantités, puis envoyez une offre personnalisée à votre client.' },
        { title: 'Passez à la suite', text: 'Après acceptation, retrouvez les lignes du devis pour préparer la facturation.' },
      ],
      faq: [
        { q: 'Puis-je utiliser mes propres prestations ?', a: 'Oui. Votre catalogue contient vos prix, unités et descriptions. Les modèles de devis permettent de réutiliser vos trames.' },
        { q: 'Les soumissions sont-elles disponibles ?', a: 'Oui, en bêta. Les quotas varient selon la formule ; ils sont indiqués dans le comparatif des tarifs.' },
      ],
      related: ['organiser', 'facturer'],
      intro: 'De la demande du client à l’offre acceptée.',
    },
    organiser: {
      seoTitle: 'Organiser : projets, planning et documents | Cantia',
      seoDescription: 'Projets, planning partagé de l’équipe, plans et documents : Cantia regroupe les informations de chaque projet, au bureau comme en déplacement.',
      name: 'Organiser',
      eyebrow: 'Organiser avec Cantia',
      h1Plain: 'Chaque projet.',
      h1Accent: 'Les idées claires.',
      lead: 'Centralisez les documents, répartissez le travail et consultez le planning partagé. Votre équipe retrouve les informations dans le bon projet, au bureau comme en déplacement.',
      tags: ['Projets dès Essentiel · Planning dès Équipe', 'Ordinateur & téléphone', 'Données en Suisse'],
      toolsTitle: 'Projets,\nplanning et documents.',
      toolsNote: 'Projets dès Essentiel · Planning dès Équipe. Consultez les quotas et les modules inclus dans le comparatif des formules.',
      tools: [
        { title: 'Projets & dossiers', text: 'Regroupez les informations autour d’un même projet. Chantier, mandat ou dossier : choisissez le vocabulaire de votre activité.' },
        { title: 'Planning partagé', text: 'Consultez les affectations de chaque membre, jour par jour, sur une même semaine.', more: 'solutions/planning' },
        { title: 'Plans & documents', text: 'Classez les fichiers utiles au projet et retrouvez-les depuis un ordinateur ou un téléphone.' },
        { title: 'Sous-traitants', text: 'Conservez les informations liées aux intervenants et à leur participation au projet.' },
        { title: 'Accès par rôle', text: 'Définissez les modules accessibles selon les responsabilités de chaque personne.' },
        { title: 'Multi-supports', text: 'Utilisez Cantia dans votre navigateur sur ordinateur, tablette ou téléphone.' },
      ],
      steps: [
        { title: 'Ouvrez le projet', text: 'Rassemblez client, documents et informations utiles dans un dossier commun.' },
        { title: 'Répartissez le travail', text: 'Affectez les membres aux projets dans le planning partagé, disponible dès Équipe.' },
        { title: 'Gardez le contexte', text: 'Retrouvez les informations et les documents au même endroit pendant l’exécution.' },
      ],
      faq: [
        { q: 'Puis-je remplacer le mot chantier ?', a: 'Oui. À l’inscription, choisissez entre chantier, projet, mandat ou dossier. Le vocabulaire de l’application et des rapports PDF s’adapte.' },
        { q: 'Le planning est-il accessible sur téléphone ?', a: 'Oui. Chaque membre consulte son planning depuis le navigateur de son téléphone, selon les accès accordés.' },
      ],
      related: ['collaborer', 'piloter'],
      intro: 'Une vue claire de chaque projet et de ses prochaines étapes.',
    },
    collaborer: {
      seoTitle: 'Collaborer : rapports, heures et équipe | Cantia',
      seoDescription: 'Fil d’équipe, rapports PDF avec photos, heures par projet, frais et salaires : Cantia relie ceux qui réalisent et ceux qui organisent.',
      name: 'Collaborer',
      eyebrow: 'Collaborer avec Cantia',
      h1Plain: 'Une équipe.',
      h1Accent: 'Le même fil.',
      lead: 'Les échanges, les heures et les rapports rejoignent le projet concerné. Les employés partagent ce qu’ils réalisent ; le bureau retrouve les informations pour le suivi et les salaires.',
      tags: ['Rapports dès Essentiel · RH dès Équipe', 'Ordinateur & téléphone', 'Données en Suisse'],
      toolsTitle: 'Rapports,\nheures et équipe.',
      toolsNote: 'Rapports dès Essentiel · RH dès Équipe. Consultez les quotas et les modules inclus dans le comparatif des formules.',
      tools: [
        { title: 'Fil d’équipe', text: 'Échangez des messages et des informations dans le contexte du projet.' },
        { title: 'Rapports & photos', text: 'Ajoutez vos constats et photos. Préparez un rapport PDF avec l’aide de la dictée et relisez avant l’envoi.', more: 'solutions/rapports-chantier' },
        { title: 'Heures par projet', text: 'Chaque membre saisit son temps jour par jour, rattaché au projet sur lequel il travaille.' },
        { title: 'Frais professionnels', text: 'Enregistrez les frais et les kilomètres avec une indemnité définie pour l’entreprise.' },
        { title: 'Profils & salaires', text: 'Paramétrez les profils, salaires et cotisations. Les taux sont à ajuster selon votre situation.', more: 'solutions/rh-salaires' },
        { title: 'Rôles & confidentialité', text: 'Réservez les modules et les données sensibles aux personnes autorisées. Les employés retrouvent leurs propres heures et frais.' },
      ],
      steps: [
        { title: 'Partagez sur le moment', text: 'Ajoutez les informations, messages ou photos dans le fil du projet.' },
        { title: 'Consolidez le suivi', text: 'Préparez un rapport à partir des éléments du projet et vérifiez son contenu.' },
        { title: 'Retrouvez les heures', text: 'Consultez les heures et frais saisis pour le suivi de l’équipe et les salaires.' },
      ],
      faq: [
        { q: 'Qui peut consulter les salaires ?', a: 'Les personnes autorisées selon leurs permissions, notamment les administrateurs et la fonction RH. Les employés standards voient leurs propres heures et frais.' },
        { q: 'Les taux de cotisation sont-ils automatiques ?', a: 'Les taux sont paramétrables par employé. Les valeurs indicatives doivent être ajustées selon vos caisses et votre canton ; Cantia calcule le net à partir des taux configurés.' },
      ],
      related: ['organiser', 'piloter'],
      intro: 'L’information circule entre ceux qui organisent et ceux qui réalisent.',
    },
    facturer: {
      seoTitle: 'Facturer : factures QR, acomptes et paiements | Cantia',
      seoDescription: 'Convertissez un devis accepté en facture QR suisse, demandez un acompte et suivez les versements reçus jusqu’au solde.',
      name: 'Facturer',
      eyebrow: 'Facturer avec Cantia',
      h1Plain: 'Du devis accepté\nau',
      h1Accent: 'paiement suivi.',
      lead: 'Convertissez une offre en facture, demandez un acompte et enregistrez les versements. Le bulletin QR suisse fait partie du document, avec les informations de votre entreprise.',
      tags: ['Dès Essentiel', 'Ordinateur & téléphone', 'Données en Suisse'],
      toolsTitle: 'Factures QR,\nacomptes et paiements.',
      toolsNote: 'Dès Essentiel. Consultez les quotas et les modules inclus dans le comparatif des formules.',
      tools: [
        { title: 'Conversion du devis', text: 'Reprenez les lignes et le client d’un devis accepté sans les ressaisir.' },
        { title: 'Factures QR suisses', text: 'Générez vos documents avec le bulletin QR, votre IBAN et la référence de paiement.', more: 'solutions/facturation' },
        { title: 'Acomptes & solde', text: 'Émettez un acompte, puis tenez compte des montants déjà encaissés sur la facture finale.' },
        { title: 'Versements partiels', text: 'Enregistrez les paiements reçus pour tenir le statut et le solde restant à jour.' },
        { title: 'Prestations supplémentaires', text: 'Chiffrez les demandes en plus, faites-les accepter et préparez leur facturation.', more: 'solutions/travaux-supplementaires' },
        { title: 'Documents personnalisés', text: 'Ajoutez votre logo, vos coordonnées et vos couleurs aux documents envoyés aux clients.' },
      ],
      steps: [
        { title: 'Créez la facture', text: 'Partez du devis accepté ou saisissez directement une nouvelle facture.' },
        { title: 'Envoyez le document', text: 'Votre bulletin QR suisse est intégré avec les informations de paiement.' },
        { title: 'Suivez les versements', text: 'Enregistrez les montants reçus et consultez ce qui reste à encaisser.' },
      ],
      faq: [
        { q: 'Cantia encaisse-t-il les paiements à ma place ?', a: 'Non. Le client utilise les informations de la QR-facture pour payer. Vous enregistrez et rapprochez les versements reçus dans Cantia.' },
        { q: 'Puis-je consulter un exemple de facture ?', a: 'Oui. Cette page présente un véritable PDF généré par Cantia avec des données d’exemple.' },
      ],
      related: ['signer', 'piloter'],
      intro: 'Le travail réalisé rejoint la facture, puis le suivi des paiements.',
    },
    piloter: {
      seoTitle: 'Piloter : dépenses, rentabilité et trésorerie | Cantia',
      seoDescription: 'Dépenses, rentabilité par projet et trésorerie prévisionnelle à 90 jours, à partir des informations déjà renseignées dans Cantia.',
      name: 'Piloter',
      eyebrow: 'Piloter avec Cantia',
      h1Plain: 'Les projets en cours.',
      h1Accent: 'Les chiffres en vue.',
      lead: 'Rapprochez revenus, dépenses et temps consacré à vos projets. Consultez la rentabilité et une projection de trésorerie à 90 jours à partir des informations déjà renseignées.',
      tags: ['Dès Équipe', 'Ordinateur & téléphone', 'Données en Suisse'],
      toolsTitle: 'Dépenses,\nrentabilité et trésorerie.',
      toolsNote: 'Dès Équipe. Consultez les quotas et les modules inclus dans le comparatif des formules.',
      tools: [
        { title: 'Dépenses', text: 'Rattachez les coûts à votre activité et saisissez les informations par photo ou à la voix.' },
        { title: 'Rentabilité par projet', text: 'Mettez en regard les montants facturés, les dépenses et les ressources mobilisées.', more: 'solutions/rentabilite' },
        { title: 'Trésorerie à 90 jours', text: 'Projetez les factures à encaisser, les salaires estimés et les dépenses à venir.', more: 'solutions/tresorerie' },
        { title: 'Charges récurrentes', text: 'Enregistrez abonnements, loyers et assurances avec leur fréquence et leur prochaine échéance.' },
        { title: 'Échéances des intervenants', text: 'Retrouvez les factures sous-traitants à régler dans la projection.' },
        { title: 'Intégration Bexio', text: 'Connectez les données clients, factures et paiements si vous utilisez déjà Bexio. Cantia fonctionne aussi seul.', more: 'integrations' },
      ],
      steps: [
        { title: 'Renseignez les données', text: 'Saisissez votre solde et vos charges récurrentes, puis tenez les projets à jour.' },
        { title: 'Consultez la projection', text: 'Retrouvez les entrées et sorties prévues sur un horizon de 90 jours.' },
        { title: 'Décidez avec le contexte', text: 'Gardez en vue les projets, dépenses et échéances qui expliquent les chiffres.' },
      ],
      faq: [
        { q: 'La trésorerie est-elle connectée à mon compte bancaire ?', a: 'Non. Vous renseignez le solde manuellement. La projection utilise les informations enregistrées dans Cantia, sans connexion bancaire.' },
        { q: 'La projection garantit-elle mon solde futur ?', a: 'Non. C’est une prévision fondée sur vos échéances et données renseignées, dont la qualité dépend de leur mise à jour.' },
      ],
      related: ['facturer', 'collaborer'],
      intro: 'Vos données de projet deviennent des repères pour décider.',
    },
  },
  assistant: {
    seoTitle: 'L’assistant Cantia : dictez, relisez, validez | Cantia',
    seoDescription: 'Dictez ou écrivez : l’assistant Cantia prépare un premier brouillon de devis, de rapport ou de facture. Vous relisez, ajustez et validez.',
    name: 'L’assistant Cantia',
    eyebrow: 'À la voix ou au clavier',
    h1Plain: 'Vous dictez.',
    h1Accent: 'Le brouillon prend forme.',
    lead: 'Transformez ce que vous avez en tête en une première version de devis, de rapport ou de facture. Cantia prépare ; vous relisez, ajustez et validez.',
    quotas: 'Voir les quotas',
    usesEyebrow: 'Une aide, là où vous travaillez',
    usesPlain: 'Trois usages.',
    usesAccent: 'La même liberté de saisir.',
    usesNote: 'La saisie au clavier reste disponible. La dictée vient compléter votre façon de travailler.',
    uses: [
      { title: 'Préparer une offre.', text: 'Décrivez les prestations à chiffrer. Retrouvez les références et prix de votre catalogue, puis vérifiez les positions proposées.', link: 'Les devis', slug: 'signer' },
      { title: 'Rédiger un rapport.', text: 'Rassemblez vos notes, messages et photos. Cantia vous aide à structurer un compte rendu que vous relisez avant l’envoi.', link: 'Les rapports', slug: 'collaborer' },
      { title: 'Préparer la facturation.', text: 'Dictez les éléments utiles à votre document. Contrôlez le client, les montants et la TVA avant de finaliser.', link: 'La facturation', slug: 'facturer' },
    ],
    calloutStrong: 'Votre validation reste essentielle.',
    callout: 'L’assistant prépare une proposition. Vérifiez toujours les quantités, les prix, les destinataires et les informations du document avant de l’envoyer. Les quotas d’utilisation dépendent de votre formule.',
  },
  features: {
    seoTitle: 'Toutes les fonctionnalités de Cantia | Cantia',
    seoDescription: 'Devis, signature, projets, planning, rapports, heures, factures QR, dépenses et trésorerie : toutes les fonctionnalités de Cantia, regroupées en cinq usages.',
    eyebrow: 'Le logiciel, par usage',
    h1Plain: 'Un seul outil.',
    h1Accent: 'Toute la continuité.',
    lead: 'Choisissez ce que vous voulez faire. Les fonctionnalités sont regroupées autour de cinq moments de votre activité, du premier échange avec le client au suivi des finances.',
    all: 'Tout explorer',
    search: 'Rechercher : heures, devis…',
    searchLabel: 'Rechercher une fonctionnalité',
    explore: 'Explorer cet usage',
    empty: 'Aucune fonctionnalité trouvée. Essayez « devis », « heures » ou « projet ».',
    calloutStrong: 'Une aide qui traverse tous vos usages.',
    callout: 'La dictée et l’assistant vous aident à préparer les documents.',
    calloutLink: 'Découvrir l’assistant',
  },
};

const de: Bundle = {
  labels: {
    home: 'Startseite',
    software: 'Die Software',
    subnav: ['Was Sie tun können', 'Der Ablauf', 'Ihre Fragen', 'Die Abos'],
    tryCta: 'Cantia testen',
    compare: 'Abos vergleichen',
    more: 'Mehr erfahren',
    toolsEyebrow: 'Ihre Werkzeuge',
    stepsEyebrow: 'In Ihrem Alltag',
    stepsTitle: 'Ein Ablauf, der zusammenhängt.',
    faqEyebrow: 'Die wichtigsten Antworten',
    faqTitle: 'Bevor Sie starten.',
    relatedEyebrow: 'Wie es weitergeht',
    relatedTitle: 'Alles bleibt verbunden.',
    sample: 'Beispieldaten',
    realExport: 'Ein echter Export aus Cantia',
    openPdf: 'PDF öffnen',
    showcaseEyebrow: 'Ein echter Export aus Cantia',
    showcasePlain: 'Ihre Arbeit.',
    showcaseAccent: 'Ihre Rechnung.',
    showcaseText: 'Das Dokument übernimmt Adresse, Logo und Farben Ihres Unternehmens. Der QR-Einzahlungsschein gehört direkt zur Rechnung.',
    showcaseNote: 'Von Cantia erstelltes PDF mit Beispieldaten.',
    planningShowcase: { plain: 'Das Bauprogramm.', accent: 'Bereit zum Teilen.', text: 'Phasen, Aufgaben, Gewerke, ausführende Firmen und Fortschritt: Das Bauprogramm lässt sich als A3-PDF exportieren, mit Stichtag und Legende, für Bauherrschaft, Architekt oder Subunternehmer.' },
    planning: {
      tag: 'GETEILTE PLANUNG',
      week: '9.–13. NOVEMBER',
      title: 'Die Woche des Teams.',
      sub: 'Einsätze pro Projekt · Beispieldaten',
      team: 'TEAM',
      days: ['MO', 'DI', 'MI', 'DO', 'FR'],
      legend: 'VV · VILLA DES VIGNES   AM · BÜROS   EV · EVENT',
    },
    treasury: {
      tag: 'LIQUIDITÄTSPLANUNG',
      horizon: '90 TAGE',
      amount: 'CHF 24’300.–',
      sub: 'Erwarteter Saldo in 90 Tagen · Beispieldaten',
      lines: [
        ['Heute erfasster Saldo', 'CHF 23’200.–'],
        ['Offene Rechnungen', '+ CHF 18’450.–'],
        ['Geschätzte Löhne', '− CHF 14’200.–'],
        ['Wiederkehrende Kosten', '− CHF 3’150.–'],
      ],
      total: ['Saldo in 90 Tagen', 'CHF 24’300.–'],
      caption: 'SALDO MANUELL ERFASST · KEINE BANKVERBINDUNG',
    },
    appAlt: 'Cantia-Startseite auf dem Smartphone: Tagesplanung, Aufgaben und laufende Baustellen',
    treasuryAlt: 'Liquiditätsansicht von Cantia: Saldo, 90-Tage-Planung, erwartete Ein- und Ausgänge',
    appScreen: 'Die echte Ansicht von Cantia',
    docAlt: {
      signer: 'Vom Kunden online unterschriebene Offerte, aus Cantia exportiert',
      organiser: 'Bauprogramm als PDF, aus Cantia exportiert',
      collaborer: 'Baustellenrapport als PDF, aus Cantia exportiert',
      facturer: 'Rechnung mit Schweizer QR-Einzahlungsschein, aus Cantia exportiert',
    },
  },
  families: {
    signer: {
      seoTitle: 'Unterzeichnen: Kunden, Offerten und Online-Signatur | Cantia',
      seoDescription: 'Kunden, Leistungskatalog, Offerten in Ihrem Design und Online-Unterschrift des Kunden: Cantia verbindet die erste Anfrage mit der unterschriebenen Offerte.',
      name: 'Unterzeichnen',
      eyebrow: 'Unterzeichnen mit Cantia',
      h1Plain: 'Von der ersten Anfrage\nzur',
      h1Accent: 'unterschriebenen Offerte.',
      lead: 'Ihre Kunden, Ihr Katalog und Ihre Offerten in einem Ablauf. Erstellen Sie eine Offerte mit Ihren Leistungen, lassen Sie sie annehmen und finden Sie alles Weitere im Projekt.',
      tags: ['Ab Essentiel', 'Computer & Smartphone', 'Daten in der Schweiz'],
      toolsTitle: 'Kunden,\nOfferten und Unterschriften.',
      toolsNote: 'Ab Essentiel. Kontingente und enthaltene Module finden Sie im Abo-Vergleich.',
      tools: [
        { title: 'Kunden & Kontakte', text: 'Finden Sie Adressen und nützliche Angaben, um Ihre Offerten vorzubereiten.' },
        { title: 'Leistungskatalog', text: 'Speichern Sie Preise, Einheiten und übliche Leistungen, um sie in Ihren Offerten wiederzuverwenden.' },
        { title: 'Offerten & Vorlagen', text: 'Starten Sie mit Ihren Vorlagen, passen Sie Mengen an und erstellen Sie ein Dokument in Ihrem Design.', more: 'solutions/devis' },
        { title: 'Unterschrift des Kunden', text: 'Der Kunde unterschreibt online. Unterschrift und Datum werden ins Dokument übernommen.' },
        { title: 'Ausschreibungen', text: 'Beantworten Sie Ausschreibungen mit einer Funktion, die sich derzeit in der Beta befindet. Die Kontingente hängen vom Abo ab.', badge: 'Beta-Funktion', more: 'solutions/soumissions' },
        { title: 'Verkaufsverfolgung', text: 'Verfolgen Sie den Status Ihrer Offerten. Öffnungsverfolgung und automatische Erinnerungen gibt es mit Entreprise.' },
      ],
      steps: [
        { title: 'Offerte vorbereiten', text: 'Wählen Sie den Kunden, fügen Sie Leistungen aus dem Katalog hinzu oder diktieren Sie Ihre Positionen.' },
        { title: 'Prüfen und senden', text: 'Passen Sie Preise und Mengen an und senden Sie Ihrem Kunden eine persönliche Offerte.' },
        { title: 'Weitermachen', text: 'Nach der Annahme stehen die Positionen der Offerte für die Rechnung bereit.' },
      ],
      faq: [
        { q: 'Kann ich meine eigenen Leistungen verwenden?', a: 'Ja. Ihr Katalog enthält Ihre Preise, Einheiten und Beschreibungen. Mit Offertvorlagen verwenden Sie Ihre Muster wieder.' },
        { q: 'Sind Ausschreibungen verfügbar?', a: 'Ja, als Beta. Die Kontingente unterscheiden sich je nach Abo und stehen im Preisvergleich.' },
      ],
      related: ['organiser', 'facturer'],
      intro: 'Von der Kundenanfrage zur angenommenen Offerte.',
    },
    organiser: {
      seoTitle: 'Organisieren: Projekte, Planung und Dokumente | Cantia',
      seoDescription: 'Projekte, geteilte Teamplanung, Pläne und Dokumente: Cantia bündelt die Informationen jedes Projekts, im Büro wie unterwegs.',
      name: 'Organisieren',
      eyebrow: 'Organisieren mit Cantia',
      h1Plain: 'Jedes Projekt.',
      h1Accent: 'Klar im Blick.',
      lead: 'Bündeln Sie Dokumente, verteilen Sie die Arbeit und sehen Sie die geteilte Planung. Ihr Team findet die Informationen im richtigen Projekt, im Büro wie unterwegs.',
      tags: ['Projekte ab Essentiel · Planung ab Team', 'Computer & Smartphone', 'Daten in der Schweiz'],
      toolsTitle: 'Projekte,\nPlanung und Dokumente.',
      toolsNote: 'Projekte ab Essentiel · Planung ab Team. Kontingente und enthaltene Module finden Sie im Abo-Vergleich.',
      tools: [
        { title: 'Projekte & Dossiers', text: 'Bündeln Sie die Informationen eines Projekts an einem Ort. Baustelle, Mandat oder Dossier: Sie wählen das Vokabular Ihrer Branche.' },
        { title: 'Geteilte Planung', text: 'Sehen Sie die Einsätze jedes Mitglieds, Tag für Tag, in einer Woche.', more: 'solutions/planning' },
        { title: 'Pläne & Dokumente', text: 'Legen Sie die Dateien des Projekts ab und finden Sie sie am Computer oder Smartphone wieder.' },
        { title: 'Subunternehmer', text: 'Halten Sie die Angaben zu Beteiligten und ihrem Einsatz im Projekt fest.' },
        { title: 'Zugriff nach Rolle', text: 'Legen Sie fest, welche Module jede Person je nach Verantwortung sieht.' },
        { title: 'Auf allen Geräten', text: 'Nutzen Sie Cantia im Browser auf Computer, Tablet oder Smartphone.' },
      ],
      steps: [
        { title: 'Projekt eröffnen', text: 'Bündeln Sie Kunde, Dokumente und wichtige Angaben in einem gemeinsamen Dossier.' },
        { title: 'Arbeit verteilen', text: 'Teilen Sie die Mitglieder in der geteilten Planung den Projekten zu, ab Team.' },
        { title: 'Den Überblick behalten', text: 'Während der Ausführung bleiben Informationen und Dokumente am selben Ort.' },
      ],
      faq: [
        { q: 'Kann ich das Wort «Baustelle» ersetzen?', a: 'Ja. Bei der Registrierung wählen Sie zwischen Baustelle, Projekt, Mandat oder Dossier. Die App und die PDF-Rapporte passen sich an.' },
        { q: 'Ist die Planung auf dem Smartphone verfügbar?', a: 'Ja. Jedes Mitglied sieht seine Planung im Browser seines Smartphones, je nach gewährtem Zugriff.' },
      ],
      related: ['collaborer', 'piloter'],
      intro: 'Ein klarer Blick auf jedes Projekt und seine nächsten Schritte.',
    },
    collaborer: {
      seoTitle: 'Zusammenarbeiten: Rapporte, Stunden und Team | Cantia',
      seoDescription: 'Team-Chat, PDF-Rapporte mit Fotos, Stunden pro Projekt, Spesen und Löhne: Cantia verbindet die Ausführung mit dem Büro.',
      name: 'Zusammenarbeiten',
      eyebrow: 'Zusammenarbeiten mit Cantia',
      h1Plain: 'Ein Team.',
      h1Accent: 'Derselbe Faden.',
      lead: 'Nachrichten, Stunden und Rapporte landen im richtigen Projekt. Die Mitarbeitenden teilen, was sie erledigen; das Büro findet die Angaben für die Nachverfolgung und die Löhne.',
      tags: ['Rapporte ab Essentiel · HR ab Team', 'Computer & Smartphone', 'Daten in der Schweiz'],
      toolsTitle: 'Rapporte,\nStunden und Team.',
      toolsNote: 'Rapporte ab Essentiel · HR ab Team. Kontingente und enthaltene Module finden Sie im Abo-Vergleich.',
      tools: [
        { title: 'Team-Chat', text: 'Tauschen Sie Nachrichten und Informationen direkt im Projekt aus.' },
        { title: 'Rapporte & Fotos', text: 'Halten Sie Feststellungen und Fotos fest. Erstellen Sie einen PDF-Rapport mit Hilfe des Diktats und lesen Sie ihn vor dem Versand.', more: 'solutions/rapports-chantier' },
        { title: 'Stunden pro Projekt', text: 'Jedes Mitglied erfasst seine Zeit Tag für Tag, zugeordnet zum Projekt, an dem es arbeitet.' },
        { title: 'Spesen', text: 'Erfassen Sie Spesen und Kilometer mit einer vom Unternehmen festgelegten Entschädigung.' },
        { title: 'Profile & Löhne', text: 'Richten Sie Profile, Löhne und Beiträge ein. Die Sätze passen Sie an Ihre Situation an.', more: 'solutions/rh-salaires' },
        { title: 'Rollen & Vertraulichkeit', text: 'Reservieren Sie Module und sensible Daten für berechtigte Personen. Mitarbeitende sehen ihre eigenen Stunden und Spesen.' },
      ],
      steps: [
        { title: 'Sofort teilen', text: 'Fügen Sie Informationen, Nachrichten oder Fotos im Projekt-Chat hinzu.' },
        { title: 'Zusammenfassen', text: 'Erstellen Sie aus den Projektangaben einen Rapport und prüfen Sie den Inhalt.' },
        { title: 'Stunden wiederfinden', text: 'Sehen Sie erfasste Stunden und Spesen für die Teamübersicht und die Löhne.' },
      ],
      faq: [
        { q: 'Wer kann die Löhne sehen?', a: 'Berechtigte Personen gemäss ihren Rechten, insbesondere Administratoren und die HR-Funktion. Normale Mitarbeitende sehen ihre eigenen Stunden und Spesen.' },
        { q: 'Werden die Beitragssätze automatisch gesetzt?', a: 'Die Sätze sind pro Mitarbeitendem einstellbar. Die Richtwerte passen Sie an Ihre Kassen und Ihren Kanton an; Cantia berechnet den Nettolohn aus den eingestellten Sätzen.' },
      ],
      related: ['organiser', 'piloter'],
      intro: 'Informationen fliessen zwischen Planung und Ausführung.',
    },
    facturer: {
      seoTitle: 'Fakturieren: QR-Rechnungen, Anzahlungen und Zahlungen | Cantia',
      seoDescription: 'Machen Sie aus einer angenommenen Offerte eine Schweizer QR-Rechnung, verlangen Sie eine Anzahlung und verfolgen Sie die Zahlungen bis zum Saldo.',
      name: 'Fakturieren',
      eyebrow: 'Fakturieren mit Cantia',
      h1Plain: 'Von der angenommenen Offerte\nzur',
      h1Accent: 'verfolgten Zahlung.',
      lead: 'Machen Sie aus einer Offerte eine Rechnung, verlangen Sie eine Anzahlung und erfassen Sie die Zahlungen. Der Schweizer QR-Einzahlungsschein gehört zum Dokument, mit den Angaben Ihres Unternehmens.',
      tags: ['Ab Essentiel', 'Computer & Smartphone', 'Daten in der Schweiz'],
      toolsTitle: 'QR-Rechnungen,\nAnzahlungen und Zahlungen.',
      toolsNote: 'Ab Essentiel. Kontingente und enthaltene Module finden Sie im Abo-Vergleich.',
      tools: [
        { title: 'Offerte umwandeln', text: 'Übernehmen Sie Positionen und Kunde einer angenommenen Offerte, ohne sie neu zu erfassen.' },
        { title: 'Schweizer QR-Rechnungen', text: 'Erstellen Sie Ihre Dokumente mit QR-Einzahlungsschein, Ihrer IBAN und der Zahlungsreferenz.', more: 'solutions/facturation' },
        { title: 'Anzahlung & Saldo', text: 'Stellen Sie eine Anzahlung und berücksichtigen Sie bereits erhaltene Beträge in der Schlussrechnung.' },
        { title: 'Teilzahlungen', text: 'Erfassen Sie eingegangene Zahlungen, damit Status und offener Betrag stimmen.' },
        { title: 'Zusatzleistungen', text: 'Kalkulieren Sie zusätzliche Wünsche, lassen Sie sie annehmen und bereiten Sie die Rechnung vor.', more: 'solutions/travaux-supplementaires' },
        { title: 'Eigene Dokumente', text: 'Fügen Sie Logo, Adresse und Farben zu den Dokumenten hinzu, die Ihre Kunden erhalten.' },
      ],
      steps: [
        { title: 'Rechnung erstellen', text: 'Starten Sie mit der angenommenen Offerte oder erfassen Sie direkt eine neue Rechnung.' },
        { title: 'Dokument senden', text: 'Der Schweizer QR-Einzahlungsschein ist mit den Zahlungsangaben integriert.' },
        { title: 'Zahlungen verfolgen', text: 'Erfassen Sie eingegangene Beträge und sehen Sie, was noch offen ist.' },
      ],
      faq: [
        { q: 'Zieht Cantia die Zahlungen für mich ein?', a: 'Nein. Der Kunde bezahlt mit den Angaben der QR-Rechnung. Sie erfassen und gleichen die eingegangenen Zahlungen in Cantia ab.' },
        { q: 'Kann ich ein Rechnungsbeispiel ansehen?', a: 'Ja. Diese Seite zeigt ein echtes, von Cantia erstelltes PDF mit Beispieldaten.' },
      ],
      related: ['signer', 'piloter'],
      intro: 'Die geleistete Arbeit wird zur Rechnung, dann zur Zahlungsverfolgung.',
    },
    piloter: {
      seoTitle: 'Steuern: Ausgaben, Rentabilität und Liquidität | Cantia',
      seoDescription: 'Ausgaben, Rentabilität pro Projekt und Liquiditätsplanung über 90 Tage, aus den Angaben, die bereits in Cantia erfasst sind.',
      name: 'Steuern',
      eyebrow: 'Steuern mit Cantia',
      h1Plain: 'Die laufenden Projekte.',
      h1Accent: 'Die Zahlen im Blick.',
      lead: 'Stellen Sie Einnahmen, Ausgaben und Zeitaufwand Ihrer Projekte nebeneinander. Sehen Sie die Rentabilität und eine Liquiditätsplanung über 90 Tage aus den bereits erfassten Angaben.',
      tags: ['Ab Team', 'Computer & Smartphone', 'Daten in der Schweiz'],
      toolsTitle: 'Ausgaben,\nRentabilität und Liquidität.',
      toolsNote: 'Ab Team. Kontingente und enthaltene Module finden Sie im Abo-Vergleich.',
      tools: [
        { title: 'Ausgaben', text: 'Ordnen Sie Kosten Ihrer Tätigkeit zu und erfassen Sie die Angaben per Foto oder Sprache.' },
        { title: 'Rentabilität pro Projekt', text: 'Stellen Sie verrechnete Beträge, Ausgaben und eingesetzte Ressourcen einander gegenüber.', more: 'solutions/rentabilite' },
        { title: 'Liquidität über 90 Tage', text: 'Planen Sie offene Rechnungen, geschätzte Löhne und kommende Ausgaben.', more: 'solutions/tresorerie' },
        { title: 'Wiederkehrende Kosten', text: 'Erfassen Sie Abos, Mieten und Versicherungen mit Rhythmus und nächster Fälligkeit.' },
        { title: 'Fälligkeiten der Beteiligten', text: 'Sehen Sie die zu bezahlenden Rechnungen der Subunternehmer in der Planung.' },
        { title: 'Bexio-Integration', text: 'Verbinden Sie Kunden, Rechnungen und Zahlungen, wenn Sie bereits Bexio nutzen. Cantia funktioniert auch allein.', more: 'integrations' },
      ],
      steps: [
        { title: 'Daten erfassen', text: 'Erfassen Sie Ihren Saldo und Ihre wiederkehrenden Kosten und halten Sie die Projekte aktuell.' },
        { title: 'Planung ansehen', text: 'Sehen Sie die erwarteten Ein- und Ausgänge über 90 Tage.' },
        { title: 'Mit Kontext entscheiden', text: 'Behalten Sie Projekte, Ausgaben und Fälligkeiten im Blick, die die Zahlen erklären.' },
      ],
      faq: [
        { q: 'Ist die Liquidität mit meinem Bankkonto verbunden?', a: 'Nein. Sie erfassen den Saldo manuell. Die Planung nutzt die in Cantia gespeicherten Angaben, ohne Bankverbindung.' },
        { q: 'Garantiert die Planung meinen künftigen Saldo?', a: 'Nein. Es ist eine Prognose aus Ihren Fälligkeiten und erfassten Daten; ihre Qualität hängt davon ab, wie aktuell diese sind.' },
      ],
      related: ['facturer', 'collaborer'],
      intro: 'Ihre Projektdaten werden zu Entscheidungshilfen.',
    },
  },
  assistant: {
    seoTitle: 'Der Cantia-Assistent: diktieren, prüfen, freigeben | Cantia',
    seoDescription: 'Diktieren oder schreiben: Der Cantia-Assistent erstellt einen ersten Entwurf für Offerte, Rapport oder Rechnung. Sie prüfen, passen an und geben frei.',
    name: 'Der Cantia-Assistent',
    eyebrow: 'Per Sprache oder Tastatur',
    h1Plain: 'Sie diktieren.',
    h1Accent: 'Der Entwurf entsteht.',
    lead: 'Machen Sie aus dem, was Sie im Kopf haben, eine erste Version von Offerte, Rapport oder Rechnung. Cantia bereitet vor; Sie prüfen, passen an und geben frei.',
    quotas: 'Kontingente ansehen',
    usesEyebrow: 'Hilfe dort, wo Sie arbeiten',
    usesPlain: 'Drei Einsätze.',
    usesAccent: 'Dieselbe Freiheit bei der Eingabe.',
    usesNote: 'Die Eingabe per Tastatur bleibt möglich. Das Diktat ergänzt Ihre Arbeitsweise.',
    uses: [
      { title: 'Eine Offerte vorbereiten.', text: 'Beschreiben Sie die Leistungen. Finden Sie Referenzen und Preise aus Ihrem Katalog und prüfen Sie die vorgeschlagenen Positionen.', link: 'Die Offerten', slug: 'signer' },
      { title: 'Einen Rapport schreiben.', text: 'Bündeln Sie Notizen, Nachrichten und Fotos. Cantia hilft Ihnen, einen Bericht zu strukturieren, den Sie vor dem Versand lesen.', link: 'Die Rapporte', slug: 'collaborer' },
      { title: 'Die Rechnung vorbereiten.', text: 'Diktieren Sie die Angaben für Ihr Dokument. Prüfen Sie Kunde, Beträge und MWST, bevor Sie abschliessen.', link: 'Die Rechnungen', slug: 'facturer' },
    ],
    calloutStrong: 'Ihre Freigabe bleibt entscheidend.',
    callout: 'Der Assistent macht einen Vorschlag. Prüfen Sie immer Mengen, Preise, Empfänger und Angaben des Dokuments, bevor Sie es senden. Die Nutzungskontingente hängen von Ihrem Abo ab.',
  },
  features: {
    seoTitle: 'Alle Funktionen von Cantia | Cantia',
    seoDescription: 'Offerten, Unterschrift, Projekte, Planung, Rapporte, Stunden, QR-Rechnungen, Ausgaben und Liquidität: alle Funktionen von Cantia, in fünf Bereichen.',
    eyebrow: 'Die Software, nach Einsatz',
    h1Plain: 'Ein Werkzeug.',
    h1Accent: 'Alles hängt zusammen.',
    lead: 'Wählen Sie, was Sie tun möchten. Die Funktionen sind um fünf Momente Ihrer Tätigkeit gruppiert, vom ersten Kundenkontakt bis zur Finanzübersicht.',
    all: 'Alles ansehen',
    search: 'Suchen: Stunden, Offerte…',
    searchLabel: 'Eine Funktion suchen',
    explore: 'Diesen Bereich ansehen',
    empty: 'Keine Funktion gefunden. Versuchen Sie «Offerte», «Stunden» oder «Projekt».',
    calloutStrong: 'Hilfe in allen Bereichen.',
    callout: 'Das Diktat und der Assistent helfen Ihnen, Dokumente vorzubereiten.',
    calloutLink: 'Den Assistenten entdecken',
  },
};

const it: Bundle = {
  labels: {
    home: 'Home',
    software: 'Il software',
    subnav: ['Cosa potete fare', 'Il percorso', 'Le vostre domande', 'I piani'],
    tryCta: 'Provare Cantia',
    compare: 'Confrontare i piani',
    more: 'Scoprire di più',
    toolsEyebrow: 'Gli strumenti a disposizione',
    stepsEyebrow: 'Nel vostro quotidiano',
    stepsTitle: 'Un percorso che si segue.',
    faqEyebrow: 'Le risposte utili',
    faqTitle: 'Prima di iniziare.',
    relatedEyebrow: 'Il seguito del percorso',
    relatedTitle: 'Tutto resta collegato.',
    sample: 'Dati di esempio',
    realExport: 'Un vero export di Cantia',
    openPdf: 'Aprire il PDF',
    showcaseEyebrow: 'Un vero export di Cantia',
    showcasePlain: 'Il vostro lavoro.',
    showcaseAccent: 'La vostra fattura.',
    showcaseText: 'Il documento riprende indirizzo, logo e colori dell’azienda. La polizza QR accompagna la fattura per il pagamento.',
    showcaseNote: 'PDF generato da Cantia con dati di esempio.',
    planningShowcase: { plain: 'Il programma del cantiere.', accent: 'Pronto da condividere.', text: 'Fasi, attività, mestieri, imprese e avanzamento: il programma si esporta in PDF A3, con la data del giorno e la legenda, per il committente, l’architetto o i subappaltatori.' },
    planning: {
      tag: 'PIANIFICAZIONE CONDIVISA',
      week: '9–13 NOVEMBRE',
      title: 'La settimana del team.',
      sub: 'Assegnazioni per progetto · Dati di esempio',
      team: 'TEAM',
      days: ['LUN', 'MAR', 'MER', 'GIO', 'VEN'],
      legend: 'VV · VILLA DES VIGNES   AM · UFFICI   EV · EVENTO',
    },
    treasury: {
      tag: 'TESORERIA PREVISIONALE',
      horizon: '90 GIORNI',
      amount: 'CHF 24’300.–',
      sub: 'Saldo previsto fra 90 giorni · Dati di esempio',
      lines: [
        ['Saldo inserito oggi', 'CHF 23’200.–'],
        ['Fatture da incassare', '+ CHF 18’450.–'],
        ['Salari stimati', '− CHF 14’200.–'],
        ['Costi ricorrenti', '− CHF 3’150.–'],
      ],
      total: ['Saldo fra 90 giorni', 'CHF 24’300.–'],
      caption: 'SALDO INSERITO A MANO · NESSUN COLLEGAMENTO BANCARIO',
    },
    appAlt: 'Home di Cantia sul telefono: programma del giorno, attività e cantieri in corso',
    treasuryAlt: 'Schermata Liquidità di Cantia: saldo, previsione a 90 giorni, entrate e uscite previste',
    appScreen: 'La vera schermata di Cantia',
    docAlt: {
      signer: 'Preventivo firmato online dal cliente, esportato da Cantia',
      organiser: 'Programma di cantiere PDF esportato da Cantia',
      collaborer: 'Rapporto di cantiere PDF esportato da Cantia',
      facturer: 'Fattura con polizza QR svizzera, esportata da Cantia',
    },
  },
  families: {
    signer: {
      seoTitle: 'Firmare: clienti, preventivi e firma online | Cantia',
      seoDescription: 'Clienti, catalogo delle prestazioni, preventivi con la vostra immagine e firma online del cliente: Cantia collega la prima richiesta al preventivo firmato.',
      name: 'Firmare',
      eyebrow: 'Firmare con Cantia',
      h1Plain: 'Dalla prima richiesta\nal',
      h1Accent: 'preventivo firmato.',
      lead: 'I vostri clienti, il catalogo e le offerte nello stesso percorso. Preparate un preventivo con le vostre prestazioni, fatelo accettare e ritrovate il seguito nel progetto.',
      tags: ['Dal piano Essentiel', 'Computer e telefono', 'Dati in Svizzera'],
      toolsTitle: 'Clienti,\npreventivi e firme.',
      toolsNote: 'Dal piano Essentiel. Quote e moduli inclusi sono indicati nel confronto dei piani.',
      tools: [
        { title: 'Clienti e contatti', text: 'Ritrovate indirizzi e informazioni utili per preparare le vostre offerte.' },
        { title: 'Catalogo delle prestazioni', text: 'Registrate prezzi, unità e prestazioni abituali per riprenderli nei preventivi.' },
        { title: 'Preventivi e modelli', text: 'Partite dai vostri modelli, adattate le quantità e preparate un documento con la vostra immagine.', more: 'solutions/devis' },
        { title: 'Firma del cliente', text: 'Il cliente firma online. La firma e la data sono integrate nel documento.' },
        { title: 'Capitolati', text: 'Preparate le risposte ai capitolati con una funzione attualmente in beta. Le quote dipendono dal piano.', badge: 'Funzione in beta', more: 'solutions/soumissions' },
        { title: 'Seguito commerciale', text: 'Seguite lo stato delle offerte. Il tracciamento delle aperture e i promemoria automatici sono disponibili con Entreprise.' },
      ],
      steps: [
        { title: 'Preparate l’offerta', text: 'Scegliete il cliente, aggiungete le prestazioni del catalogo o dettate le righe.' },
        { title: 'Verificate e inviate', text: 'Adattate prezzi e quantità, poi inviate al cliente un’offerta personalizzata.' },
        { title: 'Passate al seguito', text: 'Dopo l’accettazione, le righe del preventivo sono pronte per la fattura.' },
      ],
      faq: [
        { q: 'Posso usare le mie prestazioni?', a: 'Sì. Il catalogo contiene prezzi, unità e descrizioni. I modelli di preventivo permettono di riutilizzare le vostre basi.' },
        { q: 'I capitolati sono disponibili?', a: 'Sì, in beta. Le quote variano secondo il piano e sono indicate nel confronto delle tariffe.' },
      ],
      related: ['organiser', 'facturer'],
      intro: 'Dalla richiesta del cliente all’offerta accettata.',
    },
    organiser: {
      seoTitle: 'Organizzare: progetti, pianificazione e documenti | Cantia',
      seoDescription: 'Progetti, pianificazione condivisa del team, piani e documenti: Cantia raccoglie le informazioni di ogni progetto, in ufficio come in trasferta.',
      name: 'Organizzare',
      eyebrow: 'Organizzare con Cantia',
      h1Plain: 'Ogni progetto.',
      h1Accent: 'Le idee chiare.',
      lead: 'Centralizzate i documenti, distribuite il lavoro e consultate la pianificazione condivisa. Il team ritrova le informazioni nel progetto giusto, in ufficio come in trasferta.',
      tags: ['Progetti dal piano Essentiel · Pianificazione dal piano Team', 'Computer e telefono', 'Dati in Svizzera'],
      toolsTitle: 'Progetti,\npianificazione e documenti.',
      toolsNote: 'Progetti dal piano Essentiel · Pianificazione dal piano Team. Quote e moduli inclusi sono indicati nel confronto dei piani.',
      tools: [
        { title: 'Progetti e dossier', text: 'Raccogliete le informazioni attorno allo stesso progetto. Cantiere, mandato o dossier: scegliete il vocabolario della vostra attività.' },
        { title: 'Pianificazione condivisa', text: 'Consultate le assegnazioni di ogni membro, giorno per giorno, sulla stessa settimana.', more: 'solutions/planning' },
        { title: 'Piani e documenti', text: 'Archiviate i file del progetto e ritrovateli dal computer o dal telefono.' },
        { title: 'Subappaltatori', text: 'Conservate le informazioni sugli intervenienti e sulla loro partecipazione al progetto.' },
        { title: 'Accessi per ruolo', text: 'Definite i moduli accessibili secondo le responsabilità di ciascuno.' },
        { title: 'Su ogni dispositivo', text: 'Usate Cantia nel browser, su computer, tablet o telefono.' },
      ],
      steps: [
        { title: 'Aprite il progetto', text: 'Riunite cliente, documenti e informazioni utili in un dossier comune.' },
        { title: 'Distribuite il lavoro', text: 'Assegnate i membri ai progetti nella pianificazione condivisa, dal piano Team.' },
        { title: 'Mantenete il contesto', text: 'Durante l’esecuzione informazioni e documenti restano nello stesso posto.' },
      ],
      faq: [
        { q: 'Posso sostituire la parola cantiere?', a: 'Sì. All’iscrizione scegliete fra cantiere, progetto, mandato o dossier. Il vocabolario dell’app e dei rapporti PDF si adatta.' },
        { q: 'La pianificazione è accessibile dal telefono?', a: 'Sì. Ogni membro consulta la propria pianificazione dal browser del telefono, secondo gli accessi concessi.' },
      ],
      related: ['collaborer', 'piloter'],
      intro: 'Una visione chiara di ogni progetto e dei prossimi passi.',
    },
    collaborer: {
      seoTitle: 'Collaborare: rapporti, ore e team | Cantia',
      seoDescription: 'Chat del team, rapporti PDF con foto, ore per progetto, spese e salari: Cantia collega chi realizza e chi organizza.',
      name: 'Collaborare',
      eyebrow: 'Collaborare con Cantia',
      h1Plain: 'Un team.',
      h1Accent: 'Lo stesso filo.',
      lead: 'Messaggi, ore e rapporti arrivano nel progetto giusto. I collaboratori condividono ciò che realizzano; l’ufficio ritrova le informazioni per il seguito e i salari.',
      tags: ['Rapporti dal piano Essentiel · RU dal piano Team', 'Computer e telefono', 'Dati in Svizzera'],
      toolsTitle: 'Rapporti,\nore e team.',
      toolsNote: 'Rapporti dal piano Essentiel · RU dal piano Team. Quote e moduli inclusi sono indicati nel confronto dei piani.',
      tools: [
        { title: 'Chat del team', text: 'Scambiate messaggi e informazioni nel contesto del progetto.' },
        { title: 'Rapporti e foto', text: 'Aggiungete osservazioni e foto. Preparate un rapporto PDF con l’aiuto della dettatura e rileggetelo prima dell’invio.', more: 'solutions/rapports-chantier' },
        { title: 'Ore per progetto', text: 'Ogni membro registra il proprio tempo giorno per giorno, legato al progetto su cui lavora.' },
        { title: 'Spese professionali', text: 'Registrate spese e chilometri con un’indennità definita dall’azienda.' },
        { title: 'Profili e salari', text: 'Configurate profili, salari e contributi. I tassi vanno adattati alla vostra situazione.', more: 'solutions/rh-salaires' },
        { title: 'Ruoli e riservatezza', text: 'Riservate moduli e dati sensibili alle persone autorizzate. I collaboratori vedono le proprie ore e spese.' },
      ],
      steps: [
        { title: 'Condividete sul momento', text: 'Aggiungete informazioni, messaggi o foto nella chat del progetto.' },
        { title: 'Consolidate il seguito', text: 'Preparate un rapporto dagli elementi del progetto e verificatene il contenuto.' },
        { title: 'Ritrovate le ore', text: 'Consultate ore e spese registrate per il seguito del team e i salari.' },
      ],
      faq: [
        { q: 'Chi può consultare i salari?', a: 'Le persone autorizzate secondo i loro permessi, in particolare gli amministratori e la funzione RU. I collaboratori standard vedono le proprie ore e spese.' },
        { q: 'I tassi contributivi sono automatici?', a: 'I tassi sono configurabili per collaboratore. I valori indicativi vanno adattati alle vostre casse e al vostro cantone; Cantia calcola il netto dai tassi configurati.' },
      ],
      related: ['organiser', 'piloter'],
      intro: 'L’informazione circola fra chi organizza e chi realizza.',
    },
    facturer: {
      seoTitle: 'Fatturare: fatture QR, acconti e pagamenti | Cantia',
      seoDescription: 'Trasformate un preventivo accettato in fattura QR svizzera, chiedete un acconto e seguite i versamenti ricevuti fino al saldo.',
      name: 'Fatturare',
      eyebrow: 'Fatturare con Cantia',
      h1Plain: 'Dal preventivo accettato\nal',
      h1Accent: 'pagamento seguito.',
      lead: 'Trasformate un’offerta in fattura, chiedete un acconto e registrate i versamenti. La polizza QR svizzera fa parte del documento, con i dati della vostra azienda.',
      tags: ['Dal piano Essentiel', 'Computer e telefono', 'Dati in Svizzera'],
      toolsTitle: 'Fatture QR,\nacconti e pagamenti.',
      toolsNote: 'Dal piano Essentiel. Quote e moduli inclusi sono indicati nel confronto dei piani.',
      tools: [
        { title: 'Conversione del preventivo', text: 'Riprendete righe e cliente di un preventivo accettato senza riscriverli.' },
        { title: 'Fatture QR svizzere', text: 'Generate i documenti con la polizza QR, il vostro IBAN e il riferimento di pagamento.', more: 'solutions/facturation' },
        { title: 'Acconti e saldo', text: 'Emettete un acconto, poi tenete conto degli importi già incassati nella fattura finale.' },
        { title: 'Versamenti parziali', text: 'Registrate i pagamenti ricevuti per tenere aggiornati stato e saldo.' },
        { title: 'Prestazioni supplementari', text: 'Quantificate le richieste in più, fatele accettare e preparatene la fattura.', more: 'solutions/travaux-supplementaires' },
        { title: 'Documenti personalizzati', text: 'Aggiungete logo, indirizzo e colori ai documenti inviati ai clienti.' },
      ],
      steps: [
        { title: 'Create la fattura', text: 'Partite dal preventivo accettato o inserite direttamente una nuova fattura.' },
        { title: 'Inviate il documento', text: 'La polizza QR svizzera è integrata con i dati di pagamento.' },
        { title: 'Seguite i versamenti', text: 'Registrate gli importi ricevuti e consultate ciò che resta da incassare.' },
      ],
      faq: [
        { q: 'Cantia incassa i pagamenti al posto mio?', a: 'No. Il cliente paga con i dati della fattura QR. Voi registrate e riconciliate in Cantia i versamenti ricevuti.' },
        { q: 'Posso vedere un esempio di fattura?', a: 'Sì. Questa pagina mostra un vero PDF generato da Cantia con dati di esempio.' },
      ],
      related: ['signer', 'piloter'],
      intro: 'Il lavoro svolto diventa fattura, poi seguito dei pagamenti.',
    },
    piloter: {
      seoTitle: 'Gestire: spese, redditività e tesoreria | Cantia',
      seoDescription: 'Spese, redditività per progetto e tesoreria previsionale a 90 giorni, dalle informazioni già inserite in Cantia.',
      name: 'Gestire',
      eyebrow: 'Gestire con Cantia',
      h1Plain: 'I progetti in corso.',
      h1Accent: 'I numeri sotto controllo.',
      lead: 'Mettete a confronto entrate, spese e tempo dedicato ai progetti. Consultate la redditività e una previsione di tesoreria a 90 giorni dalle informazioni già inserite.',
      tags: ['Dal piano Team', 'Computer e telefono', 'Dati in Svizzera'],
      toolsTitle: 'Spese,\nredditività e tesoreria.',
      toolsNote: 'Dal piano Team. Quote e moduli inclusi sono indicati nel confronto dei piani.',
      tools: [
        { title: 'Spese', text: 'Collegate i costi alla vostra attività e inserite i dati con una foto o a voce.' },
        { title: 'Redditività per progetto', text: 'Confrontate importi fatturati, spese e risorse impiegate.', more: 'solutions/rentabilite' },
        { title: 'Tesoreria a 90 giorni', text: 'Prevedete fatture da incassare, salari stimati e spese in arrivo.', more: 'solutions/tresorerie' },
        { title: 'Costi ricorrenti', text: 'Registrate abbonamenti, affitti e assicurazioni con frequenza e prossima scadenza.' },
        { title: 'Scadenze degli intervenienti', text: 'Ritrovate nella previsione le fatture dei subappaltatori da pagare.' },
        { title: 'Integrazione Bexio', text: 'Collegate clienti, fatture e pagamenti se usate già Bexio. Cantia funziona anche da solo.', more: 'integrations' },
      ],
      steps: [
        { title: 'Inserite i dati', text: 'Inserite saldo e costi ricorrenti, poi tenete aggiornati i progetti.' },
        { title: 'Consultate la previsione', text: 'Ritrovate entrate e uscite previste su un orizzonte di 90 giorni.' },
        { title: 'Decidete con il contesto', text: 'Tenete d’occhio progetti, spese e scadenze che spiegano i numeri.' },
      ],
      faq: [
        { q: 'La tesoreria è collegata al mio conto bancario?', a: 'No. Inserite il saldo a mano. La previsione usa le informazioni registrate in Cantia, senza collegamento bancario.' },
        { q: 'La previsione garantisce il mio saldo futuro?', a: 'No. È una stima basata sulle scadenze e sui dati inseriti; la sua qualità dipende dal loro aggiornamento.' },
      ],
      related: ['facturer', 'collaborer'],
      intro: 'I dati dei progetti diventano punti di riferimento per decidere.',
    },
  },
  assistant: {
    seoTitle: 'L’assistente Cantia: dettate, rileggete, convalidate | Cantia',
    seoDescription: 'Dettate o scrivete: l’assistente Cantia prepara una prima bozza di preventivo, rapporto o fattura. Voi rileggete, adattate e convalidate.',
    name: 'L’assistente Cantia',
    eyebrow: 'A voce o con la tastiera',
    h1Plain: 'Voi dettate.',
    h1Accent: 'La bozza prende forma.',
    lead: 'Trasformate ciò che avete in mente in una prima versione di preventivo, rapporto o fattura. Cantia prepara; voi rileggete, adattate e convalidate.',
    quotas: 'Vedere le quote',
    usesEyebrow: 'Un aiuto, dove lavorate',
    usesPlain: 'Tre usi.',
    usesAccent: 'La stessa libertà di inserire.',
    usesNote: 'L’inserimento con la tastiera resta disponibile. La dettatura completa il vostro modo di lavorare.',
    uses: [
      { title: 'Preparare un’offerta.', text: 'Descrivete le prestazioni da quantificare. Ritrovate riferimenti e prezzi del catalogo, poi verificate le posizioni proposte.', link: 'I preventivi', slug: 'signer' },
      { title: 'Redigere un rapporto.', text: 'Riunite note, messaggi e foto. Cantia vi aiuta a strutturare un resoconto che rileggete prima dell’invio.', link: 'I rapporti', slug: 'collaborer' },
      { title: 'Preparare la fattura.', text: 'Dettate gli elementi utili al documento. Controllate cliente, importi e IVA prima di finalizzare.', link: 'La fatturazione', slug: 'facturer' },
    ],
    calloutStrong: 'La vostra convalida resta essenziale.',
    callout: 'L’assistente prepara una proposta. Verificate sempre quantità, prezzi, destinatari e dati del documento prima di inviarlo. Le quote di utilizzo dipendono dal piano.',
  },
  features: {
    seoTitle: 'Tutte le funzionalità di Cantia | Cantia',
    seoDescription: 'Preventivi, firma, progetti, pianificazione, rapporti, ore, fatture QR, spese e tesoreria: tutte le funzionalità di Cantia, raggruppate in cinque usi.',
    eyebrow: 'Il software, per uso',
    h1Plain: 'Un solo strumento.',
    h1Accent: 'Tutta la continuità.',
    lead: 'Scegliete cosa volete fare. Le funzionalità sono raggruppate attorno a cinque momenti della vostra attività, dal primo scambio con il cliente al seguito delle finanze.',
    all: 'Esplorare tutto',
    search: 'Cercare: ore, preventivo…',
    searchLabel: 'Cercare una funzionalità',
    explore: 'Esplorare questo uso',
    empty: 'Nessuna funzionalità trovata. Provate «preventivo», «ore» o «progetto».',
    calloutStrong: 'Un aiuto che attraversa tutti gli usi.',
    callout: 'La dettatura e l’assistente vi aiutano a preparare i documenti.',
    calloutLink: 'Scoprire l’assistente',
  },
};

export const SITE_PAGES: Record<SiteLocale, Bundle> = { fr, de, it };
