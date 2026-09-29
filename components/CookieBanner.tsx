import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { isAppHost } from '../lib/appHost';
import { getCookieConsent, setCookieConsent } from '../lib/siteAnalytics';
import { getAppLocale } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Consent for the marketing site's measurement cookies: Google Ads (consent
// mode, app/+html.tsx) and the first-party campaign + Cantia Partners
// referral cookies (lib/siteAnalytics.ts). Shown once
// on cantia.ch, never on app.cantia.ch nor on the pages clients open from an
// email (devis, factures, documents), which have nothing to attribute.
const HIDDEN_PREFIXES = ['/devis-client', '/facture-client', '/client-documents', '/travaux-supplementaires-client', '/salaire-employe', '/confidentialite'];

const COPY = {
  fr: {
    text: 'Avec votre accord, Cantia utilise des cookies pour mesurer ses campagnes (Google Ads) et savoir quel partenaire vous a recommandé. Rien n’est déposé si vous refusez.',
    more: 'En savoir plus',
    accept: 'Accepter',
    refuse: 'Refuser',
    privacy: '/confidentialite',
  },
  de: {
    text: 'Mit Ihrer Zustimmung verwendet Cantia Cookies, um seine Kampagnen (Google Ads) zu messen und zu wissen, welcher Partner Sie empfohlen hat. Lehnen Sie ab, wird nichts gespeichert.',
    more: 'Mehr erfahren',
    accept: 'Akzeptieren',
    refuse: 'Ablehnen',
    privacy: '/de/confidentialite',
  },
  it: {
    text: 'Con il suo consenso, Cantia utilizza cookie per misurare le sue campagne (Google Ads) e sapere quale partner l’ha raccomandata. Se rifiuta, non viene salvato nulla.',
    more: 'Saperne di più',
    accept: 'Accetta',
    refuse: 'Rifiuta',
    privacy: '/it/confidentialite',
  },
};

export function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Decided after hydration only: the prerendered HTML never contains it.
  useEffect(() => {
    if (Platform.OS !== 'web' || isAppHost()) return;
    setVisible(getCookieConsent() === null);
  }, []);

  if (!visible || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p)) || pathname.startsWith('/(')) return null;
  const copy = COPY[getAppLocale()] ?? COPY.fr;

  function choose(value: 'accepted' | 'refused') {
    setCookieConsent(value);
    setVisible(false);
  }

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.card} accessibilityRole="none" aria-label="Cookies">
        <Text style={styles.text}>
          {copy.text}{' '}
          <Link href={copy.privacy as any} style={styles.link}>
            {copy.more}
          </Link>
        </Text>
        <View style={styles.actions}>
          <Pressable onPress={() => choose('refused')} style={[styles.button, styles.secondary]} accessibilityRole="button">
            <Text style={styles.secondaryText}>{copy.refuse}</Text>
          </Pressable>
          <Pressable onPress={() => choose('accepted')} style={[styles.button, styles.primary]} accessibilityRole="button">
            <Text style={styles.primaryText}>{copy.accept}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'fixed' as any,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    width: '100%',
    maxWidth: 720,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    shadowColor: '#231A12',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  text: { flex: 1, minWidth: 240, fontSize: fontSize.sm, lineHeight: 19, color: colors.text },
  link: { color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  button: { paddingVertical: 9, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1 },
  primary: { backgroundColor: colors.text, borderColor: colors.text },
  primaryText: { color: colors.surface, fontWeight: '700', fontSize: fontSize.sm },
  secondary: { backgroundColor: 'transparent', borderColor: colors.border },
  secondaryText: { color: colors.text, fontWeight: '600', fontSize: fontSize.sm },
});
