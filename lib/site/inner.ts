// Texts of the remaining public pages of cantia.ch in the November 2026
// identity: trades, custom development, ecosystem, phone & computer,
// resources and contact. Facts follow the product: the mobile access is the
// web app (store versions announced as in development), Accounting is free
// for fiduciaries, Partners commissions are set in the partner space.

import type { SiteLocale } from './copy';
import type { FamilyKey } from './pages';

type Hero = { seoTitle: string; seoDescription: string; crumb: string; eyebrow: string; h1Plain: string; h1Accent: string; lead: string };
export type Sector = { key: string; label: string; eyebrow: string; title: string; desc: string; word: string; items: string[]; link: FamilyKey };

export interface InnerCopy {
  metiers: Hero & {
    sectors: Sector[];
    words: string[];
    sectorLinks: Record<FamilyKey, string>;
    proof: string;
    tradesEyebrow: string;
    tradesTitle: string;
    tradesText: string;
    splitEyebrow: string;
    splitPlain: string;
    splitAccent: string;
    splitText: string;
    splitLink: string;
    calloutStrong: string;
    callout: string;
  };
  surMesure: Hero & {
    cta: string;
    existing: string;
    paper: { tag: string; title: string; sub: string; lines: string[]; caption: string };
    cardsEyebrow: string;
    cardsPlain: string;
    cardsAccent: string;
    cardsNote: string;
    cards: { title: string; text: string }[];
    steps: { title: string; text: string }[];
    faq: { q: string; a: string }[];
    formEyebrow: string;
    formPlain: string;
    formAccent: string;
    formText: string;
  };
  ecosystem: Hero & {
    spaces: { label: string; title: string; text: string; link: string; href: string }[];
    calloutStrong: string;
    callout: string;
    calloutLink: string;
  };
  app: Hero & {
    open: string;
    choose: string;
    tags: string[];
    stepsEyebrow: string;
    stepsPlain: string;
    stepsAccent: string;
    stepsNote: string;
    steps: { title: string; text: string }[];
    devicesPlain: string;
    devicesAccent: string;
    spacesPlain: string;
    spacesAccent: string;
  };
  resources: Hero & { items: { title: string; text: string; link: string; href: string }[] };
  contact: Hero & {
    cards: { title: string; text: string; value: string; href: string }[];
    formEyebrow: string;
    formTitle: string;
    calloutStrong: string;
    callout: string;
    calloutLink: string;
  };
}

