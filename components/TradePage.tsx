import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Hover, TextLink, Wrap } from './site/Primitives';
import { Breadcrumbs, Section, SectionHead, SitePage, useSiteLayout } from './site/Sections';
import { LaptopShot } from './site/Laptop';
import { APP_SCREENS } from './site/appScreens';
import { SECTOR_SLUGS, SECTOR_UI, SECTORS_COPY, type SectorKey } from '../lib/site/sectors';
import { FaqItem } from './site/FamilyPage';
import { SITE_PAGES } from '../lib/site/pages';
import { sans, serif, site } from '../lib/siteTheme';
import { authHref } from '../lib/appHost';
import { getTradePage } from '../lib/tradeLandingPages';
import { getPostByBase } from '../lib/blog';
import { getAppLocale, useTranslation } from '../lib/translations';

// One trade page (cantia.ch/charpentier, /de/zimmermann…): the trade's
// situations, uses, a day with Cantia, before/after, included modules,
// questions and reading, in the November 2026 identity. Content:
// lib/tradeLandingPages.ts.
export function TradePage({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const locale = getAppLocale() as 'fr' | 'de' | 'it';
  const trade = getTradePage(slug, locale)!;
  const { phone, tablet, width, h2Size } = useSiteLayout();
  const L = SITE_PAGES[locale]?.labels ?? SITE_PAGES.fr.labels;

  // Outside the building trades, the shared copy talks about projects.
  const general = !!trade.general;
  const SECONDARY: { icon: keyof typeof Feather.glyphMap; title: string; text: string }[] = [
    { icon: 'users', title: t('tradePage.secondaryClientsTitle'), text: t(general ? 'tradePage.generalClientsText' : 'tradePage.secondaryClientsText') },
    { icon: 'credit-card', title: t('tradePage.secondaryQrTitle'), text: t('tradePage.secondaryQrText') },
    { icon: 'dollar-sign', title: t('tradePage.secondaryExpensesTitle'), text: t(general ? 'tradePage.generalExpensesText' : 'tradePage.secondaryExpensesText') },
    { icon: 'folder', title: t('tradePage.secondaryDocumentsTitle'), text: t(general ? 'tradePage.generalDocumentsText' : 'tradePage.secondaryDocumentsText') },
    { icon: 'list', title: t('tradePage.secondaryCatalogueTitle'), text: t('tradePage.secondaryCatalogueText') },
    { icon: 'zap', title: t('tradePage.secondaryIntegrationsTitle'), text: t('tradePage.secondaryIntegrationsText') },
    // Building trades answer soumissions (beta: 1 to try on Essentiel, then Équipe).
    ...(general ? [] : [{ icon: 'clipboard' as const, title: t('tradePage.secondarySoumissionsTitle'), text: t('tradePage.secondarySoumissionsText') }]),
  ];

  const forTrade = locale === 'fr' ? genderedFor(trade.tradeName) : trade.tradeName;
  // The building trades sit in « Bâtiment & artisanat », the landscaper too
  // (outdoor work is part of the site, CFC 4).
  const sectorKey: SectorKey = 'batiment';
  const sector = SECTORS_COPY[locale][sectorKey];
  const related = (trade.relatedTrades ?? []).map((s) => getTradePage(s, locale)).filter((p): p is NonNullable<typeof p> => !!p);
  const relatedPosts = (trade.relatedBlogSlugs ?? []).map((s) => getPostByBase(s, locale)).filter((p) => !!p);
  const pre = locale === 'fr' ? '/' : `/${locale}/`;
  const cols = phone ? 1 : width <= 900 ? 2 : 3;
  const cellW = cols === 1 ? '100%' : cols === 2 ? '47%' : '30.5%';
  const h1 = phone ? 38 : tablet ? 44 : 52;

  return (
    <SitePage title={trade.seo.title} description={trade.seo.description} cta={false}>
      {/* Hero */}
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 40 : 70 }}>
        <Wrap>
          <Breadcrumbs
            items={[
              { label: t('tradePage.breadcrumbHome'), href: pre === '/' ? '/' : pre.slice(0, -1) },
              { label: SECTOR_UI[locale].crumbTrades, href: `${pre}metiers` },
              { label: sector.label, href: `${pre}metiers/${SECTOR_SLUGS[sectorKey]}` },
              { label: capitalize(trade.tradeName) },
            ]}
          />
          <View style={[styles.lead, phone ? { flexDirection: 'column', alignItems: 'stretch', gap: 32 } : { gap: tablet ? 40 : 70 }]}>
            <View style={phone ? undefined : { flex: 1.1, minWidth: 0 }}>
              <Eyebrow>{trade.hero.eyebrow}</Eyebrow>
              <Headline level={1} plain={trade.hero.title} size={h1} style={{ marginTop: 17, marginBottom: 21, letterSpacing: phone ? -1.6 : -2.4, lineHeight: h1 * 1.08 }} />
              <Text style={[sans, styles.leadText, phone && { fontSize: 13, lineHeight: 24 }]}>{trade.hero.subtitle}</Text>
              <View style={[styles.actions, { gap: phone ? 23 : 25 }]}>
                <View>
                  <Btn label={t('tradePage.ctaTrial')} href={authHref('signup')} small={phone} />
                </View>
                <View>
                  <TextLink label={L.compare} href={`${pre}tarifs`} size={phone ? 11 : 12} />
                </View>
              </View>
              <Text style={[sans, styles.trust]}>{t('tradePage.heroTrust')}</Text>
            </View>
            <View style={phone ? undefined : { flex: 1, minWidth: 0 }}>
              <LaptopShot source={APP_SCREENS[locale].chantier} alt={`${capitalize(trade.tradeName)} · Cantia`} />
            </View>
          </View>
        </Wrap>
      </View>

      {/* Situations of the trade */}
      <Section white>
        <SectionHead eyebrow={t('tradePage.painEyebrow')} plain={t('tradePage.painTitle')} />
        {!tablet ? (
          <View style={[styles.row, styles.headRow]}>
            <Text style={[sans, styles.th, { flex: 1 }]}> </Text>
            <Text style={[sans, styles.th, { flex: 1 }]}>{t('tradePage.painConsequence').toUpperCase()}</Text>
            <Text style={[sans, styles.th, { flex: 1, color: site.copper }]}>{t('tradePage.painResponse').toUpperCase()}</Text>
          </View>
        ) : null}
        {trade.painPoints.map((p) => (
          <View key={p.problem} style={[styles.row, tablet && { flexDirection: 'column', alignItems: 'flex-start', gap: 10 }]}>
            <Text style={[sans, styles.problem, !tablet && { flex: 1 }]}>{p.problem}</Text>
            <View style={!tablet ? { flex: 1 } : undefined}>
              {tablet ? <Text style={[sans, styles.th, { marginBottom: 4 }]}>{t('tradePage.painConsequence').toUpperCase()}</Text> : null}
              <Text style={[sans, styles.body]}>{p.consequence}</Text>
            </View>
            <View style={!tablet ? { flex: 1 } : undefined}>
              {tablet ? <Text style={[sans, styles.th, { marginBottom: 4, color: site.copper }]}>{t('tradePage.painResponse').toUpperCase()}</Text> : null}
              <Text style={[sans, styles.body, { color: site.ink }]}>{p.response}</Text>
            </View>
          </View>
        ))}
      </Section>

      {/* Uses */}
      <Section>
        <SectionHead eyebrow={t('tradePage.usagesEyebrow')} plain={t('tradePage.usagesTitle', { trade: forTrade })} />
        <View style={styles.grid}>
          {trade.usages.map((u) => (
            <View key={u.title} style={[styles.card, { width: cellW }]}>
              <Feather name={u.icon} size={18} color={site.copper} />
              <Text style={[sans, styles.cardTitle]}>{u.title}</Text>
              <Text style={[sans, styles.body]}>{u.text}</Text>
            </View>
          ))}
        </View>
        {/* A day with Cantia */}
        <View style={[styles.scenario, phone && { padding: 24 }]}>
          <Text style={[serif, styles.quote]}>“</Text>
          <Text style={[sans, styles.scenarioTitle, phone && { fontSize: 20, lineHeight: 27 }]}>{trade.scenario.title}</Text>
          <Text style={[sans, styles.scenarioText]}>{trade.scenario.text}</Text>
        </View>
      </Section>

      {/* Before / with Cantia */}
      <Section white>
        <SectionHead eyebrow={t('tradePage.comparisonEyebrow')} plain={t('tradePage.comparisonAfter') + '.'} />
        <View style={[styles.row, styles.headRow]}>
          <Text style={[sans, styles.th, { flex: 1 }]}>{t('tradePage.comparisonBefore').toUpperCase()}</Text>
          <Text style={[sans, styles.th, { flex: 1, color: site.copper }]}>{t('tradePage.comparisonAfter').toUpperCase()}</Text>
        </View>
        {trade.comparison.map((r) => (
          <View key={r.before} style={styles.row}>
            <Text style={[sans, styles.body, styles.before, { flex: 1 }]}>{r.before}</Text>
            <Text style={[sans, styles.body, { flex: 1, color: site.ink, fontWeight: '500' }]}>{r.after}</Text>
          </View>
        ))}
      </Section>

      {/* Also included */}
      <Section>
        <SectionHead eyebrow={t('tradePage.secondaryEyebrow')} plain={L.toolsEyebrow + '.'} />
        <View style={styles.grid}>
          {SECONDARY.map((f) => (
            <View key={f.title} style={[styles.card, { width: cellW }]}>
              <Feather name={f.icon} size={17} color={site.copper} />
              <Text style={[sans, styles.cardTitle, { fontSize: 16 }]}>{f.title}</Text>
              <Text style={[sans, styles.body]}>{f.text}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 34 }}>
          <TextLink label={L.compare} href={`${pre}tarifs`} />
        </View>
      </Section>

      {/* Reading */}
      {relatedPosts.length ? (
        <Section white>
          <Eyebrow style={{ marginBottom: 22 }}>{t('tradePage.furtherReadingEyebrow')}</Eyebrow>
          {relatedPosts.map((post, i) => (
            <Link key={post!.slug} href={`${pre}blog/${post!.slug}` as any} asChild>
              <Hover accessibilityRole="link" base={[styles.postRow, i === relatedPosts.length - 1 && { borderBottomWidth: 1 }]} hover={{ opacity: 0.75 }}>
                <Text style={[sans, styles.postText]}>{post!.title}</Text>
                <Feather name="arrow-right" size={16} color={site.copper} />
              </Hover>
            </Link>
          ))}
        </Section>
      ) : null}

      {/* FAQ: answers stay in the page for search engines. */}
      <Section white={!relatedPosts.length}>
        <View style={styles.faq}>
          <Eyebrow>{L.faqEyebrow}</Eyebrow>
          <Headline plain={t('tradePage.faqEyebrow') + '.'} size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
          {trade.faq.map((f, i) => (
            <FaqItem key={f.question} q={f.question} a={f.answer} last={i === trade.faq.length - 1} />
          ))}
        </View>
      </Section>

      {/* Other trades */}
      {related.length ? (
        <Section white={!!relatedPosts.length}>
          <Eyebrow>{t('tradePage.seeAlsoEyebrow')}</Eyebrow>
          <View style={styles.chips}>
            {related.map((r) => (
              <Link key={r.slug} href={`${pre}${r.slug}` as any} asChild>
                <Hover accessibilityRole="link" base={styles.chip} hover={{ borderColor: site.copper }}>
                  <Text style={[sans, styles.chipText]}>{t('tradePage.seeAlsoTradeChip', { trade: r.tradeName })}</Text>
                </Hover>
              </Link>
            ))}
            <View style={{ justifyContent: 'center', marginLeft: 6 }}>
              <TextLink label={t('tradePage.seeAlsoAllTrades')} href={`${pre}metiers/${SECTOR_SLUGS[sectorKey]}`} size={12} />
            </View>
          </View>
        </Section>
      ) : null}

      {/* Closing */}
      <View style={[styles.cta, { paddingVertical: phone ? 40 : 58 }]}>
        <Wrap style={phone ? undefined : styles.ctaRow}>
          <View style={phone ? undefined : { flex: 1, maxWidth: 720 }}>
            <Headline plain={t(general ? 'tradePage.generalClosingTitle' : 'tradePage.closingTitle')} size={phone ? 30 : 36} color="#f4f3e9" />
            <Text style={[sans, { fontSize: 12, color: '#b2b9a7', marginTop: 15 }]}>{t('tradePage.closingText')}</Text>
          </View>
          <View style={phone ? { marginTop: 22 } : undefined}>
            <Btn label={t('tradePage.closingCta')} href={authHref('signup')} tone="sand" />
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
  lead: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  leadText: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 600 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 26 },
  trust: { fontSize: 10, color: '#8b9380', marginTop: 18 },
  row: { flexDirection: 'row', gap: 30, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: site.line },
  headRow: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: site.line },
  th: { fontSize: 9, letterSpacing: 1.3, color: site.muted, fontWeight: '600' },
  problem: { fontSize: 15, color: site.ink, fontWeight: '500', letterSpacing: -0.2, lineHeight: 22 },
  body: { fontSize: 12, color: site.muted, lineHeight: 22 },
  before: { textDecorationLine: 'line-through', textDecorationColor: '#c9c6b8' } as object,
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 34 },
  card: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 24 },
  cardTitle: { fontSize: 18, lineHeight: 25, letterSpacing: -0.3, color: site.ink, marginTop: 18, marginBottom: 10 },
  scenario: { marginTop: 56, backgroundColor: '#e7d8c5', borderRadius: 12, padding: 40 },
  quote: { fontSize: 60, lineHeight: 50, color: site.copper },
  scenarioTitle: { fontSize: 24, lineHeight: 31, letterSpacing: -0.6, color: site.ink, marginTop: 6, maxWidth: 760 },
  scenarioText: { fontSize: 13, lineHeight: 24, color: '#6e6352', marginTop: 14, maxWidth: 760 },
  postRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20, paddingVertical: 18, borderTopWidth: 1, borderColor: site.line },
  postText: { flex: 1, fontSize: 14, color: site.ink },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  chip: { borderWidth: 1, borderColor: site.line, borderRadius: 5, paddingVertical: 9, paddingHorizontal: 13, backgroundColor: site.white },
  chipText: { fontSize: 11, color: site.ink },
  cta: { backgroundColor: '#293128' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
});
