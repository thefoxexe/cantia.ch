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
