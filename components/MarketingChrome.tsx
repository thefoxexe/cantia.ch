import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from './ui';
import { breakpoints, colors, fontSize, spacing } from '../lib/theme';
import { authHref } from '../lib/appHost';
import { t } from '../lib/i18n';

// Shared navbar + footer for every marketing page — the single-page index.tsx
// (which has its own scroll-to-section links) and every static page below it
// (solutions/*, /telechargement, mentions légales, etc.). Same links, same
// mobile hamburger collapse below `breakpoints.tablet` as the home page, so
// no page in the site is missing the responsive behavior the others have.
export function MarketingNav() {
  const { width } = useWindowDimensions();
  const isCompactNav = width < breakpoints.tablet;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [menuOpen, menuAnim]);

  return (
    <View style={styles.nav}>
      <Link href="/" asChild>
        <Pressable style={styles.navBrandRow}>
          <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" />
          <Text style={styles.navBrand}>Cantia</Text>
        </Pressable>
      </Link>

      {isCompactNav ? (
        <Pressable onPress={() => setMenuOpen(true)} style={styles.hamburgerButton} hitSlop={8} accessibilityLabel="Menu">
          <Feather name="menu" size={22} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.navLinks}>
          <Link href="/">
            <Text style={styles.navLink}>{t.nav.services}</Text>
          </Link>
          <Link href="/">
            <Text style={styles.navLink}>{t.nav.pricing}</Text>
          </Link>
          <Link href="/telechargement">
            <Text style={styles.navLink}>{t.nav.download}</Text>
          </Link>
          <Link href={authHref('login')}>
            <Text style={styles.navLink}>{t.nav.login}</Text>
          </Link>
          <Link href={authHref('signup')} asChild>
            <Button title={t.nav.cta} onPress={() => {}} style={styles.navCta} />
          </Link>
        </View>
      )}

      {isCompactNav ? (
        <Modal visible={menuOpen} animationType="none" transparent onRequestClose={() => setMenuOpen(false)}>
          <Animated.View
            style={[
              styles.mobileMenuFull,
              {
                opacity: menuAnim,
                transform: [{ translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
              },
            ]}
          >
            <View style={styles.mobileMenuHeader}>
              <View style={styles.navBrandRow}>
                <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" />
                <Text style={styles.navBrand}>Cantia</Text>
              </View>
              <Pressable onPress={() => setMenuOpen(false)} style={styles.hamburgerButton} hitSlop={8} accessibilityLabel="Fermer">
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.mobileMenuBody} showsVerticalScrollIndicator={false}>
              <Link href="/" asChild>
                <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                  <Feather name="grid" size={18} color={colors.primary} />
                  <Text style={styles.mobileMenuText}>{t.nav.services}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.mobileMenuChevron} />
                </Pressable>
              </Link>
              <Link href="/" asChild>
                <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                  <Feather name="tag" size={18} color={colors.primary} />
                  <Text style={styles.mobileMenuText}>{t.nav.pricing}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.mobileMenuChevron} />
                </Pressable>
              </Link>
              <Link href="/telechargement" asChild>
                <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                  <Feather name="download" size={18} color={colors.primary} />
                  <Text style={styles.mobileMenuText}>{t.nav.download}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.mobileMenuChevron} />
                </Pressable>
              </Link>
              <Link href={authHref('login')} asChild>
                <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                  <Feather name="log-in" size={18} color={colors.primary} />
                  <Text style={styles.mobileMenuText}>{t.nav.login}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.mobileMenuChevron} />
                </Pressable>
              </Link>
              <Link href={authHref('signup')} asChild>
                <Button title={t.nav.cta} onPress={() => setMenuOpen(false)} style={styles.mobileMenuCta} />
              </Link>
            </ScrollView>
          </Animated.View>
        </Modal>
      ) : null}
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
          <Text style={styles.footerColTitle}>Solutions</Text>
          <Link href="/solutions/devis">
            <Text style={styles.footerLink}>Devis</Text>
          </Link>
          <Link href="/solutions/facturation">
            <Text style={styles.footerLink}>Facturation & QR-facture</Text>
          </Link>
          <Link href="/solutions/rapports-chantier">
            <Text style={styles.footerLink}>Rapports de chantier</Text>
          </Link>
          <Link href="/solutions/dictee-vocale">
            <Text style={styles.footerLink}>Dictée vocale</Text>
          </Link>
          <Link href="/solutions/planning">
            <Text style={styles.footerLink}>Planning</Text>
          </Link>
          <Link href="/solutions/leves-metre">
            <Text style={styles.footerLink}>Levés & Métré</Text>
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
  hamburgerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenuFull: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  mobileMenuBody: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileMenuText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  mobileMenuChevron: {
    marginLeft: 'auto',
  },
  mobileMenuCta: {
    marginTop: spacing.lg,
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
