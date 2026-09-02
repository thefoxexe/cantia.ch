import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Button, Container, Switch } from './ui';
import { supabase } from '../lib/supabase';
import { useMarketingDict } from '../lib/i18n';
import { useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';
import type { Plan } from '../lib/types';

// The single pricing block reused by the homepage's /#pricing anchor and
// every /[metier] trade page — same Supabase query as choose-plan.tsx
// (excludes 'free' and 'decouverte', is_contact_only filtered client-side),
// same t.pricing copy, so a price or a plan name can only ever be wrong in
// one place: the `plans` table itself. Never hardcode a number here.
export function PricingSection({ compact }: { compact?: boolean }) {
  const t = useMarketingDict();
  const { t: tr } = useTranslation();
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
      .then(({ data }) => {
        setPlans(data ?? []);
        setLoading(false);
      });
  }, []);

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
          ? [0, 1, 2].map((i) => <PriceCardSkeleton key={i} highlight={i === 1} />)
          : plans
              .filter((p) => !p.is_contact_only)
              .map((p) => {
                const isYearly = billingInterval === 'year';
                const displayMonthly = isYearly && p.price_chf_yearly != null ? p.price_chf_yearly / 12 : p.price_chf_monthly ?? 0;
                const dark = p.id === 'equipe';
                return (
                  <View key={p.id} style={[styles.card, dark && styles.cardDark]}>
                    {dark ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{t.pricing.badge}</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.planName, dark && styles.textOnDark]}>{p.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.price, dark && styles.textOnDark]}>
                        CHF {Number.isInteger(displayMonthly) ? displayMonthly : displayMonthly.toFixed(2)}
                      </Text>
                      <Text style={[styles.period, dark && styles.textMutedOnDark]}>{tr('pricingSection.perMonth')}</Text>
                    </View>
                    {isYearly && p.price_chf_yearly != null ? (
                      <Text style={[styles.yearlyNote, dark && styles.textMutedOnDark]}>
                        {tr('pricingSection.billedYearlyAmount', { amount: p.price_chf_yearly.toFixed(2) })}
                      </Text>
                    ) : null}
                    <View style={styles.features}>
                      <PriceFeature dark={dark} text={tr('pricingSection.storage', { amount: (p.storage_quota_mb / 1024).toFixed(p.storage_quota_mb < 1024 ? 1 : 0) })} />
                      <PriceFeature dark={dark} text={tr('pricingSection.membersUpTo', { count: p.max_members })} />
                      <PriceFeature dark={dark} text={tr('pricingSection.unlimitedDevisFactures')} />
                      <PriceFeature dark={dark} text={tr('pricingSection.planningRhTresorerie')} muted={!p.has_planning} included={p.has_planning} />
                      <PriceFeature dark={dark} text={tr('pricingSection.bexioIntegration')} muted={!p.has_bexio_integration} included={p.has_bexio_integration} />
                    </View>
                    <Link href={authHref('signup')} asChild>
                      <Button title={t.pricing.paidCta} onPress={() => {}} variant={dark ? 'primary' : 'secondary'} style={{ marginTop: spacing.lg }} />
                    </Link>
                  </View>
                );
              })}
      </View>

      <Link href="/sur-mesure" asChild>
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

function PriceFeature({ text, muted, included, dark }: { text: string; muted?: boolean; included?: boolean; dark?: boolean }) {
  return (
    <View style={styles.featureRow}>
      <Feather
        name={muted ? 'x' : 'check'}
        size={14}
        color={muted ? colors.textMuted : included === false ? colors.textMuted : dark ? '#fff' : colors.success}
      />
      <Text style={[styles.featureText, dark && styles.textOnDark, muted && (dark ? styles.textMutedOnDark : styles.featureTextMuted)]}>{text}</Text>
    </View>
  );
}

function PriceCardSkeleton({ highlight }: { highlight?: boolean }) {
  return (
    <View style={[styles.card, styles.cardSkeleton, highlight && styles.cardDark]}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: '50%', height: 28, marginTop: spacing.sm }]} />
      <View style={[styles.skeletonLine, { width: '80%', marginTop: spacing.lg }]} />
      <View style={[styles.skeletonLine, { width: '70%' }]} />
      <View style={[styles.skeletonLine, { width: '60%' }]} />
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
    marginBottom: spacing.lg,
  },
  billingToggleLabel: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  billingToggleSaveBadge: { backgroundColor: colors.successSoft, borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 1 },
  billingToggleSaveText: { fontSize: 10, fontWeight: '700', color: colors.success },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
    width: '100%',
  },
  card: {
    width: 280,
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSkeleton: { opacity: 0.6 },
  skeletonLine: { height: 14, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, width: '90%' },
  cardDark: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, marginBottom: spacing.xs },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  planName: { fontFamily: marketingFonts.body, fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  textOnDark: { color: '#fff' },
  textMutedOnDark: { color: 'rgba(255,255,255,0.7)' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: spacing.sm },
  price: { fontFamily: marketingFonts.body, fontSize: 28, fontWeight: '800', color: colors.text },
  period: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 },
  yearlyNote: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: -spacing.xs },
  features: { gap: spacing.xs, marginTop: spacing.xs },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  featureText: { fontSize: fontSize.sm, color: colors.text },
  featureTextMuted: { color: colors.textMuted },
  contactCard: { marginTop: spacing.xxl },
  contactCardInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, maxWidth: 460, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  contactCardText: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 19 },
  contactCardLink: { color: colors.primary, fontWeight: '700' },
});
