// Self-contained FR/DE label dictionary for PDF generation inside Deno edge
// functions. Edge functions can't import lib/translations/index.ts (it
// depends on react-native/AsyncStorage), so every string that ends up
// printed on a generated devis/facture/payslip PDF or QR-bill lives here
// instead — a document always renders in the organization's own locale
// (organizations.locale), never the viewer's, so this only ever needs the
// two values the org can pick in compte/entreprise.tsx.
export type PdfLocale = 'fr' | 'de';

export function resolvePdfLocale(org: any): PdfLocale {
  return org?.locale === 'de' ? 'de' : 'fr';
}

const LABELS = {
  devisLabel: { fr: 'Devis', de: 'Angebot' },
  factureLabel: { fr: 'Facture', de: 'Rechnung' },
  factureDepositLabel: { fr: "Facture d'acompte", de: 'Anzahlungsrechnung' },
  client: { fr: 'Client', de: 'Kunde' },
  project: { fr: 'Chantier : {name}', de: 'Baustelle: {name}' },
  projectLabel: { fr: 'Chantier', de: 'Baustelle' },
  description: { fr: 'Description', de: 'Beschreibung' },
  quantity: { fr: 'Qté', de: 'Menge' },
  unit: { fr: 'Unité', de: 'Einheit' },
  unitFallback: { fr: 'pce', de: 'Stk' },
  price: { fr: 'Prix', de: 'Preis' },
  total: { fr: 'Total', de: 'Total' },
  subtotal: { fr: 'Sous-total', de: 'Zwischentotal' },
  vat: { fr: 'TVA ({rate}%)', de: 'MWST ({rate}%)' },
  totalIncl: { fr: 'Total TTC', de: 'Total inkl. MWST' },
  entrepriseFallback: { fr: 'Entreprise', de: 'Unternehmen' },
  signature: { fr: 'Signature', de: 'Unterschrift' },
  signatureOf: { fr: 'Signature {name}', de: 'Unterschrift {name}' },
  signedBy: { fr: 'Signé par {name}', de: 'Unterzeichnet von {name}' },
  clientSignature: { fr: 'Signature client', de: 'Unterschrift Kunde' },
  signedOn: { fr: 'le {date}', de: 'am {date}' },
  paidOn: { fr: 'Payée le {date}', de: 'Bezahlt am {date}' },
  dueDate: { fr: 'Échéance : {date}', de: 'Fällig am: {date}' },
  quoteValidity: { fr: 'Devis valable {days} jours.', de: 'Angebot gültig während {days} Tagen.' },
  paymentReminder: {
    fr: "Merci de régler cette facture avant l'échéance indiquée ci-dessus.",
    de: 'Bitte begleichen Sie diese Rechnung bis zum oben angegebenen Fälligkeitsdatum.',
  },
  pricesInChf: { fr: 'Prix en francs suisses (CHF).', de: 'Preise in Schweizer Franken (CHF).' },
  documentGenerated: { fr: 'Document généré avec Cantia — cantia.ch', de: 'Dokument erstellt mit Cantia — cantia.ch' },
  page: { fr: 'Page {n}', de: 'Seite {n}' },
  // Swiss QR-bill (Swiss Payment Standards) — the field labels are part of
  // the printed slip itself, standardized by SIX in FR/DE/IT/EN; the org's
  // document locale picks which of those the printed slip uses.
  receipt: { fr: 'Récépissé', de: 'Empfangsschein' },
  paymentSection: { fr: 'Section paiement', de: 'Zahlteil' },
  accountPayableTo: { fr: 'Compte / Payable à', de: 'Konto / Zahlbar an' },
  reference: { fr: 'Référence', de: 'Referenz' },
  payableBy: { fr: 'Payable par', de: 'Zahlbar durch' },
  currency: { fr: 'Monnaie', de: 'Währung' },
  amount: { fr: 'Montant', de: 'Betrag' },
  depositPoint: { fr: 'Point de dépôt', de: 'Annahmestelle' },
  additionalInfo: { fr: 'Informations supplémentaires', de: 'Zusätzliche Informationen' },
  // Payslip
  payslipTitle: { fr: 'Décompte de salaire — {period}', de: 'Lohnabrechnung — {period}' },
  hoursWorked: { fr: 'Heures effectuées', de: 'Geleistete Stunden' },
  hourlyRate: { fr: 'Taux horaire', de: 'Stundenlohn' },
  grossSalary: { fr: 'Salaire brut', de: 'Bruttolohn' },
  netSalary: { fr: 'Salaire net', de: 'Nettolohn' },
  employeeFallback: { fr: 'Employé', de: 'Mitarbeiter' },
  dateLabel: { fr: '{place}, le {date}', de: '{place}, den {date}' },
  dateLabelNoPlace: { fr: 'Le {date}', de: 'Den {date}' },
  // Client-facing transactional emails (send-devis-email, send-facture-email,
  // send-extra-work-email, send-facture-reminder, request-portal-code) —
  // same principle as the PDFs: these go out in the org's own document
  // locale, not the recipient's browser language.
  extraWorkLabel: { fr: 'Travaux supplémentaires', de: 'Zusätzliche Arbeiten' },
  emailGreeting: { fr: 'Bonjour', de: 'Hallo' },
  emailSignatureFallback: { fr: 'Meilleures salutations,', de: 'Freundliche Grüsse,' },
  devisDefaultMessage: {
    fr: 'Bonjour {{client}},\n\nVoici notre devis, en pièce jointe.',
    de: 'Hallo {{client}},\n\nAnbei unser Angebot.',
  },
  factureDefaultMessage: {
    fr: 'Bonjour {{client}},\n\nVoici notre facture, en pièce jointe.',
    de: 'Hallo {{client}},\n\nAnbei unsere Rechnung.',
  },
  extraWorkDefaultMessage: {
    fr: 'Bonjour {{client}},\n\nDes travaux supplémentaires ont été réalisés sur votre chantier, en complément du devis initial.',
    de: 'Hallo {{client}},\n\nAuf Ihrer Baustelle wurden zusätzliche Arbeiten ausgeführt, ergänzend zum ursprünglichen Angebot.',
  },
  reminderOverdueDefaultMessage: {
    fr: "Bonjour {{client}},\n\nSauf erreur de notre part, cette facture est toujours impayée. Merci de la régler, ou de nous prévenir si c'est déjà fait.",
    de: 'Hallo {{client}},\n\nSofern uns kein Fehler unterlaufen ist, ist diese Rechnung noch offen. Bitte begleichen Sie sie, oder informieren Sie uns, falls dies bereits geschehen ist.',
  },
  reminderUpcomingDefaultMessage: {
    fr: 'Bonjour {{client}},\n\nPetit rappel : cette facture arrive bientôt à échéance.',
    de: 'Hallo {{client}},\n\nEine kurze Erinnerung: Diese Rechnung wird bald fällig.',
  },
  viewAndSignDevis: { fr: 'Voir et signer le devis', de: 'Angebot ansehen und unterschreiben' },
  viewFacture: { fr: 'Voir la facture', de: 'Rechnung ansehen' },
  viewAndValidate: { fr: 'Voir et valider', de: 'Ansehen und bestätigen' },
  withoutAccount: { fr: 'sans créer de compte', de: 'ohne Konto zu erstellen' },
  detailAndBalance: { fr: 'détail et solde à jour', de: 'Details und aktueller Saldo' },
  downloadPdfDefault: { fr: 'Télécharger le PDF', de: 'PDF herunterladen' },
  downloadPdf7Days: { fr: 'Télécharger le PDF (valable 7 jours)', de: 'PDF herunterladen (7 Tage gültig)' },
  reminderSubjectOverdue: { fr: 'Rappel — facture {number} en retard de paiement', de: 'Erinnerung — Rechnung {number} überfällig' },
  reminderSubjectUpcoming: { fr: 'Rappel — facture {number} à régler prochainement', de: 'Erinnerung — Rechnung {number} bald fällig' },
  verificationCodeLabel: { fr: 'Code de vérification', de: 'Bestätigungscode' },
  // German intentionally drops the possessive/article ("Angebot ansehen",
  // not "Ihr Angebot ansehen") — devis/facture take different genders
  // (das Angebot vs. die Rechnung), and the article-less phrasing sidesteps
  // that agreement entirely while staying natural, label-style German.
  verificationCodeTitle: { fr: 'Consulter votre {doc}', de: '{doc} ansehen' },
  verificationCodeIntro: { fr: 'Voici votre code pour consulter le {doc} {number} de {org} :', de: 'Hier ist Ihr Code, um {doc} {number} von {org} anzusehen:' },
  verificationCodeHint: {
    fr: "Ce code expire dans {minutes} minutes et ne peut être utilisé qu'une seule fois. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
    de: 'Dieser Code läuft in {minutes} Minuten ab und kann nur einmal verwendet werden. Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.',
  },
  verificationCodeSubject: { fr: '{code} — votre code de vérification', de: '{code} — Ihr Bestätigungscode' },
  emailFooterTagline: {
    fr: 'Cantia — logiciel suisse de gestion pour entreprises du bâtiment',
    de: 'Cantia — Schweizer Verwaltungssoftware für Bauunternehmen',
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
};

export function pdfMonthLabel(locale: PdfLocale, monthIndex: number): string {
  return MONTHS[locale][monthIndex];
}
