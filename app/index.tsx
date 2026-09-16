import { useCallback, useEffect, useRef } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { Button, Screen } from '../components/ui';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { MarketingHead } from '../components/MarketingHead';
import { PricingSection } from '../components/PricingSection';
import { HeroCross } from '../components/landing/HeroCross';
import { ScrollReveal } from '../components/landing/ScrollReveal';
import { SwissCross } from '../components/SwissCross';
import { StoryShowcase } from '../components/landing/StoryShowcase';
import { FeatureCatalog } from '../components/landing/FeatureCatalog';
import { VoiceDemo } from '../components/landing/VoiceDemo';
import { Disclosure } from '../components/landing/Disclosure';
import { useMarketingDict } from '../lib/i18n';
import { getAppLocale } from '../lib/translations';
import { marketingPageTitle } from '../lib/marketingSeoTitles';
import { colors, breakpoints, fontSize, radius, spacing } from '../lib/theme';
import { landingFonts } from '../lib/landingTheme';
import { authHref, useSyncMarketingLocaleFromPath } from '../lib/appHost';

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// The compiled Android/iOS app has no marketing site to show — it goes
// straight to the auth flow (app/_layout.tsx then takes over once the
// session is known). Plain platform check ahead of LandingContent's hooks,
// not a conditional hook call, so it stays rules-of-hooks safe.
export default function LandingScreen() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <LandingContent />;
}

