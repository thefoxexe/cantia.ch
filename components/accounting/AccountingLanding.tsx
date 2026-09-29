import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { Feather } from '@expo/vector-icons';
import { AccNav, AccPage, NavButton, PAGE_MAX, useIsWide } from './AccountingChrome';
import { useAccCopy } from '../../lib/accounting/locale';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

const ORIGIN = 'https://accounting.cantia.ch';

const META = {
  fr: {
    title: 'Cantia Fiduciaires · Tous vos clients Cantia, un seul espace',
    description: 'Espace gratuit pour les fiduciaires : factures, paiements, écritures, TVA et justificatifs de vos clients du bâtiment qui utilisent Cantia, dans un seul cockpit.',
  },
  de: {
    title: 'Cantia Treuhand · Alle Cantia-Kunden in einem Bereich',
    description: 'Kostenloser Bereich für Treuhänder: Rechnungen, Zahlungen, Buchungen, MWST und Belege Ihrer Baukunden, die Cantia nutzen, in einem Cockpit.',
  },
  it: {
    title: 'Cantia Fiduciari · Tutti i clienti Cantia in un solo spazio',
    description: 'Spazio gratuito per i fiduciari: fatture, pagamenti, registrazioni, IVA e giustificativi dei suoi clienti dell’edilizia che usano Cantia, in un unico cockpit.',
  },
};

// Example rows of the cockpit preview (clearly an illustration).
const PREVIEW_ROWS = [
  { name: 'Rossier Menuiserie Sàrl', plan: 'Équipe', open: 'CHF 12’480.00', overdue: 2, activity: '2 h' },
  { name: 'Bonvin Peinture SA', plan: 'Entreprise', open: 'CHF 4’215.50', overdue: 0, activity: '1 j' },
  { name: 'Métrailler Électricité', plan: 'Essentiel', open: 'CHF 860.00', overdue: 1, activity: '3 j' },
];

