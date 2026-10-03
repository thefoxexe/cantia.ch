import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BrandFooter } from './brand/ProductChrome';
import { Link, usePathname, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button } from './ui';
import { breakpoints, colors, fontSize, radius, spacing } from '../lib/theme';
import { displayType, marketingFonts } from '../lib/marketingTheme';
import { landingFonts } from '../lib/landingTheme';
import { authHref, toggleLocalePathname, useSyncMarketingLocaleFromPath } from '../lib/appHost';
import { useMarketingDict } from '../lib/i18n';
import { AVAILABLE_LOCALES, getAppLocale, useTranslation, type AppLocale } from '../lib/translations';
import { StatusLink } from './StatusLink';
import { BrandLockup, BrandLogo } from '../components/brand/Logo';

const LOCALE_META: Record<AppLocale, { flag: string; label: string }> = {
  fr: { flag: '🇫🇷', label: 'Français' },
  de: { flag: '🇩🇪', label: 'Deutsch' },
  it: { flag: '🇮🇹', label: 'Italiano' },
};
const LANG_DROPDOWN_WIDTH = 168;
const NAV_FULL_MIN_WIDTH = 1100;

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getAppLocale();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const triggerRef = useRef<View>(null);

  const goToLocale = (next: AppLocale) => {
    setOpen(false);
    if (next === locale) return;
    const target = toggleLocalePathname(pathname, next);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.assign(target);
    } else {
      router.push(target as any);
    }
  };

  function openDropdown() {
    triggerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setAnchor({ x: pageX, y: pageY, width, height });
      setOpen(true);
    });
  }

  const dropdownLeft = anchor
    ? Math.min(Math.max(12, anchor.x + anchor.width - LANG_DROPDOWN_WIDTH), winWidth - LANG_DROPDOWN_WIDTH - 12)
    : 0;

  const DROPDOWN_ROW_HEIGHT = 40;
  const dropdownHeight = AVAILABLE_LOCALES.length * DROPDOWN_ROW_HEIGHT + spacing.xs * 2;
  const gap = 6;
  const openUpward = !!anchor && winHeight - (anchor.y + anchor.height) < dropdownHeight + gap && anchor.y > dropdownHeight + gap;
  const dropdownTop = anchor ? (openUpward ? anchor.y - dropdownHeight - gap : anchor.y + anchor.height + gap) : 0;

  return (
    <View ref={triggerRef} collapsable={false} style={compact ? styles.langSwitcherCompact : undefined}>
      <Pressable onPress={openDropdown} style={({ hovered }: any) => [styles.langTrigger, hovered && styles.langTriggerHovered]}>
        <Text style={styles.langTriggerFlag}>{LOCALE_META[locale].flag}</Text>
        <Text style={styles.langTriggerCode}>{locale.toUpperCase()}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={13} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        {anchor ? (
          <View style={[styles.langDropdown, { top: dropdownTop, left: dropdownLeft, width: LANG_DROPDOWN_WIDTH }]}>
            {AVAILABLE_LOCALES.map((loc) => (
              <Pressable
                key={loc}
                onPress={() => goToLocale(loc)}
                style={({ hovered }: any) => [styles.langOption, hovered && styles.langOptionHovered]}
              >
                <Text style={styles.langOptionFlag}>{LOCALE_META[loc].flag}</Text>
                <Text style={[styles.langOptionText, loc === locale && styles.langOptionTextActive]}>{LOCALE_META[loc].label}</Text>
                {loc === locale ? <Feather name="check" size={14} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

export function MarketingNav({
  onServicesPress,
  onPricingPress,
}: {
  onServicesPress?: () => void;
  onPricingPress?: () => void;
} = {}) {
  const t = useMarketingDict();
  const { t: tr } = useTranslation();
  const locale = getAppLocale();
  const pathname = usePathname();
  const router = useRouter();
  const homeHref = locale === 'de' ? '/de' : locale === 'it' ? '/it' : '/';
  const servicesHref = locale === 'de' ? '/de/#services' : locale === 'it' ? '/it/#services' : '/#services';
  const pricingHref = locale === 'de' ? '/de/#pricing' : locale === 'it' ? '/it/#pricing' : '/#pricing';
  const aideHref = locale === 'de' ? '/de/aide' : locale === 'it' ? '/it/aide' : '/aide';
  const telechargementHref = locale === 'de' ? '/de/telechargement' : locale === 'it' ? '/it/telechargement' : '/telechargement';
  const contactHref = locale === 'de' ? '/de/contact' : locale === 'it' ? '/it/contact' : '/contact';
  const { width } = useWindowDimensions();
  // The full lockup (C-A-N-T-I-A) plus seven entries need ~1000px (French
  // is the longest); below that the links go into the hamburger menu. The
  // lockup only shrinks to the mark on phones.
  const isCompactNav = width < NAV_FULL_MIN_WIDTH;
  const isPhone = width < breakpoints.tablet;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

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
        <Pressable style={styles.navBrandRow} accessibilityLabel="Cantia">
          <BrandLockup height={isPhone ? 32 : 30} compact={isPhone} />
        </Pressable>
      </Link>

      {isCompactNav ? (
        <Pressable onPress={() => setMenuOpen(true)} style={styles.hamburgerButton} hitSlop={8} accessibilityLabel={tr('marketingChrome.menu')}>
          <Feather name="menu" size={22} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.navLinks}>
          {onServicesPress ? (
            <Pressable onPress={onServicesPress}>
              <Text style={styles.navLink}>{t.landingNav.features}</Text>
            </Pressable>
          ) : (
            <Link href={servicesHref as any}>
              <Text style={styles.navLink}>{t.landingNav.features}</Text>
            </Link>
          )}
          {onPricingPress ? (
            <Pressable onPress={onPricingPress}>
              <Text style={styles.navLink}>{t.landingNav.pricing}</Text>
            </Pressable>
          ) : (
            <Link href={pricingHref as any}>
              <Text style={styles.navLink}>{t.landingNav.pricing}</Text>
            </Link>
          )}
          <Link href={telechargementHref as any}>
            <Text style={styles.navLink}>{t.landingNav.mobileApp}</Text>
          </Link>
          <Link href={aideHref as any}>
            <Text style={styles.navLink}>{t.landingNav.help}</Text>
          </Link>
          <Link href={contactHref as any}>
            <Text style={styles.navLink}>{t.landingNav.contact}</Text>
          </Link>
          <LanguageSwitcher />
          <Link href={authHref('login')}>
            <Text style={styles.navLink}>{t.landingNav.login}</Text>
          </Link>
          <Link href={authHref('signup')} asChild>
            <Button title={t.landingNav.signup} onPress={() => {}} style={styles.navCta} />
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
                <BrandLogo height={26} />
              </View>
              <View style={styles.mobileMenuHeaderRight}>
                <LanguageSwitcher />
                <Pressable onPress={() => setMenuOpen(false)} style={styles.hamburgerButton} hitSlop={8} accessibilityLabel={tr('marketingChrome.close')}>
                  <Feather name="x" size={22} color={colors.text} />
                </Pressable>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.mobileMenuBody} showsVerticalScrollIndicator={false}>
              <View style={styles.mobileMenuGroup}>
                {onServicesPress ? (
                  <Pressable style={styles.mobileMenuItem} onPress={() => { setMenuOpen(false); onServicesPress(); }}>
                    <Text style={styles.mobileMenuText}>{t.landingNav.features}</Text>
                  </Pressable>
                ) : (
                  <Link href={servicesHref as any} asChild>
                    <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                      <Text style={styles.mobileMenuText}>{t.landingNav.features}</Text>
                    </Pressable>
                  </Link>
                )}
                {onPricingPress ? (
                  <Pressable style={styles.mobileMenuItem} onPress={() => { setMenuOpen(false); onPricingPress(); }}>
                    <Text style={styles.mobileMenuText}>{t.landingNav.pricing}</Text>
                  </Pressable>
                ) : (
                  <Link href={pricingHref as any} asChild>
                    <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                      <Text style={styles.mobileMenuText}>{t.landingNav.pricing}</Text>
                    </Pressable>
                  </Link>
                )}
                <Link href={telechargementHref as any} asChild>
                  <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                    <Text style={styles.mobileMenuText}>{t.landingNav.mobileApp}</Text>
                  </Pressable>
                </Link>
                <Link href={aideHref as any} asChild>
                  <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                    <Text style={styles.mobileMenuText}>{t.landingNav.help}</Text>
                  </Pressable>
                </Link>
                <Link href={contactHref as any} asChild>
                  <Pressable style={mobileMenuLastItemStyle} onPress={() => setMenuOpen(false)}>
                    <Text style={styles.mobileMenuText}>{t.landingNav.contact}</Text>
                  </Pressable>
                </Link>
              </View>

              <Link href={authHref('login')} asChild>
                <Pressable style={styles.mobileMenuSecondaryItem} onPress={() => setMenuOpen(false)}>
                  <Feather name="log-in" size={15} color={colors.textMuted} />
                  <Text style={styles.mobileMenuSecondaryText}>{t.landingNav.login}</Text>
                </Pressable>
              </Link>

              <Link href={authHref('signup')} asChild>
                <Button title={t.landingNav.signup} onPress={() => setMenuOpen(false)} style={styles.mobileMenuCta} />
              </Link>
            </ScrollView>
          </Animated.View>
        </Modal>
      ) : null}
      </View>
    </View>
  );
}

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
  const servicesHref = locale === 'de' ? '/de/#services' : locale === 'it' ? '/it/#services' : '/#services';
  const pricingHref = locale === 'de' ? '/de/#pricing' : locale === 'it' ? '/it/#pricing' : '/#pricing';
  const aideHref = locale === 'de' ? '/de/aide' : locale === 'it' ? '/it/aide' : '/aide';
  const contactHref = locale === 'de' ? '/de/contact' : locale === 'it' ? '/it/contact' : '/contact';
  const localePrefix = locale === 'de' ? '/de' : locale === 'it' ? '/it' : '';
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const legalLinks = (
    <View style={styles.footerLegalLinks}>
      <Link href={`${localePrefix}/mentions-legales` as any}>
        <Text style={styles.footerCopy}>{t.footer.legalLink}</Text>
      </Link>
      <Link href={`${localePrefix}/confidentialite` as any}>
        <Text style={styles.footerCopy}>{t.footer.privacyLink}</Text>
      </Link>
      <Link href={`${localePrefix}/conditions-generales` as any}>
        <Text style={styles.footerCopy}>{t.footer.cgvLink}</Text>
      </Link>
      <StatusLink label={t.footer.statusLink} textStyle={styles.footerCopy} />
    </View>
  );
  return (
    <BrandFooter
      lockup={<BrandLogo height={wide ? 38 : 34} tone="black" />}
      tagline={t.footer.blurb}
      contact={
        <View style={{ gap: 4 }}>
          <Link href="mailto:info@cantia.ch" style={styles.footerContactText}>
            info@cantia.ch
          </Link>
          <Link href="tel:+41784501457" style={styles.footerContactText}>
            +41 78 450 14 57
          </Link>
        </View>
      }
      locale={locale}
      wide={wide}
      columns={[
        {
          title: t.footer.platformTitle,
          links: [
            { label: t.footer.platformDevis, href: `${localePrefix}/solutions/devis` },
            { label: t.footer.platformFactures, href: `${localePrefix}/solutions/facturation` },
            { label: t.footer.platformChantiers, href: `${localePrefix}/solutions/rapports-chantier` },
            { label: t.footer.platformRh, href: `${localePrefix}/solutions/rh-salaires` },
            { label: t.footer.platformRentabilite, href: `${localePrefix}/solutions/rentabilite` },
          ],
        },
        {
          title: t.footer.discoverTitle,
          links: [
            onServicesPress ? { label: t.footer.discoverFeatures, onPress: onServicesPress } : { label: t.footer.discoverFeatures, href: servicesHref },
            onPricingPress ? { label: t.footer.discoverPricing, onPress: onPricingPress } : { label: t.footer.discoverPricing, href: pricingHref },
            { label: t.footer.discoverMetier, href: `${localePrefix}/metiers` },
            { label: t.footer.discoverIntegrations, href: `${localePrefix}/integrations` },
            { label: t.footer.discoverSurMesure, href: `${localePrefix}/sur-mesure` },
          ],
        },
        {
          title: t.footer.productsTitle,
          links: [
            { label: t.footer.productsApp, href: authHref('signup') as string },
            { label: t.footer.fiduciaryLink, href: `https://accounting.cantia.ch${localePrefix}` },
            { label: t.footer.partnersLink, href: `https://partners.cantia.ch${localePrefix}` },
          ],
        },
        {
          title: t.footer.resourcesTitle,
          links: [
            { label: t.footer.resourcesHelp, href: aideHref },
            { label: t.footer.resourcesMobile, href: `${localePrefix}/telechargement` },
            { label: t.footer.resourcesBlog, href: locale === 'de' ? '/de/blog' : locale === 'it' ? '/it/blog' : '/blog' },
            { label: locale === 'de' ? 'Lohnrechner' : locale === 'it' ? 'Calcolatore di salario' : 'Calculateur de salaire', href: `${localePrefix}/calculateur-salaire` },
            { label: t.footer.resourcesContact, href: contactHref },
            { label: t.footer.resourcesLogin, href: authHref('login') as string },
          ],
        },
      ]}
      bottomLinks={legalLinks}
    />
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
    fontFamily: landingFonts.body,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: colors.text,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  navLink: {
    fontFamily: landingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  navCta: {
    paddingHorizontal: spacing.lg,
    borderRadius: 3,
    shadowOpacity: 0,
  },
  langSwitcherCompact: {
    marginLeft: 0,
  },
  langTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  langTriggerHovered: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  langTriggerFlag: {
    fontSize: 15,
  },
  langTriggerCode: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.4,
  },
  langDropdown: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 0,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  langOptionHovered: {
    backgroundColor: colors.surfaceAlt,
  },
  langOptionFlag: {
    fontSize: 16,
  },
  langOptionText: {
    flex: 1,
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  langOptionTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    borderRadius: 3,
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
    fontFamily: landingFonts.body,
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
  mobileMenuCta: { borderRadius: 3, shadowOpacity: 0 },
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
    width: 28,
    height: 28,
  },
  footerBrand: {
    ...displayType,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.text,
  },
  footerText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    maxWidth: 280,
    marginTop: spacing.xs,
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
    fontFamily: marketingFonts.mono,
    fontSize: fontSize.xs,
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
  footerLegalLinks: {
    flexShrink: 1,
    maxWidth: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.lg,
    rowGap: spacing.sm,
  },
});

const mobileMenuLastItemStyle = StyleSheet.flatten([styles.mobileMenuItem, styles.mobileMenuItemLast]);