const fr: InnerCopy = {
  metiers: {
    seoTitle: 'Votre métier : un logiciel qui parle comme vous | Cantia',
    seoDescription: 'Chantier, projet, mandat ou dossier : Cantia adapte son vocabulaire à votre activité. Bâtiment, services, bureaux d’études, agences : trouvez votre usage.',
    crumb: 'Votre métier',
    eyebrow: 'Né sur les chantiers. Ouvert à vos projets.',
    h1Plain: 'Vous l’appelez',
    h1Accent: 'comme vous travaillez.',
    lead: 'Chantier, projet, mandat ou dossier : Cantia adapte son vocabulaire à votre activité, jusque dans les rapports PDF. Le fil reste le même : un client, une offre, une équipe, un travail à réaliser.',
    sectors: [
      { key: 'batiment', label: 'Bâtiment & artisanat', eyebrow: 'Du devis au terrain', title: 'Chaque chantier garde son histoire.', desc: 'Pour les entreprises de construction, de rénovation et les artisans. Les offres, les plans, les photos et les heures restent rattachés au même chantier.', word: 'Chantier', items: ['Catalogue de prestations et modèles de devis', 'Plans, photos et rapports de chantier', 'Heures et prestations supplémentaires à suivre'], link: 'signer' },
      { key: 'services', label: 'Services & entretien', eyebrow: 'Du client à l’intervention', title: 'Le suivi reste avec chaque intervention.', desc: 'Pour le paysagisme, le nettoyage et les activités de service. Retrouvez les informations utiles au dossier, le travail de l’équipe et la facturation.', word: 'Dossier', items: ['Clients et documents rassemblés par dossier', 'Planning partagé et heures de l’équipe', 'Devis, factures et suivi des versements'], link: 'organiser' },
      { key: 'etudes', label: 'Bureaux d’études', eyebrow: 'Du mandat au suivi', title: 'Un cadre commun pour vos mandats.', desc: 'Pour les bureaux d’études et les architectes qui organisent leur activité par mandat. Rassemblez documents, échanges, temps passé et éléments financiers.', word: 'Mandat', items: ['Documents et échanges dans le même mandat', 'Temps consacré par membre de l’équipe', 'Dépenses et rentabilité à suivre'], link: 'piloter' },
      { key: 'creatifs', label: 'Agences & événementiel', eyebrow: 'De l’offre à la livraison', title: 'Votre projet relie toute l’équipe.', desc: 'Pour les agences, studios créatifs et entreprises d’événementiel. Reliez la proposition commerciale, les ressources mobilisées et la facturation du projet.', word: 'Projet', items: ['Offres personnalisées et signature du client', 'Planning et documents communs à l’équipe', 'Acomptes et suivi de facturation'], link: 'signer' },
    ],
    words: ['Chantier', 'Projet', 'Mandat', 'Dossier'],
    sectorLinks: { signer: 'Découvrir les devis', organiser: 'Découvrir les projets', collaborer: 'Découvrir le travail en équipe', facturer: 'Découvrir la facturation', piloter: 'Découvrir le pilotage' },
    proof: 'Exemples d’organisation avec les modules existants. Les fonctionnalités incluses dépendent de votre formule.',
    tradesEyebrow: 'Les métiers du bâtiment',
    tradesTitle: 'Une page pour votre métier.',
    tradesText: 'Pour chaque corps de métier : les situations du quotidien, l’usage de Cantia et les questions fréquentes.',
    splitEyebrow: 'Votre façon de faire',
    splitPlain: 'Vos prestations.',
    splitAccent: 'Votre identité.',
    splitText: 'Vos prix, vos modèles de documents et les accès de votre équipe accompagnent votre organisation. Et lorsqu’un besoin sort du cadre, nous pouvons étudier un module privé.',
    splitLink: 'Découvrir le sur-mesure',
    calloutStrong: 'Vous travaillez par projets ?',
    callout: 'Commencez par les usages qui vous concernent. Une même entreprise peut avoir besoin des devis et de la facturation, puis ajouter le planning ou le suivi financier selon sa formule.',
  },
  surMesure: {
    seoTitle: 'Développement sur mesure : un module privé dans Cantia | Cantia',
    seoDescription: 'Un calcul métier, un circuit de validation, une connexion à un outil existant : Cantia étudie un développement privé, intégré à votre espace et réservé à votre entreprise.',
    crumb: 'Sur mesure',
    eyebrow: 'Votre organisation a ses particularités',
    h1Plain: 'Votre façon de faire.',
    h1Accent: 'Jusque dans le logiciel.',
    lead: 'Un calcul métier, un circuit de validation, une connexion à un outil existant. Nous pouvons étudier un développement privé, intégré à votre espace Cantia.',
    cta: 'Parler de mon besoin',
    existing: 'Voir les modules existants',
    paper: { tag: 'VOTRE ESPACE CANTIA', title: 'Votre module privé.', sub: 'Un développement réservé à votre entreprise.', lines: ['Vos étapes et validations', 'Vos calculs métier', 'Vos collaborateurs autorisés'], caption: 'EXEMPLE DE PRINCIPE · PÉRIMÈTRE À DÉFINIR ENSEMBLE' },
    cardsEyebrow: 'Des réponses ciblées',
    cardsPlain: 'Le bon outil,',
    cardsAccent: 'dans votre environnement.',
    cardsNote: 'Chaque demande commence par un échange. Un module existant peut parfois suffire.',
    cards: [
      { title: 'Un module métier.', text: 'Un écran, un calcul ou un suivi spécifique à votre activité, activé pour votre entreprise.' },
      { title: 'Un parcours adapté.', text: 'Vos étapes, statuts et validations étudiés pour refléter votre organisation.' },
      { title: 'Une connexion utile.', text: 'Un lien avec un outil existant, après vérification des possibilités techniques et des accès disponibles.' },
    ],
    steps: [
      { title: 'On part du besoin.', text: 'Décrivez votre fonctionnement, les informations utilisées et ce qui vous ralentit.' },
      { title: 'On définit le périmètre.', text: 'La solution, les conditions et le coût sont précisés dans un devis avant tout développement.' },
      { title: 'Le module rejoint Cantia.', text: 'Une fois développé, il est activé dans votre espace pour les personnes autorisées.' },
    ],
    faq: [
      { q: 'Le module est-il visible par les autres entreprises ?', a: 'Non. Le développement privé est réservé à votre organisation et aux collaborateurs autorisés.' },
      { q: 'Combien coûte un développement ?', a: 'Le coût dépend du périmètre. Un échange permet de cadrer la demande, puis un devis est proposé avant tout engagement.' },
      { q: 'Est-ce qu’une intégration est toujours possible ?', a: 'Cela dépend notamment des accès et moyens proposés par le logiciel concerné. La faisabilité est étudiée avant de confirmer le développement.' },
    ],
    formEyebrow: 'Votre demande',
    formPlain: 'Parlons de ce qui',
    formAccent: 'vous manque aujourd’hui.',
    formText: 'Décrivez votre besoin en quelques lignes. Nous revenons vers vous pour définir la prochaine étape.',
  },
  ecosystem: {
    seoTitle: 'Fiduciaires & partenaires : l’écosystème Cantia | Cantia',
    seoDescription: 'Cantia pour les entreprises, Cantia Accounting pour les fiduciaires, Cantia Partners pour recommander Cantia : trouvez l’espace qui correspond à votre rôle.',
    crumb: 'Fiduciaires & partenaires',
    eyebrow: 'Autour de votre activité',
    h1Plain: 'Le bon espace.',
    h1Accent: 'Pour chaque rôle.',
    lead: 'La gestion de l’entreprise, le travail de la fiduciaire et la recommandation de Cantia ont chacun leur place. Retrouvez l’espace qui correspond à votre activité.',
    spaces: [
      { label: 'Cantia', title: 'Votre entreprise,\nau quotidien.', text: 'Devis, projets, rapports, factures, heures et finances dans la suite de gestion.', link: 'Explorer le logiciel', href: 'fonctionnalites' },
      { label: 'Cantia Accounting', title: 'Un espace dédié\naux fiduciaires.', text: 'Gestion comptable des mandants, imports, TVA, bouclement, pièces et signatures. Gratuit pour les fiduciaires.', link: 'Découvrir Accounting', href: 'https://accounting.cantia.ch' },
      { label: 'Cantia Partners', title: 'Vous recommandez.\nLe partenariat suit.', text: 'Un programme de recommandation avec commission sur les entreprises apportées. Les conditions sont précisées dans l’espace partenaire.', link: 'Découvrir le programme', href: 'https://partners.cantia.ch' },
    ],
    calloutStrong: 'Vous utilisez Bexio ?',
    callout: 'Cantia peut se connecter à vos données clients, factures et paiements.',
    calloutLink: 'Voir l’intégration Bexio',
  },
  app: {
    seoTitle: 'Cantia sur ordinateur et téléphone | Cantia',
    seoDescription: 'Cantia s’utilise dans le navigateur, sur ordinateur, tablette et téléphone. Ajoutez Cantia à l’écran d’accueil en trois étapes, sans installation obligatoire.',
    crumb: 'Ordinateur & téléphone',
    eyebrow: 'Votre bureau vous suit',
    h1Plain: 'À votre place.',
    h1Accent: 'Où que vous soyez.',
    lead: 'Consultez un document, ajoutez une photo ou saisissez vos heures depuis le téléphone. Retrouvez le projet dans le même espace lorsque vous revenez au bureau.',
    open: 'Ouvrir Cantia',
    choose: 'Choisir une formule',
    tags: ['Application web', 'Sans installation obligatoire'],
    stepsEyebrow: 'Commencer sur téléphone',
    stepsPlain: 'Votre accès,',
    stepsAccent: 'sur l’écran d’accueil.',
    stepsNote: 'Les versions App Store et Google Play sont en développement. L’accès se fait aujourd’hui dans le navigateur.',
    devicesPlain: 'Sur chaque appareil.', devicesAccent: 'En trois gestes.', spacesPlain: 'Trois espaces.', spacesAccent: 'Un seul écosystème.',
    steps: [
      { title: 'Ouvrez Cantia.', text: 'Accédez à app.cantia.ch depuis le navigateur de votre téléphone et connectez-vous à votre compte.' },
      { title: 'Ajoutez un raccourci.', text: 'Sur Android, utilisez le menu du navigateur. Sur iPhone, ouvrez le menu de partage de Safari, puis « Sur l’écran d’accueil ».' },
      { title: 'Retrouvez vos projets.', text: 'Utilisez le raccourci pour accéder à Cantia et aux modules autorisés pour votre compte.' },
    ],
  },
  resources: {
    seoTitle: 'Découvrir Cantia : aide, guides et ressources | Cantia',
    seoDescription: 'Centre d’aide, accès mobile, espaces Cantia, blog, outils gratuits et contact direct : toutes les ressources pour prendre Cantia en main.',
    crumb: 'Découvrir Cantia',
    eyebrow: 'Les bons repères',
    h1Plain: 'Découvrir.',
    h1Accent: 'Comprendre. Avancer.',
    lead: 'Explorez les usages, retrouvez l’aide et échangez directement avec Cantia pour préparer votre prise en main.',
    items: [
      { title: 'Centre d’aide.', text: 'Les guides et explications pour les devis, les projets, la facturation et le travail en équipe.', link: 'Consulter l’aide', href: 'aide' },
      { title: 'Votre accès mobile.', text: 'Comprendre l’application web et ajouter Cantia à l’écran d’accueil de votre téléphone.', link: 'Utiliser Cantia sur téléphone', href: 'telechargement' },
      { title: 'Les espaces Cantia.', text: 'Retrouvez les espaces dédiés aux entreprises, aux fiduciaires et aux partenaires.', link: 'Explorer les espaces', href: 'ecosysteme' },
      { title: 'Le blog Cantia.', text: 'Les articles publiés par Cantia autour de la gestion et de l’organisation des entreprises.', link: 'Lire les articles', href: 'blog' },
      { title: 'Les outils gratuits.', text: 'Calculateurs de salaire, de taux horaire, de TVA et de marge, proposés gratuitement.', link: 'Voir les outils', href: 'outils' },
      { title: 'Un contact direct.', text: 'Une question sur un usage, une formule ou un besoin particulier ? Contactez l’équipe.', link: 'Contacter Cantia', href: 'contact' },
    ],
  },
  contact: {
    seoTitle: 'Contact : parlons de votre quotidien | Cantia',
    seoDescription: 'Une question sur Cantia, un besoin métier ou un développement spécifique ? Écrivez à info@cantia.ch ou appelez le +41 78 450 14 57.',
    crumb: 'Contact',
    eyebrow: 'Un contact direct',
    h1Plain: 'Parlons de',
    h1Accent: 'votre quotidien.',
    lead: 'Une question sur Cantia, un besoin métier ou un projet de développement spécifique ? Expliquez votre fonctionnement et ce que vous cherchez à simplifier.',
    cards: [
      { title: 'Par e-mail.', text: 'Présentez votre entreprise, votre besoin et les outils que vous utilisez déjà. Cela permettra de préparer une réponse adaptée.', value: 'info@cantia.ch', href: 'mailto:info@cantia.ch' },
      { title: 'Par téléphone.', text: 'Un échange pour comprendre votre organisation, les modules qui vous concernent et les prochaines étapes.', value: '+41 78 450 14 57', href: 'tel:+41784501457' },
    ],
    formEyebrow: 'Écrire depuis le site',
    formTitle: 'Votre message.',
    calloutStrong: 'Vous avez déjà un compte ?',
    callout: 'Le centre d’aide contient les guides d’utilisation.',
    calloutLink: 'Accéder à l’aide',
  },
};

