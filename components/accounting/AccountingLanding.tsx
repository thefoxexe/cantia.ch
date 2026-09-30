import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { BrowserFrame } from '../brand/BrowserFrame';
import Head from 'expo-router/head';
import { Feather } from '@expo/vector-icons';
import { AccNav, AccPage, NavButton, PAGE_MAX, useIsWide } from './AccountingChrome';
import { useAccCopy } from '../../lib/accounting/locale';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

const ORIGIN = 'https://accounting.cantia.ch';

const META = {
  fr: {
    title: 'Cantia Accounting · Portail gratuit pour fiduciaires en Suisse',
    description: 'Logiciel gratuit pour fiduciaires : demandes de pièces aux mandants, échéances TVA, AVS et bouclement, factures, écritures et justificatifs de vos clients du bâtiment sur Cantia.',
  },
  de: {
    title: 'Cantia Accounting · Kostenloses Mandantenportal für Treuhänder',
    description: 'Kostenlose Software für Treuhänder in der Schweiz: Belege bei Mandanten anfordern, MWST-, AHV- und Abschlussfristen, Rechnungen, Buchungen und Belege Ihrer Baukunden auf Cantia.',
  },
  it: {
    title: 'Cantia Accounting · Portale gratuito per fiduciari in Svizzera',
    description: 'Software gratuito per fiduciari: richieste di documenti ai mandanti, scadenze IVA, AVS e chiusura, fatture, registrazioni e giustificativi dei suoi clienti edili su Cantia.',
  },
};

// Example rows of the cockpit preview (clearly an illustration).
const PREVIEW_ROWS = [
  { name: 'Rossier Menuiserie Sàrl', plan: 'Équipe', open: 'CHF 12’480.00', overdue: 2, activity: '2 h' },
  { name: 'Bonvin Peinture SA', plan: 'Entreprise', open: 'CHF 4’215.50', overdue: 0, activity: '1 j' },
  { name: 'Métrailler Électricité', plan: 'Essentiel', open: 'CHF 860.00', overdue: 1, activity: '3 j' },
];

const ICONS: (keyof typeof Feather.glyphMap)[] = ['inbox', 'calendar', 'download'];

