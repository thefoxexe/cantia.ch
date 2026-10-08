import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { BrowserFrame } from '../brand/BrowserFrame';
import Head from 'expo-router/head';
import { Feather } from '@expo/vector-icons';
import { AccNav, AccPage, NavButton, PAGE_MAX, useIsWide } from './AccountingChrome';
import { useAccCopy } from '../../lib/accounting/locale';
import { useLandingCopy } from '../../lib/accounting/landingCopy';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

const ORIGIN = 'https://accounting.cantia.ch';

const META = {
  fr: {
    title: 'Cantia Accounting · Logiciel gratuit pour fiduciaires en Suisse',
    description: 'Logiciel gratuit pour fiduciaires : comptabilité de vos mandants (saisie, import Banana, Abacus, Winbiz), décompte TVA de l’AFC avec fichier eCH-0217, bouclement, pièces et signatures par lien privé, temps et honoraires.',
  },
  de: {
    title: 'Cantia Accounting · Kostenlose Software für Treuhänder',
    description: 'Kostenlose Software für Treuhänder in der Schweiz: Buchhaltung Ihrer Mandanten (Erfassung, Import aus Banana, Abacus, Winbiz), MWST-Abrechnung mit eCH-0217-Datei, Abschluss, Belege und Unterschriften per privatem Link, Zeit und Honorare.',
  },
  it: {
    title: 'Cantia Accounting · Software gratuito per fiduciari in Svizzera',
    description: 'Software gratuito per fiduciari: contabilità dei mandanti (registrazione, importazione da Banana, Abacus, Winbiz), rendiconto IVA con file eCH-0217, chiusura, documenti e firme con link privato, tempo e onorari.',
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

      <KindsSection />
      <FeaturesSection />
      <FlowSection />

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

// The two kinds of clients.
function KindsSection() {
  const l = useLandingCopy().kinds;
  const wide = useIsWide();
  const card = (k: typeof l.cantia, dark: boolean) => (
    <View style={[styles.kind, dark && styles.kindDark, wide && { flex: 1 }]}>
      <Text style={[styles.kindLabel, dark && { color: '#D9895A' }]}>{k.label}</Text>
      <Text style={[styles.h3, dark && { color: '#FFFFFF' }]}>{k.title}</Text>
      <View style={{ gap: spacing.sm }}>
        {k.items.map((item) => (
          <View key={item} style={styles.kindRow}>
            <Feather name="check" size={16} color={dark ? '#D9895A' : colors.primary} style={{ marginTop: 4 }} />
            <Text style={[styles.body, { flex: 1 }, dark && { color: '#EFE4D6' }]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
  return (
    <Section>
      <View style={{ gap: spacing.sm }}>
        <Text style={styles.eyebrow}>{l.eyebrow}</Text>
        <Text style={styles.h2} role="heading" aria-level={2}>
          {l.title}
        </Text>
      </View>
      <View style={[{ gap: spacing.lg }, wide && { flexDirection: 'row' }]}>
        {card(l.cantia, false)}
        {card(l.external, true)}
      </View>
    </Section>
  );
}

// Every tool of the workspace.
function FeaturesSection() {
  const l = useLandingCopy().features;
  const wide = useIsWide();
  const mid = useIsWide(720);
  return (
    <Section>
      <View style={{ gap: spacing.sm }}>
        <Text style={styles.eyebrow}>{l.eyebrow}</Text>
        <Text style={styles.h2} role="heading" aria-level={2}>
          {l.title}
        </Text>
      </View>
      <View style={styles.grid}>
        {l.items.map((f) => (
          <View key={f.title} style={[styles.feature, { flexBasis: wide ? '31%' : mid ? '47%' : '100%' }]}>
            <View style={styles.featureIcon}>
              <Feather name={f.icon as keyof typeof Feather.glyphMap} size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>{f.title}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

// A quarter, from the receipt to the VAT return, with an example form.
function FlowSection() {
  const l = useLandingCopy().flow;
  const wide = useIsWide();
  return (
    <Section>
      <View style={[{ gap: 48 }, wide && { flexDirection: 'row', alignItems: 'center' }]}>
        <View style={[{ gap: spacing.lg }, wide && { flex: 1 }]}>
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.eyebrow}>{l.eyebrow}</Text>
            <Text style={styles.h2} role="heading" aria-level={2}>
              {l.title}
            </Text>
          </View>
          {l.steps.map((step, i) => (
            <View key={step.title} style={styles.flowStep}>
              <View style={styles.stepDot}>
                <Text style={styles.stepDotText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.cardTitle}>{step.title}</Text>
                <Text style={styles.body}>{step.text}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={[wide ? { flex: 1.05 } : { width: '100%' }]}>
          <BrowserFrame url="accounting.cantia.ch/mandant">
            <VatPreview />
          </BrowserFrame>
        </View>
      </View>
    </Section>
  );
}

function VatPreview() {
  const p = useLandingCopy().flow.preview;
  return (
    <View style={styles.preview} aria-hidden>
      <View style={styles.previewHead}>
        <Text style={styles.previewTitle}>{p.title}</Text>
        <View style={styles.previewPill}>
          <Text style={styles.previewPillText}>{p.example}</Text>
        </View>
      </View>
      {p.rows.map(([fig, label, value]) => (
        <View key={fig} style={styles.vatRow}>
          <Text style={styles.vatFig}>{fig}</Text>
          <Text style={styles.vatLabel} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.vatValue}>{value}</Text>
        </View>
      ))}
      <View style={[styles.vatRow, styles.vatTotal]}>
        <Text style={styles.vatFig}>{p.total[0]}</Text>
        <Text style={[styles.vatLabel, { fontWeight: '800' }]}>{p.total[1]}</Text>
        <Text style={[styles.vatValue, { fontWeight: '800', fontSize: 15 }]}>CHF {p.total[2]}</Text>
      </View>
      {p.checks.map((c) => (
        <View key={c} style={styles.kindRow}>
          <Feather name="check-circle" size={13} color={colors.success} style={{ marginTop: 2 }} />
          <Text style={styles.previewMeta}>{c}</Text>
        </View>
      ))}
      <View style={styles.vatActions}>
        <View style={styles.vatBtnGhost}>
          <Feather name="download" size={13} color={colors.text} />
          <Text style={styles.vatBtnGhostText}>{p.xml}</Text>
        </View>
        <View style={styles.vatBtn}>
          <Feather name="send" size={13} color="#FFFFFF" />
          <Text style={styles.vatBtnText}>{p.file}</Text>
        </View>
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
  kind: { gap: spacing.md, padding: 32, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  kindDark: { backgroundColor: '#16120E', borderColor: '#16120E' },
  kindLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.primary },
  kindRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, justifyContent: 'space-between' },
  feature: { flexGrow: 1, gap: spacing.sm, padding: spacing.lg, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  featureIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: fontSize.sm, lineHeight: 22, color: '#4A3F35' },
  flowStep: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  vatRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 7, borderTopWidth: 1, borderTopColor: colors.border },
  vatTotal: { borderTopWidth: 2, borderTopColor: colors.text, backgroundColor: colors.bg, paddingHorizontal: 6, marginHorizontal: -6 },
  vatFig: { width: 34, fontSize: 12, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  vatLabel: { flex: 1, fontSize: 12.5, color: colors.text },
  vatValue: { fontSize: 12.5, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] },
  vatActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  vatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12 },
  vatBtnText: { fontSize: 12.5, fontWeight: '700', color: '#FFFFFF' },
  vatBtnGhost: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface },
  vatBtnGhostText: { fontSize: 12.5, fontWeight: '700', color: colors.text },
});
