import type { Feather } from '@expo/vector-icons';
import type { SiteLocale } from './copy';

// The four sector pages (cantia.ch/metiers/<slug>, /de/…, /it/…) and the
// hub /metiers. Same software for every sector: only the vocabulary
// (chantier, dossier, mandat, projet) and the examples change. Every promise
// here is a feature that exists for that sector today; soumissions and the
// Gantt schedule stay with the building trades (lib/trades.ts).

type IconName = keyof typeof Feather.glyphMap;
export type SectorKey = 'batiment' | 'services' | 'etudes' | 'creatifs';
export const SECTOR_KEYS: SectorKey[] = ['batiment', 'services', 'etudes', 'creatifs'];
export const SECTOR_SLUGS: Record<SectorKey, string> = {
  batiment: 'batiment-artisanat',
  services: 'service-entretien',
  etudes: 'bureaux-etudes',
  creatifs: 'agences-evenementiel',
};

export function sectorHref(prefix: string, key: SectorKey) {
  return `${prefix}/metiers/${SECTOR_SLUGS[key]}`;
}

// Trade pages of the building sector, linked from its sector page (the
// trade pages of other sectors were merged into their sector page).
export const BUILDING_TRADES = [
  'entreprise-generale', 'macon', 'genie-civil', 'terrassier', 'demolition', 'echafaudeur', 'charpentier', 'construction-bois',
  'couvreur', 'ferblantier', 'etancheur', 'facadier', 'menuisier', 'platrier', 'peintre', 'carreleur', 'parqueteur', 'vitrier',
  'electricien', 'plombier', 'chauffagiste', 'serrurier', 'entreprise-renovation', 'paysagiste',
];

export interface SectorTrade {
  name: string;
  text: string;
  slug?: string; // a trade page exists
  sub?: string; // its page under the sector (lib/site/subTrades)
}
export interface SectorCopy {
  label: string;
  word: string; // the word used in the app for one piece of work
  words: string; // plural, as in the menu
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  h1Plain: string;
  h1Accent: string;
  lead: string;
  forEyebrow: string;
  forTitle: string;
  trades: SectorTrade[];
  pains: { title: string; text: string; answer: string }[];
  uses: { icon: IconName; title: string; text: string; module?: string }[];
  wordTitle: string;
  wordText: string;
  scenarioTitle: string;
  scenario: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  closingTitle: string;
  closingText: string;
}

export interface SectorUi {
  crumbHome: string;
  crumbTrades: string;
  tryCta: string;
  pricing: string;
  trust: string;
  painsEyebrow: string;
  painsTitle: string;
  answer: string;
  usesEyebrow: string;
  usesTitle: string;
  more: string;
  wordEyebrow: string;
  scenarioEyebrow: string;
  coreStrong: string;
  core: string;
  faqEyebrow: string;
  faqTitle: string;
  otherEyebrow: string;
  otherTitle: string;
  closingCta: string;
  hubCta: string;
  tradePage: string;
}

const FR_UI: SectorUi = {
  crumbHome: 'Accueil',
  crumbTrades: 'Votre métier',
  tryCta: 'Essayer 14 jours',
  pricing: 'Voir les tarifs',
  trust: '14 jours d’essai · Sans engagement · Données hébergées en Suisse',
  painsEyebrow: 'Ce que vous vivez',
  painsTitle: 'Le quotidien que vous connaissez.',
  answer: 'Avec Cantia',
  usesEyebrow: 'Ce que Cantia fait pour vous',
  usesTitle: 'Tout votre suivi, au même endroit.',
  more: 'En savoir plus',
  wordEyebrow: 'Votre vocabulaire',
  scenarioEyebrow: 'De la demande au paiement',
  coreStrong: 'Le même logiciel pour tous les métiers.',
  core: 'Cantia repose sur un tronc commun : clients, offres, équipe, heures, documents et factures. À l’inscription, vous choisissez votre secteur et le mot que vous utilisez ; l’application et vos PDF parlent ensuite comme vous. Vous activez les modules dont vous avez besoin, quand vous en avez besoin.',
  faqEyebrow: 'Questions fréquentes',
  faqTitle: 'Vos questions, nos réponses.',
  otherEyebrow: 'Les autres secteurs',
  otherTitle: 'Cantia ailleurs.',
  closingCta: 'Créer mon compte',
  hubCta: 'Découvrir',
  tradePage: 'Voir la page',
};

const DE_UI: SectorUi = {
  crumbHome: 'Startseite',
  crumbTrades: 'Ihre Branche',
  tryCta: '14 Tage testen',
  pricing: 'Preise ansehen',
  trust: '14 Tage Testphase · Ohne Verpflichtung · Daten in der Schweiz',
  painsEyebrow: 'Was Sie erleben',
  painsTitle: 'Der Alltag, den Sie kennen.',
  answer: 'Mit Cantia',
  usesEyebrow: 'Was Cantia für Sie macht',
  usesTitle: 'Ihre ganze Übersicht an einem Ort.',
  more: 'Mehr erfahren',
  wordEyebrow: 'Ihre Begriffe',
  scenarioEyebrow: 'Von der Anfrage bis zur Zahlung',
  coreStrong: 'Dieselbe Software für alle Branchen.',
  core: 'Cantia beruht auf einem gemeinsamen Kern: Kunden, Offerten, Team, Stunden, Dokumente und Rechnungen. Bei der Registrierung wählen Sie Ihre Branche und Ihren Begriff; die App und Ihre PDFs sprechen danach Ihre Sprache. Sie schalten die Module ein, die Sie brauchen, wenn Sie sie brauchen.',
  faqEyebrow: 'Häufige Fragen',
  faqTitle: 'Ihre Fragen, unsere Antworten.',
  otherEyebrow: 'Die anderen Branchen',
  otherTitle: 'Cantia anderswo.',
  closingCta: 'Konto erstellen',
  hubCta: 'Entdecken',
  tradePage: 'Seite ansehen',
};

const IT_UI: SectorUi = {
  crumbHome: 'Home',
  crumbTrades: 'Il suo mestiere',
  tryCta: 'Provare 14 giorni',
  pricing: 'Vedere i prezzi',
  trust: '14 giorni di prova · Senza impegno · Dati ospitati in Svizzera',
  painsEyebrow: 'Quello che vive',
  painsTitle: 'La quotidianità che conosce.',
  answer: 'Con Cantia',
  usesEyebrow: 'Cosa fa Cantia per lei',
  usesTitle: 'Tutto il suo seguito in un solo posto.',
  more: 'Scopri di più',
  wordEyebrow: 'Il suo vocabolario',
  scenarioEyebrow: 'Dalla richiesta al pagamento',
  coreStrong: 'Lo stesso software per tutti i mestieri.',
  core: 'Cantia poggia su una base comune: clienti, offerte, squadra, ore, documenti e fatture. All’iscrizione sceglie il suo settore e la parola che usa; l’applicazione e i suoi PDF parlano poi come lei. Attiva i moduli di cui ha bisogno, quando ne ha bisogno.',
  faqEyebrow: 'Domande frequenti',
  faqTitle: 'Le sue domande, le nostre risposte.',
  otherEyebrow: 'Gli altri settori',
  otherTitle: 'Cantia altrove.',
  closingCta: 'Creare il mio account',
  hubCta: 'Scoprire',
  tradePage: 'Vedere la pagina',
};

export const SECTOR_UI: Record<SiteLocale, SectorUi> = { fr: FR_UI, de: DE_UI, it: IT_UI };

