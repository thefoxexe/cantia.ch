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
  type TextStyle,
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

const NEON_GREEN = '#39FF6A';
const PAIN_ICONS: IconName[] = ['edit-3', 'clock', 'folder'];
const FEATURE_ICONS: IconName[] = ['file-text', 'folder', 'image', 'zap', 'shield', 'layout', 'list', 'map-pin', 'users'];
// One small "artwork" icon per trade, in the same order as t.trades.list —
// paired by index rather than by name so this stays a plain parallel array,
// no separate per-trade copy needed.
const TRADE_ICONS: IconName[] = ['layers', 'grid', 'lock', 'zap', 'droplet', 'tool', 'edit-3', 'square'];
// Cantia went live on this date — the "days since launch" ticker figure is
// computed from it on every load rather than hand-updated, so it keeps
// climbing on its own instead of going stale the day after someone forgets
// to bump a hardcoded number.
const LAUNCH_DATE = Date.UTC(2026, 7, 3);
function daysSinceLaunch(): number {
  return Math.max(1, Math.floor((Date.now() - LAUNCH_DATE) / 86400000));
}
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
  const [landingStats, setLandingStats] = useState<{
    users_count: number;
    organizations_count: number;
    cash_collected_chf: number;
  } | null>(null);
  const usersDisplay = useCountUp(landingStats?.users_count);
  const orgsDisplay = useCountUp(landingStats?.organizations_count);
  const cashCoins = useCountUpCoins(landingStats?.cash_collected_chf);
  const launchDaysDisplay = useCountUp(daysSinceLaunch());
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { width, height: windowHeight } = useWindowDimensions();
  const isCompactNav = width < breakpoints.tablet;

  const menuAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const livePulse = useRef(new Animated.Value(0)).current;
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
            duration: 820,
            easing: PREMIUM_EASE,
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

  // Real, live stats: fetched once on load, then kept current via a Realtime
  // subscription on the single public.landing_stats row (refreshed
  // server-side by triggers whenever a signup, an org, a devis or a
  // facture_payments write happens — see the landing_stats migration).
  useEffect(() => {
    supabase
      .from('landing_stats')
      .select('users_count, organizations_count, cash_collected_chf')
      .single()
      .then(({ data }) => {
        if (data) {
          setLandingStats({
            users_count: data.users_count,
            organizations_count: data.organizations_count,
            cash_collected_chf: Number(data.cash_collected_chf),
          });
        }
      });

    const channel = supabase
      .channel('landing-stats-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'landing_stats' },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          setLandingStats({
            users_count: Number(row.users_count),
            organizations_count: Number(row.organizations_count),
            cash_collected_chf: Number(row.cash_collected_chf),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    const liveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(livePulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    liveLoop.start();
    return () => {
      liveLoop.stop();
    };
  }, [livePulse]);

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

          {/* ---- Hero: left-aligned copy + a floating devis-card visual on
              the right — concrete product proof instead of text floating
              alone on a grid backdrop. ---- */}
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
              <View style={[styles.heroCopy, isCompactNav && styles.heroCopyCompact]}>
                <View style={[styles.kicker, isCompactNav && styles.kickerCompact]}>
                  <View style={styles.kickerDot} />
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

              {/* ---- The claim made concrete: a live-looking devis card,
                  gently floating, instead of an abstract illustration. ---- */}
              <Animated.View
                style={[
                  styles.heroVisual,
                  isCompactNav && styles.heroVisualCompact,
                  {
                    transform: [
                      { rotate: blobPulse.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '-2deg'] }) },
                      { translateY: blobPulse.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
                    ],
                  },
                ]}
              >
                <View style={styles.heroCardHeader}>
                  <View style={styles.heroCardDot} />
                  <Text style={styles.heroCardTitle}>Devis #2024-118</Text>
                  <View style={styles.heroCardStatusPill}>
                    <Text style={styles.heroCardStatusText}>Envoyé</Text>
                  </View>
                </View>
                <View style={styles.heroCardLines}>
                  <View style={styles.heroCardLine}>
                    <Feather name="edit-3" size={13} color={colors.textMuted} />
                    <Text style={styles.heroCardLineText}>Crépi façade nord</Text>
                    <Text style={styles.heroCardLinePrice}>CHF 1 240.–</Text>
                  </View>
                  <View style={styles.heroCardLine}>
                    <Feather name="square" size={13} color={colors.textMuted} />
                    <Text style={styles.heroCardLineText}>Fenêtres PVC (x3)</Text>
                    <Text style={styles.heroCardLinePrice}>CHF 2 850.–</Text>
                  </View>
                  <View style={styles.heroCardLine}>
                    <Feather name="tool" size={13} color={colors.textMuted} />
                    <Text style={styles.heroCardLineText}>Pose et main d'œuvre</Text>
                    <Text style={styles.heroCardLinePrice}>CHF 980.–</Text>
                  </View>
                </View>
                <View style={styles.heroCardDivider} />
                <View style={styles.heroCardTotalRow}>
                  <Text style={styles.heroCardTotalLabel}>Total TTC</Text>
                  <Text style={styles.heroCardTotalValue}>CHF 5 070.–</Text>
                </View>
                <View style={styles.heroCardBadge}>
                  <Feather name="check" size={12} color="#fff" />
                  <Text style={styles.heroCardBadgeText}>Signé électroniquement</Text>
                </View>
              </Animated.View>
            </Animated.View>
          </View>

          {/* ---- Live stats: a full-bleed ticker bar, not a rounded pill —
              see the landing_stats table + triggers in the Supabase
              migration. The cash figure spawns little CHF particles as it
              counts up, like coins dropping into a piggy bank. ---- */}
          <View style={styles.statsTickerOuter}>
            <View style={styles.statsTickerInner}>
              <View style={styles.statsTickerLive}>
                <View style={styles.statsLiveDotWrap}>
                  <Animated.View
                    style={[
                      styles.statsLiveDotGlow,
                      {
                        opacity: livePulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] }),
                        transform: [{ scale: livePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
                      },
                    ]}
                  />
                  <View style={styles.statsLiveDotCore} />
                </View>
                <Text style={styles.statsTickerLiveText}>En direct</Text>
              </View>
              <View style={styles.statsTickerDivider} />
              <View style={styles.statsTickerStat}>
                <Text style={styles.statsTickerValue}>
                  {landingStats ? formatStatCount(Math.round(orgsDisplay)) : '—'}
                </Text>
                <Text style={styles.statsTickerLabel}>entreprises nous ont déjà rejoint</Text>
              </View>
              <View style={styles.statsTickerDivider} />
              <View style={styles.statsTickerStat}>
                <Text style={styles.statsTickerValue}>
                  {landingStats ? formatStatCount(Math.round(usersDisplay)) : '—'}
                </Text>
                <Text style={styles.statsTickerLabel}>utilisateurs actifs</Text>
              </View>
              <View style={styles.statsTickerDivider} />
              <View style={styles.statsTickerStat}>
                <View style={styles.statsTickerCoinAnchor}>
                  <Animated.Text
                    style={[
                      styles.statsTickerValue,
                      styles.statsTickerValueAccent,
                      { transform: [{ scale: cashCoins.pulse }] },
                    ]}
                  >
                    {landingStats ? `CHF ${formatStatChf(cashCoins.display)}` : '—'}
                  </Animated.Text>
                  {cashCoins.coins.map((c) => (
                    <CoinParticle key={c.id} x={c.x} onDone={() => cashCoins.removeCoin(c.id)} />
                  ))}
                </View>
                <Text style={styles.statsTickerLabel}>encaissés via Cantia</Text>
              </View>
              <View style={styles.statsTickerDivider} />
              <View style={styles.statsTickerStat}>
                <Text style={styles.statsTickerValue}>{Math.round(launchDaysDisplay)}</Text>
                <Text style={styles.statsTickerLabel}>jours en ligne</Text>
              </View>
            </View>
          </View>

          {/* ---- Spotlight: voice dictation + Swiss QR-bill demos ---- */}
          <Reveal id="spotlight" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionEyebrow, styles.centerText]}>Automatisations</Text>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.spotlight.title}</Text>
            <Text style={[styles.sectionSubtitle, styles.centerText]}>{t.spotlight.subtitle}</Text>
            <View style={styles.spotlightGrid}>
              <VoiceDemo copy={t.spotlight.voice} />
              <QrBillDemo copy={t.spotlight.qrbill} />
              <CatalogDemo copy={t.spotlight.catalog} />
            </View>
          </Reveal>

          {/* ---- Pain points ("before") ---- */}
          <Reveal id="pain" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionEyebrow, styles.centerText]}>Le problème</Text>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.pain.title}</Text>
            {/* A rule-separated diagnostic list, not boxed cards — reads as
                a short, scannable list of symptoms rather than three
                identical tiles, and stays visually distinct from the
                "solution" cards it leads into below. */}
            <View style={styles.painList}>
              {t.pain.items.map((p, i) => (
                <View key={p.title} style={[styles.painRow, i === t.pain.items.length - 1 && styles.painRowLast]}>
                  <View style={styles.painIconBadge}>
                    <Feather name={PAIN_ICONS[i]} size={19} color={colors.textMuted} />
                  </View>
                  <View style={styles.painRowText}>
                    <Text style={styles.painTitle}>{p.title}</Text>
                    <Text style={styles.painText}>{p.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Reveal>

          {/* ---- Connector: makes the pain → solution relationship visible
              instead of leaving two sections to imply it on their own ---- */}
          <View style={styles.narrativeConnector} pointerEvents="none">
            <View style={styles.narrativeLine} />
            <View style={styles.narrativeArrowBadge}>
              <Feather name="arrow-down" size={14} color="#fff" />
            </View>
          </View>

          {/* ---- Services ("after") ---- */}
          <Reveal id="services" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={styles.sectionEyebrow}>Ce qu'on apporte</Text>
            <Text style={styles.sectionTitle}>{t.services.title}</Text>
            <Text style={styles.sectionSubtitle}>{t.services.subtitle}</Text>

            {/* Bento layout: the first capability gets a full-width banner
                row instead of being just another tile in the grid — a
                deliberate hierarchy (this one matters most) rather than
                nine identical boxes. */}
            {(() => {
              const f = t.services.items[0];
              const expanded = expandedFeature === 0;
              return (
                <Pressable
                  style={({ pressed, hovered }: any) => [
                    styles.featureHeroCard,
                    isCompactNav && styles.featureHeroCardCompact,
                    (pressed || hovered) && styles.featureCardHovered,
                  ]}
                  onPress={() => setExpandedFeature(expanded ? null : 0)}
                >
                  <View style={styles.featureHeroIcon}>
                    <Feather name={FEATURE_ICONS[0]} size={24} color="#fff" />
                  </View>
                  <View style={styles.featureHeroBody}>
                    <View style={styles.featureCardHeader}>
                      <Text style={styles.featureHeroTitle}>{f.title}</Text>
                      <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
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
                  </View>
                </Pressable>
              );
            })()}

            <View style={styles.featureGrid}>
              {t.services.items.slice(1).map((f, idx) => {
                const i = idx + 1;
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
                        <Feather name={FEATURE_ICONS[i]} size={17} color="#fff" />
                      </View>
                      <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                    </View>
                    <View style={styles.featureIconRow}>
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
            <Text style={[styles.sectionEyebrow, styles.centerText]}>Métiers couverts</Text>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.trades.title}</Text>
            <TradesMarquee trades={t.trades.list} compact={isCompactNav} />
            <Text style={styles.tradeNote}>{t.trades.note}</Text>
          </Reveal>

          {/* ---- Pricing ---- */}
          <Reveal id="pricing" getAnim={getSectionAnim} onRegister={registerSection} style={[styles.section, styles.sectionCard]}>
            <Text style={[styles.sectionEyebrow, styles.centerText]}>Tarifs</Text>
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
                const dark = p.id === 'equipe';
                return (
                <View key={p.id} style={[styles.priceCard, dark && styles.priceCardHighlight]}>
                  {dark ? (
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceBadgeText}>{t.pricing.badge}</Text>
                    </View>
                  ) : null}
                  <Text style={[styles.priceName, dark && styles.priceNameOnDark]}>{planName(p.id, p.name)}</Text>
                  <View style={styles.priceAmountRow}>
                    <Text style={[styles.priceAmount, dark && styles.priceAmountOnDark]}>
                      {p.price_chf_monthly === 0 ? 'CHF 0' : `CHF ${formatChf(displayMonthly)}`}
                    </Text>
                    <Text style={[styles.pricePeriod, dark && styles.pricePeriodOnDark]}>/mois</Text>
                  </View>
                  {isYearly && p.price_chf_monthly > 0 && p.price_chf_yearly != null ? (
                    <Text style={[styles.priceYearlyNote, dark && styles.priceYearlyNoteOnDark]}>
                      {t.pricing.billedYearly.replace('{amount}', `CHF ${formatChf(p.price_chf_yearly)}`)}
                    </Text>
                  ) : null}
                  <View style={styles.priceFeatures}>
                    <PriceFeature
                      dark={dark}
                      text={`${(p.storage_quota_mb / 1024).toFixed(p.storage_quota_mb < 1024 ? 1 : 0)} ${t.pricing.storageSuffix}`}
                    />
                    <PriceFeature dark={dark} text={`${p.max_members} ${p.max_members > 1 ? t.pricing.memberPlural : t.pricing.memberSingular}`} />
                    <PriceFeature
                      dark={dark}
                      text={
                        p.max_devis_factures_per_month
                          ? `${p.max_devis_factures_per_month} devis/factures par mois`
                          : t.pricing.unlimited
                      }
                      muted={!!p.max_devis_factures_per_month}
                    />
                    <PriceFeature dark={dark} text={t.pricing.surveyFeature} muted={!p.has_rtk} included={p.has_rtk} />
                    <PriceFeature dark={dark} text="Envoi de devis/factures par e-mail" muted={!p.has_email_sending} included={p.has_email_sending} />
                    <PriceFeature dark={dark} text="Planning d'équipe" muted={!p.has_planning} included={p.has_planning} />
                    <PriceFeature dark={dark} text="Rentabilité par chantier" muted={!p.has_profitability} included={p.has_profitability} />
                    <PriceFeature
                      dark={dark}
                      text={p.max_trames === 0 ? 'Bibliothèque de trames' : p.max_trames != null ? `${p.max_trames} trames enregistrées` : 'Bibliothèque de trames illimitée'}
                      muted={p.max_trames === 0}
                      included={p.max_trames !== 0}
                    />
                  </View>
                  <Link href={authHref('signup')} asChild>
                    <Button
                      title={p.price_chf_monthly === 0 ? t.pricing.freeCta : t.pricing.paidCta}
                      onPress={() => {}}
                      variant={dark ? 'primary' : 'secondary'}
                    />
                  </Link>
                </View>
                );
              })}
            </View>
          </Reveal>

          {/* ---- Swiss positioning ---- */}
          <Reveal id="swiss" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section} from={18}>
            <View style={[styles.swissBand, isCompactNav && styles.swissBandCompact]}>
              <View style={[styles.swissBandCopy, isCompactNav && styles.swissBandCopyCompact]}>
                <SwissFlagBadge />
                <Text style={styles.swissTitle}>{t.swiss.title}</Text>
                <Text style={[styles.swissText, isCompactNav && styles.swissTextCompact]}>{t.swiss.text}</Text>
              </View>
              <View style={styles.swissFacts}>
                {['Montants en CHF, TVA suisse intégrée', 'Cadastre & orthophoto officiels', 'Pensé pour les PME suisses'].map((fact) => (
                  <View key={fact} style={styles.swissFactRow}>
                    <View style={styles.swissFactCheck}>
                      <Feather name="check" size={11} color="#fff" />
                    </View>
                    <Text style={styles.swissFactText}>{fact}</Text>
                  </View>
                ))}
              </View>
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
// Apple/Linear-style settle curve (easeOutExpo-ish) — a plain Easing.cubic
// reveal reads as a generic fade-up; this decelerates harder at the tail so
// the content feels like it's settling into place rather than just sliding.
const PREMIUM_EASE = Easing.bezier(0.16, 1, 0.3, 1);

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
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
          ],
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

