import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from './ui';
import { PageHero, pageWrap } from './landing/PageHero';
import { SectionHead } from './landing/SectionHead';
import { CtaButton } from './landing/CtaButton';
import { bodyInk, ink, rule } from './landing/brand';
import { MarketingHead } from './MarketingHead';
import { MarketingFooter, MarketingNav } from './MarketingChrome';
import { PricingSection } from './PricingSection';
import { SwissSection } from './SwissSection';
import { breakpoints, colors, spacing } from '../lib/theme';
import { displayType, marketingFonts, monoType } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';
import { getTradePage } from '../lib/tradeLandingPages';
import { getPostBySlug } from '../lib/blog';
import { getAppLocale, useTranslation } from '../lib/translations';
import { useMarketingDict } from '../lib/i18n';

export function TradePage({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const dict = useMarketingDict();
  const locale = getAppLocale();
  const trade = getTradePage(slug, locale)!;
  const { width } = useWindowDimensions();
  const isTablet = width < breakpoints.desktop;

  // Outside the building trades, the shared copy talks about projects.
  const general = !!trade.general;
  const SECONDARY_FEATURES: { icon: keyof typeof Feather.glyphMap; title: string; text: string }[] = [
    { icon: 'users', title: t('tradePage.secondaryClientsTitle'), text: t(general ? 'tradePage.generalClientsText' : 'tradePage.secondaryClientsText') },
    { icon: 'credit-card', title: t('tradePage.secondaryQrTitle'), text: t('tradePage.secondaryQrText') },
    { icon: 'dollar-sign', title: t('tradePage.secondaryExpensesTitle'), text: t(general ? 'tradePage.generalExpensesText' : 'tradePage.secondaryExpensesText') },
    { icon: 'folder', title: t('tradePage.secondaryDocumentsTitle'), text: t(general ? 'tradePage.generalDocumentsText' : 'tradePage.secondaryDocumentsText') },
    { icon: 'list', title: t('tradePage.secondaryCatalogueTitle'), text: t('tradePage.secondaryCatalogueText') },
    { icon: 'zap', title: t('tradePage.secondaryIntegrationsTitle'), text: t('tradePage.secondaryIntegrationsText') },
  ];

  const forTrade = locale === 'fr' ? genderedFor(trade.tradeName) : trade.tradeName;

  const related = (trade.relatedTrades ?? []).map((s) => getTradePage(s, locale)).filter((p): p is NonNullable<typeof p> => !!p);
  const relatedPosts = (trade.relatedBlogSlugs ?? []).map((s) => getPostBySlug(s, locale)).filter((p) => !!p);
  const hrefPrefix = locale === 'de' ? '/de/' : locale === 'it' ? '/it/' : '/';

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={trade.seo.title} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <View style={[styles.wrap, styles.breadcrumb]}>
          <Link href={locale === 'de' ? '/de' : locale === 'it' ? '/it' : '/'}><Text style={styles.breadcrumbLink}>{t('tradePage.breadcrumbHome')}</Text></Link>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Link href={`${hrefPrefix}metiers` as any}><Text style={styles.breadcrumbLink}>{t('tradePage.breadcrumbTrades')}</Text></Link>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbCurrent}>{trade.tradeName}</Text>
        </View>

        <PageHero
          kicker={trade.hero.eyebrow}
          title={trade.hero.title}
          lede={trade.hero.subtitle}
          cta={{ title: t('tradePage.ctaTrial'), href: authHref('signup') }}
          secondary={{ title: t('tradePage.discoverFor', { trade: forTrade }), href: `${hrefPrefix}#services` }}
          facts={[t('tradePage.heroTrust')]}
          cartouche={dict.hero.cartouche}
        />

        <View style={[styles.wrap, styles.section]}>
          <SectionHead label={t('tradePage.painEyebrow')} title={t('tradePage.painTitle')} />
          {!isTablet ? (
            <View style={[styles.tableRow, styles.tableHead]}>
              <Text style={[styles.headCell, { flex: 1 }]}> </Text>
              <Text style={[styles.headCell, { flex: 1 }]}>{t('tradePage.painConsequence')}</Text>
              <Text style={[styles.headCell, { flex: 1, color: colors.primary }]}>{t('tradePage.painResponse')}</Text>
            </View>
          ) : null}
          {trade.painPoints.map((p) => (
            <View key={p.problem} style={[styles.tableRow, isTablet && styles.tableRowCompact]}>
              <Text style={[styles.painProblem, !isTablet && { flex: 1 }]}>{p.problem}</Text>
              <View style={[!isTablet && { flex: 1 }, styles.cellGap]}>
                {isTablet ? <Text style={styles.headCell}>{t('tradePage.painConsequence')}</Text> : null}
                <Text style={styles.bodyText}>{p.consequence}</Text>
              </View>
              <View style={[!isTablet && { flex: 1 }, styles.cellGap]}>
                {isTablet ? <Text style={[styles.headCell, { color: colors.primary }]}>{t('tradePage.painResponse')}</Text> : null}
                <Text style={[styles.bodyText, { color: ink }]}>{p.response}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.wrap, styles.section]}>
          <SectionHead label={t('tradePage.usagesEyebrow')} title={t('tradePage.usagesTitle', { trade: forTrade })} />
          <View style={styles.grid}>
            {trade.usages.map((u) => (
              <View key={u.title} style={styles.gridCell}>
                <Feather name={u.icon} size={20} color={colors.primary} />
                <Text style={styles.cellTitle}>{u.title}</Text>
                <Text style={styles.bodyText}>{u.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.wrap, styles.section]}>
          <View style={styles.scenario}>
            <Text style={styles.scenarioTitle}>{trade.scenario.title}</Text>
            <Text style={styles.scenarioText}>{trade.scenario.text}</Text>
          </View>
        </View>

        <View style={[styles.wrap, styles.section]}>
          <SectionHead title={t('tradePage.comparisonEyebrow')} />
          <View style={[styles.tableRow, styles.tableHead]}>
            <Text style={[styles.headCell, { flex: 1 }]}>{t('tradePage.comparisonBefore')}</Text>
            <Text style={[styles.headCell, { flex: 1, color: colors.primary }]}>{t('tradePage.comparisonAfter')}</Text>
          </View>
          {trade.comparison.map((row) => (
            <View key={row.before} style={styles.tableRow}>
              <Text style={[styles.bodyText, styles.before, { flex: 1 }]}>{row.before}</Text>
              <Text style={[styles.bodyText, { flex: 1, color: ink, fontWeight: '600' }]}>{row.after}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.wrap, styles.section]}>
          <SectionHead title={t('tradePage.secondaryEyebrow')} />
          <View style={styles.grid}>
            {SECONDARY_FEATURES.map((f) => (
              <View key={f.title} style={styles.gridCell}>
                <Feather name={f.icon} size={18} color={colors.primary} />
                <Text style={styles.cellTitleSmall}>{f.title}</Text>
                <Text style={styles.bodySmall}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <SwissSection />
        <PricingSection />

        {relatedPosts.length ? (
          <View style={[styles.wrap, styles.section]}>
            <SectionHead title={t('tradePage.furtherReadingEyebrow')} />
            {relatedPosts.map((post) => (
              <Link key={post!.slug} href={`${hrefPrefix}blog/${post!.slug}` as any} asChild>
                <Pressable style={styles.listRow}>
                  <Text style={styles.listRowText}>{post!.title}</Text>
                  <Text style={styles.arrow}>→</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        ) : null}

        <View style={[styles.wrap, styles.section]}>
          <SectionHead title={t('tradePage.faqEyebrow')} />
          {trade.faq.map((f) => (
            <View key={f.question} style={styles.faqRow}>
              <Text style={styles.faqQuestion}>{f.question}</Text>
              <Text style={styles.bodyText}>{f.answer}</Text>
            </View>
          ))}
        </View>

        {related.length ? (
          <View style={[styles.wrap, styles.section]}>
            <Text style={styles.seeAlsoLabel}>{t('tradePage.seeAlsoEyebrow')}</Text>
            <View style={styles.relatedRow}>
              {related.map((r) => (
                <Link key={r.slug} href={`${hrefPrefix}${r.slug}` as any}>
                  <Text style={styles.relatedLink}>{t('tradePage.seeAlsoTradeChip', { trade: r.tradeName })} →</Text>
                </Link>
              ))}
              <Link href={`${hrefPrefix}metiers` as any}>
                <Text style={styles.relatedLink}>{t('tradePage.seeAlsoAllTrades')} →</Text>
              </Link>
            </View>
          </View>
        ) : null}

        <View style={styles.closing}>
          <View style={styles.wrap}>
            <Text style={styles.closingTitle}>{t(general ? 'tradePage.generalClosingTitle' : 'tradePage.closingTitle')}</Text>
            <Text style={styles.closingText}>{t('tradePage.closingText')}</Text>
            <Link href={authHref('signup')} asChild>
              <CtaButton title={t('tradePage.closingCta')} style={{ marginTop: spacing.xl }} />
            </Link>
          </View>
        </View>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

function genderedFor(tradeName: string): string {
  if (tradeName === 'entreprise générale') return 'les entreprises générales';
  if (tradeName.includes('-')) return `les ${tradeName.split('-').map((w) => `${w}s`).join('-')}`;
  // "entreprise de nettoyage" -> "les entreprises de nettoyage"
  if (tradeName.startsWith('entreprise ')) return `les entreprises ${tradeName.slice('entreprise '.length)}`;
  if (tradeName === 'construction bois') return 'la construction bois';
  if (tradeName === 'génie civil') return 'le génie civil';
  return `les ${tradeName}s`;
}

const styles = StyleSheet.create({
  wrap: pageWrap,
  section: { paddingTop: 96 },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', paddingTop: spacing.lg },
  breadcrumbLink: { ...monoType, fontSize: 11, color: colors.textMuted, textDecorationLine: 'underline' },
  breadcrumbSep: { ...monoType, fontSize: 11, color: colors.textMuted },
  breadcrumbCurrent: { ...monoType, fontSize: 11, color: ink },

  bodyText: { fontFamily: marketingFonts.body, fontSize: 16, lineHeight: 25, color: bodyInk },
  bodySmall: { fontFamily: marketingFonts.body, fontSize: 15, lineHeight: 23, color: bodyInk },
  cellGap: { gap: 6 },
  headCell: { ...monoType, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textMuted },

  tableRow: { flexDirection: 'row', gap: spacing.xxl, paddingVertical: spacing.lg + 2, borderBottomWidth: 1, borderBottomColor: rule },
  tableRowCompact: { flexDirection: 'column', gap: spacing.md },
  tableHead: { paddingVertical: spacing.sm, borderTopWidth: 1.5, borderTopColor: ink, borderBottomColor: ink },
  painProblem: { ...displayType, fontSize: 26, fontWeight: '800', lineHeight: 28, color: ink },
  before: { textDecorationLine: 'line-through', textDecorationColor: 'rgba(195,63,50,0.55)' } as any,

  grid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1.5, borderTopColor: ink },
  gridCell: { flexGrow: 1, flexBasis: 300, gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.xl, paddingRight: spacing.xl, borderBottomWidth: 1, borderBottomColor: rule },
  cellTitle: { fontFamily: marketingFonts.body, fontSize: 19, fontWeight: '700', color: ink, lineHeight: 25 },
  cellTitleSmall: { fontFamily: marketingFonts.body, fontSize: 17, fontWeight: '700', color: ink },

  scenario: { borderLeftWidth: 2, borderLeftColor: colors.primary, paddingLeft: spacing.xl, gap: spacing.md, maxWidth: 860 },
  scenarioTitle: { ...monoType, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary },
  scenarioText: { fontFamily: marketingFonts.body, fontSize: 22, lineHeight: 34, color: ink, fontStyle: 'italic' },

  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: rule },
  listRowText: { flex: 1, fontFamily: marketingFonts.body, fontSize: 18, fontWeight: '600', color: ink },
  arrow: { fontSize: 18, color: colors.primary },

  faqRow: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: rule, gap: 6, maxWidth: 900 },
  faqQuestion: { fontFamily: marketingFonts.body, fontSize: 18, fontWeight: '700', color: ink },

  seeAlsoLabel: { ...monoType, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary, marginBottom: spacing.md },
  relatedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  relatedLink: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: ink, borderBottomWidth: 1.5, borderBottomColor: ink, paddingBottom: 2 },

  closing: { backgroundColor: ink, paddingVertical: 96, marginTop: 96 },
  closingTitle: { ...displayType, fontSize: 52, lineHeight: 52, fontWeight: '800', color: '#FBF6EE', maxWidth: 860 },
  closingText: { fontFamily: marketingFonts.body, fontSize: 18, lineHeight: 28, color: '#D5C8B8', maxWidth: 560, marginTop: spacing.lg },
});
