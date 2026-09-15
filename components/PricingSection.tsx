import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Container, Switch } from './ui';
import { supabase } from '../lib/supabase';
import { useMarketingDict } from '../lib/i18n';
import { getAppLocale, useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref, planHref } from '../lib/appHost';
import type { Plan } from '../lib/types';

// Card design matches the "Cantia_Landing" reference package's pricing
// section exactly (cream/peach cards, floating ribbon on the featured
// plan, capacity chips, divider + "Inclus dans X" list) — see that
// reference's style.css .plan/.plan.featured/.recommended rules. Colors
// below (#FAF6EE, #FFFAF2) are that reference's own values, distinct from
// the general theme tokens on purpose, to match it precisely.
const CARD_BG = '#FAF6EE';
const CARD_BG_FEATURED = '#FFFAF2';

// The single pricing block reused by the homepage's /#pricing anchor and
// every /[metier] trade page — same Supabase query as choose-plan.tsx
// (excludes 'free' and 'decouverte', is_contact_only filtered client-side),
// same t.pricing copy, so a price or a plan name can only ever be wrong in
// one place: the `plans` table itself. Never hardcode a number here.
export function PricingSection({ compact }: { compact?: boolean }) {
  const t = useMarketingDict();
  const { t: tr } = useTranslation();
  const PLAN_HIGHLIGHTS = tr('authChoosePlan.planHighlights', { returnObjects: true }) as Record<string, string[]>;
  const PLAN_TAGLINE = tr('authChoosePlan.planTaglines', { returnObjects: true }) as Record<string, string>;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .neq('id', 'free')
      .neq('id', 'decouverte')
      .eq('is_contact_only', false)
      .order('price_chf_monthly', { ascending: true })
      .then(
        ({ data }) => {
          setPlans(data ?? []);
          setLoading(false);
        },
        (err: unknown) => {
          // Without this, a network hiccup leaves the section stuck on its
          // skeleton forever — the single biggest conversion block on the page.
          console.error('PricingSection: failed to load plans', err);
          setLoading(false);
        },
      );
  }, []);

  const visiblePlans = plans.filter((p) => !p.is_contact_only);

  return (
    <Container style={styles.outer}>
      {compact ? null : (
        <>
          <Text style={[styles.eyebrow, styles.centerText]}>{tr('pricingSection.eyebrow')}</Text>
          <Text style={[styles.title, styles.centerText]}>{t.pricing.title}</Text>
          <Text style={[styles.subtitle, styles.centerText]}>{t.pricing.subtitle}</Text>
        </>
      )}
      <Pressable onPress={() => setBillingInterval((v) => (v === 'year' ? 'month' : 'year'))} style={styles.billingToggle}>
        <Text style={styles.billingToggleLabel}>{billingInterval === 'year' ? t.pricing.yearly : t.pricing.monthly}</Text>
        <View style={styles.billingToggleSaveBadge}>
          <Text style={styles.billingToggleSaveText}>{t.pricing.yearlySavings}</Text>
        </View>
        <Switch value={billingInterval === 'year'} onChange={(v) => setBillingInterval(v ? 'year' : 'month')} />
      </Pressable>

      <View style={styles.grid}>
        {loading
          ? [0, 1, 2].map((i) => <PriceCardSkeleton key={i} featured={i === 1} />)
          : visiblePlans.map((p, i) => {
              const isYearly = billingInterval === 'year';
              // PostgREST serializes numeric columns as JSON strings (to
              // avoid float precision loss), so price_chf_monthly/_yearly
              // arrive as e.g. "39.00", not a number — Number(...) here,
              // once, rather than relying on `/ 12` to coerce it only in
              // the yearly branch and crashing .toFixed() in the monthly
              // one (confirmed live: this crashed the whole section).
              const monthlyPrice = Number(p.price_chf_monthly ?? 0);
              const yearlyPrice = p.price_chf_yearly != null ? Number(p.price_chf_yearly) : null;
              const displayMonthly = isYearly && yearlyPrice != null ? yearlyPrice / 12 : monthlyPrice;
              const featured = p.id === 'equipe';
              const storageGb = p.storage_quota_mb / 1024;
              const includesLabel =
                i === 0
                  ? tr('pricingSection.includesFirst', { plan: p.name })
                  : tr('pricingSection.includesNext', { plan: visiblePlans[i - 1].name });
              return (
                <View key={p.id} style={[styles.cardWrap, featured && styles.cardWrapFeatured]}>
                  {featured ? (
                    <View style={styles.ribbon}>
                      <Text style={styles.ribbonText}>{t.pricing.badge}</Text>
                    </View>
                  ) : null}
                  <View style={[styles.card, featured && styles.cardFeatured]}>
                    <Text style={styles.planName}>{p.name}</Text>
                    {PLAN_TAGLINE[p.id] ? <Text style={styles.planIntro}>{PLAN_TAGLINE[p.id]}</Text> : null}

                    <View style={styles.capacityRow}>
                      <View style={styles.capacityChip}>
                        <Text style={styles.capacityChipText}>
                          <Text style={styles.capacityChipNum}>{p.max_members}</Text> {p.max_members === 1 ? t.pricing.memberSingular : t.pricing.memberPlural}
                        </Text>
                      </View>
                      <View style={styles.capacityChip}>
                        <Text style={styles.capacityChipText}>
                          <Text style={styles.capacityChipNum}>{Number.isInteger(storageGb) ? storageGb : storageGb.toFixed(1)}</Text> {t.pricing.storageSuffix}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.currency}>CHF</Text>
                      <Text style={styles.price}>{Number.isInteger(displayMonthly) ? displayMonthly : displayMonthly.toFixed(2)}</Text>
                      <Text style={styles.period}>{tr('pricingSection.perMonth')}</Text>
                    </View>
                    {isYearly && yearlyPrice != null ? (
                      <Text style={styles.yearlyNote}>{tr('pricingSection.billedYearlyAmount', { amount: yearlyPrice.toFixed(2) })}</Text>
                    ) : null}

                    <Link href={authHref('signup')} asChild>
                      <Pressable style={StyleSheet.flatten([styles.ctaButton, !featured && styles.ctaButtonOutline])}>
                        <Text style={[styles.ctaButtonText, !featured && styles.ctaButtonTextOutline]}>{t.pricing.paidCta}</Text>
                        <Feather name="arrow-up-right" size={15} color={featured ? '#fff' : colors.text} />
                      </Pressable>
                    </Link>

                    <View style={styles.includesBlock}>
                      <Text style={styles.includesLabel}>{includesLabel}</Text>
                      <View style={styles.includesList}>
                        {(PLAN_HIGHLIGHTS[p.id] ?? []).map((text) => (
                          <Text key={text} style={styles.includesItem}>{text}</Text>
                        ))}
                      </View>
                    </View>

                    <Link href={planHref(p.id) as any} asChild>
                      <Pressable hitSlop={6}>
                        <Text style={styles.detailLink}>{tr('pricingSection.learnMore')}</Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              );
            })}
      </View>

      <Link href={(getAppLocale() === 'de' ? '/de/sur-mesure' : getAppLocale() === 'it' ? '/it/sur-mesure' : '/sur-mesure') as any} asChild>
        <Pressable style={StyleSheet.flatten([styles.contactCard, styles.contactCardInner])} hitSlop={8}>
          <Feather name="tool" size={16} color={colors.textMuted} />
          <Text style={styles.contactCardText}>
            {tr('pricingSection.contactText')}{' '}
            <Text style={styles.contactCardLink}>{tr('pricingSection.contactLink')}</Text>
          </Text>
        </Pressable>
      </Link>
    </Container>
  );
}

