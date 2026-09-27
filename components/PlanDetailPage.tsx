import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { TFunction } from 'i18next';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen, Switch } from './ui';
import { CtaButton } from './landing/CtaButton';
import { SectionHead } from './landing/SectionHead';
import { pageWrap } from './landing/PageHero';
import { SwissCross } from './SwissCross';
import { bodyInk, ink, rule } from './landing/brand';
import { Heading } from './Heading';
import { MarketingHead } from './MarketingHead';
import { MarketingFooter, MarketingNav } from './MarketingChrome';
import { supabase } from '../lib/supabase';
import { breakpoints, colors, spacing } from '../lib/theme';
import { displayType, marketingFonts, monoType } from '../lib/marketingTheme';
import { authHref, planHref } from '../lib/appHost';
import { getAppLocale, useTranslation } from '../lib/translations';
import type { Plan } from '../lib/types';

type PlanId = 'solo' | 'equipe' | 'pro';
type IconName = keyof typeof Feather.glyphMap;

const PLAN_ORDER: PlanId[] = ['solo', 'equipe', 'pro'];
const NEXT_PLAN: Record<PlanId, PlanId | null> = { solo: 'equipe', equipe: 'pro', pro: null };
// Not backed by a `plans` column — priority support is a support-process
// promise, not a feature flag, so it's kept here rather than invented in
// the database. Matches the existing "Support prioritaire" claim in
// authChoosePlan.planHighlights.pro.
const PRIORITY_SUPPORT: Record<PlanId, boolean> = { solo: false, equipe: false, pro: true };

type CompareCell = { text: string } | { bool: boolean };

interface CompareRow {
  label: string;
  cells: Record<PlanId, CompareCell>;
}

function formatStorage(mb: number): string {
  return `${(mb / 1024).toFixed(mb < 1024 ? 1 : 0)} Go`;
}

