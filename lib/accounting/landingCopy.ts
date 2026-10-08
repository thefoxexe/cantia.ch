import { useAccCopy } from './locale';
import type { AccLocale } from './copy';

// Sections of the accounting.cantia.ch landing that present the whole
// firm workspace: the two kinds of clients, every tool, and a quarter from
// the receipt to the VAT return (components/accounting/AccountingLanding.tsx).

const fr = {
  kinds: {
    eyebrow: 'Tous vos mandants',
    title: 'Sur Cantia ou pas, tout le dossier au même endroit',
    cantia: {
      label: 'Client sur Cantia',
      title: 'Ses données arrivent seules',
      items: [
        'Factures, paiements, écritures et justificatifs à jour, sans envoi par e-mail',
        'Il choisit ce que vous voyez, et retire l’accès quand il veut',
        'Vous lui proposez une écriture : il l’accepte en un clic',
        'Indicateurs calculés sur sa comptabilité',
      ],
    },
    external: {
      label: 'Client sur un autre logiciel',
      title: 'Vous tenez ses livres dans Cantia',
      items: [
        'Plan comptable PME suisse en français, allemand ou italien, ou le sien importé',
        'Reprise des écritures et des soldes depuis Banana, Abacus, Winbiz ou Excel',
        'Un lien privé : il dépose ses pièces et signe, sans créer de compte',
        'Décompte TVA, bouclement et comptes annuels prêts à signer',
      ],
    },
  },
  features: {
    eyebrow: 'Tout le métier',
    title: 'Ce que fait votre espace',
    items: [
      { icon: 'edit-3', title: 'Saisie rapide avec TVA', text: 'Débit, crédit, montant : la TVA se sépare toute seule (8,1 %, 2,6 %, 3,8 %). Pièce suivante prête, comptes proposés pendant la frappe.' },
      { icon: 'upload', title: 'Import Banana, Abacus, Winbiz', text: 'Écritures, plan comptable et soldes d’ouverture. Aperçu avant import, écritures déséquilibrées signalées à la ligne près.' },
      { icon: 'percent', title: 'Décompte TVA de l’AFC', text: 'Le formulaire chiffre par chiffre, contrôlé contre les comptes 2200, 1170 et 1171, et le fichier eCH-0217 pour l’ePortal.' },
      { icon: 'archive', title: 'Bouclement en un clic', text: 'Contrôles, résultat au 2979, report au 2970, exercice verrouillé. Comptes annuels avec l’exercice précédent, prêts à imprimer.' },
      { icon: 'book-open', title: 'Journal, grand livre, balance', text: 'Recherche par libellé, pièce ou montant. Modifications et extournes tracées, périodes verrouillées : rien n’est jamais effacé.' },
      { icon: 'lock', title: 'Lien privé du client', text: 'Il envoie ses relevés, répond à vos demandes et signe ses comptes depuis son téléphone. Preuve conservée : nom, date, empreinte du document.' },
      { icon: 'check-square', title: 'Travaux et checklists', text: 'Bouclement, TVA, salaires : vos modèles d’étapes, assignés dans l’équipe, avec l’avancement de chaque dossier.' },
      { icon: 'clock', title: 'Temps et honoraires', text: 'Le temps de chaque collaborateur par mandant, au tarif du client. Ce qui reste à facturer, d’un coup d’œil.' },
      { icon: 'bar-chart-2', title: 'Indicateurs et portefeuille', text: 'Chiffre d’affaires, EBITDA, EBIT, liquidités, quick ratio, fonds propres. Tous vos mandants sur une seule page.' },
      { icon: 'calendar', title: 'Échéances de chaque dossier', text: 'TVA, AVS, certificats de salaire, impôts, bouclement : calculés pour chaque mandant et cochés quand c’est fait.' },
      { icon: 'download', title: 'Exports vers le logiciel du client', text: 'Écritures et soldes au format Banana, Abacus ou Winbiz, pour un client qui garde son outil.' },
      { icon: 'award', title: 'Votre marque, votre annuaire', text: 'Logo et couleur sur les e-mails et le lien privé. Profil public dans l’annuaire des fiduciaires de Cantia.' },
    ] as { icon: string; title: string; text: string }[],
  },
  flow: {
    eyebrow: 'Un trimestre',
    title: 'De la pièce au décompte TVA',
    steps: [
      { title: 'Le client dépose', text: 'Vous demandez les relevés du trimestre : il les envoie par son lien privé.' },
      { title: 'Vous saisissez ou importez', text: 'Écriture par écriture avec la TVA séparée, ou tout le fichier de son ancien logiciel.' },
      { title: 'Cantia remplit le formulaire', text: 'Chiffres 200 à 500, contrôlés contre la comptabilité. Vous complétez les chiffres manuels.' },
      { title: 'Vous déposez', text: 'Fichier eCH-0217 pour l’ePortal, écriture de décompte passée, échéance cochée, période verrouillée.' },
    ],
    preview: {
      title: 'Décompte TVA · 3e trimestre 2026',
      example: 'Exemple',
      rows: [
        ['200', 'Total des contre-prestations', '126’480.00'],
        ['299', 'Chiffre d’affaires imposable', '126’480.00'],
        ['303', 'Taux normal 8,1 %', '10’244.88'],
        ['400', 'Impôt préalable, matériel et prestations', '3’120.40'],
        ['405', 'Impôt préalable, investissements', '486.00'],
      ],
      total: ['500', 'Montant à payer', '6’638.48'],
      checks: ['TVA due comptabilisée (2200) concordante', 'Impôt préalable (1170 / 1171) concordant'],
      xml: 'Fichier eCH-0217',
      file: 'Déposer le décompte',
    },
  },
};

