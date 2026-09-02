import { useTranslation } from './translations';

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
  // "Download" left in English on purpose (not "Télécharger") — a common,
  // internationally-understood tech word, so this one nav label reads
  // identically for French and German visitors instead of needing its own
  // translation per locale.
  nav: { services: 'Services', pricing: 'Tarifs', download: 'Download', help: 'Documentation', login: 'Se connecter', cta: 'Essayer Cantia' },
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


const de: Dict = {
  // "Download" left in English (not "Herunterladen") — see the fr dict's
  // comment above, same reasoning.
  nav: { services: 'Leistungen', pricing: 'Preise', download: 'Download', help: 'Dokumentation', login: 'Anmelden', cta: 'Cantia testen' },
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
    subtitle: 'Das erste Drittel der Seite zeigt das Ergebnis, der Rest beweist die Bandbreite des Produkts. Klicken Sie auf eine Leistung, um genau zu sehen, was sie tut.',
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

export function useMarketingDict(): Dict {
  const { i18n } = useTranslation();
  return i18n.language === 'de' ? de : fr;
}

export const t: Dict = fr;
