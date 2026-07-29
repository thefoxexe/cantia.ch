import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button, Screen } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useLanguage, planLabel, LANGUAGES, type Lang } from '../lib/i18n';
import { colors, fontSize, radius, spacing, breakpoints } from '../lib/theme';
import type { Plan } from '../lib/types';

type IconName = keyof typeof Feather.glyphMap;

const PAIN_ICONS: IconName[] = ['edit-3', 'clock', 'folder'];
const FEATURE_ICONS: IconName[] = ['file-text', 'folder', 'image', 'zap', 'list', 'map-pin', 'users'];
const NAV_HEIGHT = 68;

export default function LandingScreen() {
  const { t, lang, setLang } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { width, height: windowHeight } = useWindowDimensions();
  const isCompactNav = width < breakpoints.tablet;

  const menuAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;

  // Scroll-triggered section reveals: each section registers its own y
  // offset on layout, and the shared scroll handler below fades + lifts it
  // in once it's ~85% into the viewport. Plain refs (not state) hold the
  // per-section Animated.Value / offset / "already played" bookkeeping so
  // that a scroll re-render never has to walk through setState.
  const sectionOffsets = useRef<Record<string, number>>({}).current;
  const sectionAnims = useRef<Record<string, Animated.Value>>({}).current;
  const sectionTriggered = useRef<Record<string, boolean>>({}).current;
  const scrollYRef = useRef(0);

  const getSectionAnim = useCallback((key: string): Animated.Value => {
    if (!sectionAnims[key]) sectionAnims[key] = new Animated.Value(0);
    return sectionAnims[key];
  }, [sectionAnims]);

  const checkReveals = useCallback(
    (scrollY: number, viewportH: number) => {
      for (const key of Object.keys(sectionOffsets)) {
        if (sectionTriggered[key]) continue;
        if (scrollY + viewportH * 0.85 > sectionOffsets[key]) {
          sectionTriggered[key] = true;
          Animated.timing(getSectionAnim(key), {
            toValue: 1,
            duration: 640,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        }
      }
    },
    [getSectionAnim, sectionOffsets, sectionTriggered],
  );

  const registerSection = useCallback(
    (key: string, y: number) => {
      sectionOffsets[key] = y;
      checkReveals(scrollYRef.current, windowHeight);
    },
    [checkReveals, sectionOffsets, windowHeight],
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      scrollYRef.current = y;
      setScrolled((prev) => (prev !== y > 4 ? y > 4 : prev));
      checkReveals(y, e.nativeEvent.layoutMeasurement.height);
    },
    [checkReveals],
  );

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .order('price_chf_monthly', { ascending: true })
      .then(({ data }) => setPlans(data ?? []));
  }, []);

  useEffect(() => {
    Animated.stagger(90, [
      Animated.timing(heroAnim, { toValue: 1, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [heroAnim]);

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 220,
      easing: menuOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [menuOpen, menuAnim]);

  const scrollToPricing = useCallback(() => {
    setMenuOpen(false);
    const y = sectionOffsets.pricing ?? 0;
    scrollRef.current?.scrollTo({ y: y - NAV_HEIGHT - 12, animated: true });
  }, [sectionOffsets]);

  const scrollToServices = useCallback(() => {
    setMenuOpen(false);
    const y = sectionOffsets.services ?? 0;
    scrollRef.current?.scrollTo({ y: y - NAV_HEIGHT - 12, animated: true });
  }, [sectionOffsets]);

  return (
    <Screen>
      <View style={styles.stage}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={{ height: NAV_HEIGHT }} />

          {/* ---- Hero ---- */}
          <View style={styles.heroWrap}>
            <View pointerEvents="none" style={styles.heroBlobA} />
            <View pointerEvents="none" style={styles.heroBlobB} />
            <Animated.View
              style={[
                styles.hero,
                {
                  opacity: heroAnim,
                  transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
                },
              ]}
            >
              <View style={styles.heroCopy}>
                <View style={styles.kicker}>
                  <Feather name="zap" size={12} color={colors.primary} />
                  <Text style={styles.kickerText}>{t.hero.kicker}</Text>
                </View>
                <Text style={styles.headline}>{t.hero.headline}</Text>
                <Text style={styles.subheadline}>{t.hero.subheadline}</Text>
                <View style={styles.ctaRow}>
                  <Link href="/(auth)/signup" asChild>
                    <Button title={t.hero.cta1} onPress={() => {}} style={styles.ctaButton} />
                  </Link>
                  <Link href="/(auth)/login" asChild>
                    <Button title={t.hero.cta2} onPress={() => {}} variant="secondary" style={styles.ctaButton} />
                  </Link>
                </View>
              </View>

              <AppPreview lang={lang} />
            </Animated.View>
          </View>

          {/* ---- Pain points ---- */}
          <Reveal id="pain" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.pain.title}</Text>
            <View style={styles.painGrid}>
              {t.pain.items.map((p, i) => (
                <View key={p.title} style={styles.painCard}>
                  <View style={styles.painIconBadge}>
                    <Feather name={PAIN_ICONS[i]} size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.painTitle}>{p.title}</Text>
                  <Text style={styles.painText}>{p.text}</Text>
                </View>
              ))}
            </View>
          </Reveal>

          {/* ---- Services ---- */}
          <Reveal id="services" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={styles.sectionTitle}>{t.services.title}</Text>
            <Text style={styles.sectionSubtitle}>{t.services.subtitle}</Text>
            <View style={styles.featureGrid}>
              {t.services.items.map((f, i) => {
                const expanded = expandedFeature === i;
                return (
                  <Pressable
                    key={f.title}
                    style={({ pressed, hovered }: any) => [
                      styles.featureCard,
                      expanded && styles.featureCardActive,
                      (pressed || hovered) && styles.featureCardHovered,
                    ]}
                    onPress={() => setExpandedFeature(expanded ? null : i)}
                  >
                    <View style={styles.featureCardHeader}>
                      <View style={styles.featureIcon}>
                        <Feather name={FEATURE_ICONS[i]} size={18} color={colors.primary} />
                      </View>
                      <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                    </View>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureText}>{f.text}</Text>
                    {expanded ? (
                      <View style={styles.featureDetail}>
                        {f.detail.map((line) => (
                          <View key={line} style={styles.featureDetailRow}>
                            <Feather name="check" size={13} color={colors.success} />
                            <Text style={styles.featureDetailText}>{line}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </Reveal>

          {/* ---- Trades ---- */}
          <Reveal id="trades" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.trades.title}</Text>
            <View style={styles.tradeRow}>
              {t.trades.list.map((trade) => (
                <View key={trade} style={styles.tradeChip}>
                  <Text style={styles.tradeChipText}>{trade}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.tradeNote}>{t.trades.note}</Text>
          </Reveal>

          {/* ---- Pricing ---- */}
          <Reveal id="pricing" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.pricing.title}</Text>
            <View style={styles.pricingGrid}>
              {plans.map((p) => (
                <View key={p.id} style={[styles.priceCard, p.id === 'solo' && styles.priceCardHighlight]}>
                  {p.id === 'solo' ? (
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceBadgeText}>{t.pricing.badge}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.priceName}>{planLabel(p.id, p.name, lang)}</Text>
                  <View style={styles.priceAmountRow}>
                    <Text style={styles.priceAmount}>{p.price_chf_monthly === 0 ? 'CHF 0' : `CHF ${p.price_chf_monthly}`}</Text>
                    <Text style={styles.pricePeriod}>/{lang === 'de' ? 'Monat' : lang === 'en' ? 'month' : 'mois'}</Text>
                  </View>
                  <View style={styles.priceFeatures}>
                    <PriceFeature
                      text={`${(p.storage_quota_mb / 1024).toFixed(p.storage_quota_mb < 1024 ? 1 : 0)} ${t.pricing.storageSuffix}`}
                    />
                    <PriceFeature text={`${p.max_members} ${p.max_members > 1 ? t.pricing.memberPlural : t.pricing.memberSingular}`} />
                    <PriceFeature text={t.pricing.unlimited} />
                    <PriceFeature text={t.pricing.surveyFeature} muted={!p.has_rtk} included={p.has_rtk} />
                  </View>
                  <Link href="/(auth)/signup" asChild>
                    <Button
                      title={p.price_chf_monthly === 0 ? t.pricing.freeCta : t.pricing.paidCta}
                      onPress={() => {}}
                      variant={p.id === 'solo' ? 'primary' : 'secondary'}
                    />
                  </Link>
                </View>
              ))}
            </View>
          </Reveal>

          {/* ---- Swiss positioning ---- */}
          <Reveal id="swiss" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section} from={18}>
            <View style={styles.swissBand}>
              <View style={styles.swissIconBadge}>
                <Feather name="flag" size={22} color={colors.primary} />
              </View>
              <Text style={styles.swissTitle}>{t.swiss.title}</Text>
              <Text style={styles.swissText}>{t.swiss.text}</Text>
            </View>
          </Reveal>

          {/* ---- Mobile apps ---- */}
          <Reveal id="mobile" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section} from={18}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.mobile.title}</Text>
            <Text style={styles.mobileText}>{t.mobile.text}</Text>
            <View style={styles.storeRow}>
              <StoreBadge kind="apple" label={t.mobile.appStore} comingSoon={t.mobile.comingSoon} />
              <StoreBadge kind="google" label={t.mobile.googlePlay} comingSoon={t.mobile.comingSoon} />
            </View>
          </Reveal>

          {/* ---- Final CTA ---- */}
          <Reveal id="finalCta" getAnim={getSectionAnim} onRegister={registerSection} style={styles.finalCtaOuter} from={18}>
            <View style={styles.finalCta}>
              <Text style={styles.finalCtaTitle}>{t.finalCta.title}</Text>
              <Link href="/(auth)/signup" asChild>
                <Button
                  title={t.finalCta.button}
                  onPress={() => {}}
                  variant="secondary"
                  style={styles.finalCtaButton}
                />
              </Link>
            </View>
          </Reveal>

          <View style={styles.footer}>
            <View style={styles.footerGrid}>
              <View style={styles.footerBrandCol}>
                <View style={styles.footerBrandRow}>
                  <Image source={require('../assets/logo-mark.png')} style={styles.footerLogo} resizeMode="contain" />
                  <Text style={styles.footerBrand}>Opus-Flow</Text>
                </View>
                <Text style={styles.footerText}>{t.footer.blurb}</Text>
              </View>
              <View style={styles.footerCol}>
                <Text style={styles.footerColTitle}>{t.footer.product}</Text>
                <Pressable onPress={scrollToServices}>
                  <Text style={styles.footerLink}>{t.footer.servicesLink}</Text>
                </Pressable>
                <Pressable onPress={scrollToPricing}>
                  <Text style={styles.footerLink}>{t.footer.pricingLink}</Text>
                </Pressable>
              </View>
              <View style={styles.footerCol}>
                <Text style={styles.footerColTitle}>{t.footer.account}</Text>
                <Link href="/(auth)/login">
                  <Text style={styles.footerLink}>{t.footer.login}</Text>
                </Link>
                <Link href="/(auth)/signup">
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
            </View>
          </View>
        </ScrollView>

        {/* ---- Fixed nav ---- */}
        <View style={[styles.navFixed, scrolled && styles.navFixedScrolled]}>
          <View style={styles.nav}>
            <View style={styles.navBrandRow}>
              <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" />
              <Text style={styles.navBrand}>Opus-Flow</Text>
            </View>

            {isCompactNav ? (
              <View style={styles.navCompactRight}>
                <Link href="/(auth)/signup" asChild>
                  <Button title={t.nav.cta} onPress={() => {}} style={styles.navCta} />
                </Link>
                <Pressable
                  onPress={() => setMenuOpen((v) => !v)}
                  style={styles.hamburgerButton}
                  hitSlop={8}
                  accessibilityLabel="Menu"
                >
                  <Feather name={menuOpen ? 'x' : 'menu'} size={22} color={colors.text} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.navLinks}>
                <View style={styles.langSwitcher}>
                  {LANGUAGES.map((l) => (
                    <Pressable key={l.code} onPress={() => setLang(l.code)} style={styles.langButton}>
                      <Text style={[styles.langButtonText, lang === l.code && styles.langButtonTextActive]}>{l.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={scrollToServices}>
                  <Text style={styles.navLink}>{t.nav.services}</Text>
                </Pressable>
                <Pressable onPress={scrollToPricing}>
                  <Text style={styles.navLink}>{t.nav.pricing}</Text>
                </Pressable>
                <Link href="/(auth)/login">
                  <Text style={styles.navLink}>{t.nav.login}</Text>
                </Link>
                <Link href="/(auth)/signup" asChild>
                  <Button title={t.nav.cta} onPress={() => {}} style={styles.navCta} />
                </Link>
              </View>
            )}
          </View>
        </View>

        {isCompactNav ? (
          <Modal visible={menuOpen} animationType="none" transparent onRequestClose={() => setMenuOpen(false)}>
            <Animated.View style={[styles.menuBackdrop, { opacity: menuAnim }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />
            </Animated.View>
            <Animated.View
              style={[
                styles.mobileMenu,
                {
                  opacity: menuAnim,
                  transform: [
                    {
                      translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.mobileMenuHeader}>
                <View style={styles.navBrandRow}>
                  <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" />
                  <Text style={styles.navBrand}>Opus-Flow</Text>
                </View>
                <Pressable onPress={() => setMenuOpen(false)} style={styles.hamburgerButton} hitSlop={8} accessibilityLabel="Fermer">
                  <Feather name="x" size={20} color={colors.text} />
                </Pressable>
              </View>

              <Pressable onPress={scrollToServices} style={styles.mobileMenuItem}>
                <Feather name="grid" size={17} color={colors.primary} />
                <Text style={styles.mobileMenuText}>{t.nav.services}</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.mobileMenuChevron} />
              </Pressable>
              <Pressable onPress={scrollToPricing} style={styles.mobileMenuItem}>
                <Feather name="tag" size={17} color={colors.primary} />
                <Text style={styles.mobileMenuText}>{t.nav.pricing}</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.mobileMenuChevron} />
              </Pressable>
              <Link href="/(auth)/login" asChild>
                <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                  <Feather name="log-in" size={17} color={colors.primary} />
                  <Text style={styles.mobileMenuText}>{t.nav.login}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.mobileMenuChevron} />
                </Pressable>
              </Link>

              <Link href="/(auth)/signup" asChild>
                <Button title={t.nav.cta} onPress={() => setMenuOpen(false)} style={styles.mobileMenuCta} />
              </Link>

              <View style={styles.mobileMenuLangRow}>
                <View style={styles.langSwitcher}>
                  {LANGUAGES.map((l) => (
                    <Pressable key={l.code} onPress={() => setLang(l.code)} style={styles.langButton}>
                      <Text style={[styles.langButtonText, lang === l.code && styles.langButtonTextActive]}>{l.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Animated.View>
          </Modal>
        ) : null}
      </View>
    </Screen>
  );
}

// Defined at module scope (not nested inside LandingScreen) so its
// component identity is stable across renders — a component defined
// inside another component's render body gets a new function identity
// every render, which makes React unmount/remount it. If that remount
// landed right as an Animated.timing had just started, the fresh
// Animated.View mounted at the value's current (still ~0) progress and
// nothing resumed it, permanently freezing that section at opacity 0.
function Reveal({
  id,
  getAnim,
  onRegister,
  children,
  style,
  from = 26,
}: {
  id: string;
  getAnim: (id: string) => Animated.Value;
  onRegister: (id: string, y: number) => void;
  children: React.ReactNode;
  style?: any;
  from?: number;
}) {
  const anim = getAnim(id);
  return (
    <Animated.View
      onLayout={(e) => onRegister(id, e.nativeEvent.layout.y)}
      style={[
        style,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function PriceFeature({ text, muted, included }: { text: string; muted?: boolean; included?: boolean }) {
  return (
    <View style={styles.priceFeatureRow}>
      <Feather
        name={muted ? 'x' : 'check'}
        size={14}
        color={muted ? colors.textMuted : included === false ? colors.textMuted : colors.success}
      />
      <Text style={[styles.priceFeatureText, muted && styles.priceFeatureTextMuted]}>{text}</Text>
    </View>
  );
}

function StoreBadge({ kind, label, comingSoon }: { kind: 'apple' | 'google'; label: string; comingSoon: string }) {
  const isApple = kind === 'apple';
  return (
    <View style={styles.storeBadge}>
      <Ionicons name={isApple ? 'logo-apple' : 'logo-google-playstore'} size={26} color="#fff" />
      <View>
        <Text style={styles.storeBadgeSmall}>{comingSoon}</Text>
        <Text style={styles.storeBadgeBig}>{label}</Text>
      </View>
    </View>
  );
}

const PREVIEW_COPY: Record<Lang, { greeting: string; sites: string; reports: string; devis: string; project: string; devisNumber: string; photos: string }> = {
  fr: { greeting: 'Bonjour', sites: 'Chantiers', reports: 'Rapports', devis: 'Devis', project: 'Villa Dupont — rénovation', devisNumber: 'Devis DEV-2026-0032', photos: '18 photos géolocalisées' },
  en: { greeting: 'Hello', sites: 'Sites', reports: 'Reports', devis: 'Quotes', project: 'Villa Dupont — renovation', devisNumber: 'Quote QT-2026-0032', photos: '18 geolocated photos' },
  de: { greeting: 'Guten Tag', sites: 'Baustellen', reports: 'Rapporte', devis: 'Offerten', project: 'Villa Dupont — Renovation', devisNumber: 'Offerte AN-2026-0032', photos: '18 georeferenzierte Fotos' },
};

function AppPreview({ lang }: { lang: Lang }) {
  const copy = PREVIEW_COPY[lang];
  return (
    <View style={styles.preview}>
      <View style={styles.previewChrome}>
        <View style={styles.previewDot} />
        <View style={styles.previewDot} />
        <View style={styles.previewDot} />
      </View>
      <View style={styles.previewBody}>
        <Text style={styles.previewGreeting}>{copy.greeting}</Text>
        <Text style={styles.previewOrg}>Dupont Serrurerie Sàrl</Text>
        <View style={styles.previewStatsRow}>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>12</Text>
            <Text style={styles.previewStatLabel}>{copy.sites}</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>34</Text>
            <Text style={styles.previewStatLabel}>{copy.reports}</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>7</Text>
            <Text style={styles.previewStatLabel}>{copy.devis}</Text>
          </View>
        </View>
        <View style={styles.previewListRow}>
          <Feather name="hard-drive" size={14} color={colors.primary} />
          <Text style={styles.previewListText}>{copy.project}</Text>
        </View>
        <View style={styles.previewListRow}>
          <Feather name="file-text" size={14} color={colors.primary} />
          <Text style={styles.previewListText}>{copy.devisNumber}</Text>
        </View>
        <View style={styles.previewListRow}>
          <Feather name="image" size={14} color={colors.primary} />
          <Text style={styles.previewListText}>{copy.photos}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
  },
  navFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: NAV_HEIGHT,
    backgroundColor: 'rgba(245, 244, 240, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  navFixedScrolled: {
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  nav: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
  },
  navBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navLogo: {
    width: 26,
    height: 20,
  },
  navBrand: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3,
  },
  navLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexShrink: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  langSwitcher: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  langButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  langButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  langButtonTextActive: {
    color: colors.primary,
  },
  navLink: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  navCta: {
    height: 38,
    paddingHorizontal: spacing.lg,
  },
  navCompactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hamburgerButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 20, 18, 0.45)',
  },
  mobileMenu: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 2,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  mobileMenuChevron: {
    marginLeft: 'auto',
  },
  mobileMenuCta: {
    marginTop: spacing.lg,
  },
  mobileMenuLangRow: {
    paddingTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  heroBlobA: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: colors.primarySoft,
    opacity: 0.7,
  },
  heroBlobB: {
    position: 'absolute',
    top: 80,
    left: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.accentSoft,
    opacity: 0.5,
  },
  hero: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  heroCopy: {
    flex: 1,
    minWidth: 320,
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  kickerText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  headline: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 52,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  subheadline: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    lineHeight: 26,
    maxWidth: 480,
    marginBottom: spacing.xl,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  ctaButton: {
    minWidth: 220,
  },
  preview: {
    flex: 1,
    minWidth: 300,
    maxWidth: 380,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
  },
  previewChrome: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  previewBody: {
    padding: spacing.xl,
  },
  previewGreeting: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  previewOrg: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  previewStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  previewStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  previewStatValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  previewStatLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  previewListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewListText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xl,
    maxWidth: 640,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: -spacing.lg,
    marginBottom: spacing.xl,
  },
  centerText: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  painGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  painCard: {
    width: 280,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  painIconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  painTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  painText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  featureCard: {
    width: 320,
    flexGrow: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureCardHovered: {
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  featureCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  featureDetail: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  featureDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureDetailText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 19,
  },
  tradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tradeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tradeChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  tradeNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 560,
    alignSelf: 'center',
    lineHeight: 20,
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  priceCard: {
    width: 250,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  priceCardHighlight: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    transform: [{ scale: 1.03 }],
  },
  priceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  priceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  priceName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  priceAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  priceAmount: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  pricePeriod: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 4,
  },
  priceFeatures: {
    gap: spacing.xs,
  },
  priceFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  priceFeatureText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  priceFeatureTextMuted: {
    color: colors.textMuted,
  },
  swissBand: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
  },
  swissIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swissTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  swissText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 560,
    lineHeight: 22,
  },
  mobileText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 520,
    alignSelf: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  storeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#111414',
  },
  storeBadgeSmall: {
    fontSize: 10,
    color: '#C7CCC9',
  },
  storeBadgeBig: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#fff',
  },
  finalCtaOuter: {
    width: '100%',
    backgroundColor: colors.primary,
    marginTop: spacing.xxl,
  },
  finalCta: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  finalCtaTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 520,
  },
  finalCtaButton: {
    minWidth: 260,
  },
  footer: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  footerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxl,
    marginBottom: spacing.xl,
  },
  footerBrandCol: {
    flexGrow: 2,
    flexBasis: 240,
    maxWidth: 340,
  },
  footerCol: {
    flexGrow: 1,
    flexBasis: 140,
    gap: spacing.sm,
  },
  footerColTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  footerLogo: {
    width: 22,
    height: 17,
  },
  footerBrand: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  footerBottom: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerCopy: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
