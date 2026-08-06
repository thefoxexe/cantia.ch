// Base text pre-filled in Compte → Entreprise and in the per-send modal —
// the org sees an actual editable default rather than an empty field. The
// greeting ("Bonjour ...") and the "consultez en ligne" link paragraph are
// both generated separately around this text (see
// supabase/functions/send-devis-email and send-facture-email /
// _shared/emailTemplate.ts) and are never editable — this default only
// covers the middle, freely-editable paragraph.
export const DEFAULT_DEVIS_EMAIL_MESSAGE =
  "Vous trouverez ci-joint notre devis détaillé. N'hésitez pas à nous contacter pour toute question ou précision.";

export const DEFAULT_FACTURE_EMAIL_MESSAGE =
  "Vous trouverez ci-joint notre facture. Nous vous remercions de bien vouloir procéder au règlement avant l'échéance indiquée.";

// Signature default needs the org's own name, so it's built at call sites
// (Compte → Entreprise's load()) rather than being a static constant here.
export function defaultEmailSignature(orgName: string): string {
  return `Meilleures salutations,\n${orgName}`;
}