type Copy = typeof fr;

const de: Copy = {
  kinds: {
    eyebrow: 'Alle Ihre Mandanten',
    title: 'Mit oder ohne Cantia, das ganze Dossier an einem Ort',
    cantia: {
      label: 'Kunde auf Cantia',
      title: 'Seine Daten kommen von selbst',
      items: [
        'Aktuelle Rechnungen, Zahlungen, Buchungen und Belege, ohne Versand per E-Mail',
        'Er wählt, was Sie sehen, und widerruft den Zugriff jederzeit',
        'Sie schlagen eine Buchung vor: Er nimmt sie mit einem Klick an',
        'Kennzahlen aus seiner Buchhaltung',
      ],
    },
    external: {
      label: 'Kunde mit anderer Software',
      title: 'Sie führen seine Bücher in Cantia',
      items: [
        'Schweizer KMU-Kontenrahmen auf Deutsch, Französisch oder Italienisch, oder sein eigener importiert',
        'Übernahme von Buchungen und Saldi aus Banana, Abacus, Winbiz oder Excel',
        'Ein privater Link: Er lädt Belege hoch und unterzeichnet, ohne Konto',
        'MWST-Abrechnung, Abschluss und Jahresrechnung bereit zur Unterschrift',
      ],
    },
  },
  features: {
    eyebrow: 'Das ganze Handwerk',
    title: 'Was Ihr Bereich kann',
    items: [
      { icon: 'edit-3', title: 'Schnellerfassung mit MWST', text: 'Soll, Haben, Betrag: Die MWST wird selbst ausgeschieden (8,1 %, 2,6 %, 3,8 %). Nächster Beleg bereit, Konten werden beim Tippen vorgeschlagen.' },
      { icon: 'upload', title: 'Import aus Banana, Abacus, Winbiz', text: 'Buchungen, Kontenplan und Eröffnungssaldi. Vorschau vor dem Import, unausgeglichene Buchungen zeilengenau gemeldet.' },
      { icon: 'percent', title: 'MWST-Abrechnung der ESTV', text: 'Das Formular Ziffer für Ziffer, geprüft gegen die Konten 2200, 1170 und 1171, und die eCH-0217-Datei für das ePortal.' },
      { icon: 'archive', title: 'Abschluss mit einem Klick', text: 'Kontrollen, Ergebnis auf 2979, Vortrag auf 2970, Jahr gesperrt. Jahresrechnung mit Vorjahr, druckbereit.' },
      { icon: 'book-open', title: 'Journal, Hauptbuch, Saldobilanz', text: 'Suche nach Text, Beleg oder Betrag. Änderungen und Stornos nachvollziehbar, Perioden gesperrt: Nichts wird je gelöscht.' },
      { icon: 'lock', title: 'Privater Link des Kunden', text: 'Er sendet Auszüge, beantwortet Ihre Anfragen und unterzeichnet die Jahresrechnung vom Handy aus. Nachweis gespeichert: Name, Datum, Fingerabdruck des Dokuments.' },
      { icon: 'check-square', title: 'Arbeiten und Checklisten', text: 'Abschluss, MWST, Löhne: Ihre Vorlagen mit Schritten, im Team zugewiesen, mit dem Stand jedes Dossiers.' },
      { icon: 'clock', title: 'Zeit und Honorare', text: 'Die Zeit jeder Mitarbeiterin und jedes Mitarbeiters pro Mandant, zum Kundentarif. Was noch zu fakturieren ist, auf einen Blick.' },
      { icon: 'bar-chart-2', title: 'Kennzahlen und Portfolio', text: 'Umsatz, EBITDA, EBIT, Liquidität, Quick Ratio, Eigenkapital. Alle Mandanten auf einer Seite.' },
      { icon: 'calendar', title: 'Fristen jedes Dossiers', text: 'MWST, AHV, Lohnausweise, Steuern, Abschluss: für jeden Mandanten berechnet und abgehakt, wenn erledigt.' },
      { icon: 'download', title: 'Exporte in die Software des Kunden', text: 'Buchungen und Saldi im Format Banana, Abacus oder Winbiz, für Kunden, die ihr Tool behalten.' },
      { icon: 'award', title: 'Ihre Marke, Ihr Verzeichnis', text: 'Logo und Farbe auf den E-Mails und dem privaten Link. Öffentliches Profil im Treuhandverzeichnis von Cantia.' },
    ],
  },
  flow: {
    eyebrow: 'Ein Quartal',
    title: 'Vom Beleg zur MWST-Abrechnung',
    steps: [
      { title: 'Der Kunde lädt hoch', text: 'Sie fordern die Auszüge des Quartals an: Er sendet sie über seinen privaten Link.' },
      { title: 'Sie erfassen oder importieren', text: 'Buchung für Buchung mit ausgeschiedener MWST, oder die ganze Datei der bisherigen Software.' },
      { title: 'Cantia füllt das Formular aus', text: 'Ziffern 200 bis 500, geprüft gegen die Buchhaltung. Sie ergänzen die manuellen Ziffern.' },
      { title: 'Sie reichen ein', text: 'eCH-0217-Datei für das ePortal, Abrechnungsbuchung erstellt, Frist abgehakt, Periode gesperrt.' },
    ],
    preview: {
      title: 'MWST-Abrechnung · 3. Quartal 2026',
      example: 'Beispiel',
      rows: [
        ['200', 'Total der Entgelte', '126’480.00'],
        ['299', 'Steuerbarer Gesamtumsatz', '126’480.00'],
        ['303', 'Normalsatz 8,1 %', '10’244.88'],
        ['400', 'Vorsteuer Material und Dienstleistungen', '3’120.40'],
        ['405', 'Vorsteuer Investitionen', '486.00'],
      ],
      total: ['500', 'Zu bezahlender Betrag', '6’638.48'],
      checks: ['Verbuchte MWST (2200) stimmt überein', 'Vorsteuer (1170 / 1171) stimmt überein'],
      xml: 'eCH-0217-Datei',
      file: 'Abrechnung einreichen',
    },
  },
};

