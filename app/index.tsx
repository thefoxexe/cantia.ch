import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Screen } from '../components/ui';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { MarketingHead } from '../components/MarketingHead';
import { PricingSection } from '../components/PricingSection';
import { HeroCross } from '../components/landing/HeroCross';
import { ScrollReveal } from '../components/landing/ScrollReveal';
import { SwissCross } from '../components/SwissCross';
import { CtaButton } from '../components/landing/CtaButton';
import { SectionHead } from '../components/landing/SectionHead';
import { Cartouche } from '../components/landing/Cartouche';
import { bodyInk, ink, rule } from '../components/landing/brand';
import { SituationTable } from '../components/landing/SituationTable';
import { FeatureCatalog } from '../components/landing/FeatureCatalog';
import { VoiceDemo } from '../components/landing/VoiceDemo';
import { Disclosure } from '../components/landing/Disclosure';
import { useMarketingDict } from '../lib/i18n';
import { getAppLocale } from '../lib/translations';
import { marketingPageTitle } from '../lib/marketingSeoTitles';
import { colors, breakpoints, spacing } from '../lib/theme';
import { displayType, landingFonts, monoType } from '../lib/landingTheme';
import { authHref, useSyncMarketingLocaleFromPath } from '../lib/appHost';

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function LandingScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <LandingContent />;
}

