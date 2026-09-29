import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { NavButton, PAGE_MAX, PartnersNav, PartnersPage, useIsWide } from './PartnersChrome';
import { usePartnersCopy } from '../../lib/partners/locale';
import { fill, SIMULATOR_PLANS } from '../../lib/partners/copy';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

const META = {
  fr: {
    title: 'Cantia Partners · 25 % pendant 12 mois',
    description: 'Programme partenaire de Cantia, le logiciel suisse de gestion de chantier : recommandez Cantia et recevez 25 % des paiements de vos clients pendant 12 mois.',
  },
  de: {
    title: 'Cantia Partners · 25 % während 12 Monaten',
    description: 'Partnerprogramm von Cantia, der Schweizer Software für Baustellenverwaltung: Empfehlen Sie Cantia und erhalten Sie 25 % der Zahlungen Ihrer Kunden während 12 Monaten.',
  },
  it: {
    title: 'Cantia Partners · 25 % per 12 mesi',
    description: 'Programma partner di Cantia, il software svizzero di gestione dei cantieri: raccomandi Cantia e riceva il 25 % dei pagamenti dei suoi clienti per 12 mesi.',
  },
};

const ORIGIN = 'https://partners.cantia.ch';

function chf(amount: number): string {
  const [int, dec] = amount.toFixed(2).split('.');
  return `CHF ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}

function scrollToId(id: string) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function PartnersLanding() {
  const { copy, locale } = usePartnersCopy();
  const wide = useIsWide();
  const meta = META[locale];
  const prefix = locale === 'fr' ? '' : `/${locale}`;

  return (
    <PartnersPage nav={<PartnersNav landing cta />}>
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
      </Head>

      {/* Hero: full-bleed mountain */}
      <View style={styles.heroBand}>
        <Image source={{ uri: '/hero-mountain.webp' }} style={styles.heroImage} resizeMode="cover" accessibilityIgnoresInvertColors />
        <View style={[styles.section, styles.hero, wide && styles.heroWide]}>
          <View style={[styles.heroText, wide && { flex: 1.1 }]}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrow}>{copy.hero.eyebrow}</Text>
            </View>
            <Text style={[styles.h1, !wide && styles.h1Narrow]} role="heading" aria-level={1}>
              {copy.hero.title}
            </Text>
            <Text style={styles.lead}>{copy.hero.text}</Text>
            <View style={styles.ctaRow}>
              <NavButton href="/connexion?mode=signup" label={copy.hero.cta} primary large />
              <Pressable onPress={() => scrollToId('programme')} style={styles.ghost} accessibilityRole="button">
                <Text style={styles.ghostText}>{copy.hero.secondary}</Text>
                <Feather name="arrow-down" size={15} color={colors.text} />
              </Pressable>
            </View>
            <Text style={styles.note}>{copy.hero.note}</Text>
          </View>
          <View style={[wide && { flex: 0.9 }]}>
            <SpacePreview />
          </View>
        </View>
      </View>

      {/* Pillars */}
      <View style={styles.section} nativeID="programme">
        <Text style={styles.h2} role="heading" aria-level={2}>
          {copy.pillars.title}
        </Text>
        <Text style={[styles.body, { maxWidth: 620 }]}>{copy.pillars.intro}</Text>
        <View style={[styles.steps, wide && styles.row, { marginTop: spacing.xl }]}>
          {copy.pillars.items.map((item, i) => (
            <View key={item.title} style={[styles.pillar, wide && { flex: 1 }]}>
              <Feather name={(['users', 'bar-chart-2', 'home'] as const)[i]} size={20} color={colors.primary} />
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Profiles */}
      <View style={styles.section}>
        <Text style={styles.h2} role="heading" aria-level={2}>
          {copy.profiles.title}
        </Text>
        <View style={styles.productGrid}>
          {copy.profiles.items.map((item) => (
            <View key={item.title} style={[styles.profile, wide && styles.productItemWide]}>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.bodySmall}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Steps */}
      <View style={styles.section}>
        <Text style={styles.h2} role="heading" aria-level={2}>
          {copy.steps.title}
        </Text>
        <View style={[styles.steps, wide && styles.row]}>
          {copy.steps.items.map((step, i) => (
            <View key={step.title} style={[styles.step, wide && { flex: 1 }]}>
              <Text style={styles.stepNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.body}>{step.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Simulator */}
      <View style={styles.section}>
        <Simulator />
      </View>

      {/* Key figures */}
      <View style={styles.section}>
        <View style={[styles.figures, wide && styles.figuresWide]}>
          {copy.figures.map((f, i) => (
            <View key={f.label} style={[styles.figure, wide && styles.figureWide, wide && i > 0 && styles.figureDivider]}>
              <Text style={styles.figureValue}>{f.value}</Text>
              <Text style={styles.figureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Product */}
      <View style={styles.section}>
        <View style={[wide && styles.row, { gap: spacing.xxl }]}>
          <View style={[{ gap: spacing.md }, wide && { flex: 0.8 }]}>
            <Text style={styles.h2} role="heading" aria-level={2}>
              {copy.product.title}
            </Text>
            <Text style={styles.body}>{copy.product.text}</Text>
            <Link href={`https://cantia.ch${prefix || '/'}` as any} style={styles.textLink}>
              {copy.product.cta} →
            </Link>
          </View>
          <View style={[styles.productGrid, wide && { flex: 1 }]}>
            {copy.product.items.map((item) => (
              <View key={item.title} style={[styles.productItem, wide && styles.productItemWide]}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.bodySmall}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.h2} role="heading" aria-level={2}>
          {copy.rules.title}
        </Text>
        <View style={styles.faq}>
          {copy.rules.items.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </View>
      </View>

      {/* Final CTA */}
      <View style={styles.section}>
        <View style={[styles.final, wide && styles.finalWide]}>
          <Image source={{ uri: '/hero-mountain.webp' }} style={styles.heroImage} resizeMode="cover" />
          <View style={{ flex: 1, gap: spacing.sm }}>
            <Text style={styles.finalTitle}>{copy.finalCta.title}</Text>
            <Text style={styles.finalText}>{copy.finalCta.text}</Text>
          </View>
          <NavButton href="/connexion?mode=signup" label={copy.finalCta.cta} primary large />
        </View>
      </View>
    </PartnersPage>
  );
}

// Illustrative preview of the partner space, clearly marked as an example.
function SpacePreview() {
  const { copy } = usePartnersCopy();
  return (
    <View style={styles.preview} aria-label={copy.preview.label}>
      <View style={styles.previewHead}>
        <Text style={styles.previewLabel}>{copy.preview.label}</Text>
        <Text style={styles.previewBadge}>{copy.preview.example}</Text>
      </View>
      <View style={styles.previewLink}>
        <Feather name="link-2" size={14} color={colors.primary} />
        <Text style={styles.previewLinkText}>{copy.preview.link}</Text>
      </View>
      <View style={styles.previewStats}>
        {copy.preview.stats.map((label, i) => (
          <View key={label} style={styles.previewStat}>
            <Text style={styles.previewStatValue}>{[48, 6, 3][i]}</Text>
            <Text style={styles.previewStatLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.previewRows}>
        {copy.preview.rows.map((row) => (
          <View key={row.ref} style={styles.previewRow}>
            <Text style={styles.previewRef}>{row.ref}</Text>
            <Text style={styles.previewPlan}>{row.plan}</Text>
            <Text style={styles.previewAmount}>{row.amount}</Text>
          </View>
        ))}
      </View>
      <View style={styles.previewFoot}>
        <Feather name="calendar" size={13} color={colors.textMuted} />
        <Text style={styles.previewFootText}>{copy.preview.available}</Text>
      </View>
    </View>
  );
}

function Simulator() {
  const { copy, locale } = usePartnersCopy();
  const wide = useIsWide();
  const [counts, setCounts] = useState<Record<string, number>>({ solo: 2, equipe: 3, pro: 1 });
  const monthly = SIMULATOR_PLANS.reduce((sum, p) => sum + p.price * (counts[p.id] ?? 0), 0) * 0.25;

  function change(id: string, delta: number) {
    setCounts((c) => ({ ...c, [id]: Math.max(0, Math.min(50, (c[id] ?? 0) + delta)) }));
  }

  return (
    <View style={[styles.sim, wide && styles.row]}>
      <View style={[styles.simInputs, wide && { flex: 1.2 }]}>
        <Text style={styles.h2} role="heading" aria-level={2}>
          {copy.simulator.title}
        </Text>
        <Text style={styles.body}>{copy.simulator.text}</Text>
        {SIMULATOR_PLANS.map((plan) => (
          <View key={plan.id} style={styles.simRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.simPlan}>{plan.names[locale]}</Text>
              <Text style={styles.simPrice}>{fill(copy.simulator.perMonth, { price: plan.price })}</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable onPress={() => change(plan.id, -1)} style={styles.stepperBtn} accessibilityRole="button" accessibilityLabel="-1">
                <Feather name="minus" size={16} color={colors.text} />
              </Pressable>
              <Text style={styles.stepperValue}>{counts[plan.id] ?? 0}</Text>
              <Pressable onPress={() => change(plan.id, 1)} style={styles.stepperBtn} accessibilityRole="button" accessibilityLabel="+1">
                <Feather name="plus" size={16} color={colors.text} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      <View style={[styles.simResult, wide && { flex: 1 }]}>
        <Text style={styles.simResultLabel}>{copy.simulator.total}</Text>
        <Text style={styles.simBig}>{chf(monthly)}</Text>
        <Text style={styles.simUnit}>{copy.simulator.monthly}</Text>
        <View style={styles.simDivider} />
        <Text style={styles.simYear}>{chf(monthly * 12)}</Text>
        <Text style={styles.simUnit}>{copy.simulator.yearly}</Text>
        <Text style={styles.simNote}>{copy.simulator.note}</Text>
      </View>
    </View>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <View style={styles.faqItem}>
      <Pressable onPress={() => setOpen(!open)} style={styles.faqQRow} accessibilityRole="button" aria-expanded={open}>
        <Text style={styles.faqQ}>{q}</Text>
        <Feather name={open ? 'minus' : 'plus'} size={18} color={colors.text} />
      </Pressable>
      {/* Always in the DOM (crawlers, find-in-page); only shown when open. */}
      <Text style={[styles.faqA, !open && styles.hidden]}>{a}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { width: '100%', maxWidth: PAGE_MAX, alignSelf: 'center', paddingHorizontal: spacing.lg, marginTop: 72 },
  row: { flexDirection: 'row' },
  heroBand: { position: 'relative', overflow: 'hidden', backgroundColor: '#FBE3CB', paddingBottom: 88, borderBottomWidth: 1, borderBottomColor: colors.border },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  hero: { gap: spacing.xxl, marginTop: 56 },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: 64, marginTop: 96 },
  pillar: { gap: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  profile: { width: '100%', borderLeftWidth: 2, borderLeftColor: colors.primary, paddingVertical: spacing.sm, paddingLeft: spacing.lg, gap: 6 },
  heroText: { gap: spacing.lg },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eyebrowDot: { width: 8, height: 8, backgroundColor: colors.primary },
  eyebrow: { ...monoType, fontSize: 12, fontWeight: '600', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  h1: { ...displayType, fontSize: 58, lineHeight: 60, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  h1Narrow: { fontSize: 40, lineHeight: 42, letterSpacing: -0.4 },
  lead: { fontSize: 18, lineHeight: 28, color: '#5A4A3B', maxWidth: 560 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  ghost: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 4 },
  ghostText: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, textDecorationLine: 'underline' },
  note: { fontSize: fontSize.sm, color: '#7A6755' },

  preview: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    shadowColor: '#231A12',
    shadowOpacity: 0.08,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
  },
  previewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  previewBadge: { ...monoType, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  previewLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12 },
  previewLinkText: { ...monoType, fontSize: 13, color: colors.text },
  previewStats: { flexDirection: 'row', gap: spacing.sm },
  previewStat: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm },
  previewStatValue: { ...displayType, fontSize: 24, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  previewStatLabel: { fontSize: 11, color: colors.textMuted },
  previewRows: { borderTopWidth: 1, borderTopColor: colors.border },
  previewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  previewRef: { ...monoType, fontSize: 12, color: colors.text, width: 82 },
  previewPlan: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted },
  previewAmount: { ...monoType, fontSize: 12, fontWeight: '700', color: colors.success },
  previewFoot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewFootText: { fontSize: fontSize.xs, color: colors.textMuted },

  figures: { borderTopWidth: 2, borderBottomWidth: 1, borderTopColor: colors.text, borderBottomColor: colors.border, flexDirection: 'row', flexWrap: 'wrap' },
  figuresWide: { flexWrap: 'nowrap' },
  figure: { width: '50%', paddingVertical: spacing.lg, paddingRight: spacing.md, gap: 4 },
  figureWide: { flex: 1, width: 'auto' as any, paddingHorizontal: spacing.lg },
  figureDivider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  figureValue: { ...displayType, fontSize: 34, lineHeight: 38, fontWeight: '800', color: colors.text },
  figureLabel: { fontSize: fontSize.sm, color: colors.textMuted },

  h2: { ...displayType, fontSize: 36, lineHeight: 40, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  body: { fontSize: fontSize.md, lineHeight: 24, color: colors.textMuted },
  bodySmall: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted },
  steps: { gap: spacing.xl, marginTop: spacing.md },
  step: { borderTopWidth: 2, borderTopColor: colors.text, paddingTop: spacing.md, gap: spacing.sm },
  stepNum: { ...monoType, fontSize: 13, fontWeight: '600', color: colors.primary },
  stepTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },

  sim: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden' },
  simInputs: { padding: spacing.xl, gap: spacing.sm },
  simRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  simPlan: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  simPrice: { ...monoType, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  stepperBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepperValue: { ...displayType, width: 44, textAlign: 'center', fontSize: 22, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  simResult: { backgroundColor: colors.text, padding: spacing.xl, justifyContent: 'center', gap: 2 },
  simResultLabel: { ...monoType, fontSize: 11, color: '#D8CCBB', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  simBig: { ...displayType, fontSize: 48, lineHeight: 52, fontWeight: '800', color: '#F6E4D2', fontVariant: ['tabular-nums'] },
  simUnit: { fontSize: fontSize.sm, color: '#D8CCBB' },
  simDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: spacing.md },
  simYear: { ...displayType, fontSize: 28, fontWeight: '800', color: colors.surface, fontVariant: ['tabular-nums'] },
  simNote: { fontSize: fontSize.xs, color: '#B9AC9A', lineHeight: 17, marginTop: spacing.lg },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 7, paddingHorizontal: 11 },
  chipText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  textLink: { fontSize: fontSize.md, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  productItem: { width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 6 },
  productItemWide: { width: '48%' as any, flexGrow: 1 },
  productTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },

  faq: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm },
  faqItem: { borderBottomWidth: 1, borderBottomColor: colors.border },
  faqQRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.lg },
  faqQ: { flex: 1, fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  faqA: { fontSize: fontSize.md, lineHeight: 24, color: colors.textMuted, paddingBottom: spacing.lg, maxWidth: 760 },
  hidden: { display: 'none' },

  final: { position: 'relative', overflow: 'hidden', backgroundColor: '#FBE3CB', borderRadius: radius.xl, padding: spacing.xxl, paddingVertical: 56, gap: spacing.lg, borderWidth: 1, borderColor: colors.border },
  finalWide: { flexDirection: 'column', alignItems: 'flex-start' },
  finalTitle: { ...displayType, fontSize: 34, lineHeight: 38, fontWeight: '800', color: colors.text },
  finalText: { fontSize: fontSize.md, color: '#5A4A3B', maxWidth: 520 },
});
