import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useEffect, useRef } from 'react';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Container, Screen } from './ui';
import { MarketingFooter, MarketingNav } from './MarketingChrome';
import { PricingSection } from './PricingSection';
import { SwissSection } from './SwissSection';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';
import { TRADE_PAGES, type TradeLandingPage } from '../lib/tradeLandingPages';

// Features present on every trade page regardless of métier — the "richesse
// globale" block from the brief (section 11), same content everywhere so it
// never has to be written per métier. Trade-specific usages (5-6 per page,
// from lib/trades.ts) are shown above this, in their own more detailed grid.
const SECONDARY_FEATURES: { icon: keyof typeof Feather.glyphMap; title: string; text: string }[] = [
  { icon: 'users', title: 'Clients', text: 'Fiche client avec historique complet des devis, factures et chantiers.' },
  { icon: 'credit-card', title: 'QR-facture', text: 'Facturation conforme au bulletin QR suisse, sur tous les plans.' },
  { icon: 'dollar-sign', title: 'Dépenses', text: 'Rattachez les dépenses de chantier pour une rentabilité réelle.' },
  { icon: 'folder', title: 'Documents', text: 'Plans, PDF et contrats classés en arborescence, par chantier.' },
  { icon: 'list', title: 'Catalogue', text: 'Vos prestations et prix mémorisés, réutilisables d\'un devis à l\'autre.' },
  { icon: 'zap', title: 'Intégrations', text: 'Synchronisation native avec Bexio pour votre comptabilité.' },
];

