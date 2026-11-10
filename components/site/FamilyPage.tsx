import { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Hover, TextLink, Wrap } from './Primitives';
import { Breadcrumbs, DocVisual, Section, SectionHead, SitePage, paperShadow, useSiteLayout, usePrefix } from './Sections';
import { useSiteLocale } from './SiteNav';
import { SITE_COPY } from '../../lib/site/copy';
import { SITE_PAGES, type FamilyKey, type PageLabels } from '../../lib/site/pages';
import { sans, serif, site } from '../../lib/siteTheme';
import { authHref } from '../../lib/appHost';

type IconName = React.ComponentProps<typeof Feather>['name'];

// One icon per tool card, in the order of lib/site/pages.ts.
export const TOOL_ICONS: Record<FamilyKey, IconName[]> = {
  signer: ['users', 'book-open', 'file-text', 'edit-3', 'clipboard', 'trending-up'],
  organiser: ['folder', 'calendar', 'file', 'briefcase', 'lock', 'smartphone'],
  collaborer: ['message-circle', 'camera', 'clock', 'credit-card', 'user', 'shield'],
  facturer: ['repeat', 'grid', 'layers', 'check-circle', 'plus-circle', 'pen-tool'],
  piloter: ['shopping-bag', 'bar-chart-2', 'activity', 'refresh-cw', 'calendar', 'link'],
};

// Real exports from Cantia's own PDF renderer (sample data, Atelier Martin SA).
const DOCS = {
  signer: { source: require('../../assets/marketing/site/devis-signe.jpg'), ratio: 1221 / 1200 },
  collaborer: { source: require('../../assets/marketing/site/rapport-chantier.jpg'), ratio: 1247 / 1200 },
  facturerSlip: { source: require('../../assets/marketing/site/facture-qr-section.jpg'), ratio: 713 / 1400 },
  facturerFull: { source: require('../../assets/marketing/site/facture-qr.jpg'), ratio: 1696 / 1200 },
};
const PLANNING = {
  fr: { full: require('../../assets/marketing/site/planning-chantier.jpg') },
  de: { full: require('../../assets/marketing/site/planning-chantier-de.jpg') },
  it: { full: require('../../assets/marketing/site/planning-chantier-it.jpg') },
};
const PLANNING_FULL_RATIO = 501 / 2000;
const PDFS: Partial<Record<FamilyKey, string>> = {
  signer: '/exemples/devis-signe-cantia.pdf',
  organiser: '/exemples/planning-chantier-cantia.pdf',
  collaborer: '/exemples/rapport-chantier-cantia.pdf',
  facturer: '/exemples/facture-qr-cantia.pdf',
};

