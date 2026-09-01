import { ViewStyle } from 'react-native';
import { colors, radius, spacing } from './theme';
import { marketingFonts } from './marketingTheme';

// Shared visual language for the public client portal (devis-client,
// facture-client): the only screens in the app a non-customer ever opens,
// so they're built to the same "Swiss-made, premium, secure" register as
// the marketing site rather than the utilitarian internal app chrome —
// same Fraunces/Instrument Sans pairing, same warm palette, more air.
export const portalFonts = marketingFonts;

// A floating card with more radius and a softer, wider shadow than the
// internal app's <Card> — reads as "lifted" rather than merely bordered.
export const premiumCard: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.xl,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.xl,
  shadowColor: '#2B1B10',
  shadowOpacity: 0.06,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 12 },
  elevation: 2,
};

// Warm gradient wash used behind the header/hero on web only — RN Web
// passes unrecognized style keys straight through to CSS (same technique
// already used on the marketing homepage), so this degrades to a flat
// colors.bg on native, which is an acceptable fallback for a background wash.
export const heroWash = {
  backgroundImage: `linear-gradient(180deg, ${colors.primarySoft} 0%, ${colors.bg} 60%)`,
} as ViewStyle;