function LandingContent() {
  const t = useMarketingDict();
  useSyncMarketingLocaleFromPath();
  const appLocale = getAppLocale();
  const localePrefix = appLocale === 'de' ? '/de' : appLocale === 'it' ? '/it' : '';
  const pageHref = useCallback((slug: string) => `${localePrefix}/${slug}`, [localePrefix]);
  const solutionHref = useCallback((slug: string) => `${localePrefix}/solutions/${slug}`, [localePrefix]);

  // Real, live count — public/anon-readable (landing_stats RLS), auto-kept
  // current by DB triggers on organizations insert/delete. Null while
  // loading so the line only renders once there's a real number to show,
  // never a flash of "+0" or a stale hardcoded figure.
  const [orgCount, setOrgCount] = useState<number | null>(null);
  useEffect(() => {
    supabase
      .from('landing_stats')
      .select('organizations_count')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.organizations_count != null) setOrgCount(data.organizations_count);
      });
  }, []);
  const trustCountText = orgCount != null ? t.hero.trustCount.replace('{{count}}', String(orgCount)) : null;

  const { width, height } = useWindowDimensions();
  const isMobile = width < breakpoints.tablet;
  const isTablet = width < breakpoints.desktop;
  const showHeroMountainFull = !isMobile;
  const showHeroMountainPeek = isMobile;
  const heroMinHeight = showHeroMountainFull ? clamp(600, height * 0.88, 940) : undefined;
  const heroTitleSize = isMobile ? clamp(46, width * 0.13, 64) : clamp(64, width * 0.075, 116);
  const closingTitleSize = clamp(44, width * 0.07, 96);

  const scrollRef = useRef<ScrollView>(null);
  const storiesRef = useRef<View>(null);
  const pricingRef = useRef<View>(null);
  const heroMountainRef = useRef<View>(null);

  useEffect(() => {
    if (!showHeroMountainFull && !showHeroMountainPeek) return;
    const node = heroMountainRef.current as unknown as HTMLElement | null;
    if (node?.style) node.style.backgroundPosition = 'right top';
  }, [showHeroMountainFull, showHeroMountainPeek]);

  function scrollToRef(ref: React.RefObject<View | null>) {
    ref.current?.measure((_x, y) => {
      scrollRef.current?.scrollTo({ y: y - 12, animated: true });
    });
  }

  // Lets an external link (e.g. cantia.ch/#pricing, submitted to a directory
  // like Capterra) land directly on the pricing section instead of just the
  // top of the homepage — the nav/footer buttons already call scrollToRef,
  // this covers arriving with the hash already in the URL on first load.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (window.location.hash !== '#pricing') return;
    const id = setTimeout(() => scrollToRef(pricingRef), 300);
    return () => clearTimeout(id);
  }, []);

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={marketingPageTitle('home', appLocale)} />

      <MarketingNav onServicesPress={() => scrollToRef(storiesRef)} onPricingPress={() => scrollToRef(pricingRef)} />

      <ScrollView ref={scrollRef}>
        {/* ——— Hero: the mountain stays, the type does the talking ——— */}
        <View style={[styles.hero, heroMinHeight ? { minHeight: heroMinHeight } : null]}>
          {showHeroMountainFull || showHeroMountainPeek ? (
            <View
              ref={heroMountainRef}
              pointerEvents="none"
              style={[styles.heroMountainBase, showHeroMountainFull ? styles.heroMountainMaskFull : styles.heroMountainMaskPeek]}
            />
          ) : null}
          {showHeroMountainFull || showHeroMountainPeek ? <View pointerEvents="none" style={styles.heroBottomFade} /> : null}
          <View style={[styles.wrap, styles.heroCopy, { zIndex: 1 }, showHeroMountainFull && styles.heroCopySpread]}>
            <View style={[styles.heroMain, !isTablet && { maxWidth: '56%' }]}>
              <ScrollReveal style={styles.heroKicker}>
                <SwissCross size={14} />
                <Text style={styles.heroKickerText}>{t.hero.kicker}</Text>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <Text style={[styles.h1, { fontSize: heroTitleSize, lineHeight: heroTitleSize * 0.92 }]}>{t.hero.titlePrefix}</Text>
                <View style={styles.h1Line2}>
                  <Text style={[styles.h1, { fontSize: heroTitleSize, lineHeight: heroTitleSize * 0.92 }]}>{t.hero.titleHighlight} </Text>
                  <View style={styles.crossedWrap}>
                    <Text style={[styles.h1, { fontSize: heroTitleSize, lineHeight: heroTitleSize * 0.92 }]}>{t.hero.crossedText}</Text>
                    <HeroCross />
                  </View>
                </View>
              </ScrollReveal>

              <ScrollReveal delay={420} style={styles.heroBody}>
                <Text style={styles.heroLede}>{t.hero.lede}</Text>
                <View style={styles.heroCtas}>
                  <Link href={authHref('signup')} asChild>
                    <CtaButton title={t.hero.cta} />
                  </Link>
                  <Pressable onPress={() => scrollToRef(pricingRef)}>
                    <Text style={styles.underlineLink}>{t.hero.secondaryCta}</Text>
                  </Pressable>
                </View>
                <Text style={styles.heroFacts}>{t.hero.facts.join(isMobile ? '\n' : '   ·   ')}</Text>
                {trustCountText ? <Text style={styles.heroFacts}>{trustCountText}</Text> : null}
              </ScrollReveal>
            </View>

            <ScrollReveal delay={640} style={[styles.heroCartouche, isTablet && styles.heroCartoucheCompact]}>
              <Cartouche cells={t.hero.cartouche} compact={isMobile} />
            </ScrollReveal>
          </View>
        </View>

        {/* ——— Swiss facts: three ruled columns, no cards ——— */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead label={t.trust.locationLabel} title={t.trust.title} intro={t.trust.text} />
          <View style={[styles.columns, isTablet && styles.columnsCompact]}>
            {t.trust.cards.map((card, i) => (
              <View key={card.label} style={[styles.column, !isTablet && i > 0 && styles.columnDivider, isTablet && styles.columnCompact]}>
                <Text style={styles.monoLabel}>{card.label}</Text>
                <Text style={styles.columnTitle}>{card.title}</Text>
                <Text style={styles.bodyText}>{card.text}</Text>
                {i === t.trust.cards.length - 1 ? (
                  <Link href={pageHref('contact') as any}>
                    <Text style={styles.textLink}>{t.trust.contactCta} →</Text>
                  </Link>
                ) : null}
              </View>
            ))}
          </View>
        </ScrollReveal>

        {/* ——— Everyday situations ——— */}
        <View style={[styles.wrap, styles.section]} ref={storiesRef}>
          <ScrollReveal>
            <SectionHead label={t.landingNav.features} title={t.stories.title} intro={t.stories.subtitle} />
            <SituationTable dict={t.stories} hrefFor={solutionHref} />
          </ScrollReveal>
        </View>

        {/* ——— Nomenclature: every feature, visible without clicking ——— */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead title={t.catalog.title} intro={t.catalog.subtitle} />
          <FeatureCatalog dict={t.catalog} hrefFor={(slug) => (slug === 'sur-mesure' ? pageHref('sur-mesure') : solutionHref(slug))} />
        </ScrollReveal>

        {/* ——— Trades ——— */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead label={t.profession.eyebrow} title={t.profession.title} intro={t.profession.text} />
          <View style={[styles.split, isTablet && styles.splitCompact]}>
            <View style={styles.splitCol}>
              {t.profession.links.map((link) => (
                <Link key={link.slug} href={pageHref(link.slug) as any} asChild>
                  <Pressable style={styles.listRow}>
                    <Text style={styles.listRowText}>{link.label}</Text>
                    <Text style={styles.listRowArrow}>→</Text>
                  </Pressable>
                </Link>
              ))}
              <Link href={pageHref('metiers') as any}>
                <Text style={styles.textLink}>{t.profession.allLink} →</Text>
              </Link>
            </View>
            <View style={styles.splitCol}>
              <Text style={styles.subHead}>{t.profession.personalTitle}</Text>
              {t.profession.items.map((item) => (
                <View key={item.title} style={styles.defRow}>
                  <Text style={styles.defTerm}>{item.title}</Text>
                  <Text style={[styles.bodyText, { flex: 1 }]}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollReveal>

        {/* ——— Team ——— */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead label={t.team.eyebrow} title={`${t.team.titlePrefix} ${t.team.titleEm}`} intro={t.team.text} />
          <View style={[styles.columns, isTablet && styles.columnsCompact]}>
            {t.team.roles.map((role, i) => (
              <View key={role.number} style={[styles.column, !isTablet && i > 0 && styles.columnDivider, isTablet && styles.columnCompact]}>
                <Text style={styles.monoLabel}>{role.number}</Text>
                <Text style={styles.columnTitle}>{role.title}</Text>
                <Text style={styles.bodyText}>{role.text}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.noteRow, isMobile && styles.noteRowCompact]}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.columnTitle}>{t.team.permTitle}</Text>
              <Text style={styles.bodyText}>{t.team.permText}</Text>
              <Text style={styles.fineNote}>{t.team.permNote}</Text>
            </View>
            <Link href={solutionHref('rh-salaires') as any}>
              <Text style={styles.textLink}>{t.team.permLink} →</Text>
            </Link>
          </View>
        </ScrollReveal>

        {/* ——— Voice ——— */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead label={t.automation.eyebrow} title={t.automation.title} intro={t.automation.text} />
          <View style={[styles.split, isTablet && styles.splitCompact]}>
            <View style={[styles.splitCol, { gap: spacing.md }]}>
              <Text style={styles.subHead}>{t.automation.commandTitle}</Text>
              <Text style={styles.bodyText}>{t.automation.commandText}</Text>
              <Link href={solutionHref('dictee-vocale') as any}>
                <Text style={styles.textLink}>{t.automation.link} →</Text>
              </Link>
            </View>
            <View style={[styles.commandDemo, !isTablet && { flex: 1.15 }]}>
              <VoiceDemo dict={t.automation} />
            </View>
          </View>
        </ScrollReveal>

        {/* ——— A real invoice, annotated like a drawing ——— */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead label={t.docCustomization.eyebrow} title={t.docCustomization.title} intro={t.docCustomization.text} />
          <View style={[styles.split, isTablet && styles.splitCompact, { alignItems: isTablet ? 'stretch' : 'center' }]}>
            <View style={[styles.docFigure, !isTablet && { flex: 1 }]}>
              {/* A real facture rendered by the actual PDF generator (see
                  supabase/functions/_shared/pdf-document-renderers.ts), not a
                  mockup. Callout positions match that render: brand-colored
                  table header, company header, QR payment part. */}
              <View style={styles.docSheet}>
                <Image
                  source={{ uri: '/showcase/facture-exemple.png' }}
                  style={styles.docImage}
                  resizeMode="contain"
                  accessibilityLabel="Exemple de facture générée par Cantia"
                />
                {DOC_CALLOUTS.map((c) => (
                  <View key={c.n} style={[styles.callout, { top: c.top as any }]} pointerEvents="none">
                    <View style={styles.calloutLine} />
                    <Text style={styles.calloutNum}>{c.n}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.splitCol, { gap: 0 }]}>
              {t.docCustomization.points.map((p, i) => (
                <View key={p.title} style={styles.legendRow}>
                  <Text style={styles.legendNum}>{i + 1}</Text>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.legendTitle}>{p.title}</Text>
                    <Text style={styles.bodyText}>{p.text}</Text>
                  </View>
                </View>
              ))}
              <Link href={solutionHref('facturation') as any}>
                <Text style={[styles.textLink, { marginTop: spacing.lg }]}>{t.docCustomization.link} →</Text>
              </Link>
            </View>
          </View>
        </ScrollReveal>

        {/* ——— Field / office band ——— */}
        <View style={styles.terrainOuter}>
          <ScrollReveal style={[styles.wrap, styles.split, isTablet && styles.splitCompact]}>
            <View style={styles.splitCol}>
              <Text style={styles.monoLabel}>{t.terrain.eyebrow}</Text>
              <Text style={styles.bandTitle}>{t.terrain.title}</Text>
              <Text style={styles.bodyText}>{t.terrain.text}</Text>
              <Link href={pageHref('telechargement') as any} asChild>
                <CtaButton title={t.terrain.installCta} style={{ marginTop: spacing.lg }} />
              </Link>
              <Text style={styles.fineNote}>{t.terrain.installNote}</Text>
            </View>
            <View style={[styles.splitCol, { justifyContent: 'center' }]}>
              {t.terrain.points.map((p) => (
                <View key={p.label} style={[styles.defRow, { borderTopColor: '#E3B89C' }]}>
                  <Text style={styles.defTerm}>{p.label}</Text>
                  <Text style={[styles.bodyText, { flex: 1 }]}>{p.text}</Text>
                </View>
              ))}
            </View>
          </ScrollReveal>
        </View>

        {/* ——— Custom modules ——— */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead label={t.tailored.eyebrow} title={t.tailored.title} intro={t.tailored.text} />
          <View style={[styles.columns, isTablet && styles.columnsCompact]}>
            {t.tailored.steps.map((step, i) => (
              <View key={step.num} style={[styles.column, !isTablet && i > 0 && styles.columnDivider, isTablet && styles.columnCompact]}>
                <Text style={styles.stepNum}>{step.num}</Text>
                <Text style={styles.columnTitle}>{step.title}</Text>
                <Text style={styles.bodyText}>{step.text}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.ctaRow, isMobile && styles.noteRowCompact]}>
            <Link href={pageHref('contact') as any} asChild>
              <CtaButton title={t.tailored.cta} />
            </Link>
            <Link href={pageHref('sur-mesure') as any}>
              <Text style={styles.underlineLink}>{t.tailored.link}</Text>
            </Link>
          </View>
        </ScrollReveal>

        {/* ——— Bexio ——— */}
        <ScrollReveal style={styles.wrap}>
          <View style={[styles.bexioRow, isMobile && styles.noteRowCompact]}>
            <View style={styles.bexioIcon}>
              <Image source={require('../assets/logo-mark.png')} style={styles.bexioLogo} resizeMode="contain" accessibilityLabel="Cantia" />
              <Text style={styles.bexioIconArrow}>↔</Text>
              <Text style={styles.bexioWord}>bexio</Text>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.columnTitle}>{t.bexio.title}</Text>
              <Text style={styles.bodyText}>{t.bexio.text}</Text>
            </View>
            <Link href={pageHref('integrations') as any}>
              <Text style={styles.textLink}>{t.bexio.link} →</Text>
            </Link>
          </View>
        </ScrollReveal>

        <View ref={pricingRef}>
          <ScrollReveal>
            <PricingSection />
          </ScrollReveal>
        </View>

        {/* ——— FAQ ——— */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead label={t.faq.eyebrow} title={t.faq.title} />
          <View style={[styles.split, { gap: 0 }, isTablet && styles.splitCompact]}>
            <View style={!isTablet ? { width: '25%' } : { marginBottom: spacing.lg }}>
              <Link href={pageHref('aide') as any}>
                <Text style={styles.textLink}>{t.faq.link} →</Text>
              </Link>
            </View>
            <View style={{ flex: 1 }}>
              {t.faq.items.map((item) => (
                <Disclosure key={item.q} title={item.q}>
                  <Text style={styles.bodyText}>{item.a}</Text>
                </Disclosure>
              ))}
            </View>
          </View>
        </ScrollReveal>

        {/* ——— Closing ——— */}
        <View style={styles.closing}>
          <ScrollReveal style={styles.wrap}>
            <Text style={styles.closingEyebrow}>{t.closing.eyebrow}</Text>
            <Text style={[styles.closingTitle, { fontSize: closingTitleSize, lineHeight: closingTitleSize * 0.95 }]}>
              {t.closing.titlePrefix}
              {'\n'}
              <Text style={{ color: '#E8AD89' }}>{t.closing.titleEm}</Text>
            </Text>
            <Text style={styles.closingText}>{t.closing.text}</Text>
            <View style={[styles.ctaRow, { marginTop: spacing.xl }]}>
              <Link href={authHref('signup')} asChild>
                <CtaButton title={t.closing.cta} />
              </Link>
              <Link href={pageHref('contact') as any}>
                <Text style={styles.closingContact}>{t.closing.contact}</Text>
              </Link>
            </View>
            <Text style={styles.closingFacts}>{t.hero.facts.join('   ·   ')}</Text>
          </ScrollReveal>
        </View>

        <MarketingFooter onServicesPress={() => scrollToRef(storiesRef)} onPricingPress={() => scrollToRef(pricingRef)} />
      </ScrollView>
    </Screen>
  );
}

// Positions of the three numbered callouts on /showcase/facture-exemple.png,
// in the same order as docCustomization.points (brand color, logo, QR).
const DOC_CALLOUTS = [
  { n: 1, top: '35%' },
  { n: 2, top: '3.5%' },
  { n: 3, top: '77%' },
];

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: spacing.xl },
  section: { paddingTop: 112 },
  monoLabel: { ...monoType, fontSize: 11, letterSpacing: 0.4, color: colors.primary, textTransform: 'uppercase' },
  bodyText: { fontFamily: landingFonts.body, fontSize: 16, lineHeight: 25, color: bodyInk },
  textLink: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: colors.primary, marginTop: spacing.sm },
  underlineLink: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: ink, borderBottomWidth: 1.5, borderBottomColor: ink, paddingBottom: 2 },
  fineNote: { ...monoType, fontSize: 10.5, lineHeight: 17, color: colors.textMuted, marginTop: spacing.md },

  hero: { backgroundColor: colors.bg, paddingBottom: spacing.xl, position: 'relative', overflow: 'hidden' },
  heroMountainBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(/hero-mountain.webp)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  } as unknown as ViewStyle,
  heroMountainMaskFull: {
    maskImage: 'linear-gradient(to right, transparent 0%, transparent 46%, black 70%)',
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 46%, black 70%)',
  } as unknown as ViewStyle,
  heroMountainMaskPeek: {
    maskImage: 'linear-gradient(to right, transparent 0%, transparent 45%, rgba(0,0,0,0.45) 100%)',
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 45%, rgba(0,0,0,0.45) 100%)',
  } as unknown as ViewStyle,
  heroBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundImage: `linear-gradient(to bottom, transparent 0%, ${colors.bg} 100%)`,
  } as unknown as ViewStyle,
  heroCopy: { paddingTop: spacing.xxxl },
  heroCopySpread: { flex: 1, justifyContent: 'space-between' },
  heroMain: { paddingBottom: spacing.xxl },
  heroKicker: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.xl },
  heroKickerText: { ...monoType, fontSize: 11.5, letterSpacing: 0.3, color: '#674932', textTransform: 'uppercase' },
  h1: { ...displayType, fontWeight: '800', letterSpacing: -0.5, color: ink },
  h1Line2: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' },
  crossedWrap: { position: 'relative' },
  heroBody: { marginTop: spacing.xxl, gap: spacing.lg, maxWidth: 660 },
  heroLede: { fontFamily: landingFonts.body, fontSize: 19, lineHeight: 29, color: ink, maxWidth: 540 },
  heroCtas: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xl, marginTop: spacing.xs },
  heroFacts: { ...monoType, fontSize: 11, letterSpacing: 0.2, lineHeight: 18, color: '#5D4F42', textTransform: 'uppercase' },
  heroCartouche: { alignSelf: 'flex-end', width: '100%', maxWidth: 760, marginTop: spacing.xl },
  heroCartoucheCompact: { alignSelf: 'stretch', maxWidth: undefined },

  columns: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: rule },
  columnsCompact: { flexDirection: 'column', borderBottomWidth: 0 },
  column: { flex: 1, gap: spacing.sm, paddingRight: spacing.xl, paddingBottom: spacing.xl },
  columnDivider: { borderLeftWidth: 1, borderLeftColor: rule, paddingLeft: spacing.xl },
  columnCompact: { borderTopWidth: 1, borderTopColor: rule, paddingTop: spacing.lg, paddingRight: 0 },
  columnTitle: { fontFamily: landingFonts.body, fontSize: 20, fontWeight: '700', lineHeight: 26, letterSpacing: -0.2, color: ink },
  stepNum: { ...monoType, fontSize: 12, color: colors.primary },

  split: { flexDirection: 'row', gap: 64 },
  splitCompact: { flexDirection: 'column', gap: spacing.xxl },
  splitCol: { flex: 1 },
  subHead: { fontFamily: landingFonts.body, fontSize: 22, fontWeight: '700', lineHeight: 29, letterSpacing: -0.3, color: ink, marginBottom: spacing.md },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: rule },
  listRowText: { ...displayType, fontSize: 26, fontWeight: '700', color: ink },
  listRowArrow: { fontSize: 18, color: colors.primary },
  defRow: { flexDirection: 'row', gap: spacing.lg, borderTopWidth: 1, borderTopColor: rule, paddingVertical: spacing.md },
  defTerm: { width: 130, fontFamily: landingFonts.body, fontSize: 15, fontWeight: '700', color: ink, lineHeight: 25 },

  noteRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: rule },
  noteRowCompact: { flexDirection: 'column', alignItems: 'flex-start' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginTop: spacing.xl },

  commandDemo: { backgroundColor: ink, borderRadius: 4, padding: spacing.xl },

  docFigure: { alignItems: 'center', paddingRight: 44 },
  docSheet: {
    width: '100%',
    maxWidth: 480,
    position: 'relative',
    borderWidth: 1,
    borderColor: rule,
    backgroundColor: '#fff',
    shadowColor: '#231A12',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  } as any,
  docImage: { width: '100%', aspectRatio: 1819 / 2573 },
  callout: { position: 'absolute', right: -44, flexDirection: 'row', alignItems: 'center', width: 70 },
  calloutLine: { flex: 1, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: colors.primary },
  calloutNum: { ...monoType, width: 24, height: 24, lineHeight: 21, borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.bg, color: colors.primary, fontSize: 11, textAlign: 'center' },
  legendRow: { flexDirection: 'row', gap: spacing.lg, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: rule },
  legendNum: { ...monoType, width: 26, height: 26, lineHeight: 23, borderRadius: 13, borderWidth: 1.5, borderColor: colors.primary, color: colors.primary, fontSize: 12, textAlign: 'center' },
  legendTitle: { fontFamily: landingFonts.body, fontSize: 18, fontWeight: '700', color: ink },

  terrainOuter: { backgroundColor: colors.primarySoft, paddingVertical: 88, marginTop: 112 },
  bandTitle: { ...displayType, fontSize: 44, fontWeight: '800', lineHeight: 44, color: ink, marginVertical: spacing.md },

  bexioRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, borderTopWidth: 1, borderBottomWidth: 1, borderColor: rule, paddingVertical: spacing.xl, marginTop: 112, marginBottom: spacing.xxxl },
  bexioIcon: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 160 },
  bexioLogo: { width: 26, height: 26 },
  bexioIconArrow: { color: colors.textMuted },
  bexioWord: { fontFamily: landingFonts.body, fontSize: 22, fontWeight: '700', color: '#64764e', letterSpacing: -1 },

  closing: { backgroundColor: ink, paddingVertical: 112, marginTop: 112 },
  closingEyebrow: { ...monoType, fontSize: 11, letterSpacing: 0.4, color: '#E8AD89', textTransform: 'uppercase' },
  closingTitle: { ...displayType, fontWeight: '800', color: '#FBF6EE', marginTop: spacing.lg },
  closingText: { fontFamily: landingFonts.body, fontSize: 18, lineHeight: 28, color: '#D5C8B8', maxWidth: 560, marginTop: spacing.xl },
  closingContact: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: '#F1E6D5', borderBottomWidth: 1.5, borderBottomColor: '#F1E6D5', paddingBottom: 2 },
  closingFacts: { ...monoType, fontSize: 10.5, letterSpacing: 0.2, color: '#A8988A', textTransform: 'uppercase', marginTop: spacing.xxl },
});
