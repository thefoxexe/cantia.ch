// Base text pre-filled in Compte → Entreprise and in the per-send modal —
// the org sees an actual editable default rather than an empty field, but
// the "consultez en ligne" link paragraph that follows this text in the
// sent e-mail is generated separately (see supabase/functions/send-devis-email
// and send-facture-email) and is never editable.
export const DEFAULT_DEVIS_EMAIL_MESSAGE =
  'Veuillez trouver ci-joint notre devis. N\'hésitez pas à nous contacter pour toute question.';

export const DEFAULT_FACTURE_EMAIL_MESSAGE =
  'Veuillez trouver ci-joint notre facture. Merci de bien vouloir procéder au règlement dans les délais indiqués.';
