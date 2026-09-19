import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link, usePathname, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button } from './ui';
import { breakpoints, colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { landingFonts } from '../lib/landingTheme';
import { authHref, toggleLocalePathname, useSyncMarketingLocaleFromPath } from '../lib/appHost';
import { useMarketingDict } from '../lib/i18n';
import { AVAILABLE_LOCALES, getAppLocale, useTranslation, type AppLocale } from '../lib/translations';

const LOCALE_META: Record<AppLocale, { flag: string; label: string }> = {
  fr: { flag: '🇫🇷', label: 'Français' },
  de: { flag: '🇩🇪', label: 'Deutsch' },
  it: { flag: '🇮🇹', label: 'Italiano' },
};
const LANG_DROPDOWN_WIDTH = 168;

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
  const isCompactNav = width < breakpoints.tablet;
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
                <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" accessibilityLabel="Cantia" />
                <Text style={styles.navBrand}>Cantia</Text>
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
  return (
    <View style={styles.footer}>
      <View style={styles.footerGrid}>
        <View style={styles.footerBrandCol}>
          <View style={styles.footerBrandRow}>
            <Image source={require('../assets/logo-mark.png')} style={styles.footerLogo} resizeMode="contain" accessibilityLabel="Cantia" />
            <Text style={styles.footerBrand}>Cantia</Text>
          </View>
          <Text style={styles.footerText}>{t.footer.blurb}</Text>
          <Link href="mailto:info@cantia.ch" target="_blank" asChild>
            <Pressable style={styles.footerContact}>
              <Text style={styles.footerContactText}>info@cantia.ch</Text>
            </Pressable>
          </Link>
          <Link href="tel:+41784501457" asChild>
            <Pressable style={styles.footerContact}>
              <Text style={styles.footerContactText}>+41 78 450 14 57</Text>
            </Pressable>
          </Link>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerColTitle}>{t.footer.platformTitle}</Text>
          <Link href={`${localePrefix}/solutions/devis` as any}>
            <Text style={styles.footerLink}>{t.footer.platformDevis}</Text>
          </Link>
          <Link href={`${localePrefix}/solutions/facturation` as any}>
            <Text style={styles.footerLink}>{t.footer.platformFactures}</Text>
          </Link>
          <Link href={`${localePrefix}/solutions/rapports-chantier` as any}>
            <Text style={styles.footerLink}>{t.footer.platformChantiers}</Text>
          </Link>
          <Link href={`${localePrefix}/solutions/rh-salaires` as any}>
            <Text style={styles.footerLink}>{t.footer.platformRh}</Text>
          </Link>
          <Link href={`${localePrefix}/solutions/rentabilite` as any}>
            <Text style={styles.footerLink}>{t.footer.platformRentabilite}</Text>
          </Link>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerColTitle}>{t.footer.discoverTitle}</Text>
          {onServicesPress ? (
            <Pressable onPress={onServicesPress}>
              <Text style={styles.footerLink}>{t.footer.discoverFeatures}</Text>
            </Pressable>
          ) : (
            <Link href={servicesHref as any}>
              <Text style={styles.footerLink}>{t.footer.discoverFeatures}</Text>
            </Link>
          )}
          {onPricingPress ? (
            <Pressable onPress={onPricingPress}>
              <Text style={styles.footerLink}>{t.footer.discoverPricing}</Text>
            </Pressable>
          ) : (
            <Link href={pricingHref as any}>
              <Text style={styles.footerLink}>{t.footer.discoverPricing}</Text>
            </Link>
          )}
          <Link href={`${localePrefix}/metiers` as any}>
            <Text style={styles.footerLink}>{t.footer.discoverMetier}</Text>
          </Link>
          <Link href={`${localePrefix}/integrations` as any}>
            <Text style={styles.footerLink}>{t.footer.discoverIntegrations}</Text>
          </Link>
          <Link href={`${localePrefix}/sur-mesure` as any}>
            <Text style={styles.footerLink}>{t.footer.discoverSurMesure}</Text>
          </Link>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerColTitle}>{t.footer.resourcesTitle}</Text>
          <Link href={aideHref as any}>
            <Text style={styles.footerLink}>{t.footer.resourcesHelp}</Text>
          </Link>
          <Link href={`${localePrefix}/telechargement` as any}>
            <Text style={styles.footerLink}>{t.footer.resourcesMobile}</Text>
          </Link>
          <Link href={locale === 'de' ? '/de/blog' : locale === 'it' ? '/it/blog' : '/blog'}>
            <Text style={styles.footerLink}>{t.footer.resourcesBlog}</Text>
          </Link>
          <Link href={contactHref as any}>
            <Text style={styles.footerLink}>{t.footer.resourcesContact}</Text>
          </Link>
          <Link href={authHref('login')}>
            <Text style={styles.footerLink}>{t.footer.resourcesLogin}</Text>
          </Link>
        </View>
      </View>
      <View style={styles.footerBottom}>
        <Text style={styles.footerCopy}>{t.footer.copyright.replace('{year}', String(new Date().getFullYear()))}</Text>
        <View style={styles.footerSocialRow}>
          <Link href="https://www.instagram.com/cantia.ch/" target="_blank" asChild>
            <Pressable style={styles.footerSocialLink} accessibilityLabel="Instagram">
              <Ionicons name="logo-instagram" size={18} color="#E1306C" />
            </Pressable>
          </Link>
          <Link href="https://www.linkedin.com/company/cantiach/" target="_blank" asChild>
            <Pressable style={styles.footerSocialLink} accessibilityLabel="LinkedIn">
              <Ionicons name="logo-linkedin" size={18} color="#0A66C2" />
            </Pressable>
          </Link>
          <Link href="https://www.youtube.com/@Cantiach" target="_blank" asChild>
            <Pressable style={styles.footerSocialLink} accessibilityLabel="YouTube">
              <Ionicons name="logo-youtube" size={18} color="#FF0000" />
            </Pressable>
          </Link>
        </View>
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
        </View>
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
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
    width: 28,
    height: 28,
  },
  footerBrand: {
    fontFamily: marketingFonts.display,
    fontSize: fontSize.xxl,
    fontWeight: '700',
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
  footerLegalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  footerSocialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerSocialLink: {
    padding: 2,
  },
});

const mobileMenuLastItemStyle = StyleSheet.flatten([styles.mobileMenuItem, styles.mobileMenuItemLast]);
