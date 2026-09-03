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
import { Link, Redirect, usePathname, useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, LangToggle, Screen, Switch } from '../components/ui';
import { LanguageSwitcher, MarketingFooter } from '../components/MarketingChrome';
import { ShowcaseVideo } from '../components/ShowcaseVideo';
import { supabase } from '../lib/supabase';
import { useMarketingDict } from '../lib/i18n';
import { getAppLocale, useTranslation } from '../lib/translations';
import { getTradePage, TRADE_PAGE_SLUGS, pluralTradeName } from '../lib/tradeLandingPages';
import { colors, fontSize, radius, spacing, breakpoints } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref, toggleLocalePathname, useSyncMarketingLocaleFromPath } from '../lib/appHost';
import type { Plan } from '../lib/types';

type IconName = keyof typeof Feather.glyphMap;
type TradeIconName = keyof typeof MaterialCommunityIcons.glyphMap;

const NEON_GREEN = '#39FF6A';
// Manually maintained, not fetched. Bumped to 30 on Bastien's explicit
// instruction (2.09.2026) ahead of an outreach campaign expected to land at
// least 10 more real signups on top of the 20 non-demo organizations at the
// time — bump by hand; never wire this back up to a live query.
const TRUST_COMPANY_COUNT = 30;
// Real customer feedback (not every one of the TRUST_COMPANY_COUNT
// companies has left a rating, but the ones who have are consistently
// close to 5/5) — rounded down from what Bastien reports rather than up,
// for the same "never overstate" reason as the company count above. Bump
// by hand only from real feedback, never invented.
const TRUST_RATING = '4.89';
const PAIN_ICONS: IconName[] = ['send', 'image', 'trending-down'];
// One icon per lib/i18n.tsx services.items entry, same order: the 5
// flagship features first (devis, chantiers & rapports, planning,
// facturation, rentabilité), then the 7 secondary ones.
const FEATURE_ICONS: IconName[] = ['mic', 'file-text', 'calendar', 'credit-card', 'trending-up', 'folder', 'image', 'shield', 'layout', 'list', 'users', 'briefcase'];
// One small "artwork" icon per trade, in the same order as t.trades.list —
// paired by index rather than by name so this stays a plain parallel array,
// no separate per-trade copy needed. MaterialCommunityIcons rather than
// Feather here specifically because Feather has no trade-specific glyphs —
// its closest matches (a generic wrench, a droplet) read as "tool" and
// "water", not "plumber" and "electrician". These are still generic vector
// icons, not custom illustration, but each one is at least recognizably
// tied to its own trade rather than interchangeable with its neighbors.
const TRADE_ICONS: TradeIconName[] = ['crane', 'wall', 'lock', 'flash', 'pipe-wrench', 'saw-blade', 'format-paint', 'texture-box'];
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
  const t = useMarketingDict();
  const { t: tr } = useTranslation();
  // The homepage has its own nav (below) rather than the shared
  // MarketingNav — it needs the same URL<->language resync on client-side
  // navigation that MarketingNav gets, or a visitor arriving here from a
  // /de page (via the footer's language switcher, since this page has no
  // top-nav one — see the /de homepage question) stays stuck in German.
  useSyncMarketingLocaleFromPath();
  const pathname = usePathname();
  const router = useRouter();
  const appLocale = getAppLocale();
  const tradeHrefPrefix = appLocale === 'de' ? '/de/' : '/';
  const aideHref = `${tradeHrefPrefix}aide`;
  const scrollRef = useRef<ScrollView>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  // Starts true so the pricing grid renders skeleton cards instead of a bare
  // gap on first paint — the fetch below is usually fast, but on a slow
  // chantier connection that gap could sit empty for a second or two, right
  // on the section carrying the site's main commercial argument.
  const [plansLoading, setPlansLoading] = useState(true);
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
  const skeletonPulse = useRef(new Animated.Value(0.5)).current;
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
  // Deep-linking into a section from another page (e.g. the shared
  // MarketingNav's "Tarifs" link now points at "/#pricing" instead of a
  // plain "/" that dumped visitors at the top). Read via useEffect rather
  // than a useRef initializer: on a client-side Link navigation from an
  // already-mounted page (not a full reload), window.location.hash isn't
  // reliably updated yet at the exact moment this component's first render
  // evaluates — confirmed by testing (a full page load to "/#pricing"
  // scrolled correctly, a same-app Link click to it didn't). An effect
  // runs after commit, by which point the router's history update has
  // settled either way.
  const pendingHashScrollRef = useRef<string | null>(null);
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
      if (pendingHashScrollRef.current === key) {
        pendingHashScrollRef.current = null;
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ y: y - NAV_HEIGHT - 12, animated: false });
        });
      }
    },
    [checkReveals, sectionOffsets, sectionHeights, windowHeight],
  );

  // A plain "hashchange" listener isn't enough: confirmed by instrumenting
  // history.pushState that Expo Router's web client-side transition (e.g.
  // clicking "Tarifs" from another page) navigates via
  // history.pushState("/#pricing") — and per spec, pushState/replaceState
  // never fire "hashchange", only real navigation (link click, back/forward,
  // or a direct location.hash assignment) does. A full page load worked
  // before only because the browser sets location.hash synchronously before
  // any JS runs, not through this path at all. Fix: patch pushState once to
  // also dispatch a custom event, so same-app <Link> navigation is caught
  // the same way as a full load or back/forward.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const tryScrollToHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      const y = sectionOffsets[hash];
      if (y != null) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ y: y - NAV_HEIGHT - 12, animated: false });
        });
      } else {
        pendingHashScrollRef.current = hash;
      }
    };

    const win = window as typeof window & { __cantiaPushStatePatched?: boolean };
    if (!win.__cantiaPushStatePatched) {
      win.__cantiaPushStatePatched = true;
      const originalPushState = window.history.pushState.bind(window.history);
      window.history.pushState = ((...args: Parameters<typeof window.history.pushState>) => {
        originalPushState(...args);
        window.dispatchEvent(new Event('cantia:locationchange'));
      }) as typeof window.history.pushState;
    }

    tryScrollToHash();
    window.addEventListener('hashchange', tryScrollToHash);
    window.addEventListener('popstate', tryScrollToHash);
    window.addEventListener('cantia:locationchange', tryScrollToHash);
    return () => {
      window.removeEventListener('hashchange', tryScrollToHash);
      window.removeEventListener('popstate', tryScrollToHash);
      window.removeEventListener('cantia:locationchange', tryScrollToHash);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // "decouverte" is the auto-assigned 14-day trial, not something to pick
      // or pay for — never shown as a plan option. "free" is a retired
      // legacy plan (no permanent free tier anymore, see
      // 20260901000000_repricing_no_free_plan_and_role_limits.sql) — kept
      // in the table only because a few pre-existing organizations still
      // technically reference the row, but never marketed or offered again.
      .neq('id', 'decouverte')
      .neq('id', 'free')
      .order('price_chf_monthly', { ascending: true })
      .then(({ data }) => {
        setPlans(data ?? []);
        setPlansLoading(false);
      });
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

  // Deliberately no cursor-tracked tilt and no ambient breathing loop on the
  // hero visual anymore — a static, still composition reads as a considered
  // product shot rather than a toy that follows the pointer. heroTiltX/Y and
  // blobPulse stay declared (still wired into the transforms below) but are
  // never driven, so every interpolation simply resolves to its resting
  // value: a fixed slight lean on the cards, no pulsing glow.

  useEffect(() => {
    if (!plansLoading) return;
    const skeletonLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(skeletonPulse, { toValue: 0.5, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    skeletonLoop.start();
    return () => {
      skeletonLoop.stop();
    };
  }, [plansLoading, skeletonPulse]);

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
                    <Button
                      title={t.hero.cta2}
                      onPress={scrollToServices}
                      variant="secondary"
                      style={StyleSheet.flatten([styles.ctaButton, isCompactHero && styles.ctaButtonCompact])}
                    />
                  </HoverLift>
                </Animated.View>
                <Animated.Text
                  style={[
                    styles.heroTrust,
                    isCompactHero && styles.heroTrustCompact,
                    {
                      opacity: heroCtaAnim,
                      transform: [{ translateY: heroCtaAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
                    },
                  ]}
                >
                  {t.hero.trust}
                </Animated.Text>
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
                  <Text style={styles.heroCardTitle}>{tr('landingPage.heroCardTitle')}</Text>
                  <View style={styles.heroCardStatusPill}>
                    <Text style={styles.heroCardStatusText}>{tr('landingPage.heroCardStatusSent')}</Text>
                  </View>
                </View>

                <View style={styles.heroCardLines}>
                  <View style={styles.heroCardLine}>
                    <Feather name="edit-3" size={13} color={colors.textMuted} />
                    <Text style={styles.heroCardLineText}>{tr('landingPage.heroCardLineFacade')}</Text>
                    <Text style={styles.heroCardLinePrice}>CHF 1 240.–</Text>
                  </View>
                  <View style={styles.heroCardLine}>
                    <Feather name="square" size={13} color={colors.textMuted} />
                    <Text style={styles.heroCardLineText}>{tr('landingPage.heroCardLineWindows')}</Text>
                    <Text style={styles.heroCardLinePrice}>CHF 2 850.–</Text>
                  </View>
                  <View style={styles.heroCardLine}>
                    <Feather name="tool" size={13} color={colors.textMuted} />
                    <Text style={styles.heroCardLineText}>{tr('landingPage.heroCardLineLabor')}</Text>
                    <Text style={styles.heroCardLinePrice}>CHF 980.–</Text>
                  </View>
                </View>
                <View style={styles.heroCardDivider} />
                <View style={styles.heroCardTotalRow}>
                  <Text style={styles.heroCardTotalLabel}>{tr('landingPage.heroCardTotalLabel')}</Text>
                  <Text style={styles.heroCardTotalValue}>CHF 5 070.–</Text>
                </View>
                <View style={styles.heroCardBadge}>
                  <Feather name="check" size={12} color="#fff" />
                  <Text style={styles.heroCardBadgeText}>{tr('landingPage.heroCardSignedBadge')}</Text>
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
                    <Text style={styles.heroCardToastTitle}>{tr('landingPage.heroCardToastTitle')}</Text>
                    <Text style={styles.heroCardToastText}>{tr('landingPage.heroCardToastTime')}</Text>
                  </View>
                </Animated.View>
              </Animated.View>
            </View>
          </View>

          {/* ---- Trust line: replaces the previous live-updating stats
              ticker (org/user/cash counters with realtime Supabase
              subscription). A real, manually-checked headcount reads as
              more credible on a young product than an animated counter —
              and never risks visibly showing a number shrink. Bump
              TRUST_COMPANY_COUNT by hand as the real count grows; never
              invent it. No star rating is shown because Cantia has no
              verifiable external reviews yet — add one only once it does. ---- */}
          <View style={styles.trustLineOuter}>
            <Feather name="users" size={15} color={colors.primary} />
            <Text style={styles.trustLineText}>
              {tr('landingPage.trustLine', { count: TRUST_COMPANY_COUNT })}
            </Text>
            <View style={styles.trustLineDivider} />
            <Feather name="star" size={13} color={colors.primary} />
            <Text style={styles.trustLineText}>{tr('landingPage.trustSatisfaction', { rating: TRUST_RATING })}</Text>
          </View>

          {/* ---- Bexio ribbon — the "real, native OAuth integration" pitch,
              deliberately placed this high (right under the hero) rather
              than buried near pricing further down, since it's one of the
              first things prospects already on Bexio ask about. Full-bleed
              dark strip rather than an inset bordered card, so it reads as
              an announcement banner instead of blending into the page's
              other cream-on-cream cards — /integrations has the detail
              (features, steps, FAQ). ---- */}
          <Link href={'/integrations' as any} asChild>
            <Pressable style={styles.bexioRibbon}>
              <View style={StyleSheet.flatten([styles.bexioRibbonInner, isCompactNav && styles.bexioRibbonInnerCompact])}>
                <View style={styles.bexioRibbonLeft}>
                  <View style={styles.bexioRibbonLogoBadge}>
                    <Image source={require('../assets/integrations/bexio-logo.png')} style={styles.bexioBannerLogoImage} resizeMode="contain" accessibilityLabel="Bexio" />
                  </View>
                  <Text style={styles.bexioRibbonText}>
                    <Text style={styles.bexioRibbonTextStrong}>{tr('landingPage.bexioRibbonNew')}</Text>
                    {tr('landingPage.bexioRibbonTextBefore')}<Text style={styles.bexioRibbonTextAccent}>Bexio</Text>{tr('landingPage.bexioRibbonTextAfter')}
                  </Text>
                </View>
                <View style={styles.bexioRibbonCta}>
                  <Text style={styles.bexioRibbonCtaText}>{tr('landingPage.bexioRibbonCta')}</Text>
                  <Feather name="arrow-right" size={13} color={colors.text} />
                </View>
              </View>
            </Pressable>
          </Link>

          {/* ---- Product tour: a real ~30s screen-capture-style video
              (rendered from the actual app UI with demo data, not a mockup)
              walking through signup → create/join a company → the core
              screens, followed by a grid of the same real screenshots. This
              exists because prospects who only ever see the landing copy
              have no way to picture what using Cantia actually looks like —
              this section is the fix. ---- */}
          <Reveal id="tour" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionEyebrow, styles.centerText]}>{t.tour.eyebrow}</Text>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.tour.title}</Text>
            <Text style={[styles.sectionSubtitle, styles.centerText]}>{t.tour.subtitle}</Text>
            <View style={styles.tourVideoOuter}>
              <View style={styles.tourVideoChrome}>
                <View style={[styles.tourDot, styles.tourDot1]} />
                <View style={[styles.tourDot, styles.tourDot2]} />
                <View style={[styles.tourDot, styles.tourDot3]} />
              </View>
              <ShowcaseVideo
                sources={[
                  { src: '/cantia-demo.webm', type: 'video/webm' },
                  { src: '/cantia-demo.mp4', type: 'video/mp4' },
                ]}
                poster="/showcase/video-poster.jpg"
                style={styles.tourVideo}
                accessibilityLabel={t.tour.videoLabel}
              />
            </View>
            <View style={styles.tourGrid}>
              {[
                { file: 'dashboard', shot: t.tour.shots[0] },
                { file: 'devis-new', shot: t.tour.shots[1] },
                { file: 'facture-detail', shot: t.tour.shots[2] },
                { file: 'chantier-feed', shot: t.tour.shots[3] },
                { file: 'planning', shot: t.tour.shots[4] },
                { file: 'onboarding-create', shot: t.tour.shots[5] },
              ].map(({ file, shot }) => (
                <View key={file} style={styles.tourCard}>
                  <View style={styles.tourCardFrame}>
                    <Image
                      source={{ uri: `/showcase/${file}.png` }}
                      style={styles.tourCardImage}
                      resizeMode="cover"
                      accessibilityLabel={shot.title}
                    />
                  </View>
                  <Text style={styles.tourCardTitle}>{shot.title}</Text>
                  <Text style={styles.tourCardText}>{shot.text}</Text>
                </View>
              ))}
            </View>
          </Reveal>

          {/* ---- Spotlight: voice dictation + Swiss QR-bill demos ---- */}
          <Reveal id="spotlight" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionEyebrow, styles.centerText]}>{tr('landingPage.automationsEyebrow')}</Text>
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
                <Text style={[styles.sectionEyebrow, styles.centerText]}>{tr('landingPage.problemEyebrow')}</Text>
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
                  <ChaosChip icon="send" label={tr('landingPage.chaosDevisLabel')} sub={tr('landingPage.chaosDevisSub')} posStyle={{ top: -14, left: 0 }} rotate={-1.5} />
                  <ChaosChip icon="file-text" label={tr('landingPage.chaosRapportLabel')} sub={tr('landingPage.chaosRapportSub')} posStyle={{ top: -14, right: 0 }} rotate={1} />
                  <ChaosChip icon="credit-card" label={tr('landingPage.chaosFactureLabel')} sub={tr('landingPage.chaosFactureSub')} posStyle={{ top: 100, left: 0 }} rotate={1.5} />
                  <ChaosChip icon="camera" label={tr('landingPage.chaosPhotosLabel')} sub={tr('landingPage.chaosPhotosSub')} posStyle={{ top: 100, right: 0 }} rotate={-1} />
                </>
              ) : null}

              {showChaosChipsCompact ? (
                <>
                  <ChaosChip
                    icon="send"
                    label={tr('landingPage.chaosDevisLabel')}
                    sub={tr('landingPage.chaosDevisSub')}
                    posStyle={{ top: 34, left: chaosChipCompactCenter - 16 }}
                    rotate={-3}
                    compact
                  />
                  <ChaosChip
                    icon="file-text"
                    label={tr('landingPage.chaosRapportLabel')}
                    sub={tr('landingPage.chaosRapportSub')}
                    posStyle={{ top: 82, left: chaosChipCompactCenter + 14 }}
                    rotate={2}
                    compact
                  />
                  <ChaosChip
                    icon="credit-card"
                    label={tr('landingPage.chaosFactureLabel')}
                    sub={tr('landingPage.chaosFactureSub')}
                    posStyle={{ top: 130, left: chaosChipCompactCenter + 14 }}
                    rotate={-2}
                    compact
                  />
                  <ChaosChip
                    icon="camera"
                    label={tr('landingPage.chaosPhotosLabel')}
                    sub={tr('landingPage.chaosPhotosSub')}
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
            <Text style={styles.sectionEyebrow}>{tr('landingPage.servicesEyebrow')}</Text>
            <Text style={styles.sectionTitle}>{t.services.title}</Text>
            <Text style={styles.sectionSubtitle}>{t.services.subtitle}</Text>

            <View style={styles.journeyOuter}>
              <View style={styles.journeyEndpoint}>
                <View style={styles.journeyEndpointIcon}>
                  <Feather name="tool" size={14} color={colors.textMuted} />
                </View>
                <Text style={styles.journeyEndpointText}>{tr('landingPage.journeyChantier')}</Text>
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
                <Text style={styles.journeyEndpointText}>{tr('landingPage.journeyBureau')}</Text>
              </View>
            </View>
          </Reveal>

          {/* ---- Trades ---- */}
          <Reveal id="trades" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionEyebrow, styles.centerText]}>{tr('landingPage.tradesEyebrow')}</Text>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.trades.title}</Text>
            <TradesMarquee trades={t.trades.list} compact={isCompactNav} />
            <Text style={styles.tradeNote}>{t.trades.note}</Text>
            <View style={styles.tradeLinksRow}>
              {TRADE_PAGE_SLUGS.map((slug) => {
                const tradePage = getTradePage(slug, appLocale)!;
                return (
                  <Link key={slug} href={`${tradeHrefPrefix}${slug}` as any} asChild>
                    <Pressable style={styles.tradeLinkChip}>
                      <Text style={styles.tradeLinkChipText}>{appLocale === 'de' ? tradePage.tradeName : pluralTradeName(tradePage.tradeName)}</Text>
                    </Pressable>
                  </Link>
                );
              })}
              <Link href={appLocale === 'de' ? '/de/metiers' : '/metiers'} asChild>
                <Pressable style={styles.tradeLinkChipAll}>
                  <Text style={styles.tradeLinkChipAllText}>{tr('landingPage.seeAllTrades')}</Text>
                  <Feather name="arrow-right" size={13} color={colors.primary} />
                </Pressable>
              </Link>
            </View>
          </Reveal>

          {/* ---- Pricing ---- */}
          <Reveal id="pricing" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            <Text style={[styles.sectionEyebrow, styles.centerText]}>{tr('landingPage.pricingEyebrow')}</Text>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.pricing.title}</Text>
            <Text style={[styles.sectionSubtitle, styles.centerText]}>{t.pricing.subtitle}</Text>
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
              {plansLoading
                ? [0, 1, 2].map((i) => <PriceCardSkeleton key={i} pulse={skeletonPulse} highlight={i === 1} />)
                : plans.filter((p) => !p.is_contact_only).map((p) => {
                const isYearly = billingInterval === 'year';
                const displayMonthly = isYearly && p.price_chf_yearly != null ? p.price_chf_yearly / 12 : p.price_chf_monthly;
                const dark = p.id === 'equipe';
                // "Sur mesure" is priced from a starting point, not a flat
                // rate — and since it's negotiated per project, annual
                // billing carries no -20% (price_chf_yearly is just 12x the
                // monthly amount, no discount baked in), so the strike-
                // through only makes sense when there's a real reduction.
                const isFromPrice = p.id === 'illimite';
                const hasRealYearlyDiscount = p.price_chf_monthly != null && p.price_chf_yearly != null && p.price_chf_yearly < p.price_chf_monthly * 12;
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
                  <Text style={[styles.priceName, dark && styles.priceNameOnDark]}>{p.name}</Text>
                  <View style={styles.priceAmountRow}>
                    {isYearly && p.price_chf_monthly != null && p.price_chf_monthly > 0 && hasRealYearlyDiscount ? (
                      <Text style={[styles.priceAmountStrike, dark && styles.priceAmountStrikeOnDark]}>
                        CHF {formatChf(p.price_chf_monthly)}
                      </Text>
                    ) : null}
                    {isFromPrice ? (
                      <Text style={[styles.priceFromLabel, dark && styles.priceFromLabelOnDark]}>{tr('landingPage.priceFromLabel')}</Text>
                    ) : null}
                    <Text style={[styles.priceAmount, dark && styles.priceAmountOnDark]}>
                      {p.price_chf_monthly === 0 ? 'CHF 0' : `CHF ${formatChf(displayMonthly ?? 0)}`}
                    </Text>
                    <Text style={[styles.pricePeriod, dark && styles.pricePeriodOnDark]}>{tr('landingPage.pricePerMonth')}</Text>
                  </View>
                  {isYearly && p.price_chf_monthly != null && p.price_chf_monthly > 0 && p.price_chf_yearly != null && !isFromPrice ? (
                    <Text style={[styles.priceYearlyNote, dark && styles.priceYearlyNoteOnDark]}>
                      {t.pricing.billedYearly.replace('{amount}', `CHF ${formatChf(p.price_chf_yearly)}`)}
                    </Text>
                  ) : null}
                  {isFromPrice ? (
                    // "Sur mesure" isn't a fixed self-serve tier — showing its
                    // raw numeric limits (e.g. a 9999-member cap meant purely
                    // as "no real ceiling") reads as an arbitrary, oddly
                    // specific stat rather than what it actually is. A
                    // feasibility pitch + direct contact fits a negotiated
                    // "dès CHF 149" price better than a checkout button.
                    <>
                      <Text style={styles.priceFromPitch}>
                        {tr('landingPage.surMesurePitch')}
                      </Text>
                      <Button
                        title={tr('landingPage.contactUs')}
                        onPress={() => Linking.openURL('mailto:info@cantia.ch?subject=Plan Sur mesure Cantia').catch(() => {})}
                        variant="secondary"
                        style={{ marginTop: spacing.md }}
                      />
                    </>
                  ) : (
                    <>
                      <View style={styles.priceFeatures}>
                        <PriceFeature
                          dark={dark}
                          text={tr('pricingSection.storage', { amount: (p.storage_quota_mb / 1024).toFixed(p.storage_quota_mb < 1024 ? 1 : 0) })}
                        />
                        <PriceFeature dark={dark} text={`${p.max_members} ${p.max_members > 1 ? t.pricing.memberPlural : t.pricing.memberSingular}`} />
                        <PriceFeature
                          dark={dark}
                          text={
                            p.max_devis_factures_per_month
                              ? tr('landingPage.quotaPerMonth', { count: p.max_devis_factures_per_month })
                              : t.pricing.unlimited
                          }
                          muted={!!p.max_devis_factures_per_month}
                        />
                        <PriceFeature dark={dark} text={tr('landingPage.featureEmailSending')} muted={!p.has_email_sending} included={p.has_email_sending} />
                        <PriceFeature dark={dark} text={tr('landingPage.featureTeamPlanning')} muted={!p.has_planning} included={p.has_planning} />
                        <PriceFeature dark={dark} text={tr('landingPage.featureHrPayroll')} muted={!p.has_payroll} included={p.has_payroll} />
                        <PriceFeature dark={dark} text={tr('landingPage.featureProfitability')} muted={!p.has_profitability} included={p.has_profitability} />
                        <PriceFeature dark={dark} text={tr('landingPage.featureTreasury')} muted={!p.has_treasury} included={p.has_treasury} />
                        <PriceFeature dark={dark} text={tr('landingPage.featureBexio')} muted={!p.has_bexio_integration} included={p.has_bexio_integration} />
                        <PriceFeature
                          dark={dark}
                          text={p.max_trames === 0 ? tr('landingPage.trameLibraryEmpty') : p.max_trames != null ? tr('landingPage.trameLibraryCount', { count: p.max_trames }) : tr('landingPage.trameLibraryUnlimited')}
                          muted={p.max_trames === 0}
                          included={p.max_trames !== 0}
                        />
                      </View>
                      <Link href={authHref('signup')} asChild>
                        <Button
                          title={t.pricing.paidCta}
                          onPress={() => {}}
                          variant={dark ? 'primary' : 'secondary'}
                        />
                      </Link>
                    </>
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
                {[
                  tr('landingPage.swissFactChf'),
                  tr('landingPage.swissFactVat'),
                  tr('landingPage.swissFactQr'),
                  tr('landingPage.swissFactHosting'),
                ].map((fact) => (
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

          {/* ---- Multi-device: the web app already works everywhere — this
              is distinct from the "mobile" section right below it, which is
              specifically about the dedicated native App Store/Google Play
              apps still coming. devices-hero.jpg is a single composed
              graphic (logo + headline + real product screenshots on Mac/
              iPad/iPhone) — it already carries its own heading, so no
              separate eyebrow/title/subtitle is rendered above it here. ---- */}
          <Reveal id="devices" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section}>
            {/* aspectRatio lives on this wrapping View, not the Image itself —
                react-native-web has been observed falling back to the source
                file's raw pixel height (ignoring the container's actual
                width) when aspectRatio is set directly on an <Image>, which
                blew the section up to several screens tall on narrow
                viewports. An Image absolutely filling a pre-sized box
                doesn't hit that. */}
            <View style={styles.devicesHeroWrap}>
              <Image
                source={require('../assets/marketing/devices-hero.jpg')}
                style={styles.devicesHero}
                resizeMode="contain"
                accessibilityLabel="L'interface Cantia sur ordinateur, tablette et téléphone"
              />
            </View>
            <View style={styles.devicesBenefits}>
              {t.devices.benefits.map((b) => (
                <View key={b.title} style={styles.devicesBenefitCard}>
                  <Text style={styles.devicesBenefitTitle}>{b.title}</Text>
                  <Text style={styles.devicesBenefitText}>{b.text}</Text>
                </View>
              ))}
            </View>
          </Reveal>

          {/* ---- Mobile apps: the web app already works on phone/tablet
              today (installable, full-screen, no store) — this section
              leads with that, and treats the native App Store/Google Play
              apps as a secondary "also coming" note rather than implying
              nothing works on mobile yet. ---- */}
          <Reveal id="mobile" getAnim={getSectionAnim} onRegister={registerSection} style={styles.section} from={18}>
            <Text style={[styles.sectionTitle, styles.centerText]}>{t.mobile.title}</Text>
            <Text style={styles.mobileText}>{t.mobile.text}</Text>
            <Link href="/telechargement" asChild>
              <Button title={t.mobile.installCta} onPress={() => {}} icon="download" style={styles.mobileInstallCta} />
            </Link>
            <Text style={styles.mobileStoreNote}>{t.mobile.storeNote}</Text>
            <View style={styles.storeRow}>
              <StoreBadge kind="apple" label={t.mobile.appStore} comingSoon={t.mobile.comingSoon} />
              <StoreBadge kind="google" label={t.mobile.googlePlay} comingSoon={t.mobile.comingSoon} />
            </View>
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

          <MarketingFooter onServicesPress={scrollToServices} onPricingPress={scrollToPricing} />
        </ScrollView>

        {/* ---- Fixed nav ---- */}
        <View style={[styles.navFixed, scrolled && styles.navFixedScrolled]}>
          <View style={styles.nav}>
            <View style={styles.navBrandRow}>
              <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" accessibilityLabel="Cantia" />
              <Text style={styles.navBrand}>Cantia</Text>
            </View>

            {isCompactNav ? (
              <Pressable
                onPress={() => setMenuOpen((v) => !v)}
                style={styles.hamburgerButton}
                hitSlop={8}
                accessibilityLabel={tr('marketingChrome.menu')}
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
                <Link href={aideHref as any}>
                  <Text style={styles.navLink}>{t.nav.help}</Text>
                </Link>
                <LanguageSwitcher />
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
                  <Image source={require('../assets/logo-mark.png')} style={styles.navLogo} resizeMode="contain" accessibilityLabel="Cantia" />
                  <Text style={styles.navBrand}>Cantia</Text>
                </View>
                <View style={styles.mobileMenuHeaderRight}>
                  <LangToggle value={appLocale} onChange={(next) => router.push(toggleLocalePathname(pathname, next) as any)} />
                  <Pressable onPress={() => setMenuOpen(false)} style={styles.hamburgerButton} hitSlop={8} accessibilityLabel={tr('marketingChrome.close')}>
                    <Feather name="x" size={22} color={colors.text} />
                  </Pressable>
                </View>
              </View>

              <ScrollView contentContainerStyle={styles.mobileMenuBody} showsVerticalScrollIndicator={false}>
                <View style={styles.mobileMenuGroup}>
                  <MenuItem anim={menuItemAnims[0]} onPress={scrollToServices} label={t.nav.services} />
                  <MenuItem anim={menuItemAnims[1]} onPress={scrollToPricing} label={t.nav.pricing} />
                  <Link href="/telechargement" asChild>
                    <MenuItem anim={menuItemAnims[2]} onPress={() => setMenuOpen(false)} label={t.nav.download} />
                  </Link>
                  <Link href={aideHref as any} asChild>
                    <MenuItem anim={menuItemAnims[3]} onPress={() => setMenuOpen(false)} label={t.nav.help} last />
                  </Link>
                </View>

                <Animated.View
                  style={{
                    opacity: menuItemAnims[4],
                    transform: [
                      { translateY: menuItemAnims[4].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                    ],
                  }}
                >
                  <Link href={authHref('login')} asChild>
                    <Pressable style={styles.mobileMenuSecondaryItem} onPress={() => setMenuOpen(false)}>
                      <Feather name="log-in" size={15} color={colors.textMuted} />
                      <Text style={styles.mobileMenuSecondaryText}>{t.nav.login}</Text>
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
  label,
  onPress,
  last,
}: {
  anim: Animated.Value;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }}
    >
      <Pressable style={[styles.mobileMenuItem, last && styles.mobileMenuItemLast]} onPress={onPress}>
        <Text style={styles.mobileMenuText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function formatChf(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

// Placeholder shown in the pricing grid while `plans` is still loading — same
// footprint as a real priceCard (same style, same 7 feature rows + CTA bar)
// so the section never collapses to a bare gap between the toggle and the
// "sur mesure" note below it, which is exactly what a real visitor sees on a
// slow connection until the fix here.
function PriceCardSkeleton({ pulse, highlight }: { pulse: Animated.Value; highlight?: boolean }) {
  const opacity = pulse;
  return (
    <View style={[styles.priceCard, highlight && styles.priceCardHighlight]}>
      <Animated.View style={[styles.skeletonBar, styles.skeletonName, { opacity }]} />
      <Animated.View style={[styles.skeletonBar, styles.skeletonAmount, { opacity }]} />
      <View style={styles.priceFeatures}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Animated.View key={i} style={[styles.skeletonBar, styles.skeletonFeature, { opacity, width: `${72 - i * 4}%` }]} />
        ))}
      </View>
      <Animated.View style={[styles.skeletonBar, styles.skeletonButton, { opacity }]} />
    </View>
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
  const { t: tr } = useTranslation();
  return (
    <View style={styles.swissStamp}>
      <View style={styles.swissStampRingOuter} />
      <View style={styles.swissStampRingInner} />
      <ArcText text={tr('landingPage.swissStampArcText')} radius={49} startAngle={-100} endAngle={100} style={styles.swissStampArcText} />
      <View style={styles.swissStampCross}>
        <View style={styles.swissStampCrossV} />
        <View style={styles.swissStampCrossH} />
      </View>
      <Text style={styles.swissStampCenterText}>{tr('landingPage.swissStampSince')}</Text>
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
              <MaterialCommunityIcons name={TRADE_ICONS[i % TRADE_ICONS.length]} size={22} color={colors.primary} />
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
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenuFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
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
  mobileMenuHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mobileMenuBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  // A plain stacked list — large type, a hairline between rows, nothing
  // else — reads calmer than the earlier boxed/icon-badge treatment.
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
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  mobileMenuCta: {},
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
    fontWeight: '700',
    color: colors.text,
    lineHeight: 68,
    letterSpacing: -1.4,
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
  heroTrust: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  heroTrustCompact: {
    textAlign: 'center',
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
  // Full-bleed hairline bar, same footprint as the old ticker, but a single
  // static line — no count-up, no realtime subscription.
  trustLineOuter: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexWrap: 'wrap',
  } as unknown as ViewStyle,
  trustLineText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  trustLineDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  section: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl * 1.5,
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
  bexioRibbon: {
    width: '100%',
    backgroundColor: colors.text,
    marginTop: spacing.lg,
  },
  bexioRibbonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  bexioRibbonInnerCompact: {
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
  },
  bexioRibbonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 240,
  },
  bexioRibbonLogoBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0A3A47',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  bexioBannerLogoImage: {
    width: 34,
    height: 34,
  },
  bexioRibbonText: {
    flex: 1,
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.bg,
    lineHeight: 20,
    opacity: 0.94,
  },
  bexioRibbonTextStrong: {
    fontFamily: marketingFonts.body,
    fontWeight: '800',
    color: colors.bg,
    opacity: 1,
  },
  bexioRibbonTextAccent: {
    fontFamily: marketingFonts.body,
    fontWeight: '800',
    color: colors.accent,
  },
  bexioRibbonCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    flexShrink: 0,
  },
  bexioRibbonCtaText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
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
    // Breaks out of the section's own maxWidth:1080 column to run the full
    // width of the viewport — the classic "full-bleed" trick (a vw-sized
    // box centered with negative margins) works regardless of how deep it's
    // nested, since vw is relative to the viewport, not the parent. A
    // horizontally-scrolling belt of trades reads as a dynamic, edge-to-edge
    // banner; boxed into the same narrow reading column as the surrounding
    // text, it just looked cramped on wide screens.
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
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
  tradeLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  tradeLinkChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  tradeLinkChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  tradeLinkChipAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tradeLinkChipAllText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
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
  priceFromLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 5,
  },
  priceFromLabelOnDark: {
    color: 'rgba(255,255,255,0.6)',
  },
  priceAmountStrike: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginBottom: 3,
  },
  priceAmountStrikeOnDark: {
    color: 'rgba(255,255,255,0.45)',
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
  priceFromPitch: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  skeletonBar: {
    backgroundColor: colors.border,
    borderRadius: radius.sm,
  },
  skeletonName: {
    width: '55%',
    height: 15,
  },
  skeletonAmount: {
    width: '70%',
    height: 30,
    marginTop: spacing.xs,
  },
  skeletonFeature: {
    height: 12,
  },
  skeletonButton: {
    height: 40,
    borderRadius: radius.md,
    marginTop: spacing.xs,
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
  tourVideoOuter: {
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(35,26,18,0.08)',
    marginBottom: spacing.xxl,
    ...Platform.select({
      web: { boxShadow: '0 30px 70px -20px rgba(35,26,18,0.35), 0 10px 24px -10px rgba(35,26,18,0.2)' } as unknown as ViewStyle,
      default: {},
    }),
  },
  tourVideoChrome: {
    height: 30,
    backgroundColor: '#EFE7D8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(35,26,18,0.06)',
  },
  tourDot: { width: 9, height: 9, borderRadius: 5 },
  tourDot1: { backgroundColor: '#E5A2A2' },
  tourDot2: { backgroundColor: '#E8CB98' },
  tourDot3: { backgroundColor: '#A8CBAE' },
  tourVideo: {
    width: '100%',
    aspectRatio: 1280 / 720,
    backgroundColor: '#F7F1E6',
    display: 'block',
  } as unknown as ViewStyle,
  tourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  tourCard: {
    width: 260,
    gap: spacing.xs,
  },
  tourCardFrame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(35,26,18,0.08)',
  },
  tourCardImage: {
    width: '100%',
    height: '100%',
  },
  tourCardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  tourCardText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
  },
  devicesHeroWrap: {
    width: '100%',
    maxWidth: 1100,
    aspectRatio: 1535 / 1024,
    alignSelf: 'center',
    marginBottom: spacing.xxl,
  } as unknown as ViewStyle,
  devicesHero: {
    width: '100%',
    height: '100%',
  },
  devicesBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  devicesBenefitCard: {
    minWidth: 200,
    maxWidth: 260,
    gap: spacing.xs,
    alignItems: 'center',
  },
  devicesBenefitTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  devicesBenefitText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
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
  mobileInstallCta: {
    alignSelf: 'center',
  },
  mobileStoreNote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
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
});
