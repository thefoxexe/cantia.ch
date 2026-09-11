import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Container, Screen, Switch } from './ui';
import { Heading } from './Heading';
import { MarketingHead } from './MarketingHead';
import { MarketingFooter, MarketingNav } from './MarketingChrome';
import { supabase } from '../lib/supabase';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref, planHref } from '../lib/appHost';
import { getAppLocale, useTranslation } from '../lib/translations';
import type { Plan } from '../lib/types';

type PlanId = 'solo' | 'equipe' | 'pro';
type IconName = keyof typeof Feather.glyphMap;

const PLAN_ORDER: PlanId[] = ['solo', 'equipe', 'pro'];
const NEXT_PLAN: Record<PlanId, PlanId | null> = { solo: 'equipe', equipe: 'pro', pro: null };

// The dedicated, highly-converting per-plan page opened from "En savoir
// plus" on both the marketing pricing cards (PricingSection) and the
// in-app choose-plan screen — one component driven entirely by i18n keys
// (lib/translations/*.ts, `planPage` namespace) plus a live `plans` row for
// the numbers (price/storage/members/AI quota), so the /de and /it route
// files only need `forceLocale(...)` + this component, never their own copy
// (unlike the /solutions/* pages, which hardcode prose per language).
export function PlanDetailPage({ planId }: { planId: PlanId }) {
  const { t } = useTranslation();
  const pricingHref = getAppLocale() === 'de' ? '/de/#pricing' : getAppLocale() === 'it' ? '/it/#pricing' : '/#pricing';
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .in('id', PLAN_ORDER)
      .then(({ data }) => {
        const byId: Record<string, Plan> = {};
        (data ?? []).forEach((p) => { byId[p.id] = p; });
        setPlans(byId);
      });
  }, []);

  const plan = plans[planId];
  const keyFeatures = t(`planPage.plans.${planId}.keyFeatures`, { returnObjects: true }) as { icon: IconName; title: string; text: string }[];
  const notIncluded = t(`planPage.plans.${planId}.notIncluded`, { returnObjects: true }) as string[];
  const everyPlanItems = t('planPage.everyPlanItems', { returnObjects: true }) as string[];
  const heroText = t(`planPage.plans.${planId}.heroText`);
  const nextPlanId = NEXT_PLAN[planId];
  const name = plan?.name ?? '';

  const isYearly = billingInterval === 'year';
  const displayMonthly = plan ? (isYearly && plan.price_chf_yearly != null ? plan.price_chf_yearly / 12 : plan.price_chf_monthly ?? 0) : null;

  return (
    <Screen>
      <MarketingHead title={name ? `${name} | Cantia` : 'Cantia'} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.heroOuter}>
          <View style={styles.kickerPill}>
            <Text style={styles.kickerText}>{t('pricingSection.eyebrow')}</Text>
          </View>
          <Heading level={1} style={styles.title as any}>{name}</Heading>
          <Text style={styles.subtitle}>{heroText}</Text>

          {plan ? (
            <>
              <Pressable onPress={() => setBillingInterval((v) => (v === 'year' ? 'month' : 'year'))} style={styles.billingToggle}>
                <Text style={styles.billingToggleLabel}>{billingInterval === 'year' ? t('authChoosePlan.billingYearly') : t('authChoosePlan.billingMonthly')}</Text>
                <Switch value={isYearly} onChange={(v) => setBillingInterval(v ? 'year' : 'month')} />
              </Pressable>
              <View style={styles.priceRow}>
                <Text style={styles.price}>CHF {Number.isInteger(displayMonthly) ? displayMonthly : displayMonthly?.toFixed(2)}</Text>
                <Text style={styles.period}>{t('planPage.perMonth')}</Text>
              </View>
            </>
          ) : null}

          <View style={styles.ctaRow}>
            <Link href={authHref('signup')} asChild>
              <Button title={t('planPage.ctaTrial')} onPress={() => {}} />
            </Link>
            <Link href={pricingHref as any} asChild>
              <Button title={t('planPage.ctaAllPlans')} variant="secondary" onPress={() => {}} />
            </Link>
          </View>
        </Container>

        <Container style={styles.section}>
          <Text style={styles.sectionEyebrow}>{t('planPage.keyFeaturesTitle')}</Text>
          <View style={styles.featureGrid}>
            {(keyFeatures ?? []).map((f, i) => (
              <View key={f.title} style={styles.featureCard}>
                <View style={styles.featureCardTop}>
                  <View style={styles.featureIcon}>
                    <Feather name={f.icon} size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.featureIndex}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </Container>

        {plan ? (
          <Container style={styles.section}>
            <View style={styles.statsRow}>
              <StatCard value={`${(plan.storage_quota_mb / 1024).toFixed(plan.storage_quota_mb < 1024 ? 1 : 0)}`} label={t('planPage.statStorage')} />
              <StatCard value={`${plan.max_members}`} label={t('planPage.statMembers')} />
              {plan.max_ai_uses_per_month ? <StatCard value={`${plan.max_ai_uses_per_month}`} label={t('planPage.statAi')} /> : null}
            </View>
          </Container>
        ) : null}

        <Container style={styles.section}>
          <Text style={styles.sectionEyebrow}>{t('planPage.everyPlanTitle')}</Text>
          <View style={styles.checklistGrid}>
            {(everyPlanItems ?? []).map((item) => (
              <View key={item} style={styles.checklistRow}>
                <Feather name="check" size={15} color={colors.success} />
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
        </Container>

        <Container style={styles.section}>
          <Text style={styles.sectionEyebrow}>{t('planPage.notIncludedTitle')}</Text>
          {notIncluded && notIncluded.length > 0 ? (
            <>
              <View style={styles.checklistGrid}>
                {notIncluded.map((item) => (
                  <View key={item} style={styles.checklistRow}>
                    <Feather name="x" size={15} color={colors.textMuted} />
                    <Text style={styles.checklistTextMuted}>{item}</Text>
                  </View>
                ))}
              </View>
              {nextPlanId ? (
                <Link href={planHref(nextPlanId) as any} asChild>
                  <Pressable style={styles.upgradeLink}>
                    <Text style={styles.upgradeLinkText}>{t('planPage.notIncludedUpgradeCta', { name: plans[nextPlanId]?.name ?? '' })}</Text>
                  </Pressable>
                </Link>
              ) : null}
            </>
          ) : (
            <View style={styles.noneCard}>
              <Feather name="award" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noneCardTitle}>{t('planPage.notIncludedNoneTitle')}</Text>
                <Text style={styles.noneCardText}>{t('planPage.notIncludedNoneText', { name })}</Text>
              </View>
            </View>
          )}
        </Container>

        <Container style={styles.section}>
          <Text style={styles.sectionEyebrow}>{t('planPage.faqEyebrow')}</Text>
          <View style={styles.faqList}>
            {[
              { q: t('planPage.faqChangePlanQ'), a: t('planPage.faqChangePlanA') },
              { q: t('planPage.faqCommitmentQ'), a: t('planPage.faqCommitmentA') },
              { q: t('planPage.faqVatQ'), a: t('planPage.faqVatA') },
            ].map((f, i, arr) => (
              <View key={f.q} style={[styles.faqRow, i === arr.length - 1 && styles.faqRowLast]}>
                <Text style={styles.faqQuestion}>{f.q}</Text>
                <Text style={styles.faqAnswer}>{f.a}</Text>
              </View>
            ))}
          </View>
        </Container>

        <Container style={styles.section}>
          <Text style={styles.sectionEyebrow}>{t('planPage.otherPlansTitle')}</Text>
          <View style={styles.relatedRow}>
            {PLAN_ORDER.filter((id) => id !== planId).map((id) => (
              <Link key={id} href={planHref(id) as any} asChild>
                <Pressable style={styles.relatedChip}>
                  <Text style={styles.relatedChipText}>{plans[id]?.name ?? id}</Text>
                  <Feather name="arrow-right" size={13} color={colors.primary} />
                </Pressable>
              </Link>
            ))}
          </View>
        </Container>

        <Container style={styles.closingOuter}>
          <View style={styles.closing}>
            <Text style={styles.closingTitle}>{t('planPage.closingTitle', { name })}</Text>
            <Text style={styles.closingText}>{t('planPage.closingText')}</Text>
            <Link href={authHref('signup')} asChild>
              <Button title={t('planPage.ctaTrial')} variant="secondary" onPress={() => {}} style={styles.closingCta} />
            </Link>
          </View>
        </Container>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  heroOuter: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  kickerPill: {
    alignSelf: 'center',
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
    fontSize: 44,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 50,
    textAlign: 'center',
  } as unknown as ViewStyle,
  subtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 560,
  },
  billingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  billingToggleLabel: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: spacing.md },
  price: { fontFamily: marketingFonts.body, fontSize: 40, fontWeight: '800', color: colors.text },
  period: { fontSize: fontSize.md, color: colors.textMuted, marginBottom: 6 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl },
  section: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  sectionEyebrow: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: spacing.lg,
  },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  featureCard: {
    flex: 1,
    minWidth: 240,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  featureCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIndex: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, fontWeight: '700', color: colors.border },
  featureTitle: { fontFamily: marketingFonts.body, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  featureText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: {
    flex: 1,
    minWidth: 150,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
  },
  statValue: { fontFamily: marketingFonts.body, fontSize: 28, fontWeight: '800', color: '#fff' },
  statLabel: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.78)', marginTop: 2, textAlign: 'center' },
  checklistGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 260,
    flexGrow: 1,
    paddingVertical: 4,
  },
  checklistText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.text, flexShrink: 1 },
  checklistTextMuted: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, flexShrink: 1 },
  upgradeLink: { marginTop: spacing.md, alignSelf: 'flex-start' },
  upgradeLinkText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  noneCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  noneCardTitle: { fontFamily: marketingFonts.body, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  noneCardText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2, lineHeight: 19 },
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
  closingOuter: { maxWidth: 1040, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  closing: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  closingTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 30,
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
