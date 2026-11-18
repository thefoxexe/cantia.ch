import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Hover, TextLink, Wrap } from './Primitives';
import { Breadcrumbs, Section, SectionHead, SitePage, useSiteLayout, usePrefix } from './Sections';
import { FaqItem } from './FamilyPage';
import { ModuleMockup } from '../solutions/ModuleMockup';
import { OFFER_LANDING, type OfferLocale } from '../../lib/site/offerLanding';
import { sans, site } from '../../lib/siteTheme';
import { authHref } from '../../lib/appHost';

const HOME = { de: 'Startseite', it: 'Home' } as const;

// /de/offerte-erstellen and /it/creare-preventivo (lib/site/offerLanding.ts):
// the quote page of each language, with steps, what goes on a quote, a free
// template, the way to the QR invoice, an honest comparison and a FAQ.
export function OfferLandingPage({ locale }: { locale: OfferLocale }) {
  const c = OFFER_LANDING[locale];
  const p = usePrefix();
  const { phone, tablet } = useSiteLayout();
  const h1Size = phone ? 36 : tablet ? 44 : 52;

  return (
    <SitePage title={c.seoTitle} description={c.seoDescription} cta={false}>
      {/* Hero */}
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 40 : 70 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: HOME[locale], href: p || '/' }, { label: c.crumbSoftware, href: `${p}/fonctionnalites` }, { label: c.crumb }]} />
          <View style={[styles.leadGrid, phone ? { flexDirection: 'column', alignItems: 'stretch', gap: 32 } : { gap: tablet ? 40 : 70 }]}>
            <View style={phone ? undefined : { flex: 1.1, minWidth: 0 }}>
              <Eyebrow>{c.kicker}</Eyebrow>
              <Headline level={1} size={h1Size} plain={c.h1Plain} accent={c.h1Accent} style={{ marginTop: 17, marginBottom: 21, letterSpacing: phone ? -1.6 : -2.4, lineHeight: h1Size * 1.08 }} />
              <Text style={[sans, styles.lead, phone && { fontSize: 13, lineHeight: 24 }]}>{c.lead}</Text>
              <View style={[styles.actions, { gap: phone ? 23 : 25 }]}>
                <View>
                  <Btn label={c.tryCta} href={authHref('signup')} small={phone} />
                </View>
                <View>
                  <TextLink label={c.templateCta} href={c.templateFile} size={phone ? 11 : 12} />
                </View>
              </View>
            </View>
            <View style={phone ? undefined : { flex: 1, minWidth: 0 }}>
              <ModuleMockup kind="devis" />
            </View>
          </View>
        </Wrap>
      </View>

      {/* 3 steps */}
      <Section white>
        <SectionHead eyebrow={c.stepsEyebrow} plain={c.stepsTitle} />
        <View style={[styles.row, phone && { flexDirection: 'column', gap: 12 }]}>
          {c.steps.map((s) => (
            <View key={s.title} style={[styles.card, !phone && { flex: 1 }]}>
              <Text style={[sans, styles.cardTitle]}>{s.title}</Text>
              <Text style={[sans, styles.cardText]}>{s.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* What Cantia does automatically */}
      <Section>
        <SectionHead eyebrow={c.autoEyebrow} plain={c.autoTitle} text={c.autoText} />
        <View style={[styles.grid, phone && { flexDirection: 'column', gap: 12 }]}>
          {c.autoPoints.map((a) => (
            <View key={a.title} style={[styles.card, styles.cardWhite, !phone && { width: tablet ? '47%' : '31%' }]}>
              <Feather name="check" size={16} color={site.copper} />
              <Text style={[sans, styles.cardTitle]}>{a.title}</Text>
              <Text style={[sans, styles.cardText]}>{a.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* What goes on a quote */}
      <Section white>
        <SectionHead eyebrow={c.contentEyebrow} plain={c.contentTitle} text={c.contentIntro} />
        <View style={styles.list}>
          {c.contentItems.map((item, i) => (
            <View key={item.label} style={[styles.listRow, i > 0 && styles.listRowBorder, phone && { flexDirection: 'column', gap: 4 }]}>
              <Text style={[sans, styles.listLabel, !phone && { width: 220 }]}>{item.label}</Text>
              <Text style={[sans, styles.listText]}>{item.text}</Text>
            </View>
          ))}
        </View>
        <Text style={[sans, styles.note]}>{c.contentNote}</Text>
      </Section>

      {/* Free template */}
      <Section>
        <View style={[styles.template, phone && { flexDirection: 'column', alignItems: 'flex-start', padding: 24 }]}>
          <View style={styles.templateIcon}>
            <Feather name="file-text" size={26} color={site.copper} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
            <Eyebrow>{c.templateEyebrow}</Eyebrow>
            <Headline plain={c.templateTitle} size={phone ? 28 : 34} />
            <Text style={[sans, styles.cardText, { fontSize: 13, maxWidth: 640 }]}>{c.templateText}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 18, marginTop: 6 }}>
              <Btn label={c.templateLink} href={c.templateFile} tone="ink" small={phone} />
            </View>
            <Text style={[sans, styles.note, { marginTop: 4 }]}>{c.templateHint}</Text>
          </View>
        </View>
      </Section>

      {/* Quote to QR invoice */}
      <Section white>
        <SectionHead eyebrow={c.invoiceEyebrow} plain={c.invoiceTitle} text={c.invoiceText} />
        <TextLink label={c.invoiceLink} href={`${p}/solutions/facturation`} />
      </Section>

      {/* Comparison */}
      <Section>
        <SectionHead eyebrow={c.compareEyebrow} plain={c.compareTitle} text={c.compareIntro} />
        <View style={styles.table}>
          <View style={[styles.tr, styles.thead]}>
            <Text style={[sans, styles.th, styles.tdLabel]} />
            {c.compareCols.map((col, i) => (
              <Text key={col} style={[sans, styles.th, i === 2 && { color: site.copper }]}>
                {col}
              </Text>
            ))}
          </View>
          {c.compareRows.map((row) => (
            <View key={row.label} style={[styles.tr, phone && { flexWrap: 'wrap' }]}>
              <Text style={[sans, styles.td, styles.tdLabel, phone && { width: '100%', paddingBottom: 0 }]}>{row.label}</Text>
              {row.values.map((v, i) => (
                <Text key={i} style={[sans, styles.td, i === 2 && styles.tdOurs]}>
                  {v}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Section>

      {/* FAQ */}
      <Section white>
        <View style={styles.faq}>
          <Eyebrow>{c.faqEyebrow}</Eyebrow>
          <Headline plain={c.faqTitle} size={phone ? 32 : 42} style={{ marginTop: 15, marginBottom: 30 }} />
          {c.faq.map((q, i) => (
            <FaqItem key={q.question} q={q.question} a={q.answer} last={i === c.faq.length - 1} />
          ))}
        </View>
      </Section>

      {/* Related articles */}
      <Section>
        <Eyebrow>{c.relatedTitle}</Eyebrow>
        <View style={[styles.grid, { marginTop: 20 }, phone && { flexDirection: 'column', gap: 10 }]}>
          {c.related.map((r) => (
            <Link key={r.href} href={r.href as any} asChild>
              <Hover accessibilityRole="link" base={[styles.related, !phone && { width: tablet ? '47%' : '23%' }]} hover={{ borderColor: site.copper }}>
                <Text style={[sans, styles.relatedText]}>{r.label}</Text>
                <Feather name="arrow-right" size={14} color={site.copper} />
              </Hover>
            </Link>
          ))}
        </View>
      </Section>

      {/* Closing */}
      <View style={styles.closing}>
        <Wrap>
          <Headline plain={c.closingTitle} size={phone ? 30 : 36} color="#f4f3e9" accentColor="#d9aa85" />
          <Text style={[sans, { fontSize: 12, color: '#b2b9a7', marginTop: 15, lineHeight: 21, maxWidth: 620 }]}>{c.closingText}</Text>
          <View style={{ marginTop: 26, alignSelf: 'flex-start' }}>
            <Btn label={c.tryCta} href={authHref('signup')} small={phone} />
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  leadGrid: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
  lead: { fontSize: 15, lineHeight: 27, color: site.muted, maxWidth: 560 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 28 },
  row: { flexDirection: 'row', gap: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { backgroundColor: site.bg, borderWidth: 1, borderColor: site.line, borderRadius: 8, padding: 22, gap: 8 },
  cardWhite: { backgroundColor: site.white },
  cardTitle: { fontSize: 17, lineHeight: 23, color: site.ink, fontWeight: '500', letterSpacing: -0.3 },
  cardText: { fontSize: 12.5, lineHeight: 21, color: site.muted },
  list: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: site.line },
  listRow: { flexDirection: 'row', gap: 24, paddingVertical: 16 },
  listRowBorder: { borderTopWidth: 1, borderTopColor: site.line },
  listLabel: { fontSize: 14, fontWeight: '600', color: site.ink },
  listText: { flex: 1, fontSize: 13, lineHeight: 22, color: site.muted },
  note: { fontSize: 12, lineHeight: 20, color: site.muted, marginTop: 18 },
  template: { flexDirection: 'row', alignItems: 'center', gap: 28, backgroundColor: site.white, borderWidth: 1, borderColor: site.line, borderRadius: 10, padding: 36 },
  templateIcon: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#f1e4d6', alignItems: 'center', justifyContent: 'center' },
  table: { borderWidth: 1, borderColor: site.line, borderRadius: 8, overflow: 'hidden', backgroundColor: site.white },
  tr: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: site.line },
  thead: { borderTopWidth: 0, backgroundColor: site.bg },
  th: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 11.5, fontWeight: '700', color: site.ink, letterSpacing: 0.2 },
  td: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 12.5, lineHeight: 19, color: site.muted },
  tdLabel: { color: site.ink, fontWeight: '600' },
  tdOurs: { color: site.ink, fontWeight: '500' },
  faq: { maxWidth: 820 },
  related: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderWidth: 1, borderColor: site.line, borderRadius: 8, padding: 18, backgroundColor: site.white },
  relatedText: { flex: 1, fontSize: 13, lineHeight: 20, color: site.ink, fontWeight: '500' },
  closing: { backgroundColor: site.ink, paddingVertical: 64 },
});

