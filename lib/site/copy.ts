// Texts of the public cantia.ch site in the November 2026 identity: menu,
// footer and home page, in the three languages the site is published in.
// The five product families keep one word each: Signer, Organiser,
// Collaborer, Facturer, Piloter.

export type SiteLocale = 'fr' | 'de' | 'it';

type Family = { key: 'signer' | 'organiser' | 'collaborer' | 'facturer' | 'piloter'; name: string; text: string; slug: string };

export interface SiteCopy {
  nav: {
    software: string;
    trade: string;
    pricing: string;
    custom: string;
    discover: string;
    login: string;
    tryCta: string;
    menu: string;
    close: string;
    home: string;
    assistant: { name: string; text: string };
    allFeatures: string;
    devices: string;
    ecosystem: string;
    help: string;
    contact: string;
    tryLong: string;
    priceNote: string;
  };
  families: Family[];
  footer: {
    tagline: string;
    madeIn: string;
    languages: string;
    software: string;
    company: string;
    contact: string;
    tradeLink: string;
    pricingLink: string;
    customLink: string;
    ecosystemLink: string;
    devicesLink: string;
    compareLink: string;
    payments: string;
    talk: string;
    help: string;
    login: string;
    legal: string;
    privacy: string;
    terms: string;
  };
  home: {
    eyebrow: string;
    titlePlain: string;
    titleAccent: string;
    leadStrong: string;
    lead: string;
    tryCta: string;
    explore: string;
    demo: string;
    micro: string;
    stageTag: string;
    stageNote: string;
    stageCaption: string;
    trust: [string, string, string];
    familiesEyebrow: string;
    familiesTitlePlain: string;
    familiesTitleAccent: string;
    familiesText: string;
    familiesNote: string;
    allFeatures: string;
    exportsEyebrow: string;
    exportsTitlePlain: string;
    exportsTitleAccent: string;
    exportsText: string;
    exportDevis: string;
    exportDevisMeta: string;
    exportFacture: string;
    exportFactureMeta: string;
    assistantEyebrow: string;
    assistantTitlePlain: string;
    assistantTitleAccent: string;
    assistantText: string;
    assistantLink: string;
    voiceTag: string;
    voiceQuote: string;
    voicePlay: string;
    voiceResultTitle: string;
    voiceResultLine: string;
    voiceResultQty: string;
    voiceResultText: string;
    voiceCaption: string;
    sectorTitlePlain: string;
    sectorTitleAccent: string;
    sectors: string[];
    sectorLink: string;
    ctaTitlePlain: string;
    ctaTitleAccent: string;
    ctaText: string;
    ctaButton: string;
    ctaMicro: string;
  };
}

