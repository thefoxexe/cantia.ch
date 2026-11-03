// Meta descriptions rewritten to 140–155 characters (Google cuts longer ones
// and fills shorter ones with page text). They replace the description of the
// same path in ROUTES (scripts/seo-routes.mjs), including the routes that are
// generated from the trade and help data. Each one only restates what its page
// already says.
export const DESCRIPTION_OVERRIDES = {
  // ─── Français ─────────────────────────────────────────────────────────────
  tarifs:
    'Tarifs de Cantia, le logiciel suisse de gestion pour le bâtiment : devis et factures illimités sur chaque formule, sans engagement, 14 jours d’essai.',
  'outils/calcul-taux-horaire':
    'Calculez le taux horaire à facturer : salaires, 13e, charges sociales, frais généraux et marge. Calculateur gratuit pour les entreprises du bâtiment.',
  'calculateur-salaire':
    'Calculez le salaire net et le coût employeur en Suisse : AVS, AC, LPP selon l’âge, LAA, allocations et impôt à la source par canton. Montants 2026.',
  'solutions/dictee-vocale':
    'Dictez vos devis, vos rapports de chantier et vos messages d’équipe au lieu de les taper au clavier : le bouton dicter fonctionne partout dans Cantia.',
  'solutions/planning':
    'Un vrai calendrier d’équipe dans Cantia : chaque membre, chaque chantier, chaque jour. Fini les plannings sur papier ou dans des groupes WhatsApp.',
  'solutions/rh-salaires':
    'Vos employés pointent leurs heures par chantier et leurs frais ; la fiche de salaire de toute l’équipe se gère du brut au net, au même endroit.',
  'solutions/travaux-supplementaires':
    'Chaque extra demandé sur le chantier devient un document daté, signé en ligne par le client, puis transformé en facture. Plus d’extras oubliés.',
  'solutions/soumissions':
    'Importez la soumission de l’architecte, saisissez vos prix et renvoyez le PDF d’origine rempli : prix unitaires, montants, reports et totaux.',
  integrations:
    'Cantia se connecte à votre comptabilité Bexio : clients et articles importés, factures envoyées en un clic et statuts de paiement synchronisés.',
  'sur-mesure':
    'Un workflow, une automatisation ou une intégration propre à votre entreprise : Cantia les développe en plus des modules standards, pour vous seul.',
  facadier:
    'Surfaces, variantes et avancement de chaque chantier : Cantia est le logiciel de gestion des entreprises de façade en Suisse, du devis à la facture.',
  'entreprise-nettoyage':
    'Devis d’entretien, planning des équipes, heures par client, rapports photo et factures QR : le logiciel de gestion des entreprises de nettoyage.',
  demenageur:
    'Devis de déménagement, planning des équipes et des véhicules, état des lieux en photos et factures QR : Cantia simplifie la gestion des déménageurs.',
  informaticien:
    'Offres, heures par mandat, contrats de support et factures QR : Cantia aide les informaticiens indépendants et les PME IT à facturer chaque heure.',
  traiteur:
    'Offres par événement, acomptes, planning du personnel, salaires et factures QR : Cantia simplifie la gestion des traiteurs et des entreprises d’événements.',
  telechargement:
    'Cantia fonctionne dans le navigateur, sur ordinateur comme sur téléphone, sans rien installer. Les applications natives iOS et Android arrivent bientôt.',
  'mentions-legales':
    'Mentions légales de Cantia, logiciel suisse de gestion pour les entreprises du bâtiment : éditeur du site, hébergement, propriété intellectuelle, contact.',
  confidentialite:
    'Politique de confidentialité de Cantia : données collectées, sous-traitants, hébergement en Suisse, cookies, durée de conservation et vos droits.',
  'conditions-generales':
    'Conditions générales d’utilisation et de vente de Cantia : essai gratuit, abonnement et paiement, résiliation, disponibilité et droit applicable.',
  contact:
    'Une question, un problème ou une suggestion ? Écrivez à l’équipe Cantia par le formulaire ou à info@cantia.ch : réponse sous 24 heures ouvrées.',

  // ─── Deutsch ──────────────────────────────────────────────────────────────
  'de/solutions/dictee-vocale':
    'Diktieren Sie Offerten, Baustellenrapporte und Team-Nachrichten, statt sie zu tippen: Die Diktierfunktion steht Ihnen überall in Cantia zur Verfügung.',
  'de/solutions/planning':
    'Ein echter Team-Kalender in Cantia: jedes Mitglied, jede Baustelle, jeder Tag. Schluss mit Plänen auf Papier oder in WhatsApp-Gruppen im Handwerk.',
  'de/solutions/rentabilite':
    'Vergleichen Sie die angenommene Offerte mit den tatsächlichen Kosten für Material und Arbeitszeit und sehen Sie, ob jede Baustelle rentabel ist.',
  'de/solutions/rh-salaires':
    'Ihre Mitarbeitenden erfassen Stunden pro Baustelle und Spesen; die Lohnabrechnung des ganzen Teams verwalten Sie vom Brutto- bis zum Nettolohn.',
  'de/solutions/soumissions':
    'Leistungsverzeichnis des Architekten importieren, Preise eingeben und das ausgefüllte Original-PDF zurücksenden: Einheitspreise, Beträge, Totale.',
  'de/solutions/travaux-supplementaires':
    'Jede Zusatzleistung auf der Baustelle wird zum datierten Dokument, das der Kunde online unterzeichnet und das zur Rechnung wird. Nichts geht vergessen.',
  'de/integrations':
    'Cantia verbindet sich mit Ihrer Bexio-Buchhaltung: Kunden und Artikel importiert, Rechnungen mit einem Klick versendet, Zahlungsstatus synchronisiert.',
  'de/sur-mesure':
    'Ein Workflow, eine Automatisierung oder eine Integration nur für Ihr Unternehmen: Cantia entwickelt sie zusätzlich zu den Standardmodulen für Sie.',
  'de/peintre':
    'Maler-Offerten schneller erstellen und Flächen, Teams und Zusatzarbeiten im Blick behalten: mit Cantia, der Verwaltungssoftware für die Schweiz.',
  'de/paysagiste':
    'Mobile Teams, Gestaltungsbaustellen und Unterhaltsverträge im Griff: Cantia ist die Verwaltungssoftware für Garten- und Landschaftsbauer der Schweiz.',
  'de/etancheur':
    'Einsätze präzise dokumentieren, Offerten und QR-Rechnungen erstellen: Cantia ist die Verwaltungssoftware für Abdichtungsunternehmen in der Schweiz.',
  'de/entreprise-nettoyage':
    'Offerten für Unterhaltsreinigung, Einsatzplanung, Stunden pro Kunde, Fotorapporte und QR-Rechnungen: die Verwaltungssoftware für Reinigungsfirmen.',
  'de/conciergerie':
    'Einsätze, Regiearbeiten, Fotorapporte, Stunden pro Liegenschaft und QR-Rechnungen: Cantia unterstützt Hauswartungen und Facility-Management-Firmen.',
  'de/garagiste':
    'Reparaturofferten, Werkstattstunden, Schadenfotos, Zusatzarbeiten und QR-Rechnungen: Cantia vereinfacht die Verwaltung von Garagen und Carrosserien.',
  'de/informaticien':
    'Offerten, Stunden pro Mandat, Einsätze, Supportverträge und QR-Rechnungen: Cantia hilft selbständigen Informatikern und IT-KMU, jede Stunde zu verrechnen.',
  'de/graphiste':
    'Offerten, Zeiterfassung pro Projekt, verrechenbare Korrekturschlaufen, QR-Rechnungen und Mahnungen: Cantia für Grafiker und Kommunikationsagenturen.',
  'de/traiteur':
    'Offerten pro Anlass, Anzahlungen, Personalplanung, Löhne und QR-Rechnungen: Cantia vereinfacht die Verwaltung von Caterern und Eventfirmen der Schweiz.',
  'de/consultant':
    'Offerten, Mandate, Zeiterfassung, diktierte Notizen, QR-Rechnungen und MWST: Cantia unterstützt selbständige Berater und Beratungsfirmen der Schweiz.',
  'de/telechargement':
    'Cantia läuft im Browser, auf dem Computer wie auf dem Telefon, ohne Installation. Native Apps für iOS und Android sind in Vorbereitung und folgen bald.',
  'de/mentions-legales':
    'Impressum von Cantia, der Schweizer Verwaltungssoftware für Bauunternehmen: Herausgeber der Website, Hosting, geistiges Eigentum, Haftung und Kontakt.',
  'de/confidentialite':
    'Datenschutzerklärung von Cantia: erhobene Daten, Auftragsverarbeiter, Hosting in der Schweiz, Cookies, Aufbewahrungsdauer und Ihre Rechte im Überblick.',
  'de/conditions-generales':
    'Allgemeine Geschäftsbedingungen von Cantia: kostenlose Testphase, Abonnement und Zahlung, Kündigung, Verfügbarkeit des Dienstes und anwendbares Recht.',
  'de/calculateur-salaire':
    'Nettolohn und Arbeitgeberkosten in der Schweiz berechnen: AHV, ALV, BVG nach Alter, UVG, Familienzulagen und Quellensteuer nach Kanton. Werte 2026.',
  'de/contact':
    'Eine Frage, ein Problem oder ein Vorschlag? Schreiben Sie dem Cantia-Team über das Formular oder an info@cantia.ch: Antwort innert 24 Werkstunden.',

  // ─── Italiano ─────────────────────────────────────────────────────────────
  'it/solutions/facturation':
    'Ogni fattura Cantia contiene la fattura QR svizzera conforme, con IBAN, riferimento e importo già codificati: il cliente paga con una semplice scansione.',
  'it/solutions/dictee-vocale':
    'Detti preventivi, rapporti di cantiere e messaggi di squadra invece di digitarli: la dettatura vocale è disponibile in tutte le schermate di Cantia.',
  'it/solutions/planning':
    'Un vero calendario di squadra in Cantia: ogni membro, ogni cantiere, ogni giorno. Basta con i planning su carta o nei gruppi WhatsApp della squadra.',
  'it/solutions/rh-salaires':
    'I dipendenti registrano ore per cantiere e spese; la busta paga di tutta la squadra si gestisce dal lordo al netto, nello stesso posto, con Cantia.',
  'it/solutions/soumissions':
    'Importi il capitolato dell’architetto, inserisca i prezzi e rinvii il PDF originale compilato: prezzi unitari, importi, riporti e totali calcolati.',
  'it/solutions/travaux-supplementaires':
    'Ogni extra richiesto in cantiere diventa un documento datato, firmato online dal cliente e trasformato in fattura. Nessun extra dimenticato o contestato.',
  'it/integrations':
    'Cantia si collega alla Sua contabilità Bexio: clienti e articoli importati, fatture inviate con un clic e stati di pagamento sincronizzati in automatico.',
  'it/sur-mesure':
    'Un flusso di lavoro, un’automazione o un’integrazione solo per la Sua azienda: Cantia li sviluppa in aggiunta ai moduli standard, su misura per Lei.',
  'it/peintre':
    'Prepari i preventivi di pittura più in fretta e segua superfici, squadre e lavori supplementari con Cantia, il software pensato per la Svizzera.',
  'it/paysagiste':
    'Squadre mobili, cantieri di sistemazione e contratti di manutenzione sotto controllo con Cantia, il software di gestione per la paesaggistica in Svizzera.',
  'it/facadier':
    'Superfici, varianti e avanzamento di ogni cantiere: Cantia è il software di gestione per le imprese di facciate in Svizzera, dal preventivo alla fattura.',
  'it/vitrier':
    'Misure, ordini, posa e interventi organizzati con Cantia, il software di gestione per le vetrerie in Svizzera, con preventivi e fatture QR insieme.',
  'it/echafaudeur':
    'Montaggio, smontaggio e squadre organizzati con Cantia, il software di gestione per le imprese di ponteggi in Svizzera, dal preventivo alla fattura QR.',
  'it/entreprise-nettoyage':
    'Preventivi di manutenzione, pianificazione delle squadre, ore per cliente, rapporti con foto e fatture QR: il software per le imprese di pulizia svizzere.',
  'it/demenageur':
    'Preventivi di trasloco, pianificazione di squadre e veicoli, stato dei beni in foto e fatture QR: Cantia semplifica la gestione delle imprese di traslochi.',
  'it/telechargement':
    'Cantia funziona nel browser, su computer come su telefono, senza installare nulla. Le app native per iOS e Android sono in preparazione e arrivano presto.',
  'it/mentions-legales':
    'Note legali di Cantia, il software svizzero di gestione per le imprese edili: editore del sito, hosting, proprietà intellettuale, responsabilità, contatto.',
  'it/confidentialite':
    'Informativa sulla privacy di Cantia: dati raccolti, responsabili del trattamento, hosting in Svizzera, cookie, durata di conservazione e i Suoi diritti.',
  'it/conditions-generales':
    'Condizioni generali di utilizzo e di vendita di Cantia: prova gratuita, abbonamento e pagamento, disdetta, disponibilità e diritto applicabile.',
  'it/calculateur-salaire':
    'Calcoli il salario netto e il costo per il datore di lavoro in Svizzera: AVS, AD, LPP secondo l’età, LAINF, assegni familiari e imposta alla fonte. 2026.',
  'it/contact':
    'Una domanda, un problema o un suggerimento? Scriva al team Cantia tramite il modulo o all’indirizzo info@cantia.ch: risposta entro 24 ore lavorative.',
};
