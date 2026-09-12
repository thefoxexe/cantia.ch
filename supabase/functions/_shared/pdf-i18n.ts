// Self-contained FR/DE/IT label dictionary for PDF generation inside Deno
// edge functions. Edge functions can't import lib/translations/index.ts (it
// depends on react-native/AsyncStorage), so every string that ends up
// printed on a generated devis/facture/payslip PDF or QR-bill lives here
// instead — a document always renders in the organization's own locale
// (organizations.locale), never the viewer's, so this only ever needs the
// values the org can pick in compte/entreprise.tsx.
export type PdfLocale = 'fr' | 'de' | 'it';

export function resolvePdfLocale(org: any): PdfLocale {
  return org?.locale === 'de' ? 'de' : org?.locale === 'it' ? 'it' : 'fr';
}

// Per-document override (devis.locale/factures.locale/extra_works.locale,
// plan-gated — see has_document_locale_override) — set explicitly by
// whoever created that one document, for the occasional case of a client
// who needs a different language even though the org otherwise always
// documents in its own default. Falls back to the org's locale when unset
// (the normal case), same as resolvePdfLocale alone did before this existed.
export function resolveDocLocale(doc: any, org: any): PdfLocale {
  if (doc?.locale === 'de' || doc?.locale === 'fr' || doc?.locale === 'it') return doc.locale;
  return resolvePdfLocale(org);
}