const fr: SiteCopy = {
  nav: {
    software: 'Fonctionnalités',
    trade: 'Métiers',
    pricing: 'Tarifs',
    custom: 'Sur mesure',
    discover: 'Ressources',
    login: 'Connexion',
    tryCta: 'Essayer Cantia',
    menu: 'Ouvrir le menu',
    close: 'Fermer le menu',
    home: 'Accueil',
    assistant: { name: 'L’assistant Cantia', text: 'Dictez. Relisez. Validez.' },
    allFeatures: 'Explorer toutes les fonctionnalités',
    devices: 'Sur ordinateur et téléphone',
    ecosystem: 'À propos',
    help: 'Aide',
    contact: 'Contact',
    tryLong: 'Essayer pendant 14 jours',
    priceNote: 'Dès CHF 39.– / mois · 14 jours d’essai',
  },
  families: [
    { key: 'signer', name: 'Signer', text: 'Clients, devis et signatures', slug: 'signer' },
    { key: 'organiser', name: 'Organiser', text: 'Projets, planning et documents', slug: 'organiser' },
    { key: 'collaborer', name: 'Collaborer', text: 'Rapports, heures et équipe', slug: 'collaborer' },
    { key: 'facturer', name: 'Facturer', text: 'Factures QR, acomptes et paiements', slug: 'facturer' },
    { key: 'piloter', name: 'Piloter', text: 'Dépenses, rentabilité et trésorerie', slug: 'piloter' },
  ],
  footer: {
    tagline: 'La suite suisse pour les entreprises\nqui travaillent par projets.',
    madeIn: 'Conçu et hébergé en Suisse.',
    languages: 'Français · Deutsch · Italiano',
    software: 'Fonctionnalités',
    company: 'Cantia',
    contact: 'Un contact direct',
    tradeLink: 'Métiers',
    pricingLink: 'Tarifs & formules',
    customLink: 'Développements sur mesure',
    ecosystemLink: 'À propos',
    devicesLink: 'Ordinateur & téléphone',
    compareLink: 'Comparatifs',
    payments: 'Paiements acceptés',
    talk: 'Parlons de votre activité',
    help: 'Aide',
    login: 'Connexion',
    legal: 'Mentions légales',
    privacy: 'Confidentialité',
    terms: 'Conditions générales',
  },
  home: {
    eyebrow: 'La suite de gestion suisse',
    titlePlain: 'La suite logique',
    titleAccent: 'de vos projets.',
    leadStrong: 'Du devis à la facture, chaque information trouve sa place.',
    lead: 'Cantia relie vos projets, votre équipe et vos finances dans un même espace.',
    tryCta: 'Essayer 14 jours',
    explore: 'Explorer le logiciel',
    demo: 'Voir la démo',
    micro: 'Dès CHF 39.– / mois · Carte bancaire requise pour l’essai',
    stageTag: 'Votre journée, dans Cantia.',
    stageNote: 'Données d’exemple',
    stageCaption: 'Signé en ligne par le client, sans créer de compte.',
    trust: ['Données hébergées à Zurich', 'Facturation QR suisse', 'Français, allemand, italien'],
    familiesEyebrow: 'Une activité. Cinq usages connectés.',
    familiesTitlePlain: 'Tout ce qui fait',
    familiesTitleAccent: 'avancer vos projets.',
    familiesText: 'Un devis devient un projet, les heures rejoignent le suivi, les prestations deviennent des factures. Le contexte reste avec vous.',
    familiesNote: 'Des modules selon vos besoins et votre formule.',
    allFeatures: 'Voir toutes les fonctionnalités',
    exportsEyebrow: 'Ce que reçoivent vos clients',
    exportsTitlePlain: 'Des documents à votre nom,',
    exportsTitleAccent: 'prêts à envoyer.',
    exportsText: 'Logo, couleur, numérotation et adresse placée pour l’enveloppe à fenêtre. Chaque PDF ci-contre sort tel quel de Cantia.',
    exportDevis: 'Devis signé en ligne',
    exportDevisMeta: 'Signature, date et heure dans le PDF',
    exportFacture: 'Facture avec QR-facture',
    exportFactureMeta: 'Montant, IBAN et référence remplis',
    assistantEyebrow: 'L’assistant Cantia',
    assistantTitlePlain: 'Vous avez les mots.',
    assistantTitleAccent: 'Cantia prépare la suite.',
    assistantText: 'Un devis à préparer, un rapport à rédiger, une dépense à saisir. Dictez ou écrivez : Cantia vous aide à structurer le brouillon. Vous gardez la main sur ce qui est envoyé.',
    assistantLink: 'Découvrir l’assistant',
    voiceTag: 'Un exemple de dictée',
    voiceQuote: '« Prépare un devis pour l’entretien annuel du jardin des Favre. »',
    voicePlay: 'Lancer l’exemple de dictée',
    voiceResultTitle: 'Un brouillon de devis, à vérifier.',
    voiceResultLine: 'Fourniture et pose de parquet',
    voiceResultQty: '24 m²',
    voiceResultText: 'Complétez le client, vérifiez le prix du catalogue, ajustez puis validez.',
    voiceCaption: 'Animation illustrative. Aucun microphone n’est activé.',
    sectorTitlePlain: 'Un chantier, un mandat,\nun projet.',
    sectorTitleAccent: 'Votre métier.',
    sectors: ['Bâtiment & artisanat', 'Services & entretien', 'Bureaux d’études', 'Agences & événementiel'],
    sectorLink: 'Trouver votre usage',
    ctaTitlePlain: 'La suite de vos projets',
    ctaTitleAccent: 'commence ici.',
    ctaText: 'Découvrez Cantia avec votre entreprise pendant 14 jours.',
    ctaButton: 'Essayer Cantia',
    ctaMicro: 'Carte bancaire requise · Aucun débit avant la fin de l’essai',
  },
};