const de: InnerCopy = {
  metiers: {
    seoTitle: 'Ihre Branche: eine Software, die Ihre Sprache spricht | Cantia',
    seoDescription: 'Baustelle, Projekt, Mandat oder Dossier: Cantia passt sein Vokabular an Ihre Tätigkeit an. Bau, Dienstleistungen, Ingenieurbüros, Agenturen: finden Sie Ihren Einsatz.',
    crumb: 'Ihre Branche',
    eyebrow: 'Auf Baustellen entstanden. Offen für Ihre Projekte.',
    h1Plain: 'Sie nennen es so,',
    h1Accent: 'wie Sie arbeiten.',
    lead: 'Baustelle, Projekt, Mandat oder Dossier: Cantia passt sein Vokabular an Ihre Tätigkeit an, bis in die PDF-Rapporte. Der Faden bleibt gleich: ein Kunde, eine Offerte, ein Team, eine Arbeit.',
    sectors: [
      { key: 'batiment', label: 'Bau & Handwerk', eyebrow: 'Von der Offerte zur Baustelle', title: 'Jede Baustelle behält ihre Geschichte.', desc: 'Für Bau- und Renovationsunternehmen und Handwerker. Offerten, Pläne, Fotos und Stunden bleiben bei derselben Baustelle.', word: 'Baustelle', items: ['Leistungskatalog und Offertvorlagen', 'Pläne, Fotos und Baustellenrapporte', 'Stunden und Zusatzleistungen im Blick'], link: 'signer' },
      { key: 'services', label: 'Dienstleistungen & Unterhalt', eyebrow: 'Vom Kunden zum Einsatz', title: 'Die Nachverfolgung bleibt bei jedem Einsatz.', desc: 'Für Gartenbau, Reinigung und Dienstleistungen. Finden Sie die Angaben zum Dossier, die Arbeit des Teams und die Rechnungen.', word: 'Dossier', items: ['Kunden und Dokumente pro Dossier', 'Geteilte Planung und Stunden des Teams', 'Offerten, Rechnungen und Zahlungen'], link: 'organiser' },
      { key: 'etudes', label: 'Ingenieurbüros', eyebrow: 'Vom Mandat zur Nachverfolgung', title: 'Ein gemeinsamer Rahmen für Ihre Mandate.', desc: 'Für Ingenieurbüros und Architekten, die nach Mandaten arbeiten. Bündeln Sie Dokumente, Austausch, Zeitaufwand und Finanzen.', word: 'Mandat', items: ['Dokumente und Austausch im selben Mandat', 'Zeitaufwand pro Teammitglied', 'Ausgaben und Rentabilität im Blick'], link: 'piloter' },
      { key: 'creatifs', label: 'Agenturen & Events', eyebrow: 'Von der Offerte zur Lieferung', title: 'Ihr Projekt verbindet das ganze Team.', desc: 'Für Agenturen, Kreativstudios und Eventfirmen. Verbinden Sie Angebot, eingesetzte Ressourcen und Rechnung des Projekts.', word: 'Projekt', items: ['Persönliche Offerten und Unterschrift des Kunden', 'Gemeinsame Planung und Dokumente', 'Anzahlungen und Rechnungsverfolgung'], link: 'signer' },
    ],
    words: ['Baustelle', 'Projekt', 'Mandat', 'Dossier'],
    sectorLinks: { signer: 'Die Offerten entdecken', organiser: 'Die Projekte entdecken', collaborer: 'Die Teamarbeit entdecken', facturer: 'Die Rechnungen entdecken', piloter: 'Die Steuerung entdecken' },
    proof: 'Beispiele mit den bestehenden Modulen. Die enthaltenen Funktionen hängen von Ihrem Abo ab.',
    tradesEyebrow: 'Die Baubranchen',
    tradesTitle: 'Eine Seite für Ihre Branche.',
    tradesText: 'Für jedes Gewerk: die Situationen im Alltag, der Einsatz von Cantia und häufige Fragen.',
    splitEyebrow: 'Ihre Arbeitsweise',
    splitPlain: 'Ihre Leistungen.',
    splitAccent: 'Ihre Identität.',
    splitText: 'Ihre Preise, Dokumentvorlagen und die Zugriffe Ihres Teams begleiten Ihre Organisation. Und wenn ein Bedarf aus dem Rahmen fällt, prüfen wir ein privates Modul.',
    splitLink: 'Massgeschneidertes entdecken',
    calloutStrong: 'Sie arbeiten nach Projekten?',
    callout: 'Beginnen Sie mit den Einsätzen, die Sie betreffen. Ein Unternehmen braucht vielleicht zuerst Offerten und Rechnungen und ergänzt später Planung oder Finanzen, je nach Abo.',
  },
  surMesure: {
    seoTitle: 'Massgeschneiderte Entwicklung: ein privates Modul in Cantia | Cantia',
    seoDescription: 'Eine Branchenberechnung, ein Freigabeprozess, eine Verbindung zu einem bestehenden Tool: Cantia prüft eine private Entwicklung, integriert in Ihren Bereich und nur für Ihr Unternehmen.',
    crumb: 'Massgeschneidert',
    eyebrow: 'Ihre Organisation hat ihre Eigenheiten',
    h1Plain: 'Ihre Arbeitsweise.',
    h1Accent: 'Bis in die Software.',
    lead: 'Eine Branchenberechnung, ein Freigabeprozess, eine Verbindung zu einem bestehenden Tool. Wir prüfen eine private Entwicklung, integriert in Ihren Cantia-Bereich.',
    cta: 'Über meinen Bedarf sprechen',
    existing: 'Bestehende Module ansehen',
    paper: { tag: 'IHR CANTIA-BEREICH', title: 'Ihr privates Modul.', sub: 'Eine Entwicklung nur für Ihr Unternehmen.', lines: ['Ihre Schritte und Freigaben', 'Ihre Branchenberechnungen', 'Ihre berechtigten Mitarbeitenden'], caption: 'PRINZIPBEISPIEL · UMFANG GEMEINSAM ZU DEFINIEREN' },
    cardsEyebrow: 'Gezielte Antworten',
    cardsPlain: 'Das richtige Werkzeug,',
    cardsAccent: 'in Ihrer Umgebung.',
    cardsNote: 'Jede Anfrage beginnt mit einem Gespräch. Manchmal genügt ein bestehendes Modul.',
    cards: [
      { title: 'Ein Branchenmodul.', text: 'Eine Ansicht, eine Berechnung oder eine Nachverfolgung für Ihre Tätigkeit, für Ihr Unternehmen aktiviert.' },
      { title: 'Ein angepasster Ablauf.', text: 'Ihre Schritte, Status und Freigaben, so geprüft, dass sie Ihre Organisation abbilden.' },
      { title: 'Eine nützliche Verbindung.', text: 'Eine Verknüpfung mit einem bestehenden Tool, nach Prüfung der technischen Möglichkeiten und Zugänge.' },
    ],
    steps: [
      { title: 'Wir starten beim Bedarf.', text: 'Beschreiben Sie Ihre Abläufe, die genutzten Informationen und was Sie bremst.' },
      { title: 'Wir definieren den Umfang.', text: 'Lösung, Bedingungen und Kosten stehen in einer Offerte, bevor entwickelt wird.' },
      { title: 'Das Modul kommt in Cantia.', text: 'Nach der Entwicklung wird es in Ihrem Bereich für berechtigte Personen aktiviert.' },
    ],
    faq: [
      { q: 'Ist das Modul für andere Unternehmen sichtbar?', a: 'Nein. Die private Entwicklung ist Ihrer Organisation und den berechtigten Mitarbeitenden vorbehalten.' },
      { q: 'Was kostet eine Entwicklung?', a: 'Die Kosten hängen vom Umfang ab. Ein Gespräch klärt die Anfrage, danach erhalten Sie eine Offerte vor jeder Verpflichtung.' },
      { q: 'Ist eine Integration immer möglich?', a: 'Das hängt insbesondere von den Zugängen und Möglichkeiten der betroffenen Software ab. Die Machbarkeit wird vor der Bestätigung geprüft.' },
    ],
    formEyebrow: 'Ihre Anfrage',
    formPlain: 'Sprechen wir darüber,',
    formAccent: 'was Ihnen heute fehlt.',
    formText: 'Beschreiben Sie Ihren Bedarf in wenigen Zeilen. Wir melden uns, um den nächsten Schritt festzulegen.',
  },
  ecosystem: {
    seoTitle: 'Treuhänder & Partner: das Cantia-Ökosystem | Cantia',
    seoDescription: 'Cantia für Unternehmen, Cantia Accounting für Treuhänder, Cantia Partners für Empfehlungen: finden Sie den Bereich, der zu Ihrer Rolle passt.',
    crumb: 'Treuhänder & Partner',
    eyebrow: 'Rund um Ihre Tätigkeit',
    h1Plain: 'Der richtige Bereich.',
    h1Accent: 'Für jede Rolle.',
    lead: 'Die Führung des Unternehmens, die Arbeit der Treuhand und die Empfehlung von Cantia haben je ihren Platz. Finden Sie den Bereich, der zu Ihrer Tätigkeit passt.',
    spaces: [
      { label: 'Cantia', title: 'Ihr Unternehmen,\nim Alltag.', text: 'Offerten, Projekte, Rapporte, Rechnungen, Stunden und Finanzen in der Verwaltungssoftware.', link: 'Die Software ansehen', href: 'fonctionnalites' },
      { label: 'Cantia Accounting', title: 'Ein eigener Bereich\nfür Treuhänder.', text: 'Buchhaltung der Mandanten, Importe, MWST, Abschluss, Belege und Unterschriften. Kostenlos für Treuhänder.', link: 'Accounting entdecken', href: 'https://accounting.cantia.ch/de' },
      { label: 'Cantia Partners', title: 'Sie empfehlen.\nDie Partnerschaft folgt.', text: 'Ein Empfehlungsprogramm mit Provision auf vermittelte Unternehmen. Die Bedingungen stehen im Partnerbereich.', link: 'Das Programm entdecken', href: 'https://partners.cantia.ch/de' },
    ],
    calloutStrong: 'Sie nutzen Bexio?',
    callout: 'Cantia kann sich mit Ihren Kunden-, Rechnungs- und Zahlungsdaten verbinden.',
    calloutLink: 'Die Bexio-Integration ansehen',
  },
  app: {
    seoTitle: 'Cantia auf Computer und Smartphone | Cantia',
    seoDescription: 'Cantia läuft im Browser, auf Computer, Tablet und Smartphone. Fügen Sie Cantia in drei Schritten zum Startbildschirm hinzu, ohne Installationspflicht.',
    crumb: 'Computer & Smartphone',
    eyebrow: 'Ihr Büro begleitet Sie',
    h1Plain: 'Am richtigen Ort.',
    h1Accent: 'Wo auch immer Sie sind.',
    lead: 'Sehen Sie ein Dokument an, fügen Sie ein Foto hinzu oder erfassen Sie Ihre Stunden auf dem Smartphone. Zurück im Büro finden Sie das Projekt im selben Bereich.',
    open: 'Cantia öffnen',
    choose: 'Ein Abo wählen',
    tags: ['Web-App', 'Keine Installation nötig'],
    stepsEyebrow: 'Auf dem Smartphone starten',
    stepsPlain: 'Ihr Zugang,',
    stepsAccent: 'auf dem Startbildschirm.',
    stepsNote: 'Die Versionen für App Store und Google Play sind in Entwicklung. Der Zugang erfolgt heute im Browser.',
    devicesPlain: 'Auf jedem Gerät.', devicesAccent: 'In drei Schritten.', spacesPlain: 'Drei Bereiche.', spacesAccent: 'Ein Ökosystem.',
    steps: [
      { title: 'Cantia öffnen.', text: 'Öffnen Sie app.cantia.ch im Browser Ihres Smartphones und melden Sie sich an.' },
      { title: 'Verknüpfung hinzufügen.', text: 'Auf Android über das Menü des Browsers. Auf dem iPhone über das Teilen-Menü von Safari und «Zum Home-Bildschirm».' },
      { title: 'Projekte wiederfinden.', text: 'Über die Verknüpfung erreichen Sie Cantia und die für Ihr Konto freigegebenen Module.' },
    ],
  },
  resources: {
    seoTitle: 'Cantia entdecken: Hilfe, Anleitungen und Ressourcen | Cantia',
    seoDescription: 'Hilfecenter, mobiler Zugang, Cantia-Bereiche, Blog, kostenlose Rechner und direkter Kontakt: alle Ressourcen für den Einstieg in Cantia.',
    crumb: 'Cantia entdecken',
    eyebrow: 'Die richtigen Anhaltspunkte',
    h1Plain: 'Entdecken.',
    h1Accent: 'Verstehen. Vorankommen.',
    lead: 'Entdecken Sie die Einsätze, finden Sie Hilfe und tauschen Sie sich direkt mit Cantia aus, um Ihren Start vorzubereiten.',
    items: [
      { title: 'Hilfecenter.', text: 'Anleitungen und Erklärungen zu Offerten, Projekten, Rechnungen und Teamarbeit.', link: 'Hilfe ansehen', href: 'aide' },
      { title: 'Ihr mobiler Zugang.', text: 'Die Web-App verstehen und Cantia zum Startbildschirm Ihres Smartphones hinzufügen.', link: 'Cantia auf dem Smartphone', href: 'telechargement' },
      { title: 'Die Cantia-Bereiche.', text: 'Die Bereiche für Unternehmen, Treuhänder und Partner.', link: 'Bereiche ansehen', href: 'ecosysteme' },
      { title: 'Der Cantia-Blog.', text: 'Artikel von Cantia rund um Führung und Organisation von Unternehmen.', link: 'Artikel lesen', href: 'blog' },
      { title: 'Kostenlose Rechner.', text: 'Rechner für Lohn, Stundensatz, MWST und Marge, kostenlos.', link: 'Lohnrechner öffnen', href: 'calculateur-salaire' },
      { title: 'Direkter Kontakt.', text: 'Eine Frage zu einem Einsatz, einem Abo oder einem besonderen Bedarf? Kontaktieren Sie das Team.', link: 'Cantia kontaktieren', href: 'contact' },
    ],
  },
  contact: {
    seoTitle: 'Kontakt: sprechen wir über Ihren Alltag | Cantia',
    seoDescription: 'Eine Frage zu Cantia, ein Branchenbedarf oder eine spezifische Entwicklung? Schreiben Sie an info@cantia.ch oder rufen Sie +41 78 450 14 57 an.',
    crumb: 'Kontakt',
    eyebrow: 'Ein direkter Kontakt',
    h1Plain: 'Sprechen wir über',
    h1Accent: 'Ihren Alltag.',
    lead: 'Eine Frage zu Cantia, ein Branchenbedarf oder ein spezifisches Entwicklungsprojekt? Erklären Sie Ihre Abläufe und was Sie vereinfachen möchten.',
    cards: [
      { title: 'Per E-Mail.', text: 'Stellen Sie Ihr Unternehmen, Ihren Bedarf und Ihre bestehenden Tools vor. So können wir eine passende Antwort vorbereiten.', value: 'info@cantia.ch', href: 'mailto:info@cantia.ch' },
      { title: 'Per Telefon.', text: 'Ein Gespräch, um Ihre Organisation, die passenden Module und die nächsten Schritte zu klären.', value: '+41 78 450 14 57', href: 'tel:+41784501457' },
    ],
    formEyebrow: 'Über die Website schreiben',
    formTitle: 'Ihre Nachricht.',
    calloutStrong: 'Sie haben bereits ein Konto?',
    callout: 'Das Hilfecenter enthält die Anleitungen.',
    calloutLink: 'Zur Hilfe',
  },
};

