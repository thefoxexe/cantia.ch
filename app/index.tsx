import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Link, Redirect } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button, Screen } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useLanguage, planLabel, LANGUAGES, type Lang } from '../lib/i18n';
import { colors, fontSize, radius, spacing, breakpoints } from '../lib/theme';
import { authHref } from '../lib/appHost';
import type { Plan } from '../lib/types';

type IconName = keyof typeof Feather.glyphMap;

const PAIN_ICONS: IconName[] = ['edit-3', 'clock', 'folder'];
const FEATURE_ICONS: IconName[] = ['file-text', 'folder', 'image', 'zap', 'layout', 'list', 'map-pin', 'users'];
const NAV_HEIGHT = 68;

// The compiled Android/iOS app has no marketing site to show — it goes
// straight to the auth flow (app/_layout.tsx then takes over once the
// session is known, sending a logged-in user to the dashboard instead).
// This is a plain platform check ahead of LandingContent's hooks, not a
// conditional hook call, so it stays rules-of-hooks safe while skipping the
// landing page's data fetching/animations entirely on native.
export default function LandingScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <LandingContent />;
}

function LandingContent() {
  const { t, lang, setLang } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { width, height: windowHeight } = useWindowDimensions();
  const isCompactNav = width < breakpoints.tablet;
  // Fixed at 260px, the hero phone read as oversized on a narrow phone
  // screen instead of shrinking with everything else around it — scale it
  // off the viewport instead, capped at the same 260px on wider screens.
  const heroPhoneWidth = Math.max(150, Math.min(260, Math.round(width * 0.55)));
  const showcasePhoneWidth = Math.max(140, Math.min(200, Math.round(width * 0.5)));

  const menuAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const menuItemAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0)),
  ).current;

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
    if (menuOpen) {
      Animated.parallel([
        Animated.timing(menuAnim, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.stagger(
          55,
          menuItemAnims.map((v) =>
            Animated.timing(v, {
              toValue: 1,
              duration: 360,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ),
        ),
      ]).start();
    } else {
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
      menuItemAnims.forEach((v) => v.setValue(0));
    }
  }, [menuOpen, menuAnim, menuItemAnims]);

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
                  <Link href={authHref('signup')} asChild>
                    <Button title={t.hero.cta1} onPress={() => {}} style={styles.ctaButton} />
                  </Link>
                  <Link href={authHref('login')} asChild>
                    <Button title={t.hero.cta2} onPress={() => {}} variant="secondary" style={styles.ctaButton} />
                  </Link>
                </View>
              </View>

              <AppPreview phoneWidth={heroPhoneWidth} lang={lang} />
            </Animated.View>
          </View>

          {/* ---- Spotlight: voice dictation + Swiss QR-bill demos ---- */}
          <Reveal id="spotlight" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.spotlight.title}</Text>
            <Text style={[styles.sectionSubtitle, styles.centerText]}>{t.spotlight.subtitle}</Text>
            <View style={styles.spotlightGrid}>
              <VoiceDemo copy={t.spotlight.voice} />
              <QrBillDemo copy={t.spotlight.qrbill} />
            </View>
          </Reveal>

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

          {/* ---- Showcase ---- */}
          <Reveal id="showcase" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.showcase.title}</Text>
            <Text style={[styles.sectionSubtitle, styles.centerText]}>{t.showcase.subtitle}</Text>
            <PhoneCarousel
              phoneWidth={showcasePhoneWidth}
              showCaptions
              autoAdvanceMs={30000}
              items={[
                { key: 'feed', caption: t.showcase.feedCaption, source: SCREENS.feedSelect },
                { key: 'report', caption: t.showcase.reportCaption, source: SCREENS.reportPdf },
                { key: 'devisNew', caption: t.showcase.devisNewCaption, source: SCREENS.devisNew },
                { key: 'devis', caption: t.showcase.devisCaption, source: SCREENS.devisTotal },
              ]}
            />
          </Reveal>

          {/* ---- Trades ---- */}
          <Reveal id="trades" getAnim={getSectionAnim} onRegister={registerSection} style={[styles.section, styles.sectionCard]}>
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
          <Reveal id="pricing" getAnim={getSectionAnim} onRegister={registerSection} style={[styles.section, styles.sectionCard]}>
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
                  <Link href={authHref('signup')} asChild>
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
              <Link href={authHref('signup')} asChild>
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
                  <Text style={styles.footerBrand}>Cantia</Text>
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
            </View>
          </View>
        </ScrollView>

        {/* ---- Fixed nav ---- */}
        <View style={[styles.navFixed, scrolled && styles.navFixedScrolled]}>
          <View style={styles.nav}>
            <View style={styles.navBrandRow}>
              <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" />
              <Text style={styles.navBrand}>Cantia</Text>
            </View>

            {isCompactNav ? (
              <Pressable
                onPress={() => setMenuOpen((v) => !v)}
                style={styles.hamburgerButton}
                hitSlop={8}
                accessibilityLabel="Menu"
              >
                <Feather name={menuOpen ? 'x' : 'menu'} size={22} color={colors.text} />
              </Pressable>
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
                <Link href={authHref('login')}>
                  <Text style={styles.navLink}>{t.nav.login}</Text>
                </Link>
                <Link href={authHref('signup')} asChild>
                  <Button title={t.nav.cta} onPress={() => {}} style={styles.navCta} />
                </Link>
              </View>
            )}
          </View>
        </View>

        {isCompactNav ? (
          <Modal visible={menuOpen} animationType="none" transparent onRequestClose={() => setMenuOpen(false)}>
            <Animated.View
              style={[
                styles.mobileMenuFull,
                {
                  opacity: menuAnim,
                  transform: [
                    {
                      translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }),
                    },
                  ],
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
                <MenuItem anim={menuItemAnims[0]} onPress={scrollToServices} icon="grid" label={t.nav.services} />
                <MenuItem anim={menuItemAnims[1]} onPress={scrollToPricing} icon="tag" label={t.nav.pricing} />
                <Animated.View
                  style={{
                    opacity: menuItemAnims[2],
                    transform: [
                      { translateY: menuItemAnims[2].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                    ],
                  }}
                >
                  <Link href={authHref('login')} asChild>
                    <Pressable style={styles.mobileMenuItem} onPress={() => setMenuOpen(false)}>
                      <Feather name="log-in" size={18} color={colors.primary} />
                      <Text style={styles.mobileMenuText}>{t.nav.login}</Text>
                      <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.mobileMenuChevron} />
                    </Pressable>
                  </Link>
                </Animated.View>

                <Animated.View
                  style={{
                    opacity: menuItemAnims[3],
                    transform: [
                      { translateY: menuItemAnims[3].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                    ],
                  }}
                >
                  <Link href={authHref('signup')} asChild>
                    <Button title={t.nav.cta} onPress={() => setMenuOpen(false)} style={styles.mobileMenuCta} />
                  </Link>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.mobileMenuLangRow,
                    {
                      opacity: menuItemAnims[4],
                      transform: [
                        { translateY: menuItemAnims[4].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                      ],
                    },
                  ]}
                >
                  <View style={styles.langSwitcher}>
                    {LANGUAGES.map((l) => (
                      <Pressable key={l.code} onPress={() => setLang(l.code)} style={styles.langButton}>
                        <Text style={[styles.langButtonText, lang === l.code && styles.langButtonTextActive]}>{l.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </Animated.View>
              </ScrollView>
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

function MenuItem({
  anim,
  icon,
  label,
  onPress,
}: {
  anim: Animated.Value;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }}
    >
      <Pressable style={styles.mobileMenuItem} onPress={onPress}>
        <Feather name={icon} size={18} color={colors.primary} />
        <Text style={styles.mobileMenuText}>{label}</Text>
        <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.mobileMenuChevron} />
      </Pressable>
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

// Real screenshots from the app now (not stylized recreations) — see
// assets/screens/. Every phone frame on the page shares the same true
// phone aspect ratio (the screenshots' own 1080x2340), so the frame is
// never guessing at a shape — it's sized directly from the image.
const SCREENS = {
  feedSelect: require('../assets/screens/feed-select.jpg'),
  reportPdf: require('../assets/screens/report-pdf.jpg'),
  devisNew: require('../assets/screens/devis-new.jpg'),
  devisTotal: require('../assets/screens/devis-total.jpg'),
};
const SCREEN_ASPECT = 1080 / 2340;

// The phone bezel/rounded-corners/home-indicator chrome, shared by the
// hero's designed mockup and the showcase's real screenshots — screenWidth/
// screenHeight (matching a real phone's 1080x2340 aspect) are handed to
// `children` so both callers size their content off the same numbers
// instead of guessing. No fake notch: real screenshots already carry their
// own status bar, and the dashboard mockup draws its own — a separately
// drawn notch would just double up on what's already there.
function PhoneChrome({
  width,
  rotate = 0,
  children,
}: {
  width: number;
  rotate?: number;
  children: (screenWidth: number, screenHeight: number) => React.ReactNode;
}) {
  const bezel = Math.round(width * 0.035);
  const screenWidth = width - bezel * 2;
  const screenHeight = Math.round(screenWidth / SCREEN_ASPECT);
  const outerRadius = Math.round(width * 0.14);
  return (
    <View
      style={[
        styles.phoneFrame,
        { width, padding: bezel, borderRadius: outerRadius, transform: [{ rotate: `${rotate}deg` }] },
      ]}
    >
      <View style={{ width: screenWidth, height: screenHeight, borderRadius: outerRadius - bezel, overflow: 'hidden' }}>
        {children(screenWidth, screenHeight)}
      </View>
      <View style={styles.phoneHomeIndicator} />
    </View>
  );
}

function PhoneFrame({ source, width, rotate = 0 }: { source: number; width: number; rotate?: number }) {
  return (
    <PhoneChrome width={width} rotate={rotate}>
      {(w, h) => <Image source={source} style={{ width: w, height: h }} resizeMode="cover" />}
    </PhoneChrome>
  );
}

const HERO_PREVIEW_COPY: Record<Lang, { greeting: string; sites: string; reports: string; devis: string; project: string; devisNumber: string; photos: string }> = {
  fr: { greeting: 'Bonjour', sites: 'Chantiers', reports: 'Rapports', devis: 'Devis', project: 'Villa Dupont — rénovation', devisNumber: 'Devis DEV-2026-0032', photos: '18 photos géolocalisées' },
  en: { greeting: 'Hello', sites: 'Sites', reports: 'Reports', devis: 'Quotes', project: 'Villa Dupont — renovation', devisNumber: 'Quote QT-2026-0032', photos: '18 geolocated photos' },
  de: { greeting: 'Guten Tag', sites: 'Baustellen', reports: 'Rapporte', devis: 'Offerten', project: 'Villa Dupont — Renovation', devisNumber: 'Offerte AN-2026-0032', photos: '18 georeferenzierte Fotos' },
};

// The hero goes back to a designed mockup (not a real screenshot) — a
// hand-drawn dashboard scales cleanly to any phone frame, where a real
// screenshot's fixed aspect ratio either crops or letterboxes depending on
// the frame size. Real screenshots stay where they add the most proof:
// the showcase carousel further down the page.
function DashboardMockup({ width, height, lang }: { width: number; height: number; lang: Lang }) {
  const copy = HERO_PREVIEW_COPY[lang];
  return (
    <View style={{ width, height, backgroundColor: colors.surface, padding: spacing.lg, justifyContent: 'space-between' }}>
      <View>
        <View style={styles.phoneStatusBar}>
          <Text style={styles.phoneClock}>9:41</Text>
          <View style={styles.phoneStatusIcons}>
            <Feather name="wifi" size={11} color={colors.text} />
            <Feather name="battery" size={13} color={colors.text} />
          </View>
        </View>
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
      <View style={styles.previewTabBar}>
        <Feather name="home" size={16} color={colors.primary} />
        <Feather name="layers" size={16} color={colors.textMuted} />
        <Feather name="file-text" size={16} color={colors.textMuted} />
        <Feather name="calendar" size={16} color={colors.textMuted} />
        <Feather name="settings" size={16} color={colors.textMuted} />
      </View>
    </View>
  );
}

function AppPreview({ phoneWidth, lang }: { phoneWidth: number; lang: Lang }) {
  return (
    <PhoneChrome width={phoneWidth} rotate={-3}>
      {(w, h) => <DashboardMockup width={w} height={h} lang={lang} />}
    </PhoneChrome>
  );
}

// A controlled, one-at-a-time carousel: paging (never rests half-cropped
// between two slides the way free-scroll-with-peek did), explicit
// prev/next arrows, and an optional auto-advance timer that resets on any
// navigation (manual or automatic) so it always waits a fresh interval
// after whatever the visitor — or the timer itself — last did.
function PhoneCarousel({
  items,
  phoneWidth,
  rotate = 0,
  showCaptions = false,
  autoAdvanceMs,
}: {
  items: { key: string; source: number; caption?: string }[];
  phoneWidth: number;
  rotate?: number;
  showCaptions?: boolean;
  autoAdvanceMs?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const slideWidth = phoneWidth + spacing.xl * 2;

  const goTo = useCallback((idx: number) => {
    const clamped = ((idx % items.length) + items.length) % items.length;
    setActiveIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * slideWidth, animated: true });
  }, [items.length, slideWidth]);

  useEffect(() => {
    if (!autoAdvanceMs) return;
    const id = setTimeout(() => goTo(activeIndex + 1), autoAdvanceMs);
    return () => clearTimeout(id);
  }, [autoAdvanceMs, activeIndex, goTo]);

  const handleMomentumEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    setActiveIndex(Math.max(0, Math.min(items.length - 1, idx)));
  }, [items.length, slideWidth]);

  return (
    <View style={styles.carouselOuter}>
      <View style={styles.carouselRow}>
        <Pressable onPress={() => goTo(activeIndex - 1)} style={styles.carouselArrow} hitSlop={8}>
          <Feather name="chevron-left" size={18} color={colors.text} />
        </Pressable>
        <View style={{ width: slideWidth, overflow: 'hidden' }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            style={{ width: slideWidth }}
          >
            {items.map((it) => (
              <View key={it.key} style={{ width: slideWidth, alignItems: 'center' }}>
                <PhoneFrame source={it.source} width={phoneWidth} rotate={rotate} />
                {showCaptions && it.caption ? <Text style={styles.showcaseCaption}>{it.caption}</Text> : null}
              </View>
            ))}
          </ScrollView>
        </View>
        <Pressable onPress={() => goTo(activeIndex + 1)} style={styles.carouselArrow} hitSlop={8}>
          <Feather name="chevron-right" size={18} color={colors.text} />
        </Pressable>
      </View>
      {items.length > 1 ? (
        <View style={styles.sliderDots}>
          {items.map((it, i) => (
            <Pressable key={it.key} onPress={() => goTo(i)} hitSlop={6}>
              <View style={[styles.sliderDot, i === activeIndex && styles.sliderDotActive]} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

type VoiceCopy = { label: string; listening: string; transcript: string; resultTitle: string; resultLines: string[]; caption: string };
type QrBillCopy = { label: string; title: string; text: string; badge: string };

// A small looping demo, not a real transcription — it alternates between a
// "listening" view (pulsing mic + animated waveform bars + the transcript
// fading in) and a "result" view (the same text resolved into structured
// devis lines), crossfading between the two every ~3s. Purely illustrative:
// this is what the real in-app dictation produces, not a live recording.
function VoiceDemo({ copy }: { copy: VoiceCopy }) {
  const [phase, setPhase] = useState<'listening' | 'result'>('listening');
  const fade = useRef(new Animated.Value(1)).current;
  const barAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(0.3))).current;
  const micPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    const cycle = () => {
      timeoutId = setTimeout(() => {
        if (!mounted) return;
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
          if (!mounted) return;
          setPhase((p) => (p === 'listening' ? 'result' : 'listening'));
          Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start(() => {
            if (mounted) cycle();
          });
        });
      }, 2400);
    };
    cycle();
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [fade]);

  useEffect(() => {
    const loops = barAnims.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 380 + i * 55, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.25, duration: 380 + i * 55, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [barAnims]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(micPulse, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(200),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [micPulse]);

  return (
    <View style={styles.demoCard}>
      <View style={styles.demoLabelRow}>
        <View style={styles.demoDot} />
        <Text style={styles.demoLabel}>{copy.label}</Text>
      </View>
      <Animated.View style={{ opacity: fade, minHeight: 168 }}>
        {phase === 'listening' ? (
          <View>
            <View style={styles.micWrap}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.micPulseRing,
                  {
                    opacity: micPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
                    transform: [{ scale: micPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
                  },
                ]}
              />
              <View style={styles.micCircle}>
                <Feather name="mic" size={18} color="#fff" />
              </View>
              <Text style={styles.voiceListeningText}>{copy.listening}</Text>
            </View>
            <View style={styles.waveform}>
              {barAnims.map((v, i) => (
                <Animated.View key={i} style={[styles.waveBar, { transform: [{ scaleY: v }] }]} />
              ))}
            </View>
            <Text style={styles.voiceTranscript} numberOfLines={3}>
              {copy.transcript}
            </Text>
          </View>
        ) : (
          <View>
            <View style={styles.voiceResultHeader}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={styles.voiceResultTitle}>{copy.resultTitle}</Text>
            </View>
            {copy.resultLines.map((line) => (
              <View key={line} style={styles.voiceResultLine}>
                <Feather name="check" size={12} color={colors.primary} />
                <Text style={styles.voiceResultLineText}>{line}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
      <Text style={styles.demoCaption}>{copy.caption}</Text>
    </View>
  );
}

// Purely decorative fixed pattern — not a scannable code, just enough of a
// QR "look" (finder squares + noise) to read instantly as a QR code, plus
// the mandatory Swiss cross badge at its center like the real bulletin.
const QR_PATTERN = [
  1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1,
  1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1,
  1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1,
  1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1,
  1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1,
  0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0,
  0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1,
  1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0,
  1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1,
  1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1,
  1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0,
];

function QrGrid() {
  return (
    <View style={styles.qrGrid}>
      {QR_PATTERN.map((on, i) => (
        <View key={i} style={[styles.qrCell, on ? styles.qrCellOn : null]} />
      ))}
      <View style={styles.qrCrossBox}>
        <View style={styles.qrCrossV} />
        <View style={styles.qrCrossH} />
      </View>
    </View>
  );
}

// A slow vertical sweep behind the QR grid, looping — the only motion this
// card needs to read as "live"/scannable rather than a static screenshot.
function QrBillDemo({ copy }: { copy: QrBillCopy }) {
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.timing(sweep, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(600),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  return (
    <View style={styles.demoCard}>
      <View style={styles.demoLabelRow}>
        <View style={styles.demoDot} />
        <Text style={styles.demoLabel}>{copy.label}</Text>
      </View>
      <View style={styles.qrDemoRow}>
        <View style={styles.qrVisualClip}>
          <QrGrid />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.qrSweep,
              { transform: [{ translateY: sweep.interpolate({ inputRange: [0, 1], outputRange: [-58, 58] }) }] },
            ]}
          />
        </View>
        <View style={styles.qrDemoCopy}>
          <Text style={styles.qrDemoTitle}>{copy.title}</Text>
          <Text style={styles.qrDemoText}>{copy.text}</Text>
          <View style={styles.qrBadge}>
            <Feather name="shield" size={12} color={colors.success} />
            <Text style={styles.qrBadgeText}>{copy.badge}</Text>
          </View>
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
    width: 24,
    height: 24,
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
  hamburgerButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenuFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileMenuBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileMenuText: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  mobileMenuChevron: {
    marginLeft: 'auto',
  },
  mobileMenuCta: {
    marginTop: spacing.xl,
  },
  mobileMenuLangRow: {
    paddingTop: spacing.xl,
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
  phoneFrame: {
    alignSelf: 'center',
    backgroundColor: colors.primaryDark,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 28 },
  },
  phoneHomeIndicator: {
    alignSelf: 'center',
    width: '32%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginTop: spacing.sm,
  },
  phoneStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  phoneClock: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  phoneStatusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  previewGreeting: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  previewOrg: {
    fontSize: fontSize.md,
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
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  previewStatValue: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primary,
  },
  previewStatLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  previewListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  previewListText: {
    fontSize: 10,
    color: colors.text,
    flexShrink: 1,
  },
  previewTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  carouselOuter: {
    alignItems: 'center',
  },
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  carouselArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  sliderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  sliderDotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
  showcaseCaption: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  section: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  // Trades/pricing as their own rounded cards, not a full-bleed band: a
  // band needs an extra wrapping View, and that View's own layout box broke
  // the nav's "Tarifs" scroll-to (onLayout y is relative to the *immediate*
  // parent, so nesting pricing's Reveal one level deeper silently made its
  // registered offset relative to the band instead of the scroll content).
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
  spotlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  demoCard: {
    flex: 1,
    minWidth: 320,
    maxWidth: 480,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  demoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  demoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  demoLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  demoCaption: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 17,
  },
  micWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  micPulseRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  micCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceListeningText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    marginBottom: spacing.md,
  },
  waveBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: colors.primary,
    opacity: 0.85,
  },
  voiceTranscript: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  voiceResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  voiceResultTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  voiceResultLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  voiceResultLineText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  qrDemoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.lg,
  },
  qrVisualClip: {
    width: 78,
    height: 78,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrGrid: {
    width: 78,
    height: 78,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  qrCell: {
    width: 6,
    height: 6,
    backgroundColor: '#fff',
  },
  qrCellOn: {
    backgroundColor: '#14231f',
  },
  qrCrossBox: {
    position: 'absolute',
    left: 30,
    top: 30,
    width: 18,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  qrCrossV: {
    position: 'absolute',
    left: 7,
    top: 2,
    width: 4,
    height: 14,
    backgroundColor: '#14231f',
  },
  qrCrossH: {
    position: 'absolute',
    left: 2,
    top: 7,
    width: 14,
    height: 4,
    backgroundColor: '#14231f',
  },
  qrSweep: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  qrDemoCopy: {
    flex: 1,
    minWidth: 160,
  },
  qrDemoTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  qrDemoText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  qrBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.success,
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
    width: 20,
    height: 20,
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
