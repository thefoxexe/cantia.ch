import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Linking,
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
import { marketingFonts } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';
import type { Plan } from '../lib/types';

type IconName = keyof typeof Feather.glyphMap;

const NEON_GREEN = '#39FF6A';
const PAIN_ICONS: IconName[] = ['send', 'users', 'credit-card', 'camera'];
const FEATURE_ICONS: IconName[] = ['file-text', 'folder', 'image', 'zap', 'shield', 'layout', 'list', 'map-pin', 'users', 'briefcase'];
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
  const usersBurst = useCountUpBurst(landingStats?.users_count);
  const orgsBurst = useCountUpBurst(landingStats?.organizations_count);
  const cashBurst = useCountUpBurst(landingStats?.cash_collected_chf);
  // Fixed at load, not part of the "live" ticker — it doesn't grow while
  // you watch, it's just today's number, so it lives as its own quiet line
  // above the hero rather than mixed in with the counters that do grow.
  const launchDays = daysSinceLaunch();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  // Starts on the first item (not null) so the accordion's payoff — the
  // checklist detail — is visible on arrival instead of requiring a click
  // to discover the section does anything beyond a static icon list.
  const [expandedFeature, setExpandedFeature] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { width, height: windowHeight } = useWindowDimensions();
  const isCompactNav = width < breakpoints.tablet;
  // The hero's two-column row (copy + devis card) needs more room than the
  // nav bar does to not look cramped — nav links fit fine down to ~640px,
  // but the hero was switching to that same row layout at 640px too and
  // wrapping its CTA buttons awkwardly well before the row actually had
  // space for both columns. Give the hero its own, wider breakpoint.
  const isCompactHero = width < breakpoints.desktop;
  // The pain section's clustered-then-parting ChaosChip mockups need real
  // room either side of the centered text column — only worth it once the
  // section is comfortably wider than that column plus two full chips.
  const showChaosChips = width >= 1200;
  // Below that, a two-chip phone variant (parting up/down instead of to the
  // four corners, since there's no horizontal margin to send them into)
  // keeps the same scroll-driven reveal on the devices most visitors
  // actually open the site on, rather than falling back to static text.
  const showChaosChipsCompact = width < breakpoints.tablet;
  const chaosChipCompactWidth = 172;
  const chaosChipCompactCenter = Math.round((width - spacing.xl * 2 - chaosChipCompactWidth) / 2);

  const menuAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  // The hero copy no longer fades in as one block — kicker, headline,
  // subheadline and the CTA row each get their own value so they cascade in
  // one after another (see the Animated.stagger below) instead of the whole
  // block popping in at once.
  const heroKickerAnim = useRef(new Animated.Value(0)).current;
  const heroHeadlineAnim = useRef(new Animated.Value(0)).current;
  const heroSubAnim = useRef(new Animated.Value(0)).current;
  const heroCtaAnim = useRef(new Animated.Value(0)).current;
  const livePulse = useRef(new Animated.Value(0)).current;
  // Continuous, subtle motion so the hero doesn't read as a static screenshot:
  // the phone mockup gently floats, and the two background blobs breathe out
  // of phase with each other. Neither ties to scroll/reveal state — they run
  // for as long as the hero is mounted.
  const blobPulse = useRef(new Animated.Value(0)).current;
  // Cursor-tracked tilt on the hero devis card (desktop web only) — a
  // subtle "leans toward the pointer" 3D effect, composed on top of (not
  // replacing) the ambient blobPulse float below.
  const heroTiltX = useRef(new Animated.Value(0)).current;
  const heroTiltY = useRef(new Animated.Value(0)).current;
  const heroVisualRef = useRef<View>(null);
  const menuItemAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0)),
  ).current;
  // The problem→solution connector's little "trailing" lag as you scroll:
  // each scroll tick nudges it away from rest by a fraction of that tick's
  // delta, then it springs back to 0 — so it visibly lags a beat behind the
  // page before catching back up, instead of just being static.
  const connectorPull = useRef(new Animated.Value(0)).current;
  const lastScrollYRef = useRef(0);

  // Scroll-triggered section reveals: each section registers its own y
  // offset on layout, and the shared scroll handler below fades + lifts it
  // in once it's ~85% into the viewport. Plain refs (not state) hold the
  // per-section Animated.Value / offset / "already played" bookkeeping so
  // that a scroll re-render never has to walk through setState.
  const sectionOffsets = useRef<Record<string, number>>({}).current;
  const sectionHeights = useRef<Record<string, number>>({}).current;
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
    (key: string, y: number, height?: number) => {
      sectionOffsets[key] = y;
      if (height != null) sectionHeights[key] = height;
      checkReveals(scrollYRef.current, windowHeight);
    },
    [checkReveals, sectionOffsets, sectionHeights, windowHeight],
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      scrollYRef.current = y;
      setScrolled((prev) => (prev !== y > 4 ? y > 4 : prev));
      checkReveals(y, e.nativeEvent.layoutMeasurement.height);

      const delta = y - lastScrollYRef.current;
      lastScrollYRef.current = y;
      connectorPull.stopAnimation();
      connectorPull.setValue(Math.max(-16, Math.min(16, delta * 0.8)));
      Animated.spring(connectorPull, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }).start();
    },
    [checkReveals, connectorPull],
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
    Animated.stagger(110, [
      Animated.timing(heroKickerAnim, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(heroHeadlineAnim, { toValue: 1, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(heroSubAnim, { toValue: 1, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(heroCtaAnim, { toValue: 1, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(heroAnim, { toValue: 1, duration: 640, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, [heroAnim, heroKickerAnim, heroHeadlineAnim, heroSubAnim, heroCtaAnim]);

  // Cursor-tracked tilt on the hero devis card — desktop web only, a subtle
  // "leans toward the pointer" effect layered on top of the ambient
  // blobPulse float rather than replacing it.
  useEffect(() => {
    if (Platform.OS !== 'web' || isCompactHero) return;
    const handleMove = (e: MouseEvent) => {
      const el = heroVisualRef.current as unknown as HTMLElement | null;
      if (!el || typeof el.getBoundingClientRect !== 'function') return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      heroTiltX.setValue(Math.max(-1, Math.min(1, dx)));
      heroTiltY.setValue(Math.max(-1, Math.min(1, dy)));
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [isCompactHero, heroTiltX, heroTiltY]);

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
            <View style={[styles.hero, isCompactHero && styles.heroCompact]}>
              <View style={[styles.heroCopy, isCompactHero && styles.heroCopyCompact]}>
                <Animated.View
                  style={[
                    styles.kicker,
                    isCompactHero && styles.kickerCompact,
                    {
                      opacity: heroKickerAnim,
                      transform: [{ translateY: heroKickerAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
                    },
                  ]}
                >
                  <View style={styles.kickerDot} />
                  <Text style={styles.kickerText}>{t.hero.kicker}</Text>
                </Animated.View>
                <Animated.Text
                  style={[
                    styles.headline,
                    isCompactHero && styles.headlineCompact,
                    {
                      opacity: heroHeadlineAnim,
                      transform: [{ translateY: heroHeadlineAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                    },
                  ]}
                >
                  {t.hero.headlinePrefix}{' '}
                  <Text style={styles.headlineHighlight}>{t.hero.headlineHighlight}</Text>
                </Animated.Text>
                <Animated.Text
                  style={[
                    styles.subheadline,
                    isCompactHero && styles.subheadlineCompact,
                    {
                      opacity: heroSubAnim,
                      transform: [{ translateY: heroSubAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
                    },
                  ]}
                >
                  {t.hero.subheadline}
                </Animated.Text>
                <Animated.View
                  style={[
                    styles.ctaRow,
                    isCompactHero && styles.ctaRowCompact,
                    {
                      opacity: heroCtaAnim,
                      transform: [{ translateY: heroCtaAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
                    },
                  ]}
                >
                  <HoverLift style={isCompactHero && styles.ctaButtonCompact}>
                    <Link href={authHref('signup')} asChild>
                      <Button
                        title={t.hero.cta1}
                        onPress={() => {}}
                        style={StyleSheet.flatten([styles.ctaButton, isCompactHero && styles.ctaButtonCompact])}
                      />
                    </Link>
                  </HoverLift>
                  <HoverLift style={isCompactHero && styles.ctaButtonCompact}>
                    <Link href={authHref('login')} asChild>
                      <Button
                        title={t.hero.cta2}
                        onPress={() => {}}
                        variant="secondary"
                        style={StyleSheet.flatten([styles.ctaButton, isCompactHero && styles.ctaButtonCompact])}
                      />
                    </Link>
                  </HoverLift>
                </Animated.View>
              </View>

              {/* ---- The claim made concrete: a live-looking devis card,
                  gently floating, and gently tilting toward the cursor on
                  desktop, instead of an abstract illustration. ---- */}
              <Animated.View
                ref={heroVisualRef}
                style={[
                  styles.heroVisual,
                  isCompactHero && styles.heroVisualCompact,
                  {
                    opacity: heroAnim,
                    transform: [
                      { perspective: 800 },
                      { translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) },
                      { rotate: blobPulse.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '-2deg'] }) },
                      { translateY: blobPulse.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
                      { rotateY: heroTiltX.interpolate({ inputRange: [-1, 1], outputRange: ['7deg', '-7deg'] }) },
                      { rotateX: heroTiltY.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] }) },
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

                {/* A second, shallower layer of depth — bobs opposite the
                    card itself so the two never move in lockstep, reading
                    as a live notification arriving rather than a sticker
                    glued to the mockup. Visible at every width — tucked in
                    closer to the card's edge on phones so it can't clip off
                    the viewport the way the desktop offset would. */}
                <Animated.View
                  style={[
                    styles.heroCardToast,
                    isCompactHero && styles.heroCardToastCompact,
                    {
                      transform: [
                        { translateY: blobPulse.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) },
                        { rotate: blobPulse.interpolate({ inputRange: [0, 1], outputRange: ['3deg', '1deg'] }) },
                      ],
                    },
                  ]}
                >
                  <View style={styles.heroCardToastIcon}>
                    <Feather name="bell" size={11} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.heroCardToastTitle}>Facture #204 payée</Text>
                    <Text style={styles.heroCardToastText}>Il y a 2 minutes</Text>
                  </View>
                </Animated.View>
              </Animated.View>
            </View>
          </View>

          {/* ---- Live stats: a full-bleed ticker bar, not a rounded pill —
              see the landing_stats table + triggers in the Supabase
              migration. Every figure spawns a little floating glyph and
              pulses as it counts up, not just the cash one. Mobile gets its
              own stacked layout instead of the desktop row wrapping
              mid-label. ---- */}
          <View style={styles.statsTickerOuter}>
            {isCompactNav ? (
              <View style={styles.statsTickerCompact}>
                <View style={styles.statsTickerLiveCompact}>
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
                  <Text style={styles.statsTickerLaunchNote}>
                    · Lancé il y a {launchDays} jour{launchDays > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.statsTickerRowCompact}>
                  <View style={styles.statsTickerCoinAnchor}>
                    <Animated.Text
                      style={[styles.statsTickerValueCompact, { transform: [{ scale: orgsBurst.pulse }] }]}
                    >
                      {landingStats ? formatStatCount(Math.round(orgsBurst.display)) : '—'}
                    </Animated.Text>
                    {orgsBurst.particles.map((p) => (
                      <BurstParticle key={p.id} x={p.x} glyph="+1" onDone={() => orgsBurst.removeParticle(p.id)} />
                    ))}
                  </View>
                  <Text style={styles.statsTickerLabelCompact}>entreprises inscrites</Text>
                </View>
                <View style={styles.statsTickerRowCompact}>
                  <View style={styles.statsTickerCoinAnchor}>
                    <Animated.Text
                      style={[styles.statsTickerValueCompact, { transform: [{ scale: usersBurst.pulse }] }]}
                    >
                      {landingStats ? formatStatCount(Math.round(usersBurst.display)) : '—'}
                    </Animated.Text>
                    {usersBurst.particles.map((p) => (
                      <BurstParticle key={p.id} x={p.x} glyph="+1" onDone={() => usersBurst.removeParticle(p.id)} />
                    ))}
                  </View>
                  <Text style={styles.statsTickerLabelCompact}>utilisateurs actifs</Text>
                </View>
                <View style={[styles.statsTickerRowCompact, styles.statsTickerRowCompactLast]}>
                  <View style={styles.statsTickerCoinAnchor}>
                    <Animated.Text
                      style={[
                        styles.statsTickerValueCompact,
                        styles.statsTickerValueAccent,
                        { transform: [{ scale: cashBurst.pulse }] },
                      ]}
                    >
                      {landingStats ? `CHF ${formatStatChf(cashBurst.display)}` : '—'}
                    </Animated.Text>
                    {cashBurst.particles.map((p) => (
                      <BurstParticle key={p.id} x={p.x} glyph="CHF" onDone={() => cashBurst.removeParticle(p.id)} />
                    ))}
                  </View>
                  <Text style={styles.statsTickerLabelCompact}>encaissés via Cantia</Text>
                </View>
              </View>
            ) : (
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
                  <Text style={styles.statsTickerLaunchNote}>
                    · Lancé il y a {launchDays} jour{launchDays > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.statsTickerDivider} />
                <View style={styles.statsTickerStat}>
                  <View style={styles.statsTickerCoinAnchor}>
                    <Animated.Text
                      style={[styles.statsTickerValue, { transform: [{ scale: orgsBurst.pulse }] }]}
                    >
                      {landingStats ? formatStatCount(Math.round(orgsBurst.display)) : '—'}
                    </Animated.Text>
                    {orgsBurst.particles.map((p) => (
                      <BurstParticle key={p.id} x={p.x} glyph="+1" onDone={() => orgsBurst.removeParticle(p.id)} />
                    ))}
                  </View>
                  <Text style={styles.statsTickerLabel}>entreprises nous ont déjà rejoint</Text>
                </View>
                <View style={styles.statsTickerDivider} />
                <View style={styles.statsTickerStat}>
                  <View style={styles.statsTickerCoinAnchor}>
                    <Animated.Text
                      style={[styles.statsTickerValue, { transform: [{ scale: usersBurst.pulse }] }]}
                    >
                      {landingStats ? formatStatCount(Math.round(usersBurst.display)) : '—'}
                    </Animated.Text>
                    {usersBurst.particles.map((p) => (
                      <BurstParticle key={p.id} x={p.x} glyph="+1" onDone={() => usersBurst.removeParticle(p.id)} />
                    ))}
                  </View>
                  <Text style={styles.statsTickerLabel}>utilisateurs actifs</Text>
                </View>
                <View style={styles.statsTickerDivider} />
                <View style={styles.statsTickerStat}>
                  <View style={styles.statsTickerCoinAnchor}>
                    <Animated.Text
                      style={[
                        styles.statsTickerValue,
                        styles.statsTickerValueAccent,
                        { transform: [{ scale: cashBurst.pulse }] },
                      ]}
                    >
                      {landingStats ? `CHF ${formatStatChf(cashBurst.display)}` : '—'}
                    </Animated.Text>
                    {cashBurst.particles.map((p) => (
                      <BurstParticle key={p.id} x={p.x} glyph="CHF" onDone={() => cashBurst.removeParticle(p.id)} />
                    ))}
                  </View>
                  <Text style={styles.statsTickerLabel}>encaissés via Cantia</Text>
                </View>
              </View>
            )}
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

          {/* ---- Pain points ("before") — four document mockups (a stale
              devis, an unsent site report, an overdue invoice, unsorted
              photos) sit permanently around the headline, faded to a low,
              translucent opacity to read as "done with, in the past" next
              to the fully-opaque headline/diagnostic list. They enter once,
              together with the rest of the section, on the section's own
              scroll-into-view reveal (see <Reveal> below) — nothing keeps
              animating or moving once that single entrance has played. ---- */}
          <Reveal id="pain" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <View style={[styles.chaosLayer, showChaosChipsCompact && styles.chaosLayerCompact]}>
              <View>
                <Text style={[styles.sectionEyebrow, styles.centerText]}>Le problème</Text>
                <Text style={[styles.sectionTitle, styles.centerText]}>{t.pain.title}</Text>
                {/* A rule-separated diagnostic list, not boxed cards — reads
                    as a short, scannable list of symptoms rather than three
                    identical tiles, and stays visually distinct from the
                    "solution" cards it leads into below. */}
                <View style={styles.painList}>
                  {t.pain.items.map((p, i) => (
                    <Pressable
                      key={p.title}
                      style={({ hovered }: any) => [
                        styles.painRow,
                        i === t.pain.items.length - 1 && styles.painRowLast,
                        hovered && styles.painRowHovered,
                      ]}
                    >
                      {({ hovered }: any) => (
                        <>
                          <View style={[styles.painIconBadge, hovered && styles.painIconBadgeHovered]}>
                            <Feather name={PAIN_ICONS[i]} size={19} color={hovered ? '#fff' : colors.textMuted} />
                          </View>
                          <View style={styles.painRowText}>
                            <Text style={styles.painTitle}>{p.title}</Text>
                            <Text style={styles.painText}>{p.text}</Text>
                          </View>
                        </>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              {showChaosChips ? (
                <>
                  <ChaosChip icon="send" label="Devis #118" sub="Brouillon depuis 6 jours" posStyle={{ top: -14, left: 0 }} rotate={-4} />
                  <ChaosChip icon="file-text" label="Rapport de chantier" sub="Toujours pas envoyé" posStyle={{ top: -14, right: 0 }} rotate={3} />
                  <ChaosChip icon="credit-card" label="Facture #204" sub="62 jours de retard" posStyle={{ top: 100, left: 0 }} rotate={4} />
                  <ChaosChip icon="camera" label="14 photos" sub="Non triées" posStyle={{ top: 100, right: 0 }} rotate={-3} />
                </>
              ) : null}

              {showChaosChipsCompact ? (
                <>
                  <ChaosChip
                    icon="send"
                    label="Devis #118"
                    sub="Brouillon depuis 6 jours"
                    posStyle={{ top: 34, left: chaosChipCompactCenter - 16 }}
                    rotate={-3}
                    compact
                  />
                  <ChaosChip
                    icon="file-text"
                    label="Rapport de chantier"
                    sub="Toujours pas envoyé"
                    posStyle={{ top: 82, left: chaosChipCompactCenter + 14 }}
                    rotate={2}
                    compact
                  />
                  <ChaosChip
                    icon="credit-card"
                    label="Facture #204"
                    sub="62 jours de retard"
                    posStyle={{ top: 130, left: chaosChipCompactCenter + 14 }}
                    rotate={-2}
                    compact
                  />
                  <ChaosChip
                    icon="camera"
                    label="14 photos"
                    sub="Non triées"
                    posStyle={{ top: 178, left: chaosChipCompactCenter - 16 }}
                    rotate={3}
                    compact
                  />
                </>
              ) : null}
            </View>
          </Reveal>

          {/* ---- Connector: makes the pain → solution relationship visible
              instead of leaving two sections to imply it on their own —
              lags a beat behind the scroll (connectorPull) instead of
              sitting static, like it's on a short elastic tether. ---- */}
          <Animated.View
            style={[styles.narrativeConnector, { transform: [{ translateY: connectorPull }] }]}
            pointerEvents="none"
          >
            <View style={styles.narrativeLine} />
            <View style={styles.narrativeArrowBadge}>
              <Feather name="arrow-down" size={14} color="#fff" />
            </View>
          </Animated.View>

          {/* ---- Services ("after") — presented as a connected journey from
              chantier to bureau instead of a grid of cards, echoing the
              section's own title. A single line runs behind the icon nodes
              (hidden under each opaque badge, visible in the gaps), framed
              by "Chantier" and "Bureau" endpoint labels. Same click-to-expand
              behavior as before, just a completely different container. ---- */}
          <Reveal id="services" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={styles.sectionEyebrow}>Ce qu'on apporte</Text>
            <Text style={styles.sectionTitle}>{t.services.title}</Text>
            <Text style={styles.sectionSubtitle}>{t.services.subtitle}</Text>

            <View style={styles.journeyOuter}>
              <View style={styles.journeyEndpoint}>
                <View style={styles.journeyEndpointIcon}>
                  <Feather name="tool" size={14} color={colors.textMuted} />
                </View>
                <Text style={styles.journeyEndpointText}>Chantier</Text>
              </View>

              <View style={styles.journeyList}>
                <View pointerEvents="none" style={styles.journeyLine} />
                {t.services.items.map((f, i) => {
                  const expanded = expandedFeature === i;
                  const sectionAnim = getSectionAnim('services');
                  // Cascades in behind the section's own reveal instead of a
                  // second Animated.Value per row — row i's fade/rise starts
                  // slightly after row i-1's, off the same 0→1 driver.
                  const stagger = Math.min(0.06 * i, 0.5);
                  return (
                    <Animated.View
                      key={f.title}
                      style={{
                        opacity: sectionAnim.interpolate({
                          inputRange: [0, stagger, Math.min(stagger + 0.35, 1)],
                          outputRange: [0, 0, 1],
                          extrapolate: 'clamp',
                        }),
                        transform: [
                          {
                            translateY: sectionAnim.interpolate({
                              inputRange: [0, stagger, Math.min(stagger + 0.35, 1)],
                              outputRange: [16, 16, 0],
                              extrapolate: 'clamp',
                            }),
                          },
                        ],
                      }}
                    >
                      <Pressable
                        style={({ hovered }: any) => [
                          styles.journeyRow,
                          hovered && styles.journeyRowHovered,
                          expanded && styles.journeyRowExpanded,
                        ]}
                        onPress={() => setExpandedFeature(expanded ? null : i)}
                      >
                        <View style={[styles.journeyIconBadge, expanded && styles.journeyIconBadgeExpanded]}>
                          <Feather name={FEATURE_ICONS[i]} size={19} color="#fff" />
                        </View>
                        <View style={styles.journeyBody}>
                          <View style={styles.featureCardHeader}>
                            <Text style={styles.featureTitle}>{f.title}</Text>
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
                    </Animated.View>
                  );
                })}
              </View>

              <View style={[styles.journeyEndpoint, styles.journeyEndpointBottom]}>
                <View style={styles.journeyEndpointIcon}>
                  <Feather name="briefcase" size={14} color={colors.textMuted} />
                </View>
                <Text style={styles.journeyEndpointText}>Bureau</Text>
              </View>
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
                <Pressable
                  key={p.id}
                  style={({ hovered }: any) => [
                    styles.priceCard,
                    dark && styles.priceCardHighlight,
                    hovered && (dark ? styles.priceCardHighlightHovered : styles.priceCardHovered),
                  ]}
                >
                  {dark ? (
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceBadgeText}>{t.pricing.badge}</Text>
                    </View>
                  ) : null}
                  <Text style={[styles.priceName, dark && styles.priceNameOnDark]}>{planName(p.id, p.name)}</Text>
                  <View style={styles.priceAmountRow}>
                    <Text style={[styles.priceAmount, dark && styles.priceAmountOnDark]}>
                      {p.is_contact_only ? 'Sur mesure' : p.price_chf_monthly === 0 ? 'CHF 0' : `CHF ${formatChf(displayMonthly ?? 0)}`}
                    </Text>
                    {p.is_contact_only ? null : <Text style={[styles.pricePeriod, dark && styles.pricePeriodOnDark]}>/mois</Text>}
                  </View>
                  {!p.is_contact_only && isYearly && p.price_chf_monthly != null && p.price_chf_monthly > 0 && p.price_chf_yearly != null ? (
                    <Text style={[styles.priceYearlyNote, dark && styles.priceYearlyNoteOnDark]}>
                      {t.pricing.billedYearly.replace('{amount}', `CHF ${formatChf(p.price_chf_yearly)}`)}
                    </Text>
                  ) : null}
                  {p.is_contact_only ? (
                    <View style={styles.priceFeatures}>
                      <PriceFeature dark={dark} text="Sur mesure, selon les besoins de votre entreprise" included />
                    </View>
                  ) : (
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
                      <PriceFeature dark={dark} text="Envoi de devis/factures par e-mail" muted={!p.has_email_sending} included={p.has_email_sending} />
                      <PriceFeature dark={dark} text="Planning d'équipe" muted={!p.has_planning} included={p.has_planning} />
                      <PriceFeature dark={dark} text="RH, heures & salaires" muted={!p.has_payroll} included={p.has_payroll} />
                      <PriceFeature dark={dark} text="Rentabilité par chantier" muted={!p.has_profitability} included={p.has_profitability} />
                      <PriceFeature
                        dark={dark}
                        text={p.max_trames === 0 ? 'Bibliothèque de trames' : p.max_trames != null ? `${p.max_trames} trames enregistrées` : 'Bibliothèque de trames illimitée'}
                        muted={p.max_trames === 0}
                        included={p.max_trames !== 0}
                      />
                    </View>
                  )}
                  {p.is_contact_only ? (
                    <Button
                      title="Nous contacter"
                      onPress={() => {
                        Linking.openURL('mailto:info@cantia.ch?subject=Plan sur mesure Cantia').catch(() => {});
                      }}
                      variant={dark ? 'primary' : 'secondary'}
                    />
                  ) : (
                    <Link href={authHref('signup')} asChild>
                      <Button
                        title={p.price_chf_monthly === 0 ? t.pricing.freeCta : t.pricing.paidCta}
                        onPress={() => {}}
                        variant={dark ? 'primary' : 'secondary'}
                      />
                    </Link>
                  )}
                </Pressable>
                );
              })}
            </View>
          </Reveal>

          {/* ---- Swiss positioning ---- */}
          <Reveal id="swiss" getAnim={getSectionAnim} onRegister={registerSection} style={styles.swissOuter} from={18}>
            <View style={[styles.swissInner, isCompactNav && styles.swissInnerCompact]}>
              <SwissStamp />
              <View style={[styles.swissBandCopy, isCompactNav && styles.swissBandCopyCompact]}>
                <Text style={styles.swissTitle}>{t.swiss.title}</Text>
                <Text style={[styles.swissText, isCompactNav && styles.swissTextCompact]}>{t.swiss.text}</Text>
              </View>
              <View style={styles.swissFacts}>
                {['Montants en CHF, TVA suisse intégrée', 'Données hébergées en Suisse', 'Pensé pour les PME suisses'].map((fact) => (
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

          {/* ---- Final CTA — the hero's closing mirror: same grid/glow
              treatment (inverted onto the brand gradient), same scale of
              type, so the page opens and closes on the same visual beat
              instead of trailing off into a plain color band. ---- */}
          <Reveal id="finalCta" getAnim={getSectionAnim} onRegister={registerSection} style={styles.finalCtaOuter} from={18}>
            <View pointerEvents="none" style={styles.finalCtaGrid} />
            <Animated.View
              pointerEvents="none"
              style={[styles.finalCtaGlow, { opacity: blobPulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.85] }) }]}
            />
            <View style={styles.finalCta}>
              <Text style={styles.finalCtaTitle}>{t.finalCta.title}</Text>
              <Text style={styles.finalCtaSubtitle}>{t.finalCta.subtitle}</Text>
              <HoverLift>
                <Link href={authHref('signup')} asChild>
                  <Button
                    title={t.finalCta.button}
                    onPress={() => {}}
                    variant="secondary"
                    style={styles.finalCtaButton}
                  />
                </Link>
              </HoverLift>
              <View style={styles.finalCtaTrustRow}>
                {t.finalCta.trust.map((item) => (
                  <View key={item} style={styles.finalCtaTrustItem}>
                    <Feather name="check" size={13} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.finalCtaTrustText}>{item}</Text>
                  </View>
                ))}
              </View>
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
                <Link href="/aide" asChild>
                  <Pressable style={styles.footerHelpPill}>
                    <Feather name="life-buoy" size={14} color={colors.primaryDark} />
                    <Text style={styles.footerHelpPillText}>Centre d'aide & documentation</Text>
                  </Pressable>
                </Link>
              </View>
              <View style={styles.footerCol}>
                {/* Merged with the old standalone "Solutions" column — as two
                    separate columns, Produit looked nearly empty next to
                    Solutions' long list. Grouped under one "Produit" heading
                    instead, so no column reads as an afterthought. */}
                <Text style={styles.footerColTitle}>{t.footer.product}</Text>
                <Pressable onPress={scrollToServices}>
                  <Text style={styles.footerLink}>{t.footer.servicesLink}</Text>
                </Pressable>
                <Pressable onPress={scrollToPricing}>
                  <Text style={styles.footerLink}>{t.footer.pricingLink}</Text>
                </Pressable>
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
                <Link href="/solutions/rh-salaires">
                  <Text style={styles.footerLink}>RH & Salaires</Text>
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
                <Link href="/aide">
                  <Text style={styles.navLink}>{t.nav.help}</Text>
                </Link>
                <Link href={authHref('login')}>
                  <Text style={styles.navLink}>{t.nav.login}</Text>
                </Link>
                <HoverLift>
                  <Link href={authHref('signup')} asChild>
                    <Button title={t.nav.cta} onPress={() => {}} style={styles.navCta} />
                  </Link>
                </HoverLift>
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
                <Link href="/aide" asChild>
                  <MenuItem anim={menuItemAnims[3]} onPress={() => setMenuOpen(false)} icon="life-buoy" label={t.nav.help} />
                </Link>
                <Animated.View
                  style={{
                    opacity: menuItemAnims[4],
                    transform: [
                      { translateY: menuItemAnims[4].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
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
                    opacity: menuItemAnims[5],
                    transform: [
                      { translateY: menuItemAnims[5].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
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

// A hover-only "grow toward the cursor" wrapper for buttons/CTAs — pure
// CSS transition driven by react-native-web's Pressable `hovered` render
// prop, no Animated.Value needed. Never claims onPress, so it's safe to
// nest around a Link/Button without stealing their tap/click.
function HoverLift({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <Pressable style={({ hovered }: any) => [styles.hoverLift, hovered && styles.hoverLifted, style]}>
      {children}
    </Pressable>
  );
}

// A mockup of a real document (a stale devis, an overdue invoice…), parked
// permanently around the section's headline at a fixed, translucent
// opacity — reading as "behind you, done with" next to the fully-opaque
// headline it surrounds, rather than a live, still-moving distraction. Its
// only animation is the one-shot entrance the whole "pain" section already
// gets from <Reveal> (fade + slight rise the first time it scrolls into
// view) — nothing here keeps moving after that.
function ChaosChip({
  icon,
  label,
  sub,
  posStyle,
  rotate,
  compact,
}: {
  icon: IconName;
  label: string;
  sub: string;
  posStyle: { top: number; left?: number; right?: number };
  rotate: number;
  compact?: boolean;
}) {
  return (
    <View
      pointerEvents="none"
      style={[styles.chaosChip, compact && styles.chaosChipCompact, posStyle, { transform: [{ rotate: `${rotate}deg` }] }]}
    >
      <View style={[styles.chaosChipIconWrap, compact && styles.chaosChipIconWrapCompact]}>
        <Feather name={icon} size={compact ? 14 : 17} color={colors.danger} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.chaosChipLabel, compact && styles.chaosChipLabelCompact]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.chaosChipSub, compact && styles.chaosChipSubCompact]} numberOfLines={1}>
          {sub}
        </Text>
      </View>
    </View>
  );
}

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
  onRegister: (id: string, y: number, height?: number) => void;
  children: React.ReactNode;
  style?: any;
  from?: number;
}) {
  const anim = getAnim(id);
  return (
    <Animated.View
      onLayout={(e) => onRegister(id, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}
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

// Same count-up tween as useCountUp, but every ~140ms of forward progress
// it also spawns a little floating glyph (rendered by BurstParticle below,
// "CHF" for money, "+1" for headcounts) and gives the number itself a
// quick scale pulse — every ticker figure gets this "filling up" motion,
// not just the cash one.
function useCountUpBurst(target: number | undefined, duration = 1300) {
  const anim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prevTarget = useRef(0);
  const [display, setDisplay] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number }[]>([]);
  const nextParticleId = useRef(0);
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
        const id = nextParticleId.current++;
        setParticles((prev) => [...prev.slice(-5), { id, x: Math.round((Math.random() - 0.5) * 56) }]);
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

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { display, pulse, particles, removeParticle };
}

// A single glyph that rises and fades once, then removes itself — the
// little "+1" / "CHF" popping out of a ticker figure as it climbs.
function BurstParticle({ x, glyph, onDone }: { x: number; glyph: string; onDone: () => void }) {
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
      {glyph}
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
    <Pressable style={({ hovered }: any) => [styles.demoCard, hovered && styles.demoCardHovered]}>
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
    </Pressable>
  );
}

// Drawn with plain Views instead of the 🇨🇭 emoji — the emoji glyph doesn't
// render reliably on every desktop browser/OS font stack (shows as two
// separate letter tiles or nothing at all on some Windows/Linux setups),
// while a hand-drawn cross-in-a-circle always looks identical everywhere.
// An actual seal — double ring + text curved along the top arc, like a
// certification stamp — instead of a flat rounded gradient card or a
// dashed circle with horizontal text sitting inside it.
function SwissStamp() {
  return (
    <View style={styles.swissStamp}>
      <View style={styles.swissStampRingOuter} />
      <View style={styles.swissStampRingInner} />
      <ArcText text="CANTIA   ·   SUISSE   ·" radius={49} startAngle={-100} endAngle={100} style={styles.swissStampArcText} />
      <View style={styles.swissStampCross}>
        <View style={styles.swissStampCrossV} />
        <View style={styles.swissStampCrossH} />
      </View>
      <Text style={styles.swissStampCenterText}>Depuis 2026</Text>
    </View>
  );
}

// Positions each character of `text` along a circular arc, angle-by-angle
// (0° = top, clockwise) — the pure-RN-styles way to get curved seal text
// without an SVG dependency.
function ArcText({
  text,
  radius,
  startAngle,
  endAngle,
  style,
}: {
  text: string;
  radius: number;
  startAngle: number;
  endAngle: number;
  style: TextStyle;
}) {
  const chars = text.split('');
  const n = chars.length;
  return (
    <>
      {chars.map((ch, i) => {
        const angle = n === 1 ? (startAngle + endAngle) / 2 : startAngle + ((endAngle - startAngle) * i) / (n - 1);
        const rad = (angle * Math.PI) / 180;
        const x = radius * Math.sin(rad);
        const y = -radius * Math.cos(rad);
        return (
          <Text
            key={i}
            style={[
              style,
              {
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: -7,
                marginTop: -7,
                transform: [{ translateX: x }, { translateY: y }, { rotate: `${angle}deg` }],
              },
            ]}
          >
            {ch === ' ' ? '' : ch}
          </Text>
        );
      })}
    </>
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
    <Pressable style={({ hovered }: any) => [styles.demoCard, hovered && styles.demoCardHovered]}>
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
    </Pressable>
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
    <Pressable style={({ hovered }: any) => [styles.demoCard, hovered && styles.demoCardHovered]}>
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
    </Pressable>
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
    // The track is two exact copies of the same list (see `items` below)
    // and the keyframes animate a plain translateX(0) -> translateX(-50%)
    // loop, so the restart always lands on pixel-identical content —
    // faster duration doesn't introduce any visible jump, it's still the
    // same seamless loop, just quicker.
    if (node) node.style.animation = `cantia-marquee ${compact ? 6 : 32}s linear infinite`;
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
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  headline: {
    fontFamily: marketingFonts.display,
    fontSize: 66,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 68,
    letterSpacing: -1.2,
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
    fontFamily: marketingFonts.body,
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
  // Centered pill buttons, not edge-to-edge blocks — matches the centered
  // headline/subheadline above instead of breaking from it with a full-width
  // rectangle.
  ctaRowCompact: {
    flexDirection: 'column',
    alignSelf: 'center',
    alignItems: 'center',
  },
  ctaButton: {
    minWidth: 220,
  },
  ctaButtonCompact: {
    minWidth: 260,
  },
  // Pure-CSS hover transition (web only) for HoverLift — no Animated.Value,
  // just a transform swap the browser tweens on its own.
  hoverLift: {
    transitionProperty: 'transform',
    transitionDuration: '0.22s',
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  } as unknown as ViewStyle,
  hoverLifted: {
    transform: [{ translateY: -3 }, { scale: 1.035 }],
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
  heroCardToast: {
    position: 'absolute',
    top: -22,
    right: -30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  // On phones heroVisualCompact is centered with limited side margin — the
  // desktop offset would push this past the viewport edge and get clipped.
  heroCardToastCompact: {
    top: -14,
    right: -6,
  },
  heroCardToastIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroCardToastTitle: {
    fontFamily: marketingFonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  heroCardToastText: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    color: colors.textMuted,
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
  // Sits right on the live badge, not off in the hero — fixed, not part of
  // the count-up figures, so a quieter untracked style than the numbers.
  statsTickerLaunchNote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
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
  // Mobile gets its own stacked list instead of the desktop row's inline
  // wrapping — a long label like "entreprises nous ont déjà rejoint" next
  // to a number has nowhere good to break on a narrow screen, so each stat
  // gets a full-width row instead of fighting for space.
  statsTickerCompact: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statsTickerLiveCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsTickerRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsTickerRowCompactLast: {
    borderBottomWidth: 0,
  },
  statsTickerValueCompact: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  statsTickerLabelCompact: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
    flexShrink: 1,
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
    fontFamily: marketingFonts.body,
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 36,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.4,
    lineHeight: 42,
    marginBottom: spacing.xl,
    maxWidth: 640,
    textWrap: 'balance',
  } as unknown as TextStyle,
  sectionSubtitle: {
    fontFamily: marketingFonts.body,
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
    transitionProperty: 'transform, box-shadow, border-color',
    transitionDuration: '0.25s',
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  } as unknown as ViewStyle,
  demoCardHovered: {
    borderColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 26,
    transform: [{ translateY: -4 }],
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
  // Positioning context for the ChaosChip mockups either side of painList —
  // spans the section's full (already-padded) content width so the chips'
  // absolute top/left/right sit in the margin outside the 680px column
  // instead of overlapping the readable text.
  chaosLayer: {
    position: 'relative',
    width: '100%',
  },
  // On phones there's no side margin for the chips to park in like on
  // desktop (driftX there sends them 480px out into open space beside the
  // text column) — without this, the compact chips' posStyle top values sat
  // inside the headline's own vertical span, so their card edges crossed
  // directly through the title letters instead of sitting cleanly apart
  // from it. Reserving a fixed band above the headline for them to occupy
  // (see the compact ChaosChip posStyle values below, shifted to live
  // inside this band) keeps the two from ever overlapping.
  chaosLayerCompact: {
    paddingTop: 236,
  },
  chaosChip: {
    position: 'absolute',
    width: 216,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    // Faded, not full-strength — reads as "behind you" next to the
    // fully-opaque headline it surrounds.
    opacity: 0.55,
  },
  chaosChipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chaosChipLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  chaosChipSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  // Phone variant — same choreography, sized to fit a narrow viewport where
  // the desktop four-corner layout has no room to breathe.
  chaosChipCompact: {
    width: 172,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  chaosChipIconWrapCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  chaosChipLabelCompact: {
    fontSize: 12,
  },
  chaosChipSubCompact: {
    fontSize: 10,
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
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    transitionProperty: 'background-color, transform',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
  } as unknown as ViewStyle,
  painRowHovered: {
    backgroundColor: colors.surfaceAlt,
    transform: [{ translateX: 4 }],
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
  // shift itself carries the before/after story. On hover the badge
  // previews that same shift — a little "this is what gets fixed" tell.
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
    transitionProperty: 'background-color, border-color, transform',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
  } as unknown as ViewStyle,
  painIconBadgeHovered: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    transform: [{ scale: 1.08 }],
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
  // ---- Services journey: a connected vertical line running behind the
  // icon nodes (hidden under each opaque badge, visible in the gaps),
  // framed by "Chantier"/"Bureau" endpoint labels — replaces the old
  // bento-banner + card-grid presentation entirely.
  journeyOuter: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  journeyEndpoint: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  journeyEndpointBottom: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
  journeyEndpointIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyEndpointText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  journeyList: {
    position: 'relative',
  },
  // Anchored to the vertical center of the icon badges (paddingVertical lg
  // + half the 48px badge = 40px from the list's top/bottom edge at rest),
  // sitting behind the badges (rendered first, no zIndex needed since the
  // badges are opaque) so it reads as one continuous line threading
  // through every stop rather than a decoration floating beside them.
  journeyLine: {
    position: 'absolute',
    top: 40,
    bottom: 40,
    left: 31,
    width: 2,
    backgroundColor: colors.border,
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    transitionProperty: 'background-color',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
  } as unknown as ViewStyle,
  journeyRowHovered: {
    backgroundColor: colors.surfaceAlt,
  },
  journeyRowExpanded: {
    backgroundColor: colors.surfaceAlt,
  },
  journeyIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '0.25s',
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  } as unknown as ViewStyle,
  journeyIconBadgeExpanded: {
    transform: [{ scale: 1.1 }],
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  journeyBody: {
    flex: 1,
    paddingTop: 2,
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    transitionProperty: 'transform, box-shadow, border-color',
    transitionDuration: '0.25s',
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  } as unknown as ViewStyle,
  priceCardHovered: {
    borderColor: colors.primary,
    transform: [{ translateY: -6 }],
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
  // Same lift as priceCardHighlight's base transform, just pushed a
  // little further on hover (-14 total) so the recommended card still
  // reads as "further forward" than the others' -6.
  priceCardHighlightHovered: {
    shadowOpacity: 0.45,
    transform: [{ translateY: -14 }],
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
  // Full-bleed, hairline-bordered band — same "info bar" family as the
  // stats ticker — instead of a padded rounded gradient card floating in
  // the page.
  swissOuter: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  swissInner: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  swissInnerCompact: {
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
  swissStamp: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transform: [{ rotate: '-7deg' }],
  },
  // Double ring — solid outer + dashed inner — the classic certification
  // seal silhouette, instead of one thin dashed circle.
  swissStampRingOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  swissStampRingInner: {
    position: 'absolute',
    top: 7,
    left: 7,
    right: 7,
    bottom: 7,
    borderRadius: 59,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  swissStampArcText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    width: 14,
    textAlign: 'center',
  },
  swissStampCross: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#DA291C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swissStampCrossV: {
    position: 'absolute',
    width: 4,
    height: 14,
    borderRadius: 1,
    backgroundColor: '#fff',
  },
  swissStampCrossH: {
    position: 'absolute',
    width: 14,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#fff',
  },
  swissStampCenterText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
    marginTop: 7,
  },
  swissTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
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
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
    marginTop: spacing.xxl,
  } as unknown as ViewStyle,
  // Same grid texture as the hero, inverted to a faint white so it reads on
  // the dark gradient instead of disappearing — the closing section echoes
  // the opening one rather than landing as a flat, unrelated color band.
  finalCtaGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)',
    backgroundSize: '44px 44px',
    maskImage: 'radial-gradient(ellipse 70% 90% at 50% 40%, black, transparent)',
    WebkitMaskImage: 'radial-gradient(ellipse 70% 90% at 50% 40%, black, transparent)',
  } as unknown as ViewStyle,
  finalCtaGlow: {
    position: 'absolute',
    top: -180,
    left: '50%',
    marginLeft: -280,
    width: 560,
    height: 420,
    borderRadius: 280,
    backgroundColor: colors.accent,
    filter: 'blur(90px)',
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
    fontFamily: marketingFonts.display,
    fontSize: 44,
    fontWeight: '600',
    letterSpacing: -0.8,
    lineHeight: 48,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.md,
    maxWidth: 600,
    textWrap: 'balance',
  } as unknown as TextStyle,
  finalCtaSubtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: spacing.xl,
    maxWidth: 440,
  },
  finalCtaButton: {
    minWidth: 260,
  },
  finalCtaTrustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  finalCtaTrustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  finalCtaTrustText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
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