export function TradePage({ trade }: { trade: TradeLandingPage }) {
  const heroAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [heroAnim]);

  const related = (trade.relatedTrades ?? []).map((slug) => TRADE_PAGES[slug]).filter(Boolean);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.breadcrumbOuter}>
          <View style={styles.breadcrumb}>
            <Link href="/"><Text style={styles.breadcrumbLink}>Accueil</Text></Link>
            <Text style={styles.breadcrumbSep}>›</Text>
            <Link href="/metiers"><Text style={styles.breadcrumbLink}>Métiers</Text></Link>
            <Text style={styles.breadcrumbSep}>›</Text>
            <Text style={styles.breadcrumbCurrent}>{trade.tradeName.charAt(0).toUpperCase() + trade.tradeName.slice(1)}</Text>
          </View>
        </Container>

        {/* ---- Hero ---- */}
        <Container style={styles.heroOuter}>
          <Animated.View
            style={[
              styles.heroInner,
              { opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
            ]}
          >
            <View style={styles.kickerPill}>
              <Text style={styles.kickerText}>{trade.hero.eyebrow}</Text>
            </View>
            <Text style={styles.title}>{trade.hero.title}</Text>
            <Text style={styles.subtitle}>{trade.hero.subtitle}</Text>
            <View style={styles.ctaRow}>
              <Link href={authHref('signup')} asChild>
                <Button title="Essayer Cantia pendant 14 jours" onPress={() => {}} />
              </Link>
              <Link href="/#services" asChild>
                <Button title={`Découvrir Cantia pour ${genderedFor(trade.tradeName)}`} variant="secondary" onPress={() => {}} />
              </Link>
            </View>
            <Text style={styles.heroTrust}>14 jours d'essai · Aucun code nécessaire</Text>
          </Animated.View>
        </Container>

        {/* ---- Pain points ---- */}
        <Container style={styles.section}>
          <Text style={styles.eyebrow}>Le quotidien du métier</Text>
          <Text style={styles.sectionTitle}>Vous connaissez probablement ces situations</Text>
          <View style={styles.painList}>
            {trade.painPoints.map((p) => (
              <View key={p.problem} style={styles.painCard}>
                <Text style={styles.painProblem}>{p.problem}</Text>
                <View style={styles.painRow}>
                  <Text style={styles.painLabel}>Conséquence</Text>
                  <Text style={styles.painText}>{p.consequence}</Text>
                </View>
                <View style={styles.painRow}>
                  <Text style={[styles.painLabel, styles.painLabelAccent]}>Réponse Cantia</Text>
                  <Text style={styles.painText}>{p.response}</Text>
                </View>
              </View>
            ))}
          </View>
        </Container>

        {/* ---- Usages ---- */}
        <Container style={styles.section}>
          <Text style={styles.eyebrow}>Comment Cantia s'adapte au métier</Text>
          <Text style={styles.sectionTitle}>Ce que Cantia change concrètement pour {genderedFor(trade.tradeName)}</Text>
          <View style={styles.usageGrid}>
            {trade.usages.map((u) => (
              <View key={u.title} style={styles.usageCard}>
                <View style={styles.usageIcon}>
                  <Feather name={u.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.usageTitle}>{u.title}</Text>
                <Text style={styles.usageText}>{u.text}</Text>
              </View>
            ))}
          </View>
        </Container>

        {/* ---- Scenario ---- */}
        <Container style={styles.section}>
          <View style={styles.scenarioCard}>
            <Feather name="map" size={18} color={colors.primary} />
            <Text style={styles.scenarioTitle}>{trade.scenario.title}</Text>
            <Text style={styles.scenarioText}>{trade.scenario.text}</Text>
          </View>
        </Container>

        {/* ---- Before / after ---- */}
        <Container style={styles.section}>
          <Text style={styles.eyebrow}>Avant / avec Cantia</Text>
          <View style={styles.comparisonTable}>
            <View style={styles.comparisonHeaderRow}>
              <Text style={[styles.comparisonHeaderText, styles.comparisonBefore]}>Avant</Text>
              <Text style={[styles.comparisonHeaderText, styles.comparisonAfter]}>Avec Cantia</Text>
            </View>
            {trade.comparison.map((row) => (
              <View key={row.before} style={styles.comparisonRow}>
                <View style={styles.comparisonCellBefore}>
                  <Feather name="x" size={13} color={colors.danger} />
                  <Text style={styles.comparisonText}>{row.before}</Text>
                </View>
                <View style={styles.comparisonCellAfter}>
                  <Feather name="check" size={13} color={colors.success} />
                  <Text style={styles.comparisonText}>{row.after}</Text>
                </View>
              </View>
            ))}
          </View>
        </Container>

        {/* ---- Secondary features ---- */}
        <Container style={styles.section}>
          <Text style={styles.eyebrow}>Et bien plus encore</Text>
          <View style={styles.secondaryGrid}>
            {SECONDARY_FEATURES.map((f) => (
              <View key={f.title} style={styles.secondaryCard}>
                <Feather name={f.icon} size={16} color={colors.textMuted} />
                <Text style={styles.secondaryTitle}>{f.title}</Text>
                <Text style={styles.secondaryText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </Container>

        <SwissSection />
        <PricingSection />

        {/* ---- FAQ ---- */}
        <Container style={styles.section}>
          <Text style={styles.eyebrow}>Questions fréquentes</Text>
          <View style={styles.faqList}>
            {trade.faq.map((f, i) => (
              <View key={f.question} style={[styles.faqRow, i === trade.faq.length - 1 && styles.faqRowLast]}>
                <Text style={styles.faqQuestion}>{f.question}</Text>
                <Text style={styles.faqAnswer}>{f.answer}</Text>
              </View>
            ))}
          </View>
        </Container>

        {related.length ? (
          <Container style={styles.section}>
            <Text style={styles.eyebrow}>Voir aussi</Text>
            <View style={styles.relatedRow}>
              {related.map((r) => (
                <Link key={r.slug} href={`/${r.slug}` as any} asChild>
                  <Pressable style={styles.relatedChip}>
                    <Text style={styles.relatedChipText}>Cantia pour {r.tradeName}</Text>
                    <Feather name="arrow-right" size={13} color={colors.primary} />
                  </Pressable>
                </Link>
              ))}
              <Link href="/metiers" asChild>
                <Pressable style={styles.relatedChip}>
                  <Text style={styles.relatedChipText}>Tous les métiers</Text>
                  <Feather name="arrow-right" size={13} color={colors.primary} />
                </Pressable>
              </Link>
            </View>
          </Container>
        ) : null}

        {/* ---- Final CTA ---- */}
        <Container style={styles.closingOuter}>
          <View style={styles.closing}>
            <Text style={styles.closingTitle}>Gérez vos chantiers avec moins d'administratif</Text>
            <Text style={styles.closingText}>Découvrez Cantia gratuitement pendant 14 jours, aucun code nécessaire.</Text>
            <Link href={authHref('signup')} asChild>
              <Button title="Démarrer mon essai" variant="secondary" onPress={() => {}} style={styles.closingCta} />
            </Link>
          </View>
        </Container>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

// "pour charpentier" reads wrong in French — needs "les charpentiers" /
// "la charpente" depending on the noun. Rather than hand-writing a gendered
// preposition per trade in lib/trades.ts (one more field to keep in sync),
// this covers the two shapes actually used across Lot 1's tradeName values.
function genderedFor(tradeName: string): string {
  if (tradeName.endsWith('e') && !tradeName.endsWith('générale')) return `les ${tradeName}s`;
  if (tradeName === 'entreprise générale') return 'les entreprises générales';
  return `les ${tradeName}s`;
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  breadcrumbOuter: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  breadcrumbLink: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, color: colors.textMuted, textDecorationLine: 'underline' },
  breadcrumbSep: { fontSize: fontSize.xs, color: colors.textMuted },
  breadcrumbCurrent: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, color: colors.text, fontWeight: '700' },
  heroOuter: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  heroInner: { alignItems: 'center' },
  kickerPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  kickerText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 40,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 46,
    textAlign: 'center',
  } as unknown as ViewStyle,
  subtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 620,
  },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl },
  heroTrust: { marginTop: spacing.md, fontSize: fontSize.sm, color: colors.textMuted },
  section: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  eyebrow: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    maxWidth: 640,
  },
  painList: { gap: spacing.md },
  painCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  painProblem: { fontFamily: marketingFonts.body, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  painRow: { gap: 2 },
  painLabel: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  painLabelAccent: { color: colors.primary },
  painText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  usageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  usageCard: {
    flex: 1,
    minWidth: 260,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  usageIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  usageTitle: { fontFamily: marketingFonts.body, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  usageText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  scenarioCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    padding: spacing.xl,
    gap: spacing.xs,
    maxWidth: 720,
    alignSelf: 'center',
  },
  scenarioTitle: { fontFamily: marketingFonts.body, fontSize: fontSize.md, fontWeight: '800', color: colors.primaryDark, marginTop: spacing.xs },
  scenarioText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.primaryDark, lineHeight: 21 },
  comparisonTable: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  comparisonHeaderRow: { flexDirection: 'row' },
  comparisonHeaderText: {
    flex: 1,
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  comparisonBefore: { color: colors.danger, backgroundColor: colors.dangerSoft },
  comparisonAfter: { color: colors.success, backgroundColor: colors.successSoft },
  comparisonRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  comparisonCellBefore: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.md, borderRightWidth: 1, borderRightColor: colors.border },
  comparisonCellAfter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.md },
  comparisonText: { flex: 1, fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.text, lineHeight: 19 },
  secondaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  secondaryCard: {
    flex: 1,
    minWidth: 200,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: 4,
  },
  secondaryTitle: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginTop: 2 },
  secondaryText: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  faqList: { maxWidth: 760 },
  faqRow: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 6 },
  faqRowLast: { borderBottomWidth: 0 },
  faqQuestion: { fontFamily: marketingFonts.body, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  faqAnswer: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 21, maxWidth: 640 },
  relatedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  relatedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  relatedChipText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  closingOuter: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  closing: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  closingTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.4,
    textAlign: 'center',
    maxWidth: 520,
  },
  closingText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 440,
  },
  closingCta: { marginTop: spacing.xl, borderWidth: 0 },
});
