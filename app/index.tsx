import { useCallback, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Screen } from '../components/ui';
import { LanguageSwitcher, MarketingFooter } from '../components/MarketingChrome';
import { MarketingHead } from '../components/MarketingHead';
import { PricingSection } from '../components/PricingSection';
import { HeroCross } from '../components/landing/HeroCross';
import { StoryShowcase } from '../components/landing/StoryShowcase';
import { FeatureCatalog } from '../components/landing/FeatureCatalog';
import { VoiceDemo } from '../components/landing/VoiceDemo';
import { Disclosure } from '../components/landing/Disclosure';
import { useMarketingDict } from '../lib/i18n';
import { getAppLocale } from '../lib/translations';
import { marketingPageTitle } from '../lib/marketingSeoTitles';
import { colors, breakpoints, radius, spacing } from '../lib/theme';
import { landingFonts } from '../lib/landingTheme';
import { authHref, useSyncMarketingLocaleFromPath } from '../lib/appHost';

const NAV_HEIGHT = 72;

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

  const { width } = useWindowDimensions();
  const isMobile = width < breakpoints.tablet;
  const isTablet = width < breakpoints.desktop;

  const scrollRef = useRef<ScrollView>(null);
  const storiesRef = useRef<View>(null);
  const teamRef = useRef<View>(null);
  const pricingRef = useRef<View>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  function scrollToRef(ref: React.RefObject<View | null>) {
    setMenuOpen(false);
    ref.current?.measure((_x, y) => {
      scrollRef.current?.scrollTo({ y: y - NAV_HEIGHT - 12, animated: true });
    });
  }

  const navLinks = (
    <>
      <Pressable onPress={() => scrollToRef(storiesRef)}>
        <Text style={styles.navLink}>{t.landingNav.features}</Text>
      </Pressable>
      <Pressable onPress={() => scrollToRef(teamRef)}>
        <Text style={styles.navLink}>{t.landingNav.team}</Text>
      </Pressable>
      <Pressable onPress={() => scrollToRef(pricingRef)}>
        <Text style={styles.navLink}>{t.landingNav.pricing}</Text>
      </Pressable>
      <Link href={pageHref('aide') as any}>
        <Text style={styles.navLink}>{t.landingNav.help}</Text>
      </Link>
      <Link href={pageHref('contact') as any}>
        <Text style={styles.navLink}>{t.landingNav.contact}</Text>
      </Link>
    </>
  );

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={marketingPageTitle('home', appLocale)} />

      <View style={[styles.nav, scrolled && styles.navScrolled, { height: NAV_HEIGHT }]}>
        <View style={styles.navInner}>
          <Link href="/" style={styles.brand}>
            <Feather name="hexagon" size={22} color={colors.primary} />
            <Text style={styles.brandText}>Cantia</Text>
          </Link>
          {!isTablet ? <View style={styles.navLinks}>{navLinks}</View> : null}
          <View style={styles.navActions}>
            {!isMobile ? <LanguageSwitcher /> : null}
            {!isTablet ? (
              <>
                <Link href={authHref('login')}>
                  <Text style={styles.navLink}>{t.landingNav.login}</Text>
                </Link>
                <Link href={authHref('signup')} asChild>
                  <Button title={t.landingNav.signup} onPress={() => {}} style={styles.navCta} />
                </Link>
              </>
            ) : (
              <Pressable onPress={() => setMenuOpen(true)} hitSlop={8} accessibilityLabel="Menu">
                <Feather name="menu" size={24} color={colors.text} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 8)}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingTop: NAV_HEIGHT }}
      >
        {/* ---------------------------------------------------------------- Hero */}
        <View style={styles.hero}>
          <View style={[styles.wrap, styles.heroCopy]}>
            <View style={styles.heroKicker}>
              <View style={styles.originSymbol}>
                <Feather name="plus" size={13} color={colors.primary} />
              </View>
              <Text style={styles.heroKickerText}>{t.hero.kicker}</Text>
            </View>

            <View style={[styles.heroMain, isTablet && styles.heroMainCompact]}>
              <View style={[styles.heroTitleCol, !isTablet && { flex: 1.3 }]}>
                <Text style={styles.h1}>
                  {t.hero.titlePrefix}
                  {'\n'}
                  <Text style={styles.h1Highlight}>{t.hero.titleHighlight}</Text>
                </Text>
                <View style={styles.crossedWrap}>
                  <Text style={styles.crossedText}>{t.hero.crossedText}</Text>
                  <HeroCross />
                </View>
              </View>
              <View style={[styles.heroAside, !isTablet && { flex: 1 }]}>
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
        <View style={styles.wrap}>
          <View style={[styles.trustLayout, isTablet && styles.trustLayoutCompact]}>
            <View style={[styles.trustOrigin, !isTablet && { flex: 0.9 }]}>
              <View style={styles.trustLocationRow}>
                <View style={styles.originSymbolSmall}>
                  <Feather name="plus" size={11} color={colors.primary} />
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
        </View>

        {/* ---------------------------------------------------------------- Profession */}
        <View style={styles.wrap}>
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
        </View>

        {/* ---------------------------------------------------------------- Stories + catalog */}
        <View style={styles.wrap} ref={storiesRef}>
          <View style={styles.sectionHeadingCentered}>
            <Text style={styles.h2}>{t.stories.title}</Text>
            <Text style={styles.bodyText}>{t.stories.subtitle}</Text>
          </View>
          <StoryShowcase dict={t.stories} hrefFor={solutionHref} />
          <FeatureCatalog dict={t.catalog} hrefFor={(slug) => (slug === 'sur-mesure' ? pageHref('sur-mesure') : solutionHref(slug))} />
        </View>

        {/* ---------------------------------------------------------------- Team */}
        <View style={[styles.wrap, styles.section]} ref={teamRef}>
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
        </View>

        {/* ---------------------------------------------------------------- Automation / voice */}
        <View style={[styles.wrap, styles.section]}>
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
        </View>

        {/* ---------------------------------------------------------------- Terrain */}
        <View style={styles.terrainOuter}>
          <View style={styles.wrap}>
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
          </View>
        </View>

        {/* ---------------------------------------------------------------- Tailored */}
        <View style={[styles.wrap, styles.section, styles.tailored, isTablet && styles.tailoredCompact]}>
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
        </View>

        {/* ---------------------------------------------------------------- Bexio */}
        <View style={styles.wrap}>
          <View style={[styles.bexioBanner, isMobile && styles.bexioBannerCompact]}>
            <View style={styles.bexioIcon}>
              <Feather name="hexagon" size={22} color={colors.textMuted} />
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
        </View>

        {/* ---------------------------------------------------------------- Pricing */}
        <View ref={pricingRef}>
          <PricingSection />
        </View>

        {/* ---------------------------------------------------------------- FAQ */}
        <View style={[styles.wrap, styles.section, styles.faqLayout, isTablet && styles.faqLayoutCompact]}>
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
        </View>

        {/* ---------------------------------------------------------------- Closing */}
        <View style={styles.closing}>
          <View style={styles.wrap}>
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
          </View>
        </View>

        <MarketingFooter onServicesPress={() => scrollToRef(storiesRef)} onPricingPress={() => scrollToRef(pricingRef)} />
      </ScrollView>

      <Modal visible={menuOpen} animationType="fade" transparent onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.mobileMenuBackdrop}>
          <View style={styles.mobileMenu}>
            <View style={styles.mobileMenuHeader}>
              <Text style={styles.brandText}>Cantia</Text>
              <Pressable onPress={() => setMenuOpen(false)} hitSlop={8}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>
            <View style={styles.mobileMenuLinks}>
              {navLinks}
              <Link href={pageHref('metiers') as any} onPress={() => setMenuOpen(false)}>
                <Text style={styles.navLink}>{t.landingNav.mobileMetiers}</Text>
              </Link>
              <Link href={pageHref('telechargement') as any} onPress={() => setMenuOpen(false)}>
                <Text style={styles.navLink}>{t.landingNav.mobileApp}</Text>
              </Link>
              <View style={{ marginTop: spacing.md }}>
                <LanguageSwitcher />
              </View>
            </View>
            <View style={styles.mobileMenuActions}>
              <Link href={authHref('login')} onPress={() => setMenuOpen(false)}>
                <Text style={styles.navLink}>{t.landingNav.login}</Text>
              </Link>
              <Link href={authHref('signup')} asChild>
                <Button title={t.landingNav.signup} onPress={() => setMenuOpen(false)} />
              </Link>
            </View>
          </View>
        </View>
      </Modal>
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

  // Nav
  nav: { position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#fffffff2', borderBottomWidth: 1, borderBottomColor: 'transparent', zIndex: 20 },
  navScrolled: { borderBottomColor: colors.border },
  navInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: '100%', paddingHorizontal: spacing.xl, maxWidth: 1200, width: '100%', alignSelf: 'center', gap: spacing.lg },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontFamily: landingFonts.body, fontSize: 22, fontWeight: '700', letterSpacing: -0.5, color: colors.text },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  navLink: { fontFamily: landingFonts.body, fontSize: 14, fontWeight: '500', color: colors.text },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  navCta: { paddingVertical: 11, paddingHorizontal: 18 },

  // Hero
  hero: { backgroundColor: colors.bg, paddingBottom: spacing.xl },
  heroCopy: { paddingTop: spacing.xl },
  heroKicker: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.lg },
  originSymbol: { width: 27, height: 27, borderRadius: 7, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  originSymbolSmall: { width: 20, height: 20, borderRadius: 5, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  heroKickerText: { fontFamily: landingFonts.body, fontSize: 13, fontWeight: '600', color: '#674932' },
  heroMain: { flexDirection: 'row', gap: 60, paddingVertical: spacing.xl, alignItems: 'center' },
  heroMainCompact: { flexDirection: 'column', alignItems: 'flex-start', gap: spacing.xl },
  heroTitleCol: {},
  h1: { fontFamily: landingFonts.body, fontSize: 62, fontWeight: '700', letterSpacing: -3, lineHeight: 66, color: colors.text },
  h1Highlight: { color: colors.primary },
  crossedWrap: { position: 'relative', alignSelf: 'flex-start', marginTop: spacing.lg },
  crossedText: { fontFamily: landingFonts.body, fontSize: 30, fontWeight: '500', letterSpacing: -1, color: '#786653', textDecorationLine: 'line-through', textDecorationColor: '#b54a40' },
  heroAside: { gap: spacing.sm },
  heroAsideEyebrow: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.primary },
  heroAsideP1: { fontFamily: landingFonts.body, fontSize: 17, fontWeight: '600', color: colors.text, lineHeight: 25, marginTop: spacing.xs },
  heroAsideP2: { fontFamily: landingFonts.body, fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.sm },
  heroDiscover: { fontFamily: landingFonts.body, fontSize: 13, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  heroTrust: { fontFamily: landingFonts.body, fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
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

  // Mobile menu
  mobileMenuBackdrop: { flex: 1, backgroundColor: '#231A12cc' },
  mobileMenu: { marginLeft: 'auto', width: '82%', maxWidth: 360, height: '100%', backgroundColor: colors.bg, padding: spacing.xl },
  mobileMenuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  mobileMenuLinks: { gap: spacing.lg },
  mobileMenuActions: { marginTop: 'auto', gap: spacing.md, paddingTop: spacing.xl },
});
