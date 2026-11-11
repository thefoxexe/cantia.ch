import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container } from './ui';
import { Heading } from './Heading';
import { CtaButton } from './landing/CtaButton';
import { Breadcrumbs, Section, SitePage, useSiteLayout } from './site/Sections';
import { Eyebrow, Headline, Hover, Wrap } from './site/Primitives';
import { FaqItem } from './site/FamilyPage';
import { BUILDING_TRADES, SECTORS_COPY, sectorHref, type SectorKey } from '../lib/site/sectors';
import { SITE_PAGES } from '../lib/site/pages';
import { sans, site } from '../lib/siteTheme';
import { BlogLeadMagnet } from './BlogLeadMagnet';
import { colors, fontSize, radius, spacing } from '../lib/theme';
const DM = "'DM Sans', 'DM Sans Fallback', Arial, sans-serif";
import { authHref } from '../lib/appHost';
import { trackBlogCtaClick } from '../lib/blogAnalytics';
import { BlogPost } from '../lib/blog/types';
import { getRelatedPosts } from '../lib/blog';
import { blogHref } from '../lib/blog/triage';

// Same name as the Article author in scripts/seo-routes.mjs (JSON-LD).
const BLOG_AUTHOR = 'Bastien';
import { getAppLocale, useTranslation } from '../lib/translations';

const CATEGORY_ICON: Record<BlogPost['category'], keyof typeof Feather.glyphMap> = {
  'Devis & facturation': 'file-text',
  'Juridique & normes': 'shield',
  'RH & salaires': 'users',
  'Chantier & rentabilité': 'trending-up',
  'Comparatifs & outils': 'layers',
  'Métiers du bâtiment': 'tool',
  'Croissance & acquisition': 'target',
  'Sur-mesure & automatisations': 'sliders',
  'Services & autres métiers': 'briefcase',
};

// Closing-CTA copy tailored per article category, used only for locale ===
// 'fr' (every article is authored in French first; DE/IT keep the generic
// translated closing CTA below rather than needing 24 more translated
// strings for content that, for now, mostly falls back to the FR post
// anyway). Absent categories fall back to the generic copy too.
const CATEGORY_CLOSING_FR: Partial<Record<BlogPost['category'], { title: string; text: string; cta: string }>> = {
  'Devis & facturation': {
    title: 'Vos devis et factures, sans ressaisie',
    text: 'Cantia calcule TVA et totaux automatiquement, génère la QR-facture, et enregistre chaque position dans votre catalogue de prix.',
    cta: 'Essayer 14 jours',
  },
  'Juridique & normes': {
    title: 'Le juridique réglé, la gestion simplifiée',
    text: 'Une fois le statut et les démarches en ordre, Cantia prend le relais pour les devis, factures et le suivi conforme au quotidien.',
    cta: 'Essayer 14 jours',
  },
  'RH & salaires': {
    title: 'La paie du bâtiment, sans tableur',
    text: 'Cantia calcule salaires, 13e, heures supplémentaires et vacances selon les règles suisses, chantier après chantier.',
    cta: 'Découvrir le module RH',
  },
  'Chantier & rentabilité': {
    title: 'Sachez enfin ce que chaque chantier rapporte',
    text: 'Cantia suit les coûts et les encaissements chantier par chantier, en temps réel, pas seulement en fin d’année.',
    cta: 'Découvrir la rentabilité',
  },
  'Comparatifs & outils': {
    title: 'Le seul outil qu’il vous faut vraiment',
    text: 'Devis, factures, chantiers et RH réunis dans un seul endroit, pensé pour le bâtiment suisse dès le premier jour.',
    cta: 'Essayer 14 jours',
  },
  'Métiers du bâtiment': {
    title: 'Un outil qui s’adapte à votre métier',
    text: 'Cantia s’ajuste aux besoins spécifiques de votre corps de métier, pas l’inverse.',
    cta: 'Essayer 14 jours',
  },
  'Croissance & acquisition': {
    title: 'Transformez plus de devis en chantiers',
    text: 'Répondez plus vite, suivez vos relances et donnez une image professionnelle à chaque interaction client.',
    cta: 'Essayer 14 jours',
  },
  'Services & autres métiers': {
    title: 'Devis, heures et factures, quel que soit votre métier',
    text: 'Cantia parle de projets, de mandats ou de dossiers si vous n’avez pas de chantiers : mêmes outils, vos mots.',
    cta: 'Essayer 14 jours',
  },
  'Sur-mesure & automatisations': {
    title: 'Un logiciel construit avec vous',
    text: 'Au-delà du standard, Cantia peut s’adapter à des besoins spécifiques à votre entreprise, sur demande.',
    cta: 'Discuter d’un besoin sur mesure',
  },
};