const FR: Record<SectorKey, SectorCopy> = {
  batiment: {
    label: 'Bâtiment & artisanat',
    word: 'chantier',
    words: 'Chantiers',
    seoTitle: 'Logiciel de gestion pour le bâtiment et l’artisanat en Suisse | Cantia',
    seoDescription: 'Devis signés en ligne, soumissions remplies, planning de chantier, rapports avec photos, heures et factures QR : le logiciel des entreprises du bâtiment en Suisse.',
    eyebrow: 'Bâtiment & artisanat',
    h1Plain: 'Chaque chantier,',
    h1Accent: 'du devis à la facture.',
    lead: 'Gros œuvre, second œuvre, technique du bâtiment ou rénovation : Cantia relie vos devis, vos équipes sur le terrain, vos travaux supplémentaires et vos factures QR. Chaque information reste rattachée au bon chantier.',
    forEyebrow: 'Pour qui',
    forTitle: 'Une page pour chaque corps de métier.',
    trades: [],
    pains: [
      { title: 'Les devis se font le soir, sur Excel', text: 'Recopier les mêmes positions, refaire les calculs, relancer le client pour la signature : des heures qui ne sont jamais facturées.', answer: 'Votre catalogue remplit le devis, le client le signe en ligne depuis son téléphone, et le devis devient facture sans ressaisie.' },
      { title: 'Un supplément décidé sur place, oublié à la facture', text: 'Le client demande un extra en passant. Sans trace écrite, il finit offert, ou contesté au moment de payer.', answer: 'Le travail supplémentaire est noté sur le chantier, signé par le client sur votre téléphone, puis repris dans la facture.' },
      { title: 'La rentabilité se découvre à la fin', text: 'Heures, matériaux et sous-traitants s’additionnent sans que personne ne voie la dérive avant le décompte final.', answer: 'Devisé, heures réelles et dépenses sont comparés en direct, chantier par chantier.' },
    ],
    uses: [
      { icon: 'file-text', title: 'Devis et signature en ligne', text: 'Positions de votre catalogue, TVA, acomptes et signature électronique du client.', module: 'solutions/devis' },
      { icon: 'clipboard', title: 'Soumissions remplies', text: 'La soumission PDF de l’architecte reprise position par position, vos prix, puis le PDF d’origine rempli.', module: 'solutions/soumissions' },
      { icon: 'calendar', title: 'Planning de chantier', text: 'Équipes, sous-traitants et phases sur un planning partagé, au bureau comme sur le terrain.', module: 'solutions/planning' },
      { icon: 'camera', title: 'Rapports avec photos', text: 'Notes, photos et dictées de l’équipe deviennent un rapport PDF prêt à envoyer.', module: 'solutions/rapports-chantier' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Signés sur place par le client, ajoutés au chantier, facturés sans oubli.', module: 'solutions/travaux-supplementaires' },
      { icon: 'credit-card', title: 'Factures QR et rentabilité', text: 'Factures QR suisses, relances, acomptes et marge réelle de chaque chantier.', module: 'solutions/facturation' },
    ],
    wordTitle: 'Vous parlez de chantiers. Cantia aussi.',
    wordText: 'Le menu, les boutons, les rapports PDF et les e-mails à vos clients utilisent votre mot. Chaque chantier a son numéro, son client, son équipe, ses documents et son fil de suivi.',
    scenarioTitle: 'Une salle de bain refaite, de la visite au paiement.',
    scenario: [
      { title: 'La visite', text: 'Vous prenez les mesures et dictez les positions. Le devis se prépare avec les prix de votre catalogue.' },
      { title: 'La signature', text: 'Le client reçoit le lien, signe sur son téléphone. Le chantier est créé avec le devis signé.' },
      { title: 'Le chantier', text: 'L’équipe saisit ses heures et ses photos. Un supplément demandé sur place est signé dans la foulée.' },
      { title: 'La facture', text: 'Devis et supplément deviennent une facture QR. Le paiement est suivi, la marge du chantier est connue.' },
    ],
    faq: [
      { q: 'Cantia convient-il à une petite entreprise du bâtiment ?', a: 'Oui. Une entreprise individuelle commence avec les devis, les chantiers et les factures, puis ajoute l’équipe, le planning ou les salaires quand elle grandit.' },
      { q: 'Puis-je remplir les soumissions de l’architecte ?', a: 'Oui. Vous importez la soumission PDF, les positions et quantités sont reprises, vous mettez vos prix et vous renvoyez le PDF d’origine rempli. La fonction est en bêta.' },
      { q: 'Mes ouvriers peuvent-ils saisir leurs heures sur le chantier ?', a: 'Oui, depuis leur téléphone, sans rien installer. Chaque heure est rattachée à un chantier et à un type de travail.' },
      { q: 'Les factures sont-elles conformes en Suisse ?', a: 'Oui : QR-facture, TVA, numérotation et mentions obligatoires. Vous pouvez aussi synchroniser vos factures avec Bexio.' },
      { q: 'Combien de temps pour démarrer ?', a: 'Quelques minutes pour créer l’entreprise et votre premier devis. Vos clients et votre catalogue s’importent depuis Excel.' },
    ],
    closingTitle: 'Moins de soirées au bureau. Plus de temps sur vos chantiers.',
    closingText: '14 jours pour tout essayer avec vos vrais chantiers. Sans engagement, résiliable en ligne.',
  },
  services: {
    label: 'Service & entretien',
    word: 'dossier',
    words: 'Dossiers',
    seoTitle: 'Logiciel pour entreprises de nettoyage, conciergerie et entretien en Suisse | Cantia',
    seoDescription: 'Interventions, équipes, heures, rapports avec photos, devis et factures QR : Cantia organise les entreprises de nettoyage, de conciergerie, d’entretien et de jardinage en Suisse.',
    eyebrow: 'Service & entretien',
    h1Plain: 'Chaque intervention,',
    h1Accent: 'suivie et facturée.',
    lead: 'Nettoyage, conciergerie, espaces verts, déménagement ou entretien technique : vos clients, vos équipes et vos interventions sont rassemblés par dossier. Les heures, les photos et les factures suivent, sans tableau à tenir à côté.',
    forEyebrow: 'Pour qui',
    forTitle: 'Les métiers du service et de l’entretien.',
    trades: [
      { name: 'Entreprises de nettoyage', text: 'Contrats d’entretien, nettoyages de fin de bail et de fin de chantier, équipes réparties sur plusieurs adresses.', sub: 'entreprise-nettoyage' },
      { name: 'Conciergeries et facility management', text: 'Immeubles suivis par gérance, petites interventions, rapports avec photos pour la régie.', sub: 'conciergerie' },
      { name: 'Paysagistes et entretien d’espaces verts', text: 'Tonte, taille, aménagements et contrats annuels, du devis à la facture.', slug: 'paysagiste' },
      { name: 'Déménageurs', text: 'Devis sur visite, équipes et véhicules planifiés, suppléments notés le jour même.', sub: 'demenageur' },
      { name: 'Garages et entretien technique', text: 'Interventions, pièces et heures par client, factures QR sans ressaisie.', sub: 'garage' },
      { name: 'Déneigement et services saisonniers', text: 'Interventions sur appel, heures par adresse et factures groupées en fin de mois.', sub: 'deneigement' },
    ],
    pains: [
      { title: 'Les heures arrivent sur papier en fin de mois', text: 'Les équipes notent ce qu’elles peuvent, le bureau reconstitue, et une partie du temps passé n’est jamais facturée.', answer: 'Chacun saisit ses heures sur son téléphone, par dossier et par type de travail. La facture reprend ce qui a été fait.' },
      { title: 'Un client conteste une intervention', text: 'Sans photo ni trace datée, c’est votre parole contre la sienne, et la facture attend.', answer: 'Photos datées et notes de l’équipe restent dans le dossier et forment un rapport PDF à envoyer au client.' },
      { title: 'Plusieurs équipes, plusieurs adresses', text: 'Qui va où demain ? Les plannings vivent dans des messages, et un changement de dernière minute se perd.', answer: 'Le planning partagé montre chaque équipe et chaque intervention. Chacun voit sa journée sur son téléphone.' },
    ],
    uses: [
      { icon: 'calendar', title: 'Planning des équipes', text: 'Interventions réparties par personne et par jour, visibles par toute l’équipe.', module: 'solutions/planning' },
      { icon: 'clock', title: 'Heures par dossier', text: 'Saisie sur le téléphone, par client et par type de travail, prête pour la facture et les salaires.', module: 'solutions/rh-salaires' },
      { icon: 'camera', title: 'Rapports d’intervention', text: 'Photos datées, notes et dictées réunies dans un rapport PDF à votre nom.', module: 'solutions/rapports-chantier' },
      { icon: 'file-text', title: 'Devis signés en ligne', text: 'Votre catalogue de prestations, le prix, la signature du client sur son téléphone.', module: 'solutions/devis' },
      { icon: 'credit-card', title: 'Factures QR et relances', text: 'Factures QR suisses, relances et suivi des paiements sans tableau à part.', module: 'solutions/facturation' },
      { icon: 'mic', title: 'Dictée sur le terrain', text: 'Une note, une heure ou une dépense dictée entre deux interventions, rangée au bon endroit.', module: 'solutions/dictee-vocale' },
    ],
    wordTitle: 'Vous parlez de dossiers. Cantia aussi.',
    wordText: 'À l’inscription, choisissez « dossier » : le menu, les boutons, les rapports et les e-mails à vos clients reprennent ce mot. Chaque dossier rassemble le client, l’adresse, l’équipe, les heures et les documents.',
    scenarioTitle: 'Un contrat d’entretien d’immeuble, de la demande au paiement.',
    scenario: [
      { title: 'La demande', text: 'La gérance demande une offre pour l’entretien d’un immeuble. Le devis se prépare avec vos prestations et vos prix.' },
      { title: 'L’accord', text: 'La gérance signe en ligne. Le dossier de l’immeuble est créé, avec son adresse et ses accès.' },
      { title: 'Les passages', text: 'L’équipe voit ses passages au planning, saisit ses heures et ajoute les photos de chaque intervention.' },
      { title: 'La facture', text: 'En fin de mois, la facture QR reprend les heures et prestations du dossier. Le paiement est suivi.' },
    ],
    faq: [
      { q: 'Cantia convient-il à une entreprise de nettoyage ?', a: 'Oui. Vous gérez vos clients et vos adresses par dossier, vos équipes au planning, les heures sur téléphone, puis les devis et les factures QR.' },
      { q: 'Puis-je appeler mes interventions « dossiers » ?', a: 'Oui. Vous choisissez entre chantier, projet, mandat ou dossier ; le mot est utilisé dans toute l’application et sur vos documents.' },
      { q: 'Mes employés ont-ils besoin d’une application ?', a: 'Non. Ils ouvrent Cantia dans le navigateur de leur téléphone, ou l’ajoutent à leur écran d’accueil. Rien à installer.' },
      { q: 'Puis-je facturer une gérance pour plusieurs immeubles ?', a: 'Oui. La gérance est un client, chaque immeuble a son dossier, et chaque facture précise l’immeuble concerné.' },
      { q: 'Les salaires sont-ils gérés ?', a: 'Oui, avec la formule Équipe : les heures saisies alimentent les fiches de salaire, avec les déductions suisses.' },
    ],
    closingTitle: 'Vos interventions suivies, vos heures facturées.',
    closingText: '14 jours pour essayer Cantia avec vos vrais clients. Sans engagement, résiliable en ligne.',
  },
  etudes: {
    label: 'Bureaux d’études',
    word: 'mandat',
    words: 'Mandats',
    seoTitle: 'Logiciel de gestion pour bureaux d’études, ingénieurs et architectes en Suisse | Cantia',
    seoDescription: 'Mandats, offres d’honoraires, temps passé par collaborateur, documents, dépenses et factures QR : Cantia organise les bureaux d’études, d’ingénieurs et d’architectes en Suisse.',
    eyebrow: 'Bureaux d’études',
    h1Plain: 'Chaque mandat,',
    h1Accent: 'son temps et ses honoraires.',
    lead: 'Ingénieurs, architectes, géomètres, bureaux techniques et conseillers : organisez votre activité par mandat. Offres, temps passé par collaborateur, documents, dépenses et factures restent ensemble, et vous savez ce que chaque mandat rapporte.',
    forEyebrow: 'Pour qui',
    forTitle: 'Les bureaux qui travaillent par mandat.',
    trades: [
      { name: 'Bureaux d’ingénieurs civils', text: 'Études de structure, direction des travaux, expertises : le temps passé suivi phase par phase.', sub: 'ingenieur-civil' },
      { name: 'Architectes', text: 'Avant-projets, mises à l’enquête et direction des travaux, documents et échanges réunis par mandat.', sub: 'architecte' },
      { name: 'Bureaux techniques CVC et électricité', text: 'Études, plans et suivi d’exécution, heures par collaborateur et par mandat.', sub: 'bureau-technique' },
      { name: 'Géomètres', text: 'Relevés, piquetages et mensurations, interventions sur le terrain et facturation au temps.', sub: 'geometre' },
      { name: 'Conseillers et consultants', text: 'Missions au forfait ou au temps passé, offres signées et factures QR.', sub: 'consultant' },
      { name: 'Informaticiens et formateurs', text: 'Projets clients, heures par mandat, factures et relances sans outil à part.', sub: 'informaticien-formateur' },
    ],
    pains: [
      { title: 'Le temps passé se reconstitue de mémoire', text: 'En fin de mois, chacun estime ses heures par mandat. Les honoraires facturés ne reflètent plus le travail réel.', answer: 'Chaque collaborateur saisit son temps par mandat et par type de travail. Vous facturez ce qui a été fait.' },
      { title: 'Un mandat déborde sans qu’on le voie', text: 'Les heures s’accumulent au-delà de l’offre d’honoraires, et la perte apparaît au bouclement.', answer: 'Offre, heures réelles et dépenses sont comparées en direct. La dérive se voit pendant le mandat.' },
      { title: 'Documents et échanges dispersés', text: 'Plans, versions et e-mails sont rangés chez chacun. Retrouver la bonne version prend du temps.', answer: 'Documents, notes et échanges sont réunis dans le mandat, accessibles à l’équipe selon ses droits.' },
    ],
    uses: [
      { icon: 'file-text', title: 'Offres d’honoraires', text: 'Au forfait ou au temps, avec signature électronique du client.', module: 'solutions/devis' },
      { icon: 'clock', title: 'Temps passé par mandat', text: 'Saisi par chaque collaborateur, par mandat et par type de travail.', module: 'solutions/rh-salaires' },
      { icon: 'trending-up', title: 'Rentabilité par mandat', text: 'Honoraires, heures et dépenses comparés pendant le mandat, pas après.', module: 'solutions/rentabilite' },
      { icon: 'folder', title: 'Documents du mandat', text: 'Plans, rapports et pièces rangés au même endroit, partagés selon les droits de chacun.' },
      { icon: 'credit-card', title: 'Factures QR et acomptes', text: 'Factures partielles, acomptes, relances et suivi des paiements.', module: 'solutions/facturation' },
      { icon: 'bar-chart-2', title: 'Trésorerie', text: 'Encaissements attendus et dépenses à venir sur les prochains mois.', module: 'solutions/tresorerie' },
    ],
    wordTitle: 'Vous parlez de mandats. Cantia aussi.',
    wordText: 'Choisissez « mandat » à l’inscription : l’application, vos offres et vos rapports reprennent ce mot. Chaque mandat a son numéro, son client, son équipe, son temps passé et ses documents.',
    scenarioTitle: 'Une étude de structure, de l’offre au dernier acompte.',
    scenario: [
      { title: 'L’offre', text: 'Vous chiffrez les phases de l’étude. Le maître d’ouvrage signe l’offre en ligne.' },
      { title: 'L’étude', text: 'Chaque ingénieur saisit son temps sur le mandat. Plans et notes de calcul restent dans le dossier.' },
      { title: 'Le suivi', text: 'Vous comparez les heures à l’offre, phase par phase, et voyez la marge du mandat en cours de route.' },
      { title: 'La facturation', text: 'Acomptes puis facture finale en QR-facture, relances et paiements suivis.' },
    ],
    faq: [
      { q: 'Cantia convient-il à un bureau d’ingénieurs ou d’architectes ?', a: 'Oui. Vous organisez votre activité par mandat, avec les offres, le temps passé par collaborateur, les documents, les dépenses et les factures.' },
      { q: 'Puis-je facturer au temps passé ?', a: 'Oui. Les heures saisies sur un mandat peuvent être reprises dans la facture, ou vous facturez au forfait avec des acomptes.' },
      { q: 'Puis-je appeler mes dossiers « mandats » ?', a: 'Oui. Le mot choisi est utilisé dans toute l’application et sur vos documents PDF.' },
      { q: 'Les collaborateurs voient-ils les honoraires ?', a: 'Non, pas forcément. Les rôles définissent qui voit les montants et qui ne saisit que son temps.' },
      { q: 'Peut-on relier Cantia à notre comptabilité ?', a: 'Oui : synchronisation avec Bexio, et accès en lecture pour votre fiduciaire avec Cantia Accounting.' },
    ],
    closingTitle: 'Vos mandats suivis, vos heures facturées.',
    closingText: '14 jours pour essayer Cantia avec vos vrais mandats. Sans engagement, résiliable en ligne.',
  },
  creatifs: {
    label: 'Agences & événementiel',
    word: 'projet',
    words: 'Projets',
    seoTitle: 'Logiciel de gestion pour agences, studios et entreprises d’événementiel en Suisse | Cantia',
    seoDescription: 'Offres signées en ligne, projets, équipe et prestataires, acomptes et factures QR : Cantia organise les agences, studios créatifs, photographes, traiteurs et entreprises d’événementiel en Suisse.',
    eyebrow: 'Agences & événementiel',
    h1Plain: 'Chaque projet,',
    h1Accent: 'de l’offre au dernier acompte.',
    lead: 'Agences de communication, studios, photographes, traiteurs et organisateurs d’événements : reliez l’offre, l’équipe mobilisée, le planning et la facturation de chaque projet. Les acomptes et les suppléments ne se perdent plus.',
    forEyebrow: 'Pour qui',
    forTitle: 'Les métiers qui livrent des projets.',
    trades: [
      { name: 'Agences de communication', text: 'Offres par projet, heures de l’équipe, acomptes et factures QR.', sub: 'agence-communication' },
      { name: 'Graphistes et studios créatifs', text: 'Identités, sites et campagnes : chaque projet avec son offre, son temps et ses fichiers.', sub: 'graphiste' },
      { name: 'Photographes et vidéastes', text: 'Mariages, entreprises et reportages : devis signé, acompte, livraison et solde.', sub: 'photographe-videaste' },
      { name: 'Traiteurs', text: 'Événements chiffrés au nombre d’invités, équipe planifiée, suppléments facturés.', sub: 'traiteur' },
      { name: 'Organisateurs d’événements', text: 'Salons, soirées et séminaires : prestataires, planning et facturation au même endroit.', sub: 'organisateur-evenements' },
      { name: 'Location de matériel et techniciens', text: 'Matériel, montage et techniciens planifiés par événement, factures sans ressaisie.', sub: 'location-materiel' },
    ],
    pains: [
      { title: 'L’offre change dix fois avant l’accord', text: 'Les versions circulent par e-mail, et personne ne sait plus laquelle le client a acceptée.', answer: 'L’offre est modifiée dans Cantia et le client signe la dernière version en ligne. Elle reste dans le projet.' },
      { title: 'Les extras du jour J', text: 'Un supplément décidé sur place, une heure de plus pour l’équipe : souvent oubliés au moment de facturer.', answer: 'Le supplément est noté et signé par le client sur votre téléphone, puis repris dans la facture finale.' },
      { title: 'Acompte, solde, relance', text: 'Suivre qui a payé quoi sur plusieurs projets à la fois demande un tableau à part, rarement à jour.', answer: 'Acomptes, factures QR et relances sont suivis par projet. Vous voyez ce qui reste à encaisser.' },
    ],
    uses: [
      { icon: 'file-text', title: 'Offres signées en ligne', text: 'Prestations, options et conditions, signées par le client sur son téléphone.', module: 'solutions/devis' },
      { icon: 'calendar', title: 'Planning de l’équipe', text: 'Qui est sur quel projet, quel jour, visible par toute l’équipe.', module: 'solutions/planning' },
      { icon: 'plus-circle', title: 'Suppléments signés', text: 'Un extra demandé le jour même, signé et ajouté à la facture.', module: 'solutions/travaux-supplementaires' },
      { icon: 'credit-card', title: 'Acomptes et factures QR', text: 'Acompte à la signature, solde après la livraison, relances suivies.', module: 'solutions/facturation' },
      { icon: 'clock', title: 'Heures et prestataires', text: 'Le temps de l’équipe et les dépenses du projet, pour connaître sa marge.', module: 'solutions/rentabilite' },
      { icon: 'folder', title: 'Fichiers du projet', text: 'Briefs, maquettes, contrats et photos rangés dans le projet.' },
    ],
    wordTitle: 'Vous parlez de projets. Cantia aussi.',
    wordText: 'Choisissez « projet » à l’inscription : le menu, vos offres et vos e-mails reprennent ce mot. Chaque projet a son client, sa date, son équipe, ses fichiers et sa facturation.',
    scenarioTitle: 'Un mariage, de la première demande au solde.',
    scenario: [
      { title: 'La demande', text: 'Les mariés vous écrivent. L’offre se prépare avec vos prestations et vos options.' },
      { title: 'La réservation', text: 'Ils signent en ligne et versent l’acompte demandé sur la facture QR.' },
      { title: 'Le jour J', text: 'L’équipe voit sa journée au planning. Une heure supplémentaire est signée sur place.' },
      { title: 'Le solde', text: 'La facture finale reprend l’offre et le supplément, moins l’acompte. Le paiement est suivi.' },
    ],
    faq: [
      { q: 'Cantia convient-il à une agence ou un studio ?', a: 'Oui. Vous organisez votre activité par projet, avec les offres signées en ligne, les heures de l’équipe, les acomptes et les factures QR.' },
      { q: 'Puis-je demander un acompte à la signature ?', a: 'Oui. Vous facturez un acompte, puis le solde ; Cantia suit ce qui a été payé et ce qui reste.' },
      { q: 'Puis-je appeler mes dossiers « projets » ?', a: 'Oui. Vous choisissez le mot à l’inscription ; il est utilisé dans toute l’application et sur vos documents.' },
      { q: 'Mes offres peuvent-elles porter mon identité visuelle ?', a: 'Oui : votre logo, votre couleur et vos textes sur chaque offre et chaque facture.' },
      { q: 'Et si un client ajoute une prestation le jour même ?', a: 'Vous l’ajoutez au projet et le client la signe sur votre téléphone. Elle est reprise dans la facture finale.' },
    ],
    closingTitle: 'Vos projets livrés, vos acomptes encaissés.',
    closingText: '14 jours pour essayer Cantia avec vos vrais projets. Sans engagement, résiliable en ligne.',
  },
};

const DE: Record<SectorKey, SectorCopy> = {
  batiment: {
    label: 'Bau & Handwerk',
    word: 'Baustelle',
    words: 'Baustellen',
    seoTitle: 'Software für Bau- und Handwerksbetriebe in der Schweiz | Cantia',
    seoDescription: 'Online unterschriebene Offerten, ausgefüllte Ausschreibungen, Bauprogramm, Rapporte mit Fotos, Stunden und QR-Rechnungen: die Software für Baubetriebe in der Schweiz.',
    eyebrow: 'Bau & Handwerk',
    h1Plain: 'Jede Baustelle,',
    h1Accent: 'von der Offerte bis zur Rechnung.',
    lead: 'Rohbau, Ausbau, Gebäudetechnik oder Renovation: Cantia verbindet Ihre Offerten, Ihre Teams vor Ort, Ihre Regiearbeiten und Ihre QR-Rechnungen. Jede Information bleibt bei der richtigen Baustelle.',
    forEyebrow: 'Für wen',
    forTitle: 'Eine Seite für jedes Gewerk.',
    trades: [],
    pains: [
      { title: 'Offerten entstehen abends in Excel', text: 'Dieselben Positionen abschreiben, nachrechnen, den Kunden an die Unterschrift erinnern: Stunden, die nie verrechnet werden.', answer: 'Ihr Katalog füllt die Offerte, der Kunde unterschreibt online auf dem Handy, und die Offerte wird ohne Abtippen zur Rechnung.' },
      { title: 'Vor Ort vereinbart, bei der Rechnung vergessen', text: 'Der Kunde wünscht nebenbei eine Zusatzarbeit. Ohne schriftliche Spur wird sie verschenkt oder bei der Zahlung bestritten.', answer: 'Die Regiearbeit wird auf der Baustelle erfasst, vom Kunden auf Ihrem Handy unterschrieben und in die Rechnung übernommen.' },
      { title: 'Die Rentabilität zeigt sich erst am Schluss', text: 'Stunden, Material und Subunternehmer summieren sich, ohne dass jemand die Abweichung vor der Schlussabrechnung sieht.', answer: 'Offerierter Betrag, effektive Stunden und Ausgaben werden laufend verglichen, Baustelle für Baustelle.' },
    ],
    uses: [
      { icon: 'file-text', title: 'Offerten und Online-Unterschrift', text: 'Positionen aus Ihrem Katalog, MWST, Akontos und elektronische Unterschrift des Kunden.', module: 'solutions/devis' },
      { icon: 'clipboard', title: 'Ausgefüllte Ausschreibungen', text: 'Die PDF-Ausschreibung des Architekten Position für Position übernommen, Ihre Preise, dann das ausgefüllte Original-PDF.', module: 'solutions/soumissions' },
      { icon: 'calendar', title: 'Bauprogramm', text: 'Teams, Subunternehmer und Phasen in einem gemeinsamen Plan, im Büro wie auf der Baustelle.', module: 'solutions/planning' },
      { icon: 'camera', title: 'Rapporte mit Fotos', text: 'Notizen, Fotos und Diktate des Teams werden zu einem versandbereiten PDF-Rapport.', module: 'solutions/rapports-chantier' },
      { icon: 'plus-circle', title: 'Regiearbeiten', text: 'Vor Ort vom Kunden unterschrieben, der Baustelle zugeordnet, lückenlos verrechnet.', module: 'solutions/travaux-supplementaires' },
      { icon: 'credit-card', title: 'QR-Rechnungen und Rentabilität', text: 'Schweizer QR-Rechnungen, Mahnungen, Akontos und die effektive Marge jeder Baustelle.', module: 'solutions/facturation' },
    ],
    wordTitle: 'Sie sprechen von Baustellen. Cantia auch.',
    wordText: 'Menü, Schaltflächen, PDF-Rapporte und E-Mails an Ihre Kunden verwenden Ihren Begriff. Jede Baustelle hat ihre Nummer, ihren Kunden, ihr Team, ihre Dokumente und ihren Verlauf.',
    scenarioTitle: 'Ein neues Badezimmer, von der Besichtigung bis zur Zahlung.',
    scenario: [
      { title: 'Die Besichtigung', text: 'Sie messen aus und diktieren die Positionen. Die Offerte entsteht mit den Preisen Ihres Katalogs.' },
      { title: 'Die Unterschrift', text: 'Der Kunde erhält den Link und unterschreibt auf dem Handy. Die Baustelle wird mit der unterschriebenen Offerte erstellt.' },
      { title: 'Die Baustelle', text: 'Das Team erfasst Stunden und Fotos. Eine vor Ort gewünschte Zusatzarbeit wird gleich unterschrieben.' },
      { title: 'Die Rechnung', text: 'Offerte und Regiearbeit werden zur QR-Rechnung. Die Zahlung wird verfolgt, die Marge ist bekannt.' },
    ],
    faq: [
      { q: 'Eignet sich Cantia für einen kleinen Baubetrieb?', a: 'Ja. Eine Einzelfirma beginnt mit Offerten, Baustellen und Rechnungen und ergänzt Team, Planung oder Löhne, wenn sie wächst.' },
      { q: 'Kann ich die Ausschreibungen des Architekten ausfüllen?', a: 'Ja. Sie importieren die PDF-Ausschreibung, Positionen und Mengen werden übernommen, Sie setzen Ihre Preise und senden das ausgefüllte Original-PDF zurück. Die Funktion ist in der Beta-Phase.' },
      { q: 'Können meine Mitarbeitenden ihre Stunden auf der Baustelle erfassen?', a: 'Ja, auf dem Handy, ohne etwas zu installieren. Jede Stunde gehört zu einer Baustelle und einer Tätigkeit.' },
      { q: 'Sind die Rechnungen in der Schweiz konform?', a: 'Ja: QR-Rechnung, MWST, Nummerierung und Pflichtangaben. Sie können Ihre Rechnungen auch mit Bexio synchronisieren.' },
      { q: 'Wie lange dauert der Start?', a: 'Einige Minuten für das Unternehmen und die erste Offerte. Kunden und Katalog lassen sich aus Excel importieren.' },
    ],
    closingTitle: 'Weniger Abende im Büro. Mehr Zeit auf Ihren Baustellen.',
    closingText: '14 Tage, um alles mit Ihren echten Baustellen zu testen. Ohne Verpflichtung, online kündbar.',
  },
  services: {
    label: 'Service & Unterhalt',
    word: 'Dossier',
    words: 'Dossiers',
    seoTitle: 'Software für Reinigung, Hauswartung und Unterhalt in der Schweiz | Cantia',
    seoDescription: 'Einsätze, Teams, Stunden, Rapporte mit Fotos, Offerten und QR-Rechnungen: Cantia organisiert Reinigungsfirmen, Hauswartungen, Unterhalts- und Gartenbetriebe in der Schweiz.',
    eyebrow: 'Service & Unterhalt',
    h1Plain: 'Jeder Einsatz,',
    h1Accent: 'erfasst und verrechnet.',
    lead: 'Reinigung, Hauswartung, Grünflächen, Umzüge oder technischer Unterhalt: Ihre Kunden, Teams und Einsätze sind pro Dossier gebündelt. Stunden, Fotos und Rechnungen folgen, ohne Tabelle daneben.',
    forEyebrow: 'Für wen',
    forTitle: 'Die Berufe in Service und Unterhalt.',
    trades: [
      { name: 'Reinigungsfirmen', text: 'Unterhaltsverträge, End- und Baureinigungen, Teams an mehreren Adressen.', sub: 'entreprise-nettoyage' },
      { name: 'Hauswartung und Facility Management', text: 'Liegenschaften pro Verwaltung, kleine Einsätze, Rapporte mit Fotos für die Verwaltung.', sub: 'conciergerie' },
      { name: 'Gartenbau und Grünflächenpflege', text: 'Mähen, Schneiden, Gestaltung und Jahresverträge, von der Offerte bis zur Rechnung.', slug: 'paysagiste' },
      { name: 'Umzugsfirmen', text: 'Offerte nach Besichtigung, geplante Teams und Fahrzeuge, Zuschläge am selben Tag erfasst.', sub: 'demenageur' },
      { name: 'Garagen und technischer Unterhalt', text: 'Einsätze, Teile und Stunden pro Kunde, QR-Rechnungen ohne Abtippen.', sub: 'garage' },
      { name: 'Winterdienst und Saisonarbeiten', text: 'Einsätze auf Abruf, Stunden pro Adresse und gesammelte Rechnungen am Monatsende.', sub: 'deneigement' },
    ],
    pains: [
      { title: 'Die Stunden kommen Ende Monat auf Papier', text: 'Die Teams notieren, was sie können, das Büro rekonstruiert, und ein Teil der Zeit wird nie verrechnet.', answer: 'Alle erfassen ihre Stunden auf dem Handy, pro Dossier und Tätigkeit. Die Rechnung übernimmt, was gemacht wurde.' },
      { title: 'Ein Kunde bestreitet einen Einsatz', text: 'Ohne Foto und datierte Spur steht Wort gegen Wort, und die Rechnung wartet.', answer: 'Datierte Fotos und Notizen des Teams bleiben im Dossier und ergeben einen PDF-Rapport für den Kunden.' },
      { title: 'Mehrere Teams, mehrere Adressen', text: 'Wer geht morgen wohin? Die Pläne leben in Nachrichten, und eine kurzfristige Änderung geht verloren.', answer: 'Der gemeinsame Plan zeigt jedes Team und jeden Einsatz. Alle sehen ihren Tag auf dem Handy.' },
    ],
    uses: [
      { icon: 'calendar', title: 'Einsatzplanung', text: 'Einsätze pro Person und Tag, für das ganze Team sichtbar.', module: 'solutions/planning' },
      { icon: 'clock', title: 'Stunden pro Dossier', text: 'Auf dem Handy erfasst, pro Kunde und Tätigkeit, bereit für Rechnung und Lohn.', module: 'solutions/rh-salaires' },
      { icon: 'camera', title: 'Einsatzrapporte', text: 'Datierte Fotos, Notizen und Diktate in einem PDF-Rapport in Ihrem Namen.', module: 'solutions/rapports-chantier' },
      { icon: 'file-text', title: 'Online unterschriebene Offerten', text: 'Ihr Leistungskatalog, der Preis, die Unterschrift des Kunden auf dem Handy.', module: 'solutions/devis' },
      { icon: 'credit-card', title: 'QR-Rechnungen und Mahnungen', text: 'Schweizer QR-Rechnungen, Mahnungen und Zahlungsübersicht ohne separate Tabelle.', module: 'solutions/facturation' },
      { icon: 'mic', title: 'Diktat unterwegs', text: 'Eine Notiz, eine Stunde oder eine Ausgabe zwischen zwei Einsätzen diktiert und richtig abgelegt.', module: 'solutions/dictee-vocale' },
    ],
    wordTitle: 'Sie sprechen von Dossiers. Cantia auch.',
    wordText: 'Wählen Sie bei der Registrierung «Dossier»: Menü, Schaltflächen, Rapporte und E-Mails an Ihre Kunden übernehmen diesen Begriff. Jedes Dossier bündelt Kunde, Adresse, Team, Stunden und Dokumente.',
    scenarioTitle: 'Ein Unterhaltsvertrag für eine Liegenschaft, von der Anfrage bis zur Zahlung.',
    scenario: [
      { title: 'Die Anfrage', text: 'Die Verwaltung wünscht eine Offerte für den Unterhalt einer Liegenschaft. Die Offerte entsteht mit Ihren Leistungen und Preisen.' },
      { title: 'Die Zusage', text: 'Die Verwaltung unterschreibt online. Das Dossier der Liegenschaft wird mit Adresse und Zugängen erstellt.' },
      { title: 'Die Einsätze', text: 'Das Team sieht seine Einsätze im Plan, erfasst Stunden und fügt die Fotos jedes Einsatzes hinzu.' },
      { title: 'Die Rechnung', text: 'Ende Monat übernimmt die QR-Rechnung Stunden und Leistungen des Dossiers. Die Zahlung wird verfolgt.' },
    ],
    faq: [
      { q: 'Eignet sich Cantia für eine Reinigungsfirma?', a: 'Ja. Sie verwalten Kunden und Adressen pro Dossier, Ihre Teams im Plan, die Stunden auf dem Handy, dann Offerten und QR-Rechnungen.' },
      { q: 'Kann ich meine Einsätze «Dossiers» nennen?', a: 'Ja. Sie wählen zwischen Baustelle, Projekt, Mandat oder Dossier; der Begriff erscheint in der ganzen App und auf Ihren Dokumenten.' },
      { q: 'Brauchen meine Mitarbeitenden eine App?', a: 'Nein. Sie öffnen Cantia im Browser des Handys oder legen es auf den Startbildschirm. Nichts zu installieren.' },
      { q: 'Kann ich einer Verwaltung mehrere Liegenschaften verrechnen?', a: 'Ja. Die Verwaltung ist ein Kunde, jede Liegenschaft hat ihr Dossier, und jede Rechnung nennt die betreffende Liegenschaft.' },
      { q: 'Werden die Löhne verwaltet?', a: 'Ja, mit dem Abo Team: Die erfassten Stunden fliessen in die Lohnabrechnungen, mit den Schweizer Abzügen.' },
    ],
    closingTitle: 'Ihre Einsätze erfasst, Ihre Stunden verrechnet.',
    closingText: '14 Tage, um Cantia mit Ihren echten Kunden zu testen. Ohne Verpflichtung, online kündbar.',
  },
  etudes: {
    label: 'Planungsbüros',
    word: 'Mandat',
    words: 'Mandate',
    seoTitle: 'Software für Ingenieur-, Planungs- und Architekturbüros in der Schweiz | Cantia',
    seoDescription: 'Mandate, Honorarofferten, Zeit pro Mitarbeitende, Dokumente, Ausgaben und QR-Rechnungen: Cantia organisiert Ingenieur-, Planungs- und Architekturbüros in der Schweiz.',
    eyebrow: 'Planungsbüros',
    h1Plain: 'Jedes Mandat,',
    h1Accent: 'seine Zeit und sein Honorar.',
    lead: 'Ingenieure, Architekten, Geometer, Fachplaner und Berater: Organisieren Sie Ihre Tätigkeit nach Mandaten. Offerten, Zeit pro Mitarbeitende, Dokumente, Ausgaben und Rechnungen bleiben zusammen, und Sie wissen, was jedes Mandat einbringt.',
    forEyebrow: 'Für wen',
    forTitle: 'Die Büros, die nach Mandaten arbeiten.',
    trades: [
      { name: 'Bauingenieurbüros', text: 'Tragwerksplanung, Bauleitung, Gutachten: die Zeit Phase für Phase erfasst.', sub: 'ingenieur-civil' },
      { name: 'Architekturbüros', text: 'Vorprojekte, Baueingaben und Bauleitung, Dokumente und Austausch pro Mandat gebündelt.', sub: 'architecte' },
      { name: 'Fachplaner HLK und Elektro', text: 'Studien, Pläne und Ausführungsbegleitung, Stunden pro Mitarbeitende und Mandat.', sub: 'bureau-technique' },
      { name: 'Geometer', text: 'Aufnahmen, Absteckungen und Vermessungen, Einsätze im Feld und Abrechnung nach Aufwand.', sub: 'geometre' },
      { name: 'Beraterinnen und Berater', text: 'Mandate pauschal oder nach Aufwand, unterschriebene Offerten und QR-Rechnungen.', sub: 'consultant' },
      { name: 'Informatik und Weiterbildung', text: 'Kundenprojekte, Stunden pro Mandat, Rechnungen und Mahnungen ohne separates Werkzeug.', sub: 'informaticien-formateur' },
    ],
    pains: [
      { title: 'Die Zeit wird aus dem Gedächtnis rekonstruiert', text: 'Ende Monat schätzt jede Person ihre Stunden pro Mandat. Die verrechneten Honorare spiegeln die echte Arbeit nicht mehr.', answer: 'Alle Mitarbeitenden erfassen ihre Zeit pro Mandat und Tätigkeit. Sie verrechnen, was gemacht wurde.' },
      { title: 'Ein Mandat läuft aus dem Ruder', text: 'Die Stunden übersteigen die Honorarofferte, und der Verlust zeigt sich erst beim Abschluss.', answer: 'Offerte, effektive Stunden und Ausgaben werden laufend verglichen. Die Abweichung zeigt sich während des Mandats.' },
      { title: 'Dokumente und Austausch verstreut', text: 'Pläne, Versionen und E-Mails liegen bei jeder Person. Die richtige Version zu finden, kostet Zeit.', answer: 'Dokumente, Notizen und Austausch sind im Mandat gebündelt, für das Team je nach Rechten zugänglich.' },
    ],
    uses: [
      { icon: 'file-text', title: 'Honorarofferten', text: 'Pauschal oder nach Aufwand, mit elektronischer Unterschrift des Kunden.', module: 'solutions/devis' },
      { icon: 'clock', title: 'Zeit pro Mandat', text: 'Von allen Mitarbeitenden erfasst, pro Mandat und Tätigkeit.', module: 'solutions/rh-salaires' },
      { icon: 'trending-up', title: 'Rentabilität pro Mandat', text: 'Honorar, Stunden und Ausgaben während des Mandats verglichen, nicht danach.', module: 'solutions/rentabilite' },
      { icon: 'folder', title: 'Dokumente des Mandats', text: 'Pläne, Berichte und Unterlagen am selben Ort, je nach Rechten geteilt.' },
      { icon: 'credit-card', title: 'QR-Rechnungen und Akontos', text: 'Teilrechnungen, Akontos, Mahnungen und Zahlungsübersicht.', module: 'solutions/facturation' },
      { icon: 'bar-chart-2', title: 'Liquidität', text: 'Erwartete Zahlungseingänge und kommende Ausgaben der nächsten Monate.', module: 'solutions/tresorerie' },
    ],
    wordTitle: 'Sie sprechen von Mandaten. Cantia auch.',
    wordText: 'Wählen Sie bei der Registrierung «Mandat»: die App, Ihre Offerten und Rapporte übernehmen diesen Begriff. Jedes Mandat hat seine Nummer, seinen Kunden, sein Team, seine Zeit und seine Dokumente.',
    scenarioTitle: 'Eine Tragwerksstudie, von der Offerte bis zum letzten Akonto.',
    scenario: [
      { title: 'Die Offerte', text: 'Sie kalkulieren die Phasen der Studie. Die Bauherrschaft unterschreibt die Offerte online.' },
      { title: 'Die Studie', text: 'Alle Ingenieure erfassen ihre Zeit auf dem Mandat. Pläne und Berechnungen bleiben im Dossier.' },
      { title: 'Die Kontrolle', text: 'Sie vergleichen die Stunden mit der Offerte, Phase für Phase, und sehen die Marge unterwegs.' },
      { title: 'Die Abrechnung', text: 'Akontos und Schlussrechnung als QR-Rechnung, Mahnungen und Zahlungen verfolgt.' },
    ],
    faq: [
      { q: 'Eignet sich Cantia für ein Ingenieur- oder Architekturbüro?', a: 'Ja. Sie organisieren Ihre Tätigkeit nach Mandaten, mit Offerten, Zeit pro Mitarbeitende, Dokumenten, Ausgaben und Rechnungen.' },
      { q: 'Kann ich nach Aufwand verrechnen?', a: 'Ja. Die auf einem Mandat erfassten Stunden können in die Rechnung übernommen werden, oder Sie verrechnen pauschal mit Akontos.' },
      { q: 'Kann ich meine Dossiers «Mandate» nennen?', a: 'Ja. Der gewählte Begriff erscheint in der ganzen App und auf Ihren PDF-Dokumenten.' },
      { q: 'Sehen die Mitarbeitenden die Honorare?', a: 'Nicht unbedingt. Die Rollen legen fest, wer Beträge sieht und wer nur seine Zeit erfasst.' },
      { q: 'Lässt sich Cantia mit unserer Buchhaltung verbinden?', a: 'Ja: Synchronisation mit Bexio und Lesezugriff für Ihre Treuhand mit Cantia Accounting.' },
    ],
    closingTitle: 'Ihre Mandate im Griff, Ihre Stunden verrechnet.',
    closingText: '14 Tage, um Cantia mit Ihren echten Mandaten zu testen. Ohne Verpflichtung, online kündbar.',
  },
  creatifs: {
    label: 'Agenturen & Events',
    word: 'Projekt',
    words: 'Projekte',
    seoTitle: 'Software für Agenturen, Studios und Eventfirmen in der Schweiz | Cantia',
    seoDescription: 'Online unterschriebene Offerten, Projekte, Team und Dienstleister, Akontos und QR-Rechnungen: Cantia organisiert Agenturen, Studios, Fotografen, Caterer und Eventfirmen in der Schweiz.',
    eyebrow: 'Agenturen & Events',
    h1Plain: 'Jedes Projekt,',
    h1Accent: 'von der Offerte bis zum letzten Akonto.',
    lead: 'Kommunikationsagenturen, Studios, Fotografen, Caterer und Eventveranstalter: Verbinden Sie Offerte, eingesetztes Team, Planung und Abrechnung jedes Projekts. Akontos und Zusatzleistungen gehen nicht mehr verloren.',
    forEyebrow: 'Für wen',
    forTitle: 'Die Berufe, die Projekte liefern.',
    trades: [
      { name: 'Kommunikationsagenturen', text: 'Offerten pro Projekt, Stunden des Teams, Akontos und QR-Rechnungen.', sub: 'agence-communication' },
      { name: 'Grafik- und Kreativstudios', text: 'Erscheinungsbilder, Websites und Kampagnen: jedes Projekt mit Offerte, Zeit und Dateien.', sub: 'graphiste' },
      { name: 'Fotografen und Videografen', text: 'Hochzeiten, Unternehmen und Reportagen: unterschriebene Offerte, Akonto, Lieferung und Restzahlung.', sub: 'photographe-videaste' },
      { name: 'Caterer', text: 'Anlässe nach Gästezahl kalkuliert, Team geplant, Zusatzleistungen verrechnet.', sub: 'traiteur' },
      { name: 'Eventveranstalter', text: 'Messen, Abende und Seminare: Dienstleister, Planung und Abrechnung am selben Ort.', sub: 'organisateur-evenements' },
      { name: 'Materialvermietung und Technik', text: 'Material, Aufbau und Techniker pro Anlass geplant, Rechnungen ohne Abtippen.', sub: 'location-materiel' },
    ],
    pains: [
      { title: 'Die Offerte ändert sich zehnmal vor der Zusage', text: 'Die Versionen kreisen per E-Mail, und niemand weiss mehr, welche der Kunde angenommen hat.', answer: 'Die Offerte wird in Cantia angepasst, und der Kunde unterschreibt die letzte Version online. Sie bleibt im Projekt.' },
      { title: 'Die Extras am Tag X', text: 'Eine vor Ort vereinbarte Zusatzleistung, eine Stunde mehr für das Team: oft vergessen bei der Rechnung.', answer: 'Die Zusatzleistung wird erfasst und vom Kunden auf Ihrem Handy unterschrieben, dann in die Schlussrechnung übernommen.' },
      { title: 'Akonto, Restzahlung, Mahnung', text: 'Wer hat bei mehreren Projekten was bezahlt? Dafür braucht es eine separate, selten aktuelle Tabelle.', answer: 'Akontos, QR-Rechnungen und Mahnungen werden pro Projekt verfolgt. Sie sehen, was noch offen ist.' },
    ],
    uses: [
      { icon: 'file-text', title: 'Online unterschriebene Offerten', text: 'Leistungen, Optionen und Bedingungen, vom Kunden auf dem Handy unterschrieben.', module: 'solutions/devis' },
      { icon: 'calendar', title: 'Teamplanung', text: 'Wer arbeitet an welchem Tag an welchem Projekt, für das ganze Team sichtbar.', module: 'solutions/planning' },
      { icon: 'plus-circle', title: 'Unterschriebene Zusatzleistungen', text: 'Ein Extra am selben Tag gewünscht, unterschrieben und in die Rechnung übernommen.', module: 'solutions/travaux-supplementaires' },
      { icon: 'credit-card', title: 'Akontos und QR-Rechnungen', text: 'Akonto bei der Unterschrift, Restzahlung nach der Lieferung, Mahnungen verfolgt.', module: 'solutions/facturation' },
      { icon: 'clock', title: 'Stunden und Dienstleister', text: 'Die Zeit des Teams und die Ausgaben des Projekts, um seine Marge zu kennen.', module: 'solutions/rentabilite' },
      { icon: 'folder', title: 'Projektdateien', text: 'Briefings, Entwürfe, Verträge und Fotos im Projekt abgelegt.' },
    ],
    wordTitle: 'Sie sprechen von Projekten. Cantia auch.',
    wordText: 'Wählen Sie bei der Registrierung «Projekt»: Menü, Offerten und E-Mails übernehmen diesen Begriff. Jedes Projekt hat seinen Kunden, sein Datum, sein Team, seine Dateien und seine Abrechnung.',
    scenarioTitle: 'Eine Hochzeit, von der ersten Anfrage bis zur Restzahlung.',
    scenario: [
      { title: 'Die Anfrage', text: 'Das Brautpaar schreibt Ihnen. Die Offerte entsteht mit Ihren Leistungen und Optionen.' },
      { title: 'Die Buchung', text: 'Es unterschreibt online und zahlt das Akonto über die QR-Rechnung.' },
      { title: 'Der Tag X', text: 'Das Team sieht seinen Tag im Plan. Eine zusätzliche Stunde wird vor Ort unterschrieben.' },
      { title: 'Die Restzahlung', text: 'Die Schlussrechnung übernimmt Offerte und Zusatzleistung, abzüglich Akonto. Die Zahlung wird verfolgt.' },
    ],
    faq: [
      { q: 'Eignet sich Cantia für eine Agentur oder ein Studio?', a: 'Ja. Sie organisieren Ihre Tätigkeit nach Projekten, mit online unterschriebenen Offerten, Stunden des Teams, Akontos und QR-Rechnungen.' },
      { q: 'Kann ich bei der Unterschrift ein Akonto verlangen?', a: 'Ja. Sie verrechnen ein Akonto, dann den Rest; Cantia verfolgt, was bezahlt ist und was offen bleibt.' },
      { q: 'Kann ich meine Dossiers «Projekte» nennen?', a: 'Ja. Sie wählen den Begriff bei der Registrierung; er erscheint in der ganzen App und auf Ihren Dokumenten.' },
      { q: 'Können meine Offerten mein Erscheinungsbild tragen?', a: 'Ja: Ihr Logo, Ihre Farbe und Ihre Texte auf jeder Offerte und jeder Rechnung.' },
      { q: 'Und wenn ein Kunde am selben Tag eine Leistung ergänzt?', a: 'Sie fügen sie dem Projekt hinzu, und der Kunde unterschreibt auf Ihrem Handy. Sie erscheint in der Schlussrechnung.' },
    ],
    closingTitle: 'Ihre Projekte geliefert, Ihre Akontos bezahlt.',
    closingText: '14 Tage, um Cantia mit Ihren echten Projekten zu testen. Ohne Verpflichtung, online kündbar.',
  },
};

const IT: Record<SectorKey, SectorCopy> = {
  batiment: {
    label: 'Edilizia & artigianato',
    word: 'cantiere',
    words: 'Cantieri',
    seoTitle: 'Software gestionale per edilizia e artigianato in Svizzera | Cantia',
    seoDescription: 'Preventivi firmati online, capitolati compilati, programma lavori, rapporti con foto, ore e fatture QR: il software delle imprese edili in Svizzera.',
    eyebrow: 'Edilizia & artigianato',
    h1Plain: 'Ogni cantiere,',
    h1Accent: 'dal preventivo alla fattura.',
    lead: 'Grezzo, finiture, impiantistica o ristrutturazione: Cantia collega i suoi preventivi, le squadre sul posto, i lavori supplementari e le fatture QR. Ogni informazione resta legata al cantiere giusto.',
    forEyebrow: 'Per chi',
    forTitle: 'Una pagina per ogni mestiere.',
    trades: [],
    pains: [
      { title: 'I preventivi si fanno la sera, su Excel', text: 'Ricopiare le stesse posizioni, rifare i calcoli, sollecitare il cliente per la firma: ore che non vengono mai fatturate.', answer: 'Il suo catalogo compila il preventivo, il cliente firma online dal telefono e il preventivo diventa fattura senza ribattere nulla.' },
      { title: 'Un extra deciso sul posto, dimenticato in fattura', text: 'Il cliente chiede un lavoro in più di passaggio. Senza traccia scritta, finisce regalato o contestato al pagamento.', answer: 'Il lavoro supplementare viene registrato sul cantiere, firmato dal cliente sul suo telefono e ripreso in fattura.' },
      { title: 'La redditività si scopre alla fine', text: 'Ore, materiali e subappaltatori si sommano senza che nessuno veda lo scostamento prima del consuntivo.', answer: 'Preventivato, ore reali e spese vengono confrontati in diretta, cantiere per cantiere.' },
    ],
    uses: [
      { icon: 'file-text', title: 'Preventivi e firma online', text: 'Posizioni dal suo catalogo, IVA, acconti e firma elettronica del cliente.', module: 'solutions/devis' },
      { icon: 'clipboard', title: 'Capitolati compilati', text: 'Il capitolato PDF dell’architetto ripreso posizione per posizione, i suoi prezzi, poi il PDF originale compilato.', module: 'solutions/soumissions' },
      { icon: 'calendar', title: 'Programma lavori', text: 'Squadre, subappaltatori e fasi su un programma condiviso, in ufficio come in cantiere.', module: 'solutions/planning' },
      { icon: 'camera', title: 'Rapporti con foto', text: 'Note, foto e dettature della squadra diventano un rapporto PDF pronto da inviare.', module: 'solutions/rapports-chantier' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Firmati sul posto dal cliente, aggiunti al cantiere, fatturati senza dimenticanze.', module: 'solutions/travaux-supplementaires' },
      { icon: 'credit-card', title: 'Fatture QR e redditività', text: 'Fatture QR svizzere, solleciti, acconti e margine reale di ogni cantiere.', module: 'solutions/facturation' },
    ],
    wordTitle: 'Lei parla di cantieri. Anche Cantia.',
    wordText: 'Il menu, i pulsanti, i rapporti PDF e le e-mail ai clienti usano la sua parola. Ogni cantiere ha il suo numero, il suo cliente, la sua squadra, i suoi documenti e il suo storico.',
    scenarioTitle: 'Un bagno rifatto, dal sopralluogo al pagamento.',
    scenario: [
      { title: 'Il sopralluogo', text: 'Prende le misure e detta le posizioni. Il preventivo si prepara con i prezzi del suo catalogo.' },
      { title: 'La firma', text: 'Il cliente riceve il link e firma dal telefono. Il cantiere viene creato con il preventivo firmato.' },
      { title: 'Il cantiere', text: 'La squadra registra ore e foto. Un extra chiesto sul posto viene firmato subito.' },
      { title: 'La fattura', text: 'Preventivo ed extra diventano una fattura QR. Il pagamento è seguito, il margine del cantiere è noto.' },
    ],
    faq: [
      { q: 'Cantia è adatto a una piccola impresa edile?', a: 'Sì. Una ditta individuale inizia con preventivi, cantieri e fatture, poi aggiunge squadra, programma o salari quando cresce.' },
      { q: 'Posso compilare i capitolati dell’architetto?', a: 'Sì. Importa il capitolato PDF, posizioni e quantità vengono riprese, inserisce i suoi prezzi e rimanda il PDF originale compilato. La funzione è in beta.' },
      { q: 'I miei operai possono registrare le ore in cantiere?', a: 'Sì, dal telefono, senza installare nulla. Ogni ora è legata a un cantiere e a un tipo di lavoro.' },
      { q: 'Le fatture sono conformi in Svizzera?', a: 'Sì: QR-fattura, IVA, numerazione e menzioni obbligatorie. Può anche sincronizzare le fatture con Bexio.' },
      { q: 'Quanto tempo serve per iniziare?', a: 'Pochi minuti per creare l’azienda e il primo preventivo. Clienti e catalogo si importano da Excel.' },
    ],
    closingTitle: 'Meno serate in ufficio. Più tempo sui suoi cantieri.',
    closingText: '14 giorni per provare tutto con i suoi veri cantieri. Senza impegno, disdicibile online.',
  },
  services: {
    label: 'Servizi & manutenzione',
    word: 'dossier',
    words: 'Dossier',
    seoTitle: 'Software per imprese di pulizia, portineria e manutenzione in Svizzera | Cantia',
    seoDescription: 'Interventi, squadre, ore, rapporti con foto, preventivi e fatture QR: Cantia organizza imprese di pulizia, portinerie, manutenzione e giardinaggio in Svizzera.',
    eyebrow: 'Servizi & manutenzione',
    h1Plain: 'Ogni intervento,',
    h1Accent: 'seguito e fatturato.',
    lead: 'Pulizie, portineria, aree verdi, traslochi o manutenzione tecnica: clienti, squadre e interventi sono raccolti per dossier. Ore, foto e fatture seguono, senza tabelle a parte.',
    forEyebrow: 'Per chi',
    forTitle: 'I mestieri dei servizi e della manutenzione.',
    trades: [
      { name: 'Imprese di pulizia', text: 'Contratti di manutenzione, pulizie di fine locazione e di fine cantiere, squadre su più indirizzi.', sub: 'entreprise-nettoyage' },
      { name: 'Portinerie e facility management', text: 'Stabili seguiti per amministrazione, piccoli interventi, rapporti con foto per l’amministrazione.', sub: 'conciergerie' },
      { name: 'Giardinieri e manutenzione del verde', text: 'Taglio erba, potature, sistemazioni e contratti annuali, dal preventivo alla fattura.', slug: 'paysagiste' },
      { name: 'Ditte di traslochi', text: 'Preventivo dopo sopralluogo, squadre e veicoli pianificati, supplementi registrati il giorno stesso.', sub: 'demenageur' },
      { name: 'Garage e manutenzione tecnica', text: 'Interventi, pezzi e ore per cliente, fatture QR senza ribattere nulla.', sub: 'garage' },
      { name: 'Sgombero neve e servizi stagionali', text: 'Interventi su chiamata, ore per indirizzo e fatture raggruppate a fine mese.', sub: 'deneigement' },
    ],
    pains: [
      { title: 'Le ore arrivano su carta a fine mese', text: 'Le squadre annotano ciò che possono, l’ufficio ricostruisce e una parte del tempo non viene mai fatturata.', answer: 'Ognuno registra le ore sul telefono, per dossier e tipo di lavoro. La fattura riprende ciò che è stato fatto.' },
      { title: 'Un cliente contesta un intervento', text: 'Senza foto né traccia datata, è la sua parola contro la sua, e la fattura aspetta.', answer: 'Foto datate e note della squadra restano nel dossier e formano un rapporto PDF da inviare al cliente.' },
      { title: 'Più squadre, più indirizzi', text: 'Chi va dove domani? I programmi vivono nei messaggi e un cambiamento dell’ultimo minuto si perde.', answer: 'Il programma condiviso mostra ogni squadra e ogni intervento. Ognuno vede la sua giornata sul telefono.' },
    ],
    uses: [
      { icon: 'calendar', title: 'Programma delle squadre', text: 'Interventi ripartiti per persona e per giorno, visibili a tutta la squadra.', module: 'solutions/planning' },
      { icon: 'clock', title: 'Ore per dossier', text: 'Registrate sul telefono, per cliente e tipo di lavoro, pronte per fattura e salari.', module: 'solutions/rh-salaires' },
      { icon: 'camera', title: 'Rapporti d’intervento', text: 'Foto datate, note e dettature riunite in un rapporto PDF a suo nome.', module: 'solutions/rapports-chantier' },
      { icon: 'file-text', title: 'Preventivi firmati online', text: 'Il suo catalogo di prestazioni, il prezzo, la firma del cliente sul telefono.', module: 'solutions/devis' },
      { icon: 'credit-card', title: 'Fatture QR e solleciti', text: 'Fatture QR svizzere, solleciti e seguito dei pagamenti senza tabelle a parte.', module: 'solutions/facturation' },
      { icon: 'mic', title: 'Dettatura sul posto', text: 'Una nota, un’ora o una spesa dettata tra due interventi, archiviata al posto giusto.', module: 'solutions/dictee-vocale' },
    ],
    wordTitle: 'Lei parla di dossier. Anche Cantia.',
    wordText: 'All’iscrizione scelga «dossier»: menu, pulsanti, rapporti ed e-mail ai clienti riprendono questa parola. Ogni dossier riunisce cliente, indirizzo, squadra, ore e documenti.',
    scenarioTitle: 'Un contratto di manutenzione di uno stabile, dalla richiesta al pagamento.',
    scenario: [
      { title: 'La richiesta', text: 'L’amministrazione chiede un’offerta per la manutenzione di uno stabile. Il preventivo si prepara con le sue prestazioni e i suoi prezzi.' },
      { title: 'L’accordo', text: 'L’amministrazione firma online. Il dossier dello stabile viene creato con indirizzo e accessi.' },
      { title: 'I passaggi', text: 'La squadra vede i passaggi nel programma, registra le ore e aggiunge le foto di ogni intervento.' },
      { title: 'La fattura', text: 'A fine mese la fattura QR riprende ore e prestazioni del dossier. Il pagamento è seguito.' },
    ],
    faq: [
      { q: 'Cantia è adatto a un’impresa di pulizia?', a: 'Sì. Gestisce clienti e indirizzi per dossier, squadre nel programma, ore sul telefono, poi preventivi e fatture QR.' },
      { q: 'Posso chiamare i miei interventi «dossier»?', a: 'Sì. Sceglie tra cantiere, progetto, mandato o dossier; la parola è usata in tutta l’applicazione e sui documenti.' },
      { q: 'I miei dipendenti hanno bisogno di un’app?', a: 'No. Aprono Cantia nel browser del telefono o lo aggiungono alla schermata Home. Niente da installare.' },
      { q: 'Posso fatturare a un’amministrazione più stabili?', a: 'Sì. L’amministrazione è un cliente, ogni stabile ha il suo dossier e ogni fattura indica lo stabile interessato.' },
      { q: 'I salari sono gestiti?', a: 'Sì, con il piano Squadra: le ore registrate alimentano le buste paga, con le deduzioni svizzere.' },
    ],
    closingTitle: 'I suoi interventi seguiti, le sue ore fatturate.',
    closingText: '14 giorni per provare Cantia con i suoi veri clienti. Senza impegno, disdicibile online.',
  },
  etudes: {
    label: 'Studi tecnici',
    word: 'mandato',
    words: 'Mandati',
    seoTitle: 'Software gestionale per studi d’ingegneria, tecnici e di architettura in Svizzera | Cantia',
    seoDescription: 'Mandati, offerte d’onorario, tempo per collaboratore, documenti, spese e fatture QR: Cantia organizza studi d’ingegneria, tecnici e di architettura in Svizzera.',
    eyebrow: 'Studi tecnici',
    h1Plain: 'Ogni mandato,',
    h1Accent: 'il suo tempo e il suo onorario.',
    lead: 'Ingegneri, architetti, geometri, studi tecnici e consulenti: organizzi la sua attività per mandato. Offerte, tempo per collaboratore, documenti, spese e fatture restano insieme, e sa quanto rende ogni mandato.',
    forEyebrow: 'Per chi',
    forTitle: 'Gli studi che lavorano per mandato.',
    trades: [
      { name: 'Studi d’ingegneria civile', text: 'Studi strutturali, direzione lavori, perizie: il tempo seguito fase per fase.', sub: 'ingenieur-civil' },
      { name: 'Architetti', text: 'Progetti di massima, domande di costruzione e direzione lavori, documenti e scambi riuniti per mandato.', sub: 'architecte' },
      { name: 'Studi tecnici RVCS ed elettricità', text: 'Studi, piani e accompagnamento dell’esecuzione, ore per collaboratore e per mandato.', sub: 'bureau-technique' },
      { name: 'Geometri', text: 'Rilievi, picchettamenti e misurazioni, interventi sul terreno e fatturazione a ore.', sub: 'geometre' },
      { name: 'Consulenti', text: 'Mandati a forfait o a ore, offerte firmate e fatture QR.', sub: 'consultant' },
      { name: 'Informatici e formatori', text: 'Progetti clienti, ore per mandato, fatture e solleciti senza strumenti a parte.', sub: 'informaticien-formateur' },
    ],
    pains: [
      { title: 'Il tempo si ricostruisce a memoria', text: 'A fine mese ognuno stima le sue ore per mandato. Gli onorari fatturati non riflettono più il lavoro reale.', answer: 'Ogni collaboratore registra il suo tempo per mandato e tipo di lavoro. Fattura ciò che è stato fatto.' },
      { title: 'Un mandato sfora senza che lo si veda', text: 'Le ore superano l’offerta d’onorario e la perdita appare alla chiusura.', answer: 'Offerta, ore reali e spese vengono confrontate in diretta. Lo scostamento si vede durante il mandato.' },
      { title: 'Documenti e scambi dispersi', text: 'Piani, versioni ed e-mail sono archiviati da ognuno. Ritrovare la versione giusta richiede tempo.', answer: 'Documenti, note e scambi sono riuniti nel mandato, accessibili alla squadra secondo i suoi diritti.' },
    ],
    uses: [
      { icon: 'file-text', title: 'Offerte d’onorario', text: 'A forfait o a ore, con firma elettronica del cliente.', module: 'solutions/devis' },
      { icon: 'clock', title: 'Tempo per mandato', text: 'Registrato da ogni collaboratore, per mandato e tipo di lavoro.', module: 'solutions/rh-salaires' },
      { icon: 'trending-up', title: 'Redditività per mandato', text: 'Onorario, ore e spese confrontati durante il mandato, non dopo.', module: 'solutions/rentabilite' },
      { icon: 'folder', title: 'Documenti del mandato', text: 'Piani, rapporti e documenti nello stesso posto, condivisi secondo i diritti di ognuno.' },
      { icon: 'credit-card', title: 'Fatture QR e acconti', text: 'Fatture parziali, acconti, solleciti e seguito dei pagamenti.', module: 'solutions/facturation' },
      { icon: 'bar-chart-2', title: 'Liquidità', text: 'Incassi attesi e spese in arrivo nei prossimi mesi.', module: 'solutions/tresorerie' },
    ],
    wordTitle: 'Lei parla di mandati. Anche Cantia.',
    wordText: 'All’iscrizione scelga «mandato»: l’applicazione, le offerte e i rapporti riprendono questa parola. Ogni mandato ha il suo numero, il suo cliente, la sua squadra, il suo tempo e i suoi documenti.',
    scenarioTitle: 'Uno studio strutturale, dall’offerta all’ultimo acconto.',
    scenario: [
      { title: 'L’offerta', text: 'Calcola le fasi dello studio. Il committente firma l’offerta online.' },
      { title: 'Lo studio', text: 'Ogni ingegnere registra il suo tempo sul mandato. Piani e calcoli restano nel dossier.' },
      { title: 'Il controllo', text: 'Confronta le ore con l’offerta, fase per fase, e vede il margine strada facendo.' },
      { title: 'La fatturazione', text: 'Acconti e fattura finale in QR-fattura, solleciti e pagamenti seguiti.' },
    ],
    faq: [
      { q: 'Cantia è adatto a uno studio d’ingegneria o di architettura?', a: 'Sì. Organizza l’attività per mandato, con offerte, tempo per collaboratore, documenti, spese e fatture.' },
      { q: 'Posso fatturare a ore?', a: 'Sì. Le ore registrate su un mandato possono essere riprese in fattura, oppure fattura a forfait con acconti.' },
      { q: 'Posso chiamare i miei dossier «mandati»?', a: 'Sì. La parola scelta è usata in tutta l’applicazione e sui documenti PDF.' },
      { q: 'I collaboratori vedono gli onorari?', a: 'Non necessariamente. I ruoli definiscono chi vede gli importi e chi registra solo il proprio tempo.' },
      { q: 'Si può collegare Cantia alla nostra contabilità?', a: 'Sì: sincronizzazione con Bexio e accesso in lettura per la sua fiduciaria con Cantia Accounting.' },
    ],
    closingTitle: 'I suoi mandati sotto controllo, le sue ore fatturate.',
    closingText: '14 giorni per provare Cantia con i suoi veri mandati. Senza impegno, disdicibile online.',
  },
  creatifs: {
    label: 'Agenzie & eventi',
    word: 'progetto',
    words: 'Progetti',
    seoTitle: 'Software gestionale per agenzie, studi creativi ed eventi in Svizzera | Cantia',
    seoDescription: 'Offerte firmate online, progetti, squadra e fornitori, acconti e fatture QR: Cantia organizza agenzie, studi creativi, fotografi, catering e aziende di eventi in Svizzera.',
    eyebrow: 'Agenzie & eventi',
    h1Plain: 'Ogni progetto,',
    h1Accent: 'dall’offerta all’ultimo acconto.',
    lead: 'Agenzie di comunicazione, studi, fotografi, catering e organizzatori di eventi: colleghi l’offerta, la squadra coinvolta, il programma e la fatturazione di ogni progetto. Acconti ed extra non si perdono più.',
    forEyebrow: 'Per chi',
    forTitle: 'I mestieri che consegnano progetti.',
    trades: [
      { name: 'Agenzie di comunicazione', text: 'Offerte per progetto, ore della squadra, acconti e fatture QR.', sub: 'agence-communication' },
      { name: 'Grafici e studi creativi', text: 'Identità, siti e campagne: ogni progetto con la sua offerta, il suo tempo e i suoi file.', sub: 'graphiste' },
      { name: 'Fotografi e videomaker', text: 'Matrimoni, aziende e reportage: preventivo firmato, acconto, consegna e saldo.', sub: 'photographe-videaste' },
      { name: 'Catering', text: 'Eventi calcolati sul numero di ospiti, squadra pianificata, extra fatturati.', sub: 'traiteur' },
      { name: 'Organizzatori di eventi', text: 'Fiere, serate e seminari: fornitori, programma e fatturazione nello stesso posto.', sub: 'organisateur-evenements' },
      { name: 'Noleggio materiale e tecnici', text: 'Materiale, montaggio e tecnici pianificati per evento, fatture senza ribattere nulla.', sub: 'location-materiel' },
    ],
    pains: [
      { title: 'L’offerta cambia dieci volte prima dell’accordo', text: 'Le versioni girano per e-mail e nessuno sa più quale il cliente ha accettato.', answer: 'L’offerta viene modificata in Cantia e il cliente firma l’ultima versione online. Resta nel progetto.' },
      { title: 'Gli extra del giorno X', text: 'Un supplemento deciso sul posto, un’ora in più per la squadra: spesso dimenticati al momento di fatturare.', answer: 'Il supplemento viene registrato e firmato dal cliente sul suo telefono, poi ripreso nella fattura finale.' },
      { title: 'Acconto, saldo, sollecito', text: 'Seguire chi ha pagato cosa su più progetti richiede una tabella a parte, raramente aggiornata.', answer: 'Acconti, fatture QR e solleciti sono seguiti per progetto. Vede ciò che resta da incassare.' },
    ],
    uses: [
      { icon: 'file-text', title: 'Offerte firmate online', text: 'Prestazioni, opzioni e condizioni, firmate dal cliente sul telefono.', module: 'solutions/devis' },
      { icon: 'calendar', title: 'Programma della squadra', text: 'Chi lavora a quale progetto, in quale giorno, visibile a tutta la squadra.', module: 'solutions/planning' },
      { icon: 'plus-circle', title: 'Extra firmati', text: 'Un extra chiesto il giorno stesso, firmato e aggiunto alla fattura.', module: 'solutions/travaux-supplementaires' },
      { icon: 'credit-card', title: 'Acconti e fatture QR', text: 'Acconto alla firma, saldo dopo la consegna, solleciti seguiti.', module: 'solutions/facturation' },
      { icon: 'clock', title: 'Ore e fornitori', text: 'Il tempo della squadra e le spese del progetto, per conoscerne il margine.', module: 'solutions/rentabilite' },
      { icon: 'folder', title: 'File del progetto', text: 'Brief, bozze, contratti e foto archiviati nel progetto.' },
    ],
    wordTitle: 'Lei parla di progetti. Anche Cantia.',
    wordText: 'All’iscrizione scelga «progetto»: menu, offerte ed e-mail riprendono questa parola. Ogni progetto ha il suo cliente, la sua data, la sua squadra, i suoi file e la sua fatturazione.',
    scenarioTitle: 'Un matrimonio, dalla prima richiesta al saldo.',
    scenario: [
      { title: 'La richiesta', text: 'Gli sposi le scrivono. L’offerta si prepara con le sue prestazioni e le sue opzioni.' },
      { title: 'La prenotazione', text: 'Firmano online e versano l’acconto richiesto sulla fattura QR.' },
      { title: 'Il giorno X', text: 'La squadra vede la sua giornata nel programma. Un’ora supplementare viene firmata sul posto.' },
      { title: 'Il saldo', text: 'La fattura finale riprende offerta ed extra, meno l’acconto. Il pagamento è seguito.' },
    ],
    faq: [
      { q: 'Cantia è adatto a un’agenzia o a uno studio?', a: 'Sì. Organizza l’attività per progetto, con offerte firmate online, ore della squadra, acconti e fatture QR.' },
      { q: 'Posso chiedere un acconto alla firma?', a: 'Sì. Fattura un acconto, poi il saldo; Cantia segue ciò che è stato pagato e ciò che resta.' },
      { q: 'Posso chiamare i miei dossier «progetti»?', a: 'Sì. Sceglie la parola all’iscrizione; è usata in tutta l’applicazione e sui documenti.' },
      { q: 'Le mie offerte possono avere la mia identità visiva?', a: 'Sì: il suo logo, il suo colore e i suoi testi su ogni offerta e ogni fattura.' },
      { q: 'E se un cliente aggiunge una prestazione il giorno stesso?', a: 'La aggiunge al progetto e il cliente la firma sul suo telefono. Viene ripresa nella fattura finale.' },
    ],
    closingTitle: 'I suoi progetti consegnati, i suoi acconti incassati.',
    closingText: '14 giorni per provare Cantia con i suoi veri progetti. Senza impegno, disdicibile online.',
  },
};

export const SECTORS_COPY: Record<SiteLocale, Record<SectorKey, SectorCopy>> = { fr: FR, de: DE, it: IT };

// Hub texts of /metiers (above the four sectors).
export const HUB_COPY: Record<SiteLocale, { seoTitle: string; seoDescription: string; eyebrow: string; h1Plain: string; h1Accent: string; lead: string; switchEyebrow: string; switchTitle: string; switchText: string; sectorsEyebrow: string; sectorsTitle: string }> = {
  fr: {
    seoTitle: 'Logiciel de gestion par métier : bâtiment, service, bureaux d’études, agences | Cantia',
    seoDescription: 'Chantier, dossier, mandat ou projet : Cantia parle comme votre métier. Bâtiment et artisanat, service et entretien, bureaux d’études, agences et événementiel en Suisse.',
    eyebrow: 'Votre métier',
    h1Plain: 'Vous l’appelez',
    h1Accent: 'comme vous travaillez.',
    lead: 'Un chantier, un dossier, un mandat ou un projet : le fil est le même. Un client, une offre, une équipe, un travail à livrer, une facture. Cantia reprend votre mot partout, de l’application à vos PDF.',
    switchEyebrow: 'Le même écran, votre mot',
    switchTitle: 'Choisissez votre mot, Cantia s’adapte.',
    switchText: 'Voici le vrai écran de Cantia, tel qu’il s’affiche selon le mot choisi à l’inscription. Le menu, les boutons et la recherche suivent.',
    sectorsEyebrow: 'Quatre secteurs',
    sectorsTitle: 'Trouvez votre secteur.',
  },
  de: {
    seoTitle: 'Software nach Branche: Bau, Service, Planungsbüros, Agenturen | Cantia',
    seoDescription: 'Baustelle, Dossier, Mandat oder Projekt: Cantia spricht wie Ihre Branche. Bau und Handwerk, Service und Unterhalt, Planungsbüros, Agenturen und Events in der Schweiz.',
    eyebrow: 'Ihre Branche',
    h1Plain: 'Sie nennen es so,',
    h1Accent: 'wie Sie arbeiten.',
    lead: 'Eine Baustelle, ein Dossier, ein Mandat oder ein Projekt: Der Ablauf ist derselbe. Ein Kunde, eine Offerte, ein Team, eine Arbeit, eine Rechnung. Cantia übernimmt Ihren Begriff überall, von der App bis zu Ihren PDFs.',
    switchEyebrow: 'Derselbe Bildschirm, Ihr Begriff',
    switchTitle: 'Wählen Sie Ihren Begriff, Cantia passt sich an.',
    switchText: 'Hier der echte Bildschirm von Cantia, so wie er je nach gewähltem Begriff erscheint. Menü, Schaltflächen und Suche folgen.',
    sectorsEyebrow: 'Vier Branchen',
    sectorsTitle: 'Finden Sie Ihre Branche.',
  },
  it: {
    seoTitle: 'Software gestionale per mestiere: edilizia, servizi, studi tecnici, agenzie | Cantia',
    seoDescription: 'Cantiere, dossier, mandato o progetto: Cantia parla come il suo mestiere. Edilizia e artigianato, servizi e manutenzione, studi tecnici, agenzie ed eventi in Svizzera.',
    eyebrow: 'Il suo mestiere',
    h1Plain: 'Lo chiama',
    h1Accent: 'come lavora.',
    lead: 'Un cantiere, un dossier, un mandato o un progetto: il filo è lo stesso. Un cliente, un’offerta, una squadra, un lavoro da consegnare, una fattura. Cantia riprende la sua parola ovunque, dall’applicazione ai PDF.',
    switchEyebrow: 'Lo stesso schermo, la sua parola',
    switchTitle: 'Scelga la sua parola, Cantia si adatta.',
    switchText: 'Ecco il vero schermo di Cantia, come appare secondo la parola scelta all’iscrizione. Menu, pulsanti e ricerca seguono.',
    sectorsEyebrow: 'Quattro settori',
    sectorsTitle: 'Trovi il suo settore.',
  },
};