const de: SiteCopy = {
  nav: {
    software: 'Funktionen',
    trade: 'Branchen',
    pricing: 'Preise',
    custom: 'Massgeschneidert',
    discover: 'Ressourcen',
    login: 'Anmelden',
    tryCta: 'Cantia testen',
    menu: 'Menü öffnen',
    close: 'Menü schliessen',
    home: 'Startseite',
    assistant: { name: 'Der Cantia-Assistent', text: 'Diktieren. Prüfen. Freigeben.' },
    allFeatures: 'Alle Funktionen entdecken',
    devices: 'Auf Computer und Handy',
    ecosystem: 'Über uns',
    help: 'Hilfe',
    contact: 'Kontakt',
    tryLong: '14 Tage testen',
    priceNote: 'Ab CHF 39.– / Monat · 14 Tage testen',
  },
  families: [
    { key: 'signer', name: 'Unterzeichnen', text: 'Kunden, Offerten und Unterschriften', slug: 'signer' },
    { key: 'organiser', name: 'Organisieren', text: 'Projekte, Planung und Dokumente', slug: 'organiser' },
    { key: 'collaborer', name: 'Zusammenarbeiten', text: 'Rapporte, Stunden und Team', slug: 'collaborer' },
    { key: 'facturer', name: 'Fakturieren', text: 'QR-Rechnungen, Anzahlungen und Zahlungen', slug: 'facturer' },
    { key: 'piloter', name: 'Steuern', text: 'Ausgaben, Rentabilität und Liquidität', slug: 'piloter' },
  ],
  footer: {
    tagline: 'Die Schweizer Software für Unternehmen,\ndie in Projekten arbeiten.',
    madeIn: 'In der Schweiz entwickelt und gehostet.',
    languages: 'Français · Deutsch · Italiano',
    software: 'Funktionen',
    company: 'Cantia',
    contact: 'Direkter Kontakt',
    tradeLink: 'Branchen',
    pricingLink: 'Preise & Abos',
    customLink: 'Massgeschneiderte Entwicklungen',
    ecosystemLink: 'Über uns',
    devicesLink: 'Computer & Handy',
    compareLink: 'Vergleiche',
    payments: 'Akzeptierte Zahlungsmittel',
    talk: 'Sprechen wir über Ihr Geschäft',
    help: 'Hilfe',
    login: 'Anmelden',
    legal: 'Impressum',
    privacy: 'Datenschutz',
    terms: 'AGB',
  },
  home: {
    eyebrow: 'Die Schweizer Verwaltungssoftware',
    titlePlain: 'Die logische Fortsetzung',
    titleAccent: 'Ihrer Projekte.',
    leadStrong: 'Von der Offerte bis zur Rechnung hat jede Information ihren Platz.',
    lead: 'Cantia verbindet Ihre Projekte, Ihr Team und Ihre Finanzen an einem Ort.',
    tryCta: '14 Tage testen',
    explore: 'Software entdecken',
    demo: 'Demo ansehen',
    micro: 'Ab CHF 39.– / Monat · Kreditkarte für die Testphase erforderlich',
    stageTag: 'Ihr Tag, in Cantia.',
    stageNote: 'Beispieldaten',
    stageCaption: 'Vom Kunden online unterschrieben, ohne Konto.',
    trust: ['Daten in Zürich gehostet', 'Schweizer QR-Rechnung', 'Französisch, Deutsch, Italienisch'],
    familiesEyebrow: 'Ein Geschäft. Fünf verbundene Bereiche.',
    familiesTitlePlain: 'Alles, was Ihre Projekte',
    familiesTitleAccent: 'voranbringt.',
    familiesText: 'Eine Offerte wird zum Projekt, Stunden fliessen in den Rapport, Leistungen werden zu Rechnungen. Der Zusammenhang bleibt erhalten.',
    familiesNote: 'Module je nach Bedarf und Abo.',
    allFeatures: 'Alle Funktionen ansehen',
    exportsEyebrow: 'Was Ihre Kunden erhalten',
    exportsTitlePlain: 'Dokumente in Ihrem Namen,',
    exportsTitleAccent: 'bereit zum Versand.',
    exportsText: 'Logo, Farbe, Nummerierung und eine Adresse, die ins Fensterkuvert passt. Jedes PDF hier kommt unverändert aus Cantia.',
    exportDevis: 'Online unterschriebene Offerte',
    exportDevisMeta: 'Unterschrift, Datum und Uhrzeit im PDF',
    exportFacture: 'Rechnung mit QR-Zahlteil',
    exportFactureMeta: 'Betrag, IBAN und Referenz ausgefüllt',
    assistantEyebrow: 'Der Cantia-Assistent',
    assistantTitlePlain: 'Sie haben die Worte.',
    assistantTitleAccent: 'Cantia bereitet den Rest vor.',
    assistantText: 'Eine Offerte vorbereiten, einen Rapport schreiben, eine Ausgabe erfassen. Diktieren oder schreiben Sie: Cantia hilft beim Entwurf. Sie entscheiden, was verschickt wird.',
    assistantLink: 'Den Assistenten entdecken',
    voiceTag: 'Ein Diktat-Beispiel',
    voiceQuote: '«Bereite eine Offerte für die jährliche Gartenpflege bei Favre vor.»',
    voicePlay: 'Diktat-Beispiel abspielen',
    voiceResultTitle: 'Ein Offertentwurf, zu prüfen.',
    voiceResultLine: 'Lieferung und Verlegung Parkett',
    voiceResultQty: '24 m²',
    voiceResultText: 'Kunde ergänzen, Katalogpreis prüfen, anpassen und freigeben.',
    voiceCaption: 'Illustrative Animation. Es wird kein Mikrofon aktiviert.',
    sectorTitlePlain: 'Eine Baustelle, ein Mandat,\nein Projekt.',
    sectorTitleAccent: 'Ihre Branche.',
    sectors: ['Bau & Handwerk', 'Dienstleistungen & Unterhalt', 'Ingenieurbüros', 'Agenturen & Events'],
    sectorLink: 'Ihren Einsatz finden',
    ctaTitlePlain: 'Die Fortsetzung Ihrer Projekte',
    ctaTitleAccent: 'beginnt hier.',
    ctaText: 'Testen Sie Cantia 14 Tage mit Ihrem Unternehmen.',
    ctaButton: 'Cantia testen',
    ctaMicro: 'Kreditkarte erforderlich · Keine Belastung vor Ende der Testphase',
  },
};