// The sector page an article belongs to: from its trade when it has one
// (the merged trades of lib/blog/triage.json), else from words in its slug,
// else the building sector, which most of the blog is about.
const TRADE_SECTOR: Record<string, SectorKey> = {
  'entreprise-nettoyage': 'services', conciergerie: 'services', garagiste: 'services', demenageur: 'services',
  informaticien: 'etudes', consultant: 'etudes', formateur: 'etudes',
  graphiste: 'creatifs', photographe: 'creatifs', traiteur: 'creatifs',
};
// The trade page inside the sector, for the merged trades.
const TRADE_SUB: Record<string, string> = {
  'entreprise-nettoyage': 'entreprise-nettoyage', conciergerie: 'conciergerie', garagiste: 'garage', demenageur: 'demenageur',
  informaticien: 'informaticien-formateur', formateur: 'informaticien-formateur', consultant: 'consultant',
  graphiste: 'graphiste', photographe: 'photographe-videaste', traiteur: 'traiteur',
};
function sectorOfPost(post: BlogPost): SectorKey {
  if (post.relatedTradeSlug && TRADE_SECTOR[post.relatedTradeSlug]) return TRADE_SECTOR[post.relatedTradeSlug];
  const s = post.slug;
  if (/nettoyage|conciergerie|gerance|entretien|demenag|garage|informatique/.test(s)) return 'services';
  if (/graphiste|photograph|traiteur|evenementiel|agence|studio/.test(s)) return 'creatifs';
  if (/ingenieur|architecte|bureau-etudes|geometre|consultant|formateur/.test(s)) return 'etudes';
  return 'batiment';
}