// Swiss thousands grouping (apostrophe) for the live stats section — these
// numbers can grow past 4 digits where formatChf's plain string would stop
// being readable.
function formatStatCount(n: number | undefined): string {
  if (n === undefined) return '—';
  return n.toLocaleString('de-CH');
}

function formatStatChf(n: number): string {
  return Math.round(n).toLocaleString('de-CH');
}

// Smoothly tweens from the previous value to `target` whenever it changes
// (initial load counts up from 0; a live update counts from the old figure
// to the new one) instead of the number just snapping — this is the one
// piece of motion that actually sells "these are live", not a screenshot.
function useCountUp(target: number | undefined, duration = 1300): number {
  const anim = useRef(new Animated.Value(0)).current;
  const prevTarget = useRef(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === undefined) return;
    const from = prevTarget.current;
    anim.setValue(0);
    const listenerId = anim.addListener(({ value }) => {
      setDisplay(from + (target - from) * value);
    });
    Animated.timing(anim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      prevTarget.current = target;
    });
    return () => {
      anim.removeListener(listenerId);
    };
  }, [target, duration, anim]);

  return display;
}

// Same count-up tween as useCountUp, but for the cash figure specifically:
// every ~140ms of forward progress it also spawns a little "CHF" particle
// (rendered by CoinParticle below) and gives the number itself a quick
// scale pulse — the piggy-bank-filling effect the number growing alone
// doesn't sell on its own.
function useCountUpCoins(target: number | undefined, duration = 1300) {
  const anim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prevTarget = useRef(0);
  const [display, setDisplay] = useState(0);
  const [coins, setCoins] = useState<{ id: number; x: number }[]>([]);
  const nextCoinId = useRef(0);
  const lastSpawnAt = useRef(0);

  useEffect(() => {
    if (target === undefined) return;
    const from = prevTarget.current;
    anim.setValue(0);
    lastSpawnAt.current = 0;
    const listenerId = anim.addListener(({ value }) => {
      setDisplay(from + (target - from) * value);
      const now = Date.now();
      if (target > from && value < 1 && now - lastSpawnAt.current > 140) {
        lastSpawnAt.current = now;
        const id = nextCoinId.current++;
        setCoins((prev) => [...prev.slice(-5), { id, x: Math.round((Math.random() - 0.5) * 56) }]);
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.1, duration: 110, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.spring(pulse, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
      }
    });
    Animated.timing(anim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      prevTarget.current = target;
    });
    return () => {
      anim.removeListener(listenerId);
    };
  }, [target, duration, anim, pulse]);

  const removeCoin = useCallback((id: number) => {
    setCoins((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { display, pulse, coins, removeCoin };
}

// A single "CHF" glyph that rises and fades once, then removes itself —
// the little coins popping out of the ticker as the cash figure climbs.
function CoinParticle({ x, onDone }: { x: number; onDone: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 850,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(onDone);
  }, [anim, onDone]);

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.coinParticle,
        {
          marginLeft: x,
          opacity: anim.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 0.9, 0] }),
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) },
            { scale: anim.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.5, 1, 0.8] }) },
          ],
        },
      ]}
    >
      CHF
    </Animated.Text>
  );
}