// Search engines: the product (free business software for fiduciaries in
// Switzerland), its publisher and the FAQ, in the page's language.
function structuredData(locale: string, meta: { title: string; description: string }, faq: { q: string; a: string }[], url: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: meta.title.split(' · ')[0],
        url,
        description: meta.description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        inLanguage: `${locale}-CH`,
        areaServed: { '@type': 'Country', name: 'Switzerland' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CHF' },
        publisher: { '@type': 'Organization', name: 'Cantia', url: 'https://cantia.ch' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
}

export function AccountingLanding() {
  const { copy, locale } = useAccCopy();
  const wide = useIsWide();
  const meta = META[locale];
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <AccPage nav={<AccNav landing cta />}>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`${ORIGIN}${prefix || '/'}`} />
        <link rel="alternate" hrefLang="fr-CH" href={`${ORIGIN}/`} />
        <link rel="alternate" hrefLang="de-CH" href={`${ORIGIN}/de`} />
        <link rel="alternate" hrefLang="it-CH" href={`${ORIGIN}/it`} />
        <link rel="alternate" hrefLang="x-default" href={`${ORIGIN}/`} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={`${ORIGIN}${prefix || '/'}`} />
        <meta property="og:image" content={`${ORIGIN}/og-image.jpg`} />
        <meta property="og:locale" content={`${locale}_CH`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData(locale, meta, copy.faq.items, `${ORIGIN}${prefix || '/'}`))}</script>
      </Head>

      {/* Hero */}
      <View style={styles.heroWrap}>
        <View style={[styles.hero, wide && styles.heroWide]}>
          <View style={[styles.heroText, wide && { flex: 1 }]}>
            <Text style={styles.eyebrow}>{copy.hero.eyebrow}</Text>
            <Text style={[styles.h1, !wide && styles.h1Narrow]} role="heading" aria-level={1}>
              {copy.hero.title}
            </Text>
            <Text style={styles.lead}>{copy.hero.text}</Text>
            <View style={styles.ctaRow}>
              <NavButton href="/connexion?mode=signup" label={copy.hero.cta} primary large />
              <NavButton href="/connexion" label={copy.hero.secondary} large />
            </View>
            <Text style={styles.note}>{copy.hero.note}</Text>
          </View>
          <View style={[wide ? { flex: 1.05 } : { width: '100%' }]}>
            <BrowserFrame url="accounting.cantia.ch/espace">
              <CockpitPreview />
            </BrowserFrame>
          </View>
        </View>
      </View>

      {/* Facts */}
      <View style={styles.factsWrap}>
        <View style={[styles.facts, wide && styles.factsWide]}>
          {copy.facts.map((f, i) => (
            <View key={f} style={[styles.fact, wide && i > 0 && styles.factDivider]}>
              <Feather name={(['gift', 'map-pin', 'eye', 'list'] as const)[i] ?? 'check'} size={15} color={colors.primary} />
              <Text style={styles.factText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Value */}
      <Section title={copy.value.title}>
        <View style={[styles.cols, wide && styles.colsWide]}>
          {copy.value.items.map((item, i) => (
            <View key={item.title} style={[styles.col, wide && { flex: 1 }, wide && i > 0 && styles.colDivider]}>
              <Feather name={ICONS[i]} size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Trust */}
      <View style={styles.bandWrap}>
        <View style={[styles.band, wide && styles.bandWide]}>
          <View style={[{ gap: spacing.md }, wide && { flex: 1 }]}>
            <Text style={styles.bandEyebrow}>{copy.hero.eyebrow}</Text>
            <Text style={styles.bandTitle}>{copy.trust.title}</Text>
          </View>
          <View style={[wide && { flex: 1.3 }]}>
            {copy.trust.items.map((line, i) => (
              <View key={line} style={[styles.bandRow, i > 0 && styles.bandRowBorder]}>
                <Text style={styles.bandNum}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.bandText}>{line}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Steps */}
      <Section title={copy.steps.title}>
        <View style={[styles.steps, wide && styles.stepsWide]}>
          {copy.steps.items.map((item, i) => (
            <View key={item.title} style={[styles.step, wide && { flex: 1 }]}>
              <View style={styles.stepHead}>
                <View style={styles.stepDot}>
                  <Text style={styles.stepDotText}>{i + 1}</Text>
                </View>
                {wide && i < copy.steps.items.length - 1 ? <View style={styles.stepLine} /> : null}
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Partner */}
      <Section>
        <View style={[styles.partner, wide && styles.partnerWide]}>
          <View style={[{ gap: spacing.sm }, wide && { flex: 1 }]}>
            <Text style={styles.eyebrow}>Cantia Partners</Text>
            <Text style={styles.h3}>{copy.partner.title}</Text>
            <Text style={styles.body}>{copy.partner.text}</Text>
          </View>
          <Link href={`https://partners.cantia.ch${prefix}` as any} style={styles.partnerLink}>
            {copy.partner.cta} →
          </Link>
        </View>
      </Section>

      {/* FAQ */}
      <Section>
        <View style={[{ gap: spacing.xl }, wide && styles.faqWide]}>
          <Text style={[styles.h2, wide && { flex: 0.8 }]} role="heading" aria-level={2}>
            {copy.faq.title}
          </Text>
          <View style={[styles.faq, wide && { flex: 1.4 }]}>
            {copy.faq.items.map((item, i) => (
              <Pressable key={item.q} onPress={() => setOpenFaq(openFaq === i ? null : i)} style={styles.faqItem} accessibilityRole="button" aria-expanded={openFaq === i}>
                <View style={styles.faqHead}>
                  <Text style={styles.faqQ}>{item.q}</Text>
                  <Feather name={openFaq === i ? 'minus' : 'plus'} size={18} color={colors.textMuted} />
                </View>
                {openFaq === i ? <Text style={styles.body}>{item.a}</Text> : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Section>

      {/* Final CTA */}
      <View style={styles.bandWrap}>
        <View style={[styles.final, wide && styles.finalWide]}>
          <Text style={[styles.finalTitle, wide && { flex: 1 }]}>{copy.finalCta.title}</Text>
          <NavButton href="/connexion?mode=signup" label={copy.finalCta.cta} primary large />
        </View>
      </View>
    </AccPage>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.section}>
        {title ? (
          <Text style={styles.h2} role="heading" aria-level={2}>
            {title}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}

// Illustration of the cockpit with example companies.
function CockpitPreview() {
  const { copy } = useAccCopy();
  return (
    <View style={styles.preview} aria-hidden>
      <View style={styles.previewHead}>
        <Text style={styles.previewTitle}>{copy.clients.title}</Text>
        <View style={styles.previewPill}>
          <Text style={styles.previewPillText}>3</Text>
        </View>
      </View>
      <View style={styles.previewKpis}>
        <PreviewKpi label={copy.dashboard.kpis.active} value="24" />
        <PreviewKpi label={copy.dashboard.kpis.overdue} value="3" warn />
        <PreviewKpi label={copy.dashboard.kpis.documents} value="182" />
      </View>
      {PREVIEW_ROWS.map((row) => (
        <View key={row.name} style={styles.previewRow}>
          <View style={styles.previewAvatar}>
            <Text style={styles.previewAvatarText}>{row.name.slice(0, 1)}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.previewName} numberOfLines={1}>
              {row.name}
            </Text>
            <Text style={styles.previewMeta}>
              {row.plan} · {row.activity}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.previewAmount}>{row.open}</Text>
            {row.overdue ? <Text style={styles.previewOverdue}>● {row.overdue}</Text> : <Text style={styles.previewOk}>●</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

function PreviewKpi({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.previewKpi}>
      <Text style={[styles.previewKpiValue, warn && { color: colors.danger }]}>{value}</Text>
      <Text style={styles.previewKpiLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

// Headings at normal width (not the condensed display cut of the main
// site): calmer and more institutional for a professional audience.
const heading = { fontFamily: 'Archivo, system-ui, sans-serif', fontWeight: '700' as const, color: colors.text };

const styles = StyleSheet.create({
  heroWrap: { paddingHorizontal: spacing.lg, backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border },
  hero: { width: '100%', maxWidth: PAGE_MAX - spacing.lg * 2, alignSelf: 'center', paddingTop: 48, paddingBottom: 56, gap: 44 },
  heroWide: { flexDirection: 'row', alignItems: 'center', paddingTop: 80, paddingBottom: 88, gap: 64 },
  heroText: { gap: spacing.lg },
  eyebrow: { fontSize: 12.5, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1.4 },
  h1: { ...heading, fontSize: 50, lineHeight: 58, letterSpacing: -1.2 },
  h1Narrow: { fontSize: 34, lineHeight: 41, letterSpacing: -0.6 },
  h2: { ...heading, fontSize: 32, lineHeight: 40, letterSpacing: -0.6 },
  h3: { ...heading, fontSize: 24, lineHeight: 31, letterSpacing: -0.3 },
  lead: { fontSize: 18, lineHeight: 29, color: '#4A3F35', maxWidth: 540 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  note: { fontSize: fontSize.sm, color: colors.textMuted },
  factsWrap: { paddingHorizontal: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  facts: { width: '100%', maxWidth: PAGE_MAX - spacing.lg * 2, alignSelf: 'center', paddingVertical: spacing.lg, gap: spacing.md },
  factsWide: { flexDirection: 'row', justifyContent: 'space-between', gap: 0 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  factDivider: { borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: spacing.xl },
  factText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  sectionWrap: { paddingHorizontal: spacing.lg },
  section: { width: '100%', maxWidth: PAGE_MAX - spacing.lg * 2, alignSelf: 'center', paddingTop: 96, gap: spacing.xl },
  cols: { gap: spacing.xl },
  colsWide: { flexDirection: 'row', gap: 0 },
  col: { gap: spacing.sm, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  colDivider: { borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: spacing.xl, marginLeft: spacing.xl },
  cardTitle: { fontSize: 19, lineHeight: 26, fontWeight: '700', color: colors.text },
  body: { fontSize: fontSize.md, lineHeight: 25, color: '#4A3F35' },
  bandWrap: { paddingHorizontal: spacing.lg, marginTop: 96 },
  band: { width: '100%', maxWidth: PAGE_MAX - spacing.lg * 2, alignSelf: 'center', backgroundColor: '#16120E', borderRadius: 14, padding: 32, gap: spacing.xl },
  bandWide: { flexDirection: 'row', padding: 56, gap: 64 },
  bandEyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', color: '#D9895A' },
  bandTitle: { ...heading, fontSize: 30, lineHeight: 38, color: '#FFFFFF', letterSpacing: -0.4 },
  bandRow: { flexDirection: 'row', gap: spacing.lg, paddingVertical: spacing.md },
  bandRowBorder: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  bandNum: { fontSize: 12, fontWeight: '700', color: '#D9895A', marginTop: 4, fontVariant: ['tabular-nums'] },
  bandText: { flex: 1, fontSize: fontSize.md, lineHeight: 25, color: '#EFE4D6' },
  steps: { gap: spacing.xl },
  stepsWide: { flexDirection: 'row', gap: spacing.xl },
  step: { gap: spacing.sm },
  stepHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  stepDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  stepDotText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  stepLine: { flex: 1, height: 1, backgroundColor: colors.border, marginLeft: spacing.md },
  partner: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 14, padding: 32, gap: spacing.lg },
  partnerWide: { flexDirection: 'row', alignItems: 'center', padding: 44, gap: 48 },
  partnerLink: { fontSize: fontSize.md, fontWeight: '700', color: colors.primary },
  faqWide: { flexDirection: 'row', gap: 64 },
  faq: { borderTopWidth: 1, borderTopColor: colors.border },
  faqItem: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.lg, gap: spacing.sm },
  faqHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  faqQ: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.text },
  final: { width: '100%', maxWidth: PAGE_MAX - spacing.lg * 2, alignSelf: 'center', backgroundColor: colors.primarySoft, borderRadius: 14, padding: 32, gap: spacing.lg, alignItems: 'flex-start' },
  finalWide: { flexDirection: 'row', alignItems: 'center', padding: 48, gap: 48 },
  finalTitle: { ...heading, fontSize: 26, lineHeight: 34, letterSpacing: -0.4 },
  preview: { padding: spacing.lg, gap: spacing.md },
  previewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  previewPill: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
  previewPillText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  previewKpis: { flexDirection: 'row', gap: spacing.sm },
  previewKpi: { flex: 1, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  previewKpiValue: { fontSize: 22, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  previewKpiLabel: { fontSize: 11, color: colors.textMuted },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  previewAvatar: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  previewAvatarText: { fontWeight: '800', color: colors.accent },
  previewName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  previewMeta: { fontSize: 12, color: colors.textMuted },
  previewAmount: { fontSize: 12.5, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] },
  previewOverdue: { fontSize: 11, color: colors.danger, fontWeight: '700' },
  previewOk: { fontSize: 11, color: colors.success },
});
