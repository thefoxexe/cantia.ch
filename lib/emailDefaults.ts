// Base text pre-filled in Compte → E-mails and in the per-send modals — the
// org sees an actual editable default rather than an empty field. The whole
// text (greeting included) is editable and supports {{variable}} tokens —
// see EMAIL_VARIABLES below — that get substituted server-side before
// sending (supabase/functions/_shared/resend.ts::applyEmailVariables). Only
// the "consultez en ligne" portal link paragraph is generated separately and
// never editable.
export const DEFAULT_DEVIS_EMAIL_MESSAGE = 'Bonjour {{client}},\n\nVoici notre devis, en pièce jointe.';

export const DEFAULT_FACTURE_EMAIL_MESSAGE = 'Bonjour {{client}},\n\nVoici notre facture, en pièce jointe.';

export const DEFAULT_EXTRA_WORK_EMAIL_MESSAGE =
  'Bonjour {{client}},\n\nDes travaux supplémentaires ont été réalisés sur votre chantier, en complément du devis initial.';

export const DEFAULT_FACTURE_REMINDER_MESSAGE_UPCOMING =
  'Bonjour {{client}},\n\nPetit rappel : cette facture arrive bientôt à échéance.';

export const DEFAULT_FACTURE_REMINDER_MESSAGE_OVERDUE =
  "Bonjour {{client}},\n\nSauf erreur de notre part, cette facture est toujours impayée. Merci de la régler, ou de nous prévenir si c'est déjà fait.";

// Signature default needs the org's own name, so it's built at call sites
// rather than being a static constant here.
export function defaultEmailSignature(orgName: string): string {
  return `Meilleures salutations,\n${orgName}`;
}

export interface EmailVariable {
  key: string;
  label: string;
}

// Common to every template — resolved from the client/document itself.
const COMMON_EMAIL_VARIABLES: EmailVariable[] = [
  { key: 'client', label: 'Client' },
  { key: 'entreprise', label: 'Entreprise' },
  { key: 'chantier', label: 'Chantier' },
  { key: 'numero', label: 'Numéro' },
];

// Only factures carry a due date — offered on the facture and relance fields.
const DUE_DATE_EMAIL_VARIABLE: EmailVariable = { key: 'echeance', label: 'Échéance' };

export const EMAIL_VARIABLES: Record<'devis' | 'facture' | 'reminder' | 'extraWork' | 'signature', EmailVariable[]> = {
  devis: COMMON_EMAIL_VARIABLES,
  facture: [...COMMON_EMAIL_VARIABLES, DUE_DATE_EMAIL_VARIABLE],
  reminder: [...COMMON_EMAIL_VARIABLES, DUE_DATE_EMAIL_VARIABLE],
  extraWork: COMMON_EMAIL_VARIABLES,
  signature: COMMON_EMAIL_VARIABLES,
};
