import { StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { NavButton, PAGE_MAX, PartnersNav, PartnersPage, useIsWide } from './PartnersChrome';
import { usePartnersCopy } from '../../lib/partners/locale';
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

export function PartnersLanding() {
  const { copy, locale } = usePartnersCopy();
  const wide = useIsWide();
  const meta = META[locale];
  const origin = 'https://partners.cantia.ch';

  return (
    <PartnersPage
      nav={
        <PartnersNav
          landing
          right={
            <>
              <NavButton href="/connexion" label={copy.nav.login} />
              <NavButton href="/connexion?mode=signup" label={copy.nav.join} primary />
            </>
          }
        />
      }
    >
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`${origin}${locale === 'fr' ? '/' : `/${locale}`}`} />
        <link rel="alternate" hrefLang="fr-CH" href={`${origin}/`} />
        <link rel="alternate" hrefLang="de-CH" href={`${origin}/de`} />
        <link rel="alternate" hrefLang="it-CH" href={`${origin}/it`} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
      </Head>

      <View style={[styles.section, styles.hero, wide && styles.heroWide]}>
        <View style={[styles.heroText, wide && { flex: 1.25 }]}>
          <Text style={styles.eyebrow}>{copy.hero.eyebrow}</Text>
          <Text style={[styles.h1, !wide && styles.h1Narrow]} role="heading" aria-level={1}>
            {copy.hero.title}
          </Text>
          <Text style={styles.lead}>{copy.hero.text}</Text>
          <View style={styles.ctaRow}>
            <NavButton href="/connexion?mode=signup" label={copy.hero.cta} primary />
          </View>
          <Text style={styles.note}>{copy.hero.note}</Text>
        </View>

        <View style={[styles.ledger, wide && { flex: 1 }]}>
          <Text style={styles.ledgerTitle}>{copy.example.title}</Text>
          <Text style={styles.ledgerLine}>{copy.example.line}</Text>
          <View style={styles.ledgerRule} />
          <Text style={styles.ledgerCalc}>{copy.example.calc}</Text>
          <Text style={styles.ledgerBig}>{copy.example.monthly}</Text>
          <Text style={styles.ledgerYear}>{copy.example.yearly}</Text>
          <View style={styles.ledgerRule} />
          <Text style={styles.ledgerFoot}>{copy.example.footnote}</Text>
        </View>
      </View>

      <View style={styles.section} nativeID="comment">
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

      <View style={styles.section}>
        <Text style={styles.h2} role="heading" aria-level={2}>
          {copy.who.title}
        </Text>
        <View style={styles.chips}>
          {copy.who.items.map((item) => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.h2} role="heading" aria-level={2}>
          {copy.rules.title}
        </Text>
        <View style={[styles.faq, wide && styles.faqWide]}>
          {copy.rules.items.map((item) => (
            <View key={item.q} style={[styles.faqItem, wide && styles.faqItemWide]}>
              <Text style={styles.faqQ}>{item.q}</Text>
              <Text style={styles.body}>{item.a}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.final}>
          <Text style={styles.finalTitle}>{copy.finalCta.title}</Text>
          <Text style={styles.finalText}>{copy.finalCta.text}</Text>
          <View style={styles.ctaRow}>
            <NavButton href="/connexion?mode=signup" label={copy.finalCta.cta} primary />
          </View>
        </View>
      </View>
    </PartnersPage>
  );
}

const styles = StyleSheet.create({
  section: { width: '100%', maxWidth: PAGE_MAX, alignSelf: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.xxxl },
  hero: { gap: spacing.xxl },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: 56, marginTop: 72 },
  heroText: { gap: spacing.lg },
  eyebrow: { ...monoType, fontSize: 12, fontWeight: '600', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  h1: { ...displayType, fontSize: 54, lineHeight: 56, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  h1Narrow: { fontSize: 38, lineHeight: 41 },
  lead: { fontSize: 18, lineHeight: 28, color: colors.textMuted, maxWidth: 560 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  note: { fontSize: fontSize.sm, color: colors.textMuted },
  ledger: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  ledgerTitle: { ...monoType, fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  ledgerLine: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  ledgerRule: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  ledgerCalc: { ...monoType, fontSize: 15, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  ledgerBig: { ...displayType, fontSize: 34, lineHeight: 38, fontWeight: '800', color: colors.primary },
  ledgerYear: { fontSize: fontSize.md, color: colors.text },
  ledgerFoot: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  h2: { ...displayType, fontSize: 32, lineHeight: 36, fontWeight: '800', color: colors.text, marginBottom: spacing.xl },
  row: { flexDirection: 'row' },
  steps: { gap: spacing.lg },
  step: { borderTopWidth: 2, borderTopColor: colors.text, paddingTop: spacing.md, gap: spacing.sm },
  stepNum: { ...monoType, fontSize: 13, fontWeight: '600', color: colors.primary },
  stepTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  body: { fontSize: fontSize.md, lineHeight: 23, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 14 },
  chipText: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  faq: { gap: spacing.xl },
  faqWide: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 48 },
  faqItem: { gap: 6 },
  faqItemWide: { width: '46%' },
  faqQ: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  final: { backgroundColor: colors.text, borderRadius: radius.lg, padding: spacing.xxl, gap: spacing.sm },
  finalTitle: { ...displayType, fontSize: 30, lineHeight: 34, fontWeight: '800', color: colors.surface },
  finalText: { fontSize: fontSize.md, color: '#D8CCBB', marginBottom: spacing.sm },
});