function PriceFeature({
  text,
  muted,
  included,
  dark,
}: {
  text: string;
  muted?: boolean;
  included?: boolean;
  dark?: boolean;
}) {
  const mutedColor = dark ? 'rgba(255,255,255,0.35)' : colors.textMuted;
  return (
    <View style={styles.priceFeatureRow}>
      <Feather
        name={muted ? 'x' : 'check'}
        size={14}
        color={muted ? mutedColor : included === false ? mutedColor : dark ? NEON_GREEN : colors.success}
      />
      <Text
        style={[
          styles.priceFeatureText,
          dark && styles.priceFeatureTextOnDark,
          muted && (dark ? styles.priceFeatureTextMutedOnDark : styles.priceFeatureTextMuted),
        ]}
      >
        {text}
      </Text>
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
    backgroundColor: 'rgba(247, 241, 230, 0.7)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  } as unknown as ViewStyle,
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
    maxWidth: 1160,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 1.6,
    paddingBottom: spacing.xxl * 1.6,
  },
  heroCompact: {
    flexDirection: 'column',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  heroCopy: {
    alignItems: 'flex-start',
    flex: 1,
    maxWidth: 560,
  },
  heroCopyCompact: {
    alignItems: 'center',
    maxWidth: '100%',
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  kickerCompact: {
    alignSelf: 'center',
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  kickerText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  headline: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 68,
    letterSpacing: -2,
    textAlign: 'left',
    marginBottom: spacing.lg,
    textWrap: 'balance',
  } as unknown as TextStyle,
  headlineCompact: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.6,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  // Gradient-filled text (Apple's "hello again" trick) instead of a flat
  // highlighter chip behind the text — WebkitTextFillColor: transparent
  // only takes effect where backgroundClip: 'text' is supported, which is
  // universal in the evergreen browsers this web-only screen ships to.
  headlineHighlight: {
    color: colors.primary,
    backgroundImage: `linear-gradient(100deg, ${colors.primaryDark} 0%, ${colors.primary} 45%, ${colors.accent} 100%)`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as unknown as TextStyle,
  subheadline: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    lineHeight: 27,
    maxWidth: 480,
    textAlign: 'left',
    marginBottom: spacing.xl,
  },
  subheadlineCompact: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  ctaRowCompact: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  ctaButton: {
    minWidth: 220,
  },
  ctaButtonCompact: {
    minWidth: 0,
    width: '100%',
  },
  // The claim made concrete: a tilted, gently floating devis-card mockup
  // standing in for a device screenshot (none of the app's real screens
  // are photogenic enough at this scale) — built from the same primitives
  // as the rest of the page rather than an imported illustration.
  heroVisual: {
    width: 330,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: colors.text,
    shadowOpacity: 0.16,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 28 },
  },
  heroVisualCompact: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    marginTop: spacing.xxxl,
    transform: [{ rotate: '0deg' }],
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  heroCardDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  heroCardTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  heroCardStatusPill: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  heroCardStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  heroCardLines: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroCardLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroCardLineText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  heroCardLinePrice: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  heroCardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  heroCardTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroCardTotalLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  heroCardTotalValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  heroCardBadge: {
    position: 'absolute',
    left: -14,
    bottom: -14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    shadowColor: colors.success,
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  heroCardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  // Full-bleed ticker bar: edge to edge, not a rounded pill — a hairline
  // "info bar" that reads as live data rather than a decorative chip.
  statsTickerOuter: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  } as unknown as ViewStyle,
  statsTickerInner: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  statsTickerLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsTickerLiveText: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statsTickerDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  statsTickerStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statsTickerCoinAnchor: {
    position: 'relative',
  },
  statsTickerValue: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  statsTickerValueAccent: {
    color: colors.primary,
  },
  statsTickerLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  coinParticle: {
    position: 'absolute',
    top: 0,
    left: '50%',
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  section: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl * 1.5,
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
  // A small tracked label above each section title — encodes the section's
  // role in the page (problem vs. solution, tarifs, métiers…) rather than
  // decorating it, and gives the page the same "eyebrow → headline" rhythm
  // throughout instead of titles just appearing cold.
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
    lineHeight: 40,
    marginBottom: spacing.xl,
    maxWidth: 640,
    textWrap: 'balance',
  } as unknown as TextStyle,
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
  // Visual thread linking "le problème" to "ce qu'on apporte" — a short
  // gradient stem ending in an arrow badge, standing in for the connective
  // copy a two-panel problem→solution layout would otherwise need.
  narrativeConnector: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  narrativeLine: {
    width: 2,
    height: 40,
    backgroundImage: `linear-gradient(180deg, ${colors.border}, ${colors.primary})`,
  } as unknown as ViewStyle,
  narrativeArrowBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginTop: -2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
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
  statsLiveDotWrap: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsLiveDotGlow: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: NEON_GREEN,
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  statsLiveDotCore: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: NEON_GREEN,
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  // A narrow, rule-separated list instead of a row of boxed cards — reads
  // as a short diagnostic (three symptoms) rather than three interchangeable
  // tiles, and stays visually distinct from the "solution" cards below.
  painList: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  painRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  painRowLast: {
    borderBottomWidth: 0,
  },
  painRowText: {
    flex: 1,
    paddingTop: 2,
  },
  // Deliberately desaturated — "the problem" reads muted/grey, "the
  // solution" (featureIcon, below) gets the brand gradient, so the color
  // shift itself carries the before/after story.
  painIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  // The bento "hero" tile: one full-width banner ahead of the grid, so the
  // first capability reads as a deliberate lead rather than tile #1 of 9.
  featureHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundImage: `linear-gradient(120deg, ${colors.primarySoft}, ${colors.surface} 65%)`,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  } as unknown as ViewStyle,
  featureHeroCardCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  featureHeroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as unknown as ViewStyle,
  featureHeroBody: {
    flex: 1,
    width: '100%',
  },
  featureHeroTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
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
    shadowOpacity: 0.09,
    shadowRadius: 24,
    transform: [{ translateY: -3 }],
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
  featureIconRow: {
    marginBottom: spacing.xs,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
    alignItems: 'center',
    justifyContent: 'center',
  } as unknown as ViewStyle,
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
    backgroundImage: `linear-gradient(135deg, ${colors.primarySoft}, ${colors.accentSoft})`,
    alignItems: 'center',
    justifyContent: 'center',
  } as unknown as ViewStyle,
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
  // Inverted (dark) instead of white-with-a-border — breaks the
  // otherwise all-white-card monotony of the grid and reads as "this one
  // is different" without needing a bigger badge or a louder border.
  priceCardHighlight: {
    backgroundImage: `linear-gradient(160deg, ${colors.text}, #150f0a)`,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 20 },
    // Physically lifted above the other plans — the "recommended" card
    // isn't just outlined, it visibly floats a step closer to the reader.
    transform: [{ translateY: -10 }],
  } as unknown as ViewStyle,
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
  priceNameOnDark: {
    color: 'rgba(255,255,255,0.72)',
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
  priceAmountOnDark: {
    color: '#fff',
  },
  pricePeriod: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 4,
  },
  pricePeriodOnDark: {
    color: 'rgba(255,255,255,0.5)',
  },
  priceYearlyNoteOnDark: {
    color: 'rgba(255,255,255,0.5)',
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
  priceFeatureTextOnDark: {
    color: 'rgba(255,255,255,0.85)',
  },
  priceFeatureTextMuted: {
    color: colors.textMuted,
  },
  priceFeatureTextMutedOnDark: {
    color: 'rgba(255,255,255,0.35)',
  },
  swissBand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xxl,
    padding: spacing.xxl,
    borderRadius: radius.xl,
    backgroundImage: `linear-gradient(135deg, ${colors.primarySoft}, ${colors.accentSoft})`,
  } as unknown as ViewStyle,
  swissBandCompact: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  swissBandCopy: {
    flex: 1,
  },
  swissBandCopyCompact: {
    alignItems: 'center',
  },
  // Restated as a scannable checklist instead of leaving the same three
  // facts buried in one paragraph — the paragraph stays too, for anyone
  // who wants the fuller sentence.
  swissFacts: {
    gap: spacing.md,
    flexShrink: 0,
  },
  swissFactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  swissFactCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  swissFactText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
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
    maxWidth: 460,
    lineHeight: 22,
  },
  swissTextCompact: {
    textAlign: 'center',
    maxWidth: 480,
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
    backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
    marginTop: spacing.xxl,
  } as unknown as ViewStyle,
  finalCta: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  finalCtaTitle: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 44,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 560,
    textWrap: 'balance',
  } as unknown as TextStyle,
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