export function BlogArticle({ post }: { post: BlogPost }) {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(`${locale}-CH`, { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const heroAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [heroAnim]);

  const related = getRelatedPosts(post, 3, locale);
  const tradeHrefPrefix = locale === 'de' ? '/de/' : locale === 'it' ? '/it/' : '/';
  const blogHrefPrefix = `${tradeHrefPrefix}blog`;
  const sector = sectorOfPost(post);
  const siteLocale = locale === 'de' || locale === 'it' ? locale : 'fr';
  const sectorUrl = sectorHref(tradeHrefPrefix === '/' ? '' : tradeHrefPrefix.slice(0, -1), sector);
  const subSlug = post.relatedTradeSlug ? TRADE_SUB[post.relatedTradeSlug] : undefined;
  const subTrade = subSlug ? SECTORS_COPY[siteLocale][sector].trades.find((tr) => tr.sub === subSlug) : undefined;
  const categoryClosing = locale === 'fr' ? CATEGORY_CLOSING_FR[post.category] : undefined;
  const closing = {
    title: categoryClosing?.title ?? t('blogArticlePage.closingTitle'),
    text: categoryClosing?.text ?? t('blogArticlePage.closingText'),
    cta: categoryClosing?.cta ?? t('blogArticlePage.closingCta'),
  };

  const L = SITE_PAGES[(locale as 'fr' | 'de' | 'it')] ?? SITE_PAGES.fr;
  return (
    <SitePage title={`${post.title} | Cantia`} description={post.question} cta={false}>
      <ArticleBody
        post={post}
        crumbs={[{ label: L.labels.home, href: tradeHrefPrefix === '/' ? '/' : tradeHrefPrefix.slice(0, -1) }, { label: 'Blog', href: blogHrefPrefix }, { label: t(`blogCategories.${post.category}`) }]}
        category={t(`blogCategories.${post.category}`)}
        meta={`${t('blogArticlePage.byAuthor', { name: BLOG_AUTHOR })} · ${formatDate(post.publishedAt)} · ${t('blogArticlePage.minRead', { count: post.readMinutes })}`}
      >
        {post.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} sourceSlug={post.slug} category={post.category} />
        ))}

        {post.faq?.length ? (
          <View style={{ marginTop: 40 }}>
            <Eyebrow>{t('blogArticlePage.faqEyebrow')}</Eyebrow>
            <View style={{ marginTop: 18 }}>
              {post.faq.map((f, i) => (
                <FaqItem key={f.question} q={f.question} a={f.answer} last={i === post.faq!.length - 1} />
              ))}
            </View>
          </View>
        ) : null}

        {post.relatedTradeSlug && BUILDING_TRADES.includes(post.relatedTradeSlug) ? (
          <Link href={`${tradeHrefPrefix}${post.relatedTradeSlug}` as any} asChild>
            <Hover accessibilityRole="link" base={styles2.trade} hover={{ borderColor: site.copper }}>
              <Feather name="tool" size={16} color={site.copper} />
              <Text style={[sans, styles2.tradeText]}>{t('blogArticlePage.tradeLinkText')}</Text>
              <Feather name="arrow-right" size={15} color={site.ink} />
            </Hover>
          </Link>
        ) : null}

        {/* Every article points to the sector page it belongs to. */}
        <Link href={(subTrade ? `${sectorUrl}/${subTrade.sub}` : sectorUrl) as any} asChild>
          <Hover accessibilityRole="link" base={[styles2.trade, { marginTop: 12 }]} hover={{ borderColor: site.copper }}>
            <Feather name="briefcase" size={16} color={site.copper} />
            <Text style={[sans, styles2.tradeText]}>{t('blogArticlePage.sectorLinkText', { sector: subTrade?.name ?? SECTORS_COPY[siteLocale][sector].label })}</Text>
            <Feather name="arrow-right" size={15} color={site.ink} />
          </Hover>
        </Link>
      </ArticleBody>

      {related.length ? (
        <Section white>
          <Eyebrow>{t('blogArticlePage.seeAlsoEyebrow')}</Eyebrow>
          <View style={[styles2.related, { marginTop: 24 }]}>
            {related.map((r) => (
              <Link key={r.slug} href={`${blogHrefPrefix}/${r.slug}` as any} asChild>
                <Hover accessibilityRole="link" base={styles2.relCard} hover={{ opacity: 0.8 }}>
                  <Text style={[sans, styles2.relCat]}>{t(`blogCategories.${r.category}`).toUpperCase()}</Text>
                  <Text style={[sans, styles2.relTitle]}>{r.title}</Text>
                  <View style={styles2.relMore}>
                    <Text style={[sans, styles2.relMoreText]}>{t('blogArticlePage.readArticle')}</Text>
                    <Feather name="arrow-right" size={13} color={site.copper} />
                  </View>
                </Hover>
              </Link>
            ))}
          </View>
        </Section>
      ) : null}

      <View style={styles2.cta}>
        <Wrap style={styles2.ctaRow}>
          <View style={{ flex: 1, minWidth: 260, maxWidth: 720 }}>
            <Headline plain={closing.title} size={34} color="#f4f3e9" />
            <Text style={[sans, styles2.ctaText]}>{closing.text}</Text>
          </View>
          <Link href={authHref('signup')} asChild onPress={() => trackBlogCtaClick(post.slug, post.category, 'closing')}>
            <Hover accessibilityRole="link" base={styles2.ctaBtn} hover={{ backgroundColor: '#e2d0b9' }}>
              <Text style={[sans, styles2.ctaBtnText]}>{closing.cta}</Text>
              <Feather name="arrow-right" size={15} color={site.ink} />
            </Hover>
          </Link>
        </Wrap>
      </View>
    </SitePage>
  );
}

