import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link, usePathname, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button, LangToggle } from './ui';
import { breakpoints, colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref, toggleLocalePathname, useSyncMarketingLocaleFromPath } from '../lib/appHost';
import { useMarketingDict } from '../lib/i18n';
import { getAppLocale, useTranslation } from '../lib/translations';

// FR/DE toggle for the marketing site's nav, footer and mobile menu — an
// animated sliding pill (LangToggle, see components/ui.tsx) rather than two
// separate text links, so switching language reads as one small physical
// gesture (the active side slides across) instead of picking between two
// static labels. Navigates to the same page's other-language mirror
// (toggleLocalePathname), not just the homepage, so switching from a trade
// or solution page keeps the visitor on that same page. router.push rather
// than <Link> — LangToggle's onChange is a plain callback, and a real
// client-side navigation here still runs through the same pathname-change
// effect (useSyncMarketingLocaleFromPath) a <Link> click would.
export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getAppLocale();
  return (
    <View style={compact ? styles.langSwitcherCompact : undefined}>
      <LangToggle value={locale} onChange={(next) => router.push(toggleLocalePathname(pathname, next) as any)} />
    </View>
  );
}

// Shared navbar + footer for every marketing page — the single-page index.tsx
// (which has its own scroll-to-section links) and every static page below it
// (solutions/*, /telechargement, mentions légales, etc.). Same links, same
// mobile hamburger collapse below `breakpoints.tablet` as the home page, so
// no page in the site is missing the responsive behavior the others have.
export function MarketingNav() {
  const t = useMarketingDict();
  const { t: tr } = useTranslation();
  const locale = getAppLocale();
  const pathname = usePathname();
  const router = useRouter();
  const homeHref = locale === 'de' ? '/de' : '/';
  const servicesHref = locale === 'de' ? '/de/#services' : '/#services';
  const pricingHref = locale === 'de' ? '/de/#pricing' : '/#pricing';
  const aideHref = locale === 'de' ? '/de/aide' : '/aide';
  const { width } = useWindowDimensions();
  const isCompactNav = width < breakpoints.tablet;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  // Keeps the visible language matching the URL on every client-side
  // navigation, not just the first page load — see useSyncMarketingLocaleFromPath.
  useSyncMarketingLocaleFromPath();

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [menuOpen, menuAnim]);

  return (
    <View style={styles.navOuter}>
      <View style={styles.nav}>
      <Link href={homeHref as any} asChild>
        <Pressable style={styles.navBrandRow}>
          <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" />
          <Text style={styles.navBrand}>Cantia</Text>
        </Pressable>
      </Link>

      {isCompactNav ? (
        <Pressable onPress={() => setMenuOpen(true)} style={styles.hamburgerButton} hitSlop={8} accessibilityLabel={tr('marketingChrome.menu')}>
          <Feather name="menu" size={22} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.navLinks}>
          <Link href={servicesHref as any}>
            <Text style={styles.navLink}>{t.nav.services}</Text>
          </Link>
          <Link href={pricingHref as any}>
            <Text style={styles.navLink}>{t.nav.pricing}</Text>
          </Link>
          <Link href="/telechargement">
            <Text style={styles.navLink}>{t.nav.download}</Text>
          </Link>
          <Link href={aideHref as any}>
            <Text style={styles.navLink}>{t.nav.help}</Text>
          </Link>
          <LanguageSwitcher />
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
                <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" accessibilityLabel="Cantia" />
                <Text style={styles.navBrand}>Cantia</Text>
              </View>
              <View style={styles.mobileMenuHeaderRight}>
                <LangToggle value={locale} onChange={(next) => router.push(toggleLocalePathname(pathname, next) as any)} />
                <Pressable onPress={() => setMenuOpen(false)} style={styles.hamburgerButton} hitSlop={8} accessibilityLabel={tr('marketingChrome.close')}>
                  <Feather name="x" size={22} color={colors.text} />
                </Pressable>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.mobileMenuBody} showsVerticalScrollIndicator={false}>
              <View style={styles.mobileMenuGroup}>
                <Link href={servicesHref as any} asChild>
                  <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                    <Text style={styles.mobileMenuText}>{t.nav.services}</Text>
                  </Pressable>
                </Link>
                <Link href={pricingHref as any} asChild>
                  <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                    <Text style={styles.mobileMenuText}>{t.nav.pricing}</Text>
                  </Pressable>
                </Link>
                <Link href="/telechargement" asChild>
                  <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                    <Text style={styles.mobileMenuText}>{t.nav.download}</Text>
                  </Pressable>
                </Link>
                <Link href={aideHref as any} asChild>
                  <Pressable style={mobileMenuLastItemStyle} onPress={() => setMenuOpen(false)}>
                    <Text style={styles.mobileMenuText}>{t.nav.help}</Text>
                  </Pressable>
                </Link>
              </View>

              <Link href={authHref('login')} asChild>
                <Pressable style={styles.mobileMenuSecondaryItem} onPress={() => setMenuOpen(false)}>
                  <Feather name="log-in" size={15} color={colors.textMuted} />
                  <Text style={styles.mobileMenuSecondaryText}>{t.nav.login}</Text>
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
  const t = useMarketingDict();
  const { t: tr } = useTranslation();
  const locale = getAppLocale();
  const servicesHref = locale === 'de' ? '/de/#services' : '/#services';
  const pricingHref = locale === 'de' ? '/de/#pricing' : '/#pricing';
  const aideHref = locale === 'de' ? '/de/aide' : '/aide';
  return (
    <View style={styles.footer}>
      <View style={styles.footerGrid}>
        <View style={styles.footerBrandCol}>
          <View style={styles.footerBrandRow}>
            <Image source={require('../assets/logo-mark.png')} style={styles.footerLogo} resizeMode="contain" accessibilityLabel="Cantia" />
            <Text style={styles.footerBrand}>Cantia</Text>
          </View>
          <Text style={styles.footerText}>{t.footer.blurb}</Text>
          <Link href={aideHref as any} asChild>
            <Pressable style={styles.footerHelpPill}>
              <Feather name="life-buoy" size={14} color={colors.primaryDark} />
              <Text style={styles.footerHelpPillText}>{tr('marketingChrome.helpCenter')}</Text>
            </Pressable>
          </Link>
          <Link href="mailto:info@cantia.ch" target="_blank" asChild>
            <Pressable style={styles.footerContact}>
              <Feather name="mail" size={13} color={colors.textMuted} />
              <Text style={styles.footerContactText}>{tr('marketingChrome.contactSuffix')}</Text>
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
            <Link href={servicesHref as any}>
              <Text style={styles.footerLink}>{t.footer.servicesLink}</Text>
            </Link>
          )}
          {onPricingPress ? (
            <Pressable onPress={onPricingPress}>
              <Text style={styles.footerLink}>{t.footer.pricingLink}</Text>
            </Pressable>
          ) : (
            <Link href={pricingHref as any}>
              <Text style={styles.footerLink}>{t.footer.pricingLink}</Text>
            </Link>
          )}
          <Link href="/solutions/devis">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsDevis')}</Text>
          </Link>
          <Link href="/solutions/facturation">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsFacturation')}</Text>
          </Link>
          <Link href="/solutions/rapports-chantier">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsRapports')}</Text>
          </Link>
          <Link href="/solutions/dictee-vocale">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsDictee')}</Text>
          </Link>
          <Link href="/solutions/planning">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsPlanning')}</Text>
          </Link>
          <Link href="/solutions/rentabilite">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsRentabilite')}</Text>
          </Link>
          <Link href="/solutions/rh-salaires">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsRh')}</Text>
          </Link>
          <Link href="/solutions/travaux-supplementaires">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsTravauxSupp')}</Text>
          </Link>
          <Link href="/solutions/tresorerie">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsTresorerie')}</Text>
          </Link>
          <Link href="/integrations">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsIntegrations')}</Text>
          </Link>
          <Link href="/sur-mesure">
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsSurMesure')}</Text>
          </Link>
          <Link href={locale === 'de' ? '/de/blog' : '/blog'}>
            <Text style={styles.footerLink}>{tr('marketingChrome.solutionsBlog')}</Text>
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
          <Link href={aideHref as any}>
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
        <LanguageSwitcher compact />
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
  navOuter: {
    width: '100%',
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
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
  langSwitcherCompact: {
    marginLeft: 0,
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileMenuHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mobileMenuBody: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  // A plain stacked list — large type, a hairline between rows, nothing
  // else — reads calmer than the earlier boxed/icon-badge treatment and
  // lets the type carry it, closer to how the rest of the marketing site's
  // typography-led sections already look.
  mobileMenuGroup: {
    marginBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mobileMenuItem: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileMenuItemLast: {
    borderBottomWidth: 0,
  },
  mobileMenuText: {
    fontFamily: marketingFonts.display,
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  mobileMenuSecondaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  mobileMenuSecondaryText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  mobileMenuCta: {},
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

// A <Link asChild> clones its child through a <Slot> that only accepts a
// single flattened style object on that direct child, not an array — the
// usual RN "[base, condition && variant]" pattern throws "[expo-router]:
// You are passing an array of styles to a child of <Slot>" and takes down
// the whole page's error boundary. Flattened once here at module scope
// (it's static) for the one row — last in its group — that needs the
// bottom hairline removed.
const mobileMenuLastItemStyle = StyleSheet.flatten([styles.mobileMenuItem, styles.mobileMenuItemLast]);
