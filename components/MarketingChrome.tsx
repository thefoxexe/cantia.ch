import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button } from './ui';
import { breakpoints, colors, fontSize, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
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
          <Link href="/#services">
            <Text style={styles.navLink}>{t.nav.services}</Text>
          </Link>
          <Link href="/#pricing">
            <Text style={styles.navLink}>{t.nav.pricing}</Text>
          </Link>
          <Link href="/telechargement">
            <Text style={styles.navLink}>{t.nav.download}</Text>
          </Link>
          <Link href="/aide">
            <Text style={styles.navLink}>{t.nav.help}</Text>
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
              <Link href="/#services" asChild>
                <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                  <Feather name="grid" size={18} color={colors.primary} />
                  <Text style={styles.mobileMenuText}>{t.nav.services}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.mobileMenuChevron} />
                </Pressable>
              </Link>
              <Link href="/#pricing" asChild>
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
              <Link href="/aide" asChild>
                <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                  <Feather name="life-buoy" size={18} color={colors.primary} />
                  <Text style={styles.mobileMenuText}>{t.nav.help}</Text>
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

// scrollToServices/scrollToPricing are only meaningful on the homepage
// itself (smooth-scroll to the in-page section instead of a full
// navigation) — the homepage passes them in; every other page leaves them
// unset and gets a plain link back to "/" instead.
export function MarketingFooter({
  onServicesPress,
  onPricingPress,
}: {
  onServicesPress?: () => void;
  onPricingPress?: () => void;
}) {
  return (
    <View style={styles.footer}>
      <View style={styles.footerGrid}>
        <View style={styles.footerBrandCol}>
          <View style={styles.footerBrandRow}>
            <Image source={require('../assets/logo-mark.png')} style={styles.footerLogo} resizeMode="contain" />
            <Text style={styles.footerBrand}>Cantia</Text>
          </View>
          <Text style={styles.footerText}>{t.footer.blurb}</Text>
          <Link href="/aide" asChild>
            <Pressable style={styles.footerHelpPill}>
              <Feather name="life-buoy" size={14} color={colors.primaryDark} />
              <Text style={styles.footerHelpPillText}>Centre d'aide & documentation</Text>
            </Pressable>
          </Link>
          <Link href="mailto:info@cantia.ch" target="_blank" asChild>
            <Pressable style={styles.footerContact}>
              <Feather name="mail" size={13} color={colors.textMuted} />
              <Text style={styles.footerContactText}>info@cantia.ch · Suisse</Text>
            </Pressable>
          </Link>
        </View>
        <View style={styles.footerCol}>
          {/* Merged with the old standalone "Produit" column (just Services +
              Tarifs) — as two separate columns, Produit looked nearly empty
              next to Solutions' long list. Grouped under one "Produit"
              heading instead, so no column reads as an afterthought. */}
          <Text style={styles.footerColTitle}>{t.footer.product}</Text>
          {onServicesPress ? (
            <Pressable onPress={onServicesPress}>
              <Text style={styles.footerLink}>{t.footer.servicesLink}</Text>
            </Pressable>
          ) : (
            <Link href="/#services">
              <Text style={styles.footerLink}>{t.footer.servicesLink}</Text>
            </Link>
          )}
          {onPricingPress ? (
            <Pressable onPress={onPricingPress}>
              <Text style={styles.footerLink}>{t.footer.pricingLink}</Text>
            </Pressable>
          ) : (
            <Link href="/#pricing">
              <Text style={styles.footerLink}>{t.footer.pricingLink}</Text>
            </Link>
          )}
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
          <Link href="/solutions/rentabilite">
            <Text style={styles.footerLink}>Rentabilité</Text>
          </Link>
          <Link href="/solutions/rh-salaires">
            <Text style={styles.footerLink}>RH & Salaires</Text>
          </Link>
          <Link href="/solutions/travaux-supplementaires">
            <Text style={styles.footerLink}>Travaux supplémentaires</Text>
          </Link>
          <Link href="/solutions/tresorerie">
            <Text style={styles.footerLink}>Trésorerie</Text>
          </Link>
          <Link href="/integrations">
            <Text style={styles.footerLink}>Intégrations</Text>
          </Link>
          <Link href="/sur-mesure">
            <Text style={styles.footerLink}>Sur mesure</Text>
          </Link>
          <Link href="/blog">
            <Text style={styles.footerLink}>Blog</Text>
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
          <Link href="/aide">
            <Text style={styles.footerLink}>{t.nav.help}</Text>
          </Link>
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
            <Ionicons name="logo-instagram" size={16} color="#E1306C" />
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
    fontFamily: marketingFonts.display,
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  navLink: {
    fontFamily: marketingFonts.body,
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
    fontFamily: marketingFonts.body,
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
    fontFamily: marketingFonts.display,
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  footerText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    maxWidth: 280,
  },
  footerHelpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    marginTop: spacing.xs,
  },
  footerHelpPillText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  footerContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  footerContactText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  footerCol: {
    minWidth: 140,
    gap: spacing.sm,
  },
  footerColTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  footerLink: {
    fontFamily: marketingFonts.body,
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
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  footerSocialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