// Article column: breadcrumbs, title, question, author line, then the body.
function ArticleBody({ post, crumbs, category, meta, children }: { post: BlogPost; crumbs: { label: string; href?: string }[]; category: string; meta: string; children: ReactNode }) {
  const { phone, tablet } = useSiteLayout();
  return (
    <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 50 : 80 }}>
      <Wrap>
        <Breadcrumbs items={crumbs} />
        <View style={styles2.column}>
          <Eyebrow style={{ marginTop: phone ? 24 : 32 }}>{category}</Eyebrow>
          <Headline level={1} plain={post.title} size={phone ? 34 : tablet ? 42 : 50} style={{ marginTop: 16 }} />
          <Text style={[sans, styles2.question, phone && { fontSize: 16, lineHeight: 26 }]}>{post.question}</Text>
          <Text style={[sans, styles2.meta]}>{meta}</Text>
          <View style={styles2.body}>{children}</View>
        </View>
      </Wrap>
    </View>
  );
}

const styles2 = StyleSheet.create({
  column: { width: '100%', maxWidth: 780 },
  question: { fontSize: 18, lineHeight: 29, color: site.muted, marginTop: 18 },
  meta: { fontSize: 11, color: '#8b9380', marginTop: 22, paddingTop: 16, borderTopWidth: 1, borderTopColor: site.line },
  body: { marginTop: 30, gap: 22 },
  trade: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderWidth: 1, borderColor: site.line, borderRadius: 8, backgroundColor: site.white, marginTop: 30 },
  tradeText: { flex: 1, fontSize: 13, color: site.ink },
  related: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  relCard: { flex: 1, minWidth: 240, borderTopWidth: 1, borderTopColor: site.line, paddingTop: 18 },
  relCat: { fontSize: 9, letterSpacing: 1.4, color: site.copper, fontWeight: '600' },
  relTitle: { fontSize: 17, lineHeight: 24, color: site.ink, letterSpacing: -0.3, marginTop: 10 },
  relMore: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  relMoreText: { fontSize: 12, color: site.copper, fontWeight: '600' },
  cta: { backgroundColor: '#293128', paddingVertical: 56 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 28 },
  ctaText: { fontSize: 12, color: '#b2b9a7', marginTop: 14, lineHeight: 21 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 22, backgroundColor: '#e7d8c5', borderRadius: 5, paddingVertical: 14, paddingHorizontal: 20 },
  ctaBtnText: { fontSize: 13, fontWeight: '600', color: site.ink },
});