const it: SiteCopy = {
  nav: {
    software: 'Funzionalità',
    trade: 'Mestieri',
    pricing: 'Prezzi',
    custom: 'Su misura',
    discover: 'Risorse',
    login: 'Accedi',
    tryCta: 'Provare Cantia',
    menu: 'Aprire il menu',
    close: 'Chiudere il menu',
    home: 'Home',
    assistant: { name: 'L’assistente Cantia', text: 'Detti. Rilegga. Convalidi.' },
    allFeatures: 'Esplorare tutte le funzioni',
    devices: 'Su computer e telefono',
    ecosystem: 'Chi siamo',
    help: 'Aiuto',
    contact: 'Contatto',
    tryLong: 'Provare per 14 giorni',
    priceNote: 'Da CHF 39.– / mese · 14 giorni di prova',
  },
  families: [
    { key: 'signer', name: 'Firmare', text: 'Clienti, preventivi e firme', slug: 'signer' },
    { key: 'organiser', name: 'Organizzare', text: 'Progetti, pianificazione e documenti', slug: 'organiser' },
    { key: 'collaborer', name: 'Collaborare', text: 'Rapporti, ore e team', slug: 'collaborer' },
    { key: 'facturer', name: 'Fatturare', text: 'Fatture QR, acconti e pagamenti', slug: 'facturer' },
    { key: 'piloter', name: 'Gestire', text: 'Spese, redditività e liquidità', slug: 'piloter' },
  ],
  footer: {
    tagline: 'Il software svizzero per le aziende\nche lavorano per progetti.',
    madeIn: 'Sviluppato e ospitato in Svizzera.',
    languages: 'Français · Deutsch · Italiano',
    software: 'Funzionalità',
    company: 'Cantia',
    contact: 'Un contatto diretto',
    tradeLink: 'Mestieri',
    pricingLink: 'Prezzi & formule',
    customLink: 'Sviluppi su misura',
    ecosystemLink: 'Chi siamo',
    devicesLink: 'Computer & telefono',
    compareLink: 'Confronti',
    payments: 'Pagamenti accettati',
    talk: 'Parliamo della sua attività',
    help: 'Aiuto',
    login: 'Accedi',
    legal: 'Note legali',
    privacy: 'Privacy',
    terms: 'Condizioni generali',
  },
  home: {
    eyebrow: 'Il software gestionale svizzero',
    titlePlain: 'Il seguito logico',
    titleAccent: 'dei suoi progetti.',
    leadStrong: 'Dal preventivo alla fattura, ogni informazione trova il suo posto.',
    lead: 'Cantia collega i suoi progetti, il suo team e le sue finanze in un unico spazio.',
    tryCta: 'Provare 14 giorni',
    explore: 'Esplorare il software',
    demo: 'Vedere la demo',
    micro: 'Da CHF 39.– / mese · Carta di credito richiesta per la prova',
    stageTag: 'La vostra giornata, in Cantia.',
    stageNote: 'Dati di esempio',
    stageCaption: 'Firmato online dal cliente, senza creare un account.',
    trust: ['Dati ospitati a Zurigo', 'Fatturazione QR svizzera', 'Francese, tedesco, italiano'],
    familiesEyebrow: 'Un’attività. Cinque usi collegati.',
    familiesTitlePlain: 'Tutto ciò che fa',
    familiesTitleAccent: 'avanzare i suoi progetti.',
    familiesText: 'Un preventivo diventa un progetto, le ore entrano nel rapporto, le prestazioni diventano fatture. Il contesto resta con lei.',
    familiesNote: 'Moduli secondo le sue esigenze e la sua formula.',
    allFeatures: 'Vedere tutte le funzioni',
    exportsEyebrow: 'Ciò che ricevono i suoi clienti',
    exportsTitlePlain: 'Documenti a suo nome,',
    exportsTitleAccent: 'pronti da inviare.',
    exportsText: 'Logo, colore, numerazione e indirizzo posizionato per la busta con finestra. Ogni PDF qui accanto esce così com’è da Cantia.',
    exportDevis: 'Preventivo firmato online',
    exportDevisMeta: 'Firma, data e ora nel PDF',
    exportFacture: 'Fattura con QR-fattura',
    exportFactureMeta: 'Importo, IBAN e riferimento compilati',
    assistantEyebrow: 'L’assistente Cantia',
    assistantTitlePlain: 'Lei ha le parole.',
    assistantTitleAccent: 'Cantia prepara il seguito.',
    assistantText: 'Un preventivo da preparare, un rapporto da scrivere, una spesa da registrare. Detti o scriva: Cantia l’aiuta a strutturare la bozza. Lei decide cosa viene inviato.',
    assistantLink: 'Scoprire l’assistente',
    voiceTag: 'Un esempio di dettatura',
    voiceQuote: '«Prepara un preventivo per la manutenzione annuale del giardino dei Favre.»',
    voicePlay: 'Avviare l’esempio di dettatura',
    voiceResultTitle: 'Una bozza di preventivo, da verificare.',
    voiceResultLine: 'Fornitura e posa di parquet',
    voiceResultQty: '24 m²',
    voiceResultText: 'Completi il cliente, verifichi il prezzo del catalogo, adatti e convalidi.',
    voiceCaption: 'Animazione illustrativa. Nessun microfono viene attivato.',
    sectorTitlePlain: 'Un cantiere, un mandato,\nun progetto.',
    sectorTitleAccent: 'Il suo mestiere.',
    sectors: ['Edilizia & artigianato', 'Servizi & manutenzione', 'Studi d’ingegneria', 'Agenzie & eventi'],
    sectorLink: 'Trovare il suo uso',
    ctaTitlePlain: 'Il seguito dei suoi progetti',
    ctaTitleAccent: 'inizia qui.',
    ctaText: 'Scopra Cantia con la sua azienda per 14 giorni.',
    ctaButton: 'Provare Cantia',
    ctaMicro: 'Carta di credito richiesta · Nessun addebito prima della fine della prova',
  },
};

export const SITE_COPY: Record<SiteLocale, SiteCopy> = { fr, de, it };