// Builds the full side-by-side comparison table from the live `plans` rows
// — every number here comes straight from Supabase, never retyped, so a
// price or quota can only ever be wrong in one place (the `plans` table
// itself, same principle as PricingSection.tsx).
function buildCompareRows(t: TFunction, plansById: Record<string, Plan>): CompareRow[] {
  const cellFor = <T,>(get: (p: Plan) => T, format: (v: T) => CompareCell): Record<PlanId, CompareCell> => {
    const out = {} as Record<PlanId, CompareCell>;
    for (const id of PLAN_ORDER) {
      const p = plansById[id];
      out[id] = p ? format(get(p)) : { text: '—' };
    }
    return out;
  };

  return [
    {
      label: t('planPage.comparePrice'),
      cells: cellFor(
        // numeric column, arrives as a string ("39.00") from PostgREST —
        // Number(...) it before ever calling .toFixed, or a string with no
        // .toFixed method crashes this row on every /plans/* page load.
        (p) => (p.price_chf_monthly != null ? Number(p.price_chf_monthly) : null),
        (v) => ({ text: v != null ? t('planPage.comparePerMonth', { count: `CHF ${Number.isInteger(v) ? v : v.toFixed(2)}` }) : '—' }),
      ),
    },
    { label: t('planPage.compareDevisFactures'), cells: cellFor(() => true, () => ({ text: t('planPage.compareUnlimited') })) },
    { label: t('planPage.compareStorage'), cells: cellFor((p) => p.storage_quota_mb, (v) => ({ text: formatStorage(v) })) },
    { label: t('planPage.compareMembers'), cells: cellFor((p) => p.max_members, (v) => ({ text: t('planPage.compareUpTo', { count: v }) })) },
    {
      label: t('planPage.compareAi'),
      cells: cellFor(
        (p) => p.max_ai_uses_per_month,
        (v) => ({ text: v != null ? t('planPage.comparePerMonth', { count: v }) : t('planPage.compareUnlimited') }),
      ),
    },
    { label: t('planPage.comparePlanning'), cells: cellFor((p) => p.has_planning, (v) => ({ bool: v })) },
    { label: t('planPage.compareBexio'), cells: cellFor((p) => p.has_bexio_integration, (v) => ({ bool: v })) },
    { label: t('planPage.compareDocLocale'), cells: cellFor((p) => p.has_document_locale_override, (v) => ({ bool: v })) },
    {
      label: t('planPage.comparePrioritySupport'),
      cells: (() => {
        const out = {} as Record<PlanId, CompareCell>;
        for (const id of PLAN_ORDER) out[id] = { bool: PRIORITY_SUPPORT[id] };
        return out;
      })(),
    },
  ];
}

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
  const { width } = useWindowDimensions();
  const isTablet = width < breakpoints.desktop;
  const titleSize = isTablet ? 56 : 96;

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
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={name ? `${name} | Cantia` : 'Cantia'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <View style={[styles.wrap, styles.hero, isTablet && styles.heroCompact]}>
          <View style={{ flex: 1.2, maxWidth: 720 }}>
            <View style={styles.kicker}>
              <SwissCross size={13} />
              <Text style={styles.kickerText}>{t('pricingSection.eyebrow')}</Text>
            </View>
            <Heading level={1} style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 0.94 }] as any}>{name || ' '}</Heading>
            <Text style={styles.lede}>{heroText}</Text>
            <View style={styles.ctaRow}>
              <Link href={authHref('signup')} asChild>
                <CtaButton title={t('planPage.ctaTrial')} />
              </Link>
              <Link href={pricingHref as any}>
                <Text style={styles.underlineLink}>{t('planPage.ctaAllPlans')}</Text>
              </Link>
            </View>
          </View>
          {plan ? (
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>{t('planPage.comparePrice')}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currency}>CHF</Text>
                <Text style={styles.price}>{Number.isInteger(displayMonthly) ? displayMonthly : displayMonthly?.toFixed(2)}</Text>
                <Text style={styles.period}>{t('planPage.perMonth')}</Text>
              </View>
              <Pressable onPress={() => setBillingInterval((v) => (v === 'year' ? 'month' : 'year'))} style={styles.billingToggle}>
                <Text style={styles.billingToggleLabel}>{billingInterval === 'year' ? t('authChoosePlan.billingYearly') : t('authChoosePlan.billingMonthly')}</Text>
                <Switch value={isYearly} onChange={(v) => setBillingInterval(v ? 'year' : 'month')} />
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={[styles.wrap, styles.section]}>
          <SectionHead title={t('planPage.keyFeaturesTitle')} />
          <View style={styles.grid}>
            {(keyFeatures ?? []).map((f) => (
              <View key={f.title} style={styles.gridCell}>
                <Feather name={f.icon} size={20} color={colors.primary} />
                <Text style={styles.cellTitle}>{f.title}</Text>
                <Text style={styles.bodyText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.wrap, styles.section, styles.split, isTablet && styles.splitCompact]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listHead}>{t('planPage.everyPlanTitle')}</Text>
            {(everyPlanItems ?? []).map((item) => (
              <View key={item} style={styles.listRow}>
                <Feather name="check" size={16} color={colors.primary} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.listHead}>{t('planPage.notIncludedTitle')}</Text>
            {notIncluded && notIncluded.length > 0 ? (
              <>
                {notIncluded.map((item) => (
                  <View key={item} style={styles.listRow}>
                    <Feather name="minus" size={16} color={colors.textMuted} />
                    <Text style={[styles.listText, { color: bodyInk }]}>{item}</Text>
                  </View>
                ))}
                {nextPlanId ? (
                  <Link href={planHref(nextPlanId) as any}>
                    <Text style={styles.textLink}>{t('planPage.notIncludedUpgradeCta', { name: plans[nextPlanId]?.name ?? '' })}</Text>
                  </Link>
                ) : null}
              </>
            ) : (
              <View style={styles.listRow}>
                <Feather name="award" size={18} color={colors.primary} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.listText}>{t('planPage.notIncludedNoneTitle')}</Text>
                  <Text style={styles.bodyText}>{t('planPage.notIncludedNoneText', { name })}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {Object.keys(plans).length === PLAN_ORDER.length ? (
          <View style={[styles.wrap, styles.section]}>
            <SectionHead title={t('planPage.compareTitle')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.compareTable}>
                <View style={[styles.compareRow, styles.compareHead]}>
                  <View style={styles.compareLabelCol} />
                  {PLAN_ORDER.map((id) => (
                    <View key={id} style={[styles.compareCol, id === planId && styles.compareColActive]}>
                      {id === planId ? <Text style={styles.compareBadge}>{t('planPage.compareCurrentBadge')}</Text> : null}
                      <Link href={planHref(id) as any} asChild>
                        <Pressable disabled={id === planId}>
                          <Text style={styles.comparePlanName}>{plans[id]?.name}</Text>
                        </Pressable>
                      </Link>
                    </View>
                  ))}
                </View>
                {buildCompareRows(t, plans).map((row) => (
                  <View key={row.label} style={styles.compareRow}>
                    <View style={styles.compareLabelCol}>
                      <Text style={styles.compareLabel}>{row.label}</Text>
                    </View>
                    {PLAN_ORDER.map((id) => {
                      const cell = row.cells[id];
                      return (
                        <View key={id} style={[styles.compareCol, id === planId && styles.compareColActive]}>
                          {'bool' in cell ? (
                            <Feather name={cell.bool ? 'check' : 'minus'} size={16} color={cell.bool ? colors.primary : colors.textMuted} />
                          ) : (
                            <Text style={styles.compareCellText}>{cell.text}</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : null}

        <View style={[styles.wrap, styles.section]}>
          <SectionHead title={t('planPage.faqEyebrow')} />
          {[
            { q: t('planPage.faqChangePlanQ'), a: t('planPage.faqChangePlanA') },
            { q: t('planPage.faqCommitmentQ'), a: t('planPage.faqCommitmentA') },
            { q: t('planPage.faqVatQ'), a: t('planPage.faqVatA') },
          ].map((f) => (
            <View key={f.q} style={styles.faqRow}>
              <Text style={styles.faqQuestion}>{f.q}</Text>
              <Text style={styles.bodyText}>{f.a}</Text>
            </View>
          ))}
          <View style={styles.otherPlans}>
            <Text style={styles.listHeadInline}>{t('planPage.otherPlansTitle')}</Text>
            {PLAN_ORDER.filter((id) => id !== planId).map((id) => (
              <Link key={id} href={planHref(id) as any}>
                <Text style={styles.underlineLink}>{plans[id]?.name ?? id} →</Text>
              </Link>
            ))}
          </View>
        </View>

        <View style={styles.closing}>
          <View style={styles.wrap}>
            <Text style={styles.closingTitle}>{t('planPage.closingTitle', { name })}</Text>
            <Text style={styles.closingText}>{t('planPage.closingText')}</Text>
            <Link href={authHref('signup')} asChild>
              <CtaButton title={t('planPage.ctaTrial')} style={{ marginTop: spacing.xl }} />
            </Link>
          </View>
        </View>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: pageWrap,
  section: { paddingTop: 96 },
  hero: { flexDirection: 'row', alignItems: 'flex-end', gap: 64, paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  heroCompact: { flexDirection: 'column', alignItems: 'stretch', gap: spacing.xxl },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.xl },
  kickerText: { ...monoType, fontSize: 11.5, letterSpacing: 0.3, color: '#674932', textTransform: 'uppercase' },
  title: { ...displayType, fontWeight: '800', color: ink, marginTop: 0, marginBottom: 0 },
  lede: { fontFamily: marketingFonts.body, fontSize: 19, lineHeight: 29, color: bodyInk, marginTop: spacing.xl, maxWidth: 580 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xl, marginTop: spacing.xl },
  underlineLink: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: ink, borderBottomWidth: 1.5, borderBottomColor: ink, paddingBottom: 2 },
  textLink: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: colors.primary, marginTop: spacing.lg },

  priceBlock: { flex: 0.8, borderTopWidth: 1.5, borderTopColor: ink, paddingTop: spacing.md, gap: spacing.sm },
  priceLabel: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  currency: { ...monoType, fontSize: 14, color: ink },
  price: { ...displayType, fontSize: 120, lineHeight: 118, fontWeight: '800', color: ink },
  period: { fontFamily: marketingFonts.body, fontSize: 16, color: bodyInk },
  billingToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderTopWidth: 1, borderTopColor: rule, paddingTop: spacing.md },
  billingToggleLabel: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: ink },

  bodyText: { fontFamily: marketingFonts.body, fontSize: 16, lineHeight: 25, color: bodyInk },
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1.5, borderTopColor: ink },
  gridCell: { flexGrow: 1, flexBasis: 300, gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.xl, paddingRight: spacing.xl, borderBottomWidth: 1, borderBottomColor: rule },
  cellTitle: { fontFamily: marketingFonts.body, fontSize: 19, fontWeight: '700', color: ink, lineHeight: 25 },

  split: { flexDirection: 'row', gap: 64 },
  splitCompact: { flexDirection: 'column', gap: spacing.xxl },
  listHead: { ...monoType, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary, paddingBottom: spacing.md, borderBottomWidth: 1.5, borderBottomColor: ink },
  listHeadInline: { ...monoType, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: rule },
  listText: { flex: 1, fontFamily: marketingFonts.body, fontSize: 16, fontWeight: '600', lineHeight: 23, color: ink },

  compareTable: { minWidth: 720, width: '100%', borderTopWidth: 1.5, borderTopColor: ink },
  compareHead: { borderBottomColor: ink },
  compareRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: rule },
  compareLabelCol: { width: 260, paddingVertical: 14, paddingRight: spacing.lg },
  compareLabel: { fontFamily: marketingFonts.body, fontSize: 15, color: bodyInk },
  compareCol: { flex: 1, minWidth: 150, alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.sm, gap: 4 },
  compareColActive: { backgroundColor: 'rgba(188,90,49,0.07)' },
  compareBadge: { ...monoType, fontSize: 9.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary },
  comparePlanName: { ...displayType, fontSize: 24, fontWeight: '800', color: ink },
  compareCellText: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: ink, textAlign: 'center' },

  faqRow: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: rule, gap: 6, maxWidth: 900 },
  faqQuestion: { fontFamily: marketingFonts.body, fontSize: 18, fontWeight: '700', color: ink },
  otherPlans: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xl, marginTop: spacing.xxl },

  closing: { backgroundColor: ink, paddingVertical: 96, marginTop: 96 },
  closingTitle: { ...displayType, fontSize: 52, lineHeight: 52, fontWeight: '800', color: '#FBF6EE', maxWidth: 860 },
  closingText: { fontFamily: marketingFonts.body, fontSize: 17, lineHeight: 27, color: '#D5C8B8', maxWidth: 620, marginTop: spacing.lg },
});
