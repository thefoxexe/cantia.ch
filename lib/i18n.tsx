import { useTranslation } from './translations';

interface FeatureItem {
  title: string;
  text: string;
  detail: string[];
}

interface Dict {
  nav: { services: string; pricing: string; download: string; help: string; contact: string; login: string; cta: string };
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
  tour: { videoLabel: string };
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
  // "Download" left in English on purpose (not "Télécharger") — a common,
  // internationally-understood tech word, so this one nav label reads
  // identically for French and German visitors instead of needing its own
  // translation per locale.
  nav: { services: 'Services', pricing: 'Tarifs', download: 'Download', help: 'Documentation', contact: 'Contact', login: 'Se connecter', cta: 'Essayer Cantia' },
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
    subtitle: 'Du premier rendez-vous à la facture payée : cliquez sur un service pour voir précisément ce qu’il fait.',
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
  tour: {
    videoLabel: 'Vidéo de présentation de Cantia',
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


const de: Dict = {
  // "Download" left in English (not "Herunterladen") — see the fr dict's
  // comment above, same reasoning.
  nav: { services: 'Leistungen', pricing: 'Preise', download: 'Download', help: 'Dokumentation', contact: 'Kontakt', login: 'Anmelden', cta: 'Cantia testen' },
  hero: {
    kicker: 'Für das Schweizer Baugewerbe entwickelt 🇨🇭',
    headlinePrefix: 'Verwalten Sie Ihre Baustellen.',
    headlineHighlight: 'Nicht Ihre Administration.',
    subheadline:
      'Cantia ist die Verwaltungssoftware für Schweizer Bauunternehmen. Offerten, Rechnungen, Planung, Rapporte und Rentabilität an einem Ort, im Büro wie auf der Baustelle.',
    cta1: 'Meine 14-tägige Testphase starten',
    cta2: 'Cantia entdecken',
    trust: '14 Tage Testphase · Kein Code nötig · In der Schweiz gehostet',
  },
  spotlight: {
    title: 'Automatisierungen für den Alltag im Baugewerbe',
    subtitle: 'Von der Offertendiktierung bis zur QR-Rechnung automatisiert Cantia die Aufgaben, die Ihnen zwischen Baustelle und Büro Zeit kosten.',
    voice: {
      label: 'Sprachdiktat',
      listening: 'Aufnahme läuft…',
      transcript: 'Nordfassade, 12 Quadratmeter Verputz zu erneuern, plus Lieferung und Montage von 3 PVC-Fenstern…',
      resultTitle: 'Offerte automatisch erstellt',
      resultLines: ['Verputz Nordfassade — 12 m²', 'PVC-Fenster (Lieferung + Montage) — 3 Stk', 'Total mit MWST berechnet'],
      caption: 'Sie sprechen, Cantia schreibt. Ihre Offerte ist fertig, bevor Sie die Baustelle verlassen haben.',
    },
    qrbill: {
      label: 'Schweizer QR-Rechnung',
      title: 'Zahlbar mit einem Scan',
      text: 'Jede Rechnung enthält den Schweizer QR-Einzahlungsschein, scannbar mit jeder Banking-App.',
      badge: 'SIX-konform',
    },
    catalog: {
      label: 'Intelligenter Katalog',
      title: 'Ihre Preise, gespeichert',
      text: 'Jede Offerte erweitert Ihren Katalog. Beim nächsten Mal erkennt Cantia Ihre Leistungen und schlägt bereits den richtigen Preis vor.',
      items: [
        { name: 'PVC-Fenster Doppelverglasung', match: 96 },
        { name: 'Montage und Randabdichtung', match: 91 },
        { name: 'Alu-Rollladen nach Mass', match: 88 },
      ],
    },
  },
  pain: {
    title: 'Die Administration kostet Sie nicht nur Zeit. Sie kostet Sie Geld.',
    items: [
      {
        title: 'Ihre Offerten warten bis zum Abend. Ihre Kunden warten nicht.',
        text: 'Nach einem Tag auf der Baustelle bleiben die Offerten noch zu schreiben. Mit Cantia erstellen Sie eine Offerte direkt vor Ort und nutzen dabei Ihre gewohnten Leistungen wieder.',
      },
      {
        title: 'Fotos, Notizen und Entscheidungen landen überall, nur nicht am richtigen Ort.',
        text: 'WhatsApp, Fotogalerie, Papier, E-Mails: Cantia bündelt die Historie direkt in der betroffenen Baustelle.',
      },
      {
        title: 'Eine Baustelle kann Geld verlieren, lange bevor Sie es bemerken.',
        text: 'Vergleichen Sie Stunden, Ausgaben und verrechnete Beträge während der Bauzeit, um Abweichungen vor Bauende zu erkennen.',
      },
    ],
  },
  services: {
    title: 'Cantia verbindet Baustelle und Büro in einem einzigen Tool',
    subtitle: 'Vom ersten Termin bis zur bezahlten Rechnung: Klicken Sie auf eine Leistung, um genau zu sehen, was sie tut.',
    items: [
      {
        title: 'Vom Termin zur Offerte, ohne die Arbeit am Abend zu wiederholen',
        text: 'Diktieren Sie Ihre Offertpositionen per Sprache direkt von der Baustelle und lassen Sie die KI sie mit Ihrem Katalog kalkulieren, inklusive MWST und berechneten Totalen, versandbereit.',
        detail: [
          'Sprachdiktat, wiederverwendbarer Leistungskatalog und gespeicherte Preise',
          'Automatische Berechnung von MWST und Totalen, PDF in Ihrer Markenfarbe',
          'Versand an den Kunden und Umwandlung in eine Rechnung mit einem Klick, ohne erneute Eingabe',
        ],
      },
      {
        title: 'Alles, was auf der Baustelle passiert, bleibt bei der Baustelle',
        text: 'Ihre Notizen und Fotos, automatisch georeferenziert, werden zu einem versandbereiten PDF-Rapport mit Ihrem Logo und Ihrer Unterschrift.',
        detail: [
          'Fotos automatisch mit Zeitstempel und Standort versehen',
          'Bemerkungen, Dokumente und Historie nach Baustelle geordnet',
          'PDF mit einem Klick erstellt, jederzeit einsehbar',
        ],
      },
      {
        title: 'Das ganze Team weiss, wo es sein muss',
        text: 'Eine zentrale Planung pro Mitarbeiter und Baustelle, damit niemand mehr den Chef anrufen muss, um zu erfahren, wohin er morgen soll.',
        detail: [
          'Ansicht pro Mitarbeiter und Tag, für das ganze Team einsehbar',
          'Jede Zuteilung mit einer bestimmten Baustelle verknüpft',
          'Mehrere Baustellen parallel ohne Ressourcenkonflikt',
        ],
      },
      {
        title: 'Die Baustelle ist fertig. Die Rechnung sollte nicht warten.',
        text: 'Verwandeln Sie eine angenommene Offerte mit einem Klick in eine Schweizer QR-Rechnung, mit Statusverfolgung bis zur Zahlung.',
        detail: [
          'Rechnung aus der Offerte erstellt, ohne erneute Eingabe',
          'Konforme QR-Rechnung, zahlbar mit einem Scan',
          'Zahlungsstatus live verfolgt, Mahnungen erleichtert',
        ],
      },
      {
        title: 'Wissen, was jede Baustelle wirklich einbringt',
        text: 'Vergleichen Sie live Stunden, Ausgaben, offerierten und verrechneten Betrag, um eine schwindende Marge vor Bauende zu erkennen.',
        detail: [
          'Vergleich offeriert vs. tatsächliche Kosten (Material und Arbeit)',
          'Visueller Alarm, sobald eine Baustelle von der geplanten Marge abweicht',
          'Ansicht baustellenweise, nicht erst am Monatsende',
        ],
      },
      {
        title: 'Dokumente in Baumstruktur',
        text: 'Jede Baustelle hat ihren eigenen digitalen Ordner, mit Unterordnern für Ihre Pläne und Ausschreibungen.',
        detail: [
          'Unbegrenzte Ordner und Unterordner pro Baustelle',
          'Jeder Dateityp: Pläne, PDF, Fotos, Verträge',
          'Ein Dokument in wenigen Sekunden wiederfinden',
        ],
      },
      {
        title: 'Intelligente Fotogalerie',
        text: 'Alle Fotos einer Baustelle finden sich am selben Ort. Filtern Sie sie nach Datum und sehen Sie auf der Karte, wo sie aufgenommen wurden.',
        detail: [
          'Alle Fotos einer Baustelle automatisch gruppiert',
          'Filter nach Datum: 7 Tage, 30 Tage oder gesamte Historie',
          'Direkter Zugriff auf den Standort auf der Karte',
        ],
      },
      {
        title: 'Ein sicherer Kundenbereich',
        text: 'Jede Offerte und jede Rechnung ist über einen eindeutigen, privaten Link zugänglich: Ihr Kunde sieht, unterschreibt und verfolgt die Zahlung, ohne je ein Konto zu erstellen.',
        detail: [
          'Elektronische Unterschrift mit Zeitstempel, als Nachweis gespeichert',
          'Zahlungsstatus live sichtbar, noch vor Ihrer Mahnung',
          'Vollständige Historie der Offerten und Rechnungen, nach Baustelle geordnet',
        ],
      },
      {
        title: 'Dokumente in Ihrem Stil',
        text: 'Wählen Sie Ihre Markenfarbe, die Platzierung Ihres Logos, und erstellen Sie mehrere Vorlagen für Ihre Offerten und PDF-Rapporte.',
        detail: [
          'Markenfarbe und Logoplatzierung anpassbar',
          'Mehrere Vorlagen pro Dokumenttyp, wählbar bei der Erstellung',
          'Bereits im Plan Essentiel verfügbar',
        ],
      },
      {
        title: 'Aufmass Position für Position',
        text: 'Erfassen Sie Ihre Mengen Position für Position, mit automatisch berechneten Totalen, und verwandeln Sie alles mit einem Klick in eine Offerte.',
        detail: [
          'Positionstabelle mit Referenz, Menge und Einheit',
          'Automatische Totale pro Einheit (m², m³, lfm…)',
          'Übertragung mit einem Klick in eine vorausgefüllte Offerte',
        ],
      },
      {
        title: 'Für das Team gedacht',
        text: 'Erstellen Sie massgeschneiderte Rollen und entscheiden Sie genau, wer was sieht — Offerten, Rechnungen, Planung — ohne allen alles zu geben.',
        detail: [
          'Anpassbare Rollen mit ankreuzbaren Zugriffen pro Bereich',
          'Finanzen, Aufmass, Planung und Dokumente separat verwaltet',
          'Hinzufügen von Mitarbeitenden je nach Plan',
        ],
      },
      {
        title: 'Koordination der Subunternehmer',
        text: 'Fügen Sie beauftragte Subunternehmer zu jeder Baustelle hinzu, verfolgen Sie ihre Einsätze und behalten Sie ihre Versicherungsnachweise griffbereit.',
        detail: [
          'Subunternehmer-Verzeichnis, von Baustelle zu Baustelle wiederverwendbar',
          'Einsatzstatus und Termine pro Baustelle',
          'Haftpflicht-Versicherungsnachweis gespeichert und datiert, nichts geht mehr vergessen',
        ],
      },
    ],
  },
  trades: {
    title: 'Für Ihren Beruf gedacht',
    note: 'Jedes Konto passt sich Ihrem Beruf an, mit bereits konfigurierten Rapportvorlagen, MWST-Satz und Offertenlayout.',
    list: ['Tiefbau', 'Maurerarbeiten', 'Schlosserei', 'Elektrik', 'Sanitär', 'Schreinerei', 'Malerarbeiten', 'Plattenarbeiten'],
  },
  pricing: {
    title: 'Wählen Sie die passende Formel für Ihr Unternehmen',
    subtitle: 'Alle neuen Konten starten mit einer vollständigen 14-tägigen Testphase, ohne Aktionscode.',
    monthly: 'Monatliche Abrechnung',
    yearly: 'Jährliche Abrechnung',
    yearlySavings: '-20%',
    billedYearly: 'Jährlich {amount} verrechnet',
    storageSuffix: 'GB Speicherplatz',
    memberSingular: 'Mitglied',
    memberPlural: 'Mitglieder',
    unlimited: 'Unbegrenzte Rapporte & Offerten',
    badge: 'Meistgewählt',
    paidCta: '14-tägige Testphase starten',
  },
  swiss: {
    title: 'In der Schweiz entwickelt, nicht nur für die Schweiz übersetzt',
    text: 'Cantia wurde für die Funktionsweise Schweizer Bauunternehmen entwickelt: CHF, Schweizer MWST, QR-Rechnung und in der Schweiz gehostete Daten.',
  },
  tour: {
    videoLabel: 'Präsentationsvideo von Cantia',
  },
  devices: {
    title: 'Verwalten Sie Ihre Baustellen, wo auch immer Sie sind',
    text: 'Im Büro, auf der Baustelle oder unterwegs, finden Sie Cantia auf Computer, Tablet und Smartphone.',
    benefits: [
      { title: 'Im Büro', text: 'Erstellen Sie Offerten, Rechnungen und Auswertungen.' },
      { title: 'Auf der Baustelle', text: 'Fügen Sie Rapporte, Fotos und Stunden hinzu.' },
      { title: 'Unterwegs', text: 'Greifen Sie von Ihrem Telefon auf Ihre Informationen zu.' },
    ],
  },
  mobile: {
    title: 'Cantia begleitet Sie auch auf der Baustelle',
    text: 'Öffnen Sie Cantia von Ihrem Telefon oder Tablet aus und fügen Sie es zu Ihrem Startbildschirm hinzu, um schon heute im Vollbild wie bei Ihren anderen Apps darauf zuzugreifen, ganz ohne App Store.',
    installCta: 'So installieren Sie es',
    storeNote: 'Die offiziellen Versionen kommen auch:',
    comingSoon: 'In Entwicklung',
    appStore: 'App Store',
    googlePlay: 'Google Play',
  },
  finalCta: {
    title: 'Testen Sie Cantia auf Ihrer nächsten Baustelle',
    subtitle: 'Erstellen Sie Ihr Konto und entdecken Sie 14 Tage lang, wie Cantia Ihre Offerten, Baustellen, Rapporte und Rechnungen an einem Ort bündelt.',
    button: 'Meine 14-tägige Testphase starten',
    trust: ['14 Tage Testphase · Kein Code nötig', 'Jederzeit kündbar', 'In der Schweiz gehostet'],
  },
  footer: {
    blurb: 'Die Baustellenverwaltungs-App für das Schweizer Baugewerbe. Rapporte, Dokumente, Offerten, Rechnungen und Aufmass, alles an einem Ort.',
    product: 'Produkt',
    account: 'Konto',
    legal: 'Rechtliches',
    servicesLink: 'Leistungen',
    pricingLink: 'Preise',
    login: 'Anmelden',
    signup: 'Konto erstellen',
    legalLink: 'Impressum',
    privacyLink: 'Datenschutz',
    copyright: '© {year} Cantia. Entwickelt für das Schweizer Baugewerbe.',
  },
};

const it: Dict = {
  // "Download" lasciato in inglese (non "Scaricare") — stessa scelta fatta
  // per fr/de: una parola tecnica capita internazionalmente, così questa
  // voce di navigazione resta identica in tutte le lingue.
  nav: { services: 'Servizi', pricing: 'Prezzi', download: 'Download', help: 'Documentazione', contact: 'Contatto', login: 'Accedi', cta: 'Prova Cantia' },
  hero: {
    kicker: 'Pensato per l’edilizia svizzera 🇨🇭',
    headlinePrefix: 'Gestisca i suoi cantieri.',
    headlineHighlight: 'Non la sua amministrazione.',
    subheadline:
      'Cantia è il software di gestione pensato per le imprese edili svizzere. Preventivi, fatture, pianificazione, rapporti e redditività riuniti in un unico strumento, in ufficio come in cantiere.',
    cta1: 'Inizi la prova gratuita di 14 giorni',
    cta2: 'Scopra Cantia',
    trust: '14 giorni di prova · Nessun codice necessario · Ospitato in Svizzera',
  },
  spotlight: {
    title: 'Automatismi pensati per il quotidiano dell’edilizia',
    subtitle: 'Dalla dettatura del preventivo alla fattura QR, Cantia automatizza i compiti che le fanno perdere tempo tra il cantiere e l’ufficio.',
    voice: {
      label: 'Dettatura vocale',
      listening: 'Ascolto in corso…',
      transcript: 'Facciata nord, 12 metri quadrati di intonaco da rifare, più fornitura e posa di 3 finestre in PVC…',
      resultTitle: 'Preventivo generato automaticamente',
      resultLines: ['Intonaco facciata nord — 12 m²', 'Finestra PVC (fornitura + posa) — 3 pz', 'Totale calcolato con IVA'],
      caption: 'Lei parla, Cantia scrive. Il suo preventivo è pronto ancora prima di lasciare il cantiere.',
    },
    qrbill: {
      label: 'Fattura QR svizzera',
      title: 'Pagabile con una scansione',
      text: 'Ogni fattura include la polizza di versamento QR svizzera, scansionabile da qualsiasi app bancaria.',
      badge: 'Conforme allo standard SIX',
    },
    catalog: {
      label: 'Catalogo intelligente',
      title: 'I suoi prezzi, memorizzati',
      text: 'Ogni preventivo arricchisce il suo catalogo. La prossima volta, Cantia riconosce le sue prestazioni e propone già il prezzo corretto.',
      items: [
        { name: 'Finestra PVC doppio vetro', match: 96 },
        { name: 'Posa e impermeabilizzazione perimetrale', match: 91 },
        { name: 'Tapparella in alluminio su misura', match: 88 },
      ],
    },
  },
  pain: {
    title: 'L’amministrazione non le costa solo tempo. Le costa denaro.',
    items: [
      {
        title: 'I suoi preventivi aspettano la sera. I suoi clienti, invece, non aspettano.',
        text: 'Dopo una giornata di cantiere, restano ancora le offerte da scrivere. Cantia permette di preparare un preventivo direttamente dal campo e di riutilizzare le prestazioni abituali.',
      },
      {
        title: 'Foto, note e decisioni finiscono ovunque tranne che nel posto giusto.',
        text: 'WhatsApp, galleria del telefono, carta, email: Cantia raccoglie lo storico direttamente nel cantiere interessato.',
      },
      {
        title: 'Un cantiere può perdere denaro molto prima che lei se ne accorga.',
        text: 'Confronti ore, spese e importi fatturati durante il cantiere per individuare gli scostamenti prima della fine dei lavori.',
      },
    ],
  },
  services: {
    title: 'Cantia collega il campo e l’ufficio in un unico strumento',
    subtitle: 'Dal primo appuntamento alla fattura pagata: clicchi su un servizio per vedere esattamente cosa fa.',
    items: [
      {
        title: 'Dall’appuntamento al preventivo senza rifare il lavoro la sera',
        text: 'Detti le righe del preventivo a voce dal cantiere e lasci che l’IA le quantifichi con il suo catalogo, IVA e totali calcolati, pronto per l’invio.',
        detail: [
          'Dettatura vocale, catalogo di prestazioni riutilizzabili e prezzi memorizzati',
          'Calcolo automatico dell’IVA e dei totali, PDF nel suo colore aziendale',
          'Invio al cliente e trasformazione in fattura con un clic, senza reinserimento',
        ],
      },
      {
        title: 'Tutto ciò che succede in cantiere resta con il cantiere',
        text: 'Le sue note e foto, geolocalizzate automaticamente, diventano un rapporto PDF pronto per l’invio con il suo logo e la sua firma.',
        detail: [
          'Foto con data e geolocalizzazione automatiche',
          'Osservazioni, documenti e storico classificati per cantiere',
          'PDF generato con un clic, consultabile in qualsiasi momento',
        ],
      },
      {
        title: 'Tutta la squadra sa dove deve essere',
        text: 'Una pianificazione centrale per dipendente e per cantiere, per non dover più chiamare il titolare per sapere dove andare domani.',
        detail: [
          'Vista per membro e per giorno, consultabile da tutta la squadra',
          'Ogni assegnazione collegata a un cantiere preciso',
          'Più cantieri in parallelo senza conflitti di risorse',
        ],
      },
      {
        title: 'Il cantiere è terminato. La fattura non dovrebbe aspettare.',
        text: 'Trasformi un preventivo accettato in fattura QR svizzera con un clic, con monitoraggio dello stato fino al pagamento.',
        detail: [
          'Fattura generata dal preventivo, senza reinserimento',
          'Fattura QR conforme, pagabile con una scansione',
          'Stato del pagamento seguito in diretta, solleciti facilitati',
        ],
      },
      {
        title: 'Sappia cosa le rende davvero ogni cantiere',
        text: 'Confronti in diretta ore, spese, importo preventivato e importo fatturato per individuare un margine che si assottiglia prima della fine dei lavori.',
        detail: [
          'Confronto preventivato vs. costo reale (materiale e manodopera)',
          'Avviso visivo non appena un cantiere si scosta dal margine previsto',
          'Vista cantiere per cantiere, non solo a fine mese',
        ],
      },
      {
        title: 'Documenti ad albero',
        text: 'Ogni cantiere ha il proprio raccoglitore digitale, con cartelle e sottocartelle per i suoi piani e capitolati.',
        detail: [
          'Cartelle e sottocartelle illimitate, per cantiere',
          'Qualsiasi tipo di file: piani, PDF, foto, contratti',
          'Ritrova un documento in pochi secondi',
        ],
      },
      {
        title: 'Galleria fotografica intelligente',
        text: 'Tutte le foto di un cantiere si trovano nello stesso posto. Le filtri per data e individui dove sono state scattate sulla mappa.',
        detail: [
          'Tutte le foto di un cantiere raggruppate automaticamente',
          'Filtri per data: 7 giorni, 30 giorni o tutto lo storico',
          'Apertura diretta della posizione sulla mappa',
        ],
      },
      {
        title: 'Uno spazio cliente sicuro',
        text: 'Ogni preventivo e ogni fattura è accessibile tramite un link unico e privato: il suo cliente consulta, firma e segue il pagamento senza mai creare un account.',
        detail: [
          'Firma elettronica con data e ora, conservata come prova',
          'Stato del pagamento visibile in diretta, ancora prima del suo sollecito',
          'Storico completo di preventivi e fatture, classificato per cantiere',
        ],
      },
      {
        title: 'Documenti a sua immagine',
        text: 'Scelga il colore aziendale, il posizionamento del logo, e crei più modelli per i suoi preventivi e rapporti PDF.',
        detail: [
          'Colore aziendale e posizionamento del logo personalizzabili',
          'Più modelli per tipo di documento, da scegliere alla creazione',
          'Disponibile già dal piano Essenziale',
        ],
      },
      {
        title: 'Computo metrico voce per voce',
        text: 'Dettagli le sue quantità voce per voce, con totali calcolati automaticamente, poi trasformi tutto in preventivo con un clic.',
        detail: [
          'Tabella di voci con riferimento, quantità e unità',
          'Totali automatici per unità (m², m³, ml…)',
          'Trasferimento con un clic verso un preventivo pre-compilato',
        ],
      },
      {
        title: 'Pensato per la squadra',
        text: 'Crei ruoli su misura e decida esattamente chi vede cosa — preventivi, fatture, pianificazione — senza dare tutto a tutti.',
        detail: [
          'Ruoli personalizzabili con accessi selezionabili per ambito',
          'Finanza, computo metrico, pianificazione e documenti gestiti separatamente',
          'Aggiunta di collaboratori secondo il suo piano',
        ],
      },
      {
        title: 'Coordinamento dei subappaltatori',
        text: 'Aggiunga le imprese subappaltate a ogni cantiere, segua i loro interventi e tenga a portata di mano i loro attestati assicurativi.',
        detail: [
          'Rubrica di subappaltatori riutilizzabile da un cantiere all’altro',
          'Stato dell’intervento e date di passaggio per cantiere',
          'Attestato di assicurazione RC memorizzato e datato, niente più dimenticanze',
        ],
      },
    ],
  },
  trades: {
    title: 'Pensato per il suo mestiere',
    note: 'Ogni account si adatta al suo mestiere, con modelli di rapporto, aliquota IVA e impaginazione dei preventivi già configurati.',
    list: ['Genio civile', 'Muratura', 'Serramenteria metallica', 'Elettricità', 'Idraulica', 'Falegnameria', 'Pittura', 'Piastrellatura'],
  },
  pricing: {
    title: 'Scelga la formula adatta alla sua impresa',
    subtitle: 'Tutti i nuovi account iniziano con 14 giorni di prova completa, senza codice promozionale.',
    monthly: 'Fatturazione mensile',
    yearly: 'Fatturazione annuale',
    yearlySavings: '-20%',
    billedYearly: 'Fatturato {amount}/anno',
    storageSuffix: 'GB di spazio',
    memberSingular: 'membro',
    memberPlural: 'membri',
    unlimited: 'Rapporti & preventivi illimitati',
    badge: 'Il più scelto',
    paidCta: 'Inizi la prova di 14 giorni',
  },
  swiss: {
    title: 'Pensato in Svizzera, non solo tradotto per la Svizzera',
    text: 'Cantia è stato sviluppato per il funzionamento delle imprese edili svizzere: CHF, IVA svizzera, fattura QR e dati ospitati in Svizzera.',
  },
  tour: {
    videoLabel: 'Video di presentazione di Cantia',
  },
  devices: {
    title: 'Gestisca i suoi cantieri, ovunque si trovi',
    text: 'In ufficio, in cantiere o in trasferta, ritrovi Cantia su computer, tablet e smartphone.',
    benefits: [
      { title: 'In ufficio', text: 'Prepari preventivi, fatture e analisi.' },
      { title: 'In cantiere', text: 'Aggiunga rapporti, foto e ore.' },
      { title: 'In trasferta', text: 'Acceda alle sue informazioni dal telefono.' },
    ],
  },
  mobile: {
    title: 'Cantia la segue anche sul campo',
    text: 'Apra Cantia dal telefono o dal tablet e lo aggiunga alla schermata principale per accedervi rapidamente, a schermo intero, come alle sue altre app, già da oggi e senza passare da uno store.',
    installCta: 'Come installarlo',
    storeNote: 'Arrivano anche le versioni ufficiali:',
    comingSoon: 'In sviluppo',
    appStore: 'App Store',
    googlePlay: 'Google Play',
  },
  finalCta: {
    title: 'Provi Cantia sul suo prossimo cantiere',
    subtitle: 'Crei il suo account e scopra per 14 giorni come Cantia riunisce preventivi, cantieri, rapporti e fatture in un unico posto.',
    button: 'Inizi i miei 14 giorni di prova',
    trust: ['14 giorni di prova · Nessun codice necessario', 'Disdicibile in qualsiasi momento', 'Ospitato in Svizzera'],
  },
  footer: {
    blurb: 'L’app di gestione cantieri per l’edilizia svizzera. Rapporti, documenti, preventivi, fatture e computo metrico, tutto in un unico posto.',
    product: 'Prodotto',
    account: 'Account',
    legal: 'Legale',
    servicesLink: 'Servizi',
    pricingLink: 'Prezzi',
    login: 'Accedi',
    signup: 'Crea un account',
    legalLink: 'Note legali',
    privacyLink: 'Privacy',
    copyright: '© {year} Cantia. Pensato per l’edilizia svizzera.',
  },
};

export function useMarketingDict(): Dict {
  const { i18n } = useTranslation();
  return i18n.language === 'de' ? de : i18n.language === 'it' ? it : fr;
}

export const t: Dict = fr;
