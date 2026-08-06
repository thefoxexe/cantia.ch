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
  type ViewStyle,
} from 'react-native';
import { Link, Redirect } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button, Screen, Switch } from '../components/ui';
import { supabase } from '../lib/supabase';
import { t, planName } from '../lib/i18n';
import { colors, fontSize, radius, spacing, breakpoints } from '../lib/theme';
import { authHref } from '../lib/appHost';
import type { Plan } from '../lib/types';

type IconName = keyof typeof Feather.glyphMap;

const PAIN_ICONS: IconName[] = ['edit-3', 'clock', 'folder'];
const FEATURE_ICONS: IconName[] = ['file-text', 'folder', 'image', 'zap', 'shield', 'layout', 'list', 'map-pin', 'users'];
// One small "artwork" icon per trade, in the same order as t.trades.list —
// paired by index rather than by name so this stays a plain parallel array,
// no separate per-trade copy needed.
const TRADE_ICONS: IconName[] = ['layers', 'grid', 'lock', 'zap', 'droplet', 'tool', 'edit-3', 'square'];
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
  const scrollRef = useRef<ScrollView>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { width, height: windowHeight } = useWindowDimensions();
  const isCompactNav = width < breakpoints.tablet;

  const menuAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  // Continuous, subtle motion so the hero doesn't read as a static screenshot:
  // the phone mockup gently floats, and the two background blobs breathe out
  // of phase with each other. Neither ties to scroll/reveal state — they run
  // for as long as the hero is mounted.
  const blobPulse = useRef(new Animated.Value(0)).current;
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
    const blobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(blobPulse, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(blobPulse, { toValue: 0, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    blobLoop.start();
    return () => {
      blobLoop.stop();
    };
  }, [blobPulse]);

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

          {/* ---- Hero: pure text on a subtle grid backdrop, no device mockup ---- */}
          <View style={styles.heroWrap}>
            <View pointerEvents="none" style={styles.heroGrid} />
            <Animated.View
              pointerEvents="none"
              style={[styles.heroBlobA, { transform: [{ scale: blobPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }] }]}
            />
            <Animated.View
              pointerEvents="none"
              style={[styles.heroBlobB, { transform: [{ scale: blobPulse.interpolate({ inputRange: [0, 1], outputRange: [1.1, 1] }) }] }]}
            />
            <Animated.View
              style={[
                styles.hero,
                isCompactNav && styles.heroCompact,
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
                <Text style={[styles.headline, isCompactNav && styles.headlineCompact]}>
                  {t.hero.headlinePrefix}{' '}
                  <Text style={styles.headlineHighlight}>{t.hero.headlineHighlight}</Text>
                </Text>
                <Text style={[styles.subheadline, isCompactNav && styles.subheadlineCompact]}>{t.hero.subheadline}</Text>
                <View style={[styles.ctaRow, isCompactNav && styles.ctaRowCompact]}>
                  <Link href={authHref('signup')} asChild>
                    <Button
                      title={t.hero.cta1}
                      onPress={() => {}}
                      style={StyleSheet.flatten([styles.ctaButton, isCompactNav && styles.ctaButtonCompact])}
                    />
                  </Link>
                  <Link href={authHref('login')} asChild>
                    <Button
                      title={t.hero.cta2}
                      onPress={() => {}}
                      variant="secondary"
                      style={StyleSheet.flatten([styles.ctaButton, isCompactNav && styles.ctaButtonCompact])}
                    />
                  </Link>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* ---- Spotlight: voice dictation + Swiss QR-bill demos ---- */}
          <Reveal id="spotlight" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.spotlight.title}</Text>
            <Text style={[styles.sectionSubtitle, styles.centerText]}>{t.spotlight.subtitle}</Text>
            <View style={styles.spotlightGrid}>
              <VoiceDemo copy={t.spotlight.voice} />
              <QrBillDemo copy={t.spotlight.qrbill} />
              <CatalogDemo copy={t.spotlight.catalog} />
            </View>
          </Reveal>

          {/* ---- Pain points ---- */}
          <Reveal id="pain" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.pain.title}</Text>
            <View style={styles.painGrid}>
              {t.pain.items.map((p, i) => (
                <View key={p.title} style={styles.painCard}>
                  <View style={styles.painIconBadge}>
                    <Feather name={PAIN_ICONS[i]} size={20} color={colors.accent} />
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
                      <Text style={styles.featureIndex}>{String(i + 1).padStart(2, '0')}</Text>
                      <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                    </View>
                    <View style={styles.featureIconRow}>
                      <View style={styles.featureIcon}>
                        <Feather name={FEATURE_ICONS[i]} size={18} color={i % 2 === 0 ? colors.primary : colors.accent} />
                      </View>
                      <Text style={styles.featureTitle}>{f.title}</Text>
                    </View>
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
          <Reveal id="trades" getAnim={getSectionAnim} onRegister={registerSection} style={[styles.section, styles.sectionCard]}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.trades.title}</Text>
            <TradesMarquee trades={t.trades.list} compact={isCompactNav} />
            <Text style={styles.tradeNote}>{t.trades.note}</Text>
          </Reveal>

          {/* ---- Pricing ---- */}
          <Reveal id="pricing" getAnim={getSectionAnim} onRegister={registerSection} style={[styles.section, styles.sectionCard]}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.pricing.title}</Text>
            <Pressable
              onPress={() => setBillingInterval((v) => (v === 'year' ? 'month' : 'year'))}
              style={styles.billingToggle}
            >
              <Text style={styles.billingToggleLabel}>
                {billingInterval === 'year' ? t.pricing.yearly : t.pricing.monthly}
              </Text>
              <View style={styles.billingToggleSaveBadge}>
                <Text style={styles.billingToggleSaveText}>{t.pricing.yearlySavings}</Text>
              </View>
              <Switch value={billingInterval === 'year'} onChange={(v) => setBillingInterval(v ? 'year' : 'month')} />
            </Pressable>
            <View style={styles.pricingGrid}>
              {plans.map((p) => {
                const isYearly = billingInterval === 'year';
                const displayMonthly = isYearly && p.price_chf_yearly != null ? p.price_chf_yearly / 12 : p.price_chf_monthly;
                return (
                <View key={p.id} style={[styles.priceCard, p.id === 'equipe' && styles.priceCardHighlight]}>
                  {p.id === 'equipe' ? (
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceBadgeText}>{t.pricing.badge}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.priceName}>{planName(p.id, p.name)}</Text>
                  <View style={styles.priceAmountRow}>
                    <Text style={styles.priceAmount}>{p.price_chf_monthly === 0 ? 'CHF 0' : `CHF ${formatChf(displayMonthly)}`}</Text>
                    <Text style={styles.pricePeriod}>/mois</Text>
                  </View>
                  {isYearly && p.price_chf_monthly > 0 && p.price_chf_yearly != null ? (
                    <Text style={styles.priceYearlyNote}>
                      {t.pricing.billedYearly.replace('{amount}', `CHF ${formatChf(p.price_chf_yearly)}`)}
                    </Text>
                  ) : null}
                  <View style={styles.priceFeatures}>
                    <PriceFeature
                      text={`${(p.storage_quota_mb / 1024).toFixed(p.storage_quota_mb < 1024 ? 1 : 0)} ${t.pricing.storageSuffix}`}
                    />
                    <PriceFeature text={`${p.max_members} ${p.max_members > 1 ? t.pricing.memberPlural : t.pricing.memberSingular}`} />
                    <PriceFeature
                      text={
                        p.max_devis_factures_per_month
                          ? `${p.max_devis_factures_per_month} devis/factures par mois`
                          : t.pricing.unlimited
                      }
                      muted={!!p.max_devis_factures_per_month}
                    />
                    <PriceFeature text={t.pricing.surveyFeature} muted={!p.has_rtk} included={p.has_rtk} />
                    <PriceFeature text="Envoi de devis/factures par e-mail" muted={!p.has_email_sending} included={p.has_email_sending} />
                    <PriceFeature text="Planning d'équipe" muted={!p.has_planning} included={p.has_planning} />
                    <PriceFeature text="Rentabilité par chantier" muted={!p.has_profitability} included={p.has_profitability} />
                    <PriceFeature
                      text={p.max_trames === 0 ? 'Bibliothèque de trames' : p.max_trames != null ? `${p.max_trames} trames enregistrées` : 'Bibliothèque de trames illimitée'}
                      muted={p.max_trames === 0}
                      included={p.max_trames !== 0}
                    />
                  </View>
                  <Link href={authHref('signup')} asChild>
                    <Button
                      title={p.price_chf_monthly === 0 ? t.pricing.freeCta : t.pricing.paidCta}
                      onPress={() => {}}
                      variant={p.id === 'equipe' ? 'primary' : 'secondary'}
                    />
                  </Link>
                </View>
                );
              })}
            </View>
          </Reveal>

          {/* ---- Swiss positioning ---- */}
          <Reveal id="swiss" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section} from={18}>
            <View style={styles.swissBand}>
              <SwissFlagBadge />
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
            <Link href="/telechargement" style={styles.mobileMoreLink}>
              <Text style={styles.mobileMoreLinkText}>En savoir plus →</Text>
            </Link>
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
                <Link href="/solutions/rentabilite">
                  <Text style={styles.footerLink}>Rentabilité</Text>
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
                <Pressable onPress={scrollToServices}>
                  <Text style={styles.navLink}>{t.nav.services}</Text>
                </Pressable>
                <Pressable onPress={scrollToPricing}>
                  <Text style={styles.navLink}>{t.nav.pricing}</Text>
                </Pressable>
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
                <Link href="/telechargement" asChild>
                  <MenuItem anim={menuItemAnims[2]} onPress={() => setMenuOpen(false)} icon="download" label={t.nav.download} />
                </Link>
                <Animated.View
                  style={{
                    opacity: menuItemAnims[3],
                    transform: [
                      { translateY: menuItemAnims[3].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
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
                    opacity: menuItemAnims[4],
                    transform: [
                      { translateY: menuItemAnims[4].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                    ],
                  }}
                >
                  <Link href={authHref('signup')} asChild>
                    <Button title={t.nav.cta} onPress={() => setMenuOpen(false)} style={styles.mobileMenuCta} />
                  </Link>
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

function formatChf(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
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

type VoiceCopy ={ label: string; listening: string; transcript: string; resultTitle: string; resultLines: string[]; caption: string };
type QrBillCopy = { label: string; title: string; text: string; badge: string };

// A small looping demo, not a real transcription — it alternates between a
// "listening" view (pulsing mic + animated waveform bars + the transcript
// fading in) and a "result" view (the same text resolved into structured
// devis lines), crossfading between the two every ~3s. Purely illustrative:
// this is what the real in-app dictation produces, not a live recording.
function VoiceDemo({ copy }: { copy: VoiceCopy }) {
  const [phase, setPhase] = useState<'listening' | 'result'>('listening');
  // How many words of the transcript are currently shown — climbs one word
  // at a time while listening, so the text grows on screen the way a
  // teleprompter (or the real live-dictation transcript) does, instead of
  // appearing all at once.
  const [revealCount, setRevealCount] = useState(0);
  const words = useRef(copy.transcript.split(' ')).current;
  const fade = useRef(new Animated.Value(1)).current;
  const barAnims = useRef(Array.from({ length: 28 }, () => new Animated.Value(0.15))).current;
  const micPulse = useRef(new Animated.Value(0)).current;
  // Drives a slow, continuous primary<->accent color sweep across the mic
  // and the waveform (each bar reads it with its own phase offset below) —
  // the "moving color" cue that reads as a live audio signal rather than a
  // static bar chart, independent of the height animation.
  const colorCycle = useRef(new Animated.Value(0)).current;

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
      }, 2600);
    };
    cycle();
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [fade]);

  useEffect(() => {
    if (phase !== 'listening') return;
    setRevealCount(0);
    // Spread the reveal across the ~2.6s listening window (with a little
    // headroom before the crossfade) so the last word lands just before the
    // view switches to the result.
    const stepMs = Math.max(90, 2200 / words.length);
    const intervalId = setInterval(() => {
      setRevealCount((n) => (n < words.length ? n + 1 : n));
    }, stepMs);
    return () => clearInterval(intervalId);
  }, [phase, words]);

  // Each bar jitters to its own random height on its own random clock —
  // deliberately not a synchronized loop (that read as one coordinated
  // "wave" rolling across the bars) so it reads instead like a real
  // audio-reactive meter, every bar twitching independently with the
  // voice's intensity.
  useEffect(() => {
    let mounted = true;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    barAnims.forEach((v, i) => {
      const tick = () => {
        if (!mounted) return;
        const target = 0.12 + Math.random() * 0.88;
        const duration = 90 + Math.random() * 150;
        Animated.timing(v, { toValue: target, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => {
          if (mounted) timeouts[i] = setTimeout(tick, 10 + Math.random() * 40);
        });
      };
      // Stagger the first tick per bar so they don't all start in lockstep.
      timeouts[i] = setTimeout(tick, i * 15);
    });
    return () => {
      mounted = false;
      timeouts.forEach((id) => clearTimeout(id));
    };
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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(colorCycle, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(colorCycle, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [colorCycle]);

  const revealedTranscript = words.slice(0, revealCount).join(' ');

  return (
    <View style={styles.demoCard}>
      <View style={styles.demoLabelRow}>
        <View style={styles.demoDot} />
        <Text style={styles.demoLabel}>{copy.label}</Text>
      </View>
      <Animated.View style={[styles.demoBody, { opacity: fade }]}>
        {phase === 'listening' ? (
          <View>
            <View style={styles.micWrap}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.listeningPulseRing,
                  {
                    opacity: micPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
                    transform: [{ scale: micPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
                    backgroundColor: colorCycle.interpolate({ inputRange: [0, 1], outputRange: [colors.primary, colors.accent] }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.listeningDot,
                  { backgroundColor: colorCycle.interpolate({ inputRange: [0, 1], outputRange: [colors.primary, colors.accent] }) },
                ]}
              />
              <Text style={styles.voiceListeningText}>{copy.listening}</Text>
            </View>
            <View style={styles.waveform}>
              {barAnims.map((v, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      transform: [{ scaleY: v }],
                      backgroundColor: v.interpolate({ inputRange: [0.2, 1], outputRange: [colors.primary, colors.accent] }),
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.voiceTranscript}>
              {revealedTranscript}
              <Text style={styles.voiceCursor}>▍</Text>
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

// Drawn with plain Views instead of the 🇨🇭 emoji — the emoji glyph doesn't
// render reliably on every desktop browser/OS font stack (shows as two
// separate letter tiles or nothing at all on some Windows/Linux setups),
// while a hand-drawn cross-in-a-circle always looks identical everywhere.
function SwissFlagBadge() {
  return (
    <View style={styles.swissFlagBadge}>
      <View style={styles.swissFlagCrossV} />
      <View style={styles.swissFlagCrossH} />
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
      <View style={[styles.demoBody, styles.qrDemoRow]}>
        <View style={styles.qrVisualClip}>
          <QrGrid />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.qrSweep,
              { transform: [{ translateY: sweep.interpolate({ inputRange: [0, 1], outputRange: [-72, 72] }) }] },
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

type CatalogCopy = { label: string; title: string; text: string; items: { name: string; match: number }[] };

// A looping progress-bar fill, illustrating the (not-yet-built) catalog
// matching feature for the landing page — purely a marketing preview, same
// treatment as the voice/QR-bill cards: real in-app behavior, mocked data.
function CatalogDemo({ copy }: { copy: CatalogCopy }) {
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(fill, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.delay(2400),
        Animated.timing(fill, { toValue: 0, duration: 1, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fill]);

  return (
    <View style={styles.demoCard}>
      <View style={styles.demoLabelRow}>
        <View style={styles.demoDot} />
        <Text style={styles.demoLabel}>{copy.label}</Text>
      </View>
      <View style={styles.demoBody}>
        <Text style={styles.catalogTitle}>{copy.title}</Text>
        <View style={styles.catalogList}>
          {copy.items.map((item) => (
            <View key={item.name} style={styles.catalogRow}>
              <View style={styles.catalogRowHeader}>
                <Text style={styles.catalogItemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.catalogMatchBadge}>
                  <Text style={styles.catalogMatchText}>{item.match}%</Text>
                </View>
              </View>
              <View style={styles.catalogBarTrack}>
                <Animated.View
                  style={[
                    styles.catalogBarFill,
                    { width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${item.match}%`] }) },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.demoCaption}>{copy.text}</Text>
    </View>
  );
}

// A slow, continuous horizontal belt of trade cards, looping seamlessly —
// the list is rendered twice back-to-back and a CSS keyframe animation
// slides the track by exactly -50% (one copy's width, whatever it measures
// out to be) before snapping back to 0%, which lands on pixel-identical
// content so the reset is invisible.
//
// Deliberately plain CSS (@keyframes), not RN's Animated.loop: RN's loop
// silently stops for good the moment any single iteration reports
// `finished: false` instead of restarting — and a backgrounded browser tab
// pausing mid-frame is exactly the kind of thing that triggers that, which
// is what "ça tourne, puis ça s'arrête au bout d'un moment" was. A native
// CSS animation has no such failure mode: the browser owns the loop
// entirely and always resumes it once the tab is visible again.
const MARQUEE_KEYFRAMES_ID = 'cantia-marquee-keyframes';
function ensureMarqueeKeyframes() {
  if (typeof document === 'undefined' || document.getElementById(MARQUEE_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = MARQUEE_KEYFRAMES_ID;
  style.textContent = '@keyframes cantia-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }';
  document.head.appendChild(style);
}

function TradesMarquee({ trades, compact }: { trades: string[]; compact: boolean }) {
  // Set directly on the DOM node rather than via RN's `style` prop —
  // `animationName`/`animationDuration` aren't in RN's recognized web
  // style-property list, so passing them through StyleSheet triggers a
  // console warning (harmless, but noisy) even though the browser applies
  // them fine either way. Bypassing RN's style pipeline for just this one
  // property avoids that.
  const trackRef = useRef<View>(null);

  useEffect(() => {
    ensureMarqueeKeyframes();
    const node = trackRef.current as unknown as HTMLElement | null;
    // Same pixel-width track on every screen size, but a narrow phone
    // viewport shows far less of it at once — the loop read as crawling
    // there even though desktop felt fine. Cutting the duration (not
    // touching the desktop pace) makes it read as brisk on mobile too.
    if (node) node.style.animation = `cantia-marquee ${compact ? 11 : 32}s linear infinite`;
  }, [compact]);

  const items = [...trades, ...trades];

  return (
    <View style={styles.tradesMarqueeOuter}>
      <View ref={trackRef} style={styles.tradesMarqueeTrack}>
        {items.map((trade, i) => (
          <View key={`${trade}-${i}`} style={styles.tradeCard}>
            <View style={styles.tradeIconBadge}>
              <Feather name={TRADE_ICONS[i % TRADE_ICONS.length]} size={22} color={colors.primary} />
            </View>
            <Text style={styles.tradeCardText}>{trade}</Text>
          </View>
        ))}
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
  heroWrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  // A faint grid/graph-paper texture behind the hero text for a bit of
  // depth without a device mockup — web-only CSS properties (this whole
  // screen never mounts on native, see the Platform.OS guard above), so a
  // plain object cast rather than going through StyleSheet.create's types.
  heroGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
    backgroundSize: '44px 44px',
    opacity: 0.5,
    maskImage: 'linear-gradient(to bottom, black, transparent)',
    WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
  } as unknown as ViewStyle,
  heroBlobA: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: colors.primarySoft,
    opacity: 0.35,
  },
  heroBlobB: {
    position: 'absolute',
    top: 80,
    left: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.accentSoft,
    opacity: 0.25,
  },
  hero: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 1.6,
    paddingBottom: spacing.xxl * 1.6,
  },
  heroCompact: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  heroCopy: {
    alignItems: 'center',
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: colors.surfaceAlt,
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
    fontSize: 52,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 60,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  headlineCompact: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.2,
    marginBottom: spacing.md,
  },
  headlineHighlight: {
    color: colors.text,
    backgroundColor: colors.primarySoft,
  },
  subheadline: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    lineHeight: 26,
    maxWidth: 520,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  subheadlineCompact: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  ctaRowCompact: {
    flexDirection: 'column',
    alignSelf: 'stretch',
  },
  ctaButton: {
    minWidth: 220,
  },
  ctaButtonCompact: {
    minWidth: 0,
    width: '100%',
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
    alignItems: 'stretch',
    gap: spacing.lg,
  },
  demoCard: {
    flex: 1,
    minWidth: 320,
    maxWidth: 480,
    // Fixed floor so the voice-demo card's listening↔result crossfade never
    // changes its own height — with `spotlightGrid`'s alignItems: 'stretch'
    // that height is shared across the whole row, so without this the QR
    // and catalog cards visibly resized in lockstep every ~2.6s too.
    minHeight: 300,
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
  // The part of each spotlight card below the label — flex:1 so it eats
  // whatever extra height `spotlightGrid`'s stretch gives the card (the
  // voice-dictation card is the tallest by design, see VoiceDemo), and
  // centers its own content in that space so the shorter cards' content
  // doesn't end up pinned awkwardly to the top.
  demoBody: {
    flex: 1,
    justifyContent: 'center',
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
  // The listening indicator is a small pulsing dot, not a microphone icon —
  // the waveform right below it is "le capteur de voix" the demo is meant to
  // showcase; a big mic circle competed with it for attention and made this
  // card taller than the other two spotlight cards, which visibly resized
  // the whole row (they share a stretched height) every time the phase
  // crossfaded between listening/result.
  listeningPulseRing: {
    position: 'absolute',
    left: -3,
    top: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  listeningDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  voiceListeningText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
    height: 56,
    marginBottom: spacing.lg,
  },
  waveBar: {
    width: 3,
    height: 48,
    borderRadius: 1.5,
    backgroundColor: colors.primary,
    opacity: 0.85,
  },
  voiceTranscript: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
    minHeight: 96,
  },
  voiceCursor: {
    color: colors.primary,
    fontWeight: '700',
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
    width: 91,
    height: 91,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrGrid: {
    width: 91,
    height: 91,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  qrCell: {
    width: 7,
    height: 7,
    backgroundColor: '#fff',
  },
  qrCellOn: {
    backgroundColor: colors.text,
  },
  qrCrossBox: {
    position: 'absolute',
    left: 35,
    top: 35,
    width: 21,
    height: 21,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  qrCrossV: {
    position: 'absolute',
    left: 8,
    top: 3,
    width: 5,
    height: 16,
    backgroundColor: colors.text,
  },
  qrCrossH: {
    position: 'absolute',
    left: 3,
    top: 8,
    width: 16,
    height: 5,
    backgroundColor: colors.text,
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
  catalogTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  catalogList: {
    gap: spacing.md,
  },
  catalogRow: {
    gap: 6,
  },
  catalogRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  catalogItemName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  catalogMatchBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  catalogMatchText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  catalogBarTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  catalogBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
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
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  painIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
    width: '31%',
    minWidth: 300,
    flexGrow: 1,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  featureCardHovered: {
    borderColor: colors.primary,
  },
  featureCardActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIndex: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  featureIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
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
  tradesMarqueeOuter: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
    // A soft fade at both edges so the loop reads as a continuous belt
    // rather than cards popping in/out at a hard boundary.
    maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
    WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
  } as unknown as ViewStyle,
  tradesMarqueeTrack: {
    flexDirection: 'row',
  },
  tradeCard: {
    alignItems: 'center',
    gap: spacing.sm,
    width: 108,
    marginRight: spacing.lg,
  },
  tradeIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeCardText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  tradeNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 560,
    alignSelf: 'center',
    lineHeight: 20,
  },
  billingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  billingToggleLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  billingToggleSaveBadge: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  billingToggleSaveText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  priceYearlyNote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: spacing.lg,
  },
  priceCard: {
    flex: 1,
    minWidth: 250,
    maxWidth: 280,
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
    flex: 1,
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
  swissFlagBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DA291C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  swissFlagCrossV: {
    position: 'absolute',
    width: 8,
    height: 26,
    borderRadius: 1,
    backgroundColor: '#fff',
  },
  swissFlagCrossH: {
    position: 'absolute',
    width: 26,
    height: 8,
    borderRadius: 1,
    backgroundColor: '#fff',
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
  mobileMoreLink: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  mobileMoreLinkText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerCopy: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  footerSocialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