// September 2026 rebuild: replaces the previous SaaS-dashboard-mockup hero
// with the "Cantia_Landing" reference package — a crème/terracotta,
// DM Sans, story-driven design commissioned and validated by the product
// owner (see the brief that shipped alongside the reference assets). Every
// section below reproduces that reference's structure and copy; only the
// implementation (React Native Web instead of static HTML/CSS/JS) and the
// internal routing (real app routes instead of hardcoded cantia.ch URLs)
// differ. lib/theme.ts's palette already matched the reference's crème/ink/
// terracotta exactly — nothing there needed to change; DM Sans (this
// design's specified typeface, distinct from the rest of the marketing
// site's Fraunces/Instrument Sans — see lib/landingTheme.ts) is the one new
// visual dependency.
function LandingContent() {
  const t = useMarketingDict();
  useSyncMarketingLocaleFromPath();
  const appLocale = getAppLocale();
  const localePrefix = appLocale === 'de' ? '/de' : appLocale === 'it' ? '/it' : '';
  const pageHref = useCallback((slug: string) => `${localePrefix}/${slug}`, [localePrefix]);
  const solutionHref = useCallback((slug: string) => `${localePrefix}/solutions/${slug}`, [localePrefix]);

  const { width, height } = useWindowDimensions();
  const isMobile = width < breakpoints.tablet;
  const isTablet = width < breakpoints.desktop;
  // The hero's mountain backdrop (public/hero-mountain.webp, provided by
  // the product owner) — full reveal on tablet/desktop, given real height
  // so the photo fills the first screen on load rather than being
  // squeezed into the text's natural (shorter) height. Phones get a
  // narrow peek at the right edge instead of the full photo — the Swiss
  // mountain is worth keeping in view everywhere, but there's no width on
  // a phone for the full image to read as anything but noise behind text.
  const showHeroMountainFull = !isMobile;
  const showHeroMountainPeek = isMobile;
  const heroMinHeight = showHeroMountainFull ? clamp(600, height * 0.88, 940) : undefined;
  // Mirrors the reference design's CSS clamp() — scales smoothly with the
  // viewport between a floor and a ceiling instead of one fixed size, so
  // the hero title doesn't look oversized/cramped on in-between widths
  // (tablet landscape, small laptop) the way a single fixed font-size did.
  const heroTitleSize = clamp(42, width * 0.047, 70);
  const heroCrossedSize = clamp(22, width * 0.027, 38);
  // Desktop-only oversized treatment ("le grand geste") — the crossed-out
  // tagline becomes the hero's dominant graphic moment instead of sharing a
  // cramped row with the supporting copy. Compact/tablet keeps the original
  // sizes above untouched.
  const heroBigTitleSize = clamp(56, width * 0.068, 108);
  const heroBigCrossedSize = clamp(40, width * 0.05, 78);

  const scrollRef = useRef<ScrollView>(null);
  const storiesRef = useRef<View>(null);
  const pricingRef = useRef<View>(null);
  const heroMountainRef = useRef<View>(null);

  // react-native-web's StyleSheet compiler silently drops backgroundPosition
  // (it's outside RN's own style vocabulary, unlike backgroundImage/Size,
  // which it does forward) — setting it through the style prop is a no-op,
  // confirmed via computed styles in a real browser. Setting it directly on
  // the DOM node is the only way to anchor the crop to the image's right
  // side instead of the default top-left.
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

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={marketingPageTitle('home', appLocale)} />

      <MarketingNav onServicesPress={() => scrollToRef(storiesRef)} onPricingPress={() => scrollToRef(pricingRef)} />

      <ScrollView ref={scrollRef}>
        {/* ---------------------------------------------------------------- Hero */}
        <View style={[styles.hero, heroMinHeight ? { minHeight: heroMinHeight } : null]}>
          {showHeroMountainFull || showHeroMountainPeek ? (
            // The mountain photo, full-bleed behind the hero: rendered at its
            // own (near-16:9) ratio across the whole section so "cover"
            // barely has to crop it, then masked so only a slice of its
            // right side shows — the rest fades to nothing rather than
            // being physically narrowed, which is what lets it read as
            // "the page's own background" instead of a photo pasted in a
            // box. Phones get a much narrower reveal (see showHeroMountainPeek
            // above) — just enough to catch the mountain at the edge.
            <View
              ref={heroMountainRef}
              pointerEvents="none"
              style={[styles.heroMountainBase, showHeroMountainFull ? styles.heroMountainMaskFull : styles.heroMountainMaskPeek]}
            />
          ) : null}
          <View
            style={[
              styles.wrap,
              styles.heroCopy,
              (showHeroMountainFull || showHeroMountainPeek) && { zIndex: 1 },
              showHeroMountainFull && styles.heroCopySpread,
            ]}
          >
            <View>
              <View style={styles.heroKicker}>
                <View style={styles.originSymbol}>
                  <SwissCross size={15} />
                </View>
                <Text style={styles.heroKickerText}>{t.hero.kicker}</Text>
              </View>

              {isTablet ? (
                <View style={[styles.heroMain, styles.heroMainCompact]}>
                  <View style={styles.heroTitleCol}>
                    <Text style={[styles.h1, { fontSize: heroTitleSize, lineHeight: heroTitleSize * 1.08 }]}>
                      {t.hero.titlePrefix}
                      {'\n'}
                      <Text style={styles.h1Highlight}>{t.hero.titleHighlight}</Text>
                    </Text>
                    <View style={styles.crossedWrap}>
                      <Text style={[styles.crossedText, { fontSize: heroCrossedSize }]}>{t.hero.crossedText}</Text>
                      <HeroCross />
                    </View>
                  </View>
                  <View style={styles.heroAside}>
                    <Text style={styles.heroAsideEyebrow}>{t.hero.asideEyebrow}</Text>
                    <Text style={styles.heroAsideP1}>{t.hero.asideP1}</Text>
                    <Text style={styles.heroAsideP2}>{t.hero.asideP2}</Text>
                    <Link href={authHref('signup')} asChild>
                      <Button title={t.hero.cta} onPress={() => {}} icon="arrow-up-right" style={{ alignSelf: 'flex-start' }} />
                    </Link>
                    <Pressable onPress={() => scrollToRef(storiesRef)}>
                      <Text style={styles.heroDiscover}>{t.hero.discover} ↓</Text>
                    </Pressable>
                    <Text style={styles.heroTrust}>{t.hero.trust}</Text>
                  </View>
                </View>
              ) : (
                // "Le grand geste" — the crossed-out tagline is the hero's
                // dominant graphic moment, full width, instead of sharing a
                // cramped row with the supporting copy. Everything that used
                // to sit beside the title now runs in a full-width band
                // underneath it, in three columns that actually use a large
                // screen's width instead of leaving it empty.
                <View style={styles.heroDesktop}>
                  <View style={styles.heroTitleCol}>
                    <Text style={[styles.h1, { fontSize: heroBigTitleSize, lineHeight: heroBigTitleSize * 1.0 }]}>
                      {t.hero.titlePrefix}
                      {'\n'}
                      <Text style={styles.h1Highlight}>{t.hero.titleHighlight}</Text>
                    </Text>
                    <View style={styles.crossedWrap}>
                      <Text style={[styles.crossedText, { fontSize: heroBigCrossedSize }]}>{t.hero.crossedText}</Text>
                      <HeroCross />
                    </View>
                  </View>
                  <View style={styles.heroInfoBand}>
                    <View style={styles.heroInfoCol}>
                      <Text style={styles.heroAsideEyebrow}>{t.hero.asideEyebrow}</Text>
                      <Text style={styles.heroInfoSubhead}>{t.hero.asideP1}</Text>
                    </View>
                    <View style={styles.heroInfoCol}>
                      <Text style={styles.heroInfoBody}>{t.hero.asideP2}</Text>
                    </View>
                    <View style={[styles.heroInfoCol, styles.heroInfoColCta]}>
                      <Link href={authHref('signup')} asChild>
                        <Button title={t.hero.cta} onPress={() => {}} icon="arrow-up-right" style={{ alignSelf: 'flex-start' }} />
                      </Link>
                      <Pressable onPress={() => scrollToRef(storiesRef)}>
                        <Text style={styles.heroDiscover}>{t.hero.discover} ↓</Text>
                      </Pressable>
                      <Text style={styles.heroTrust}>{t.hero.trust}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={[styles.heroBaseline, isMobile && styles.heroBaselineCompact]}>
              <Text style={styles.baselineLabel}>{t.hero.baselineLabel}</Text>
              {!isMobile ? (
                <View style={styles.baselineItems}>
                  {t.hero.baselineItems.map((item) => (
                    <Text key={item} style={styles.baselineItem}>{item}</Text>
                  ))}
                </View>
              ) : null}
              <Text style={styles.baselineNumber}>{t.hero.baselineNumber}</Text>
            </View>
          </View>
        </View>

        {/* ---------------------------------------------------------------- Trust */}
        <ScrollReveal style={styles.wrap}>
          <View style={[styles.trustLayout, isTablet && styles.trustLayoutCompact]}>
            <View style={[styles.trustOrigin, !isTablet && { flex: 0.9 }]}>
              <View style={styles.trustLocationRow}>
                <View style={styles.originSymbolSmall}>
                  <SwissCross size={13} />
                </View>
                <Text style={styles.trustLocationText}>{t.trust.locationLabel}</Text>
              </View>
              <Text style={styles.h2}>{t.trust.title}</Text>
              <Text style={styles.bodyText}>{t.trust.text}</Text>
            </View>
            <View style={[styles.trustCards, !isTablet && { flex: 1.4 }, isMobile && styles.trustCardsCompact]}>
              {t.trust.cards.map((card, i) => (
                <View key={card.label} style={styles.trustCard}>
                  <Text style={styles.trustCardLabel}>{card.label}</Text>
                  <Text style={styles.trustCardTitle}>{card.title}</Text>
                  <Text style={styles.trustCardText}>{card.text}</Text>
                  {i === t.trust.cards.length - 1 ? (
                    <Link href={pageHref('contact') as any}>
                      <Text style={styles.trustCardLink}>{t.trust.contactCta} ↗</Text>
                    </Link>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        </ScrollReveal>

        {/* ---------------------------------------------------------------- Profession */}
        <ScrollReveal style={styles.wrap}>
          <View style={[styles.professionLayout, isTablet && styles.professionLayoutCompact]}>
            <View style={[styles.professionCopy, !isTablet && { flex: 1 }]}>
              <Text style={styles.eyebrow}>{t.profession.eyebrow}</Text>
              <Text style={styles.h2}>{t.profession.title}</Text>
              <Text style={styles.bodyText}>{t.profession.text}</Text>
              <View style={styles.professionLinks}>
                {t.profession.links.map((link) => (
                  <Link key={link.slug} href={pageHref(link.slug) as any} style={styles.professionLinkWrap}>
                    <View style={styles.professionLink}>
                      <Text style={styles.professionLinkText}>{link.label}</Text>
                      <Text style={styles.professionLinkArrow}>↗</Text>
                    </View>
                  </Link>
                ))}
              </View>
              <Link href={pageHref('metiers') as any}>
                <Text style={styles.textLink}>{t.profession.allLink} →</Text>
              </Link>
            </View>
            <View style={[styles.personalization, !isTablet && { flex: 1 }]}>
              <Text style={styles.personalizationTitle}>{t.profession.personalTitle}</Text>
              <View style={{ gap: spacing.lg }}>
                {t.profession.items.map((item) => (
                  <View key={item.title}>
                    <Text style={styles.personalizationItemTitle}>{item.title}</Text>
                    <Text style={styles.personalizationItemText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollReveal>

        {/* ---------------------------------------------------------------- Stories + catalog */}
        <View style={styles.wrap} ref={storiesRef}>
          <ScrollReveal>
            <View style={styles.sectionHeadingCentered}>
              <Text style={styles.h2}>{t.stories.title}</Text>
              <Text style={styles.bodyText}>{t.stories.subtitle}</Text>
            </View>
            <StoryShowcase dict={t.stories} hrefFor={solutionHref} />
            <FeatureCatalog dict={t.catalog} hrefFor={(slug) => (slug === 'sur-mesure' ? pageHref('sur-mesure') : solutionHref(slug))} />
          </ScrollReveal>
        </View>

        {/* ---------------------------------------------------------------- Team */}
        <View style={[styles.wrap, styles.section]}>
          <ScrollReveal>
          <View style={styles.sectionHeadingCentered}>
            <Text style={styles.eyebrow}>{t.team.eyebrow}</Text>
            <Text style={styles.h2}>
              {t.team.titlePrefix}
              {'\n'}
              <Text style={styles.h2Em}>{t.team.titleEm}</Text>
            </Text>
            <Text style={styles.bodyText}>{t.team.text}</Text>
          </View>
          <View style={[styles.teamRoles, isTablet && styles.teamRolesCompact]}>
            {t.team.roles.map((role) => (
              <View key={role.number} style={styles.teamRole}>
                <Text style={styles.teamRoleNumber}>{role.number}</Text>
                <Text style={styles.teamRoleTitle}>{role.title}</Text>
                <Text style={styles.teamRoleText}>{role.text}</Text>
                <View style={styles.teamRoleTags}>
                  {role.tags.map((tag) => (
                    <View key={tag} style={styles.teamTag}>
                      <Text style={styles.teamTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
          <View style={[styles.teamPermissions, isMobile && styles.teamPermissionsCompact]}>
            <Text style={styles.permissionsSymbol}>↳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamPermTitle}>{t.team.permTitle}</Text>
              <Text style={styles.bodyText}>{t.team.permText}</Text>
              <Text style={styles.teamPermNote}>{t.team.permNote}</Text>
            </View>
            <Link href={solutionHref('rh-salaires') as any}>
              <Text style={styles.textLink}>{t.team.permLink} ↗</Text>
            </Link>
          </View>
          </ScrollReveal>
        </View>

        {/* ---------------------------------------------------------------- Automation / voice */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <View style={[styles.sectionHeadingRow, isTablet && styles.sectionHeadingRowCompact]}>
            <View style={!isTablet ? { flex: 1 } : undefined}>
              <Text style={styles.eyebrow}>{t.automation.eyebrow}</Text>
              <Text style={styles.h2}>{t.automation.title}</Text>
            </View>
            <Text style={[styles.bodyText, !isTablet && styles.sectionHeadingRowText]}>{t.automation.text}</Text>
          </View>
          <View style={[styles.commandLayout, isTablet && styles.commandLayoutCompact]}>
            <View style={[styles.commandCopy, !isTablet && { flex: 1 }]}>
              <Text style={styles.automationTag}>{t.automation.tag}</Text>
              <Text style={styles.commandTitle}>{t.automation.commandTitle}</Text>
              <Text style={styles.bodyText}>{t.automation.commandText}</Text>
              <Link href={solutionHref('dictee-vocale') as any}>
                <Text style={styles.textLink}>{t.automation.link} →</Text>
              </Link>
            </View>
            <View style={[styles.commandDemo, !isTablet && { flex: 1.1 }]}>
              <VoiceDemo dict={t.automation} />
            </View>
          </View>
        </ScrollReveal>

        {/* ---------------------------------------------------------------- Terrain */}
        <View style={styles.terrainOuter}>
          <ScrollReveal style={styles.wrap}>
            <Text style={styles.eyebrow}>{t.terrain.eyebrow}</Text>
            <Text style={styles.h2}>{t.terrain.title}</Text>
            <Text style={[styles.bodyText, { maxWidth: 480 }]}>{t.terrain.text}</Text>
            <View style={[styles.devicePoints, isMobile && styles.devicePointsCompact]}>
              {t.terrain.points.map((p) => (
                <View key={p.label} style={isMobile ? styles.devicePointRow : undefined}>
                  <Text style={styles.devicePointLabel}>{p.label}</Text>
                  <Text style={styles.devicePointText}>{p.text}</Text>
                </View>
              ))}
            </View>
            <Link href={pageHref('telechargement') as any} asChild>
              <Button title={t.terrain.installCta} onPress={() => {}} icon="arrow-right" style={{ alignSelf: 'flex-start', marginTop: spacing.lg }} />
            </Link>
            <Text style={styles.installNote}>{t.terrain.installNote}</Text>
          </ScrollReveal>
        </View>

        {/* ---------------------------------------------------------------- Tailored */}
        <ScrollReveal style={[styles.wrap, styles.section, styles.tailored, isTablet && styles.tailoredCompact]}>
          <View style={[styles.tailoredHeading, !isTablet && { flex: 1 }]}>
            <Text style={styles.eyebrow}>{t.tailored.eyebrow}</Text>
            <Text style={styles.h2}>{t.tailored.title}</Text>
            <Text style={styles.bodyText}>{t.tailored.text}</Text>
            <Link href={pageHref('contact') as any} asChild>
              <Button title={t.tailored.cta} onPress={() => {}} icon="arrow-right" style={{ alignSelf: 'flex-start' }} />
            </Link>
          </View>
          <View style={[styles.tailoredContent, !isTablet && { flex: 1 }]}>
            {t.tailored.steps.map((step) => (
              <View key={step.num} style={styles.tailoredStep}>
                <Text style={styles.tailoredStepNum}>{step.num}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tailoredStepTitle}>{step.title}</Text>
                  <Text style={styles.bodyText}>{step.text}</Text>
                </View>
              </View>
            ))}
            <Link href={pageHref('sur-mesure') as any}>
              <Text style={[styles.textLink, { marginTop: spacing.md }]}>{t.tailored.link} →</Text>
            </Link>
          </View>
        </ScrollReveal>

        {/* ---------------------------------------------------------------- Bexio */}
        <ScrollReveal style={styles.wrap}>
          <View style={[styles.bexioBanner, isMobile && styles.bexioBannerCompact]}>
            <View style={styles.bexioIcon}>
              <Image source={require('../assets/logo-mark.png')} style={styles.bexioLogo} resizeMode="contain" accessibilityLabel="Cantia" />
              <Text style={styles.bexioIconArrow}>↔</Text>
              <Text style={styles.bexioWord}>bexio</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>{t.bexio.eyebrow}</Text>
              <Text style={styles.bexioTitle}>{t.bexio.title}</Text>
              <Text style={styles.bodyText}>{t.bexio.text}</Text>
            </View>
            <Link href={pageHref('integrations') as any}>
              <Text style={styles.textLink}>{t.bexio.link} ↗</Text>
            </Link>
          </View>
        </ScrollReveal>

        {/* ---------------------------------------------------------------- Pricing */}
        <View ref={pricingRef}>
          <ScrollReveal>
            <PricingSection />
          </ScrollReveal>
        </View>

        {/* ---------------------------------------------------------------- FAQ */}
        <ScrollReveal style={[styles.wrap, styles.section, styles.faqLayout, isTablet && styles.faqLayoutCompact]}>
          <View style={[styles.faqHeading, !isTablet && { flex: 0.8 }]}>
            <Text style={styles.eyebrow}>{t.faq.eyebrow}</Text>
            <Text style={styles.h2}>{t.faq.title}</Text>
            <Link href={pageHref('aide') as any}>
              <Text style={styles.textLink}>{t.faq.link} →</Text>
            </Link>
          </View>
          <View style={!isTablet ? { flex: 1 } : undefined}>
            {t.faq.items.map((item) => (
              <Disclosure key={item.q} title={item.q}>
                <Text style={styles.bodyText}>{item.a}</Text>
              </Disclosure>
            ))}
          </View>
        </ScrollReveal>

        {/* ---------------------------------------------------------------- Closing */}
        <View style={styles.closing}>
          <ScrollReveal style={styles.wrap}>
            <Text style={styles.closingEyebrow}>{t.closing.eyebrow}</Text>
            <Text style={styles.closingTitle}>
              {t.closing.titlePrefix}
              {'\n'}
              <Text style={{ color: '#e8ad89' }}>{t.closing.titleEm}</Text>
            </Text>
            <Text style={styles.closingText}>{t.closing.text}</Text>
            <View style={styles.closingActions}>
              <Link href={authHref('signup')} asChild>
                <Button title={t.closing.cta} onPress={() => {}} icon="arrow-right" />
              </Link>
              <Link href={pageHref('contact') as any}>
                <Text style={styles.closingContact}>{t.closing.contact}</Text>
              </Link>
            </View>
          </ScrollReveal>
        </View>

        <MarketingFooter onServicesPress={() => scrollToRef(storiesRef)} onPricingPress={() => scrollToRef(pricingRef)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: spacing.xl },
  section: { paddingTop: spacing.xxxl * 1.3 },
  eyebrow: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: colors.primary, textTransform: 'uppercase' },
  h2: { fontFamily: landingFonts.body, fontSize: 34, fontWeight: '600', letterSpacing: -1, lineHeight: 40, color: colors.text, marginTop: 10, marginBottom: spacing.md },
  h2Em: { fontStyle: 'italic', color: colors.primary },
  bodyText: { fontFamily: landingFonts.body, fontSize: 15, lineHeight: 24, color: colors.textMuted },
  textLink: { fontFamily: landingFonts.body, fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },

  // Hero
  hero: { backgroundColor: colors.bg, paddingBottom: spacing.xl, position: 'relative', overflow: 'hidden' },
  heroMountainBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(/hero-mountain.webp)',
    backgroundSize: 'cover',
    // backgroundPosition is set imperatively via heroMountainRef below —
    // react-native-web's StyleSheet compiler drops that property silently.
    backgroundRepeat: 'no-repeat',
  } as unknown as ViewStyle,
  // Transparent through the left ~42% (where the copy lives), ramping to
  // fully opaque by ~65% — the mountain itself already sits in the
  // source image's right half, so this just reveals it rather than
  // fighting the photo's own composition.
  heroMountainMaskFull: {
    maskImage: 'linear-gradient(to right, transparent 0%, transparent 42%, black 65%)',
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 42%, black 65%)',
  } as unknown as ViewStyle,
  // Phones: just a peek at the very edge — opaque only past 84% of the
  // width — instead of the full reveal above.
  heroMountainMaskPeek: {
    maskImage: 'linear-gradient(to right, transparent 0%, transparent 84%, black 97%)',
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 84%, black 97%)',
  } as unknown as ViewStyle,
  heroCopy: { paddingTop: spacing.xl },
  // Stretches the copy column to the hero's full (forced) minHeight and
  // pushes the baseline row down to meet its bottom edge, instead of
  // leaving a bare gap of background between the content and the section
  // end whenever natural content height falls short of minHeight (tablet
  // portrait especially, where the compact layout is much shorter than
  // desktop's "grand geste" treatment).
  heroCopySpread: { flex: 1, justifyContent: 'space-between' },
  heroKicker: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.lg },
  originSymbol: { alignItems: 'center', justifyContent: 'center' },
  originSymbolSmall: { alignItems: 'center', justifyContent: 'center' },
  heroKickerText: { fontFamily: landingFonts.body, fontSize: 13, fontWeight: '600', color: '#674932' },
  heroMain: { flexDirection: 'row', gap: 56, paddingVertical: spacing.xxl, alignItems: 'flex-start' },
  heroMainCompact: { flexDirection: 'column', alignItems: 'flex-start', gap: spacing.xl },
  heroTitleCol: { minWidth: 0 },
  h1: { fontFamily: landingFonts.body, fontWeight: '700', letterSpacing: -3, color: colors.text },
  h1Highlight: { color: colors.primary },
  crossedWrap: { position: 'relative', alignSelf: 'flex-start', marginTop: spacing.lg },
  crossedText: { fontFamily: landingFonts.body, fontWeight: '500', letterSpacing: -1, color: '#786653' },
  heroAside: { gap: spacing.sm, maxWidth: 430 },
  heroAsideEyebrow: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.primary },
  heroAsideP1: { fontFamily: landingFonts.body, fontSize: 19, fontWeight: '600', color: colors.text, lineHeight: 27, marginTop: spacing.xs, letterSpacing: -0.3 },
  heroAsideP2: { fontFamily: landingFonts.body, fontSize: 15, color: colors.textMuted, lineHeight: 24, marginBottom: spacing.sm },
  // Desktop-only "grand geste" layout — see the isTablet branch above.
  heroDesktop: { paddingVertical: spacing.xxl, gap: spacing.md },
  heroInfoBand: {
    flexDirection: 'row',
    gap: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xl,
    marginTop: spacing.xl,
  },
  heroInfoCol: { flex: 1, gap: spacing.sm },
  heroInfoColCta: { alignItems: 'flex-start', gap: spacing.md },
  heroInfoSubhead: { fontFamily: landingFonts.body, fontSize: 24, fontWeight: '700', color: colors.text, lineHeight: 31, marginTop: spacing.xs, letterSpacing: -0.3 },
  heroInfoBody: { fontFamily: landingFonts.body, fontSize: 15, color: colors.textMuted, lineHeight: 25 },
  heroDiscover: {
    alignSelf: 'flex-start',
    maxWidth: 300,
    fontFamily: landingFonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#D7C6B1',
  },
  heroTrust: { fontFamily: landingFonts.body, fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  heroBaseline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.lg, gap: spacing.lg },
  heroBaselineCompact: { justifyContent: 'space-between' },
  baselineLabel: { fontFamily: landingFonts.body, fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.textMuted },
  baselineItems: { flexDirection: 'row', gap: spacing.xl },
  baselineItem: { fontFamily: landingFonts.body, fontSize: 12, color: colors.text },
  baselineNumber: { fontFamily: landingFonts.body, fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.textMuted },

  // Trust
  trustLayout: { flexDirection: 'row', gap: spacing.xxxl, paddingVertical: spacing.xxxl, borderTopWidth: 1, borderTopColor: colors.border },
  trustLayoutCompact: { flexDirection: 'column', gap: spacing.xl },
  trustOrigin: {},
  trustLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  trustLocationText: { fontFamily: landingFonts.body, fontSize: 13, fontWeight: '600', color: colors.text },
  trustCards: { flexDirection: 'row', gap: spacing.lg },
  trustCardsCompact: { flexDirection: 'column' },
  trustCard: { flex: 1, gap: 6 },
  trustCardLabel: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
  trustCardTitle: { fontFamily: landingFonts.body, fontSize: 17, fontWeight: '600', color: colors.text, marginTop: 4 },
  trustCardText: { fontFamily: landingFonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  trustCardLink: { fontFamily: landingFonts.body, fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 4 },

  // Profession
  professionLayout: { flexDirection: 'row', gap: 70, paddingVertical: spacing.xxxl, alignItems: 'center' },
  professionLayoutCompact: { flexDirection: 'column', alignItems: 'stretch', gap: spacing.xl },
  professionCopy: {},
  professionLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: spacing.lg },
  professionLinkWrap: { width: '47%' },
  professionLink: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.sm, paddingVertical: 11, paddingHorizontal: 13 },
  professionLinkText: { fontFamily: landingFonts.body, fontSize: 13, color: colors.text },
  professionLinkArrow: { color: colors.primary, fontSize: 12 },
  personalization: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  personalizationTitle: { fontFamily: landingFonts.body, fontSize: 22, fontWeight: '600', letterSpacing: -0.5, color: colors.text, marginBottom: spacing.lg, lineHeight: 27 },
  personalizationItemTitle: { fontFamily: landingFonts.body, fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 3 },
  personalizationItemText: { fontFamily: landingFonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 19 },

  sectionHeadingCentered: { alignItems: 'center', textAlign: 'center', maxWidth: 720, alignSelf: 'center', marginBottom: spacing.lg },
  sectionHeadingRow: { flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-end', marginBottom: spacing.xl },
  sectionHeadingRowCompact: { flexDirection: 'column', alignItems: 'flex-start', gap: spacing.sm },
  sectionHeadingRowText: { flex: 1, textAlign: 'right' },

  // Team
  teamRoles: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xl },
  teamRolesCompact: { flexDirection: 'column' },
  teamRole: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 6, backgroundColor: colors.surface },
  teamRoleNumber: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
  teamRoleTitle: { fontFamily: landingFonts.body, fontSize: 17, fontWeight: '600', color: colors.text },
  teamRoleText: { fontFamily: landingFonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  teamRoleTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  teamTag: { backgroundColor: colors.bg, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10 },
  teamTagText: { fontFamily: landingFonts.body, fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  teamPermissions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xl, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.xl },
  teamPermissionsCompact: { flexDirection: 'column', alignItems: 'flex-start' },
  permissionsSymbol: { fontSize: 22, color: colors.primary },
  teamPermTitle: { fontFamily: landingFonts.body, fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 4 },
  teamPermNote: { fontFamily: landingFonts.body, fontSize: 11, color: colors.textMuted, marginTop: spacing.xs },

  // Automation
  commandLayout: { flexDirection: 'row', gap: spacing.xxl, marginTop: spacing.xl },
  commandLayoutCompact: { flexDirection: 'column' },
  commandCopy: { gap: spacing.sm },
  automationTag: { fontFamily: landingFonts.body, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.primary },
  commandTitle: { fontFamily: landingFonts.body, fontSize: 26, fontWeight: '600', letterSpacing: -0.8, lineHeight: 33, color: colors.text, marginVertical: spacing.sm },
  commandDemo: { backgroundColor: colors.text, borderRadius: radius.lg, padding: spacing.xl },

  // Terrain
  terrainOuter: { backgroundColor: colors.primarySoft, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: spacing.xxxl, marginTop: spacing.xxxl * 1.3 },
  devicePoints: { flexDirection: 'row', gap: spacing.lg, marginVertical: spacing.lg, maxWidth: 640 },
  devicePointsCompact: { flexDirection: 'column', gap: spacing.md },
  devicePointRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'baseline' },
  devicePointLabel: { fontFamily: landingFonts.body, fontSize: 13, fontWeight: '700', color: colors.text },
  devicePointText: { fontFamily: landingFonts.body, fontSize: 12, color: colors.textMuted },
  installNote: { fontFamily: landingFonts.body, fontSize: 11, color: colors.textMuted, marginTop: spacing.md, lineHeight: 17 },

  // Tailored
  tailored: { flexDirection: 'row', gap: 70, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.xxxl },
  tailoredCompact: { flexDirection: 'column', gap: spacing.xl },
  tailoredHeading: { gap: spacing.sm },
  tailoredContent: { gap: spacing.md },
  tailoredStep: { flexDirection: 'row', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  tailoredStepNum: { width: 30, height: 30, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, textAlign: 'center', textAlignVertical: 'center', fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', color: colors.primary, lineHeight: 30 },
  tailoredStepTitle: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 },

  // Bexio
  bexioBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.xl, marginVertical: spacing.xxxl },
  bexioBannerCompact: { flexDirection: 'column', alignItems: 'flex-start' },
  bexioIcon: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bexioLogo: { width: 26, height: 26 },
  bexioIconArrow: { color: colors.textMuted },
  bexioWord: { fontFamily: landingFonts.body, fontSize: 22, fontWeight: '700', color: '#64764e', letterSpacing: -1 },
  bexioTitle: { fontFamily: landingFonts.body, fontSize: 16, fontWeight: '600', color: colors.text, marginVertical: 4 },

  // FAQ
  faqLayout: { flexDirection: 'row', gap: spacing.xxxl },
  faqLayoutCompact: { flexDirection: 'column', gap: spacing.lg },
  faqHeading: { gap: spacing.sm },

  // Closing
  closing: { backgroundColor: colors.text, paddingVertical: spacing.xxxl * 1.4, marginTop: spacing.xxxl },
  closingEyebrow: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: '#e8ad89', textAlign: 'center' },
  closingTitle: { fontFamily: landingFonts.body, fontSize: 40, fontWeight: '600', color: '#fff', textAlign: 'center', letterSpacing: -1.2, lineHeight: 46, marginVertical: spacing.md },
  closingText: { fontFamily: landingFonts.body, fontSize: 15, color: '#c4b7a6', textAlign: 'center', maxWidth: 520, alignSelf: 'center', marginBottom: spacing.xl },
  closingActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  closingContact: { fontFamily: landingFonts.body, fontSize: 13, color: '#e1d6c8', textDecorationLine: 'underline' },
});