function BlockRenderer({
  block,
  sourceSlug,
  category,
}: {
  block: BlogPost['blocks'][number];
  sourceSlug: string;
  category: string;
}) {
  switch (block.type) {
    case 'p':
      return <Text style={styles.paragraph}>{block.text}</Text>;
    case 'h2':
      return <Heading level={2} style={styles.h2}>{block.text}</Heading>;
    case 'list':
      return (
        <View style={styles.list}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <View style={styles.listBullet}>
                {block.ordered ? <Text style={styles.listBulletNum}>{i + 1}</Text> : <View style={styles.listDot} />}
              </View>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case 'callout':
      return (
        <View style={styles.callout}>
          <Feather name="info" size={16} color={site.ink} style={styles.calloutIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.calloutTitle}>{block.title}</Text>
            <Text style={styles.calloutText}>{block.text}</Text>
          </View>
        </View>
      );
    case 'stat':
      return (
        <View style={styles.stat}>
          <Text style={styles.statValue}>{block.value}</Text>
          <Text style={styles.statLabel}>{block.label}</Text>
        </View>
      );
    case 'table':
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeadRow]}>
              {block.headers.map((h, i) => (
                <Text key={i} style={[styles.tableCell, styles.tableHeadCell]}>
                  {h}
                </Text>
              ))}
            </View>
            {block.rows.map((row, ri) => (
              <View key={ri} style={[styles.tableRow, ri === block.rows.length - 1 && styles.tableRowLast]}>
                {row.map((cell, ci) => (
                  <Text key={ci} style={styles.tableCell}>
                    {cell}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    case 'cta':
      return (
        <View style={styles.inlineCta}>
          <View style={{ flex: 1, minWidth: 220 }}>
            <Text style={styles.inlineCtaTitle}>{block.title}</Text>
            <Text style={styles.inlineCtaText}>{block.text}</Text>
          </View>
          <Link href={authHref('signup')} asChild>
            <CtaButton title={block.buttonLabel} onPress={() => trackBlogCtaClick(sourceSlug, category, 'inline')} />
          </Link>
        </View>
      );
    case 'linklist':
      return <LinkListBlock block={block} />;
    case 'leadmagnet':
      return <BlogLeadMagnet block={block} sourceSlug={sourceSlug} category={category} />;
    default:
      return null;
  }
}

function LinkListBlock({ block }: { block: Extract<BlogPost['blocks'][number], { type: 'linklist' }> }) {
  const locale = getAppLocale();
  // Links follow merged articles (lib/blog/triage.ts); two links that now
  // lead to the same page are shown once.
  const items = block.items
    .map((item) => ({ ...item, href: blogHref(item.slug, locale) }))
    .filter((item, i, all) => all.findIndex((o) => o.href === item.href) === i);
  return (
    <View style={styles.linklist}>
      <Text style={styles.linklistTitle}>{block.title}</Text>
      <View style={styles.linklistItems}>
        {items.map((item) => (
          <Link key={item.href} href={item.href as any} asChild>
            <Pressable style={styles.linklistRow}>
              <Text style={styles.linklistRowText}>{item.label}</Text>
              <Feather name="arrow-right" size={13} color={site.copper} />
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  heroOuter: { maxWidth: 820, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.lg },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  backLinkText: {
    fontFamily: DM,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: site.copper,
  },
  kickerPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: spacing.lg },
  kickerText: { fontFamily: DM, fontSize: 11, color: site.copper, textTransform: 'uppercase', letterSpacing: 0.4 },
  title: { fontFamily: DM, fontSize: 58, fontWeight: '500', color: site.ink, lineHeight: 58, marginTop: 0, marginBottom: 0 } as unknown as ViewStyle,
  question: { fontFamily: DM, fontSize: 19, color: site.muted, marginTop: spacing.lg, lineHeight: 29 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, paddingTop: spacing.md, borderTopWidth: 1.5, borderTopColor: site.ink },
  metaText: { fontFamily: DM, fontSize: 10.5, color: site.muted, textTransform: 'uppercase', letterSpacing: 0.3 },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: site.line,
  },
  body: { maxWidth: 820, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md, gap: spacing.lg },
  paragraph: { fontFamily: DM, fontSize: 18, color: site.ink, lineHeight: 30 },
  h2: { fontFamily: DM, fontSize: 34, lineHeight: 36, fontWeight: '500', color: site.ink, marginTop: spacing.xl } as unknown as ViewStyle,
  list: {
    gap: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  listBullet: {
    width: 20,
    height: 20,
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: site.copper,
  },
  listBulletNum: {
    fontFamily: DM,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: site.copper,
  },
  listText: {
    flex: 1,
    fontFamily: DM,
    fontSize: fontSize.md,
    color: site.ink,
    lineHeight: 24,
  },
  callout: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#f3e6da',
    borderRadius: 3,
    padding: spacing.lg,
  },
  calloutIcon: {
    marginTop: 2,
  },
  calloutTitle: {
    fontFamily: DM,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: site.ink,
    marginBottom: 4,
  },
  calloutText: {
    fontFamily: DM,
    fontSize: fontSize.sm,
    color: site.ink,
    lineHeight: 21,
    opacity: 0.9,
  },
  stat: {
    borderLeftWidth: 3,
    borderLeftColor: site.copper,
    paddingLeft: spacing.lg,
    paddingVertical: spacing.xs,
  },
  statValue: {
    fontFamily: DM,
    fontSize: 30,
    fontWeight: '600',
    color: site.ink,
  } as unknown as ViewStyle,
  statLabel: {
    fontFamily: DM,
    fontSize: fontSize.sm,
    color: site.muted,
    marginTop: 2,
  },
  tableScroll: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: site.line,
  },
  table: {
    minWidth: 480,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: site.line,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableHeadRow: {
    backgroundColor: '#efede5',
  },
  tableCell: {
    flex: 1,
    minWidth: 130,
    fontFamily: DM,
    fontSize: fontSize.sm,
    color: site.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tableHeadCell: {
    fontWeight: '700',
    color: site.muted,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inlineCta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.lg, borderLeftWidth: 2, borderLeftColor: site.copper, paddingLeft: spacing.lg, paddingVertical: spacing.sm },
  inlineCtaTitle: { fontFamily: DM, fontSize: 17, fontWeight: '700', color: site.ink },
  inlineCtaText: { fontFamily: DM, fontSize: 15, color: site.muted, marginTop: 2, lineHeight: 22 },
  linklist: { borderTopWidth: 1.5, borderTopColor: site.ink, paddingTop: spacing.md, gap: spacing.sm },
  linklistTitle: {
    fontFamily: DM,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: site.ink,
    marginBottom: 2,
  },
  linklistItems: {
    gap: 2,
  },
  linklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: site.line,
  },
  linklistRowText: {
    flex: 1,
    fontFamily: DM,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: site.ink,
    lineHeight: 20,
  },
  section: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  sectionEyebrow: {
    fontFamily: DM,
    fontSize: fontSize.xs,
    color: site.copper,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.lg,
  },
  faqList: {},
  faqRow: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: site.line,
    gap: 6,
  },
  faqRowLast: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    fontFamily: DM,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: site.ink,
  },
  faqAnswer: {
    fontFamily: DM,
    fontSize: fontSize.sm,
    color: site.muted,
    lineHeight: 21,
  },
  tradeLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 3,
    backgroundColor: '#f3e6da',
  },
  tradeLinkText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: site.ink,
  },
  tradeLinkTextAccent: {
    color: site.copper,
  },
  relatedGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xxl, borderTopWidth: 1.5, borderTopColor: site.ink },
  relatedCard: { flexGrow: 1, flexBasis: 260, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#D8C8B0', gap: spacing.xs },
  relatedCardHovered: {},
  relatedCategory: {
    fontFamily: DM,
    fontSize: fontSize.xs,
    color: site.copper,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  relatedTitle: { fontFamily: DM, fontSize: 17, fontWeight: '700', color: site.ink, lineHeight: 23 },
  relatedMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  relatedMoreText: {
    fontFamily: DM,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: site.copper,
  },
  closingOuter: { width: '100%', paddingTop: spacing.xxl },
  closing: { backgroundColor: site.ink, paddingHorizontal: spacing.xl, paddingVertical: 96, alignItems: 'center' },
  closingTitle: { fontFamily: DM, fontSize: 48, lineHeight: 48, fontWeight: '500', color: '#f4f3e9', maxWidth: 1192, width: '100%' } as unknown as ViewStyle,
  closingText: { fontFamily: DM, fontSize: 17, color: '#D5C8B8', marginTop: spacing.md, lineHeight: 27, maxWidth: 1192, width: '100%' },
  closingCta: {
    marginTop: spacing.xl,
    borderWidth: 0,
  },
});
