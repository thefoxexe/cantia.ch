import { getAppLocale } from './translations';

// Fallback messages of the data layer (errors returned when the server gave
// none, file checks, labels used in exports). Written in French at the call
// site and looked up here for German and Italian; {{name}} placeholders are
// filled from `vars`. A message missing from the table stays French.

const TEXT: Record<string, { de: string; it: string }> = {
  // Bank statements
  "Ce fichier n'est pas un XML valide.": { de: 'Diese Datei ist kein gültiges XML.', it: 'Questo file non è un XML valido.' },
  'Ce fichier ne ressemble pas à un relevé bancaire ISO 20022 (élément racine <Document> introuvable).': {
    de: 'Diese Datei sieht nicht wie ein ISO-20022-Kontoauszug aus (Wurzelelement <Document> nicht gefunden).',
    it: 'Questo file non sembra un estratto conto ISO 20022 (elemento radice <Document> non trovato).',
  },
  'Ce fichier ne correspond ni à un camt.053 ni à un camt.054 (message racine reconnu introuvable).': {
    de: 'Diese Datei ist weder ein camt.053 noch ein camt.054 (keine bekannte Wurzelnachricht gefunden).',
    it: 'Questo file non è né un camt.053 né un camt.054 (nessun messaggio radice riconosciuto).',
  },
  'Aucun relevé exploitable trouvé dans ce fichier.': { de: 'In dieser Datei wurde kein verwertbarer Auszug gefunden.', it: 'Nessun estratto utilizzabile trovato in questo file.' },
  'Aucune écriture exploitable trouvée dans ce relevé.': { de: 'In diesem Auszug wurde keine verwertbare Buchung gefunden.', it: 'Nessuna registrazione utilizzabile trovata in questo estratto.' },
  'Import impossible': { de: 'Import nicht möglich', it: 'Importazione impossibile' },
  'Dépense non créée': { de: 'Ausgabe nicht erstellt', it: 'Spesa non creata' },
  'Dépense créée pour "{{label}}" mais non comptabilisée automatiquement (configuration comptable incomplète : exercice ouvert ou mapping de compte manquant) — à vérifier manuellement dans Comptabilité.': {
    de: 'Ausgabe für «{{label}}» erstellt, aber nicht automatisch verbucht (Buchhaltung unvollständig eingerichtet: offenes Geschäftsjahr oder Kontozuordnung fehlt) – bitte in der Buchhaltung manuell prüfen.',
    it: 'Spesa creata per «{{label}}» ma non contabilizzata automaticamente (configurazione contabile incompleta: esercizio aperto o abbinamento del conto mancante) — da verificare manualmente in Contabilità.',
  },
  // Métrés, plans, imports
  'Métré introuvable': { de: 'Ausmass nicht gefunden', it: 'Computo non trovato' },
  'Création du devis impossible': { de: 'Offerte konnte nicht erstellt werden', it: 'Impossibile creare il preventivo' },
  'Disponible sur ordinateur.': { de: 'Auf dem Computer verfügbar.', it: 'Disponibile sul computer.' },
  'Export disponible sur ordinateur.': { de: 'Export auf dem Computer verfügbar.', it: 'Esportazione disponibile sul computer.' },
  'Disponible sur ordinateur (navigateur) uniquement.': { de: 'Nur auf dem Computer (Browser) verfügbar.', it: 'Disponibile solo sul computer (browser).' },
  'Ce métré n’a pas de PDF de soumission d’origine.': { de: 'Dieses Ausmass hat kein ursprüngliches Ausschreibungs-PDF.', it: 'Questo computo non ha un PDF di capitolato originale.' },
  'PDF d’origine introuvable.': { de: 'Ursprüngliches PDF nicht gefunden.', it: 'PDF originale non trovato.' },
  'Ce scan a été importé avant la lecture des cases : réimportez la soumission pour obtenir le PDF rempli, ou utilisez l’export Excel.': {
    de: 'Dieser Scan wurde vor dem Lesen der Felder importiert: Importieren Sie die Ausschreibung erneut, um das ausgefüllte PDF zu erhalten, oder verwenden Sie den Excel-Export.',
    it: 'Questa scansione è stata importata prima della lettura delle caselle: reimportate il capitolato per ottenere il PDF compilato, oppure usate l’esportazione Excel.',
  },
  'Ce fichier n’est pas un PDF.': { de: 'Diese Datei ist kein PDF.', it: 'Questo file non è un PDF.' },
  'Envoi impossible': { de: 'Senden nicht möglich', it: 'Invio impossibile' },
  'Enregistrement du fichier impossible': { de: 'Datei konnte nicht gespeichert werden', it: 'Impossibile salvare il file' },
  'Création du plan impossible': { de: 'Plan konnte nicht erstellt werden', it: 'Impossibile creare il piano' },
  'Création de la révision impossible': { de: 'Revision konnte nicht erstellt werden', it: 'Impossibile creare la revisione' },
  'Plan introuvable': { de: 'Plan nicht gefunden', it: 'Piano non trovato' },
  'Création de l’import impossible': { de: 'Import konnte nicht erstellt werden', it: 'Impossibile creare l’importazione' },
  'Impossible de charger le lecteur PDF. Vérifiez votre connexion.': { de: 'Der PDF-Leser konnte nicht geladen werden. Prüfen Sie Ihre Verbindung.', it: 'Impossibile caricare il lettore PDF. Verificate la connessione.' },
  'Impossible de charger l’outil PDF. Vérifiez votre connexion.': { de: 'Das PDF-Werkzeug konnte nicht geladen werden. Prüfen Sie Ihre Verbindung.', it: 'Impossibile caricare lo strumento PDF. Verificate la connessione.' },
  'PDF scanné trop long pour la lecture automatique (80 pages au maximum).': { de: 'Gescanntes PDF zu lang für das automatische Lesen (maximal 80 Seiten).', it: 'PDF scansionato troppo lungo per la lettura automatica (massimo 80 pagine).' },
  'Lecture impossible': { de: 'Lesen nicht möglich', it: 'Lettura impossibile' },
  // Catalog import
  'Le fichier est vide ou ne contient aucune ligne de données.': { de: 'Die Datei ist leer oder enthält keine Datenzeilen.', it: 'Il file è vuoto o non contiene righe di dati.' },
  'Impossible de détecter une colonne de titre ou de description dans ce fichier.': { de: 'In dieser Datei wurde keine Titel- oder Beschreibungsspalte erkannt.', it: 'Impossibile rilevare una colonna di titolo o descrizione in questo file.' },
  'Impossible de détecter une colonne de désignation dans ce fichier.': { de: 'In dieser Datei wurde keine Bezeichnungsspalte erkannt.', it: 'Impossibile rilevare una colonna di designazione in questo file.' },
  // Uploads, feed, reports
  'Échec du téléversement': { de: 'Hochladen fehlgeschlagen', it: 'Caricamento non riuscito' },
  'Upload failed': { de: 'Hochladen fehlgeschlagen', it: 'Caricamento non riuscito' },
  "Échec de l'envoi de la photo": { de: 'Foto konnte nicht gesendet werden', it: 'Invio della foto non riuscito' },
  "Échec de l'envoi du message vocal": { de: 'Sprachnachricht konnte nicht gesendet werden', it: 'Invio del messaggio vocale non riuscito' },
  'Échec de la création du rapport': { de: 'Bericht konnte nicht erstellt werden', it: 'Creazione del rapporto non riuscita' },
  'échec de la rédaction IA': { de: 'KI-Formulierung fehlgeschlagen', it: 'redazione IA non riuscita' },
  'Rapport créé avec les notes brutes (non reformulées) : {{reason}}. Vous pouvez réessayer depuis la fiche du rapport.': {
    de: 'Bericht mit den Rohnotizen (nicht umformuliert) erstellt: {{reason}}. Sie können es im Bericht erneut versuchen.',
    it: 'Rapporto creato con le note grezze (non riformulate): {{reason}}. Potete riprovare dalla scheda del rapporto.',
  },
  'Rapport créé, mais la génération du PDF a échoué : {{reason}}': {
    de: 'Bericht erstellt, aber die PDF-Erstellung ist fehlgeschlagen: {{reason}}',
    it: 'Rapporto creato, ma la generazione del PDF non è riuscita: {{reason}}',
  },
  'Photo en attente introuvable dans le stockage local.': { de: 'Wartendes Foto im lokalen Speicher nicht gefunden.', it: 'Foto in attesa non trovata nella memoria locale.' },
  // Payments
  'Sous-traitant': { de: 'Subunternehmer', it: 'Subappaltatore' },
  'Employé': { de: 'Mitarbeiter/in', it: 'Dipendente' },
  'IBAN manquant ou invalide pour {{name}}': { de: 'IBAN fehlt oder ist ungültig für {{name}}', it: 'IBAN mancante o non valido per {{name}}' },
  "IBAN de l'entreprise manquant ou invalide (Compte > Entreprise)": { de: 'IBAN des Unternehmens fehlt oder ist ungültig (Konto > Unternehmen)', it: "IBAN dell'azienda mancante o non valido (Conto > Azienda)" },
  'Sélectionnez au moins un paiement': { de: 'Wählen Sie mindestens eine Zahlung aus', it: 'Selezionate almeno un pagamento' },
  "La date d'exécution ne peut pas être dans le passé": { de: 'Das Ausführungsdatum darf nicht in der Vergangenheit liegen', it: "La data di esecuzione non può essere nel passato" },
  'Ordre de paiement non créé': { de: 'Zahlungsauftrag nicht erstellt', it: 'Ordine di pagamento non creato' },
  // Invoices, quotes, situations
  'Facture': { de: 'Rechnung', it: 'Fattura' },
  'Facture introuvable': { de: 'Rechnung nicht gefunden', it: 'Fattura non trovata' },
  'Montant de frais invalide.': { de: 'Ungültiger Gebührenbetrag.', it: 'Importo delle spese non valido.' },
  'Échec de la création de la facture.': { de: 'Rechnung konnte nicht erstellt werden.', it: 'Creazione della fattura non riuscita.' },
  'Échec de la création.': { de: 'Erstellen fehlgeschlagen.', it: 'Creazione non riuscita.' },
  'Devis introuvable': { de: 'Offerte nicht gefunden', it: 'Preventivo non trovato' },
  'Ce devis ne contient aucune ligne à suivre.': { de: 'Diese Offerte enthält keine zu verfolgende Position.', it: 'Questo preventivo non contiene righe da seguire.' },
  'Échec de la création de la situation': { de: 'Akontorechnung konnte nicht erstellt werden', it: 'Creazione della situazione non riuscita' },
  // Accounting closing
  'Aucun journal comptable : créez d’abord la comptabilité (Comptabilité › Paramètres).': {
    de: 'Kein Buchungsjournal: Richten Sie zuerst die Buchhaltung ein (Buchhaltung › Einstellungen).',
    it: 'Nessun giornale contabile: create prima la contabilità (Contabilità › Impostazioni).',
  },
  'Compte {{code}} introuvable dans votre plan comptable.': { de: 'Konto {{code}} in Ihrem Kontenplan nicht gefunden.', it: 'Conto {{code}} non trovato nel vostro piano dei conti.' },
  'Écriture non créée': { de: 'Buchung nicht erstellt', it: 'Registrazione non creata' },
  // Integrations, roles, payroll exports
  'Impossible de démarrer la connexion Bexio.': { de: 'Die Bexio-Verbindung konnte nicht gestartet werden.', it: 'Impossibile avviare la connessione Bexio.' },
  'Connexion impossible.': { de: 'Verbindung nicht möglich.', it: 'Connessione impossibile.' },
  'Limite de {{max}} rôles atteinte pour votre offre. Passez à Équipe pour créer des rôles personnalisés en nombre illimité.': {
    de: 'Grenze von {{max}} Rollen für Ihr Abo erreicht. Wechseln Sie zu Team, um unbegrenzt eigene Rollen zu erstellen.',
    it: 'Limite di {{max}} ruoli raggiunto per il vostro piano. Passate a Team per creare ruoli personalizzati illimitati.',
  },
  'Sans chantier': { de: 'Ohne Baustelle', it: 'Senza cantiere' },
  'Non précisé': { de: 'Nicht angegeben', it: 'Non specificato' },
};

export function apiText(fr: string, vars?: Record<string, string | number>): string {
  const lang = getAppLocale();
  const entry = lang === 'de' || lang === 'it' ? TEXT[fr] : undefined;
  let text = entry ? entry[lang as 'de' | 'it'] : fr;
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.split(`{{${k}}}`).join(String(v));
  return text;
}