function PriceCardSkeleton({ featured }: { featured?: boolean }) {
  return (
    <View style={[styles.cardWrap, featured && styles.cardWrapFeatured]}>
      <View style={[styles.card, featured && styles.cardFeatured, styles.cardSkeleton]}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '50%', height: 28, marginTop: spacing.sm }]} />
        <View style={[styles.skeletonLine, { width: '80%', marginTop: spacing.lg }]} />
        <View style={[styles.skeletonLine, { width: '70%' }]} />
        <View style={[styles.skeletonLine, { width: '60%' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  centerText: { textAlign: 'center' },
  eyebrow: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
    maxWidth: 560,
  },
  subtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
    maxWidth: 480,
    lineHeight: 22,
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
    marginBottom: spacing.xl,
  },
  billingToggleLabel: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  billingToggleSaveBadge: { backgroundColor: colors.successSoft, borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 1 },
  billingToggleSaveText: { fontSize: 10, fontWeight: '700', color: colors.success },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.lg,
    width: '100%',
  },
  cardWrap: {
    width: 290,
    marginTop: 22,
  },
  cardWrapFeatured: {
    marginTop: 0,
  },
  ribbon: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 8,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  ribbonText: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    gap: 0,
    padding: 26,
    borderRadius: radius.md,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardFeatured: {
    backgroundColor: CARD_BG_FEATURED,
    borderColor: colors.primary,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  cardSkeleton: { opacity: 0.6 },
  skeletonLine: { height: 14, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, width: '90%' },
  planName: { fontFamily: marketingFonts.display, fontSize: 25, fontWeight: '600', color: colors.text },
  planIntro: { fontFamily: marketingFonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: 8, marginBottom: spacing.lg, minHeight: 38 },
  capacityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  capacityChip: { backgroundColor: 'rgba(35,26,18,0.05)', borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 10 },
  capacityChipText: { fontFamily: marketingFonts.body, fontSize: 12, color: colors.textMuted },
  capacityChipNum: { fontWeight: '700', color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  currency: { fontFamily: marketingFonts.body, fontSize: 12, color: colors.textMuted },
  price: { fontFamily: marketingFonts.body, fontSize: 38, fontWeight: '600', letterSpacing: -1.5, color: colors.text },
  period: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  yearlyNote: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 6, marginBottom: spacing.lg },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 13,
    marginTop: spacing.lg,
  },
  ctaButtonOutline: { backgroundColor: '#fff', borderColor: colors.border },
  ctaButtonText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, fontWeight: '700', color: '#fff' },
  ctaButtonTextOutline: { color: colors.text },
  includesBlock: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xl, paddingTop: spacing.lg },
  includesLabel: { fontFamily: marketingFonts.body, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted, marginBottom: spacing.sm },
  includesList: { gap: 6 },
  includesItem: { fontFamily: marketingFonts.body, fontSize: 13, color: colors.text, lineHeight: 19 },
  detailLink: {
    fontFamily: marketingFonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(188,90,49,0.35)',
    paddingBottom: 2,
  },
  contactCard: { marginTop: spacing.xxl },
  contactCardInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, maxWidth: 460, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  contactCardText: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19 },
  contactCardLink: { color: colors.primary, fontWeight: '700' },
});