const it: InnerCopy = {
  metiers: {
    seoTitle: 'Il vostro mestiere: un software che parla come voi | Cantia',
    seoDescription: 'Cantiere, progetto, mandato o dossier: Cantia adatta il vocabolario alla vostra attività. Edilizia, servizi, studi tecnici, agenzie: trovate il vostro uso.',
    crumb: 'Il vostro mestiere',
    eyebrow: 'Nato nei cantieri. Aperto ai vostri progetti.',
    h1Plain: 'Lo chiamate',
    h1Accent: 'come lavorate.',
    lead: 'Cantiere, progetto, mandato o dossier: Cantia adatta il vocabolario alla vostra attività, fino ai rapporti PDF. Il filo resta lo stesso: un cliente, un’offerta, un team, un lavoro da svolgere.',
    sectors: [
      { key: 'batiment', label: 'Edilizia e artigianato', eyebrow: 'Dal preventivo al cantiere', title: 'Ogni cantiere conserva la sua storia.', desc: 'Per le imprese di costruzione, di ristrutturazione e gli artigiani. Offerte, piani, foto e ore restano legati allo stesso cantiere.', word: 'Cantiere', items: ['Catalogo delle prestazioni e modelli di preventivo', 'Piani, foto e rapporti di cantiere', 'Ore e prestazioni supplementari da seguire'], link: 'signer' },
      { key: 'services', label: 'Servizi e manutenzione', eyebrow: 'Dal cliente all’intervento', title: 'Il seguito resta con ogni intervento.', desc: 'Per giardinaggio, pulizie e attività di servizio. Ritrovate le informazioni del dossier, il lavoro del team e la fatturazione.', word: 'Dossier', items: ['Clienti e documenti raccolti per dossier', 'Pianificazione condivisa e ore del team', 'Preventivi, fatture e seguito dei versamenti'], link: 'organiser' },
      { key: 'etudes', label: 'Studi tecnici', eyebrow: 'Dal mandato al seguito', title: 'Un quadro comune per i vostri mandati.', desc: 'Per studi tecnici e architetti che organizzano l’attività per mandato. Riunite documenti, scambi, tempo impiegato ed elementi finanziari.', word: 'Mandato', items: ['Documenti e scambi nello stesso mandato', 'Tempo dedicato da ogni membro del team', 'Spese e redditività da seguire'], link: 'piloter' },
      { key: 'creatifs', label: 'Agenzie ed eventi', eyebrow: 'Dall’offerta alla consegna', title: 'Il progetto collega tutto il team.', desc: 'Per agenzie, studi creativi e aziende di eventi. Collegate proposta commerciale, risorse impiegate e fatturazione del progetto.', word: 'Progetto', items: ['Offerte personalizzate e firma del cliente', 'Pianificazione e documenti comuni al team', 'Acconti e seguito della fatturazione'], link: 'signer' },
    ],
    words: ['Cantiere', 'Progetto', 'Mandato', 'Dossier'],
    sectorLinks: { signer: 'Scoprire i preventivi', organiser: 'Scoprire i progetti', collaborer: 'Scoprire il lavoro in team', facturer: 'Scoprire la fatturazione', piloter: 'Scoprire la gestione' },
    proof: 'Esempi di organizzazione con i moduli esistenti. Le funzionalità incluse dipendono dal piano.',
    tradesEyebrow: 'I mestieri dell’edilizia',
    tradesTitle: 'Una pagina per il vostro mestiere.',
    tradesText: 'Per ogni mestiere: le situazioni quotidiane, l’uso di Cantia e le domande frequenti.',
    splitEyebrow: 'Il vostro modo di lavorare',
    splitPlain: 'Le vostre prestazioni.',
    splitAccent: 'La vostra identità.',
    splitText: 'I vostri prezzi, i modelli di documento e gli accessi del team accompagnano la vostra organizzazione. E quando un’esigenza esce dal quadro, possiamo studiare un modulo privato.',
    splitLink: 'Scoprire il su misura',
    calloutStrong: 'Lavorate per progetti?',
    callout: 'Iniziate dagli usi che vi riguardano. Un’azienda può aver bisogno di preventivi e fatture, poi aggiungere la pianificazione o il seguito finanziario secondo il piano.',
  },
  surMesure: {
    seoTitle: 'Sviluppo su misura: un modulo privato in Cantia | Cantia',
    seoDescription: 'Un calcolo di mestiere, un circuito di convalida, un collegamento a uno strumento esistente: Cantia studia uno sviluppo privato, integrato nel vostro spazio e riservato alla vostra azienda.',
    crumb: 'Su misura',
    eyebrow: 'La vostra organizzazione ha le sue particolarità',
    h1Plain: 'Il vostro modo di fare.',
    h1Accent: 'Fino nel software.',
    lead: 'Un calcolo di mestiere, un circuito di convalida, un collegamento a uno strumento esistente. Possiamo studiare uno sviluppo privato, integrato nel vostro spazio Cantia.',
    cta: 'Parlare della mia esigenza',
    existing: 'Vedere i moduli esistenti',
    paper: { tag: 'IL VOSTRO SPAZIO CANTIA', title: 'Il vostro modulo privato.', sub: 'Uno sviluppo riservato alla vostra azienda.', lines: ['Le vostre fasi e convalide', 'I vostri calcoli di mestiere', 'I collaboratori autorizzati'], caption: 'ESEMPIO DI PRINCIPIO · PERIMETRO DA DEFINIRE INSIEME' },
    cardsEyebrow: 'Risposte mirate',
    cardsPlain: 'Lo strumento giusto,',
    cardsAccent: 'nel vostro ambiente.',
    cardsNote: 'Ogni richiesta inizia con uno scambio. A volte basta un modulo esistente.',
    cards: [
      { title: 'Un modulo di mestiere.', text: 'Una schermata, un calcolo o un seguito specifico per la vostra attività, attivato per la vostra azienda.' },
      { title: 'Un percorso adattato.', text: 'Le vostre fasi, gli stati e le convalide studiati per riflettere la vostra organizzazione.' },
      { title: 'Un collegamento utile.', text: 'Un legame con uno strumento esistente, dopo la verifica delle possibilità tecniche e degli accessi.' },
    ],
    steps: [
      { title: 'Partiamo dall’esigenza.', text: 'Descrivete il vostro funzionamento, le informazioni usate e ciò che vi rallenta.' },
      { title: 'Definiamo il perimetro.', text: 'Soluzione, condizioni e costo sono precisati in un preventivo prima di ogni sviluppo.' },
      { title: 'Il modulo entra in Cantia.', text: 'Una volta sviluppato, è attivato nel vostro spazio per le persone autorizzate.' },
    ],
    faq: [
      { q: 'Il modulo è visibile alle altre aziende?', a: 'No. Lo sviluppo privato è riservato alla vostra organizzazione e ai collaboratori autorizzati.' },
      { q: 'Quanto costa uno sviluppo?', a: 'Il costo dipende dal perimetro. Uno scambio permette di inquadrare la richiesta, poi viene proposto un preventivo prima di ogni impegno.' },
      { q: 'Un’integrazione è sempre possibile?', a: 'Dipende in particolare dagli accessi e dai mezzi offerti dal software in questione. La fattibilità è studiata prima di confermare lo sviluppo.' },
    ],
    formEyebrow: 'La vostra richiesta',
    formPlain: 'Parliamo di ciò che',
    formAccent: 'vi manca oggi.',
    formText: 'Descrivete la vostra esigenza in poche righe. Vi ricontattiamo per definire il passo successivo.',
  },
  ecosystem: {
    seoTitle: 'Fiduciarie e partner: l’ecosistema Cantia | Cantia',
    seoDescription: 'Cantia per le aziende, Cantia Accounting per le fiduciarie, Cantia Partners per raccomandare Cantia: trovate lo spazio adatto al vostro ruolo.',
    crumb: 'Fiduciarie e partner',
    eyebrow: 'Attorno alla vostra attività',
    h1Plain: 'Lo spazio giusto.',
    h1Accent: 'Per ogni ruolo.',
    lead: 'La gestione dell’azienda, il lavoro della fiduciaria e la raccomandazione di Cantia hanno ciascuno il loro posto. Ritrovate lo spazio adatto alla vostra attività.',
    spaces: [
      { label: 'Cantia', title: 'La vostra azienda,\nogni giorno.', text: 'Preventivi, progetti, rapporti, fatture, ore e finanze nel software di gestione.', link: 'Esplorare il software', href: 'fonctionnalites' },
      { label: 'Cantia Accounting', title: 'Uno spazio dedicato\nalle fiduciarie.', text: 'Contabilità dei mandanti, importazioni, IVA, chiusura, giustificativi e firme. Gratuito per le fiduciarie.', link: 'Scoprire Accounting', href: 'https://accounting.cantia.ch/it' },
      { label: 'Cantia Partners', title: 'Voi raccomandate.\nLa partnership segue.', text: 'Un programma di raccomandazione con commissione sulle aziende portate. Le condizioni sono indicate nello spazio partner.', link: 'Scoprire il programma', href: 'https://partners.cantia.ch/it' },
    ],
    calloutStrong: 'Usate Bexio?',
    callout: 'Cantia può collegarsi ai vostri dati di clienti, fatture e pagamenti.',
    calloutLink: 'Vedere l’integrazione Bexio',
  },
  app: {
    seoTitle: 'Cantia su computer e telefono | Cantia',
    seoDescription: 'Cantia si usa nel browser, su computer, tablet e telefono. Aggiungete Cantia alla schermata iniziale in tre passi, senza installazione obbligatoria.',
    crumb: 'Computer e telefono',
    eyebrow: 'Il vostro ufficio vi segue',
    h1Plain: 'Al vostro posto.',
    h1Accent: 'Ovunque siate.',
    lead: 'Consultate un documento, aggiungete una foto o registrate le ore dal telefono. Ritrovate il progetto nello stesso spazio quando tornate in ufficio.',
    open: 'Aprire Cantia',
    choose: 'Scegliere un piano',
    tags: ['Applicazione web', 'Senza installazione obbligatoria'],
    stepsEyebrow: 'Iniziare dal telefono',
    stepsPlain: 'Il vostro accesso,',
    stepsAccent: 'sulla schermata iniziale.',
    stepsNote: 'Le versioni App Store e Google Play sono in sviluppo. Oggi l’accesso avviene dal browser.',
    devicesPlain: 'Su ogni dispositivo.', devicesAccent: 'In tre gesti.', spacesPlain: 'Tre spazi.', spacesAccent: 'Un solo ecosistema.',
    steps: [
      { title: 'Aprite Cantia.', text: 'Andate su app.cantia.ch dal browser del telefono e accedete al vostro account.' },
      { title: 'Aggiungete una scorciatoia.', text: 'Su Android, dal menu del browser. Su iPhone, dal menu di condivisione di Safari, poi «Aggiungi alla schermata Home».' },
      { title: 'Ritrovate i progetti.', text: 'Usate la scorciatoia per accedere a Cantia e ai moduli autorizzati per il vostro account.' },
    ],
  },
  resources: {
    seoTitle: 'Scoprire Cantia: aiuto, guide e risorse | Cantia',
    seoDescription: 'Centro assistenza, accesso mobile, spazi Cantia, blog, calcolatori gratuiti e contatto diretto: tutte le risorse per iniziare con Cantia.',
    crumb: 'Scoprire Cantia',
    eyebrow: 'I punti di riferimento',
    h1Plain: 'Scoprire.',
    h1Accent: 'Capire. Avanzare.',
    lead: 'Esplorate gli usi, ritrovate l’aiuto e parlate direttamente con Cantia per preparare l’avvio.',
    items: [
      { title: 'Centro assistenza.', text: 'Guide e spiegazioni per preventivi, progetti, fatturazione e lavoro in team.', link: 'Consultare l’aiuto', href: 'aide' },
      { title: 'Il vostro accesso mobile.', text: 'Capire l’applicazione web e aggiungere Cantia alla schermata iniziale del telefono.', link: 'Usare Cantia sul telefono', href: 'telechargement' },
      { title: 'Gli spazi Cantia.', text: 'Gli spazi dedicati alle aziende, alle fiduciarie e ai partner.', link: 'Esplorare gli spazi', href: 'ecosysteme' },
      { title: 'Il blog Cantia.', text: 'Gli articoli di Cantia sulla gestione e l’organizzazione delle aziende.', link: 'Leggere gli articoli', href: 'blog' },
      { title: 'Calcolatori gratuiti.', text: 'Calcolatori di salario, tariffa oraria, IVA e margine, gratuiti.', link: 'Aprire il calcolatore', href: 'calculateur-salaire' },
      { title: 'Un contatto diretto.', text: 'Una domanda su un uso, un piano o un’esigenza particolare? Contattate il team.', link: 'Contattare Cantia', href: 'contact' },
    ],
  },
  contact: {
    seoTitle: 'Contatto: parliamo del vostro quotidiano | Cantia',
    seoDescription: 'Una domanda su Cantia, un’esigenza di mestiere o uno sviluppo specifico? Scrivete a info@cantia.ch o chiamate il +41 78 450 14 57.',
    crumb: 'Contatto',
    eyebrow: 'Un contatto diretto',
    h1Plain: 'Parliamo del',
    h1Accent: 'vostro quotidiano.',
    lead: 'Una domanda su Cantia, un’esigenza di mestiere o un progetto di sviluppo specifico? Spiegate il vostro funzionamento e ciò che volete semplificare.',
    cards: [
      { title: 'Per e-mail.', text: 'Presentate la vostra azienda, l’esigenza e gli strumenti che usate già. Così potremo preparare una risposta adatta.', value: 'info@cantia.ch', href: 'mailto:info@cantia.ch' },
      { title: 'Per telefono.', text: 'Uno scambio per capire la vostra organizzazione, i moduli che vi riguardano e i prossimi passi.', value: '+41 78 450 14 57', href: 'tel:+41784501457' },
    ],
    formEyebrow: 'Scrivere dal sito',
    formTitle: 'Il vostro messaggio.',
    calloutStrong: 'Avete già un account?',
    callout: 'Il centro assistenza contiene le guide d’uso.',
    calloutLink: 'Accedere all’aiuto',
  },
};

export const INNER_COPY: Record<SiteLocale, InnerCopy> = { fr, de, it };