const ICONS: (keyof typeof Feather.glyphMap)[] = ['refresh-cw', 'layers', 'download'];

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
            <View style={styles.noteRow}>
              <Feather name="check-circle" size={15} color={colors.success} />
              <Text style={styles.note}>{copy.hero.note}</Text>
            </View>
          </View>
          <CockpitPreview />
        </View>
      </View>

      {/* Value */}
      <Section title={copy.value.title}>
        <View style={[styles.grid, wide && styles.gridWide]}>
          {copy.value.items.map((item, i) => (
            <View key={item.title} style={[styles.card, wide && { flex: 1 }]}>
              <View style={styles.iconBox}>
                <Feather name={ICONS[i]} size={18} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Trust */}
      <View style={styles.bandWrap}>
        <View style={[styles.band, wide && styles.bandWide]}>
          <View style={[{ gap: spacing.sm }, wide && { flex: 1 }]}>
            <Feather name="shield" size={26} color="#F6E4D2" />
            <Text style={styles.bandTitle}>{copy.trust.title}</Text>
          </View>
          <View style={[{ gap: spacing.md }, wide && { flex: 1.4 }]}>
            {copy.trust.items.map((line) => (
              <View key={line} style={styles.bandRow}>
                <Feather name="check" size={16} color="#F6E4D2" style={{ marginTop: 3 }} />
                <Text style={styles.bandText}>{line}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Steps */}
      <Section title={copy.steps.title}>
        <View style={[styles.grid, wide && styles.gridWide]}>
          {copy.steps.items.map((item, i) => (
            <View key={item.title} style={[styles.step, wide && { flex: 1 }]}>
              <Text style={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</Text>
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
            <Text style={styles.h2}>{copy.partner.title}</Text>
            <Text style={styles.body}>{copy.partner.text}</Text>
          </View>
          <View style={styles.partnerFigure}>
            <Text style={styles.partnerBig}>25 %</Text>
            <Text style={styles.partnerSmall}>× 12</Text>
          </View>
        </View>
      </Section>

      {/* FAQ */}
      <Section title={copy.faq.title}>
        <View style={styles.faq}>
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
      </Section>

      {/* Final CTA */}
      <Section>
        <View style={styles.final}>
          <Text style={[styles.h2, { textAlign: 'center' }]}>{copy.finalCta.title}</Text>
          <NavButton href="/connexion?mode=signup" label={copy.finalCta.cta} primary large />
        </View>
      </Section>
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

const styles = StyleSheet.create({
  heroWrap: { paddingHorizontal: spacing.lg, backgroundColor: colors.surfaceAlt, borderBottomWidth: 1, borderBottomColor: colors.border },
  hero: { width: '100%', maxWidth: PAGE_MAX - spacing.lg * 2, alignSelf: 'center', paddingVertical: 56, gap: 40 },
  heroWide: { flexDirection: 'row', alignItems: 'center', paddingVertical: 88 },
  heroText: { gap: spacing.lg },
  eyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1.2 },
  h1: { ...displayType, fontSize: 52, lineHeight: 56, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  h1Narrow: { fontSize: 36, lineHeight: 40 },
  lead: { fontSize: 18, lineHeight: 28, color: '#4A3F35', maxWidth: 560 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  note: { fontSize: fontSize.sm, color: colors.textMuted },
  sectionWrap: { paddingHorizontal: spacing.lg },
  section: { width: '100%', maxWidth: PAGE_MAX - spacing.lg * 2, alignSelf: 'center', paddingTop: 80, gap: spacing.xl },
  h2: { ...displayType, fontSize: 32, lineHeight: 38, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  grid: { gap: spacing.lg },
  gridWide: { flexDirection: 'row' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
  iconBox: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  body: { fontSize: fontSize.md, lineHeight: 24, color: '#4A3F35' },
  bandWrap: { paddingHorizontal: spacing.lg, marginTop: 80 },
  band: { width: '100%', maxWidth: PAGE_MAX - spacing.lg * 2, alignSelf: 'center', backgroundColor: '#2B211A', borderRadius: radius.lg, padding: 40, gap: spacing.xl },
  bandWide: { flexDirection: 'row', padding: 56 },
  bandTitle: { ...displayType, fontSize: 30, lineHeight: 36, fontWeight: '800', color: '#FFFFFF' },
  bandRow: { flexDirection: 'row', gap: spacing.md },
  bandText: { flex: 1, fontSize: fontSize.md, lineHeight: 24, color: '#EFE4D6' },
  step: { gap: spacing.sm, borderTopWidth: 2, borderTopColor: colors.text, paddingTop: spacing.lg },
  stepNumber: { ...monoType, fontSize: 13, fontWeight: '700', color: colors.primary },
  partner: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 40, gap: spacing.xl },
  partnerWide: { flexDirection: 'row', alignItems: 'center' },
  partnerFigure: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  partnerBig: { ...displayType, fontSize: 72, lineHeight: 72, fontWeight: '800', color: colors.primary },
  partnerSmall: { ...monoType, fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 10 },
  faq: { borderTopWidth: 1, borderTopColor: colors.border },
  faqItem: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.lg, gap: spacing.sm },
  faqHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  faqQ: { flex: 1, fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  final: { alignItems: 'center', gap: spacing.xl, paddingVertical: spacing.xl },
  preview: {
    flex: 1,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: '#2B211A',
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
  },
  previewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  previewPill: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
  previewPillText: { ...monoType, fontSize: 12, fontWeight: '700', color: colors.primary },
  previewKpis: { flexDirection: 'row', gap: spacing.sm },
  previewKpi: { flex: 1, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  previewKpiValue: { ...displayType, fontSize: 24, fontWeight: '800', color: colors.text },
  previewKpiLabel: { fontSize: 11, color: colors.textMuted },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  previewAvatar: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  previewAvatarText: { fontWeight: '800', color: colors.accent },
  previewName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  previewMeta: { fontSize: 12, color: colors.textMuted },
  previewAmount: { ...monoType, fontSize: 12, fontWeight: '600', color: colors.text },
  previewOverdue: { fontSize: 11, color: colors.danger, fontWeight: '700' },
  previewOk: { fontSize: 11, color: colors.success },
});