const it: Copy = {
  kinds: {
    eyebrow: 'Tutti i suoi mandanti',
    title: 'Su Cantia o no, tutto il dossier in un solo posto',
    cantia: {
      label: 'Cliente su Cantia',
      title: 'I suoi dati arrivano da soli',
      items: [
        'Fatture, pagamenti, registrazioni e giustificativi aggiornati, senza invii per e-mail',
        'Sceglie cosa vede lei e revoca l’accesso quando vuole',
        'Lei propone una registrazione: lui la accetta con un clic',
        'Indicatori calcolati sulla sua contabilità',
      ],
    },
    external: {
      label: 'Cliente con un altro software',
      title: 'Lei tiene i suoi libri in Cantia',
      items: [
        'Piano contabile PMI svizzero in italiano, francese o tedesco, o il suo importato',
        'Ripresa di registrazioni e saldi da Banana, Abacus, Winbiz o Excel',
        'Un link privato: carica i documenti e firma, senza creare un account',
        'Rendiconto IVA, chiusura e conti annuali pronti da firmare',
      ],
    },
  },
  features: {
    eyebrow: 'Tutto il mestiere',
    title: 'Cosa fa il suo spazio',
    items: [
      { icon: 'edit-3', title: 'Registrazione rapida con IVA', text: 'Dare, avere, importo: l’IVA si separa da sola (8,1 %, 2,6 %, 3,8 %). Giustificativo successivo pronto, conti proposti durante la digitazione.' },
      { icon: 'upload', title: 'Importazione da Banana, Abacus, Winbiz', text: 'Registrazioni, piano contabile e saldi d’apertura. Anteprima prima dell’importazione, scritture non in pareggio segnalate alla riga.' },
      { icon: 'percent', title: 'Rendiconto IVA dell’AFC', text: 'Il modulo cifra per cifra, controllato con i conti 2200, 1170 e 1171, e il file eCH-0217 per l’ePortal.' },
      { icon: 'archive', title: 'Chiusura con un clic', text: 'Controlli, risultato sul 2979, riporto sul 2970, esercizio bloccato. Conti annuali con l’esercizio precedente, pronti da stampare.' },
      { icon: 'book-open', title: 'Giornale, mastro, bilancio di verifica', text: 'Ricerca per testo, giustificativo o importo. Modifiche e storni tracciati, periodi bloccati: nulla viene mai cancellato.' },
      { icon: 'lock', title: 'Link privato del cliente', text: 'Invia estratti, risponde alle sue richieste e firma i conti dal telefono. Prova conservata: nome, data, impronta del documento.' },
      { icon: 'check-square', title: 'Lavori e checklist', text: 'Chiusura, IVA, salari: i suoi modelli di tappe, assegnati nel team, con l’avanzamento di ogni dossier.' },
      { icon: 'clock', title: 'Tempo e onorari', text: 'Il tempo di ogni collaboratore per mandante, alla tariffa del cliente. Ciò che resta da fatturare, a colpo d’occhio.' },
      { icon: 'bar-chart-2', title: 'Indicatori e portafoglio', text: 'Cifra d’affari, EBITDA, EBIT, liquidità, quick ratio, capitale proprio. Tutti i mandanti su una pagina.' },
      { icon: 'calendar', title: 'Scadenze di ogni dossier', text: 'IVA, AVS, certificati di salario, imposte, chiusura: calcolati per ogni mandante e spuntati quando è fatto.' },
      { icon: 'download', title: 'Esportazioni verso il software del cliente', text: 'Registrazioni e saldi in formato Banana, Abacus o Winbiz, per un cliente che tiene il suo strumento.' },
      { icon: 'award', title: 'Il suo marchio, il suo elenco', text: 'Logo e colore sulle e-mail e sul link privato. Profilo pubblico nell’elenco dei fiduciari di Cantia.' },
    ],
  },
  flow: {
    eyebrow: 'Un trimestre',
    title: 'Dal documento al rendiconto IVA',
    steps: [
      { title: 'Il cliente carica', text: 'Chiede gli estratti del trimestre: li invia dal suo link privato.' },
      { title: 'Lei registra o importa', text: 'Scrittura per scrittura con l’IVA separata, o tutto il file del vecchio software.' },
      { title: 'Cantia compila il modulo', text: 'Cifre da 200 a 500, controllate con la contabilità. Lei completa le cifre manuali.' },
      { title: 'Lei deposita', text: 'File eCH-0217 per l’ePortal, scrittura di conteggio registrata, scadenza spuntata, periodo bloccato.' },
    ],
    preview: {
      title: 'Rendiconto IVA · 3° trimestre 2026',
      example: 'Esempio',
      rows: [
        ['200', 'Totale delle controprestazioni', '126’480.00'],
        ['299', 'Cifra d’affari imponibile', '126’480.00'],
        ['303', 'Aliquota normale 8,1 %', '10’244.88'],
        ['400', 'Imposta precedente, materiale e prestazioni', '3’120.40'],
        ['405', 'Imposta precedente, investimenti', '486.00'],
      ],
      total: ['500', 'Importo da pagare', '6’638.48'],
      checks: ['IVA dovuta contabilizzata (2200) concordante', 'Imposta precedente (1170 / 1171) concordante'],
      xml: 'File eCH-0217',
      file: 'Depositare il rendiconto',
    },
  },
};

const LANDING_COPY: Record<AccLocale, Copy> = { fr, de, it };

export function useLandingCopy(): Copy {
  const { locale } = useAccCopy();
  return LANDING_COPY[locale];
}
