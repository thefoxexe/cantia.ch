import { i18next } from './translations';

// Base text pre-filled in Compte → E-mails and in the per-send modals — the
// org sees an actual editable default rather than an empty field. The whole
// text (greeting included) is editable and supports {{variable}} tokens —
// see EMAIL_VARIABLES below — that get substituted server-side before
// sending (supabase/functions/_shared/resend.ts::applyEmailVariables). Only
// the "consultez en ligne" portal link paragraph is generated separately and
// never editable.
//
// Localized via lib/translations (emailDefaults.*) so a German-locale org
// sees a German default the first time they open the settings — the
// literal "{{client}}" token must survive into the stored template, so the
// translated strings use a __CLIENT__ placeholder swapped in here rather
// than going through i18next's own interpolation.
function withClientToken(text: string): string {
  return text.replace('__CLIENT__', '{{client}}');
}

export function defaultDevisEmailMessage(): string {
  return withClientToken(i18next.t('emailDefaults.devisMessage'));
}

export function defaultFactureEmailMessage(): string {
  return withClientToken(i18next.t('emailDefaults.factureMessage'));
}

export function defaultExtraWorkEmailMessage(): string {
  return withClientToken(i18next.t('emailDefaults.extraWorkMessage'));
}

export function defaultFactureReminderMessageUpcoming(): string {
  return withClientToken(i18next.t('emailDefaults.reminderUpcoming'));
}

export function defaultFactureReminderMessageOverdue(): string {
  return withClientToken(i18next.t('emailDefaults.reminderOverdue'));
}

// Signature default needs the org's own name, so it's built at call sites
// rather than being a static constant here.
export function defaultEmailSignature(orgName: string): string {
  return i18next.t('emailDefaults.signature').replace('__ORG__', orgName);
}

export interface EmailVariable {
  key: string;
  label: string;
}

// Common to every template — resolved from the client/document itself.
// "Mon entreprise", pas juste "Entreprise" — un devis peut être adressé à un
// client qui est lui-même un contact au sein d'une entreprise, donc le label
// nu prêtait à confusion sur qui la variable désigne.
function commonEmailVariables(): EmailVariable[] {
  return [
    { key: 'client', label: i18next.t('emailDefaults.variables.client') },
    { key: 'entreprise', label: i18next.t('emailDefaults.variables.entreprise') },
    { key: 'chantier', label: i18next.t('emailDefaults.variables.chantier') },
    { key: 'numero', label: i18next.t('emailDefaults.variables.numero') },
  ];
}

// Only factures carry a due date — offered on the facture and relance fields.
function dueDateEmailVariable(): EmailVariable {
  return { key: 'echeance', label: i18next.t('emailDefaults.variables.echeance') };
}

export function emailVariablesFor(kind: 'devis' | 'facture' | 'reminder' | 'extraWork' | 'signature'): EmailVariable[] {
  switch (kind) {
    case 'facture':
    case 'reminder':
      return [...commonEmailVariables(), dueDateEmailVariable()];
    default:
      return commonEmailVariables();
  }
}
