import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { authHref } from '../lib/appHost';
import { t } from '../lib/i18n';

// Shared navbar + footer for secondary marketing pages (solutions/*,
// /telechargement, etc.) that live outside the animated single-page
// index.tsx — a plain, non-fixed, non-animated header/footer is enough for
// these (no scroll-triggered blur or mobile drawer), and keeping them here
// means every such page gets the exact same chrome instead of drifting.
export function MarketingNav() {
  return (
    <View style={styles.nav}>
      <Link href="/" asChild>
        <Pressable style={styles.navBrandRow}>
          <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" />
          <Text style={styles.navBrand}>Cantia</Text>
        </Pressable>
      </Link>
      <View style={styles.navLinks}>
        <Link href="/" asChild>
          <Pressable>
            <Text style={styles.navLink}>Accueil</Text>
          </Pressable>
        </Link>
        <Link href={authHref('login')}>
          <Text style={styles.navLink}>{t.nav.login}</Text>
        </Link>
        <Link href={authHref('signup')} asChild>
          <Button title={t.nav.cta} onPress={() => {}} style={styles.navCta} />
        </Link>
      </View>
    </View>
  );
}

export function MarketingFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerGrid}>
        <View style={styles.footerBrandCol}>
          <View style={styles.footerBrandRow}>
            <Image source={require('../assets/logo-mark.png')} style={styles.footerLogo} resizeMode="contain" />
            <Text style={styles.footerBrand}>Cantia</Text>
          </View>
          <Text style={styles.footerText}>{t.footer.blurb}</Text>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerColTitle}>{t.footer.product}</Text>
          <Link href="/">
            <Text style={styles.footerLink}>{t.footer.servicesLink}</Text>
          </Link>
          <Link href="/">
            <Text style={styles.footerLink}>{t.footer.pricingLink}</Text>
          </Link>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerColTitle}>{t.footer.account}</Text>
          <Link href={authHref('login')}>
            <Text style={styles.footerLink}>{t.footer.login}</Text>
          </Link>
          <Link href={authHref('signup')}>
            <Text style={styles.footerLink}>{t.footer.signup}</Text>
          </Link>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerColTitle}>{t.footer.legal}</Text>
          <Link href="/mentions-legales">
            <Text style={styles.footerLink}>{t.footer.legalLink}</Text>
          </Link>
          <Link href="/confidentialite">
            <Text style={styles.footerLink}>{t.footer.privacyLink}</Text>
          </Link>
        </View>
      </View>
      <View style={styles.footerBottom}>
        <Text style={styles.footerCopy}>{t.footer.copyright.replace('{year}', String(new Date().getFullYear()))}</Text>
        <Link href="https://www.instagram.com/cantia.ch/" target="_blank" asChild>
          <Pressable style={styles.footerSocialLink}>
            <Feather name="instagram" size={15} color={colors.textMuted} />
            <Text style={styles.footerCopy}>@cantia.ch</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  navBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navLogo: {
    width: 28,
    height: 28,
  },
  navBrand: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  navLink: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  navCta: {
    paddingHorizontal: spacing.lg,
  },
  footer: {
    marginTop: spacing.xxxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  footerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxl,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  footerBrandCol: {
    flex: 2,
    minWidth: 220,
    gap: spacing.sm,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerLogo: {
    width: 24,
    height: 24,
  },
  footerBrand: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    maxWidth: 280,
  },
  footerCol: {
    minWidth: 140,
    gap: spacing.sm,
  },
  footerColTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  footerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerCopy: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  footerSocialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