export function FamilyPage({ family }: { family: FamilyKey }) {
  const locale = useSiteLocale();
  const { labels: L, families } = SITE_PAGES[locale];
  const f = families[family];
  const copy = SITE_COPY[locale];
  const p = usePrefix();
  const { phone, tablet, width } = useSiteLayout();
  const scrollRef = useRef<ScrollView>(null);
  const anchors = useRef<Record<string, number>>({});
  const setAnchor = (k: string) => (y: number) => {
    anchors.current[k] = y;
  };
  const goTo = (k: string) => scrollRef.current?.scrollTo({ y: Math.max(0, (anchors.current[k] ?? 0) - 8), animated: true });

  const h1Size = phone ? 43 : tablet ? 46 : 56;

  return (
    <SitePage title={f.seoTitle} description={f.seoDescription} scrollRef={scrollRef}>
      {/* Hero */}
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 35 : 52 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: L.home, href: p || '/' }, { label: L.software, href: `${p}/fonctionnalites` }, { label: f.name }]} />
          <View style={[styles.leadGrid, phone ? { flexDirection: 'column', alignItems: 'stretch', gap: 30 } : { gap: tablet ? 40 : 70 }]}>
            <View style={phone ? undefined : { flex: 1.25, minWidth: 0 }}>
              <Eyebrow>{f.eyebrow}</Eyebrow>
              <Headline level={1} size={h1Size} plain={f.h1Plain} accent={f.h1Accent} inline={f.h1Plain.includes('\n')} style={[styles.h1, { letterSpacing: phone ? -1.9 : -3, lineHeight: h1Size * 1.07 }]} />
              <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{f.lead}</Text>
              <View style={[styles.actions, { gap: phone ? 23 : 25 }]}>
                <View>
                  <Btn label={L.tryCta} href={authHref('signup')} small={phone} />
                </View>
                <View>
                  <TextLink label={L.compare} href={`${p}/tarifs`} size={phone ? 11 : 12} />
                </View>
              </View>
              <View style={styles.tagRow}>
                {f.tags.map((t) => (
                  <Text key={t} style={[sans, styles.tag, phone && { fontSize: 8 }]}>
                    {t}
                  </Text>
                ))}
              </View>
            </View>
            {family === 'organiser' ? null : (
            <View style={phone ? undefined : { flex: 0.8, minWidth: 0 }}>
              <HeroVisual family={family} labels={L} />
              {family === 'signer' || family === 'collaborer' ? (
                <View style={{ marginTop: 16, alignItems: 'center' }}>
                  <OpenPdfLink label={L.openPdf} href={PDFS[family]!} />
                </View>
              ) : null}
            </View>
            )}
          </View>
          {family === 'organiser' ? (
            <View style={{ marginTop: phone ? 30 : 44 }}>
              <DocVisual source={PLANNING[locale].full} ratio={PLANNING_FULL_RATIO} alt={L.docAlt.organiser} caption={`${L.realExport} · ${L.sample}`} maxHeight={2000} />
              <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <Text style={[sans, styles.proofNote, { marginTop: 0, maxWidth: 640, fontSize: 11, lineHeight: 18 }]}>{L.planningShowcase.text}</Text>
                <OpenPdfLink label={L.openPdf} href={PDFS.organiser!} />
              </View>
            </View>
          ) : null}
        </Wrap>
      </View>

      {/* In-page navigation */}
      <Wrap>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.subnav, { gap: phone ? 22 : 28 }]} style={styles.subnavFrame}>
          {(['tools', 'steps', 'faq'] as const).map((k, i) => (
            <Hover key={k} onPress={() => goTo(k)} accessibilityRole="link" hover={{ opacity: 0.7 }}>
              {(hovered) => <Text style={[sans, styles.subnavText, phone && { fontSize: 10 }, hovered && { color: site.copper }]}>{L.subnav[i]}</Text>}
            </Hover>
          ))}
          <Link href={`${p}/tarifs` as any} asChild>
            <Hover accessibilityRole="link">{(hovered) => <Text style={[sans, styles.subnavText, phone && { fontSize: 10 }, hovered && { color: site.copper }]}>{L.subnav[3]}</Text>}</Hover>
          </Link>
        </ScrollView>
      </Wrap>

      {/* Tools */}
      <Section white onLayout={setAnchor('tools')} style={{ marginTop: phone ? 0 : 0 }}>
        <SectionHead eyebrow={L.toolsEyebrow} plain={f.toolsTitle} text={f.toolsNote} />
        <View style={[styles.grid3, phone && { flexDirection: 'column', gap: 20 }]}>
          {f.tools.map((tool, i) => (
            <View key={tool.title} style={[styles.detailCard, phone ? undefined : { width: width <= 900 ? '47%' : '30.5%' }]}>
              <Feather name={TOOL_ICONS[family][i]} size={18} color={site.copper} />
              <Text style={[sans, styles.detailTitle, phone && { fontSize: 21, marginTop: 13 }]}>{tool.title}</Text>
              <Text style={[sans, styles.detailText]}>{tool.text}</Text>
              {tool.badge ? <Text style={[sans, styles.badge]}>{tool.badge}</Text> : null}
              {tool.more ? (
                <View style={{ marginTop: 14 }}>
                  <TextLink label={L.more} href={`${p}/${tool.more}`} size={11} color={site.copper} />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </Section>

      {/* Steps */}
      <Section onLayout={setAnchor('steps')}>
        <SectionHead eyebrow={L.stepsEyebrow} plain={L.stepsTitle} />
        <View style={[styles.steps, phone && { flexDirection: 'column', gap: 10 }]}>
          {f.steps.map((s, i) => (
            <View key={s.title} style={[styles.step, phone ? styles.stepPhone : { flex: 1 }]}>
              <Text style={[serif, styles.stepNum, phone && { fontSize: 28, width: 40 }]}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={phone ? { flex: 1 } : undefined}>
                <Text style={[sans, styles.stepTitle, phone && { marginTop: 4 }]}>{s.title}</Text>
                <Text style={[sans, styles.stepText]}>{s.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>

      {family === 'facturer' ? (
        <Section white>
          <View style={[styles.showcase, phone ? { flexDirection: 'column', alignItems: 'stretch', gap: 30 } : { gap: tablet ? 40 : 70 }]}>
            <View style={phone ? undefined : { flex: 1 }}>
              <DocVisual source={DOCS.facturerFull.source} ratio={DOCS.facturerFull.ratio} alt={L.docAlt.facturer} maxHeight={phone ? 380 : 460} />
              <View style={{ marginTop: 18, alignItems: 'center' }}>
                <OpenPdfLink label={L.openPdf} href={PDFS.facturer!} />
              </View>
            </View>
            <View style={phone ? undefined : { flex: 0.8 }}>
              <Eyebrow>{L.showcaseEyebrow}</Eyebrow>
              <Headline plain={L.showcasePlain} accent={L.showcaseAccent} size={phone ? 32 : 42} style={{ marginTop: 15, marginBottom: 22 }} />
              <Text style={[sans, styles.copy]}>{L.showcaseText}</Text>
              <Text style={[sans, styles.proofNote]}>{L.showcaseNote}</Text>
            </View>
          </View>
        </Section>
      ) : null}

      {/* FAQ */}
      <Section onLayout={setAnchor('faq')}>
        <View style={styles.faq}>
          <Eyebrow>{L.faqEyebrow}</Eyebrow>
          <Headline plain={L.faqTitle} size={phone ? 32 : 42} style={{ marginTop: 15, marginBottom: 30 }} />
          {f.faq.map((q, i) => (
            <FaqItem key={q.q} q={q.q} a={q.a} last={i === f.faq.length - 1} />
          ))}
        </View>
      </Section>

      {/* Related */}
      <Section white>
        <SectionHead eyebrow={L.relatedEyebrow} plain={L.relatedTitle} />
        <View style={[styles.related, phone && { flexDirection: 'column', gap: 12 }]}>
          {f.related.map((k) => {
            const fam = copy.families.find((x) => x.key === k)!;
            return (
              <Link key={k} href={`${p}/${k}` as any} asChild>
                <Hover accessibilityRole="link" base={[styles.relatedCard, phone ? { padding: 23 } : { flex: 1 }]} hover={{ borderColor: site.copper }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[sans, styles.relatedName]}>{fam.name}</Text>
                    <Text style={[sans, styles.relatedText]}>{fam.text}</Text>
                  </View>
                  <Feather name="arrow-right" size={18} color={site.ink} />
                </Hover>
              </Link>
            );
          })}
        </View>
      </Section>
    </SitePage>
  );
}

function OpenPdfLink({ label, href }: { label: string; href: string }) {
  const open = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(href, '_blank', 'noopener');
  };
  return (
    <Hover onPress={open} accessibilityRole="link" base={styles.inlineLink} hover={{ opacity: 0.75 }}>
      <Text style={[sans, { fontSize: 12, fontWeight: '600', color: site.ink }]}>{label}</Text>
      <Feather name="external-link" size={14} color={site.ink} />
    </Hover>
  );
}

export function FaqItem({ q, a, last }: { q: string; a: string; last?: boolean }) {
  const [open, setOpen] = useState(false);
  const { phone } = useSiteLayout();
  return (
    <View style={[styles.faqItem, last && { borderBottomWidth: 1 }]}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" aria-expanded={open} style={styles.faqQ}>
        <Text style={[sans, styles.faqQText, phone && { fontSize: 12, lineHeight: 19 }]}>{q}</Text>
        <Text style={[sans, styles.faqSign]}>{open ? '−' : '+'}</Text>
      </Pressable>
      {/* Kept in the page when closed so the answer stays readable by search engines. */}
      <Text style={[sans, styles.faqA, phone && { fontSize: 11 }, !open && styles.hidden]}>{a}</Text>
    </View>
  );
}

function HeroVisual({ family, labels: L }: { family: FamilyKey; labels: PageLabels }) {
  const { phone } = useSiteLayout();
  if (family === 'signer') return <DocVisual source={DOCS.signer.source} ratio={DOCS.signer.ratio} alt={L.docAlt.signer} caption={`${L.realExport} · ${L.sample}`} maxHeight={phone ? 330 : 380} />;
  if (family === 'collaborer') return <DocVisual source={DOCS.collaborer.source} ratio={DOCS.collaborer.ratio} alt={L.docAlt.collaborer} caption={`${L.realExport} · ${L.sample}`} maxHeight={phone ? 330 : 380} />;
  if (family === 'facturer') return <DocVisual source={DOCS.facturerSlip.source} ratio={DOCS.facturerSlip.ratio} alt={L.docAlt.facturer} caption={`${L.realExport} · ${L.sample}`} maxHeight={300} />;
  return <TreasuryPaper labels={L} />;
}

function PaperFrame({ children }: { children: React.ReactNode }) {
  const { phone } = useSiteLayout();
  return (
    <View style={[styles.visual, { padding: phone ? 22 : 30 }]}>
      <View style={[styles.paperCard, paperShadow, phone && { padding: 20 }]}>{children}</View>
    </View>
  );
}

function TreasuryPaper({ labels: L }: { labels: PageLabels }) {
  const t = L.treasury;
  return (
    <PaperFrame>
      <View style={styles.paperTop}>
        <Text style={[sans, styles.paperTopText]}>{t.tag}</Text>
        <Text style={[sans, styles.paperTopText]}>{t.horizon}</Text>
      </View>
      <Text style={[sans, styles.paperTitle, { fontVariant: ['tabular-nums'] }]}>{t.amount}</Text>
      <Text style={[sans, styles.paperSub]}>{t.sub}</Text>
      {t.lines.map(([label, value]) => (
        <View key={label} style={styles.paperLine}>
          <Text style={[sans, styles.paperLineText]}>{label}</Text>
          <Text style={[sans, styles.paperLineText, { fontVariant: ['tabular-nums'] }]}>{value}</Text>
        </View>
      ))}
      <View style={styles.paperLine}>
        <Text style={[sans, styles.paperLineText, styles.paperTotal]}>{t.total[0]}</Text>
        <Text style={[sans, styles.paperLineText, styles.paperTotal, { fontVariant: ['tabular-nums'] }]}>{t.total[1]}</Text>
      </View>
      <Text style={[sans, styles.paperCaption]}>{t.caption}</Text>
    </PaperFrame>
  );
}

const styles = StyleSheet.create({
  leadGrid: { flexDirection: 'row', alignItems: 'center' },
  h1: { marginTop: 17, marginBottom: 21, fontWeight: '400', maxWidth: 850 },
  lead: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 610 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 26 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 24 },
  tag: { fontSize: 9, color: '#777e6c', borderWidth: 1, borderColor: site.line, borderRadius: 3, paddingVertical: 5, paddingHorizontal: 9 },
  subnavFrame: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: site.line },
  subnav: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  subnavText: { fontSize: 11, color: site.ink },
  grid3: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 30, rowGap: 30, justifyContent: 'space-between' },
  detailCard: { borderTopWidth: 1, borderTopColor: site.line, paddingTop: 25 },
  detailTitle: { fontSize: 18, lineHeight: 25, letterSpacing: -0.3, color: site.ink, marginTop: 20, marginBottom: 11 },
  detailText: { fontSize: 12, color: site.muted, lineHeight: 23, maxWidth: 500 },
  badge: { alignSelf: 'flex-start', marginTop: 12, fontSize: 8, color: site.copper, borderWidth: 1, borderColor: '#d4b79d', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 3 },
  steps: { flexDirection: 'row', gap: 35 },
  step: { borderTopWidth: 1, borderTopColor: site.line, paddingVertical: 22 },
  stepPhone: { flexDirection: 'row', gap: 12, paddingVertical: 18 },
  stepNum: { fontSize: 32, color: site.copper, lineHeight: 38 },
  stepTitle: { fontSize: 17, fontWeight: '500', letterSpacing: -0.4, color: site.ink, marginTop: 12, marginBottom: 8 },
  stepText: { fontSize: 12, color: site.muted, lineHeight: 22 },
  showcase: { flexDirection: 'row', alignItems: 'center' },
  showcaseHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 60, marginBottom: 35 },
  copy: { fontSize: 14, color: site.muted, lineHeight: 27, maxWidth: 390 },
  proofNote: { fontSize: 9, color: '#8b9380', marginTop: 15 },
  inlineLink: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center' },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
  faqItem: { borderTopWidth: 1, borderColor: site.line, paddingVertical: 20 },
  faqQ: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20 },
  faqQText: { fontSize: 13, color: site.ink, flex: 1 },
  faqSign: { fontSize: 20, color: site.copper, width: 16, textAlign: 'center' },
  faqA: { fontSize: 12, lineHeight: 23, maxWidth: 680, color: site.muted, marginTop: 12 },
  hidden: { display: 'none' },
  related: { flexDirection: 'row', gap: 20 },
  relatedCard: { padding: 28, borderWidth: 1, borderColor: site.line, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: site.white, gap: 20 },
  relatedName: { fontSize: 17, color: site.ink },
  relatedText: { fontSize: 11, color: site.muted, marginTop: 7 },
  visual: { backgroundColor: '#e7e4d8', borderRadius: 10, minHeight: 330, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  paperCard: { backgroundColor: '#ffffff', width: '100%', padding: 24, borderWidth: 1, borderColor: '#deded3', borderRadius: 5 },
  paperTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  paperTopText: { fontSize: 8, color: site.copper, fontWeight: '600', letterSpacing: 1 },
  paperTitle: { fontSize: 23, letterSpacing: -0.7, color: site.ink, marginTop: 26, marginBottom: 4 },
  paperSub: { fontSize: 9, lineHeight: 14, color: '#9da18e', marginBottom: 12 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#eceee5' },
  hoursName: { flex: 1, fontSize: 9, color: site.ink },
  hoursHead: { width: 26, textAlign: 'center', fontSize: 8, color: '#9da18e' },
  cell: { width: 26, height: 24, borderRadius: 3, backgroundColor: '#e7eddc', alignItems: 'center', justifyContent: 'center' },
  cellBlank: { backgroundColor: '#f1f2ec' },
  cellText: { fontSize: 7, color: '#7c896a', fontWeight: '600' },
  paperLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14, borderTopWidth: 1, borderTopColor: '#eceee5', paddingVertical: 11 },
  paperLineText: { fontSize: 10, color: site.ink },
  paperTotal: { color: site.copper, fontWeight: '600' },
  paperCaption: { fontSize: 7, color: '#a0a28f', borderTopWidth: 1, borderTopColor: '#e8ebde', paddingTop: 15, marginTop: 4, letterSpacing: 0.3 },
});