const LABELS = {
  devisLabel: { fr: 'Devis', de: 'Angebot', it: 'Preventivo' },
  factureLabel: { fr: 'Facture', de: 'Rechnung', it: 'Fattura' },
  factureDepositLabel: { fr: "Facture d'acompte", de: 'Anzahlungsrechnung', it: "Fattura d'acconto" },
  client: { fr: 'Client', de: 'Kunde', it: 'Cliente' },
  project: { fr: 'Chantier : {name}', de: 'Baustelle: {name}', it: 'Cantiere: {name}' },
  projectLabel: { fr: 'Chantier', de: 'Baustelle', it: 'Cantiere' },
  description: { fr: 'Description', de: 'Beschreibung', it: 'Descrizione' },
  quantity: { fr: 'Qté', de: 'Menge', it: 'Qtà' },
  unit: { fr: 'Unité', de: 'Einheit', it: 'Unità' },
  unitFallback: { fr: 'pce', de: 'Stk', it: 'pz' },
  price: { fr: 'Prix', de: 'Preis', it: 'Prezzo' },
  total: { fr: 'Total', de: 'Total', it: 'Totale' },
  subtotal: { fr: 'Sous-total', de: 'Zwischentotal', it: 'Subtotale' },
  vat: { fr: 'TVA ({rate}%)', de: 'MWST ({rate}%)', it: 'IVA ({rate}%)' },
  totalIncl: { fr: 'Total TTC', de: 'Total inkl. MWST', it: 'Totale IVA incl.' },
  entrepriseFallback: { fr: 'Entreprise', de: 'Unternehmen', it: 'Azienda' },
  signature: { fr: 'Signature', de: 'Unterschrift', it: 'Firma' },
  signatureOf: { fr: 'Signature {name}', de: 'Unterschrift {name}', it: 'Firma {name}' },
  signedBy: { fr: 'Signé par {name}', de: 'Unterzeichnet von {name}', it: 'Firmato da {name}' },
  clientSignature: { fr: 'Signature client', de: 'Unterschrift Kunde', it: 'Firma del cliente' },
  signedOn: { fr: 'le {date}', de: 'am {date}', it: 'il {date}' },
  paidOn: { fr: 'Payée le {date}', de: 'Bezahlt am {date}', it: 'Pagata il {date}' },
  dueDate: { fr: 'Échéance : {date}', de: 'Fällig am: {date}', it: 'Scadenza: {date}' },
  quoteValidity: { fr: 'Devis valable {days} jours.', de: 'Angebot gültig während {days} Tagen.', it: 'Preventivo valido {days} giorni.' },
  paymentReminder: {
    fr: "Merci de régler cette facture avant l'échéance indiquée ci-dessus.",
    de: 'Bitte begleichen Sie diese Rechnung bis zum oben angegebenen Fälligkeitsdatum.',
    it: 'Vi preghiamo di saldare questa fattura entro la scadenza indicata sopra.',
  },
  pricesInChf: { fr: 'Prix en francs suisses (CHF).', de: 'Preise in Schweizer Franken (CHF).', it: 'Prezzi in franchi svizzeri (CHF).' },
  documentGenerated: { fr: 'Document généré avec Cantia — cantia.ch', de: 'Dokument erstellt mit Cantia — cantia.ch', it: 'Documento generato con Cantia — cantia.ch' },
  page: { fr: 'Page {n}', de: 'Seite {n}', it: 'Pagina {n}' },
  // Swiss QR-bill (Swiss Payment Standards) — the field labels are part of
  // the printed slip itself, standardized by SIX in FR/DE/IT/EN; the org's
  // document locale picks which of those the printed slip uses.
  receipt: { fr: 'Récépissé', de: 'Empfangsschein', it: 'Ricevuta' },
  paymentSection: { fr: 'Section paiement', de: 'Zahlteil', it: 'Sezione pagamento' },
  accountPayableTo: { fr: 'Compte / Payable à', de: 'Konto / Zahlbar an', it: 'Conto / Pagabile a' },
  reference: { fr: 'Référence', de: 'Referenz', it: 'Riferimento' },
  payableBy: { fr: 'Payable par', de: 'Zahlbar durch', it: 'Pagabile da' },
  currency: { fr: 'Monnaie', de: 'Währung', it: 'Valuta' },
  amount: { fr: 'Montant', de: 'Betrag', it: 'Importo' },
  depositPoint: { fr: 'Point de dépôt', de: 'Annahmestelle', it: 'Punto di accettazione' },
  additionalInfo: { fr: 'Informations supplémentaires', de: 'Zusätzliche Informationen', it: 'Informazioni aggiuntive' },
  // Payslip
  payslipTitle: { fr: 'Décompte de salaire — {period}', de: 'Lohnabrechnung — {period}', it: 'Conteggio salariale — {period}' },
  hoursWorked: { fr: 'Heures effectuées', de: 'Geleistete Stunden', it: 'Ore lavorate' },
  hourlyRate: { fr: 'Taux horaire', de: 'Stundenlohn', it: 'Tariffa oraria' },
  grossSalary: { fr: 'Salaire brut', de: 'Bruttolohn', it: 'Salario lordo' },
  netAdjustments: { fr: 'Ajustements nets (avances, régularisations)', de: 'Netto-Anpassungen (Vorschüsse, Korrekturen)', it: 'Rettifiche nette (anticipi, regolarizzazioni)' },
  netSalary: { fr: 'Salaire net', de: 'Nettolohn', it: 'Salario netto' },
  employeeFallback: { fr: 'Employé', de: 'Mitarbeiter', it: 'Dipendente' },
  dateLabel: { fr: '{place}, le {date}', de: '{place}, den {date}', it: '{place}, il {date}' },
  dateLabelNoPlace: { fr: 'Le {date}', de: 'Den {date}', it: 'Il {date}' },
  // Client-facing transactional emails (send-devis-email, send-facture-email,
  // send-extra-work-email, send-facture-reminder, request-portal-code) —
  // same principle as the PDFs: these go out in the org's own document
  // locale, not the recipient's browser language.
  extraWorkLabel: { fr: 'Travaux supplémentaires', de: 'Zusätzliche Arbeiten', it: 'Lavori supplementari' },
  emailGreeting: { fr: 'Bonjour', de: 'Hallo', it: 'Buongiorno' },
  emailSignatureFallback: { fr: 'Meilleures salutations,', de: 'Freundliche Grüsse,', it: 'Cordiali saluti,' },
  devisDefaultMessage: {
    fr: 'Bonjour {{client}},\n\nVoici notre devis, en pièce jointe.',
    de: 'Hallo {{client}},\n\nAnbei unser Angebot.',
    it: 'Buongiorno {{client}},\n\nEcco il nostro preventivo, in allegato.',
  },
  factureDefaultMessage: {
    fr: 'Bonjour {{client}},\n\nVoici notre facture, en pièce jointe.',
    de: 'Hallo {{client}},\n\nAnbei unsere Rechnung.',
    it: 'Buongiorno {{client}},\n\nEcco la nostra fattura, in allegato.',
  },
  extraWorkDefaultMessage: {
    fr: 'Bonjour {{client}},\n\nDes travaux supplémentaires ont été réalisés sur votre chantier, en complément du devis initial.',
    de: 'Hallo {{client}},\n\nAuf Ihrer Baustelle wurden zusätzliche Arbeiten ausgeführt, ergänzend zum ursprünglichen Angebot.',
    it: 'Buongiorno {{client}},\n\nSul vostro cantiere sono stati eseguiti lavori supplementari, ad integrazione del preventivo iniziale.',
  },
  reminderOverdueDefaultMessage: {
    fr: "Bonjour {{client}},\n\nSauf erreur de notre part, cette facture est toujours impayée. Merci de la régler, ou de nous prévenir si c'est déjà fait.",
    de: 'Hallo {{client}},\n\nSofern uns kein Fehler unterlaufen ist, ist diese Rechnung noch offen. Bitte begleichen Sie sie, oder informieren Sie uns, falls dies bereits geschehen ist.',
    it: 'Buongiorno {{client}},\n\nSalvo nostro errore, questa fattura risulta ancora non saldata. Vi preghiamo di regolarla, oppure di avvisarci se il pagamento è già stato effettuato.',
  },
  reminderUpcomingDefaultMessage: {
    fr: 'Bonjour {{client}},\n\nPetit rappel : cette facture arrive bientôt à échéance.',
    de: 'Hallo {{client}},\n\nEine kurze Erinnerung: Diese Rechnung wird bald fällig.',
    it: 'Buongiorno {{client}},\n\nUn breve promemoria: questa fattura sta per scadere.',
  },
  viewAndSignDevis: { fr: 'Voir et signer le devis', de: 'Angebot ansehen und unterschreiben', it: 'Visualizza e firma il preventivo' },
  viewFacture: { fr: 'Voir la facture', de: 'Rechnung ansehen', it: 'Visualizza la fattura' },
  viewAndValidate: { fr: 'Voir et valider', de: 'Ansehen und bestätigen', it: 'Visualizza e conferma' },
  withoutAccount: { fr: 'sans créer de compte', de: 'ohne Konto zu erstellen', it: 'senza creare un account' },
  detailAndBalance: { fr: 'détail et solde à jour', de: 'Details und aktueller Saldo', it: 'dettaglio e saldo aggiornato' },
  downloadPdfDefault: { fr: 'Télécharger le PDF', de: 'PDF herunterladen', it: 'Scarica il PDF' },
  downloadPdf7Days: { fr: 'Télécharger le PDF (valable 7 jours)', de: 'PDF herunterladen (7 Tage gültig)', it: 'Scarica il PDF (valido 7 giorni)' },
  reminderSubjectOverdue: { fr: 'Rappel — facture {number} en retard de paiement', de: 'Erinnerung — Rechnung {number} überfällig', it: 'Promemoria — fattura {number} scaduta' },
  reminderSubjectUpcoming: { fr: 'Rappel — facture {number} à régler prochainement', de: 'Erinnerung — Rechnung {number} bald fällig', it: 'Promemoria — fattura {number} in scadenza' },
  verificationCodeLabel: { fr: 'Code de vérification', de: 'Bestätigungscode', it: 'Codice di verifica' },
  // German intentionally drops the possessive/article ("Angebot ansehen",
  // not "Ihr Angebot ansehen") — devis/facture take different genders
  // (das Angebot vs. die Rechnung), and the article-less phrasing sidesteps
  // that agreement entirely while staying natural, label-style German.
  // Italian keeps the possessive ("il vostro {doc}") since preventivo/
  // fattura are both grammatically fine with "vostro" regardless of gender.
  verificationCodeTitle: { fr: 'Consulter votre {doc}', de: '{doc} ansehen', it: 'Consultare il vostro {doc}' },
  verificationCodeIntro: {
    fr: 'Voici votre code pour consulter le {doc} {number} de {org} :',
    de: 'Hier ist Ihr Code, um {doc} {number} von {org} anzusehen:',
    it: 'Ecco il vostro codice per consultare il {doc} {number} di {org}:',
  },
  verificationCodeHint: {
    fr: "Ce code expire dans {minutes} minutes et ne peut être utilisé qu'une seule fois. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
    de: 'Dieser Code läuft in {minutes} Minuten ab und kann nur einmal verwendet werden. Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.',
    it: 'Questo codice scade tra {minutes} minuti e può essere utilizzato una sola volta. Se non siete voi all\'origine di questa richiesta, ignorate questa e-mail.',
  },
  verificationCodeSubject: { fr: '{code} — votre code de vérification', de: '{code} — Ihr Bestätigungscode', it: '{code} — il vostro codice di verifica' },
  emailFooterTagline: {
    fr: 'Cantia — logiciel suisse de gestion pour entreprises du bâtiment',
    de: 'Cantia — Schweizer Verwaltungssoftware für Bauunternehmen',
    it: 'Cantia — software svizzero di gestione per aziende edili',
  },
} as const;

type LabelKey = keyof typeof LABELS;

export function pdfT(locale: PdfLocale, key: LabelKey, vars?: Record<string, string | number>): string {
  let text: string = LABELS[key][locale];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

const MONTHS: Record<PdfLocale, string[]> = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
};

export function pdfMonthLabel(locale: PdfLocale, monthIndex: number): string {
  return MONTHS[locale][monthIndex];
}
